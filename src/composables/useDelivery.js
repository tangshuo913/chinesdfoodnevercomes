import { DELIVERY_MS, useOrders } from "./useOrders";

let timerId = null;
let activeOrderId = null;

export function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function getDeliverySnapshot(order) {
  if (!order || order.status === "delivered") {
    return { remainingMs: 0, progress: 1 };
  }

  const now = Date.now();
  const startedAt = new Date(order.deliveryStartedAt).getTime();
  const endsAt = new Date(order.deliveryEndsAt).getTime();
  if (Number.isNaN(startedAt) || Number.isNaN(endsAt)) {
    return { remainingMs: DELIVERY_MS, progress: 0 };
  }

  const totalMs = Math.max(endsAt - startedAt, DELIVERY_MS);
  const remainingMs = Math.max(endsAt - now, 0);
  const elapsedMs = Math.min(totalMs, Math.max(now - startedAt, 0));
  const progress = totalMs ? Math.min(elapsedMs / totalMs, 1) : 1;
  return { remainingMs, progress };
}

function tick(callbacks = {}) {
  const { getById, markDelivered } = useOrders();
  const order = getById(activeOrderId);
  if (!order) {
    stopDelivery();
    return;
  }

  const snapshot = getDeliverySnapshot(order);
  callbacks.onTick?.({
    order,
    remainingMs: snapshot.remainingMs,
    progress: snapshot.progress
  });

  if (snapshot.remainingMs <= 0) {
    const completedOrder = markDelivered(order.id);
    callbacks.onDelivered?.(completedOrder || order);
    stopDelivery();
  }
}

export function startDelivery(orderId, callbacks) {
  stopDelivery();
  activeOrderId = orderId;
  tick(callbacks);
  timerId = window.setInterval(() => tick(callbacks), 1000);
}

export function stopDelivery() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
  activeOrderId = null;
}
