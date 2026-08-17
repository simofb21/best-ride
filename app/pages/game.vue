<template>
  <div class="cycling-game-container">
    <!-- PHASE 1: CUSTOMIZE RIDER -->
    <div v-if="gameState === 'customize'" class="screen-card">
      <div class="screen-heading">
        <span class="heading-icon"><i class="mdi mdi-bike-fast"></i></span>
        <h2>{{ $t("game.customize") }}</h2>
      </div>

      <div class="customization-wrapper">
        <canvas
          ref="previewCanvasRef"
          width="280"
          height="240"
          class="preview-canvas"
        ></canvas>

        <div class="controls-group">
          <!-- Jersey Color RGB -->
          <div class="control-item">
            <label
              ><i class="mdi mdi-tshirt-crew"></i>
              {{ $t("game.jerseyColor") }}:</label
            >
            <div class="color-picker-wrapper">
              <input
                type="color"
                v-model="playerConfig.jerseyColor"
                @input="drawPreview"
                :aria-label="$t('game.jerseyColor')"
                class="color-input"
              />
              <span class="color-hex">{{ playerConfig.jerseyColor }}</span>
            </div>
          </div>

          <!-- Bike Frame Color RGB -->
          <div class="control-item">
            <label
              ><i class="mdi mdi-bike"></i> {{ $t("game.bikeColor") }}:</label
            >
            <div class="color-picker-wrapper">
              <input
                type="color"
                v-model="playerConfig.bikeColor"
                @input="drawPreview"
                :aria-label="$t('game.bikeColor')"
                class="color-input"
              />
              <span class="color-hex">{{ playerConfig.bikeColor }}</span>
            </div>
          </div>

          <!-- Helmet Color RGB -->
          <div class="control-item">
            <label
              ><i class="mdi mdi-racing-helmet"></i>
              {{ $t("game.helmetColor") }}:</label
            >
            <div class="color-picker-wrapper">
              <input
                type="color"
                v-model="playerConfig.helmetColor"
                @input="drawPreview"
                :aria-label="$t('game.helmetColor')"
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
            <span v-if="stamina > 50" class="speed-badge boost">{{
              $t("game.boost")
            }}</span>
            <span v-else-if="stamina === 0" class="speed-badge slow">{{
              $t("game.draining")
            }}</span>
            <span v-else-if="stamina < 25" class="speed-badge slow">{{
              $t("game.slow")
            }}</span>
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
        <button
          class="pause-btn"
          @click="togglePause"
          :title="$t('game.pause')"
        >
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
        <i class="mdi mdi-gesture-swipe-horizontal"></i>
        {{ $t("game.swipe") }} | <i class="mdi mdi-gesture-swipe-up"></i>
        {{ $t("game.jump") }} | <i class="mdi mdi-keyboard-outline"></i>
        {{ $t("game.pauseHint") }}
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

        <h2>
          {{
            gameOverReason === "crash"
              ? $t("game.crash")
              : $t("game.outOfEnergy")
          }}
        </h2>
        <p v-if="gameOverReason === 'exhausted'" class="subtitle">
          {{ $t("game.speedDropped") }}
        </p>

        <p>
          {{ $t("game.distanceCovered") }}:
          <strong>{{ Math.floor(score) }}</strong> {{ $t("game.meters") }}
        </p>
        <p class="final-speed">
          {{ $t("game.topSpeed") }}:
          <strong>{{ maxSpeed.toFixed(1) }} km/h</strong>
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
  bikeColor: "#0ea5e9",
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
function shadeColor(hex, amount) {
  const value = hex.replace("#", "");
  const number = Number.parseInt(value, 16);
  if (Number.isNaN(number)) return hex;

  const clamp = (channel) => Math.max(0, Math.min(255, channel));
  const red = clamp((number >> 16) + amount);
  const green = clamp(((number >> 8) & 0xff) + amount);
  const blue = clamp((number & 0xff) + amount);
  return `rgb(${red}, ${green}, ${blue})`;
}

