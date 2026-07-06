<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from "vue";

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  durationSeconds: {
    type: Number,
    default: 15
  }
});

const emit = defineEmits(["complete", "skip", "cancel"]);

const videoRef = ref(null);
const canvasRef = ref(null);
const status = ref("idle");
const errorMessage = ref("");
const score = ref(0);
const timeLeft = ref(0);
const normalCount = ref(0);
const bombCount = ref(0);
const impactFeedback = ref("");
const isShaking = ref(false);

let handLandmarker = null;
let handLandmarkerPromise = null;
let stream = null;
let rafId = 0;
let startAt = 0;
let lastVideoTime = -1;
let packetState = [];
let effectState = [];
let finishing = false;
let normalStreak = 0;
let shakeTimerId = null;
let feedbackTimerId = null;

watch(
  () => props.open,
  (open) => {
    if (open) {
      startGame();
    } else {
      cleanupCamera();
    }
  }
);

onBeforeUnmount(() => {
  cleanupCamera();
  if (handLandmarker) {
    handLandmarker.close();
    handLandmarker = null;
  }
});

async function startGame() {
  cleanupCamera();
  await nextTick();

  status.value = "loading";
  errorMessage.value = "";
  score.value = 0;
  normalCount.value = 0;
  bombCount.value = 0;
  impactFeedback.value = "";
  timeLeft.value = props.durationSeconds;
  finishing = false;
  lastVideoTime = -1;
  effectState = [];
  normalStreak = 0;
  resetPackets();
  drawWaitingFrame();

  try {
    status.value = "loadingCamera";
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    });

    const video = videoRef.value;
    if (!video) return;
    video.srcObject = stream;
    video.muted = true;
    video.setAttribute("playsinline", "");
    await video.play();
    await waitForVideo(video);
    await waitForVideoFrame(video);
    clearGameCanvas();

    status.value = "loadingModel";
    handLandmarker = await getHandLandmarker();

    startAt = performance.now();
    status.value = "playing";
    rafId = window.requestAnimationFrame(tick);
  } catch (error) {
    cleanupCamera();
    status.value = "error";
    errorMessage.value = getCameraErrorMessage(error);
    console.error(error);
  }
}

function waitForVideo(video) {
  if (isVideoReady(video)) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("摄像头画面加载超时"));
    }, 8000);

    function cleanup() {
      window.clearTimeout(timeoutId);
      video.removeEventListener("loadedmetadata", handleReady);
      video.removeEventListener("canplay", handleReady);
      video.removeEventListener("error", handleError);
    }

    function handleReady() {
      if (!isVideoReady(video)) return;
      cleanup();
      resolve();
    }

    function handleError() {
      cleanup();
      reject(new Error("摄像头画面读取失败"));
    }

    video.addEventListener("loadedmetadata", handleReady);
    video.addEventListener("canplay", handleReady);
    video.addEventListener("error", handleError);
  });
}

function waitForVideoFrame(video) {
  if ("requestVideoFrameCallback" in video) {
    return new Promise((resolve) => {
      video.requestVideoFrameCallback(() => resolve());
    });
  }

  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(resolve);
    });
  });
}

function isVideoReady(video) {
  return video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0;
}

function getCameraErrorMessage(error) {
  const name = error?.name || "";
  if (name === "NotAllowedError") return "摄像头权限被拒绝了，可以在浏览器地址栏权限里允许摄像头后重试。";
  if (name === "NotFoundError") return "没有检测到可用摄像头。";
  if (name === "NotReadableError") return "摄像头可能正在被其他软件占用，关闭占用后再重试。";
  if (!navigator.mediaDevices?.getUserMedia) return "当前浏览器不支持摄像头调用。";
  return "摄像头或手势识别启动失败，可以检查浏览器权限后重试。";
}

