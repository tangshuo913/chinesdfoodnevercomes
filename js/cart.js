(function () {
  let cart = [];

  function load() {
    cart = AppStorage.getCart();
    return cart;
  }

  function save() {
    AppStorage.setCart(cart);
    document.dispatchEvent(new CustomEvent("cart:changed", { detail: getState() }));
  }

  function findDish(dishId) {
    return DOPAMINE_DISHES.find((dish) => dish.id === dishId);
  }

  function add(dishId) {
    const dish = findDish(dishId);
    if (!dish) return;

    const existing = cart.find((item) => item.id === dishId);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        color: dish.color,
        qty: 1
      });
    }
    save();
  }

  function increase(dishId) {
    const item = cart.find((entry) => entry.id === dishId);
    if (!item) return;
    item.qty += 1;
    save();
  }

  function decrease(dishId) {
    const item = cart.find((entry) => entry.id === dishId);
    if (!item) return;
    item.qty -= 1;
    if (item.qty <= 0) {
      cart = cart.filter((entry) => entry.id !== dishId);
    }
    save();
  }

  function remove(dishId) {
    cart = cart.filter((entry) => entry.id !== dishId);
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
    increase,
    decrease,
    remove,
    clear,
    getState
  };
})();