function drawBikeWheel(ctx, y) {
  ctx.save();
  ctx.translate(0, y);

  // A top-down racing wheel: tyre, rim and hub.
  ctx.fillStyle = "#090c10";
  ctx.beginPath();
  ctx.roundRect(-3.8, -15, 7.6, 30, 4);
  ctx.fill();

  ctx.fillStyle = "#475569";
  ctx.beginPath();
  ctx.roundRect(-1.7, -13, 3.4, 26, 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(226, 232, 240, 0.72)";
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.lineTo(0, 11);
  ctx.moveTo(-1.5, -8);
  ctx.lineTo(1.5, 8);
  ctx.moveTo(1.5, -8);
  ctx.lineTo(-1.5, 8);
  ctx.stroke();

  ctx.fillStyle = "#d7dee7";
  ctx.beginPath();
  ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCyclist(ctx, x, y, config, jumpOffsetY = 0, animated = true) {
  ctx.save();
  const actualY = y + jumpOffsetY;
  ctx.translate(x, actualY);

  // Soft contact shadow stays on the road while the cyclist jumps.
  ctx.save();
  const shadowScale = Math.max(0.45, 1 + jumpOffsetY / 95);
  ctx.translate(2, 4 - jumpOffsetY);
  ctx.scale(shadowScale, shadowScale);
  ctx.filter = "blur(3px)";
  ctx.fillStyle = "rgba(4, 8, 14, 0.3)";
  ctx.beginPath();
  ctx.ellipse(0, 2, 15, 48, -0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Wheels and the visible carbon fork/frame.
  drawBikeWheel(ctx, -35);
  drawBikeWheel(ctx, 35);

  ctx.strokeStyle = shadeColor(config.bikeColor, -35);
  ctx.lineWidth = 5.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(0, -34);
  ctx.lineTo(0, -20);
  ctx.lineTo(-7, 12);
  ctx.lineTo(0, 34);
  ctx.moveTo(0, -20);
  ctx.lineTo(7, 12);
  ctx.lineTo(0, 34);
  ctx.stroke();

  ctx.strokeStyle = config.bikeColor;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-7, 12);
  ctx.lineTo(7, 12);
  ctx.moveTo(0, -19);
  ctx.lineTo(0, 12);
  ctx.stroke();

  // Coloured fork crowns and seat stays remain visible around the rider.
  ctx.strokeStyle = shadeColor(config.bikeColor, 18);
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-2, -34);
  ctx.lineTo(-7, -20);
  ctx.moveTo(2, -34);
  ctx.lineTo(7, -20);
  ctx.moveTo(-7, 12);
  ctx.lineTo(-3, 30);
  ctx.moveTo(7, 12);
  ctx.lineTo(3, 30);
  ctx.stroke();

  // Saddle, crankset and drop handlebars.
  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.roundRect(-5.5, 14, 11, 12, 4);
  ctx.fill();

  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-16, -22);
  ctx.quadraticCurveTo(-18, -19, -14, -16);
  ctx.moveTo(16, -22);
  ctx.quadraticCurveTo(18, -19, 14, -16);
  ctx.moveTo(-16, -22);
  ctx.lineTo(16, -22);
  ctx.stroke();

  ctx.fillStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.arc(0, 11, 3.4, 0, Math.PI * 2);
  ctx.fill();

  // Pedalling legs, with shoes anchored around the crank.
  const cycle = animated ? pedalCycle : -0.65;
  const legOffsetLeft = Math.sin(cycle) * 7;
  const legOffsetRight = Math.sin(cycle + Math.PI) * 7;

  ctx.strokeStyle = "#172033";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-6.5, 8);
  ctx.lineTo(-9, 19 + legOffsetLeft);
  ctx.lineTo(-3, 28 + legOffsetLeft * 0.45);
  ctx.moveTo(6.5, 8);
  ctx.lineTo(9, 19 + legOffsetRight);
  ctx.lineTo(3, 28 + legOffsetRight * 0.45);
  ctx.stroke();

  ctx.strokeStyle = "#f1c27d";
  ctx.lineWidth = 4.2;
  ctx.beginPath();
  ctx.moveTo(-3, 27 + legOffsetLeft * 0.45);
  ctx.lineTo(-1, 31 + legOffsetLeft * 0.25);
  ctx.moveTo(3, 27 + legOffsetRight * 0.45);
  ctx.lineTo(1, 31 + legOffsetRight * 0.25);
  ctx.stroke();

  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.ellipse(-1, 32 + legOffsetLeft * 0.25, 3.2, 5.5, 0, 0, Math.PI * 2);
  ctx.ellipse(1, 32 + legOffsetRight * 0.25, 3.2, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Arms reach naturally from the shoulders to the drop bars.
  ctx.strokeStyle = "#f1c27d";
  ctx.lineWidth = 5.2;
  ctx.beginPath();
  ctx.moveTo(-11, -7);
  ctx.lineTo(-17, -14);
  ctx.lineTo(-15, -21);
  ctx.moveTo(11, -7);
  ctx.lineTo(17, -14);
  ctx.lineTo(15, -21);
  ctx.stroke();

  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.arc(-15, -21, 3.1, 0, Math.PI * 2);
  ctx.arc(15, -21, 3.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-12.5, -11);
  ctx.quadraticCurveTo(0, -17, 12.5, -11);
  ctx.lineTo(8, 10);
  ctx.quadraticCurveTo(0, 14, -8, 10);
  ctx.closePath();
  const jerseyGradient = ctx.createLinearGradient(-12, 0, 12, 0);
  jerseyGradient.addColorStop(0, shadeColor(config.jerseyColor, -32));
  jerseyGradient.addColorStop(0.48, shadeColor(config.jerseyColor, 18));
  jerseyGradient.addColorStop(1, shadeColor(config.jerseyColor, -42));
  ctx.fillStyle = jerseyGradient;
  ctx.fill();

  // Jersey seam, rear pockets and collar sell the human silhouette.
  ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(0, 10);
  ctx.moveTo(-7, 7);
  ctx.lineTo(7, 7);
  ctx.stroke();

  ctx.fillStyle = "#dca96f";
  ctx.beginPath();
  ctx.ellipse(0, -17, 7.5, 9.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Aerodynamic helmet with depth, rim and ventilation channels.
  const helmetGradient = ctx.createLinearGradient(-10, -30, 10, -15);
  helmetGradient.addColorStop(0, shadeColor(config.helmetColor, -28));
  helmetGradient.addColorStop(0.48, shadeColor(config.helmetColor, 20));
  helmetGradient.addColorStop(1, shadeColor(config.helmetColor, -45));
  ctx.fillStyle = helmetGradient;
  ctx.beginPath();
  ctx.ellipse(0, -23, 10.5, 13.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(15, 23, 42, 0.45)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-5.5, -28);
  ctx.quadraticCurveTo(-2, -23, -4.5, -17);
  ctx.moveTo(0, -31);
  ctx.lineTo(0, -16);
  ctx.moveTo(5.5, -28);
  ctx.quadraticCurveTo(2, -23, 4.5, -17);
  ctx.stroke();

  ctx.fillStyle = "rgba(8, 15, 26, 0.78)";
  ctx.beginPath();
  ctx.roundRect(-7.5, -18.5, 15, 3.5, 2);
  ctx.fill();

  ctx.restore();
}

function drawPreview() {
  if (!previewCanvasRef.value) return;
  const ctx = previewCanvasRef.value.getContext("2d");
  const width = previewCanvasRef.value.width;
  const height = previewCanvasRef.value.height;
  ctx.clearRect(0, 0, width, height);

  const grass = ctx.createLinearGradient(0, 0, width, height);
  grass.addColorStop(0, "#3f7f49");
  grass.addColorStop(1, "#1f5637");
  ctx.fillStyle = grass;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#69727b";
  ctx.beginPath();
  ctx.roundRect(42, -8, width - 84, height + 16, 20);
  ctx.fill();

  const asphalt = ctx.createLinearGradient(42, 0, width - 42, 0);
  asphalt.addColorStop(0, "#343c45");
  asphalt.addColorStop(0.5, "#4a535c");
  asphalt.addColorStop(1, "#303840");
  ctx.fillStyle = asphalt;
  ctx.fillRect(52, 0, width - 104, height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
  ctx.lineWidth = 3;
  ctx.setLineDash([18, 13]);
  ctx.beginPath();
  ctx.moveTo(width / 2, -6);
  ctx.lineTo(width / 2, height + 6);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.save();
  ctx.translate(width / 2, height / 2 + 10);
  ctx.scale(1.72, 1.72);
  drawCyclist(ctx, 0, 0, playerConfig, 0, false);
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
  ctx.shadowBlur = 10 + glow;

  const packGradient = ctx.createLinearGradient(-12, -14, 12, 14);
  packGradient.addColorStop(0, "#67e8f9");
  packGradient.addColorStop(0.45, "#0891b2");
  packGradient.addColorStop(1, "#164e63");
  ctx.fillStyle = packGradient;
  ctx.beginPath();
  ctx.moveTo(-9, -14);
  ctx.quadraticCurveTo(0, -17, 9, -14);
  ctx.lineTo(12, 13);
  ctx.quadraticCurveTo(0, 17, -12, 13);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#dffbff";
  ctx.beginPath();
  ctx.roundRect(-7, -17, 14, 5, 2);
  ctx.fill();

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

  ctx.font = "800 5px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("ENERGY", 0, 12);

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
    grad.addColorStop(0, "rgba(194, 108, 28, 0.42)");
    grad.addColorStop(0.5, "rgba(245, 158, 11, 0.16)");
    grad.addColorStop(1, "rgba(217, 119, 6, 0.04)");
  } else {
    grad.addColorStop(0, "rgba(16, 185, 129, 0.04)");
    grad.addColorStop(0.5, "rgba(16, 185, 129, 0.15)");
    grad.addColorStop(1, "rgba(4, 120, 87, 0.4)");
  }

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 10);
  ctx.fill();

  ctx.strokeStyle = isUphill
    ? "rgba(251, 191, 36, 0.82)"
    : "rgba(52, 211, 153, 0.82)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
  ctx.lineWidth = 2;

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

  ctx.fillStyle = "rgba(8, 15, 25, 0.68)";
  ctx.beginPath();
  ctx.roundRect(-38, -10, 76, 20, 10);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 10px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(isUphill ? "▲ UPHILL" : "▼ DOWNHILL", 0, 2);

  ctx.restore();
}

