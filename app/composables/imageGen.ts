import html2canvas from "html2canvas";

function formatDuration(seconds: number): string {
  if (!seconds) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0
    ? `${h}h ${m.toString().padStart(2, "0")}m`
    : `${m}m ${s.toString().padStart(2, "0")}s`;
}

function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace("#", "").trim();
  if (c.length === 3)
    c = c
      .split("")
      .map((x) => x + x)
      .join("");
  if (c.length === 8) c = c.substring(0, 6);
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(13, 19, 15, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Disegna la mappa GPS con effetto Neon ad Altissimo Contrasto
 */
function drawGpsPolyline(
  ctx: CanvasRenderingContext2D,
  gpsTrack: any[],
  width: number,
  height: number,
  neonColor: string,
) {
  if (!gpsTrack || gpsTrack.length < 2) return;

  const points: [number, number][] = gpsTrack.map((pt) =>
    Array.isArray(pt) ? [pt[0], pt[1]] : [pt.lat, pt.lng],
  );

  let minLat = Infinity,
    maxLat = -Infinity;
  let minLng = Infinity,
    maxLng = -Infinity;

  points.forEach(([lat, lng]) => {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  });

  const padding = 100;
  const drawWidth = width - padding * 2;
  const drawHeight = height - padding * 2;

  const deltaLng = maxLng - minLng || 0.0001;
  const deltaLat = maxLat - minLat || 0.0001;

  const scale = Math.min(drawWidth / deltaLng, drawHeight / deltaLat);
  const offsetX = (width - deltaLng * scale) / 2;
  const offsetY = (height - deltaLat * scale) / 2;

  ctx.save();

  // 1. Alone/Glow esterno molto marcato
  ctx.shadowColor = neonColor;
  ctx.shadowBlur = 45;
  ctx.strokeStyle = neonColor;
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  points.forEach(([lat, lng], idx) => {
    const x = offsetX + (lng - minLng) * scale;
    const y = height - (offsetY + (lat - minLat) * scale);

    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // 2. Anima interna brillante (effetto tubo neon)
  ctx.shadowBlur = 5;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.restore();
}

export async function generateSocialImage(
  activity: any,
  gpsTrack: any[] | undefined,
  currentLocale: string = "it",
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx || !activity) return;

  // Legge le variabili CSS del tema
  const style = getComputedStyle(document.documentElement);
  const getVar = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;

  const bgColor = getVar("--bg", "#000000");
  const surfaceColor = getVar("--surface", "#0d130f");
  const borderColor = getVar("--border", "#22302a");
  const textColor = getVar("--text", "#ffffff");
  const textMutedColor = getVar("--text-muted", "#8fa196");
  const accentColor = getVar("--accent", "#22c55e");

  // Colore Neon ultra acceso per la traccia GPS (Cyan / Verde brillante)
  const neonMapColor = "#00f0ff";

  // Card semi-trasparenti per far risaltare la traccia
  const cardBg = hexToRgba(surfaceColor, 0.65);
  const cardBorder = hexToRgba(borderColor, 0.75);

  const isIt = currentLocale.startsWith("it");
  const labels = {
    distance: isIt ? "DISTANZA" : "DISTANCE",
    time: isIt ? "TEMPO" : "TIME",
    avgSpeed: isIt ? "VELOCITÀ MEDIA" : "AVG SPEED",
    avgPower: isIt ? "POTENZA MEDIA" : "AVG POWER",
    fallbackTitle: isIt ? "Attività Ciclismo" : "Cycling Activity",
  };

  // Sfondo scuro
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 1080, 1920);

  // Disegno della traccia GPS in primissimo piano
  if (gpsTrack && gpsTrack.length > 0) {
    drawGpsPolyline(ctx, gpsTrack, 1080, 1920, neonMapColor);
  }

  // Gradiente di sfondo minimalista per mantenere il contrasto
  const overlay = ctx.createLinearGradient(0, 0, 0, 1920);
  overlay.addColorStop(0, hexToRgba(bgColor, 0.7));
  overlay.addColorStop(0.5, hexToRgba(bgColor, 0.15));
  overlay.addColorStop(1, hexToRgba(bgColor, 0.75));
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, 1080, 1920);

  // HEADER & TITOLO PERSONALIZZATO DALL'UTENTE
  ctx.textAlign = "center";

  ctx.fillStyle = accentColor;
  ctx.font = "bold 44pt Inter, sans-serif";
  ctx.fillText("BEST RIDE", 540, 150);

  // Recupera il titolo reale impostato dall'utente
  const userTitle =
    activity.title ||
    activity.name ||
    activity.custom_name ||
    activity.activity_name ||
    labels.fallbackTitle;

  ctx.fillStyle = textColor;
  ctx.font = "bold 48pt Inter, sans-serif";
  const displayTitle =
    userTitle.length > 24 ? userTitle.substring(0, 22) + "..." : userTitle;
  ctx.fillText(displayTitle, 540, 240);

  // Separatore
  ctx.strokeStyle = cardBorder;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(180, 290);
  ctx.lineTo(900, 290);
  ctx.stroke();

  // CARD DISTANZA
  const distMeters = activity.distance || 0;
  const distanceKm = (
    distMeters > 100 ? distMeters / 1000 : distMeters
  ).toFixed(2);

  drawCard(ctx, 120, 340, 840, 360, cardBg, accentColor);

  ctx.fillStyle = textMutedColor;
  ctx.font = "600 30pt Inter, sans-serif";
  ctx.fillText(labels.distance, 540, 415);

  ctx.fillStyle = textColor;
  ctx.font = "bold 115pt Inter, sans-serif";
  ctx.fillText(distanceKm, 540, 580);

  ctx.fillStyle = accentColor;
  ctx.font = "bold 40pt Inter, sans-serif";
  ctx.fillText("KM", 540, 650);

  // STATISTICHE SECONDARIE
  const movingTime =
    activity.moving_time || activity.duration || activity.elapsed_time || 0;
  const timeStr = formatDuration(movingTime);

  let rawSpeed = activity.average_speed || 0;
  if (rawSpeed > 0 && rawSpeed < 20) rawSpeed = rawSpeed * 3.6;
  const speedStr = rawSpeed.toFixed(1);

  const avgWatts = activity.average_watts;
  const hasPower = Boolean(avgWatts && avgWatts > 0);

  if (hasPower) {
    drawStatCard(
      ctx,
      120,
      740,
      840,
      210,
      labels.time,
      timeStr,
      cardBg,
      cardBorder,
      textMutedColor,
      textColor,
    );
    drawStatCard(
      ctx,
      120,
      990,
      840,
      210,
      labels.avgSpeed,
      `${speedStr} km/h`,
      cardBg,
      cardBorder,
      textMutedColor,
      textColor,
    );
    drawStatCard(
      ctx,
      120,
      1240,
      840,
      210,
      labels.avgPower,
      `${Math.round(avgWatts)} W`,
      cardBg,
      cardBorder,
      textMutedColor,
      textColor,
    );
  } else {
    drawStatCard(
      ctx,
      120,
      780,
      840,
      260,
      labels.time,
      timeStr,
      cardBg,
      cardBorder,
      textMutedColor,
      textColor,
    );
    drawStatCard(
      ctx,
      120,
      1080,
      840,
      260,
      labels.avgSpeed,
      `${speedStr} km/h`,
      cardBg,
      cardBorder,
      textMutedColor,
      textColor,
    );
  }

  // FOOTER
  ctx.fillStyle = textMutedColor;
  ctx.font = "500 28pt Inter, sans-serif";
  ctx.fillText("best-ride.vercel.app", 540, 1800);

  downloadCanvas(canvas, `${userTitle}-social.png`);
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  bg: string,
  border: string,
) {
  ctx.save();
  ctx.fillStyle = bg;
  ctx.strokeStyle = border;
  ctx.lineWidth = 3;

  ctx.beginPath();
  const r = 24;
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();

  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawStatCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  bg: string,
  border: string,
  labelColor: string,
  valueColor: string,
) {
  drawCard(ctx, x, y, w, h, bg, border);

  ctx.textAlign = "center";
  ctx.fillStyle = labelColor;
  ctx.font = "600 26pt Inter, sans-serif";
  ctx.fillText(label, x + w / 2, y + 60);

  ctx.fillStyle = valueColor;
  ctx.font = "bold 52pt Inter, sans-serif";
  ctx.fillText(value, x + w / 2, y + h - 45);
}

export async function generateCoachImage() {
  const pageElement =
    document.querySelector(".activity-info-page") || document.body;
  const canvas = await html2canvas(pageElement as HTMLElement, {
    scale: 2,
    useCORS: true,
    logging: false,
    ignoreElements: (el) => el.hasAttribute("data-export-ignore"),
  });
  downloadCanvas(canvas, "coach-report.png");
}

export async function generateCoachPdf(filename: string = "coach-report") {
  const { jsPDF } = await import("jspdf");
  const pageElement = (document.querySelector(".activity-info-page") ||
    document.body) as HTMLElement;

  const canvas = await html2canvas(pageElement, {
    scale: 2,
    useCORS: true,
    logging: false,
    ignoreElements: (el) => el.hasAttribute("data-export-ignore"),
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save(`${filename}.pdf`);
}

function downloadCanvas(canvas: HTMLCanvasElement, fileName: string) {
  const link = document.createElement("a");
  link.download = fileName;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
