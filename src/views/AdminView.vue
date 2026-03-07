<template>
  <div class="max-w-[800px] mx-auto px-4 py-8">
    <h1 class="font-serif text-3xl text-ink text-center mb-8 tracking-wider">管理后台</h1>

    <!-- 标签页 -->
    <div class="flex gap-1 mb-6 bg-warm/50 rounded-xl p-1">
      <button
        v-for="tab in tabs" :key="tab.id"
        @click="activeTab = tab.id"
        class="flex-1 px-4 py-2 rounded-lg text-sm transition-all"
        :class="activeTab === tab.id ? 'bg-white text-ink shadow-sm' : 'text-light-ink hover:text-ink'"
      >{{ tab.label }}</button>
    </div>

    <!-- 概览 -->
    <div v-if="activeTab === 'overview'">
      <!-- 在线状态卡片 -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div v-for="u in ['小鱼', '梓樱']" :key="u" class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="relative">
              <img :src="getAvatar(u)" alt="" class="w-12 h-12 rounded-full object-cover">
              <span class="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span v-if="isOnline(u)" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-white" :class="isOnline(u) ? 'bg-green-500' : 'bg-gray-300'"></span>
              </span>
            </div>
            <div>
              <div class="text-ink font-serif">{{ u }}</div>
              <div class="text-xs" :class="isOnline(u) ? 'text-green-600' : 'text-light-ink'">
                {{ isOnline(u) ? '在线' : '离线' }}
              </div>
            </div>
          </div>
          <div v-if="onlineStatus[u]" class="space-y-1 text-sm">
            <div v-if="isOnline(u) && onlineStatus[u].pageName" class="flex justify-between">
              <span class="text-light-ink">当前页面</span>
              <span class="text-ink">{{ onlineStatus[u].pageName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-light-ink">最后活跃</span>
              <span class="text-ink">{{ onlineStatus[u].lastSeen }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 概览统计 -->
      <div v-if="!loading" class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4 text-center">
          <div class="text-2xl font-serif text-ink">{{ sessions.length }}</div>
          <div class="text-sm text-light-ink mt-1">总访问次数</div>
        </div>
        <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4 text-center">
          <div class="text-sm font-serif text-ink">{{ overviewLastVisit }}</div>
          <div class="text-sm text-light-ink mt-1">最近访问</div>
        </div>
        <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4 text-center">
          <div class="text-sm font-serif text-ink">{{ overviewTopPage }}</div>
          <div class="text-sm text-light-ink mt-1">最常访问页面</div>
        </div>
      </div>
      <div v-if="loading" class="text-center text-light-ink py-16">加载中...</div>
    </div>

    <!-- 每日总结 -->
    <div v-if="activeTab === 'daily'">
      <DailySummary :sessions="sessions" />
    </div>

    <!-- 梓樱的记录 -->
    <div v-if="activeTab === 'ziying'">
      <UserRecords :sessions="ziyingSessions" :loading="loading" user="梓樱" />
    </div>

    <!-- 小鱼的记录 -->
    <div v-if="activeTab === 'xiaoyu'">
      <UserRecords :sessions="xiaoyuSessions" :loading="loading" user="小鱼" />
    </div>

    <!-- 聊天记录 -->
    <div v-if="activeTab === 'chats'">
      <div v-if="loading" class="text-center text-light-ink py-16">加载中...</div>
      <div v-else-if="!chatSceneIds.length" class="text-center text-light-ink py-16">暂无聊天记录</div>
      <template v-else>
        <div v-for="sceneId in chatSceneIds" :key="sceneId" class="mb-8">
          <h2 class="font-serif text-lg text-ink mb-4">{{ getSceneLabel(sceneId) }}</h2>
          <div v-for="chat in allChats[sceneId]" :key="chat.id" class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5 mb-3">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm text-light-ink">{{ chat.date }}</span>
              <button
                @click="addToMemory(sceneId, chat)"
                class="text-xs px-3 py-1 rounded-full transition-colors"
                :class="isInMemory(chat.id) ? 'bg-green-50 text-green-600' : 'bg-cream text-light-ink hover:text-deep-rose hover:bg-rose/10'"
              >{{ isInMemory(chat.id) ? '已加入记忆' : '加入 AI 记忆' }}</button>
            </div>
            <div class="space-y-2">
              <div v-for="(msg, i) in chat.messages.slice(0, 6)" :key="i" class="text-sm">
                <span class="text-deep-rose">{{ msg.role === 'user' ? '用户' : 'AI' }}:</span>
                <span class="text-ink ml-1">{{ msg.content.slice(0, 100) }}{{ msg.content.length > 100 ? '...' : '' }}</span>
              </div>
              <div v-if="chat.messages.length > 6" class="text-xs text-light-ink">...还有 {{ chat.messages.length - 6 }} 条消息</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

import UserRecords from '@/components/UserRecords.vue'
import DailySummary from '@/components/DailySummary.vue'
import { useGithubSync } from '@/composables/use_github_sync'
import { onlineStatus, isOnline, fetchOnlineStatus } from '@/composables/use_online'

const base = import.meta.env.BASE_URL
const { loadRemote, saveRemote } = useGithubSync()

const tabs = [
  { id: 'overview', label: '概览' },
  { id: 'daily', label: '每日总结' },
  { id: 'ziying', label: '梓樱的记录' },
  { id: 'xiaoyu', label: '小鱼的记录' },
  { id: 'chats', label: '聊天记录' }
]

const activeTab = ref('overview')
const loading = ref(true)
const sessions = ref([])
const allChats = ref({})
const memoryIds = ref(new Set())

let pollTimer = null
let dataPollTimer = null

const getAvatar = (u) => u === '小鱼'
  ? `${base}assets/images/avatars/xiaoyu.png`
  : `${base}assets/images/avatars/ziying.png`

const sceneLabels = {
  'xiaoyu-to-ziying': '和梓樱聊天',
  'ziying-to-xiaoyu': '和小鱼聊天',
  'xiaoyu-inner': '小鱼的内心',
  'ziying-inner': '梓樱的内心'
}

const getSceneLabel = (id) => sceneLabels[id] || id

const ziyingSessions = computed(() =>
  sessions.value.filter(s => s.user === '梓樱').sort((a, b) => b.loginTime.localeCompare(a.loginTime))
)

const xiaoyuSessions = computed(() =>
  sessions.value.filter(s => s.user === '小鱼').sort((a, b) => b.loginTime.localeCompare(a.loginTime))
)

const chatSceneIds = computed(() => Object.keys(allChats.value).filter(k => allChats.value[k].length))

const overviewLastVisit = computed(() => {
  if (!sessions.value.length) return '-'
  const sorted = [...sessions.value].sort((a, b) => b.loginTime.localeCompare(a.loginTime))
  return sorted[0].loginTime
})

const overviewTopPage = computed(() => {
  const count = {}
  sessions.value.forEach(s => {
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

const isInMemory = (chatId) => memoryIds.value.has(chatId)

const addToMemory = async (sceneId, chat) => {
  if (isInMemory(chat.id)) return
  const remote = await loadRemote('chat_memory_extra')
  const memories = (remote && remote.data) ? remote.data : []
  // 生成摘要：取前3条消息
  const preview = chat.messages.slice(0, 3).map(m => `${m.role === 'user' ? '用户' : 'AI'}: ${m.content.slice(0, 50)}`).join(' | ')
  memories.push({
    id: chat.id,
    sceneId,
    sceneLabel: getSceneLabel(sceneId),
    summary: `[${chat.date}] ${getSceneLabel(sceneId)}: ${preview}`,
    date: chat.date
  })
  await saveRemote('chat_memory_extra', memories)
  memoryIds.value = new Set([...memoryIds.value, chat.id])
}

// 3秒轮询刷新 analytics + chats
const pollData = async () => {
  const remote = await loadRemote('analytics')
  if (remote && remote.data && Array.isArray(remote.data)) {
    sessions.value = remote.data.sort((a, b) => b.loginTime.localeCompare(a.loginTime))
  }
  // 聊天记录也刷新
  const chatRemote = await loadRemote('chats')
  if (chatRemote && chatRemote.data) allChats.value = chatRemote.data
}

onMounted(async () => {
  fetchOnlineStatus()
  pollTimer = setInterval(fetchOnlineStatus, 15000)
  await pollData()
  loading.value = false
  // 加载记忆 ID
  const memRemote = await loadRemote('chat_memory_extra')
  if (memRemote && memRemote.data) {
    memoryIds.value = new Set(memRemote.data.map(m => m.id))
  }
  dataPollTimer = setInterval(pollData, 15000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
  if (dataPollTimer) clearInterval(dataPollTimer)
})
</script>
