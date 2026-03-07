<template>
  <div v-if="loading" class="text-center text-light-ink py-16">加载中...</div>
  <div v-else-if="!sessions.length" class="text-center text-light-ink py-16">暂无{{ user }}的访问记录</div>
  <template v-else>
    <!-- 统计 -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4 text-center">
        <div class="text-2xl font-serif text-ink">{{ sessions.length }}</div>
        <div class="text-sm text-light-ink mt-1">总访问次数</div>
      </div>
      <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4 text-center">
        <div class="text-sm font-serif text-ink">{{ totalDuration }}</div>
        <div class="text-sm text-light-ink mt-1">总停留时长</div>
      </div>
      <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4 text-center">
        <div class="text-sm font-serif text-ink">{{ topPage }}</div>
        <div class="text-sm text-light-ink mt-1">最常访问页面</div>
      </div>
    </div>

    <!-- 会话时间线 -->
    <div class="space-y-4">
      <div v-for="s in sessions" :key="s.id" class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5">
        <div class="flex items-center justify-between mb-3">
          <span class="font-serif text-sm text-ink">{{ s.loginTime }}</span>
          <span v-if="s.device" class="text-xs text-light-ink bg-cream px-2 py-0.5 rounded-full">
            {{ [s.device.location, s.device.model, s.device.browser, s.device.os, s.device.mobile ? '手机' : '电脑', s.device.screen].filter(Boolean).join(' / ') }}
          </span>
        </div>
        <!-- 页面浏览 -->
        <div v-if="s.pages && s.pages.length" class="mb-3">
          <div class="text-xs text-light-ink mb-2">页面浏览</div>
          <div class="space-y-1.5">
            <div v-for="(p, i) in s.pages" :key="i" class="flex items-center text-sm">
              <span class="w-14 text-ink shrink-0">{{ p.name }}</span>
              <div class="flex-1 mx-2 h-1.5 bg-warm rounded-full overflow-hidden">
                <div class="h-full bg-deep-rose/60 rounded-full" :style="{ width: getBarWidth(p.duration, s.pages) }"></div>
              </div>
              <span class="text-xs text-light-ink shrink-0 w-20 text-right">{{ p.enter?.slice(11) }}</span>
              <span class="text-xs text-deep-rose shrink-0 w-16 text-right">{{ formatDuration(p.duration) }}</span>
            </div>
          </div>
        </div>
        <!-- 操作记录 -->
        <div v-if="s.actions && s.actions.length">
          <div class="text-xs text-light-ink mb-2">操作记录</div>
          <div class="space-y-1">
            <div v-for="(a, i) in s.actions" :key="i" class="flex items-center text-sm text-ink">
              <span class="text-light-ink mr-2 text-xs">{{ a.time?.slice(11) }}</span>
              <span>{{ a.detail }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  sessions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  user: { type: String, default: '' }
})

const totalDuration = computed(() => {
  let total = 0
  props.sessions.forEach(s => {
    if (!s.pages) return
    s.pages.forEach(p => { total += (p.duration || 0) })
  })
  if (total < 60) return `${total}秒`
  if (total < 3600) return `${Math.floor(total / 60)}分${total % 60}秒`
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  return `${h}小时${m}分`
})

const topPage = computed(() => {
  const count = {}
  props.sessions.forEach(s => {
    if (!s.pages) return
    s.pages.forEach(p => { count[p.name] = (count[p.name] || 0) + 1 })
  })
  let max = 0
  let name = '-'
  Object.entries(count).forEach(([k, v]) => {
    if (v > max) { max = v; name = k }
  })
  return name
})

const formatDuration = (sec) => {
  if (!sec) return '0秒'
  if (sec < 60) return `${sec}秒`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s ? `${m}分${s}秒` : `${m}分`
}

const getBarWidth = (duration, pages) => {
  const maxDur = Math.max(...pages.map(p => p.duration || 0), 1)
  return `${Math.max((duration || 0) / maxDur * 100, 4)}%`
}
</script>