// --- OBSTACLES ---
function createObstacle() {
  const laneIndex = Math.floor(Math.random() * 3);
  const carColors = ["#d62828", "#2563eb", "#f8fafc", "#111827", "#d97706"];
  const types = [
    {
      type: "car",
      width: 54,
      height: 92,
      speedMult: 0.92,
      color: carColors[Math.floor(Math.random() * carColors.length)],
      jumpable: false,
    },
    {
      type: "truck",
      width: 62,
      height: 124,
      speedMult: 0.78,
      color: "#f8fafc",
      jumpable: false,
    },
    {
      type: "moto",
      width: 30,
      height: 66,
      speedMult: 1.16,
      color: "#f59e0b",
      jumpable: false,
    },
    {
      type: "barrier",
      width: 72,
      height: 28,
      speedMult: 1.05,
      color: "#f97316",
      jumpable: true,
    },
    {
      type: "pothole",
      width: 56,
      height: 34,
      speedMult: 1.05,
      color: "#1f2937",
      jumpable: true,
    },
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
    jumpable: selected.jumpable,
  });
}

function drawVehicleShadow(ctx, width, height) {
  ctx.save();
  ctx.filter = "blur(4px)";
  ctx.fillStyle = "rgba(3, 7, 12, 0.4)";
  ctx.beginPath();
  ctx.ellipse(4, 5, width * 0.52, height * 0.5, -0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCar(ctx, obs) {
  const w = obs.width;
  const h = obs.height;
  drawVehicleShadow(ctx, w, h);

  // Four visible tyres and side mirrors make the silhouette unmistakable.
  ctx.fillStyle = "#080b10";
  for (const side of [-1, 1]) {
    for (const y of [-h * 0.27, h * 0.28]) {
      ctx.beginPath();
      ctx.roundRect(side * (w / 2 - 1) - (side < 0 ? 4 : 0), y - 9, 5, 18, 2);
      ctx.fill();
    }
  }

  const bodyGradient = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  bodyGradient.addColorStop(0, shadeColor(obs.color, -46));
  bodyGradient.addColorStop(0.18, obs.color);
  bodyGradient.addColorStop(0.5, shadeColor(obs.color, 28));
  bodyGradient.addColorStop(0.82, obs.color);
  bodyGradient.addColorStop(1, shadeColor(obs.color, -48));
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.moveTo(-w * 0.34, -h / 2);
  ctx.quadraticCurveTo(0, -h / 2 - 4, w * 0.34, -h / 2);
  ctx.quadraticCurveTo(w * 0.5, -h * 0.3, w * 0.47, h * 0.35);
  ctx.quadraticCurveTo(w * 0.42, h / 2, w * 0.3, h / 2);
  ctx.lineTo(-w * 0.3, h / 2);
  ctx.quadraticCurveTo(-w * 0.42, h / 2, -w * 0.47, h * 0.35);
  ctx.quadraticCurveTo(-w * 0.5, -h * 0.3, -w * 0.34, -h / 2);
  ctx.closePath();
  ctx.fill();

  // Glass cabin with front/rear windshields and a roof highlight.
  const glass = ctx.createLinearGradient(0, -h * 0.24, 0, h * 0.26);
  glass.addColorStop(0, "#bfe7f5");
  glass.addColorStop(0.4, "#476879");
  glass.addColorStop(1, "#172b38");
  ctx.fillStyle = glass;
  ctx.beginPath();
  ctx.moveTo(-w * 0.31, -h * 0.2);
  ctx.lineTo(-w * 0.24, -h * 0.34);
  ctx.lineTo(w * 0.24, -h * 0.34);
  ctx.lineTo(w * 0.31, -h * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-w * 0.3, h * 0.22);
  ctx.lineTo(-w * 0.23, h * 0.34);
  ctx.lineTo(w * 0.23, h * 0.34);
  ctx.lineTo(w * 0.3, h * 0.22);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = shadeColor(obs.color, 12);
  ctx.beginPath();
  ctx.roundRect(-w * 0.29, -h * 0.17, w * 0.58, h * 0.36, 8);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-w * 0.2, -h * 0.12);
  ctx.lineTo(-w * 0.12, h * 0.13);
  ctx.stroke();

  ctx.fillStyle = "#f8fbdf";
  ctx.beginPath();
  ctx.roundRect(-w * 0.31, -h / 2 + 5, 10, 5, 2);
  ctx.roundRect(w * 0.31 - 10, -h / 2 + 5, 10, 5, 2);
  ctx.fill();

  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.roundRect(-w * 0.31, h / 2 - 9, 9, 5, 2);
  ctx.roundRect(w * 0.31 - 9, h / 2 - 9, 9, 5, 2);
  ctx.fill();

  ctx.fillStyle = "#dbe4e9";
  ctx.fillRect(-8, h / 2 - 6, 16, 3);
  ctx.fillStyle = shadeColor(obs.color, -60);
  ctx.fillRect(-w * 0.23, -h / 2 + 13, w * 0.46, 2);

  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.roundRect(-w / 2 - 4, -h * 0.18, 7, 10, 3);
  ctx.roundRect(w / 2 - 3, -h * 0.18, 7, 10, 3);
  ctx.fill();
}

function drawTruck(ctx, obs) {
  const w = obs.width;
  const h = obs.height;
  drawVehicleShadow(ctx, w, h);

  ctx.fillStyle = "#0a0d12";
  for (const side of [-1, 1]) {
    for (const y of [-h * 0.33, h * 0.05, h * 0.34]) {
      ctx.beginPath();
      ctx.roundRect(side * (w / 2 - 1) - (side < 0 ? 5 : 0), y - 9, 6, 18, 2);
      ctx.fill();
    }
  }

  const cargo = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  cargo.addColorStop(0, "#9ba7b3");
  cargo.addColorStop(0.2, "#eef2f5");
  cargo.addColorStop(0.5, "#ffffff");
  cargo.addColorStop(1, "#8c99a5");
  ctx.fillStyle = cargo;
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 3, -3, w - 6, h * 0.54, 4);
  ctx.fill();

  ctx.strokeStyle = "rgba(71, 85, 105, 0.45)";
  ctx.lineWidth = 1;
  for (let y = 6; y < h * 0.48; y += 13) {
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 8, y);
    ctx.lineTo(w / 2 - 8, y);
    ctx.stroke();
  }

  const cab = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  cab.addColorStop(0, "#164e63");
  cab.addColorStop(0.5, "#0891b2");
  cab.addColorStop(1, "#164e63");
  ctx.fillStyle = cab;
  ctx.beginPath();
  ctx.moveTo(-w * 0.42, -h / 2);
  ctx.quadraticCurveTo(0, -h / 2 - 3, w * 0.42, -h / 2);
  ctx.lineTo(w / 2 - 3, 4);
  ctx.lineTo(-w / 2 + 3, 4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#bde7f4";
  ctx.beginPath();
  ctx.moveTo(-w * 0.34, -h * 0.29);
  ctx.lineTo(-w * 0.27, -h * 0.42);
  ctx.lineTo(w * 0.27, -h * 0.42);
  ctx.lineTo(w * 0.34, -h * 0.29);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f8fbdf";
  ctx.beginPath();
  ctx.roundRect(-w * 0.32, -h / 2 + 6, 12, 6, 2);
  ctx.roundRect(w * 0.32 - 12, -h / 2 + 6, 12, 6, 2);
  ctx.fill();

  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.roundRect(-w / 2 - 3, -h * 0.23, 7, 12, 3);
  ctx.roundRect(w / 2 - 4, -h * 0.23, 7, 12, 3);
  ctx.fill();

  ctx.fillStyle = "#ef4444";
  ctx.fillRect(-w / 2 + 8, h * 0.49, 9, 4);
  ctx.fillRect(w / 2 - 17, h * 0.49, 9, 4);
}

