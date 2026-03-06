<template>
  <div class="max-w-[700px] mx-auto px-4 py-8">
    <h1 class="font-serif text-3xl text-ink text-center mb-8 tracking-wider">一起玩的游戏</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <router-link
        v-for="g in gamePresets" :key="g.id"
        :to="`/games/${g.id}`"
        class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 hover:shadow-[0_4px_24px_rgba(0,0,0,0.1)] transition-shadow"
      >
        <div class="text-4xl mb-3">{{ g.emoji }}</div>
        <h2 class="font-serif text-lg text-ink mb-1">{{ g.name }}</h2>
        <p class="text-xs text-light-ink mb-2">{{ g.category }}</p>
        <p class="text-sm text-ink leading-relaxed">{{ g.description }}</p>
        <p class="text-xs text-deep-rose mt-3">{{ g.players }}</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { gamePresets } from '@/data/games'
</script>
