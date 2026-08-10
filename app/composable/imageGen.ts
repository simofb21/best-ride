interface ActivityData {
  activity: {
    distance: number;
    duration: number;
    average_speed: number;
    max_speed: number;
    average_watts: number;
    max_watts: number;
    normalized_power: number;
    average_heartrate: number;
    max_heartrate: number;
    average_cadence: number;
    elevation_gain: number;
    kilojoules: number;
    kcalories: number;
    average_temperature?: number | null;
  };
  training_load?: {
    tss: number;
    intensity_factor: number;
  };
  power_records: any[];
  gpsTrack?: Array<{ lat: number; lng: number }>;
}

// ─── Utility ────────────────────────────────────────────────

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas export failed"));
    }, "image/png");
  });
}

// ─── Disegna traccia GPS sul canvas ─────────────────────────

function drawGpsTrack(
  ctx: CanvasRenderingContext2D,
  gpsTrack: Array<{ lat: number; lng: number }>,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  if (!gpsTrack || gpsTrack.length < 2) {
    // Nessun dato GPS: disegna un placeholder
    ctx.fillStyle = "#e8f5e9";
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 12);
    ctx.fill();
    ctx.fillStyle = "#22c55e";
    ctx.font = "bold 18px -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No GPS data", x + width / 2, y + height / 2);
    ctx.textAlign = "left";
    return;
  }

  // Sfondo mappa
  ctx.fillStyle = "#f0faf0";
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 12);
  ctx.fill();

  // Normalizza coordinate GPS nel rettangolo disponibile
  const lats = gpsTrack.map((p) => p.lat);
  const lngs = gpsTrack.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const padding = 24;
  const mapW = width - padding * 2;
  const mapH = height - padding * 2;

  // Mantieni proporzioni geografiche
  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;
  const aspectGeo = lngRange / latRange;
  const aspectMap = mapW / mapH;

  let scaleX: number;
  let scaleY: number;
  let offsetX = 0;
  let offsetY = 0;

  if (aspectGeo > aspectMap) {
    scaleX = mapW / lngRange;
    scaleY = scaleX;
    offsetY = (mapH - latRange * scaleY) / 2;
  } else {
    scaleY = mapH / latRange;
    scaleX = scaleY;
    offsetX = (mapW - lngRange * scaleX) / 2;
  }

  function toCanvas(lat: number, lng: number): [number, number] {
    const cx = x + padding + offsetX + (lng - minLng) * scaleX;
    const cy = y + padding + offsetY + (maxLat - lat) * scaleY;
    return [cx, cy];
  }

  // Sottocampiona per performance (max 300 punti)
  const step = Math.max(1, Math.floor(gpsTrack.length / 300));
  const sampled = gpsTrack.filter((_, i) => i % step === 0);

  // Ombra della traccia
  ctx.save();
  ctx.shadowColor = "rgba(34, 197, 94, 0.3)";
  ctx.shadowBlur = 6;

  // Disegna traccia principale
  ctx.beginPath();
  ctx.strokeStyle = "#16a34a";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  sampled.forEach((point, i) => {
    const [cx, cy] = toCanvas(point.lat, point.lng);
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  });
  ctx.stroke();
  ctx.restore();

  // Punto di partenza (verde)
  const [startX, startY] = toCanvas(gpsTrack[0]!.lat, gpsTrack[0]!.lng);
  ctx.beginPath();
  ctx.arc(startX, startY, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#22c55e";
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Punto di arrivo (scuro)
  const last = gpsTrack[gpsTrack.length - 1]!;
  const [endX, endY] = toCanvas(last.lat, last.lng);
  ctx.beginPath();
  ctx.arc(endX, endY, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#15803d";
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();
}

// ─── Componenti grafici condivisi ────────────────────────────

function drawLogo(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Sfondo pill verde
  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.roundRect(x, y - 20, 130, 30, 15);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("BEST RIDE", x + 65, y);
  ctx.textAlign = "left";
}

function drawStatRow(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: string,
  unit: string,
  x: number,
  y: number,
  valueColor = "#15803d",
) {
  ctx.fillStyle = "#6b7280";
  ctx.font = "13px -apple-system, sans-serif";
  ctx.fillText(label.toUpperCase(), x, y);

  ctx.fillStyle = valueColor;
  ctx.font = "bold 22px -apple-system, sans-serif";
  ctx.fillText(value, x, y + 26);

  ctx.fillStyle = "#9ca3af";
  ctx.font = "13px -apple-system, sans-serif";
  const valueWidth = ctx.measureText(value).width;
  ctx.font = "bold 22px -apple-system, sans-serif";
  const bigWidth = ctx.measureText(value).width;
  ctx.font = "13px -apple-system, sans-serif";
  ctx.fillText(unit, x + bigWidth + 4, y + 26);
}

function drawStatBlock(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: string,
  unit: string,
  x: number,
  y: number,
  blockW: number,
  blockH: number,
) {
  // Card
  ctx.fillStyle = "#f0fdf4";
  ctx.beginPath();
  ctx.roundRect(x, y, blockW, blockH, 10);
  ctx.fill();
  ctx.strokeStyle = "#bbf7d0";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Label
  ctx.fillStyle = "#6b7280";
  ctx.font = "12px -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label.toUpperCase(), x + blockW / 2, y + 22);

  // Valore
  ctx.fillStyle = "#15803d";
  ctx.font = "bold 26px -apple-system, sans-serif";
  ctx.fillText(value, x + blockW / 2, y + 54);

  // Unità
  ctx.fillStyle = "#9ca3af";
  ctx.font = "13px -apple-system, sans-serif";
  ctx.fillText(unit, x + blockW / 2, y + 74);

  ctx.textAlign = "left";
}

function drawSeparator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
) {
  ctx.strokeStyle = "#d1fae5";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.stroke();
}

