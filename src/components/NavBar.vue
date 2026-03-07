<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-sm border-b border-warm">
    <div class="max-w-[800px] mx-auto px-4 h-12 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <router-link to="/" class="font-serif text-ink text-sm tracking-wider">小鱼与梓樱</router-link>
        <!-- 在线状态 -->
        <div class="flex items-center gap-3 text-xs">
          <span v-for="u in ['小鱼', '梓樱']" :key="u" class="flex items-center gap-1.5">
            <span class="relative flex h-2 w-2">
              <span v-if="isOnline(u)" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2" :class="isOnline(u) ? 'bg-green-500' : 'bg-gray-300'"></span>
            </span>
            <span :class="isOnline(u) ? 'text-ink' : 'text-light-ink/60'">{{ u }}</span>
            <span v-if="isOnline(u) && onlineStatus[u]" class="text-light-ink">{{ onlineStatus[u].pageName }}</span>
          </span>
        </div>
      </div>
      <div class="flex gap-4 text-sm">
        <router-link to="/memorial/love" class="text-deep-rose hover:text-rose transition-colors">上篇</router-link>
        <router-link to="/memorial/friend" class="text-friend-blue hover:text-friend-border transition-colors">下篇</router-link>
        <router-link to="/gallery" class="text-light-ink hover:text-ink transition-colors">相册</router-link>
        <router-link to="/diary" class="text-light-ink hover:text-ink transition-colors">日记</router-link>
        <router-link to="/chat" class="text-light-ink hover:text-ink transition-colors">聊天</router-link>
        <router-link to="/calendar" class="text-light-ink hover:text-ink transition-colors">日历</router-link>
        <router-link to="/announcements" class="text-light-ink hover:text-ink transition-colors">公告</router-link>
        <router-link to="/games" class="text-light-ink hover:text-ink transition-colors">游戏</router-link>
        <router-link to="/food" class="text-light-ink hover:text-ink transition-colors">美食</router-link>
        <router-link to="/places" class="text-light-ink hover:text-ink transition-colors">足迹</router-link>
        <router-link to="/academic" class="text-light-ink hover:text-ink transition-colors">学术</router-link>
        <router-link to="/settings" class="text-light-ink hover:text-ink transition-colors">设置</router-link>
        <router-link v-if="user === '小鱼'" to="/admin" class="text-light-ink hover:text-ink transition-colors">管理</router-link>
      </div>
    </div>
  </nav>
  <div class="h-12"></div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

import { getUser } from '@/router'
import { onlineStatus, isOnline, fetchOnlineStatus } from '@/composables/use_online'

const user = getUser()

let pollTimer = null
onMounted(() => {
  fetchOnlineStatus()
  pollTimer = setInterval(fetchOnlineStatus, 15000)
})
onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>
