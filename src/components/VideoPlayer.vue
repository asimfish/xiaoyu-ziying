<template>
  <div v-fade-in class="my-12 mx-auto max-w-[500px] text-center">
    <video controls preload="metadata" playsinline class="w-full rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <source :src="src" type="video/mp4">
    </video>
    <p v-if="caption" class="text-sm text-light-ink mt-3 italic">{{ caption }}</p>
  </div>
</template>

<script setup>
defineProps({ src: String, caption: String })
</script>