// ─── VERSIONE SOCIAL (1080x1920 — Storie Instagram) ─────────

export async function generateSocialImage(data: ActivityData): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const PAD = 60;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Sfondo bianco
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Striscia verde in cima
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(0, 0, W, 12);

  // Logo
  drawLogo(ctx, PAD, 70);

  // Titolo
  ctx.fillStyle = "#111827";
  ctx.font = "bold 48px -apple-system, sans-serif";
  ctx.fillText("Activity Summary", PAD, 160);

  ctx.fillStyle = "#6b7280";
  ctx.font = "28px -apple-system, sans-serif";
  ctx.fillText(
    new Date().toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    PAD,
    204,
  );

  // Mappa GPS
  const mapY = 240;
  const mapH = 600;
  drawGpsTrack(ctx, data.gpsTrack || [], PAD, mapY, W - PAD * 2, mapH);

  // Striscia verde sotto la mappa
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(0, mapY + mapH, W, 6);

  // 4 stat principali in griglia 2x2
  const gridY = mapY + mapH + 60;
  const blockW = (W - PAD * 2 - 20) / 2;
  const blockH = 100;

  const a = data.activity;

  drawStatBlock(
    ctx,
    "Distanza",
    a.distance.toFixed(1),
    "km",
    PAD,
    gridY,
    blockW,
    blockH,
  );
  drawStatBlock(
    ctx,
    "Durata",
    formatDuration(a.duration),
    "",
    PAD + blockW + 20,
    gridY,
    blockW,
    blockH,
  );
  drawStatBlock(
    ctx,
    "Vel. Media",
    a.average_speed.toFixed(1),
    "km/h",
    PAD,
    gridY + blockH + 16,
    blockW,
    blockH,
  );
  drawStatBlock(
    ctx,
    "Potenza Media",
    String(a.average_watts),
    "W",
    PAD + blockW + 20,
    gridY + blockH + 16,
    blockW,
    blockH,
  );

  // Seconda riga statistiche
  const row2Y = gridY + blockH * 2 + 60;
  drawStatBlock(
    ctx,
    "Dislivello",
    String(Math.round(a.elevation_gain)),
    "m",
    PAD,
    row2Y,
    blockW,
    blockH,
  );
  drawStatBlock(
    ctx,
    "Potenza NP",
    String(a.normalized_power),
    "W",
    PAD + blockW + 20,
    row2Y,
    blockW,
    blockH,
  );

  // Separatore
  drawSeparator(ctx, PAD, row2Y + blockH + 40, W - PAD * 2);

  // Footer
  const footerY = H - 100;
  ctx.fillStyle = "#22c55e";
  ctx.font = "bold 24px -apple-system, sans-serif";
  ctx.fillText("BEST RIDE", PAD, footerY);

  ctx.fillStyle = "#9ca3af";
  ctx.font = "20px -apple-system, sans-serif";
  ctx.fillText("best-ride.vercel.app", PAD, footerY + 34);

  // Striscia verde in fondo
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(0, H - 12, W, 12);

  return canvasToBlob(canvas);
}

// ─── VERSIONE ALLENATORE (1080x1920 — verticale) ────────────

