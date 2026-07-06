<script setup>
import { DotLottie } from "@lottiefiles/dotlottie-web";
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { formatTime } from "../composables/useDelivery";
import cookingLottieUrl from "../../assets/lottie/cooking.json?url";
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

const DELIVERY_START_PROGRESS = 0.4;
const deliverySteps = ["商家未出餐", "商家已经出餐", "配送中", "已送达"];

const cookingCanvas = ref(null);
const riderCanvas = ref(null);
let cookingAnimation = null;
let riderAnimation = null;

const isDelivered = computed(() => props.order?.status === "delivered");
const safeProgress = computed(() => Math.min(1, Math.max(0, props.progress)));
const title = computed(() => (isDelivered.value ? "订单已送达" : "订单正在配送中"));
const subtitle = computed(() => (isDelivered.value ? "订单已保存到历史记录" : "骑手正在沿途赶来，预计 2 分钟送达"));
const statusLabel = computed(() => (isDelivered.value ? "已完成" : "实时配送"));

const activeStepIndex = computed(() => {
  if (isDelivered.value || safeProgress.value >= 1) return 3;
  if (safeProgress.value >= DELIVERY_START_PROGRESS) return 2;
  if (safeProgress.value >= 0.25) return 1;
  return 0;
});

const stepItems = computed(() =>
  deliverySteps.map((label, index) => ({
    label,
    state: index < activeStepIndex.value ? "complete" : index === activeStepIndex.value ? "current" : "pending"
  }))
);

const shouldAnimateRider = computed(() => props.open && activeStepIndex.value === 2 && routeProgress.value < 1);
const shouldShowRider = computed(() => props.open && activeStepIndex.value >= 2);
const shouldShowCooking = computed(() => props.open && activeStepIndex.value === 0);

const routeProgress = computed(() => {
  if (isDelivered.value || safeProgress.value >= 1) return 1;
  if (safeProgress.value < DELIVERY_START_PROGRESS) return 0;
  return Math.min(1, (safeProgress.value - DELIVERY_START_PROGRESS) / (1 - DELIVERY_START_PROGRESS));
});

const riderPosition = computed(() => {
  const points = [
    { x: 16, y: 77 },
    { x: 30, y: 58 },
    { x: 45, y: 63 },
    { x: 56, y: 45 },
    { x: 70, y: 34 },
    { x: 84, y: 20 }
  ];

  const progress = routeProgress.value;
  const segmentSize = 1 / (points.length - 1);
  const segmentIndex = Math.min(points.length - 2, Math.floor(progress / segmentSize));
  const segmentProgress = Math.min(1, Math.max(0, (progress - segmentIndex * segmentSize) / segmentSize));
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
  "--route-remaining": 100 - Math.round(routeProgress.value * 100)
}));

watch(
  () => props.open,
  async (open) => {
    if (!open) {
      cookingAnimation?.pause();
      riderAnimation?.pause();
      return;
    }

    await nextTick();
    mountCookingAnimation();
    mountRiderAnimation();
    syncCookingPlayback();
    syncRiderPlayback();
  },
  { immediate: true }
);

watch(shouldShowCooking, () => {
  syncCookingPlayback();
});

watch(shouldAnimateRider, () => {
  syncRiderPlayback();
});

onBeforeUnmount(() => {
  cookingAnimation?.destroy();
  riderAnimation?.destroy();
  cookingAnimation = null;
  riderAnimation = null;
});

function mountCookingAnimation() {
  if (!cookingCanvas.value || cookingAnimation) return;

  cookingAnimation = new DotLottie({
    autoplay: false,
    backgroundColor: "transparent",
    canvas: cookingCanvas.value,
    layout: {
      align: [0.5, 0.5],
      fit: "contain"
    },
    loop: true,
    renderConfig: {
      autoResize: true
    },
    src: cookingLottieUrl
  });
}

function mountRiderAnimation() {
  if (!riderCanvas.value || riderAnimation) return;

  riderAnimation = new DotLottie({
    autoplay: false,
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

function syncCookingPlayback() {
  if (!cookingAnimation) return;

  if (shouldShowCooking.value) {
    cookingAnimation.play();
  } else {
    cookingAnimation.pause();
  }
}

function syncRiderPlayback() {
  if (!riderAnimation) return;

  if (shouldAnimateRider.value) {
    riderAnimation.play();
  } else {
    riderAnimation.pause();
  }
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
          <div class="cooking-lottie" :class="{ show: shouldShowCooking }">
            <canvas ref="cookingCanvas" width="112" height="112"></canvas>
          </div>
          <div class="map-pin customer-pin">
            <span>家</span>
            <strong>收货点</strong>
          </div>

          <div class="delivery-rider" :class="{ show: shouldShowRider }">
            <canvas ref="riderCanvas" width="132" height="132"></canvas>
          </div>
        </div>
      </div>

      <div class="delivery-progress-panel">
        <span>预计剩余</span>
        <strong class="timer-display">{{ formatTime(remainingMs) }}</strong>
      </div>

      <ol class="delivery-step-list" aria-label="配送状态">
        <li v-for="step in stepItems" :key="step.label" :class="step.state">
          {{ step.label }}
        </li>
      </ol>

      <div class="delivery-actions">
        <button class="secondary-button" type="button" @click="emit('view-history')">查看订单</button>
        <button class="primary-button" type="button" @click="emit('close')">订单完成</button>
      </div>
    </div>
  </section>
</template>
