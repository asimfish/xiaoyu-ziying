<template>
  <div v-fade-in>
    <div class="photo-wall my-12 mx-auto max-w-[750px]">
      <img
        v-for="(src, i) in images" :key="i"
        :src="src" alt=""
        class="cursor-pointer"
        @click="openLightbox(src)"
      >
    </div>
    <p v-if="caption" class="text-sm text-light-ink text-center italic -mt-8 mb-8">{{ caption }}</p>
  </div>
</template>

<script setup>
import { inject } from 'vue'
defineProps({ images: Array, caption: String })
const openLightbox = inject('openLightbox')
</script>
