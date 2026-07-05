<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  dishes: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(["open-dish"]);
const activeIndex = ref(0);
const hiddenImages = ref(new Set());
let timerId = null;

const activeDish = computed(() => props.dishes[activeIndex.value] || null);

watch(
  () => props.dishes,
  () => {
    activeIndex.value = 0;
    hiddenImages.value = new Set();
    restartAutoPlay();
  },
  { deep: true }
);

onMounted(restartAutoPlay);

onBeforeUnmount(() => {
  if (timerId) window.clearInterval(timerId);
});

function restartAutoPlay() {
  if (timerId) window.clearInterval(timerId);
  if (props.dishes.length <= 1) return;
  timerId = window.setInterval(next, 4200);
}

function next() {
  activeIndex.value = (activeIndex.value + 1) % props.dishes.length;
}

function previous() {
  activeIndex.value = (activeIndex.value - 1 + props.dishes.length) % props.dishes.length;
}

function select(index) {
  activeIndex.value = index;
  restartAutoPlay();
}

function markImageHidden(dishId) {
  hiddenImages.value = new Set([...hiddenImages.value, dishId]);
}

function hasImage(dish) {
  return dish && !hiddenImages.value.has(dish.id);
}
</script>

<template>
  <section v-if="activeDish" class="promo-carousel" aria-labelledby="promoTitle">
    <div class="promo-copy">
      <span class="promo-kicker">今日特价</span>
      <h2 id="promoTitle">{{ activeDish.name }}</h2>
      <p>{{ activeDish.description }}</p>
      <div class="promo-meta">
        <span>{{ activeDish.category }}</span>
        <span>{{ activeDish.heat }}</span>
        <span>{{ activeDish.tag }}</span>
      </div>
      <div class="promo-bottom">
        <div>
          <span class="promo-price">¥{{ activeDish.price }}起</span>
          <small>限时推荐 · 默认可选大份</small>
        </div>
        <button class="promo-order-button" type="button" @click="emit('open-dish', activeDish.id)">立即加菜</button>
      </div>
    </div>

    <div class="promo-visual" :data-color="activeDish.color">
      <img v-if="hasImage(activeDish)" :src="activeDish.image" :alt="activeDish.name" @error="markImageHidden(activeDish.id)" />
      <span>{{ activeDish.name.slice(0, 1) }}</span>
      <div class="promo-controls" aria-label="特价菜轮播控制">
        <button type="button" aria-label="上一道特价菜" @click="previous">‹</button>
        <button type="button" aria-label="下一道特价菜" @click="next">›</button>
      </div>
    </div>

    <div class="promo-dots" aria-label="特价菜列表">
      <button
        v-for="(dish, index) in dishes"
        :key="dish.id"
        type="button"
        :class="{ active: index === activeIndex }"
        :aria-label="`切换到${dish.name}`"
        @click="select(index)"
      ></button>
    </div>
  </section>
</template>