async function getHandLandmarker() {
  if (handLandmarker) return handLandmarker;
  if (!handLandmarkerPromise) {
    handLandmarkerPromise = import("@mediapipe/tasks-vision").then(async ({ FilesetResolver, HandLandmarker }) => {
      const vision = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
      return HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "/models/hand_landmarker.task"
        },
        runningMode: "VIDEO",
        numHands: 1
      });
    });
  }
  handLandmarker = await handLandmarkerPromise;
  return handLandmarker;
}

function tick(now) {
  if (!props.open || status.value !== "playing") return;

  const canvas = canvasRef.value;
  const video = videoRef.value;
  const ctx = canvas?.getContext("2d");
  if (!canvas || !video || !ctx) return;

  const elapsed = (now - startAt) / 1000;
  const remaining = Math.max(0, props.durationSeconds - elapsed);
  timeLeft.value = Math.ceil(remaining);

  clearOverlay(ctx, canvas);
  updatePackets(canvas, elapsed);
  updateEffects();

  const pinchPoint = getPinchPoint(video, canvas, now);
  if (pinchPoint) {
    catchPacket(pinchPoint);
  }

  drawPackets(ctx);
  drawEffects(ctx);

  if (pinchPoint) {
    drawHandCursor(ctx, pinchPoint);
  }

  if (remaining <= 0) {
    completeGame();
    return;
  }

  rafId = window.requestAnimationFrame(tick);
}

function getPinchPoint(video, canvas, now) {
  if (!handLandmarker || video.readyState < 2 || video.currentTime === lastVideoTime) return null;

  lastVideoTime = video.currentTime;
  const result = handLandmarker.detectForVideo(video, now);
  const landmarks = result.landmarks?.[0];
  if (!landmarks) return null;

  const thumb = toCanvasPoint(landmarks[4], canvas);
  const index = toCanvasPoint(landmarks[8], canvas);
  const distance = Math.hypot(thumb.x - index.x, thumb.y - index.y);
  if (distance > 44) return null;

  return {
    x: (thumb.x + index.x) / 2,
    y: (thumb.y + index.y) / 2
  };
}

function toCanvasPoint(point, canvas) {
  return {
    x: (1 - point.x) * canvas.width,
    y: point.y * canvas.height
  };
}

function catchPacket(point) {
  const packet = packetState.find((entry) => {
    if (entry.caught) return false;
    const hitSize = entry.size * 0.72;
    return Math.abs(point.x - entry.x) <= hitSize && Math.abs(point.y - entry.y) <= hitSize;
  });

  if (!packet) return;
  packet.caught = true;
  if (packet.type === "bomb") {
    bombCount.value += 1;
    score.value = Math.max(0, score.value - 3);
    normalStreak = 0;
    triggerExplosion(packet.x, packet.y);
    triggerShake();
    showImpact("-3");
  } else {
    normalCount.value += 1;
    score.value += 1;
    normalStreak += 1;
    showImpact("+1");
  }
  Object.assign(packet, createPacket(true));
}

function resetPackets() {
  packetState = Array.from({ length: 5 }, () => createPacket(false));
}

function createPacket(fromTop) {
  const elapsedSeconds = status.value === "playing" ? (performance.now() - startAt) / 1000 : 0;
  const bombChance = getBombChance(elapsedSeconds);
  return {
    x: randomBetween(70, 570),
    y: fromTop ? randomBetween(-140, -40) : randomBetween(70, 390),
    size: randomBetween(38, 54),
    speed: randomBetween(36, 70),
    sway: randomBetween(16, 42),
    phase: randomBetween(0, Math.PI * 2),
    type: Math.random() < bombChance ? "bomb" : "normal",
    caught: false
  };
}

function getBombChance(elapsedSeconds) {
  let phaseChance = 0.1;
  if (elapsedSeconds >= 10) {
    phaseChance = 0.35;
  } else if (elapsedSeconds >= 5) {
    phaseChance = 0.22;
  }

  let streakBonus = 0;
  if (normalStreak >= 5) {
    streakBonus = 0.18;
  } else if (normalStreak >= 3) {
    streakBonus = 0.1;
  }

  return Math.min(0.48, phaseChance + streakBonus);
}

