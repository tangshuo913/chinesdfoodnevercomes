<script setup>
import OrderCard from "./OrderCard.vue";

defineProps({
  open: {
    type: Boolean,
    default: false
  },
  orders: {
    type: Array,
    default: () => []
  },
  now: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(["close", "open-order"]);
</script>

<template>
  <aside class="drawer" :class="{ open }" :aria-hidden="String(!open)" aria-labelledby="historyTitle" @click.self="emit('close')">
    <div class="drawer-panel">
      <div class="drawer-header">
        <div>
          <h2 id="historyTitle">订单历史</h2>
          <p>配送中和已完成订单都会保存在浏览器。</p>
        </div>
        <button class="close-button" type="button" aria-label="关闭订单历史" @click="emit('close')">×</button>
      </div>

      <div class="drawer-content order-list">
        <div v-if="!orders.length" class="empty-state">
          <strong>暂无订单</strong>
          <p>提交订单后，配送中和已完成记录会出现在这里。</p>
        </div>
        <OrderCard v-for="order in orders" v-else :key="order.id" :order="order" :now="now" @open="emit('open-order', $event)" />
      </div>
    </div>
  </aside>
</template>
