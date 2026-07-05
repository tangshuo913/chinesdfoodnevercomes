<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import CartPanel from "./components/CartPanel.vue";
import CheckoutConfirm from "./components/CheckoutConfirm.vue";
import DeliveryStatus from "./components/DeliveryStatus.vue";
import MenuList from "./components/MenuList.vue";
import OrderHistory from "./components/OrderHistory.vue";
import PromoCarousel from "./components/PromoCarousel.vue";
import { categories, dessertCategories, getDishById, getPortionPrice, menuItems } from "./data/menu";
import { useCart } from "./composables/useCart";
import { getDeliverySnapshot, startDelivery, stopDelivery } from "./composables/useDelivery";
import { useOrders } from "./composables/useOrders";
import { AppStorage } from "./utils/storage";

const selectedCategory = ref("全部");
const selectedDessertCategory = ref("全部");
const cartOpen = ref(false);
const checkoutOpen = ref(false);
const historyOpen = ref(false);
const activeDish = ref(null);
const selectedPortionId = ref("large");
const selectedDishQty = ref(1);
const selectedPaymentMethod = ref("wechat");
const paying = ref(false);
const showDishImage = ref(true);
const visibleDeliveryOrderId = ref(null);
const deliveryRemainingMs = ref(0);
const deliveryProgress = ref(0);
const now = ref(Date.now());
const toasts = ref([]);
const confettiPieces = ref([]);

const { cart, addConfigured, increase, decrease, remove, clearCart } = useCart();
const { orderState, createFromCart, getById, getActiveDeliveries } = useOrders();

let toastId = 0;
let clockId = null;
let payTimerId = null;

const paymentMethods = [
  {
    id: "wechat",
    label: "微信支付",
    icon: "微",
    description: "模拟微信即时付款"
  },
  {
    id: "alipay",
    label: "支付宝",
    icon: "支",
    description: "模拟支付宝快捷付款"
  },
  {
    id: "card",
    label: "银行卡",
    icon: "卡",
    description: "模拟银行卡扣款"
  },
  {
    id: "cash",
    label: "货到付款",
    icon: "付",
    description: "模拟送达后付款"
  }
];

const promoDishes = [...menuItems].sort(() => Math.random() - 0.5).slice(0, 5);

const filteredDishes = computed(() => {
  if (selectedCategory.value === "全部") return menuItems;
  const categoryItems = menuItems.filter((dish) => dish.category === selectedCategory.value);
  if (selectedCategory.value !== "甜品饮品" || selectedDessertCategory.value === "全部") return categoryItems;
  return categoryItems.filter((dish) => dish.dessertCategory === selectedDessertCategory.value);
});

const selectedPortion = computed(() => {
  if (!activeDish.value) return null;
  return activeDish.value.portions.find((portion) => portion.id === selectedPortionId.value) || activeDish.value.portions[0];
});

const selectedDishTotal = computed(() => {
  if (!activeDish.value || !selectedPortion.value) return 0;
  return getPortionPrice(activeDish.value, selectedPortion.value) * selectedDishQty.value;
});

const deliveryOpen = computed(() => Boolean(visibleDeliveryOrderId.value));
const visibleDeliveryOrder = computed(() => {
  if (!visibleDeliveryOrderId.value) return null;
  return getById(visibleDeliveryOrderId.value);
});

watch(
  () => activeDish.value?.image,
  () => {
    showDishImage.value = true;
  }
);

watch(selectedCategory, () => {
  selectedDessertCategory.value = "全部";
});

onMounted(() => {
  resumeActiveDelivery();
  clockId = window.setInterval(() => {
    now.value = Date.now();
    syncVisibleDeliverySnapshot();
  }, 1000);
  document.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  stopDelivery();
  if (clockId) window.clearInterval(clockId);
  if (payTimerId) window.clearTimeout(payTimerId);
  document.removeEventListener("keydown", handleKeydown);
});

function handleKeydown(event) {
  if (event.key !== "Escape") return;
  cartOpen.value = false;
  closeCheckout();
  historyOpen.value = false;
  closeDishModal();
  hideDeliveryModal();
}

function openDishModal(dishId) {
  const dish = getDishById(dishId);
  if (!dish) return;
  activeDish.value = dish;
  selectedPortionId.value = dish.defaultPortionId || "large";
  selectedDishQty.value = 1;
}

function closeDishModal() {
  activeDish.value = null;
}

function confirmDish() {
  if (!activeDish.value || !selectedPortion.value) return;
  addConfigured(activeDish.value.id, selectedPortion.value.id, selectedDishQty.value);
  closeDishModal();
  showToast("已加入购物车");
}