function drawMotorbike(ctx, obs) {
  drawVehicleShadow(ctx, obs.width, obs.height);

  ctx.fillStyle = "#080b10";
  ctx.beginPath();
  ctx.roundRect(-4, -obs.height / 2, 8, 23, 4);
  ctx.roundRect(-4, obs.height / 2 - 23, 8, 23, 4);
  ctx.fill();

  ctx.strokeStyle = obs.color;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(0, 23);
  ctx.moveTo(-10, -20);
  ctx.lineTo(10, -20);
  ctx.stroke();

  ctx.fillStyle = shadeColor(obs.color, -35);
  ctx.beginPath();
  ctx.ellipse(0, 9, 8, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#182230";
  ctx.beginPath();
  ctx.ellipse(0, 8, 7, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = obs.color;
  ctx.beginPath();
  ctx.ellipse(0, -7, 10, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.ellipse(0, -18, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7dd3fc";
  ctx.beginPath();
  ctx.roundRect(-6, -23, 12, 4, 2);
  ctx.fill();

  ctx.fillStyle = "#fff7c2";
  ctx.beginPath();
  ctx.arc(0, -28, 3.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawBarrier(ctx, obs) {
  ctx.save();
  ctx.translate(3, 5);
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillRect(-obs.width / 2, -5, obs.width, 16);
  ctx.restore();

  ctx.fillStyle = "#111827";
  ctx.fillRect(-obs.width / 2 + 7, 7, 7, 13);
  ctx.fillRect(obs.width / 2 - 14, 7, 7, 13);

  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.roundRect(-obs.width / 2, -10, obs.width, 20, 4);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(-obs.width / 2, -10, obs.width, 20, 4);
  ctx.clip();
  ctx.strokeStyle = obs.color;
  ctx.lineWidth = 11;
  for (let x = -obs.width; x < obs.width; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, 13);
    ctx.lineTo(x + 18, -13);
    ctx.stroke();
  }
  ctx.restore();

  ctx.strokeStyle = "rgba(15, 23, 42, 0.55)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-obs.width / 2, -10, obs.width, 20, 4);
  ctx.stroke();
}

function drawPothole(ctx, obs) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.beginPath();
  ctx.ellipse(4, 5, obs.width * 0.52, obs.height * 0.44, 0, 0, Math.PI * 2);
  ctx.fill();

  const hole = ctx.createRadialGradient(-6, -4, 2, 0, 0, obs.width / 2);
  hole.addColorStop(0, "#05070a");
  hole.addColorStop(0.6, "#151a20");
  hole.addColorStop(1, "#626b73");
  ctx.fillStyle = hole;
  ctx.beginPath();
  ctx.moveTo(-obs.width / 2, -2);
  ctx.lineTo(-obs.width * 0.34, -obs.height * 0.42);
  ctx.lineTo(-4, -obs.height / 2);
  ctx.lineTo(obs.width * 0.2, -obs.height * 0.36);
  ctx.lineTo(obs.width / 2, -4);
  ctx.lineTo(obs.width * 0.38, obs.height * 0.38);
  ctx.lineTo(5, obs.height / 2);
  ctx.lineTo(-obs.width * 0.28, obs.height * 0.36);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#9aa1a8";
  ctx.lineWidth = 1;
  for (const angle of [-2.7, -1.9, -0.8, 0.2, 1.2, 2.2]) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 19, Math.sin(angle) * 11);
    ctx.lineTo(Math.cos(angle) * 31, Math.sin(angle) * 19);
    ctx.stroke();
  }
}

function drawObstacle(ctx, obs) {
  ctx.save();
  ctx.translate(obs.x, obs.y);

  if (obs.type === "car") drawCar(ctx, obs);
  else if (obs.type === "truck") drawTruck(ctx, obs);
  else if (obs.type === "moto") drawMotorbike(ctx, obs);
  else if (obs.type === "barrier") drawBarrier(ctx, obs);
  else drawPothole(ctx, obs);

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

function drawRoadSurface(ctx, canvas, pixelSpeed) {
  roadOffset = (roadOffset + pixelSpeed) % 84;

  // Narrow grass verges, kerbs and guard rails frame a textured asphalt road.
  const verge = ctx.createLinearGradient(0, 0, canvas.width, 0);
  verge.addColorStop(0, "#255d37");
  verge.addColorStop(0.06, "#448553");
  verge.addColorStop(0.94, "#448553");
  verge.addColorStop(1, "#255d37");
  ctx.fillStyle = verge;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const asphalt = ctx.createLinearGradient(10, 0, canvas.width - 10, 0);
  asphalt.addColorStop(0, "#2b3239");
  asphalt.addColorStop(0.12, "#3f4850");
  asphalt.addColorStop(0.5, "#4b545c");
  asphalt.addColorStop(0.88, "#3e474f");
  asphalt.addColorStop(1, "#292f36");
  ctx.fillStyle = asphalt;
  ctx.fillRect(10, 0, canvas.width - 20, canvas.height);

  // Asphalt aggregate and old resurfacing marks move with the road.
  ctx.fillStyle = "rgba(225, 232, 236, 0.1)";
  for (let i = 0; i < 72; i++) {
    const x = 15 + ((i * 83) % 330);
    const y = ((i * 47 + roadOffset * 7) % (canvas.height + 30)) - 15;
    const size = i % 4 === 0 ? 1.4 : 0.8;
    ctx.fillRect(x, y, size, size * 1.8);
  }

  ctx.fillStyle = "rgba(15, 23, 30, 0.08)";
  for (let i = 0; i < 5; i++) {
    const y = ((i * 151 + roadOffset * 2) % (canvas.height + 60)) - 30;
    ctx.beginPath();
    ctx.roundRect(26 + (i % 3) * 112, y, 72, 5, 3);
    ctx.fill();
  }

  // Red-and-white race kerbs.
  for (let y = -32 + (roadOffset % 32); y < canvas.height + 32; y += 32) {
    const even = Math.floor((y - roadOffset) / 32) % 2 === 0;
    ctx.fillStyle = even ? "#f8fafc" : "#dc2626";
    ctx.fillRect(5, y, 7, 24);
    ctx.fillRect(canvas.width - 12, y, 7, 24);
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(13, 0);
  ctx.lineTo(13, canvas.height);
  ctx.moveTo(canvas.width - 13, 0);
  ctx.lineTo(canvas.width - 13, canvas.height);
  ctx.stroke();

  // Metallic guard rails with moving uprights.
  ctx.strokeStyle = "#aeb8c2";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(3, 0);
  ctx.lineTo(3, canvas.height);
  ctx.moveTo(canvas.width - 3, 0);
  ctx.lineTo(canvas.width - 3, canvas.height);
  ctx.stroke();
  ctx.fillStyle = "#dbe3e9";
  for (
    let y = -50 + ((roadOffset * 1.6) % 70);
    y < canvas.height + 50;
    y += 70
  ) {
    ctx.fillRect(0, y, 6, 4);
    ctx.fillRect(canvas.width - 6, y, 6, 4);
  }

  // Lane paint has a subtle shadow so it reads on every display.
  ctx.lineWidth = 3;
  ctx.setLineDash([22, 22]);
  ctx.lineDashOffset = -roadOffset;
  ctx.strokeStyle = "rgba(5, 10, 16, 0.22)";
  ctx.beginPath();
  ctx.moveTo(121, 0);
  ctx.lineTo(121, canvas.height);
  ctx.moveTo(241, 0);
  ctx.lineTo(241, canvas.height);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.86)";
  ctx.beginPath();
  ctx.moveTo(120, 0);
  ctx.lineTo(120, canvas.height);
  ctx.moveTo(240, 0);
  ctx.lineTo(240, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  if (displaySpeed.value > 30) {
    const alpha = Math.min(0.18, (displaySpeed.value - 30) / 130);
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 1;
    for (let i = 0; i < 13; i++) {
      const x = 18 + ((i * 71) % 324);
      const y = (i * 59 + roadOffset * 5) % canvas.height;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 18);
      ctx.stroke();
    }
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
  drawRoadSurface(ctx, canvas, pixelSpeed);

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
  pedalCycle += Math.max(0.02, displaySpeed.value * 0.006);
  drawCyclist(ctx, playerX, playerY, playerConfig, jumpY, true);

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
      const canEvadeWithJump = obs.jumpable && jumpY < -15;
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
  max-width: 520px;
  min-height: 100dvh;
  margin: 0 auto;
  padding: 22px 14px;
  box-sizing: border-box;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    system-ui,
    sans-serif;
  color: #eaf2f8;
  user-select: none;
  touch-action: none;
  background:
    radial-gradient(
      circle at 18% 12%,
      rgba(20, 184, 166, 0.18),
      transparent 34%
    ),
    radial-gradient(
      circle at 82% 88%,
      rgba(59, 130, 246, 0.16),
      transparent 38%
    ),
    #07111d;
}

.screen-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    145deg,
    rgba(24, 38, 53, 0.98),
    rgba(10, 20, 32, 0.98)
  );
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 26px;
  padding: 22px;
  box-shadow:
    0 28px 60px rgba(0, 0, 0, 0.42),
    inset 0 1px rgba(255, 255, 255, 0.06);
  width: 100%;
  max-width: 410px;
  text-align: center;
}

.screen-card::before {
  content: "";
  position: absolute;
  width: 180px;
  height: 180px;
  top: -110px;
  right: -70px;
  border-radius: 50%;
  background: rgba(34, 211, 238, 0.1);
  filter: blur(2px);
}

.screen-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  text-align: left;
}

.heading-icon {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  font-size: 1.35rem;
  color: #07111d;
  background: linear-gradient(145deg, #67e8f9, #22d3ee);
  box-shadow: 0 8px 22px rgba(34, 211, 238, 0.24);
}

.screen-card h2 {
  margin: 0;
  font-size: clamp(1.25rem, 5vw, 1.55rem);
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: #f8fafc;
}

.customization-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  margin: 20px 0;
}

.preview-canvas {
  width: 100%;
  height: auto;
  aspect-ratio: 7 / 6;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  background-color: #263d30;
  box-shadow:
    0 18px 36px rgba(0, 0, 0, 0.3),
    inset 0 1px rgba(255, 255, 255, 0.12);
}

.controls-group {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 9px;
}

.control-item {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 7px;
  min-width: 0;
  padding: 10px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
}

.control-item label {
  min-height: 30px;
  font-size: 0.7rem;
  font-weight: 750;
  color: #c8d5df;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  line-height: 1.15;
  text-align: center;
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
}

.color-input {
  -webkit-appearance: none;
  appearance: none;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: 2px solid rgba(255, 255, 255, 0.75);
  border-radius: 11px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.28);
}

