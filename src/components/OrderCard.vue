<script setup>
import { computed } from "vue";

const props = defineProps({
  order: {
    type: Object,
    required: true
  },
  now: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(["open"]);

const statusText = computed(() => (props.order.status === "delivered" ? "已送达" : "配送中"));
const statusClass = computed(() => (props.order.status === "delivered" ? "delivered" : "delivering"));
const itemText = computed(() =>
  props.order.items
    .map((item) => `${item.name}${item.portionName ? `（${item.portionName}）` : ""} × ${item.qty}`)
    .join("、")
);
const itemCount = computed(() => props.order.items.reduce((sum, item) => sum + item.qty, 0));
const paymentText = computed(() => {
  const labels = {
    wechat: "微信支付",
    alipay: "支付宝",
    card: "银行卡",
    cash: "货到付款"
  };
  return labels[props.order.paymentMethod] || "模拟支付";
});
const footText = computed(() => {
  if (props.order.status === "delivered") {
    return props.order.deliveredAt ? `送达 ${formatDate(props.order.deliveredAt)}` : "已完成";
  }
  const remaining = Math.max(new Date(props.order.deliveryEndsAt).getTime() - props.now, 0);
  return `剩余 ${formatTime(remaining)}`;
});

function formatDate(isoString) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(isoString));
}

function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}
</script>

<template>
  <article class="order-card" :class="statusClass" role="button" tabindex="0" @click="emit('open', order.id)" @keydown.enter.prevent="emit('open', order.id)" @keydown.space.prevent="emit('open', order.id)">
    <div class="order-card-head">
      <div>
        <h3>{{ statusText }}</h3>
        <time :datetime="order.createdAt">{{ formatDate(order.createdAt) }}</time>
      </div>
      <strong>¥{{ order.total }}</strong>
    </div>
    <p>{{ itemText }}</p>
    <div class="order-card-foot">
      <span>{{ itemCount }} 件菜品</span>
      <span>{{ paymentText }}</span>
      <span>{{ footText }}</span>
    </div>
  </article>
</template>
