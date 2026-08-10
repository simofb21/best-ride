<template>
  <div class="cycling-game-container">
    <!-- FASE 1: PERSONALIZZAZIONE ATLETA -->
    <div v-if="gameState === 'customize'" class="screen-card">
      <h2><i class="mdi mdi-palette"></i> Personalizza il tuo Ciclista</h2>

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
            <label><i class="mdi mdi-tshirt-crew"></i> Maglia / Divisa:</label>
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
            <label><i class="mdi mdi-bike"></i> Telaio Bici:</label>
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
    <div v-show="gameState !== 'customize'" class="game-wrapper">
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

      <!-- Controlli Touch Mobile -->
      <div class="mobile-controls">
        <button @click="moveLeft" class="btn-touch">
          <i class="mdi mdi-chevron-left"></i>
        </button>
        <button @click="jump" class="btn-touch btn-jump">
          <i class="mdi mdi-arrow-up-bold"></i> SALTO
        </button>
        <button @click="moveRight" class="btn-touch">
          <i class="mdi mdi-chevron-right"></i>
        </button>
      </div>

      <div class="controls-hint">
        Usa <kbd>◄</kbd> <kbd>►</kbd> o <kbd>A</kbd>/<kbd>D</kbd> per curvate |
        <kbd>SPAZIO</kbd> per saltare moto
      </div>

      <!-- Overlay Game Over -->
      <div v-if="gameState === 'gameover'" class="gameover-overlay">
        <i class="mdi mdi-car-burst crash-icon"></i>
        <h2>CRASH!</h2>
        <p>
          Hai percorso <strong>{{ Math.floor(score) }}</strong> metri!
        </p>
        <p class="final-speed">
          Velocità massima raggiunta:
          <strong>{{ displaySpeed.toFixed(1) }} km/h</strong>
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
const speedKmh = ref(20.0); // Velocità base iniziale in km/h
const displaySpeed = ref(20.0); // Velocità calcolata con Salite/Discese

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
let currentLane = 1; // 0: Sinistra, 1: Centro, 2: Destra
let playerX = 180;
let targetX = 180;

// Salto
let isJumping = false;
let jumpY = 0;
let jumpVelocity = 0;
const GRAVITY = 0.55;

// Elementi scenario
let obstacles = [];
let terrainPatches = []; // Salite e Discese sul lato della strada
let roadOffset = 0;
let pedalCycle = 0; // Per l'animazione delle gambe

const LANES = [60, 180, 300]; // Posizioni X delle 3 corsie
const RIGHT_SIDE_LANE = 2; // Salite/Discese posizionate sulla corsia destra (lato strada)

// --- DISEGNO DEL CICLISTA DETTAGLIATO (Vista dall'alto) ---
function drawCyclist(ctx, x, y, config, jumpOffsetY = 0) {
  ctx.save();

  // Posizione con offset del salto
  const actualY = y + jumpOffsetY;
  ctx.translate(x, actualY);

  // 1. OMBRA (si rimpicciolisce ed è sfalsata quando salta)
  ctx.save();
  const shadowScale = Math.max(0.4, 1 + jumpOffsetY / 80);
  ctx.translate(0, -jumpOffsetY * 0.8);
  ctx.scale(shadowScale, shadowScale);
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 10, 12, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. RUOTA POSTERIORE
  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.roundRect(-3.5, 14, 7, 22, 3);
  ctx.fill();
  // Cerchione metallico
  ctx.fillStyle = "#888";
  ctx.fillRect(-1.5, 16, 3, 18);

  // 3. RUOTA ANTERIORE
  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.roundRect(-3.5, -34, 7, 22, 3);
  ctx.fill();
  ctx.fillStyle = "#888";
  ctx.fillRect(-1.5, -32, 3, 18);

  // 4. TELAIO DELLA BICI (Tubi profilati)
  ctx.strokeStyle = config.bikeColor;
  ctx.lineWidth = 4.5;
  ctx.lineCap = "round";

  // Tubo principale dal cannotto sterzo al movimento centrale
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(0, 12);
  ctx.stroke();

  // Forcella anteriore e posteriore
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-5, -22);
  ctx.lineTo(5, -22);
  ctx.moveTo(-6, 16);
  ctx.lineTo(6, 16);
  ctx.stroke();

  // 5. MANUBRIO CURVO (Drop Bar)
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

  // Nastro Manubrio
  ctx.fillStyle = config.jerseyColor;
  ctx.fillRect(-16, -23, 4, 5);
  ctx.fillRect(12, -23, 4, 5);

  // 6. ANIMAZIONE GAMBE E PEDALI
  pedalCycle += 0.15;
  const legOffsetLeft = Math.sin(pedalCycle) * 8;
  const legOffsetRight = Math.sin(pedalCycle + Math.PI) * 8;

  ctx.strokeStyle = "#f1c27d"; // Colore pelle
  ctx.lineWidth = 4.5;

  // Gamba Sinistra
  ctx.beginPath();
  ctx.moveTo(-7, 2);
  ctx.lineTo(-11, 4 + legOffsetLeft);
  ctx.lineTo(-4, 8 + legOffsetLeft);
  ctx.stroke();

  // Gamba Destra
  ctx.beginPath();
  ctx.moveTo(7, 2);
  ctx.lineTo(11, 4 + legOffsetRight);
  ctx.lineTo(4, 8 + legOffsetRight);
  ctx.stroke();

  // 7. BUSTO E MAGLIA (Forma anatomica)
  ctx.fillStyle = config.jerseyColor;
  ctx.beginPath();
  ctx.moveTo(-11, -12);
  ctx.lineTo(11, -12);
  ctx.lineTo(8, 10);
  ctx.lineTo(-8, 10);
  ctx.closePath();
  ctx.fill();

  // Righe/Dettagli della Maglia
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fillRect(-4, -10, 8, 18);

  // Braccia piegate sul manubrio
  ctx.strokeStyle = config.jerseyColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-10, -10);
  ctx.lineTo(-14, -18);
  ctx.moveTo(10, -10);
  ctx.lineTo(14, -18);
  ctx.stroke();

  // 8. CASCO AERODINAMICO
  ctx.fillStyle = config.helmetColor;
  ctx.beginPath();
  // Forma a goccia del casco da crono/strada
  ctx.moveTo(0, -18);
  ctx.quadraticCurveTo(9, -12, 7, 0);
  ctx.quadraticCurveTo(0, 8, -7, 0);
  ctx.quadraticCurveTo(-9, -12, 0, -18);
  ctx.fill();

  // Scanalature aerodinamiche sul casco
  ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(0, 4);
  ctx.moveTo(-4, -12);
  ctx.lineTo(-3, 2);
  ctx.moveTo(4, -12);
  ctx.lineTo(3, 2);
  ctx.stroke();

  // Visiera Occhiali
  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.roundRect(-7, -15, 14, 3.5, 2);
  ctx.fill();

  ctx.restore();
}

