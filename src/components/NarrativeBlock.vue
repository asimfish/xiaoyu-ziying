<template>
  <p v-fade-in class="text-[1.05rem] leading-[2] text-ink mb-8 indent-[2em]">
    <slot />
    <img v-if="emoji" :src="emoji" alt="" class="inline-block w-12 h-12 align-middle mx-1">
  </p>
</template>

<script setup>
defineProps({
  emoji: String
})
</script>
