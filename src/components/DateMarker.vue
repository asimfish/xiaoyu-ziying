<template>
  <div v-fade-in class="text-center my-16 mb-8">
    <span class="inline-block bg-warm text-deep-rose font-serif text-sm py-1.5 px-6 rounded-full tracking-wider">{{ text }}</span>
  </div>
</template>

<script setup>
defineProps({ text: String })
</script>
