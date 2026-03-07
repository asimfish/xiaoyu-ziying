<template>
  <div v-if="images.length" class="mt-3" :class="gridClass">
    <div
      v-for="(src, i) in images" :key="i"
      class="relative overflow-hidden rounded-lg cursor-pointer bg-warm/30"
      :class="itemClass(i)"
      @click="openLightbox(src)"
    >
      <img :src="src" alt="" class="w-full h-full object-cover" loading="lazy">
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'

const props = defineProps({
  images: { type: Array, required: true }
})

const openLightbox = inject('openLightbox')

const gridClass = computed(() => {
  const len = props.images.length
  if (len === 1) return 'grid grid-cols-1 max-w-[65%]'
  if (len === 2) return 'grid grid-cols-2 gap-1'
  if (len === 4) return 'grid grid-cols-2 gap-1'
  return 'grid grid-cols-3 gap-1'
})

const itemClass = (i) => {
  const len = props.images.length
  if (len === 1) return 'aspect-auto max-h-[360px]'
  if (len === 2) return 'aspect-square'
  if (len === 3 && i === 0) return 'aspect-square'
  return 'aspect-square'
}
</script>
