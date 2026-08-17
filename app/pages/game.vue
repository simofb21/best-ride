<template>
  <div class="cycling-game-container">
    <!-- PHASE 1: CUSTOMIZE RIDER -->
    <div v-if="gameState === 'customize'" class="screen-card">
      <h2><i class="mdi mdi-palette"></i> {{ $t("game.customize") }}</h2>

      <div class="customization-wrapper">
        <canvas
          ref="previewCanvasRef"
          width="200"
          height="200"
          class="preview-canvas"
        ></canvas>

        <div class="controls-group">
          <!-- Jersey Color RGB -->
          <div class="control-item">
            <label><i class="mdi mdi-tshirt-crew"></i> {{ $t("game.jerseyColor") }}:</label>
            <div class="color-picker-wrapper">
              <input
                type="color"
                v-model="playerConfig.jerseyColor"
                @input="drawPreview"
                class="color-input"
              />
              <span class="color-hex">{{ playerConfig.jerseyColor }}</span>
            </div>
          </div>

          <!-- Bike Frame Color RGB -->
          <div class="control-item">
            <label><i class="mdi mdi-bike"></i> {{ $t("game.bikeColor") }}:</label>
            <div class="color-picker-wrapper">
              <input
                type="color"
                v-model="playerConfig.bikeColor"
                @input="drawPreview"
                class="color-input"
              />
              <span class="color-hex">{{ playerConfig.bikeColor }}</span>
            </div>
          </div>

          <!-- Helmet Color RGB -->
          <div class="control-item">
            <label><i class="mdi mdi-racing-helmet"></i> {{ $t("game.helmetColor") }}:</label>
            <div class="color-picker-wrapper">
              <input
                type="color"
                v-model="playerConfig.helmetColor"
                @input="drawPreview"
                class="color-input"
              />
              <span class="color-hex">{{ playerConfig.helmetColor }}</span>
            </div>
          </div>
        </div>
      </div>

      <button class="btn-primary" @click="startGame">
        <i class="mdi mdi-flag-checkered"></i> {{ $t("game.start") }}
      </button>
    </div>

    <!-- PHASE 2 & 3: GAMEPLAY & OVERLAYS -->
    <div
      v-show="gameState !== 'customize'"
      class="game-wrapper"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <!-- TOP HUD -->
      <div class="hud">
        <!-- SPEED & BOOST BADGE -->
        <div class="hud-item speed-hud">
          <i class="mdi mdi-speedometer"></i>
          <div class="speed-text-container">
            <span
              ><strong>{{ displaySpeed.toFixed(1) }}</strong> km/h</span
            >
            <span v-if="stamina > 50" class="speed-badge boost"
              >{{ $t("game.boost") }}</span
            >
            <span v-else-if="stamina === 0" class="speed-badge slow"
              >{{ $t("game.draining") }}</span
            >
            <span v-else-if="stamina < 25" class="speed-badge slow">{{ $t("game.slow") }}</span>
          </div>
        </div>

        <!-- STAMINA BAR HUD -->
        <div class="hud-item stamina-hud">
          <i
            class="mdi mdi-lightning-bolt"
            :style="{ color: staminaColor }"
          ></i>
          <div class="stamina-bar-bg">
            <div
              class="stamina-bar-fill"
              :style="{ width: stamina + '%', backgroundColor: staminaColor }"
            ></div>
          </div>
        </div>

        <!-- DISTANCE SCORE -->
        <div class="hud-item">
          <i class="mdi mdi-map-marker-distance"></i>
          <span
            ><strong>{{ Math.floor(score) }}</strong> m</span
          >
        </div>

        <!-- PAUSE BUTTON -->
        <button class="pause-btn" @click="togglePause" :title="$t('game.pause')">
          <i class="mdi" :class="isPaused ? 'mdi-play' : 'mdi-pause'"></i>
        </button>
      </div>

      <canvas
        ref="gameCanvasRef"
        width="360"
        height="600"
        class="game-canvas"
      ></canvas>

      <!-- GESTURE CONTROLS HINT -->
      <div class="gesture-hint">
        <i class="mdi mdi-gesture-swipe-horizontal"></i> {{ $t("game.swipe") }} |
        <i class="mdi mdi-gesture-swipe-up"></i> {{ $t("game.jump") }} |
        <i class="mdi mdi-keyboard-outline"></i> {{ $t("game.pauseHint") }}
      </div>

      <!-- PAUSE OVERLAY -->
      <div v-if="isPaused && gameState === 'playing'" class="modal-overlay">
        <i class="mdi mdi-pause-circle pause-icon"></i>
        <h2>{{ $t("game.paused") }}</h2>

        <div class="overlay-actions">
          <button class="btn-primary" @click="togglePause">
            <i class="mdi mdi-play"></i> {{ $t("game.resume") }}
          </button>
          <button class="btn-secondary" @click="startGame">
            <i class="mdi mdi-restart"></i> {{ $t("game.restart") }}
          </button>
          <button class="btn-secondary" @click="exitToCustomize">
            <i class="mdi mdi-account-edit"></i> {{ $t("game.editRider") }}
          </button>
        </div>
      </div>

      <!-- GAME OVER OVERLAY -->
      <div v-if="gameState === 'gameover'" class="modal-overlay">
        <i
          v-if="gameOverReason === 'crash'"
          class="mdi mdi-car-burst crash-icon"
        ></i>
        <i v-else class="mdi mdi-battery-alert exhausted-icon"></i>

        <h2>{{ gameOverReason === "crash" ? $t("game.crash") : $t("game.outOfEnergy") }}</h2>
        <p v-if="gameOverReason === 'exhausted'" class="subtitle">
          {{ $t("game.speedDropped") }}
        </p>

        <p>
          {{ $t("game.distanceCovered") }}: <strong>{{ Math.floor(score) }}</strong> {{ $t("game.meters") }}
        </p>
        <p class="final-speed">
          {{ $t("game.topSpeed") }}: <strong>{{ maxSpeed.toFixed(1) }} km/h</strong>
        </p>

        <div class="overlay-actions">
          <button class="btn-primary" @click="startGame">
            <i class="mdi mdi-restart"></i> {{ $t("game.tryAgain") }}
          </button>
          <button class="btn-secondary" @click="exitToCustomize">
            <i class="mdi mdi-account-edit"></i> {{ $t("game.editRider") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from "vue";

// --- GAME STATE & CONFIGURATION ---
const gameState = ref("customize"); // 'customize' | 'playing' | 'gameover'
const isPaused = ref(false);
const gameOverReason = ref("crash"); // 'crash' | 'exhausted'
const score = ref(0);
const highScore = ref(0);
const speedKmh = ref(20.0);
const displaySpeed = ref(20.0);
const maxSpeed = ref(20.0); // Traccia la velocità massima raggiunta

// STAMINA SYSTEM
const stamina = ref(100);
const STAMINA_DRAIN_PER_FRAME = 100 / (25 * 60); // ~25 secondi a 60fps

const staminaColor = computed(() => {
  if (stamina.value > 50) return "#22c55e";
  if (stamina.value > 25) return "#eab308";
  return "#ef4444";
});

// RGB Full Color Customization
const playerConfig = reactive({
  jerseyColor: "#e63946",
  bikeColor: "#1d3557",
  helmetColor: "#ffffff",
});

// --- CANVAS REFS ---
const previewCanvasRef = ref(null);
const gameCanvasRef = ref(null);

// --- GAMEPLAY LOGIC ---
let animationFrameId = null;
let currentLane = 1;
let playerX = 180;
let targetX = 180;

// Jump Physics
let isJumping = false;
let jumpY = 0;
let jumpVelocity = 0;
const GRAVITY = 0.55;

// Entities
let obstacles = [];
let terrainPatches = [];
let energyGels = [];
let roadOffset = 0;
let pedalCycle = 0;

const LANES = [60, 180, 300];
const RIGHT_SIDE_LANE = 2;

// --- MOBILE TOUCH CONTROLS ---
let touchStartX = 0;
let touchStartY = 0;
const MIN_SWIPE_DISTANCE = 30;

function handleTouchStart(e) {
  if (gameState.value !== "playing" || isPaused.value) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function handleTouchEnd(e) {
  if (gameState.value !== "playing" || isPaused.value) return;
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;

  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (Math.abs(deltaX) > MIN_SWIPE_DISTANCE) {
      if (deltaX > 0) moveRight();
      else moveLeft();
    }
  } else {
    if (deltaY < -MIN_SWIPE_DISTANCE) {
      jump();
    }
  }
}

// --- PAUSE LOGIC ---
function togglePause() {
  if (gameState.value !== "playing") return;

  isPaused.value = !isPaused.value;

  if (isPaused.value) {
    cancelAnimationFrame(animationFrameId);
  } else {
    gameLoop();
  }
}

function exitToCustomize() {
  isPaused.value = false;
  gameState.value = "customize";
  cancelAnimationFrame(animationFrameId);
}

// --- CANVAS RIDER RENDERING ---
function drawCyclist(ctx, x, y, config, jumpOffsetY = 0) {
  ctx.save();
  const actualY = y + jumpOffsetY;
  ctx.translate(x, actualY);

  // Shadow
  ctx.save();
  const shadowScale = Math.max(0.4, 1 + jumpOffsetY / 80);
  ctx.translate(0, -jumpOffsetY * 0.8);
  ctx.scale(shadowScale, shadowScale);
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 10, 12, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Wheels & Frame
  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.roundRect(-3.5, 14, 7, 22, 3);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(-3.5, -34, 7, 22, 3);
  ctx.fill();

  ctx.strokeStyle = config.bikeColor;
  ctx.lineWidth = 4.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(0, 12);
  ctx.stroke();

  // Handlebars
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-15, -22);
  ctx.lineTo(15, -22);
  ctx.stroke();

  // Pedaling Animation (Velocità pedata proporzionale alla velocità)
  pedalCycle += Math.max(0.02, displaySpeed.value * 0.006);
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

  // Jersey Torso
  ctx.fillStyle = config.jerseyColor;
  ctx.beginPath();
  ctx.moveTo(-11, -12);
  ctx.lineTo(11, -12);
  ctx.lineTo(8, 10);
  ctx.lineTo(-8, 10);
  ctx.closePath();
  ctx.fill();

  // Helmet
  ctx.fillStyle = config.helmetColor;
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.quadraticCurveTo(9, -12, 7, 0);
  ctx.quadraticCurveTo(0, 8, -7, 0);
  ctx.quadraticCurveTo(-9, -12, 0, -18);
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

// --- ENERGY GELS ---
function spawnEnergyGel() {
  const laneIndex = Math.floor(Math.random() * 3);
  energyGels.push({
    x: LANES[laneIndex],
    y: -40,
    width: 26,
    height: 32,
    pulse: 0,
  });
}

function drawEnergyGel(ctx, gel) {
  ctx.save();
  gel.pulse += 0.08;
  const glow = Math.sin(gel.pulse) * 3;

  ctx.translate(gel.x, gel.y);
  ctx.shadowColor = "#06b6d4";
  ctx.shadowBlur = 8 + glow;

  ctx.fillStyle = "#06b6d4";
  ctx.beginPath();
  ctx.moveTo(-10, -14);
  ctx.lineTo(10, -14);
  ctx.lineTo(12, 14);
  ctx.lineTo(-12, 14);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#67e8f9";
  ctx.fillRect(-6, -16, 12, 4);

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(1, -8);
  ctx.lineTo(-4, 0);
  ctx.lineTo(0, 0);
  ctx.lineTo(-1, 8);
  ctx.lineTo(4, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// --- TERRAIN SLOPES ---
function spawnTerrainPatch() {
  const types = ["uphill", "downhill"];
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

  const isUphill = patch.type === "uphill";
  const w = patch.width;
  const h = patch.height;

  const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  if (isUphill) {
    grad.addColorStop(0, "rgba(180, 83, 9, 0.75)");
    grad.addColorStop(0.5, "rgba(245, 158, 11, 0.45)");
    grad.addColorStop(1, "rgba(217, 119, 6, 0.15)");
  } else {
    grad.addColorStop(0, "rgba(16, 185, 129, 0.15)");
    grad.addColorStop(0.5, "rgba(16, 185, 129, 0.45)");
    grad.addColorStop(1, "rgba(4, 120, 87, 0.75)");
  }

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 8);
  ctx.fill();

  ctx.strokeStyle = isUphill ? "#d97706" : "#10b981";
  ctx.lineWidth = 3;
  ctx.strokeRect(-w / 2, -h / 2, w, h);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.lineWidth = 2.5;

  for (let i = 0; i < 3; i++) {
    const yOffset = -h / 3 + (i * h) / 3;
    ctx.beginPath();
    if (isUphill) {
      ctx.moveTo(-w / 3, yOffset + 8);
      ctx.lineTo(0, yOffset - 4);
      ctx.lineTo(w / 3, yOffset + 8);
    } else {
      ctx.moveTo(-w / 3, yOffset - 4);
      ctx.lineTo(0, yOffset + 8);
      ctx.lineTo(w / 3, yOffset - 4);
    }
    ctx.stroke();
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 11px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(isUphill ? "▲ UPHILL" : "▼ DOWNHILL", 0, 2);

  ctx.restore();
}

// --- OBSTACLES ---
function createObstacle() {
  const laneIndex = Math.floor(Math.random() * 3);
  const types = [
    { type: "car", width: 46, height: 78, speedMult: 0.95, color: "#ef4444" },
    { type: "truck", width: 52, height: 115, speedMult: 0.8, color: "#8b5cf6" },
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

  ctx.restore();
}

// --- CONTROLS ---
function moveLeft() {
  if (currentLane > 0 && gameState.value === "playing" && !isPaused.value) {
    currentLane--;
    targetX = LANES[currentLane];
  }
}

function moveRight() {
  if (currentLane < 2 && gameState.value === "playing" && !isPaused.value) {
    currentLane++;
    targetX = LANES[currentLane];
  }
}

function jump() {
  if (!isJumping && gameState.value === "playing" && !isPaused.value) {
    isJumping = true;
    jumpVelocity = -10.5;
  }
}

function handleKeyDown(e) {
  if (e.key === "p" || e.key === "P" || e.key === "Escape") {
    togglePause();
    return;
  }

  if (isPaused.value) return;

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
  if (gameState.value !== "playing" || isPaused.value) return;

  const canvas = gameCanvasRef.value;
  const ctx = canvas.getContext("2d");

  // 1. Drain Stamina Over Time
  stamina.value = Math.max(0, stamina.value - STAMINA_DRAIN_PER_FRAME);

  const playerY = 490;

  // 2. Terrain Slope Modifiers (Accelerazione/Decelerazione pendenza)
  let terrainAccel = 0;
  for (const patch of terrainPatches) {
    if (
      Math.abs(playerX - patch.x) < 40 &&
      playerY > patch.y - patch.height / 2 &&
      playerY < patch.y + patch.height / 2
    ) {
      if (patch.type === "uphill") terrainAccel = -0.12;
      if (patch.type === "downhill") terrainAccel = +0.15;
    }
  }

  // 3. Nuova Logica di Accelerazione / Decelerazione Fluida
  const BASE_ACCEL = 0.2 / 60; // Base di incremento velocità al secondo

  if (stamina.value === 0) {
    // Stamina Esaurita: Crollo rapido della velocità!
    speedKmh.value -= 0.22;
  } else if (stamina.value > 50) {
    // Boost Stamina (>50%): Accelerazione base + 30% bonus
    speedKmh.value += BASE_ACCEL * 1.3 + terrainAccel;
  } else if (stamina.value >= 25) {
    // Stamina Normale (25-50%): Accelerazione standard
    speedKmh.value += BASE_ACCEL + terrainAccel;
  } else {
    // Stamina Bassa (<25%): Decelerazione progressiva e fluida
    speedKmh.value -= 0.04 + Math.abs(terrainAccel < 0 ? terrainAccel : 0);
  }

  // Controllo Morte per Esaurimento Energia (Velocità <= 0)
  if (stamina.value === 0 && speedKmh.value <= 0) {
    speedKmh.value = 0;
    displaySpeed.value = 0;
    endGame("exhausted");
    return;
  }

  // Minimo di velocità quando si ha ancora stamina
  if (stamina.value > 0 && speedKmh.value < 10) {
    speedKmh.value = 10;
  }

  displaySpeed.value = speedKmh.value;

  // Registra la Max Speed raggiunta
  if (displaySpeed.value > maxSpeed.value) {
    maxSpeed.value = displaySpeed.value;
  }

  const pixelSpeed = displaySpeed.value * 0.28;

  if (isJumping) {
    jumpY += jumpVelocity;
    jumpVelocity += GRAVITY;
    if (jumpY >= 0) {
      jumpY = 0;
      isJumping = false;
    }
  }

  // Draw Background
  ctx.fillStyle = "#334155";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#64748b";
  ctx.fillRect(0, 0, 12, canvas.height);
  ctx.fillRect(canvas.width - 12, 0, 12, canvas.height);

  // Lane Dividers
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

  // Slopes
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

  // Energy Gels
  if (Math.random() < 0.015) {
    const lastGel = energyGels[energyGels.length - 1];
    if (!lastGel || lastGel.y > 160) spawnEnergyGel();
  }

  for (let i = energyGels.length - 1; i >= 0; i--) {
    const gel = energyGels[i];
    gel.y += pixelSpeed;
    drawEnergyGel(ctx, gel);

    const playerBox = { x: playerX - 16, y: playerY - 20, w: 32, h: 40 };
    const gelBox = {
      x: gel.x - gel.width / 2,
      y: gel.y - gel.height / 2,
      w: gel.width,
      h: gel.height,
    };

    const isCollected =
      playerBox.x < gelBox.x + gelBox.w &&
      playerBox.x + playerBox.w > gelBox.x &&
      playerBox.y < gelBox.y + gelBox.h &&
      playerBox.y + playerBox.h > gelBox.y;

    if (isCollected) {
      stamina.value = Math.min(100, stamina.value + 25);
      energyGels.splice(i, 1);
      continue;
    }

    if (gel.y > canvas.height + 50) energyGels.splice(i, 1);
  }

  playerX += (targetX - playerX) * 0.25;
  drawCyclist(ctx, playerX, playerY, playerConfig, jumpY);

  // Obstacles
  if (Math.random() < 0.016) {
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
        endGame("crash");
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
  stamina.value = 100;
  speedKmh.value = 20.0;
  displaySpeed.value = 20.0;
  maxSpeed.value = 20.0;
  currentLane = 1;
  playerX = LANES[1];
  targetX = LANES[1];
  isJumping = false;
  jumpY = 0;
  isPaused.value = false;
  obstacles = [];
  terrainPatches = [];
  energyGels = [];
  gameState.value = "playing";

  nextTick(() => {
    cancelAnimationFrame(animationFrameId);
    gameLoop();
  });
}

function endGame(reason = "crash") {
  gameOverReason.value = reason;
  gameState.value = "gameover";
  isPaused.value = false;
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
  touch-action: none;
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
  gap: 12px;
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

.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.color-input {
  -webkit-appearance: none;
  appearance: none;
  width: 40px;
  height: 40px;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: 2px solid #cbd5e1;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-hex {
  font-family: monospace;
  font-size: 0.85rem;
  color: #64748b;
  text-transform: uppercase;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 6px;
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

/* HUD & PAUSE BUTTON */
.hud {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(15, 23, 42, 0.88);
  color: #ffffff;
  padding: 8px 10px;
  border-radius: 16px;
  font-size: 0.75rem;
  backdrop-filter: blur(6px);
  z-index: 2;
}

.hud-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.speed-hud {
  display: flex;
  align-items: center;
  gap: 5px;
}

.speed-text-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.1;
}

.speed-badge {
  font-size: 0.6rem;
  font-weight: 800;
  padding: 1px 4px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.speed-badge.boost {
  background-color: #22c55e;
  color: #ffffff;
}

.speed-badge.slow {
  background-color: #ef4444;
  color: #ffffff;
}

.stamina-hud {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stamina-bar-bg {
  width: 45px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.stamina-bar-fill {
  height: 100%;
  transition:
    width 0.1s linear,
    background-color 0.3s ease;
}

.pause-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #ffffff;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background 0.2s;
}

.pause-btn:hover {
  background: rgba(255, 255, 255, 0.3);
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

/* OVERLAYS (PAUSE & GAMEOVER) */
.modal-overlay {
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

.pause-icon {
  font-size: 3.5rem;
  color: #38bdf8;
}

.crash-icon {
  font-size: 3.5rem;
  color: #ef4444;
}

.exhausted-icon {
  font-size: 3.5rem;
  color: #eab308;
}

.subtitle {
  font-size: 0.85rem;
  color: #f87171;
  margin-bottom: 8px;
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

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
}
</style>