// --- ANTEPRIMA INIZIALE ---
function drawPreview() {
  if (!previewCanvasRef.value) return;
  const ctx = previewCanvasRef.value.getContext("2d");
  ctx.clearRect(0, 0, 200, 200);

  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(0, 0, 200, 200);

  ctx.save();
  ctx.scale(1.7, 1.7);
  drawCyclist(ctx, 58, 62, playerConfig, 0);
  ctx.restore();
}

// --- GENERAZIONE TERRENO (Salite e Discese) ---
function spawnTerrainPatch() {
  // Compaiono periodicamente solo sul lato destro della strada (corsia LANES[2])
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

// --- DISEGNO TERRENO ---
function drawTerrainPatch(ctx, patch) {
  ctx.save();
  ctx.translate(patch.x, patch.y);

  const isSalita = patch.type === "salita";

  // Sfondo campitura
  ctx.fillStyle = isSalita
    ? "rgba(217, 119, 6, 0.25)"
    : "rgba(16, 185, 129, 0.25)";
  ctx.fillRect(-patch.width / 2, -patch.height / 2, patch.width, patch.height);

  // Bordo laterale
  ctx.strokeStyle = isSalita ? "#d97706" : "#10b981";
  ctx.lineWidth = 3;
  ctx.strokeRect(
    -patch.width / 2,
    -patch.height / 2,
    patch.width,
    patch.height,
  );

  // Frecce direzionali e Testo
  ctx.fillStyle = isSalita ? "#b45309" : "#047857";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(isSalita ? "▲ SALITA" : "▼ DISCESA", 0, 0);

  ctx.restore();
}

// --- GENERAZIONE OSTACOLI ---
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

// --- DISEGNO OSTACOLI ---
function drawObstacle(ctx, obs) {
  ctx.save();
  ctx.translate(obs.x, obs.y);

  // Ombra
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(-obs.width / 2 + 4, -obs.height / 2 + 4, obs.width, obs.height);

  // Corpo veicolo
  ctx.fillStyle = obs.color;
  ctx.beginPath();
  ctx.roundRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height, 6);
  ctx.fill();

  // Dettagli in base al tipo
  ctx.fillStyle = "#0f172a";
  if (obs.type === "car" || obs.type === "truck") {
    // Parabrezza e Lunotto
    ctx.fillRect(-obs.width / 2 + 4, -obs.height / 2 + 10, obs.width - 8, 14);
    ctx.fillRect(-obs.width / 2 + 4, obs.height / 2 - 18, obs.width - 8, 10);
  } else {
    // Moto
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(-4, -obs.height / 2 + 6, 8, 12);
  }

  // Luci rosse posteriori
  ctx.fillStyle = "#dc2626";
  ctx.fillRect(-obs.width / 2 + 3, obs.height / 2 - 3, 6, 3);
  ctx.fillRect(obs.width / 2 - 9, obs.height / 2 - 3, 6, 3);

  ctx.restore();
}

// --- CONTROLLI UTENTE ---
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
  if (e.code === "Space") {
    e.preventDefault();
    jump();
  }
}

