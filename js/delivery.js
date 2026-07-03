(function () {
  let timerId = null;
  let activeOrderId = null;

  function start(orderId, callbacks) {
    stop();
    activeOrderId = orderId;
    tick(callbacks);
    timerId = window.setInterval(() => tick(callbacks), 1000);
  }

  function stop() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
    activeOrderId = null;
  }

  function tick(callbacks) {
    const order = OrderStore.getById(activeOrderId);
    if (!order) {
      stop();
      return;
    }

    const now = Date.now();
    const startedAt = new Date(order.deliveryStartedAt).getTime();
    const endsAt = new Date(order.deliveryEndsAt).getTime();
    const totalMs = Math.max(endsAt - startedAt, OrderStore.DELIVERY_MS);
    const remainingMs = Math.max(endsAt - now, 0);
    const elapsedMs = Math.min(totalMs, Math.max(now - startedAt, 0));
    const progress = totalMs ? Math.min(elapsedMs / totalMs, 1) : 1;

    callbacks.onTick({
      order,
      remainingMs,
      progress
    });

    if (remainingMs <= 0) {
      const completedOrder = OrderStore.markDelivered(order.id);
      callbacks.onDelivered(completedOrder || order);
      stop();
    }
  }

  function formatTime(ms) {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  window.DeliveryTimer = {
    start,
    stop,
    formatTime
  };
})();
