<template>
  <div v-fade-in class="my-12 mx-auto" :class="gridClass">
    <img
      v-for="(src, i) in images" :key="i"
      :src="src" alt=""
      class="w-full object-cover rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] cursor-pointer"
      :class="cols === 3 ? 'aspect-[3/4]' : 'aspect-square'"
      @click="openLightbox(src)"
    >
  </div>
  <p v-if="caption" class="text-sm text-light-ink text-center italic -mt-8 mb-8">{{ caption }}</p>
</template>

<script setup>
import { computed, inject } from 'vue'

const props = defineProps({
  images: Array,
  cols: { type: Number, default: 2 },
  caption: String
})

const openLightbox = inject('openLightbox')

const gridClass = computed(() => {
  if (props.cols === 3) return 'grid grid-cols-3 gap-3 max-w-[750px] max-sm:grid-cols-2'
  return 'grid grid-cols-2 gap-4 max-w-[700px] max-sm:grid-cols-1'
})
</script>
