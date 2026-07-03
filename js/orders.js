(function () {
  const DELIVERY_MS = 120000;
  let orders = [];

  function load() {
    orders = AppStorage.getOrders();
    reconcileDeliveryState();
    return orders;
  }

  function save() {
    AppStorage.setOrders(orders);
    document.dispatchEvent(new CustomEvent("orders:changed", { detail: getOrders() }));
  }

  function createFromCart(cartState) {
    if (!cartState.items.length) return null;

    const now = Date.now();
    const order = {
      id: `order-${now}`,
      createdAt: new Date(now).toISOString(),
      deliveryStartedAt: new Date(now).toISOString(),
      deliveryEndsAt: new Date(now + DELIVERY_MS).toISOString(),
      deliveredAt: null,
      status: "delivering",
      items: cartState.items,
      total: cartState.totalPrice
    };

    orders.unshift(order);
    AppStorage.setActiveDelivery(order.id);
    save();
    return { ...order };
  }

  function reconcileDeliveryState() {
    const now = Date.now();
    let changed = false;

    orders = orders.map((order) => {
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
      const active = orders.find((order) => order.id === activeId);
      if (!active || active.status === "delivered") {
        AppStorage.clearActiveDelivery();
      }
    }

    if (changed) {
      AppStorage.setOrders(orders);
    }
  }

  function markDelivered(orderId) {
    let completedOrder = null;
    orders = orders.map((order) => {
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
    save();
    return completedOrder;
  }

  function getOrders() {
    return orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({ ...item }))
    }));
  }

  function getById(orderId) {
    const order = orders.find((entry) => entry.id === orderId);
    return order ? { ...order, items: order.items.map((item) => ({ ...item })) } : null;
  }

  function getActiveDeliveries() {
    reconcileDeliveryState();
    return getOrders().filter((order) => order.status === "delivering");
  }

  window.OrderStore = {
    DELIVERY_MS,
    load,
    createFromCart,
    markDelivered,
    getOrders,
    getById,
    getActiveDeliveries
  };
})();
