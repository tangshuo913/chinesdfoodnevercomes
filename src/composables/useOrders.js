import { reactive } from "vue";
import { AppStorage } from "../utils/storage";

export const DELIVERY_MS = 120000;

const orderState = reactive({
  orders: []
});

let loaded = false;

function cloneOrder(order) {
  return {
    ...order,
    items: order.items.map((item) => ({ ...item }))
  };
}

function saveOrders() {
  AppStorage.setOrders(orderState.orders);
}

function reconcileDeliveryState() {
  const now = Date.now();
  let changed = false;

  orderState.orders = orderState.orders.map((order) => {
    if (order.status !== "delivering") return order;
    const endTime = new Date(order.deliveryEndsAt).getTime();
    if (Number.isNaN(endTime) || endTime > now) return order;
    changed = true;
    return {
      ...order,
      status: "delivered",
      deliveredAt: new Date(endTime || now).toISOString()
    };
  });

  const activeId = AppStorage.getActiveDelivery();
  if (activeId) {
    const active = orderState.orders.find((order) => order.id === activeId);
    if (!active || active.status === "delivered") {
      AppStorage.clearActiveDelivery();
    }
  }

  if (changed) saveOrders();
}

function loadOrders() {
  if (loaded) return;
  orderState.orders = AppStorage.getOrders();
  loaded = true;
  reconcileDeliveryState();
}

function createFromCart(cartState, paymentMethod) {
  if (!cartState.items.length) return null;

  const now = Date.now();
  const order = {
    id: `order-${now}`,
    createdAt: new Date(now).toISOString(),
    paidAt: new Date(now).toISOString(),
    paymentMethod,
    paymentStatus: "paid",
    deliveryStartedAt: new Date(now).toISOString(),
    deliveryEndsAt: new Date(now + DELIVERY_MS).toISOString(),
    deliveredAt: null,
    status: "delivering",
    items: cartState.items.map((item) => ({ ...item })),
    total: cartState.totalPrice
  };

  orderState.orders.unshift(order);
  AppStorage.setActiveDelivery(order.id);
  saveOrders();
  return cloneOrder(order);
}

function markDelivered(orderId) {
  let completedOrder = null;
  orderState.orders = orderState.orders.map((order) => {
    if (order.id !== orderId || order.status === "delivered") return order;
    completedOrder = {
      ...order,
      status: "delivered",
      deliveredAt: new Date().toISOString()
    };
    return completedOrder;
  });

  if (AppStorage.getActiveDelivery() === orderId) {
    AppStorage.clearActiveDelivery();
  }
  saveOrders();
  return completedOrder ? cloneOrder(completedOrder) : null;
}

function getById(orderId) {
  const order = orderState.orders.find((entry) => entry.id === orderId);
  return order ? cloneOrder(order) : null;
}

function getActiveDeliveries() {
  reconcileDeliveryState();
  return orderState.orders.filter((order) => order.status === "delivering").map(cloneOrder);
}

export function useOrders() {
  loadOrders();

  return {
    orderState,
    createFromCart,
    markDelivered,
    getById,
    getActiveDeliveries
  };
}
