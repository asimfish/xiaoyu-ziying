<template>
  <div class="text-center py-32 px-8 relative" :class="theme === 'love' ? 'bg-gradient-to-br from-warm via-[#e8d5c4] to-rose' : 'bg-gradient-to-br from-[#d3e8f5] via-[#c4d5e8] to-friend-border'">
    <p class="font-serif text-base text-gold tracking-[0.8em] mb-6">{{ label }}</p>
    <h2 class="font-serif text-5xl font-bold text-ink tracking-[0.3em] max-sm:text-3xl max-sm:tracking-wider">{{ title }}</h2>
    <p class="text-sm text-light-ink mt-6 tracking-[0.2em]">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  title: String,
  subtitle: String,
  theme: String
})
</script>
