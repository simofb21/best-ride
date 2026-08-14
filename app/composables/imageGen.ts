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

// ─── GPS track ──────────────────────────────────────────────

function drawGpsTrack(
  ctx: CanvasRenderingContext2D,
  gpsTrack: Array<{ lat: number; lng: number }>,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  // Sfondo mappa
  ctx.fillStyle = "#f0fdf4";
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 16);
  ctx.fill();
  ctx.strokeStyle = "#bbf7d0";
  ctx.lineWidth = 1;
  ctx.stroke();

  if (!gpsTrack || gpsTrack.length < 2) {
    ctx.fillStyle = "#6b7280";
    ctx.font = "24px -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No GPS data", x + width / 2, y + height / 2);
    ctx.textAlign = "left";
    return;
  }

  const lats = gpsTrack.map((p) => p.lat);
  const lngs = gpsTrack.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const pad = 32;
  const mapW = width - pad * 2;
  const mapH = height - pad * 2;
  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;
  const aspectGeo = lngRange / latRange;
  const aspectMap = mapW / mapH;

  let scaleX: number, scaleY: number;
  let offsetX = 0,
    offsetY = 0;

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
    return [
      x + pad + offsetX + (lng - minLng) * scaleX,
      y + pad + offsetY + (maxLat - lat) * scaleY,
    ];
  }

  const step = Math.max(1, Math.floor(gpsTrack.length / 500));
  const sampled = gpsTrack.filter((_, i) => i % step === 0);

  // Traccia con ombra
  ctx.save();
  ctx.shadowColor = "rgba(22, 163, 74, 0.4)";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.strokeStyle = "#16a34a";
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  sampled.forEach((p, i) => {
    const [cx, cy] = toCanvas(p.lat, p.lng);
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  });
  ctx.stroke();
  ctx.restore();

  // Punto start
  const [sx, sy] = toCanvas(gpsTrack[0]!.lat, gpsTrack[0]!.lng);
  ctx.beginPath();
  ctx.arc(sx, sy, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#22c55e";
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Punto end
  const last = gpsTrack[gpsTrack.length - 1]!;
  const [ex, ey] = toCanvas(last.lat, last.lng);
  ctx.beginPath();
  ctx.arc(ex, ey, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#15803d";
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

// ─── SOCIAL IMAGE (1080x1920 — Storie Instagram) ────────────
// Layout compatto, nessuno spazio bianco: la mappa occupa tutto
// lo spazio rimanente dopo le statistiche, espandendosi per riempire.

export async function generateSocialImage(data: ActivityData): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const PAD = 56;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Sfondo bianco
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Header verde pieno
  const headerH = 140;
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(0, 0, W, headerH);

  // Logo e data nell'header
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 44px -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("BEST RIDE", W / 2, 72);
  ctx.font = "24px -apple-system, sans-serif";
  ctx.fillText(
    new Date().toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    W / 2,
    116,
  );
  ctx.textAlign = "left";

  const a = data.activity;

  // ── 6 stat cards in griglia 2x3 ──
  const statsY = headerH + 40;
  const cardW = (W - PAD * 2 - 20) / 2;
  const cardH = 130;

  const stats = [
    { label: "Distanza", value: a.distance.toFixed(1), unit: "km" },
    { label: "Durata", value: formatDuration(a.duration), unit: "" },
    {
      label: "Velocità Media",
      value: a.average_speed.toFixed(1),
      unit: "km/h",
    },
    { label: "Potenza Media", value: String(a.average_watts), unit: "W" },
    {
      label: "Dislivello",
      value: String(Math.round(a.elevation_gain)),
      unit: "m",
    },
    { label: "Potenza NP", value: String(a.normalized_power), unit: "W" },
  ];

  stats.forEach((stat, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = PAD + col * (cardW + 20);
    const cy = statsY + row * (cardH + 16);

    // Card background
    ctx.fillStyle = "#f0fdf4";
    ctx.beginPath();
    ctx.roundRect(cx, cy, cardW, cardH, 14);
    ctx.fill();
    ctx.strokeStyle = "#bbf7d0";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label
    ctx.fillStyle = "#6b7280";
    ctx.font = "22px -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(stat.label, cx + cardW / 2, cy + 36);

    // Value
    ctx.fillStyle = "#15803d";
    ctx.font = "bold 40px -apple-system, sans-serif";
    ctx.fillText(stat.value, cx + cardW / 2, cy + 86);

    // Unit
    ctx.fillStyle = "#9ca3af";
    ctx.font = "22px -apple-system, sans-serif";
    ctx.fillText(stat.unit, cx + cardW / 2, cy + 116);

    ctx.textAlign = "left";
  });

  // ── Mappa GPS — occupa tutto lo spazio rimanente ──
  const mapY = statsY + 3 * (cardH + 16) + 24;
  const footerH = 90;
  const mapH = H - mapY - footerH - 24;

  drawGpsTrack(ctx, data.gpsTrack || [], PAD, mapY, W - PAD * 2, mapH);

  // Footer verde
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(0, H - footerH, W, footerH);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("best-ride.vercel.app", W / 2, H - footerH / 2 + 10);
  ctx.textAlign = "left";

  return canvasToBlob(canvas);
}

// ─── COACH IMAGE — screenshot reale di activity-info ────────

export async function generateCoachImage(
  data: ActivityData,
  sourceElement?: HTMLElement,
): Promise<Blob> {
  // Se viene passato l'elemento del DOM, usa html2canvas per catturarlo
  if (sourceElement) {
    const html2canvas = (await import("html2canvas")).default;

    const capturedCanvas = await html2canvas(sourceElement, {
      scale: 2, // alta risoluzione
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: sourceElement.scrollWidth,
      height: sourceElement.scrollHeight,
      windowWidth: sourceElement.scrollWidth,
      windowHeight: sourceElement.scrollHeight,
    });

    return canvasToBlob(capturedCanvas);
  }

  // Fallback: genera un'immagine testuale con tutti i dati
  const W = 1080;
  const PAD = 56;
  const a = data.activity;
  const t = data.training_load;

  const allStats = [
    { section: "DATI GENERALI" },
    { label: "Distanza", value: `${a.distance.toFixed(2)} km` },
    { label: "Durata", value: formatDuration(a.duration) },
    { label: "Dislivello", value: `${Math.round(a.elevation_gain)} m` },
    { label: "Velocità Media", value: `${a.average_speed.toFixed(1)} km/h` },
    { label: "Velocità Massima", value: `${a.max_speed.toFixed(1)} km/h` },
    { section: "POTENZA" },
    { label: "Potenza Media", value: `${a.average_watts} W` },
    { label: "Potenza Massima", value: `${a.max_watts} W` },
    { label: "Potenza Normalizzata", value: `${a.normalized_power} W` },
    { label: "Energia", value: `${a.kilojoules} kJ` },
    { label: "Calorie", value: `${a.kcalories} kcal` },
    {
      label: "Fattore Intensità",
      value: t ? t.intensity_factor.toFixed(2) : "—",
    },
    { label: "Stress Allenamento", value: t ? String(Math.round(t.tss)) : "—" },
    { section: "FREQUENZA CARDIACA" },
    { label: "FC Media", value: `${a.average_heartrate} bpm` },
    { label: "FC Massima", value: `${a.max_heartrate} bpm` },
    { section: "ALTRO" },
    { label: "Cadenza Media", value: `${a.average_cadence} rpm` },
    {
      label: "Temperatura Media",
      value:
        a.average_temperature != null ? `${a.average_temperature} °C` : "—",
    },
  ];

  // Calcola altezza necessaria
  let totalH = 160; // header
  allStats.forEach((item) => {
    if ("section" in item) totalH += 60;
    else totalH += 48;
  });
  totalH += 200; // mappa GPS
  totalH += 100; // footer
  totalH = Math.max(totalH, 1920);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = totalH;
  const ctx = canvas.getContext("2d")!;

  // Sfondo
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, totalH);

  // Header
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(0, 0, W, 120);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 44px -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("BEST RIDE — Ride Report", W / 2, 76);
  ctx.textAlign = "left";

  let curY = 160;

  const colW = (W - PAD * 2) / 2;

  allStats.forEach((item) => {
    if ("section" in item) {
      // Intestazione sezione
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(PAD, curY, 6, 28);
      ctx.fillStyle = "#15803d";
      ctx.font = "bold 24px -apple-system, sans-serif";
      ctx.fillText(item.section, PAD + 18, curY + 22);
      curY += 52;
    } else {
      // Riga stat
      ctx.fillStyle = "#6b7280";
      ctx.font = "20px -apple-system, sans-serif";
      ctx.fillText(item.label!, PAD, curY);

      ctx.fillStyle = "#111827";
      ctx.font = "bold 20px -apple-system, sans-serif";
      ctx.fillText(item.value!, PAD + colW, curY);

      // Separatore leggero
      ctx.strokeStyle = "#f3f4f6";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD, curY + 8);
      ctx.lineTo(W - PAD, curY + 8);
      ctx.stroke();

      curY += 44;
    }
  });

  // Mappa GPS se disponibile
  if (data.gpsTrack && data.gpsTrack.length > 2) {
    curY += 16;
    ctx.fillStyle = "#15803d";
    ctx.font = "bold 24px -apple-system, sans-serif";
    ctx.fillText("PERCORSO", PAD, curY);
    curY += 16;
    drawGpsTrack(ctx, data.gpsTrack, PAD, curY, W - PAD * 2, 300);
    curY += 316;
  }

  // Footer
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(0, totalH - 80, W, 80);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("BEST RIDE — best-ride.vercel.app", W / 2, totalH - 28);
  ctx.textAlign = "left";

  return canvasToBlob(canvas);
}