function openCheckout() {
  if (!cart.items.length) return;
  cartOpen.value = false;
  checkoutOpen.value = true;
}

function backToCart() {
  if (paying.value) return;
  checkoutOpen.value = false;
  cartOpen.value = true;
}

function closeCheckout() {
  if (paying.value) return;
  checkoutOpen.value = false;
}

function confirmPayment() {
  if (!cart.items.length || paying.value) return;
  paying.value = true;

  payTimerId = window.setTimeout(() => {
    const order = createFromCart(cart, selectedPaymentMethod.value);
    paying.value = false;
    payTimerId = null;
    if (!order) return;

    clearCart();
    checkoutOpen.value = false;
    showDeliveryModal(order);
    startDelivery(order.id, getDeliveryCallbacks());
    showToast("付款成功，订单已提交");
  }, 800);
}

function resumeActiveDelivery() {
  const deliveries = getActiveDeliveries();
  if (!deliveries.length) return;

  const activeId = AppStorage.getActiveDelivery();
  const activeOrder = deliveries.find((order) => order.id === activeId) || deliveries[0];
  AppStorage.setActiveDelivery(activeOrder.id);
  showDeliveryModal(activeOrder);
  startDelivery(activeOrder.id, getDeliveryCallbacks());
}

function openOrderProgress(orderId) {
  const order = getById(orderId);
  if (!order) return;

  historyOpen.value = false;
  showDeliveryModal(order);

  if (order.status === "delivering") {
    AppStorage.setActiveDelivery(order.id);
    startDelivery(order.id, getDeliveryCallbacks());
  }
}

function getDeliveryCallbacks() {
  return {
    onTick: ({ order, remainingMs, progress }) => {
      now.value = Date.now();
      if (visibleDeliveryOrderId.value === order.id) {
        deliveryRemainingMs.value = remainingMs;
        deliveryProgress.value = progress;
      }
    },
    onDelivered: (order) => {
      if (order && visibleDeliveryOrderId.value === order.id) {
        deliveryRemainingMs.value = 0;
        deliveryProgress.value = 1;
      }
      now.value = Date.now();
      launchConfetti();
      showToast("骑手已送达");
    }
  };
}

function showDeliveryModal(order) {
  visibleDeliveryOrderId.value = order.id;
  const snapshot = getDeliverySnapshot(order);
  deliveryRemainingMs.value = snapshot.remainingMs;
  deliveryProgress.value = snapshot.progress;
}

function hideDeliveryModal() {
  visibleDeliveryOrderId.value = null;
}

function viewCurrentOrder() {
  hideDeliveryModal();
  historyOpen.value = true;
}

function syncVisibleDeliverySnapshot() {
  if (!visibleDeliveryOrder.value) return;
  const snapshot = getDeliverySnapshot(visibleDeliveryOrder.value);
  deliveryRemainingMs.value = snapshot.remainingMs;
  deliveryProgress.value = snapshot.progress;
}

function showToast(message) {
  const id = toastId;
  toastId += 1;
  toasts.value.push({ id, message });
  window.setTimeout(() => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }, 2200);
}

