<script setup>
import CartItem from "./CartItem.vue";

defineProps({
  open: {
    type: Boolean,
    default: false
  },
  cart: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["close", "increase", "decrease", "remove", "submit"]);
</script>

<template>
  <aside class="drawer" :class="{ open }" :aria-hidden="String(!open)" aria-labelledby="cartTitle" @click.self="emit('close')">
    <div class="drawer-panel">
      <div class="drawer-header">
        <div>
          <h2 id="cartTitle">购物车</h2>
          <p>{{ cart.totalItems ? `${cart.totalItems} 件菜品` : "还没有选择菜品" }}</p>
        </div>
        <button class="close-button" type="button" aria-label="关闭购物车" @click="emit('close')">×</button>
      </div>

      <div class="drawer-content">
        <div v-if="!cart.items.length" class="empty-state">
          <strong>购物车是空的</strong>
          <p>从菜单里添加几道菜后就可以提交模拟订单。</p>
        </div>
        <CartItem
          v-for="item in cart.items"
          v-else
          :key="item.cartKey"
          :item="item"
          @increase="emit('increase', $event)"
          @decrease="emit('decrease', $event)"
          @remove="emit('remove', $event)"
        />
      </div>

      <div class="cart-footer">
        <div class="total-row">
          <span>合计</span>
          <strong>¥{{ cart.totalPrice }}</strong>
        </div>
        <button class="primary-button" type="button" :disabled="cart.totalItems === 0" @click="emit('submit')">
          去结算
        </button>
      </div>
    </div>
  </aside>
</template>