export async function generateCoachImage(data: ActivityData): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const PAD = 60;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Sfondo bianco
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Header verde
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(0, 0, W, 100);

  // Logo e titolo nell'header
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("BEST RIDE — Ride Report", W / 2, 62);
  ctx.textAlign = "left";

  // Data
  ctx.fillStyle = "#374151";
  ctx.font = "24px -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    new Date().toLocaleDateString("it-IT", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    W / 2,
    144,
  );
  ctx.textAlign = "left";

  const a = data.activity;
  const t = data.training_load;

  // ── Sezione 1: Dati principali ──
  let curY = 190;

  ctx.fillStyle = "#15803d";
  ctx.font = "bold 18px -apple-system, sans-serif";
  ctx.fillText("DATI PRINCIPALI", PAD, curY);
  drawSeparator(ctx, PAD, curY + 8, W - PAD * 2);
  curY += 30;

  const mainStats = [
    ["Distanza", a.distance.toFixed(2), "km"],
    ["Durata", formatDuration(a.duration), ""],
    ["Dislivello", String(Math.round(a.elevation_gain)), "m"],
    ["Velocità Media", a.average_speed.toFixed(1), "km/h"],
    ["Velocità Massima", a.max_speed.toFixed(1), "km/h"],
  ];

  const colW = (W - PAD * 2) / 2;
  mainStats.forEach((stat, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    drawStatRow(
      ctx,
      stat[0]!,
      stat[1]!,
      stat[2]!,
      PAD + col * colW,
      curY + row * 70,
    );
  });

  curY += Math.ceil(mainStats.length / 2) * 70 + 20;

  // ── Sezione 2: Potenza ──
  drawSeparator(ctx, PAD, curY, W - PAD * 2);
  curY += 24;

  ctx.fillStyle = "#15803d";
  ctx.font = "bold 18px -apple-system, sans-serif";
  ctx.fillText("POTENZA", PAD, curY);
  curY += 24;

  const powerStats = [
    ["Potenza Media", String(a.average_watts), "W"],
    ["Potenza Massima", String(a.max_watts), "W"],
    ["Potenza Normalizzata", String(a.normalized_power), "W"],
    ["Energia", String(a.kilojoules), "kJ"],
    ["Calorie", String(a.kcalories), "kcal"],
    ["Fattore Intensità", t ? t.intensity_factor.toFixed(2) : "—", ""],
    ["Stress Allenamento", t ? String(Math.round(t.tss)) : "—", ""],
  ];

  powerStats.forEach((stat, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    drawStatRow(
      ctx,
      stat[0]!,
      stat[1]!,
      stat[2]!,
      PAD + col * colW,
      curY + row * 70,
    );
  });

  curY += Math.ceil(powerStats.length / 2) * 70 + 20;

  // ── Sezione 3: Frequenza cardiaca ──
  drawSeparator(ctx, PAD, curY, W - PAD * 2);
  curY += 24;

  ctx.fillStyle = "#15803d";
  ctx.font = "bold 18px -apple-system, sans-serif";
  ctx.fillText("FREQUENZA CARDIACA", PAD, curY);
  curY += 24;

  const hrStats = [
    ["FC Media", String(a.average_heartrate), "bpm"],
    ["FC Massima", String(a.max_heartrate), "bpm"],
  ];

  hrStats.forEach((stat, i) => {
    drawStatRow(
      ctx,
      stat[0]!,
      stat[1]!,
      stat[2]!,
      PAD + (i % 2) * colW,
      curY + Math.floor(i / 2) * 70,
    );
  });

  curY += 90;

  // ── Sezione 4: Altro ──
  drawSeparator(ctx, PAD, curY, W - PAD * 2);
  curY += 24;

  ctx.fillStyle = "#15803d";
  ctx.font = "bold 18px -apple-system, sans-serif";
  ctx.fillText("ALTRO", PAD, curY);
  curY += 24;

  const otherStats = [
    ["Cadenza Media", String(a.average_cadence), "rpm"],
    [
      "Temperatura Media",
      a.average_temperature != null ? String(a.average_temperature) : "—",
      a.average_temperature != null ? "°C" : "",
    ],
  ];

  otherStats.forEach((stat, i) => {
    drawStatRow(
      ctx,
      stat[0]!,
      stat[1]!,
      stat[2]!,
      PAD + (i % 2) * colW,
      curY + Math.floor(i / 2) * 70,
    );
  });

  curY += 90;

  // ── Sezione 5: Mappa (spazio rimanente) ──
  const remainingH = H - 100 - curY - 24;
  if (remainingH > 200 && data.gpsTrack && data.gpsTrack.length > 2) {
    drawSeparator(ctx, PAD, curY, W - PAD * 2);
    curY += 24;

    ctx.fillStyle = "#15803d";
    ctx.font = "bold 18px -apple-system, sans-serif";
    ctx.fillText("PERCORSO", PAD, curY);
    curY += 16;

    const mapH = Math.min(remainingH - 40, 360);
    drawGpsTrack(ctx, data.gpsTrack, PAD, curY, W - PAD * 2, mapH);
  }

  // Footer verde
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(0, H - 100, W, 100);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("BEST RIDE", W / 2, H - 60);

  ctx.font = "20px -apple-system, sans-serif";
  ctx.fillText("best-ride.vercel.app", W / 2, H - 28);
  ctx.textAlign = "left";

  return canvasToBlob(canvas);
}
