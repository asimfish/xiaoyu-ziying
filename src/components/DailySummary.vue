<template>
  <div>
    <!-- 日期选择 -->
    <div class="flex items-center gap-3 mb-6">
      <button @click="prevDay" class="text-light-ink hover:text-ink transition-colors text-lg">&lt;</button>
      <input type="date" v-model="selectedDate" class="px-3 py-1.5 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none">
      <button @click="nextDay" class="text-light-ink hover:text-ink transition-colors text-lg">&gt;</button>
      <button @click="goToday" class="text-xs px-3 py-1 rounded-full bg-cream text-light-ink hover:text-ink transition-colors">今天</button>
    </div>

    <div v-if="!daySessions.length" class="text-center text-light-ink py-16">{{ selectedDate }} 暂无访问记录</div>
    <template v-else>
      <!-- 当日概览 -->
      <div class="grid grid-cols-4 gap-3 mb-6">
        <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4 text-center">
          <div class="text-2xl font-serif text-ink">{{ daySessions.length }}</div>
          <div class="text-xs text-light-ink mt-1">登录次数</div>
        </div>
        <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4 text-center">
          <div class="text-2xl font-serif text-ink">{{ dayUsers.length }}</div>
          <div class="text-xs text-light-ink mt-1">活跃用户</div>
        </div>
        <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4 text-center">
          <div class="text-sm font-serif text-ink">{{ dayTotalDuration }}</div>
          <div class="text-xs text-light-ink mt-1">总停留时长</div>
        </div>
        <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4 text-center">
          <div class="text-2xl font-serif text-ink">{{ dayPageCount }}</div>
          <div class="text-xs text-light-ink mt-1">页面浏览量</div>
        </div>
      </div>

      <!-- 饼状图区域 -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5">
          <div class="text-sm text-light-ink mb-3">用户登录次数</div>
          <PieChart :data="userLoginData" unit="次" />
        </div>
        <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5">
          <div class="text-sm text-light-ink mb-3">登录时段分布</div>
          <PieChart :data="hourData" unit="次" />
        </div>
        <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5">
          <div class="text-sm text-light-ink mb-3">设备类型</div>
          <PieChart :data="deviceData" unit="次" />
        </div>
        <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5">
          <div class="text-sm text-light-ink mb-3">浏览器分布</div>
          <PieChart :data="browserData" unit="次" />
        </div>
        <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5">
          <div class="text-sm text-light-ink mb-3">页面浏览量</div>
          <PieChart :data="pageData" unit="次" />
        </div>
        <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5">
          <div class="text-sm text-light-ink mb-3">登录位置</div>
          <PieChart :data="locationData" unit="次" />
        </div>
      </div>

      <!-- 当日详细记录 -->
      <h3 class="text-sm text-light-ink mb-3">当日访问明细</h3>
      <div class="space-y-3">
        <div v-for="s in daySessions" :key="s.id" class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="font-serif text-sm text-ink">{{ s.user }}</span>
              <span class="text-xs text-light-ink">{{ s.loginTime.slice(11) }}</span>
            </div>
            <span v-if="s.device" class="text-xs text-light-ink bg-cream px-2 py-0.5 rounded-full">
              {{ [s.device.location, s.device.model, s.device.browser].filter(Boolean).join(' / ') }}
            </span>
          </div>
          <div v-if="s.pages && s.pages.length" class="flex flex-wrap gap-1.5">
            <span v-for="(p, i) in s.pages" :key="i" class="text-xs px-2 py-0.5 rounded-full bg-cream text-light-ink">
              {{ p.name }} {{ formatDuration(p.duration) }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

import PieChart from '@/components/PieChart.vue'
import dayjs from 'dayjs'

const props = defineProps({
  sessions: { type: Array, default: () => [] }
})

const selectedDate = ref(dayjs().format('YYYY-MM-DD'))

const prevDay = () => { selectedDate.value = dayjs(selectedDate.value).subtract(1, 'day').format('YYYY-MM-DD') }
const nextDay = () => { selectedDate.value = dayjs(selectedDate.value).add(1, 'day').format('YYYY-MM-DD') }
const goToday = () => { selectedDate.value = dayjs().format('YYYY-MM-DD') }

const daySessions = computed(() =>
  props.sessions.filter(s => s.loginTime && s.loginTime.startsWith(selectedDate.value))
)

const dayUsers = computed(() => [...new Set(daySessions.value.map(s => s.user))])

const dayTotalDuration = computed(() => {
  let total = 0
  daySessions.value.forEach(s => {
    if (!s.pages) return
    s.pages.forEach(p => { total += (p.duration || 0) })
  })
  if (total < 60) return `${total}秒`
  if (total < 3600) return `${Math.floor(total / 60)}分${total % 60}秒`
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  return `${h}小时${m}分`
})

const dayPageCount = computed(() => {
  let count = 0
  daySessions.value.forEach(s => { count += (s.pages || []).length })
  return count
})

// 饼状图数据：按用户分登录次数
const userLoginData = computed(() => {
  const map = {}
  daySessions.value.forEach(s => { map[s.user] = (map[s.user] || 0) + 1 })
  return Object.entries(map).map(([label, value]) => ({ label, value }))
})

// 饼状图数据：按时段分登录次数
const hourData = computed(() => {
  const slots = { '凌晨(0-6)': 0, '上午(6-12)': 0, '下午(12-18)': 0, '晚上(18-24)': 0 }
  daySessions.value.forEach(s => {
    const h = parseInt(s.loginTime.slice(11, 13))
    if (h < 6) slots['凌晨(0-6)']++
    else if (h < 12) slots['上午(6-12)']++
    else if (h < 18) slots['下午(12-18)']++
    else slots['晚上(18-24)']++
  })
  return Object.entries(slots).filter(([, v]) => v > 0).map(([label, value]) => ({ label, value }))
})

// 饼状图数据：按设备类型
const deviceData = computed(() => {
  const map = {}
  daySessions.value.forEach(s => {
    const d = s.device
    if (!d) return
    const key = d.model || (d.mobile ? '手机' : '电脑')
    map[key] = (map[key] || 0) + 1
  })
  return Object.entries(map).map(([label, value]) => ({ label, value }))
})

// 饼状图数据：按浏览器
const browserData = computed(() => {
  const map = {}
  daySessions.value.forEach(s => {
    const b = s.device ? s.device.browser : '未知'
    map[b] = (map[b] || 0) + 1
  })
  return Object.entries(map).map(([label, value]) => ({ label, value }))
})

// 饼状图数据：按页面浏览量
const pageData = computed(() => {
  const map = {}
  daySessions.value.forEach(s => {
    if (!s.pages) return
    s.pages.forEach(p => { map[p.name] = (map[p.name] || 0) + 1 })
  })
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label, value }))
})

// 饼状图数据：按位置
const locationData = computed(() => {
  const map = {}
  daySessions.value.forEach(s => {
    const loc = (s.device && s.device.location) || '未知'
    map[loc] = (map[loc] || 0) + 1
  })
  return Object.entries(map).map(([label, value]) => ({ label, value }))
})

const formatDuration = (sec) => {
  if (!sec) return '0秒'
  if (sec < 60) return `${sec}秒`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s ? `${m}分${s}秒` : `${m}分`
}
</script>
