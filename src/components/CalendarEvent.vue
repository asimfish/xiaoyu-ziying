<template>
  <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4 mb-3 flex items-center gap-3">
    <span class="text-2xl">{{ event.emoji }}</span>
    <div class="flex-1 min-w-0">
      <div class="font-serif text-ink">{{ event.title }}</div>
      <div class="text-sm text-light-ink">{{ event.date }}</div>
    </div>
    <span v-if="event.note" class="text-sm text-light-ink truncate max-w-[200px]">{{ event.note }}</span>
  </div>
</template>

<script setup>
defineProps({ event: Object })
</script>