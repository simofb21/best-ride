<template>
  <div class="cycling-game-container">
    <!-- FASE 1: PERSONALIZZAZIONE ATLETA -->
    <div v-if="gameState === 'customize'" class="screen-card">
      <h2><i class="mdi mdi-palette"></i> Personalizza Ciclista</h2>

      <div class="customization-wrapper">
        <canvas
          ref="previewCanvasRef"
          width="200"
          height="200"
          class="preview-canvas"
        ></canvas>

        <div class="controls-group">
          <!-- Colore Divisa -->
          <div class="control-item">
            <label><i class="mdi mdi-tshirt-crew"></i> Maglia:</label>
            <div class="color-picker">
              <button
                v-for="color in jerseyColors"
                :key="color"
                :style="{ backgroundColor: color }"
                :class="{ active: playerConfig.jerseyColor === color }"
                @click="
                  playerConfig.jerseyColor = color;
                  drawPreview();
                "
              ></button>
            </div>
          </div>

          <!-- Colore Bici -->
          <div class="control-item">
            <label><i class="mdi mdi-bike"></i> Telaio:</label>
            <div class="color-picker">
              <button
                v-for="color in bikeColors"
                :key="color"
                :style="{ backgroundColor: color }"
                :class="{ active: playerConfig.bikeColor === color }"
                @click="
                  playerConfig.bikeColor = color;
                  drawPreview();
                "
              ></button>
            </div>
          </div>

          <!-- Colore Casco -->
          <div class="control-item">
            <label><i class="mdi mdi-racing-helmet"></i> Casco:</label>
            <div class="color-picker">
              <button
                v-for="color in helmetColors"
                :key="color"
                :style="{ backgroundColor: color }"
                :class="{ active: playerConfig.helmetColor === color }"
                @click="
                  playerConfig.helmetColor = color;
                  drawPreview();
                "
              ></button>
            </div>
          </div>
        </div>
      </div>

      <button class="btn-primary" @click="startGame">
        <i class="mdi mdi-flag-checkered"></i> INIZIA LA GARA
      </button>
    </div>

    <!-- FASE 2 & 3: GIOCO E GAME OVER -->
    <div
      v-show="gameState !== 'customize'"
      class="game-wrapper"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <!-- HUD SUPPERIORE -->
      <div class="hud">
        <div class="hud-item">
          <i class="mdi mdi-speedometer"></i>
          <span
            ><strong>{{ displaySpeed.toFixed(1) }}</strong> km/h</span
          >
        </div>
        <div class="hud-item">
          <i class="mdi mdi-map-marker-distance"></i>
          <span
            ><strong>{{ Math.floor(score) }}</strong> m</span
          >
        </div>
        <div class="hud-item">
          <i class="mdi mdi-trophy"></i>
          <span
            ><strong>{{ highScore }}</strong> m</span
          >
        </div>
      </div>

      <canvas
        ref="gameCanvasRef"
        width="360"
        height="600"
        class="game-canvas"
      ></canvas>

      <!-- Overlay Indicazioni Gesture per Mobile -->
      <div class="gesture-hint">
        <i class="mdi mdi-gesture-swipe-horizontal"></i> Trascina per sterzare |
        <i class="mdi mdi-gesture-swipe-up"></i> Swipe in alto per saltare
      </div>

      <!-- Overlay Game Over -->
      <div v-if="gameState === 'gameover'" class="gameover-overlay">
        <i class="mdi mdi-car-burst crash-icon"></i>
        <h2>CRASH!</h2>
        <p>
          Hai percorso <strong>{{ Math.floor(score) }}</strong> metri!
        </p>
        <p class="final-speed">
          Velocità max: <strong>{{ displaySpeed.toFixed(1) }} km/h</strong>
        </p>

        <div class="overlay-actions">
          <button class="btn-primary" @click="startGame">
            <i class="mdi mdi-restart"></i> Riprova
          </button>
          <button class="btn-secondary" @click="gameState = 'customize'">
            <i class="mdi mdi-account-edit"></i> Modifica Atleta
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from "vue";

