export interface GpsPoint {
  lat: number;
  lng: number;
}

const POLYLINE_PRECISION = 1e5;
const SIMPLIFICATION_TOLERANCE_METERS = 5;
const MAX_TRACK_POINTS = 2_000;

function squaredDistanceToSegment(
  point: GpsPoint,
  start: GpsPoint,
  end: GpsPoint,
): number {
  // Proiezione equirettangolare locale: sufficientemente precisa sulle distanze
  // ridotte usate per semplificare una traccia GPS.
  const referenceLat = ((start.lat + end.lat) / 2) * (Math.PI / 180);
  const metersPerDegreeLat = 111_320;
  const metersPerDegreeLng = metersPerDegreeLat * Math.cos(referenceLat);

  const endX = (end.lng - start.lng) * metersPerDegreeLng;
  const endY = (end.lat - start.lat) * metersPerDegreeLat;
  const pointX = (point.lng - start.lng) * metersPerDegreeLng;
  const pointY = (point.lat - start.lat) * metersPerDegreeLat;
  const segmentLengthSquared = endX * endX + endY * endY;

  if (segmentLengthSquared === 0) {
    return pointX * pointX + pointY * pointY;
  }

  const projection = Math.max(
    0,
    Math.min(1, (pointX * endX + pointY * endY) / segmentLengthSquared),
  );
  const deltaX = pointX - projection * endX;
  const deltaY = pointY - projection * endY;

  return deltaX * deltaX + deltaY * deltaY;
}

function simplifyTrack(
  points: GpsPoint[],
  toleranceMeters: number,
): GpsPoint[] {
  if (points.length <= 2) return points;

  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack: Array<[number, number]> = [[0, points.length - 1]];
  const toleranceSquared = toleranceMeters * toleranceMeters;

  while (stack.length > 0) {
    const [startIndex, endIndex] = stack.pop()!;
    let farthestIndex = -1;
    let farthestDistance = toleranceSquared;

    for (let i = startIndex + 1; i < endIndex; i++) {
      const distance = squaredDistanceToSegment(
        points[i]!,
        points[startIndex]!,
        points[endIndex]!,
      );
      if (distance > farthestDistance) {
        farthestDistance = distance;
        farthestIndex = i;
      }
    }

    if (farthestIndex !== -1) {
      keep[farthestIndex] = 1;
      stack.push([startIndex, farthestIndex], [farthestIndex, endIndex]);
    }
  }

  return points.filter((_, index) => keep[index] === 1);
}

function simplifyAndLimitTrack(points: GpsPoint[]): GpsPoint[] {
  let tolerance = SIMPLIFICATION_TOLERANCE_METERS;
  let simplified = simplifyTrack(points, tolerance);

  // Se una traccia è eccezionalmente lunga/rumorosa, aumenta gradualmente la
  // tolleranza prima del limite rigido: così vengono conservate le curve più
  // importanti invece di eliminare punti a intervalli fissi.
  while (simplified.length > MAX_TRACK_POINTS && tolerance < 100) {
    tolerance *= 1.5;
    simplified = simplifyTrack(points, tolerance);
  }

  if (simplified.length <= MAX_TRACK_POINTS) return simplified;

  return Array.from({ length: MAX_TRACK_POINTS }, (_, index) => {
    const sourceIndex = Math.round(
      (index * (simplified.length - 1)) / (MAX_TRACK_POINTS - 1),
    );
    return simplified[sourceIndex]!;
  });
}

export function prepareGpsTrackForStorage(value: unknown): GpsPoint[] {
  if (!Array.isArray(value)) return [];

  const points = value.filter(
    (point): point is GpsPoint =>
      typeof point === "object" &&
      point !== null &&
      Number.isFinite((point as GpsPoint).lat) &&
      Number.isFinite((point as GpsPoint).lng) &&
      Math.abs((point as GpsPoint).lat) <= 90 &&
      Math.abs((point as GpsPoint).lng) <= 180,
  );

  return simplifyAndLimitTrack(points);
}

function encodeSignedValue(value: number): string {
  let encoded = value < 0 ? ~(value << 1) : value << 1;
  let result = "";

  while (encoded >= 0x20) {
    result += String.fromCharCode((0x20 | (encoded & 0x1f)) + 63);
    encoded >>>= 5;
  }

  return result + String.fromCharCode(encoded + 63);
}

export function encodeGpsTrack(points: GpsPoint[]): string {
  let previousLat = 0;
  let previousLng = 0;
  let encoded = "";

  for (const point of points) {
    if (
      !Number.isFinite(point?.lat) ||
      !Number.isFinite(point?.lng) ||
      Math.abs(point.lat) > 90 ||
      Math.abs(point.lng) > 180
    ) {
      continue;
    }

    const lat = Math.round(point.lat * POLYLINE_PRECISION);
    const lng = Math.round(point.lng * POLYLINE_PRECISION);
    encoded += encodeSignedValue(lat - previousLat);
    encoded += encodeSignedValue(lng - previousLng);
    previousLat = lat;
    previousLng = lng;
  }

  return encoded;
}

export function decodeGpsTrack(encoded: string): GpsPoint[] {
  const points: GpsPoint[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  const decodeValue = (): number | null => {
    let result = 0;
    let shift = 0;

    while (index < encoded.length && shift <= 30) {
      const value = encoded.charCodeAt(index++) - 63;
      if (value < 0 || value > 0x3f) return null;
      result |= (value & 0x1f) << shift;
      if (value < 0x20) return result & 1 ? ~(result >> 1) : result >> 1;
      shift += 5;
    }

    return null;
  };

  while (index < encoded.length && points.length < MAX_TRACK_POINTS) {
    const latDelta = decodeValue();
    const lngDelta = decodeValue();
    if (latDelta === null || lngDelta === null) break;

    lat += latDelta;
    lng += lngDelta;
    points.push({
      lat: lat / POLYLINE_PRECISION,
      lng: lng / POLYLINE_PRECISION,
    });
  }

  return points;
}

export function extractGpsTrack(records: any[]): GpsPoint[] {
  const points = records
    .filter(
      (r) =>
        typeof r.position_lat === "number" &&
        typeof r.position_long === "number",
    )
    .map((r) => ({
      // fit-file-parser converte già i valori FIT da semicircles a gradi.
      lat: r.position_lat,
      lng: r.position_long,
    }))
    .filter(
      (point) =>
        Number.isFinite(point.lat) &&
        Number.isFinite(point.lng) &&
        Math.abs(point.lat) <= 90 &&
        Math.abs(point.lng) <= 180 &&
        !(point.lat === 0 && point.lng === 0),
    );

  return prepareGpsTrackForStorage(points);
}
