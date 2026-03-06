<template>
  <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 mb-4">
    <div class="flex justify-between items-start mb-3">
      <div class="flex items-center gap-2">
        <h3 class="font-serif text-lg text-ink">{{ title }}</h3>
        <span v-if="author" class="text-xs px-2 py-0.5 rounded-full" :class="author === 'xiaoyu' ? 'bg-rose/20 text-deep-rose' : 'bg-friend-border/20 text-friend-blue'">
          {{ author === 'xiaoyu' ? '小鱼' : '梓樱' }}
        </span>
      </div>
      <span class="text-sm text-light-ink shrink-0 ml-4">{{ date }}</span>
    </div>
    <p class="text-ink leading-[1.8] whitespace-pre-line">{{ content }}</p>
  </div>
</template>

<script setup>
defineProps({ title: String, content: String, date: String, author: String })
</script>
