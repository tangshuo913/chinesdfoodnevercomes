<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["increase", "decrease", "remove"]);
const showImage = ref(true);

watch(
  () => props.item.image,
  () => {
    showImage.value = true;
  }
);
</script>

<template>
  <article class="cart-item">
    <div class="mini-image" :data-color="item.color">
      <img v-if="showImage" :src="item.image" :alt="item.name" loading="lazy" @error="showImage = false" />
      <span>{{ item.name.slice(0, 1) }}</span>
    </div>
    <div class="cart-item-info">
      <h3>{{ item.name }}</h3>
      <p>{{ item.portionName || "默认" }} · ¥{{ item.price }} × {{ item.qty }}</p>
      <button class="text-button" type="button" @click="emit('remove', item.cartKey)">删除</button>
    </div>
    <div class="qty-stepper" :aria-label="`${item.name} 数量`">
      <button type="button" aria-label="减少" @click="emit('decrease', item.cartKey)">-</button>
      <strong>{{ item.qty }}</strong>
      <button type="button" aria-label="增加" @click="emit('increase', item.cartKey)">+</button>
    </div>
  </article>
</template>
