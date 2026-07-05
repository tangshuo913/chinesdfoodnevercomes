<script setup>
import { DotLottie } from "@lottiefiles/dotlottie-web";
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { formatTime } from "../composables/useDelivery";
import riderLottieUrl from "../../assets/lottie/food delivery driver.lottie?url";

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  order: {
    type: Object,
    default: null
  },
  remainingMs: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(["close", "view-history"]);

const riderCanvas = ref(null);
let riderAnimation = null;

const isDelivered = computed(() => props.order?.status === "delivered");
const safeProgress = computed(() => Math.min(1, Math.max(0, props.progress)));
const title = computed(() => (isDelivered.value ? "订单已送达" : "订单正在配送中"));
const subtitle = computed(() => (isDelivered.value ? "订单已保存到历史记录" : "骑手正在沿途赶来，预计 2 分钟送达"));
const statusLabel = computed(() => (isDelivered.value ? "已完成" : "实时配送"));
const progressPercent = computed(() => `${Math.round(safeProgress.value * 100)}%`);

const riderPosition = computed(() => {
  const points = [
    { x: 16, y: 77 },
    { x: 30, y: 58 },
    { x: 45, y: 63 },
    { x: 56, y: 45 },
    { x: 70, y: 34 },
    { x: 84, y: 20 }
  ];

  const progress = isDelivered.value ? 1 : Math.min(0.96, Math.max(0.04, safeProgress.value));
  const segmentSize = 1 / (points.length - 1);
  const segmentIndex = Math.min(points.length - 2, Math.floor(progress / segmentSize));
  const segmentProgress = (progress - segmentIndex * segmentSize) / segmentSize;
  const start = points[segmentIndex];
  const end = points[segmentIndex + 1];

  return {
    x: start.x + (end.x - start.x) * segmentProgress,
    y: start.y + (end.y - start.y) * segmentProgress
  };
});

const mapStyle = computed(() => ({
  "--rider-x": `${riderPosition.value.x}%`,
  "--rider-y": `${riderPosition.value.y}%`,
  "--route-remaining": 100 - Math.round(safeProgress.value * 100)
}));

watch(
  () => props.open,
  async (open) => {
    if (!open) {
      riderAnimation?.pause();
      return;
    }

    await nextTick();
    mountRiderAnimation();
    riderAnimation?.play();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  riderAnimation?.destroy();
  riderAnimation = null;
});

function mountRiderAnimation() {
  if (!riderCanvas.value || riderAnimation) return;

  riderAnimation = new DotLottie({
    autoplay: true,
    backgroundColor: "transparent",
    canvas: riderCanvas.value,
    layout: {
      align: [0.5, 0.5],
      fit: "contain"
    },
    loop: true,
    renderConfig: {
      autoResize: true
    },
    src: riderLottieUrl
  });
}
</script>

<template>
  <section class="delivery-modal" :class="{ open }" :aria-hidden="String(!open)" aria-live="polite">
    <div class="delivery-card">
      <div class="delivery-status-head">
        <span>{{ statusLabel }}</span>
        <h2>{{ title }}</h2>
        <p>{{ subtitle }}</p>
      </div>

      <div class="delivery-map-card" :class="{ delivered: isDelivered }" :style="mapStyle" aria-hidden="true">
        <div class="delivery-map-stage">
          <svg class="delivery-map-svg" viewBox="0 0 360 280">
            <path class="map-road map-road-wide" d="M18 70 C92 42 132 74 190 50 S278 28 346 62" />
            <path class="map-road" d="M26 210 C92 184 128 206 184 178 S282 152 338 174" />
            <path class="map-road map-road-soft" d="M62 18 C72 74 58 124 92 164 S130 226 112 266" />
            <path class="map-road map-road-soft" d="M274 18 C252 74 278 118 244 166 S220 220 250 264" />
            <path class="delivery-route-base" pathLength="100" d="M58 222 C92 166 126 190 162 132 S256 78 306 56" />
            <path class="delivery-route-live" pathLength="100" d="M58 222 C92 166 126 190 162 132 S256 78 306 56" />
          </svg>

          <div class="map-pin restaurant-pin">
            <span>店</span>
            <strong>商家</strong>
          </div>
          <div class="map-pin customer-pin">
            <span>家</span>
            <strong>收货点</strong>
          </div>

          <div class="delivery-rider">
            <canvas ref="riderCanvas" width="132" height="132"></canvas>
          </div>
        </div>
      </div>

      <div class="delivery-progress-panel">
        <div>
          <span>预计剩余</span>
          <strong class="timer-display">{{ formatTime(remainingMs) }}</strong>
        </div>
        <div>
          <span>配送进度</span>
          <strong>{{ progressPercent }}</strong>
        </div>
      </div>

      <div class="progress-track">
        <div class="progress-bar" :style="{ width: progressPercent }"></div>
      </div>
      <div class="delivery-actions">
        <button class="secondary-button" type="button" @click="emit('view-history')">查看订单</button>
        <button class="primary-button" type="button" @click="emit('close')">先去逛逛</button>
      </div>
    </div>
  </section>
</template>
