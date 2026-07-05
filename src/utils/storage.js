const keys = {
  cart: "dopamine-food-cart-v1",
  orders: "dopamine-food-orders-v1",
  activeDelivery: "dopamine-food-active-delivery-v1"
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn("Local storage read failed:", error);
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Local storage write failed:", error);
  }
}

function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Local storage remove failed:", error);
  }
}

export const AppStorage = {
  keys,
  getCart: () => read(keys.cart, []),
  setCart: (cart) => write(keys.cart, cart),
  getOrders: () => read(keys.orders, []),
  setOrders: (orders) => write(keys.orders, orders),
  getActiveDelivery: () => read(keys.activeDelivery, null),
  setActiveDelivery: (orderId) => write(keys.activeDelivery, orderId),
  clearActiveDelivery: () => remove(keys.activeDelivery)
};
