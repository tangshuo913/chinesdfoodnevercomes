<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  dish: {
    type: Object,
    required: true
  },
  inCartQty: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(["open"]);
const showImage = ref(true);

watch(
  () => props.dish.image,
  () => {
    showImage.value = true;
  }
);

const buttonText = computed(() => (props.inCartQty ? `已选 ${props.inCartQty}` : "选择"));
</script>

<template>
  <article class="dish-card" :data-color="dish.color" @click="emit('open', dish.id)">
    <div class="dish-image" role="img" :aria-label="`${dish.name} 图片占位`">
      <img v-if="showImage" :src="dish.image" :alt="dish.name" loading="lazy" @error="showImage = false" />
      <span>{{ dish.name.slice(0, 1) }}</span>
    </div>
    <div class="dish-info">
      <div class="dish-meta">
        <span>{{ dish.category }}</span>
        <span>{{ dish.heat }}</span>
      </div>
      <h3>{{ dish.name }}</h3>
      <div class="dish-bottom">
        <div>
          <strong>¥{{ dish.price }}起</strong>
          <small>{{ dish.tag }}</small>
        </div>
        <button class="add-button" type="button" @click.stop="emit('open', dish.id)">
          {{ buttonText }}
        </button>
      </div>
    </div>
  </article>
</template>
