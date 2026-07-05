import { reactive } from "vue";
import { getDishById, getPortion, getPortionPrice } from "../data/menu";
import { AppStorage } from "../utils/storage";

const cart = reactive({
  items: [],
  totalItems: 0,
  totalPrice: 0
});

let loaded = false;

function getCartKey(dishId, portionId) {
  return `${dishId}-${portionId}`;
}

function normalizeItem(item) {
  const dish = getDishById(item?.id);
  if (!dish) return item && item.cartKey ? item : null;

  const portion = getPortion(dish, item.portionId);
  const qty = Math.max(1, Number(item.qty) || 1);
  if (!portion) return null;

  return {
    id: dish.id,
    cartKey: item.cartKey || getCartKey(dish.id, portion.id),
    name: dish.name,
    portionId: portion.id,
    portionName: portion.name,
    price: Number(item.price) || getPortionPrice(dish, portion),
    basePrice: dish.price,
    image: dish.image,
    color: dish.color,
    qty
  };
}

function recalculate() {
  cart.totalItems = cart.items.reduce((sum, item) => sum + item.qty, 0);
  cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function save() {
  recalculate();
  AppStorage.setCart(cart.items);
}

function loadCart() {
  if (loaded) return;
  cart.items = AppStorage.getCart().map(normalizeItem).filter(Boolean);
  loaded = true;
  save();
}

function addConfigured(dishId, portionId, qty = 1) {
  loadCart();
  const dish = getDishById(dishId);
  const portion = getPortion(dish, portionId);
  const amount = Math.max(1, Number(qty) || 1);
  if (!dish || !portion) return;

  const cartKey = getCartKey(dish.id, portion.id);
  const existing = cart.items.find((item) => item.cartKey === cartKey);
  if (existing) {
    existing.qty += amount;
  } else {
    cart.items.push({
      id: dish.id,
      cartKey,
      name: dish.name,
      portionId: portion.id,
      portionName: portion.name,
      price: getPortionPrice(dish, portion),
      basePrice: dish.price,
      image: dish.image,
      color: dish.color,
      qty: amount
    });
  }
  save();
}

function increase(cartKey) {
  const item = cart.items.find((entry) => entry.cartKey === cartKey);
  if (!item) return;
  item.qty += 1;
  save();
}

function decrease(cartKey) {
  const item = cart.items.find((entry) => entry.cartKey === cartKey);
  if (!item) return;
  item.qty -= 1;
  if (item.qty <= 0) {
    cart.items = cart.items.filter((entry) => entry.cartKey !== cartKey);
  }
  save();
}

function remove(cartKey) {
  cart.items = cart.items.filter((entry) => entry.cartKey !== cartKey);
  save();
}

function clearCart() {
  cart.items = [];
  save();
}

export function useCart() {
  loadCart();

  return {
    cart,
    addConfigured,
    increase,
    decrease,
    remove,
    clearCart
  };
}
