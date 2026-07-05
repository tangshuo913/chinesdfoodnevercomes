<script setup>
import MenuItem from "./MenuItem.vue";

defineProps({
  categories: {
    type: Array,
    required: true
  },
  selectedCategory: {
    type: String,
    required: true
  },
  dishes: {
    type: Array,
    required: true
  },
  cartItems: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(["select-category", "open-dish"]);

function getDishQuantity(dishId, cartItems) {
  return cartItems
    .filter((item) => item.id === dishId)
    .reduce((sum, item) => sum + item.qty, 0);
}
</script>

<template>
  <section class="menu-section" aria-labelledby="menuTitle">
    <div class="section-heading">
      <div>
        <h2 id="menuTitle">中餐菜单</h2>
        <p>选择想吃的菜，进入详情后选择份量和数量。</p>
      </div>
      <div class="category-tabs" aria-label="菜品分类">
        <button
          v-for="category in categories"
          :key="category"
          class="tab-button"
          :class="{ active: category === selectedCategory }"
          type="button"
          @click="emit('select-category', category)"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <div class="menu-grid">
      <MenuItem
        v-for="dish in dishes"
        :key="dish.id"
        :dish="dish"
        :in-cart-qty="getDishQuantity(dish.id, cartItems)"
        @open="emit('open-dish', $event)"
      />
    </div>
  </section>
</template>
