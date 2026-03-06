<template>
  <div v-fade-in class="text-center py-32 px-8">
    <p class="font-serif text-sm text-gold tracking-[0.5em]">{{ number }}</p>
    <h2 class="font-serif text-4xl font-semibold text-ink mt-4 tracking-wider max-sm:text-2xl">{{ title }}</h2>
    <p class="text-sm text-light-ink mt-3 tracking-[0.2em]">{{ period }}</p>
    <div class="w-[60px] h-px bg-gold mx-auto mt-8"></div>
  </div>
</template>

<script setup>
defineProps({
  number: String,
  title: String,
  period: String
})
</script>
