<script setup>
import PaymentMethod from "./PaymentMethod.vue";

defineProps({
  open: {
    type: Boolean,
    default: false
  },
  cart: {
    type: Object,
    required: true
  },
  paymentMethods: {
    type: Array,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paying: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["close", "back-to-cart", "select-payment", "confirm-payment"]);
</script>

<template>
  <section class="checkout-modal" :class="{ open }" :aria-hidden="String(!open)" aria-labelledby="checkoutTitle" @click.self="emit('close')">
    <div class="checkout-panel">
      <div class="drawer-header">
        <div>
          <h2 id="checkoutTitle">确认订单</h2>
          <p>核对菜品和付款方式后进入配送。</p>
        </div>
        <button class="close-button" type="button" aria-label="关闭订单确认" :disabled="paying" @click="emit('close')">×</button>
      </div>

      <div class="checkout-content">
        <section class="checkout-section" aria-labelledby="checkoutItemsTitle">
          <div class="checkout-section-title">
            <h3 id="checkoutItemsTitle">订单明细</h3>
            <span>{{ cart.totalItems }} 件</span>
          </div>

          <div class="checkout-items">
            <article v-for="item in cart.items" :key="item.cartKey" class="checkout-item">
              <div>
                <h4>{{ item.name }}</h4>
                <p>{{ item.portionName || "默认" }} · ¥{{ item.price }} × {{ item.qty }}</p>
              </div>
              <strong>¥{{ item.price * item.qty }}</strong>
            </article>
          </div>
        </section>

        <section class="checkout-section" aria-labelledby="paymentTitle">
          <div class="checkout-section-title">
            <h3 id="paymentTitle">付款方式</h3>
          </div>
          <PaymentMethod :model-value="paymentMethod" :methods="paymentMethods" @update:model-value="emit('select-payment', $event)" />
        </section>
      </div>

      <div class="checkout-footer">
        <div class="total-row">
          <span>应付合计</span>
          <strong>¥{{ cart.totalPrice }}</strong>
        </div>
        <div class="checkout-actions">
          <button class="secondary-button" type="button" :disabled="paying" @click="emit('back-to-cart')">返回购物车</button>
          <button class="primary-button" type="button" :disabled="paying || cart.totalItems === 0" @click="emit('confirm-payment')">
            {{ paying ? "付款中..." : "确认付款" }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
