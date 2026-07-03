(function () {
  const dom = {};
  let selectedCategory = "全部";
  let activeDish = null;
  let selectedPortionId = "large";
  let selectedDishQty = 1;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    bindDom();
    CartStore.load();
    OrderStore.load();
    renderCategories();
    renderMenu();
    renderCart();
    renderOrders();
    bindEvents();
    resumeActiveDelivery();
  }

  function bindDom() {
    [
      "menuGrid",
      "menuCount",
      "categoryTabs",
      "cartToggle",
      "cartClose",
      "cartDrawer",
      "cartItems",
      "cartCount",
      "cartSummary",
      "cartTotal",
      "submitOrder",
      "floatingCart",
      "floatingCartCount",
      "floatingCartTotal",
      "historyToggle",
      "historyClose",
      "historyDrawer",
      "orderList",
      "orderCount",
      "dishModal",
      "dishModalClose",
      "dishModalContent",
      "deliveryModal",
      "deliveryTitle",
      "deliverySubtitle",
      "deliveryTimer",
      "deliveryProgress",
      "viewCurrentOrder",
      "closeDelivery",
      "toastStack",
      "confettiLayer"
    ].forEach((id) => {
      dom[id] = document.getElementById(id);
    });
  }

  function bindEvents() {
    dom.cartToggle.addEventListener("click", () => openDrawer(dom.cartDrawer));
    dom.floatingCart.addEventListener("click", () => openDrawer(dom.cartDrawer));
    dom.cartClose.addEventListener("click", () => closeDrawer(dom.cartDrawer));
    dom.historyToggle.addEventListener("click", () => openDrawer(dom.historyDrawer));
    dom.historyClose.addEventListener("click", () => closeDrawer(dom.historyDrawer));
    dom.cartDrawer.addEventListener("click", (event) => {
      if (event.target === dom.cartDrawer) closeDrawer(dom.cartDrawer);
    });
    dom.historyDrawer.addEventListener("click", (event) => {
      if (event.target === dom.historyDrawer) closeDrawer(dom.historyDrawer);
    });
    dom.dishModalClose.addEventListener("click", closeDishModal);
    dom.dishModal.addEventListener("click", (event) => {
      if (event.target === dom.dishModal) closeDishModal();
    });
    dom.closeDelivery.addEventListener("click", hideDeliveryModal);
    dom.viewCurrentOrder.addEventListener("click", () => {
      hideDeliveryModal();
      openDrawer(dom.historyDrawer);
    });

    dom.submitOrder.addEventListener("click", submitOrder);

    document.addEventListener("cart:changed", () => {
      renderCart();
      renderMenu();
    });
    document.addEventListener("orders:changed", renderOrders);

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeDrawer(dom.cartDrawer);
      closeDrawer(dom.historyDrawer);
      closeDishModal();
      hideDeliveryModal();
    });
  }

  function renderCategories() {
    const categories = ["全部", ...new Set(DOPAMINE_DISHES.map((dish) => dish.category))];
    dom.categoryTabs.innerHTML = categories
      .map(
        (category) => `
          <button class="tab-button${category === selectedCategory ? " active" : ""}" type="button" data-category="${category}">
            ${category}
          </button>
        `
      )
      .join("");

    dom.categoryTabs.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        selectedCategory = button.dataset.category;
        renderCategories();
        renderMenu();
      });
    });
  }

  function renderMenu() {
    const cart = CartStore.getState();
    const visibleDishes =
      selectedCategory === "全部"
        ? DOPAMINE_DISHES
        : DOPAMINE_DISHES.filter((dish) => dish.category === selectedCategory);

    dom.menuCount.textContent = `${DOPAMINE_DISHES.length} 道菜`;
    dom.menuGrid.innerHTML = visibleDishes
      .map((dish) => {
        const inCartQty = cart.items
          .filter((item) => item.id === dish.id)
          .reduce((sum, item) => sum + item.qty, 0);
        return `
          <article class="dish-card" data-color="${dish.color}" data-dish="${dish.id}">
            <div class="dish-image" role="img" aria-label="${dish.name} 图片占位">
              <img src="${dish.image}" alt="${dish.name}" loading="lazy" onerror="this.hidden=true" />
              <span>${dish.name.slice(0, 1)}</span>
            </div>
            <div class="dish-info">
              <div class="dish-meta">
                <span>${dish.category}</span>
                <span>${dish.heat}</span>
              </div>
              <h3>${dish.name}</h3>
              <div class="dish-bottom">
                <div>
                  <strong>¥${dish.price}起</strong>
                  <small>${dish.tag}</small>
                </div>
                <button class="add-button" type="button" data-add="${dish.id}">
                  ${inCartQty ? `已选 ${inCartQty}` : "选择"}
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    dom.menuGrid.querySelectorAll(".dish-card[data-dish]").forEach((card) => {
      card.addEventListener("click", () => openDishModal(card.dataset.dish));
    });
    dom.menuGrid.querySelectorAll("[data-add]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        openDishModal(button.dataset.add);
      });
    });
  }

  function openDishModal(dishId) {
    activeDish = DOPAMINE_DISHES.find((dish) => dish.id === dishId);
    if (!activeDish) return;
    selectedPortionId = activeDish.defaultPortionId || "large";
    selectedDishQty = 1;
    renderDishModal();
    dom.dishModal.classList.add("open");
    dom.dishModal.setAttribute("aria-hidden", "false");
  }

  function closeDishModal() {
    moveFocusOutOfLayer(dom.dishModal);
    dom.dishModal.classList.remove("open");
    dom.dishModal.setAttribute("aria-hidden", "true");
  }

  function renderDishModal() {
    if (!activeDish) return;
    const portion = getSelectedPortion();
    const unitPrice = getPortionPrice(activeDish, portion);
    const total = unitPrice * selectedDishQty;

    dom.dishModalContent.innerHTML = `
      <div class="dish-detail-image" data-color="${activeDish.color}">
        <img src="${activeDish.image}" alt="${activeDish.name}" loading="lazy" onerror="this.hidden=true" />
        <span>${activeDish.name.slice(0, 1)}</span>
      </div>
      <div class="dish-detail-body">
        <div class="dish-detail-meta">
          <span>${activeDish.category}</span>
          <span>${activeDish.heat}</span>
          <span>${activeDish.tag}</span>
        </div>
        <h2 id="dishModalTitle">${activeDish.name}</h2>
        <p>${activeDish.description}</p>
        <div class="portion-block">
          <div class="option-title">
            <strong>份量</strong>
            <span>默认大份</span>
          </div>
          <div class="portion-options">
            ${activeDish.portions
              .map((entry) => {
                const price = getPortionPrice(activeDish, entry);
                return `
                  <button class="portion-button${entry.id === selectedPortionId ? " active" : ""}" type="button" data-portion="${entry.id}">
                    <span>${entry.name}</span>
                    <strong>¥${price}</strong>
                  </button>
                `;
              })
              .join("")}
          </div>
        </div>
        <div class="dish-modal-footer">
          <div class="modal-qty-stepper" aria-label="选择数量">
            <button type="button" data-modal-qty="-1" aria-label="减少数量">−</button>
            <strong>${selectedDishQty}</strong>
            <button type="button" data-modal-qty="1" aria-label="增加数量">+</button>
          </div>
          <button class="confirm-dish-button" type="button" data-confirm-dish>
            确认加菜 ¥${total}
          </button>
        </div>
      </div>
    `;

    dom.dishModalContent.querySelectorAll("[data-portion]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedPortionId = button.dataset.portion;
        renderDishModal();
      });
    });
    dom.dishModalContent.querySelectorAll("[data-modal-qty]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedDishQty = Math.max(1, selectedDishQty + Number(button.dataset.modalQty));
        renderDishModal();
      });
    });
    dom.dishModalContent.querySelector("[data-confirm-dish]").addEventListener("click", () => {
      CartStore.addConfigured(activeDish.id, selectedPortionId, selectedDishQty);
      closeDishModal();
      showToast("已加入购物车");
    });
  }

  function getSelectedPortion() {
    return activeDish.portions.find((portion) => portion.id === selectedPortionId) || activeDish.portions[0];
  }

  function getPortionPrice(dish, portion) {
    return Math.max(1, dish.price + portion.priceDelta);
  }

  function renderCart() {
    const cart = CartStore.getState();
    dom.cartCount.textContent = cart.totalItems;
    dom.cartSummary.textContent = cart.totalItems ? `${cart.totalItems} 件菜品` : "还没有选择菜品";
    dom.cartTotal.textContent = `¥${cart.totalPrice}`;
    dom.floatingCartCount.textContent = cart.totalItems;
    dom.floatingCartTotal.textContent = `¥${cart.totalPrice}`;
    dom.floatingCart.classList.toggle("show", cart.totalItems > 0);
    dom.submitOrder.disabled = cart.totalItems === 0;

    if (!cart.items.length) {
      dom.cartItems.innerHTML = `
        <div class="empty-state">
          <strong>购物车是空的</strong>
          <p>从菜单里添加几道菜后就可以提交模拟订单。</p>
        </div>
      `;
      return;
    }

    dom.cartItems.innerHTML = cart.items
      .map(
        (item) => `
          <article class="cart-item">
            <div class="mini-image" data-color="${item.color}">
              <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.hidden=true" />
              <span>${item.name.slice(0, 1)}</span>
            </div>
            <div class="cart-item-info">
              <h3>${item.name}</h3>
              <p>${item.portionName || "默认"} · ¥${item.price} × ${item.qty}</p>
              <button class="text-button" type="button" data-remove="${item.cartKey}">删除</button>
            </div>
            <div class="qty-stepper" aria-label="${item.name} 数量">
              <button type="button" data-dec="${item.cartKey}" aria-label="减少">−</button>
              <strong>${item.qty}</strong>
              <button type="button" data-inc="${item.cartKey}" aria-label="增加">+</button>
            </div>
          </article>
        `
      )
      .join("");

    dom.cartItems.querySelectorAll("[data-inc]").forEach((button) => {
      button.addEventListener("click", () => CartStore.increase(button.dataset.inc));
    });
    dom.cartItems.querySelectorAll("[data-dec]").forEach((button) => {
      button.addEventListener("click", () => CartStore.decrease(button.dataset.dec));
    });
    dom.cartItems.querySelectorAll("[data-remove]").forEach((button) => {
      button.addEventListener("click", () => CartStore.remove(button.dataset.remove));
    });
  }

  function renderOrders() {
    const orders = OrderStore.getOrders();
    dom.orderCount.textContent = `${orders.length} 单`;

    if (!orders.length) {
      dom.orderList.innerHTML = `
        <div class="empty-state">
          <strong>暂无订单</strong>
          <p>提交订单后，配送中和已完成记录会出现在这里。</p>
        </div>
      `;
      return;
    }

    dom.orderList.innerHTML = orders
      .map((order) => {
        const itemText = order.items
          .map((item) => `${item.name}${item.portionName ? `（${item.portionName}）` : ""} × ${item.qty}`)
          .join("、");
        const statusText = order.status === "delivered" ? "已送达" : "配送中";
        const statusClass = order.status === "delivered" ? "delivered" : "delivering";
        return `
          <article class="order-card ${statusClass}">
            <div class="order-card-head">
              <div>
                <h3>${statusText}</h3>
                <time datetime="${order.createdAt}">${formatDate(order.createdAt)}</time>
              </div>
              <strong>¥${order.total}</strong>
            </div>
            <p>${itemText}</p>
            <div class="order-card-foot">
              <span>${order.items.reduce((sum, item) => sum + item.qty, 0)} 件菜品</span>
              <span>${order.status === "delivered" ? formatDeliveredAt(order) : formatRemaining(order)}</span>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function submitOrder() {
    const cart = CartStore.getState();
    if (!cart.items.length) return;

    const order = OrderStore.createFromCart(cart);
    if (!order) return;

    CartStore.clear();
    closeDrawer(dom.cartDrawer);
    showDeliveryModal(order);
    DeliveryTimer.start(order.id, getDeliveryCallbacks());
    showToast("订单已提交");
  }

  function resumeActiveDelivery() {
    const deliveries = OrderStore.getActiveDeliveries();
    if (!deliveries.length) return;

    const activeId = AppStorage.getActiveDelivery();
    const activeOrder = deliveries.find((order) => order.id === activeId) || deliveries[0];
    AppStorage.setActiveDelivery(activeOrder.id);
    showDeliveryModal(activeOrder);
    DeliveryTimer.start(activeOrder.id, getDeliveryCallbacks());
  }

  function getDeliveryCallbacks() {
    return {
      onTick: ({ remainingMs, progress }) => {
        dom.deliveryTimer.textContent = DeliveryTimer.formatTime(remainingMs);
        dom.deliveryProgress.style.width = `${Math.round(progress * 100)}%`;
        renderOrders();
      },
      onDelivered: (order) => {
        dom.deliveryTitle.textContent = "骑手已送达";
        dom.deliverySubtitle.textContent = "订单已保存到历史记录";
        dom.deliveryTimer.textContent = "00:00";
        dom.deliveryProgress.style.width = "100%";
        renderOrders();
        launchConfetti();
        showToast("骑手已送达");
        if (order) {
          AppStorage.clearActiveDelivery();
        }
      }
    };
  }

  function showDeliveryModal(order) {
    dom.deliveryTitle.textContent = order.status === "delivered" ? "骑手已送达" : "订单正在配送";
    dom.deliverySubtitle.textContent = order.status === "delivered" ? "订单已保存到历史记录" : "预计 2 分钟送达";
    dom.deliveryProgress.style.width = order.status === "delivered" ? "100%" : "0%";
    dom.deliveryModal.classList.add("open");
    dom.deliveryModal.setAttribute("aria-hidden", "false");
  }

  function hideDeliveryModal() {
    moveFocusOutOfLayer(dom.deliveryModal);
    dom.deliveryModal.classList.remove("open");
    dom.deliveryModal.setAttribute("aria-hidden", "true");
  }

  function moveFocusOutOfLayer(layer) {
    if (layer.contains(document.activeElement)) {
      dom.cartToggle.focus();
    }
  }

  function openDrawer(drawer) {
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
  }

  function closeDrawer(drawer) {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    dom.toastStack.appendChild(toast);
    window.setTimeout(() => toast.remove(), 2200);
  }

  function launchConfetti() {
    dom.confettiLayer.innerHTML = "";
    for (let index = 0; index < 42; index += 1) {
      const piece = document.createElement("span");
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.animationDelay = `${Math.random() * 0.2}s`;
      piece.style.setProperty("--x", `${Math.random() * 180 - 90}px`);
      piece.style.setProperty("--r", `${Math.random() * 360}deg`);
      dom.confettiLayer.appendChild(piece);
    }
    dom.confettiLayer.classList.add("active");
    window.setTimeout(() => {
      dom.confettiLayer.classList.remove("active");
      dom.confettiLayer.innerHTML = "";
    }, 2200);
  }

  function formatDate(isoString) {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(isoString));
  }

  function formatDeliveredAt(order) {
    return order.deliveredAt ? `送达 ${formatDate(order.deliveredAt)}` : "已完成";
  }

  function formatRemaining(order) {
    const remaining = Math.max(new Date(order.deliveryEndsAt).getTime() - Date.now(), 0);
    return `剩余 ${DeliveryTimer.formatTime(remaining)}`;
  }
})();