.color-input::-moz-color-swatch {
  border: 2px solid rgba(255, 255, 255, 0.75);
  border-radius: 11px;
}

.color-hex {
  min-width: 0;
  overflow: hidden;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.65rem;
  color: #aebdca;
  text-transform: uppercase;
  background: rgba(3, 9, 17, 0.48);
  padding: 5px 6px;
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
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.46),
    0 0 0 6px rgba(255, 255, 255, 0.035);
  background: #353d45;
  object-fit: contain;
}

/* HUD & PAUSE BUTTON */
.hud {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(6, 14, 24, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
  padding: 9px 10px;
  border-radius: 16px;
  font-size: 0.75rem;
  backdrop-filter: blur(12px) saturate(140%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.24);
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
  width: 48px;
  height: 8px;
  background: rgba(255, 255, 255, 0.16);
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
  background: rgba(255, 255, 255, 0.11);
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  color: #9eb0c0;
  margin-top: 13px;
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
  background:
    radial-gradient(
      circle at 50% 28%,
      rgba(34, 211, 238, 0.1),
      transparent 30%
    ),
    rgba(5, 12, 21, 0.94);
  border-radius: 22px;
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
  padding: 13px 16px;
  background: linear-gradient(135deg, #22d3ee, #0ea5e9);
  color: #06111d;
  font-weight: 850;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 10px 24px rgba(14, 165, 233, 0.24);
  transition:
    transform 0.18s ease,
    filter 0.18s ease,
    box-shadow 0.18s ease;
}

.btn-secondary {
  width: 100%;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.035);
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
  filter: brightness(1.08);
  transform: translateY(-1px);
  box-shadow: 0 14px 30px rgba(14, 165, 233, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
}

.btn-primary:focus-visible,
.btn-secondary:focus-visible,
.pause-btn:focus-visible,
.color-input:focus-visible {
  outline: 3px solid rgba(103, 232, 249, 0.75);
  outline-offset: 3px;
}

@media (max-width: 390px) {
  .cycling-game-container {
    padding: 10px;
  }

  .screen-card {
    padding: 16px;
    border-radius: 22px;
  }

  .controls-group {
    grid-template-columns: 1fr;
  }

  .control-item {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .control-item label {
    min-height: 0;
    justify-content: flex-start;
    text-align: left;
  }

  .color-picker-wrapper {
    width: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn-primary,
  .stamina-bar-fill {
    transition: none;
  }
}
</style>
