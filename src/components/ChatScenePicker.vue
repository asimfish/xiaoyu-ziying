<template>
  <div class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
    <button
      v-for="scene in scenes" :key="scene.id"
      class="p-5 rounded-xl border-2 text-left transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
      :class="borderClass[scene.color]"
      @click="$emit('select', scene)"
    >
      <div class="font-serif text-lg text-ink mb-1">{{ scene.label }}</div>
      <div class="text-sm text-light-ink">{{ scene.desc }}</div>
    </button>
  </div>
</template>

<script setup>
import { chatScenes } from '@/data/chat_prompts'

defineEmits(['select'])

const scenes = chatScenes

const borderClass = {
  'deep-rose': 'border-deep-rose/30 hover:border-deep-rose',
  'rose': 'border-rose/30 hover:border-rose',
  'gold': 'border-gold/30 hover:border-gold',
  'friend-blue': 'border-friend-blue/30 hover:border-friend-blue'
}
</script>
