<template>
  <div v-fade-in class="my-12 mx-auto max-w-[360px] text-center max-sm:max-w-[300px]">
    <img
      :src="src" alt=""
      class="w-full rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] object-cover cursor-pointer"
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
