<script setup>
import { computed } from "vue";
import MenuItem from "./MenuItem.vue";

const props = defineProps({
  categories: {
    type: Array,
    required: true
  },
  dessertCategories: {
    type: Array,
    default: () => []
  },
  selectedCategory: {
    type: String,
    required: true
  },
  selectedDessertCategory: {
    type: String,
    default: "全部"
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

const emit = defineEmits(["select-category", "select-dessert-category", "open-dish"]);
const isDessertSelected = computed(() => props.selectedCategory === "甜品饮品");

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
        <h2 id="menuTitle">{{ isDessertSelected ? "甜品饮品" : "中餐菜单" }}</h2>
        <p>{{ isDessertSelected ? "浏览高颜值甜品和饮品，快速挑一个饭后快乐。" : "选择想吃的菜，进入详情后选择份量和数量。" }}</p>
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

    <div v-if="isDessertSelected" class="dessert-subnav" aria-label="甜品饮品分类">
      <button
        v-for="category in dessertCategories"
        :key="category"
        class="dessert-tab"
        :class="{ active: category === selectedDessertCategory }"
        type="button"
        @click="emit('select-dessert-category', category)"
      >
        {{ category }}
      </button>
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
