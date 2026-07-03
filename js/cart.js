(function () {
  let cart = [];

  function load() {
    cart = AppStorage.getCart().map(normalizeItem).filter(Boolean);
    AppStorage.setCart(cart);
    return cart;
  }

  function save() {
    AppStorage.setCart(cart);
    document.dispatchEvent(new CustomEvent("cart:changed", { detail: getState() }));
  }

  function findDish(dishId) {
    return DOPAMINE_DISHES.find((dish) => dish.id === dishId);
  }

  function getPortion(dish, portionId) {
    if (!dish) return null;
    const preferredId = portionId || dish.defaultPortionId || "large";
    return dish.portions.find((portion) => portion.id === preferredId) || dish.portions[0];
  }

  function getConfiguredPrice(dish, portion) {
    return Math.max(1, dish.price + portion.priceDelta);
  }

  function getCartKey(dishId, portionId) {
    return `${dishId}-${portionId}`;
  }

  function normalizeItem(item) {
    const dish = findDish(item.id);
    if (!dish) return item && item.cartKey ? item : null;
    const portion = getPortion(dish, item.portionId);
    const qty = Math.max(1, Number(item.qty) || 1);

    return {
      id: dish.id,
      cartKey: item.cartKey || getCartKey(dish.id, portion.id),
      name: dish.name,
      portionId: portion.id,
      portionName: portion.name,
      price: Number(item.price) || getConfiguredPrice(dish, portion),
      basePrice: dish.price,
      image: dish.image,
      color: dish.color,
      qty
    };
  }

  function add(dishId) {
    const dish = findDish(dishId);
    const portion = getPortion(dish, dish && dish.defaultPortionId);
    if (!dish || !portion) return;
    addConfigured(dishId, portion.id, 1);
  }

  function addConfigured(dishId, portionId, qty) {
    const dish = findDish(dishId);
    const portion = getPortion(dish, portionId);
    const amount = Math.max(1, Number(qty) || 1);
    if (!dish || !portion) return;

    const cartKey = getCartKey(dish.id, portion.id);
    const existing = cart.find((item) => item.cartKey === cartKey);
    if (existing) {
      existing.qty += amount;
    } else {
      cart.push({
        id: dish.id,
        cartKey,
        name: dish.name,
        portionId: portion.id,
        portionName: portion.name,
        price: getConfiguredPrice(dish, portion),
        basePrice: dish.price,
        image: dish.image,
        color: dish.color,
        qty: amount
      });
    }
    save();
  }

  function increase(cartKey) {
    const item = cart.find((entry) => entry.cartKey === cartKey);
    if (!item) return;
    item.qty += 1;
    save();
  }

  function decrease(cartKey) {
    const item = cart.find((entry) => entry.cartKey === cartKey);
    if (!item) return;
    item.qty -= 1;
    if (item.qty <= 0) {
      cart = cart.filter((entry) => entry.cartKey !== cartKey);
    }
    save();
  }

  function remove(cartKey) {
    cart = cart.filter((entry) => entry.cartKey !== cartKey);
    save();
  }

  function clear() {
    cart = [];
    save();
  }

  function getState() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    return {
      items: cart.map((item) => ({ ...item })),
      totalItems,
      totalPrice
    };
  }

  window.CartStore = {
    load,
    add,
    addConfigured,
    increase,
    decrease,
    remove,
    clear,
    getState
  };
})();