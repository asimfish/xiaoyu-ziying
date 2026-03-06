<template>
  <div v-fade-in class="my-12 mx-auto max-w-[600px] text-center">
    <img
      :src="src" alt=""
      class="w-full rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] object-cover cursor-pointer"
      @click="openLightbox(src)"
    >
    <p v-if="caption" class="text-sm text-light-ink mt-3 italic">{{ caption }}</p>
  </div>
</template>

<script setup>
import { inject } from 'vue'
defineProps({ src: String, caption: String })
const openLightbox = inject('openLightbox')
</script>