// --- STATI E CONFIGURAZIONI ---
const gameState = ref("customize"); // 'customize' | 'playing' | 'gameover'
const score = ref(0);
const highScore = ref(0);
const speedKmh = ref(20.0);
const displaySpeed = ref(20.0);

const jerseyColors = [
  "#e63946",
  "#1d3557",
  "#2a9d8f",
  "#e9c46a",
  "#9b5de5",
  "#ffffff",
];
const bikeColors = [
  "#000000",
  "#f4a261",
  "#00b4d8",
  "#70e000",
  "#d62828",
  "#e0aaff",
];
const helmetColors = [
  "#ffffff",
  "#000000",
  "#ffb703",
  "#fb8500",
  "#8338ec",
  "#06d6a0",
];

const playerConfig = reactive({
  jerseyColor: jerseyColors[0],
  bikeColor: bikeColors[0],
  helmetColor: helmetColors[0],
});

// --- CANVAS REFS ---
const previewCanvasRef = ref(null);
const gameCanvasRef = ref(null);

// --- LOGICA DI GIOCO ---
let animationFrameId = null;
let currentLane = 1;
let playerX = 180;
let targetX = 180;

// Salto
let isJumping = false;
let jumpY = 0;
let jumpVelocity = 0;
const GRAVITY = 0.55;

// Elementi scenario
let obstacles = [];
let terrainPatches = [];
let roadOffset = 0;
let pedalCycle = 0;

const LANES = [60, 180, 300];
const RIGHT_SIDE_LANE = 2;

// --- GESTIONE TOUCH GESTURES (SWIPE) ---
let touchStartX = 0;
let touchStartY = 0;
const MIN_SWIPE_DISTANCE = 30; // Pixel minimi per rilevare lo swipe

function handleTouchStart(e) {
  if (gameState.value !== "playing") return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function handleTouchEnd(e) {
  if (gameState.value !== "playing") return;
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;

  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  // Determina l'asse prevalente dello swipe
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Swipe Orizzontale
    if (Math.abs(deltaX) > MIN_SWIPE_DISTANCE) {
      if (deltaX > 0) moveRight();
      else moveLeft();
    }
  } else {
    // Swipe Verticale
    if (deltaY < -MIN_SWIPE_DISTANCE) {
      jump(); // Swipe Verso l'alto
    }
  }
}

