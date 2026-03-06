<template>
  <div class="max-w-[700px] mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-8">
      <router-link to="/games" class="text-sm text-light-ink hover:text-ink transition-colors">← 返回游戏列表</router-link>
    </div>

    <div v-if="game" class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-8">
      <div class="text-5xl mb-4">{{ game.emoji }}</div>
      <h1 class="font-serif text-3xl text-ink mb-2">{{ game.name }}</h1>
      <p class="text-sm text-light-ink mb-4">{{ game.category }}</p>
      <p class="text-ink leading-[1.8]">{{ game.description }}</p>
      <p class="text-sm text-deep-rose mt-6">{{ game.players }}</p>
      <div class="mt-8 p-4 bg-cream/50 rounded-lg">
        <p class="text-sm text-light-ink">更多游戏记录和截图，敬请期待...</p>
      </div>
    </div>

    <div v-else class="text-center text-light-ink py-16">游戏不存在</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { gamePresets } from '@/data/games'

const route = useRoute()
const game = computed(() => gamePresets.find(g => g.id === route.params.id))
</script>
