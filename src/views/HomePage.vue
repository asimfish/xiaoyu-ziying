<template>
  <div class="min-h-screen flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-br from-warm via-[#e8d5c4] to-rose">
    <!-- floating light -->
    <div class="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.15)_0%,transparent_60%)] animate-[float_20s_ease-in-out_infinite]"></div>

    <!-- avatars -->
    <div class="flex items-center mt-12 relative z-10">
      <img :src="`${base}assets/images/avatars/xiaoyu.png`" alt="小鱼" class="w-20 h-20 rounded-full border-[3px] border-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] object-cover max-sm:w-16 max-sm:h-16">
      <div class="w-10 flex items-center justify-center text-xl text-deep-rose animate-[heartbeat_1.5s_ease-in-out_infinite]">&#10084;</div>
      <img :src="`${base}assets/images/avatars/ziying.png`" alt="梓樱" class="w-20 h-20 rounded-full border-[3px] border-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] object-cover max-sm:w-16 max-sm:h-16">
    </div>

    <h1 class="font-serif text-6xl font-bold text-ink tracking-[0.3em] relative z-10 mt-8 max-sm:text-4xl max-sm:tracking-wider">小鱼与梓樱</h1>
    <p class="text-lg text-light-ink mt-6 tracking-[0.5em] relative z-10">我们的故事</p>
    <p class="font-serif text-sm text-deep-rose mt-12 tracking-[0.2em] relative z-10">2025.05 — 2026.03</p>

    <!-- nav buttons -->
    <div class="flex gap-6 mt-12 relative z-10 max-sm:flex-col max-sm:items-center max-sm:gap-4">
      <router-link to="/memorial/love" class="inline-block py-3 px-10 rounded-full font-serif text-base tracking-wider bg-white/85 text-deep-rose border-[1.5px] border-rose hover:bg-deep-rose hover:text-white hover:shadow-[0_4px_20px_rgba(176,112,112,0.3)] transition-all max-sm:py-2.5 max-sm:px-8 max-sm:text-sm">
        上篇 · 爱人
      </router-link>
      <router-link to="/memorial/friend" class="inline-block py-3 px-10 rounded-full font-serif text-base tracking-wider bg-white/85 text-friend-blue border-[1.5px] border-friend-border hover:bg-friend-blue hover:text-white hover:shadow-[0_4px_20px_rgba(106,140,175,0.3)] transition-all max-sm:py-2.5 max-sm:px-8 max-sm:text-sm">
        下篇 · 朋友
      </router-link>
    </div>

    <!-- bottom nav -->
    <div class="flex gap-6 mt-8 relative z-10 text-sm text-light-ink flex-wrap justify-center">
      <router-link to="/gallery" class="hover:text-ink transition-colors tracking-wider">相册</router-link>
      <router-link to="/diary" class="hover:text-ink transition-colors tracking-wider">日记</router-link>
      <router-link to="/chat" class="hover:text-ink transition-colors tracking-wider">聊天</router-link>
      <router-link to="/calendar" class="hover:text-ink transition-colors tracking-wider">日历</router-link>
      <router-link to="/announcements" class="hover:text-ink transition-colors tracking-wider">公告</router-link>
      <router-link to="/games" class="hover:text-ink transition-colors tracking-wider">游戏</router-link>
      <router-link to="/food" class="hover:text-ink transition-colors tracking-wider">美食</router-link>
      <router-link to="/places" class="hover:text-ink transition-colors tracking-wider">足迹</router-link>
      <router-link to="/academic" class="hover:text-ink transition-colors tracking-wider">学术</router-link>
    </div>

    <div class="absolute bottom-12 left-1/2 -translate-x-1/2 text-xs text-light-ink tracking-[0.3em] animate-[bounce_2s_ease-in-out_infinite] z-10">向下滑动</div>
  </div>
</template>

<script setup>
const base = import.meta.env.BASE_URL
</script>