// --- DISEGNO ATLETA CANVA ---
function drawCyclist(ctx, x, y, config, jumpOffsetY = 0) {
  ctx.save();
  const actualY = y + jumpOffsetY;
  ctx.translate(x, actualY);

  // Ombra
  ctx.save();
  const shadowScale = Math.max(0.4, 1 + jumpOffsetY / 80);
  ctx.translate(0, -jumpOffsetY * 0.8);
  ctx.scale(shadowScale, shadowScale);
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 10, 12, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Ruota Posteriore
  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.roundRect(-3.5, 14, 7, 22, 3);
  ctx.fill();
  ctx.fillStyle = "#888";
  ctx.fillRect(-1.5, 16, 3, 18);

  // Ruota Anteriore
  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.roundRect(-3.5, -34, 7, 22, 3);
  ctx.fill();
  ctx.fillStyle = "#888";
  ctx.fillRect(-1.5, -32, 3, 18);

  // Telaio
  ctx.strokeStyle = config.bikeColor;
  ctx.lineWidth = 4.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(0, 12);
  ctx.stroke();

  // Forcelle
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-5, -22);
  ctx.lineTo(5, -22);
  ctx.moveTo(-6, 16);
  ctx.lineTo(6, 16);
  ctx.stroke();

  // Manubrio
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-15, -22);
  ctx.lineTo(15, -22);
  ctx.moveTo(-15, -22);
  ctx.lineTo(-15, -16);
  ctx.moveTo(15, -22);
  ctx.lineTo(15, -16);
  ctx.stroke();

  ctx.fillStyle = config.jerseyColor;
  ctx.fillRect(-16, -23, 4, 5);
  ctx.fillRect(12, -23, 4, 5);

  // Gambe & Pedali
  pedalCycle += 0.15;
  const legOffsetLeft = Math.sin(pedalCycle) * 8;
  const legOffsetRight = Math.sin(pedalCycle + Math.PI) * 8;

  ctx.strokeStyle = "#f1c27d";
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-7, 2);
  ctx.lineTo(-11, 4 + legOffsetLeft);
  ctx.lineTo(-4, 8 + legOffsetLeft);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(7, 2);
  ctx.lineTo(11, 4 + legOffsetRight);
  ctx.lineTo(4, 8 + legOffsetRight);
  ctx.stroke();

  // Busto Maglia
  ctx.fillStyle = config.jerseyColor;
  ctx.beginPath();
  ctx.moveTo(-11, -12);
  ctx.lineTo(11, -12);
  ctx.lineTo(8, 10);
  ctx.lineTo(-8, 10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fillRect(-4, -10, 8, 18);

  // Braccia
  ctx.strokeStyle = config.jerseyColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-10, -10);
  ctx.lineTo(-14, -18);
  ctx.moveTo(10, -10);
  ctx.lineTo(14, -18);
  ctx.stroke();

  // Casco Aerodinamico
  ctx.fillStyle = config.helmetColor;
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.quadraticCurveTo(9, -12, 7, 0);
  ctx.quadraticCurveTo(0, 8, -7, 0);
  ctx.quadraticCurveTo(-9, -12, 0, -18);
  ctx.fill();

  ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(0, 4);
  ctx.stroke();

  // Visiera Occhiali
  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.roundRect(-7, -15, 14, 3.5, 2);
  ctx.fill();

  ctx.restore();
}

function drawPreview() {
  if (!previewCanvasRef.value) return;
  const ctx = previewCanvasRef.value.getContext("2d");
  ctx.clearRect(0, 0, 200, 200);

  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, 200, 200);

  ctx.save();
  ctx.scale(1.6, 1.6);
  drawCyclist(ctx, 62, 65, playerConfig, 0);
  ctx.restore();
}

function spawnTerrainPatch() {
  const types = ["salita", "discesa"];
  const selectedType = types[Math.floor(Math.random() * types.length)];

  terrainPatches.push({
    x: LANES[RIGHT_SIDE_LANE],
    y: -180,
    width: 95,
    height: 160,
    type: selectedType,
  });
}

function drawTerrainPatch(ctx, patch) {
  ctx.save();
  ctx.translate(patch.x, patch.y);

  const isSalita = patch.type === "salita";
  ctx.fillStyle = isSalita
    ? "rgba(217, 119, 6, 0.25)"
    : "rgba(16, 185, 129, 0.25)";
  ctx.fillRect(-patch.width / 2, -patch.height / 2, patch.width, patch.height);

  ctx.strokeStyle = isSalita ? "#d97706" : "#10b981";
  ctx.lineWidth = 3;
  ctx.strokeRect(
    -patch.width / 2,
    -patch.height / 2,
    patch.width,
    patch.height,
  );

  ctx.fillStyle = isSalita ? "#b45309" : "#047857";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(isSalita ? "▲ SALITA" : "▼ DISCESA", 0, 0);

  ctx.restore();
}

function createObstacle() {
  const laneIndex = Math.floor(Math.random() * 3);
  const types = [
    { type: "car", width: 46, height: 78, speedMult: 0.95, color: "#ef4444" },
    { type: "truck", width: 52, height: 115, speedMult: 0.8, color: "#334155" },
    { type: "moto", width: 24, height: 42, speedMult: 1.25, color: "#f59e0b" },
  ];
  const selected = types[Math.floor(Math.random() * types.length)];

  obstacles.push({
    x: LANES[laneIndex],
    y: -120,
    width: selected.width,
    height: selected.height,
    speedMult: selected.speedMult,
    color: selected.color,
    type: selected.type,
  });
}