function launchConfetti() {
  confettiPieces.value = Array.from({ length: 42 }, (_, index) => ({
    id: `${Date.now()}-${index}`,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.2}s`,
    x: `${Math.random() * 180 - 90}px`,
    r: `${Math.random() * 360}deg`
  }));

  window.setTimeout(() => {
    confettiPieces.value = [];
  }, 2200);
}
</script>

<template>
  <header class="app-header">
    <div class="brand-block">
      <span class="brand-mark" aria-hidden="true">中</span>
      <div>
        <h1>多巴胺中餐局</h1>
        <p>模拟点单体验 · 无需支付 · 纯前端保存</p>
      </div>
    </div>
    <nav class="header-actions" aria-label="快捷操作">
      <button class="icon-button" type="button" aria-label="查看订单历史" @click="historyOpen = true">
        <span aria-hidden="true">单</span>
        <span class="button-text">订单</span>
      </button>
      <button class="cart-button" type="button" aria-label="打开购物车" @click="cartOpen = true">
        <span aria-hidden="true">车</span>
        <span>购物车</span>
        <strong>{{ cart.totalItems }}</strong>
      </button>
    </nav>
  </header>

  <main>
    <PromoCarousel :dishes="promoDishes" @open-dish="openDishModal" />

    <section class="status-strip" aria-label="当前状态">
      <div>
        <span class="label">今日菜单</span>
        <strong>{{ menuItems.length }} 道菜</strong>
      </div>
      <div>
        <span class="label">配送时间</span>
        <strong>2 分钟</strong>
      </div>
      <div>
        <span class="label">历史订单</span>
        <strong>{{ orderState.orders.length }} 单</strong>
      </div>
    </section>

    <MenuList
      :categories="categories"
      :dessert-categories="dessertCategories"
      :selected-category="selectedCategory"
      :selected-dessert-category="selectedDessertCategory"
      :dishes="filteredDishes"
      :cart-items="cart.items"
      @select-category="selectedCategory = $event"
      @select-dessert-category="selectedDessertCategory = $event"
      @open-dish="openDishModal"
    />
  </main>

  <button class="floating-cart" :class="{ show: cart.totalItems > 0 }" type="button" aria-label="查看购物车" @click="cartOpen = true">
    <span>已选 <strong>{{ cart.totalItems }}</strong> 件</span>
    <span>¥{{ cart.totalPrice }}</span>
    <span>查看购物车</span>
  </button>

  <CartPanel
    :open="cartOpen"
    :cart="cart"
    @close="cartOpen = false"
    @increase="increase"
    @decrease="decrease"
    @remove="remove"
    @submit="openCheckout"
  />

  <CheckoutConfirm
    :open="checkoutOpen"
    :cart="cart"
    :payment-methods="paymentMethods"
    :payment-method="selectedPaymentMethod"
    :paying="paying"
    @close="closeCheckout"
    @back-to-cart="backToCart"
    @select-payment="selectedPaymentMethod = $event"
    @confirm-payment="confirmPayment"
  />

  <OrderHistory
    :open="historyOpen"
    :orders="orderState.orders"
    :now="now"
    @close="historyOpen = false"
    @open-order="openOrderProgress"
  />

  <section v-if="activeDish" class="dish-modal open" aria-hidden="false" aria-labelledby="dishModalTitle" @click.self="closeDishModal">
    <div class="dish-modal-card">
      <button class="close-button dish-modal-close" type="button" aria-label="关闭菜品详情" @click="closeDishModal">×</button>
      <div class="dish-detail-image" :data-color="activeDish.color">
        <img v-if="showDishImage" :src="activeDish.image" :alt="activeDish.name" loading="lazy" @error="showDishImage = false" />
        <span>{{ activeDish.name.slice(0, 1) }}</span>
      </div>
      <div class="dish-detail-body">
        <div class="dish-detail-meta">
          <span>{{ activeDish.category }}</span>
          <span>{{ activeDish.heat }}</span>
          <span>{{ activeDish.tag }}</span>
        </div>
        <h2 id="dishModalTitle">{{ activeDish.name }}</h2>
        <p>{{ activeDish.description }}</p>

        <div class="portion-block">
          <div class="option-title">
            <strong>份量</strong>
            <span>默认大份</span>
          </div>
          <div class="portion-options">
            <button
              v-for="portion in activeDish.portions"
              :key="portion.id"
              class="portion-button"
              :class="{ active: portion.id === selectedPortionId }"
              type="button"
              @click="selectedPortionId = portion.id"
            >
              <span>{{ portion.name }}</span>
              <strong>¥{{ getPortionPrice(activeDish, portion) }}</strong>
            </button>
          </div>
        </div>

        <div class="dish-modal-footer">
          <div class="modal-qty-stepper" aria-label="选择数量">
            <button type="button" aria-label="减少数量" @click="selectedDishQty = Math.max(1, selectedDishQty - 1)">-</button>
            <strong>{{ selectedDishQty }}</strong>
            <button type="button" aria-label="增加数量" @click="selectedDishQty += 1">+</button>
          </div>
          <button class="confirm-dish-button" type="button" @click="confirmDish">确认加菜 ¥{{ selectedDishTotal }}</button>
        </div>
      </div>
    </div>
  </section>

  <DeliveryStatus
    :open="deliveryOpen"
    :order="visibleDeliveryOrder"
    :remaining-ms="deliveryRemainingMs"
    :progress="deliveryProgress"
    @close="hideDeliveryModal"
    @view-history="viewCurrentOrder"
  />

  <div class="toast-stack" aria-live="polite">
    <div v-for="toast in toasts" :key="toast.id" class="toast">{{ toast.message }}</div>
  </div>

  <div class="confetti-layer" :class="{ active: confettiPieces.length }" aria-hidden="true">
    <span
      v-for="piece in confettiPieces"
      :key="piece.id"
      :style="{ left: piece.left, animationDelay: piece.delay, '--x': piece.x, '--r': piece.r }"
    ></span>
  </div>
</template>
