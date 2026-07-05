<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true
  },
  methods: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <div class="payment-methods" role="radiogroup" aria-label="付款方式">
    <button
      v-for="method in methods"
      :key="method.id"
      class="payment-option"
      :class="{ active: method.id === modelValue }"
      type="button"
      role="radio"
      :aria-checked="String(method.id === modelValue)"
      @click="emit('update:modelValue', method.id)"
    >
      <span class="payment-icon" aria-hidden="true">{{ method.icon }}</span>
      <span>
        <strong>{{ method.label }}</strong>
        <small>{{ method.description }}</small>
      </span>
    </button>
  </div>
</template>