function drawObstacle(ctx, obs) {
  ctx.save();
  ctx.translate(obs.x, obs.y);

  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(-obs.width / 2 + 4, -obs.height / 2 + 4, obs.width, obs.height);

  ctx.fillStyle = obs.color;
  ctx.beginPath();
  ctx.roundRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height, 6);
  ctx.fill();

  ctx.fillStyle = "#0f172a";
  if (obs.type === "car" || obs.type === "truck") {
    ctx.fillRect(-obs.width / 2 + 4, -obs.height / 2 + 10, obs.width - 8, 14);
    ctx.fillRect(-obs.width / 2 + 4, obs.height / 2 - 18, obs.width - 8, 10);
  } else {
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(-4, -obs.height / 2 + 6, 8, 12);
  }

  ctx.fillStyle = "#dc2626";
  ctx.fillRect(-obs.width / 2 + 3, obs.height / 2 - 3, 6, 3);
  ctx.fillRect(obs.width / 2 - 9, obs.height / 2 - 3, 6, 3);

  ctx.restore();
}

// --- CONTROLLI ---
function moveLeft() {
  if (currentLane > 0 && gameState.value === "playing") {
    currentLane--;
    targetX = LANES[currentLane];
  }
}

function moveRight() {
  if (currentLane < 2 && gameState.value === "playing") {
    currentLane++;
    targetX = LANES[currentLane];
  }
}

function jump() {
  if (!isJumping && gameState.value === "playing") {
    isJumping = true;
    jumpVelocity = -10.5;
  }
}

function handleKeyDown(e) {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") moveLeft();
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") moveRight();
  if (
    e.code === "Space" ||
    e.key === "ArrowUp" ||
    e.key === "w" ||
    e.key === "W"
  ) {
    e.preventDefault();
    jump();
  }
}

