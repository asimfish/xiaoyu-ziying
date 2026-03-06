<template>
  <div v-fade-in class="quote-block relative bg-white border-l-[3px] border-rose py-8 px-10 my-10 rounded-r-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] max-sm:py-6 max-sm:px-6 max-sm:pl-7">
    <p class="font-serif text-[1.05rem] text-ink leading-[1.9] italic whitespace-pre-line">{{ text }}</p>
    <p v-if="from" class="text-sm text-deep-rose mt-3 text-right">— {{ from }}</p>
  </div>
</template>

<script setup>
defineProps({
  text: String,
  from: String
})
</script>