function updatePackets(canvas, elapsed) {
  packetState.forEach((packet) => {
    if (packet.caught) return;
    packet.y += packet.speed / 60;
    packet.x += Math.sin(elapsed * 2.2 + packet.phase) * 0.45;
    if (packet.y > canvas.height + packet.size) {
      Object.assign(packet, createPacket(true));
    }
  });
}

function drawWaitingFrame() {
  const canvas = canvasRef.value;
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;
  drawGameBackdrop(ctx, canvas);
  drawPackets(ctx);
}

function clearGameCanvas() {
  const canvas = canvasRef.value;
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;
  clearOverlay(ctx, canvas);
}

function clearOverlay(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawGameBackdrop(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#fff8fa");
  gradient.addColorStop(1, "#eaf3ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPackets(ctx) {
  packetState.forEach((packet) => {
    if (packet.caught) return;
    drawPacket(ctx, packet.x, packet.y, packet.size);
  });
}

function drawPacket(ctx, x, y, size) {
  const width = size * 0.76;
  const height = size;
  const left = x - width / 2;
  const top = y - height / 2;

  ctx.save();
  ctx.shadowColor = "rgba(213, 22, 38, 0.34)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 8;
  roundedRect(ctx, left, top, width, height, 8);
  ctx.fillStyle = "#e72435";
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#b90f1f";
  ctx.beginPath();
  ctx.moveTo(left + 6, top + 10);
  ctx.lineTo(x, top + height * 0.42);
  ctx.lineTo(left + width - 6, top + 10);
  ctx.lineTo(left + width - 6, top + height * 0.54);
  ctx.lineTo(x, top + height * 0.72);
  ctx.lineTo(left + 6, top + height * 0.54);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fff6e8";
  ctx.font = `${Math.max(16, size * 0.36)}px Microsoft YaHei, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("¥", x, top + height * 0.42);
  ctx.restore();
}

function triggerExplosion(x, y) {
  const colors = ["#ff4f1f", "#ffb648", "#e72435", "#2b2024"];
  effectState.push({
    type: "ring",
    x,
    y,
    radius: 14,
    life: 20,
    maxLife: 20
  });

  for (let index = 0; index < 22; index += 1) {
    const angle = (Math.PI * 2 * index) / 22 + randomBetween(-0.14, 0.14);
    const speed = randomBetween(3.5, 8.8);
    effectState.push({
      type: "spark",
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: randomBetween(3, 7),
      life: randomBetween(18, 34),
      maxLife: 34,
      color: colors[index % colors.length]
    });
  }
}

function updateEffects() {
  effectState = effectState
    .map((effect) => {
      if (effect.type === "ring") {
        return {
          ...effect,
          radius: effect.radius + 5,
          life: effect.life - 1
        };
      }

      return {
        ...effect,
        x: effect.x + effect.vx,
        y: effect.y + effect.vy,
        vy: effect.vy + 0.18,
        vx: effect.vx * 0.96,
        life: effect.life - 1
      };
    })
    .filter((effect) => effect.life > 0);
}

function drawEffects(ctx) {
  effectState.forEach((effect) => {
    const alpha = Math.max(effect.life / effect.maxLife, 0);
    ctx.save();
    ctx.globalAlpha = alpha;

    if (effect.type === "ring") {
      ctx.strokeStyle = "#ffb648";
      ctx.lineWidth = 8 * alpha;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = effect.color;
      ctx.translate(effect.x, effect.y);
      ctx.rotate(effect.life);
      ctx.fillRect(-effect.size / 2, -effect.size / 2, effect.size, effect.size * 1.8);
    }

    ctx.restore();
  });
}

function triggerShake() {
  isShaking.value = false;
  window.requestAnimationFrame(() => {
    isShaking.value = true;
  });

  if (shakeTimerId) window.clearTimeout(shakeTimerId);
  shakeTimerId = window.setTimeout(() => {
    isShaking.value = false;
    shakeTimerId = null;
  }, 520);
}

function showImpact(text) {
  impactFeedback.value = text;
  if (feedbackTimerId) window.clearTimeout(feedbackTimerId);
  feedbackTimerId = window.setTimeout(() => {
    impactFeedback.value = "";
    feedbackTimerId = null;
  }, 680);
}

function drawHandCursor(ctx, point) {
  ctx.save();
  ctx.strokeStyle = "#2f80ed";
  ctx.lineWidth = 4;
  ctx.fillStyle = "rgba(47, 128, 237, 0.16)";
  ctx.beginPath();
  ctx.arc(point.x, point.y, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function completeGame() {
  if (finishing) return;
  finishing = true;
  cleanupCamera();
  status.value = "result";
}

function skipGame() {
  cleanupCamera();
  emit("skip");
}

function applyDiscount() {
  cleanupCamera();
  emit("complete", score.value);
}

function restartGame() {
  startGame();
}

function cancelGame() {
  cleanupCamera();
  emit("cancel");
}

function cleanupCamera() {
  if (rafId) {
    window.cancelAnimationFrame(rafId);
    rafId = 0;
  }
  if (shakeTimerId) {
    window.clearTimeout(shakeTimerId);
    shakeTimerId = null;
  }
  if (feedbackTimerId) {
    window.clearTimeout(feedbackTimerId);
    feedbackTimerId = null;
  }
  isShaking.value = false;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
  const video = videoRef.value;
  if (video) {
    video.pause();
    video.srcObject = null;
  }
}
</script>

<template>
  <section
    v-if="open"
    class="red-packet-modal open"
    aria-hidden="false"
    aria-labelledby="redPacketTitle"
    @click.self="cancelGame"
  >
    <div class="red-packet-card" :class="{ shake: isShaking }">
      <div class="red-packet-head">
        <div>
          <span>抓到几个减几元</span>
          <h2 id="redPacketTitle">手抓红包</h2>
        </div>
        <button class="close-button" type="button" aria-label="取消付款" @click="cancelGame">×</button>
      </div>

      <div class="red-packet-scorebar">
        <strong>已减 ¥{{ score }}</strong>
        <em v-if="impactFeedback" :class="{ penalty: impactFeedback.startsWith('-') }">{{ impactFeedback }}</em>
        <span>{{ timeLeft }}s</span>
      </div>

      <div class="red-packet-stage">
        <video ref="videoRef" class="red-packet-video" playsinline muted></video>
        <canvas ref="canvasRef" width="640" height="480" aria-label="手抓红包小游戏画面"></canvas>
        <div v-if="status === 'loadingCamera'" class="red-packet-state">
          <strong>正在开启摄像头</strong>
          <span>摄像头画面出现后才会开始倒计时</span>
        </div>
        <div v-if="status === 'loadingModel'" class="red-packet-state">
          <strong>正在加载手势识别</strong>
          <span>捏合拇指和食指抓住红包</span>
        </div>
        <div v-if="status === 'error'" class="red-packet-state error">
          <strong>暂时无法识别手势</strong>
          <span>{{ errorMessage }}</span>
        </div>
        <div v-if="status === 'result'" class="red-packet-result">
          <span>普通红包 {{ normalCount }} 个 · 炸弹 {{ bombCount }} 个</span>
          <strong>¥{{ score }}</strong>
          <p>本单立减 ¥{{ score }}，确认后再付款</p>
        </div>
      </div>

      <div v-if="status !== 'result'" class="red-packet-actions">
        <button class="secondary-button" type="button" @click="cancelGame">取消付款</button>
        <button class="primary-button" type="button" @click="skipGame">跳过并原价支付</button>
      </div>
      <div v-else class="red-packet-actions">
        <button class="secondary-button" type="button" @click="restartGame">重新挑战</button>
        <button class="primary-button" type="button" @click="applyDiscount">使用红包付款</button>
      </div>
    </div>
  </section>
</template>