// --- GAME LOOP ---
function gameLoop() {
  if (gameState.value !== "playing") return;

  const canvas = gameCanvasRef.value;
  const ctx = canvas.getContext("2d");

  speedKmh.value += 0.2 / 60;

  let speedModifier = 0;
  const playerY = 490;

  for (const patch of terrainPatches) {
    if (
      Math.abs(playerX - patch.x) < 40 &&
      playerY > patch.y - patch.height / 2 &&
      playerY < patch.y + patch.height / 2
    ) {
      if (patch.type === "salita") speedModifier = -6.0;
      if (patch.type === "discesa") speedModifier = +8.0;
    }
  }

  displaySpeed.value = Math.max(10, speedKmh.value + speedModifier);
  const pixelSpeed = displaySpeed.value * 0.28;

  if (isJumping) {
    jumpY += jumpVelocity;
    jumpVelocity += GRAVITY;
    if (jumpY >= 0) {
      jumpY = 0;
      isJumping = false;
    }
  }

  // Disegno Sfondo
  ctx.fillStyle = "#334155";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#64748b";
  ctx.fillRect(0, 0, 12, canvas.height);
  ctx.fillRect(canvas.width - 12, 0, 12, canvas.height);

  roadOffset = (roadOffset + pixelSpeed) % 40;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.setLineDash([20, 20]);
  ctx.lineDashOffset = -roadOffset;

  ctx.beginPath();
  ctx.moveTo(120, 0);
  ctx.lineTo(120, canvas.height);
  ctx.moveTo(240, 0);
  ctx.lineTo(240, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Salite / Discese
  if (Math.random() < 0.005) {
    const lastPatch = terrainPatches[terrainPatches.length - 1];
    if (!lastPatch || lastPatch.y > 300) spawnTerrainPatch();
  }

  for (let i = terrainPatches.length - 1; i >= 0; i--) {
    const patch = terrainPatches[i];
    patch.y += pixelSpeed;
    drawTerrainPatch(ctx, patch);

    if (patch.y > canvas.height + 200) terrainPatches.splice(i, 1);
  }

  playerX += (targetX - playerX) * 0.25;
  drawCyclist(ctx, playerX, playerY, playerConfig, jumpY);

  // Ostacoli
  if (Math.random() < 0.018) {
    const lastObs = obstacles[obstacles.length - 1];
    if (!lastObs || lastObs.y > 140) createObstacle();
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.y += pixelSpeed * obs.speedMult;
    drawObstacle(ctx, obs);

    const playerBox = {
      x: playerX - 12,
      y: playerY - 20 + jumpY,
      w: 24,
      h: 45,
    };
    const obsBox = {
      x: obs.x - obs.width / 2,
      y: obs.y - obs.height / 2,
      w: obs.width,
      h: obs.height,
    };

    const isColliding =
      playerBox.x < obsBox.x + obsBox.w &&
      playerBox.x + playerBox.w > obsBox.x &&
      playerBox.y < obsBox.y + obsBox.h &&
      playerBox.y + playerBox.h > obsBox.y;

    if (isColliding) {
      const canEvadeWithJump = obs.type === "moto" && jumpY < -15;
      if (!canEvadeWithJump) {
        endGame();
        return;
      }
    }

    if (obs.y > canvas.height + 100) obstacles.splice(i, 1);
  }

  score.value += pixelSpeed * 0.04;
  animationFrameId = requestAnimationFrame(gameLoop);
}

function startGame() {
  score.value = 0;
  speedKmh.value = 20.0;
  displaySpeed.value = 20.0;
  currentLane = 1;
  playerX = LANES[1];
  targetX = LANES[1];
  isJumping = false;
  jumpY = 0;
  obstacles = [];
  terrainPatches = [];
  gameState.value = "playing";

  nextTick(() => {
    cancelAnimationFrame(animationFrameId);
    gameLoop();
  });
}

function endGame() {
  gameState.value = "gameover";
  cancelAnimationFrame(animationFrameId);

  if (Math.floor(score.value) > highScore.value) {
    highScore.value = Math.floor(score.value);
    localStorage.setItem("cycling_game_highscore", highScore.value);
  }
}

onMounted(() => {
  const savedRecord = localStorage.getItem("cycling_game_highscore");
  if (savedRecord) highScore.value = parseInt(savedRecord, 10);

  drawPreview();
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
@import url("https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/css/materialdesignicons.min.css");

.cycling-game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 480px;
  min-height: 100dvh;
  margin: 0 auto;
  padding: 12px;
  box-sizing: border-box;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  color: #0f172a;
  user-select: none;
  touch-action: none; /* Disabilita lo scroll nativo della pagina durante il gioco */
}

.screen-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 380px;
  text-align: center;
}

.screen-card h2 {
  font-size: 1.25rem;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.customization-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 12px 0;
}

.preview-canvas {
  width: 160px;
  height: 160px;
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  background-color: #f8fafc;
}

.controls-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.control-item label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 4px;
}

.color-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-picker button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.color-picker button.active {
  border-color: #000;
  transform: scale(1.15);
}

.game-wrapper {
  position: relative;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game-canvas {
  width: 100%;
  height: auto;
  max-height: 78dvh;
  aspect-ratio: 360 / 600;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  background: #334155;
  object-fit: contain;
}

.hud {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-around;
  background: rgba(15, 23, 42, 0.88);
  color: #ffffff;
  padding: 8px 10px;
  border-radius: 16px;
  font-size: 0.8rem;
  backdrop-filter: blur(6px);
  z-index: 2;
}

.hud-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hud-item i {
  color: #38bdf8;
}

.gesture-hint {
  font-size: 0.72rem;
  color: #64748b;
  margin-top: 8px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.gameover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.92);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  z-index: 10;
  padding: 16px;
}

.crash-icon {
  font-size: 3.5rem;
  color: #ef4444;
}

.final-speed {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-top: 4px;
}

.overlay-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  width: 80%;
}

.btn-primary {
  width: 100%;
  padding: 12px 16px;
  background: #2563eb;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-secondary {
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  color: #cbd5e1;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary:hover {
  background: #1d4ed8;
}
</style>