// --- GAME LOOP PRINCIPALE ---
function gameLoop() {
  if (gameState.value !== "playing") return;

  const canvas = gameCanvasRef.value;
  const ctx = canvas.getContext("2d");

  // 1. GESTIONE VELOCITÀ E ACCELERAZIONE (+0.2 km/h ogni secondo -> ~0.0033 km/h a frame)
  speedKmh.value += 0.2 / 60;

  // Verifica se il giocatore si trova su Salita o Discesa
  let speedModifier = 0;
  const playerY = 490;

  for (const patch of terrainPatches) {
    if (
      Math.abs(playerX - patch.x) < 40 &&
      playerY > patch.y - patch.height / 2 &&
      playerY < patch.y + patch.height / 2
    ) {
      if (patch.type === "salita") speedModifier = -6.0; // Rallenta in salita
      if (patch.type === "discesa") speedModifier = +8.0; // Accelerata in discesa
    }
  }

  displaySpeed.value = Math.max(10, speedKmh.value + speedModifier);
  const pixelSpeed = displaySpeed.value * 0.28;

  // 2. FISICA SALTO
  if (isJumping) {
    jumpY += jumpVelocity;
    jumpVelocity += GRAVITY;
    if (jumpY >= 0) {
      jumpY = 0;
      isJumping = false;
    }
  }

  // 3. DISEGNO SFONDO E STRADA
  ctx.fillStyle = "#334155"; // Asfalto
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Marciapiedi
  ctx.fillStyle = "#64748b";
  ctx.fillRect(0, 0, 12, canvas.height);
  ctx.fillRect(canvas.width - 12, 0, 12, canvas.height);

  // Linee corsia tratteggiate
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

  // 4. AGGIORNAMENTO E DISEGNO TERRENO (Salite/Discese)
  if (Math.random() < 0.005) {
    const lastPatch = terrainPatches[terrainPatches.length - 1];
    if (!lastPatch || lastPatch.y > 300) {
      spawnTerrainPatch();
    }
  }

  for (let i = terrainPatches.length - 1; i >= 0; i--) {
    const patch = terrainPatches[i];
    patch.y += pixelSpeed;

    drawTerrainPatch(ctx, patch);

    if (patch.y > canvas.height + 200) {
      terrainPatches.splice(i, 1);
    }
  }

  // 5. MOVIMENTO FLUIDO CICLISTA (Lerp)
  playerX += (targetX - playerX) * 0.25;

  // 6. DISEGNO CICLISTA
  drawCyclist(ctx, playerX, playerY, playerConfig, jumpY);

  // 7. GENERAZIONE E DISEGNO OSTACOLI
  if (Math.random() < 0.018) {
    const lastObs = obstacles[obstacles.length - 1];
    if (!lastObs || lastObs.y > 140) {
      createObstacle();
    }
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.y += pixelSpeed * obs.speedMult;

    drawObstacle(ctx, obs);

    // Bounding Box Collisione
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
      // SE SALTA: Evita SOLO i motorini (moto) se il salto è abbastanza alto (jumpY < -15)
      const canEvadeWithJump = obs.type === "moto" && jumpY < -15;

      if (!canEvadeWithJump) {
        endGame();
        return;
      }
    }

    // Rimuovi ostacoli fuori mappa
    if (obs.y > canvas.height + 100) {
      obstacles.splice(i, 1);
    }
  }

  // 8. METRI PERCORSI
  score.value += pixelSpeed * 0.04;

  animationFrameId = requestAnimationFrame(gameLoop);
}

// --- GESTIONE STATI DI GIOCO ---
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

// --- LIFECYCLE HOOKS ---
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
/* Import CDN Material Design Icons integrato */
@import url("https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/css/materialdesignicons.min.css");

.cycling-game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  color: #0f172a;
  user-select: none;
}

.screen-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  text-align: center;
}

.screen-card h2 {
  font-size: 1.3rem;
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
  gap: 16px;
  margin: 16px 0;
}

.preview-canvas {
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  background-color: #f8fafc;
}

.controls-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.control-item label {
  font-size: 0.85rem;
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
  width: 32px;
  height: 32px;
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
  width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game-canvas {
  border-radius: 12px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  background: #334155;
}

.hud {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-around;
  background: rgba(15, 23, 42, 0.85);
  color: #ffffff;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  backdrop-filter: blur(4px);
  z-index: 2;
}

.hud-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.hud-item i {
  color: #38bdf8;
}

.mobile-controls {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 10px;
  gap: 8px;
}

.btn-touch {
  flex: 1;
  padding: 14px;
  font-size: 1.4rem;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-jump {
  flex: 1.5;
  font-size: 0.95rem;
  font-weight: bold;
  gap: 6px;
  background: #e2e8f0;
}

.btn-touch:active {
  background: #cbd5e1;
}

.controls-hint {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 8px;
  text-align: center;
}

kbd {
  background: #e2e8f0;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}

.gameover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.9);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  z-index: 10;
}

.crash-icon {
  font-size: 3.5rem;
  color: #ef4444;
}

.final-speed {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-top: 4px;
}

.overlay-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  width: 75%;
}

.btn-primary {
  width: 100%;
  padding: 12px 20px;
  background: #2563eb;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-secondary {
  width: 100%;
  padding: 10px 20px;
  background: transparent;
  color: #cbd5e1;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
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
