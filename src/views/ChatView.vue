<template>
  <div class="max-w-[700px] mx-auto px-4 py-8 flex flex-col" style="min-height: calc(100vh - 48px)">
    <h1 class="font-serif text-3xl text-ink text-center mb-8 tracking-wider">聊天</h1>

    <!-- scene picker -->
    <div v-if="!activeScene" class="flex-1 flex flex-col justify-center">
      <p class="text-center text-light-ink mb-6">选择一个聊天场景</p>
      <ChatScenePicker @select="selectScene" />
      <p v-if="!hasChatKey()" class="text-center text-sm text-light-ink mt-6">
        需要先在 <router-link to="/settings" class="text-deep-rose underline">设置</router-link> 中配置 MiniMax API Key，或在 .env 文件中设置 VITE_MINIMAX_API_KEY
      </p>
      <p v-else-if="hasEnvChatKey()" class="text-center text-xs text-light-ink/60 mt-6">
        已从环境变量读取 API Key
      </p>
    </div>

    <!-- chat area -->
    <template v-else>
      <!-- header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <span class="text-sm text-light-ink">{{ activeScene.label }}</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-warm text-light-ink">{{ activeScene.bot }} 回复中</span>
        </div>
        <div class="flex items-center gap-3">
          <button @click="newConversation" class="text-sm text-friend-blue hover:text-friend-border transition-colors">新对话</button>
          <button @click="resetChat" class="text-sm text-light-ink hover:text-ink transition-colors">换场景</button>
        </div>
      </div>

      <!-- messages -->
      <div ref="messagesRef" class="flex-1 overflow-y-auto mb-4 space-y-1">
        <ChatBubble
          v-for="(msg, i) in messages" :key="i"
          :text="msg.content"
          :isUser="msg.role === 'user'"
          :avatar="msg.role === 'user' ? userAvatar : botAvatar"
        />
        <div v-if="loading" class="flex gap-3">
          <img :src="botAvatar" alt="" class="w-8 h-8 rounded-full object-cover shrink-0 mt-1">
          <div class="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-light-ink">
            正在输入...
          </div>
        </div>
      </div>

      <!-- input -->
      <ChatInput :loading="loading" @send="sendMessage" />
    </template>
  </div>
</template>
<script setup>
import { ref, nextTick, computed, onBeforeUnmount } from 'vue'

import ChatScenePicker from '@/components/ChatScenePicker.vue'
import ChatBubble from '@/components/ChatBubble.vue'
import ChatInput from '@/components/ChatInput.vue'
import { useSettings } from '@/composables/use_settings'
import { useGithubSync } from '@/composables/use_github_sync'
import dayjs from 'dayjs'

const base = import.meta.env.BASE_URL
const { minimaxKey, hasChatKey, hasEnvChatKey } = useSettings()
const { loadRemote, saveRemote, hasGithubConfig } = useGithubSync()

const activeScene = ref(null)
const messages = ref([])
const loading = ref(false)
const messagesRef = ref(null)
const conversationId = ref(null)

const avatars = {
  xiaoyu: `${base}assets/images/avatars/xiaoyu.png`,
  ziying: `${base}assets/images/avatars/ziying.png`,
  inner: `${base}assets/images/avatars/xiaoyu.png`
}

const userAvatar = computed(() => {
  if (!activeScene.value) return ''
  const u = activeScene.value.user
  return u === '小鱼' ? avatars.xiaoyu : avatars.ziying
})

const botAvatar = computed(() => {
  if (!activeScene.value) return ''
  const id = activeScene.value.id
  if (id === 'xiaoyu-to-ziying') return avatars.ziying
  if (id === 'ziying-to-xiaoyu') return avatars.xiaoyu
  if (id === 'xiaoyu-inner') return avatars.xiaoyu
  return avatars.ziying
})

// 保存当前对话到 GitHub
const saveChat = async () => {
  if (!activeScene.value || !messages.value.length || !hasGithubConfig()) return
  const sceneId = activeScene.value.id
  const remote = await loadRemote('chats')
  const allChats = (remote && remote.data) ? remote.data : {}
  if (!allChats[sceneId]) allChats[sceneId] = []
  const idx = allChats[sceneId].findIndex(c => c.id === conversationId.value)
  const chatRecord = {
    id: conversationId.value,
    messages: messages.value.map(m => ({ role: m.role, content: m.content })),
    date: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  if (idx >= 0) {
    allChats[sceneId][idx] = chatRecord
  } else {
    allChats[sceneId].push(chatRecord)
  }
  await saveRemote('chats', allChats)
}

// 加载场景的历史记录（最近一次对话）
const loadHistory = async (sceneId) => {
  if (!hasGithubConfig()) return
  const remote = await loadRemote('chats')
  if (!remote || !remote.data || !remote.data[sceneId]) return
  const chats = remote.data[sceneId]
  if (!chats.length) return
  // 加载最近一次对话
  const latest = chats[chats.length - 1]
  messages.value = latest.messages.map(m => ({ role: m.role, content: m.content }))
  conversationId.value = latest.id
  scrollToBottom()
}

// 加载额外记忆
const loadExtraMemory = async () => {
  if (!hasGithubConfig()) return ''
  const remote = await loadRemote('chat_memory_extra')
  if (!remote || !remote.data || !remote.data.length) return ''
  return '\n\n【用户补充的额外记忆】\n' + remote.data.map(m => m.summary).join('\n')
}

const selectScene = async (scene) => {
  activeScene.value = scene
  messages.value = []
  conversationId.value = Date.now()
  await loadHistory(scene.id)
}

const newConversation = async () => {
  await saveChat()
  messages.value = []
  conversationId.value = Date.now()
}

const resetChat = async () => {
  await saveChat()
  activeScene.value = null
  messages.value = []
  conversationId.value = null
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

const sendMessage = async (text) => {
  if (!hasChatKey()) return

  messages.value.push({ role: 'user', content: text })
  scrollToBottom()
  loading.value = true

  try {
    const extraMemory = await loadExtraMemory()
    const systemContent = activeScene.value.system + extraMemory
    const apiMessages = [
      { role: 'system', content: systemContent },
      ...messages.value.map(m => ({ role: m.role, content: m.content }))
    ]

    const res = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${minimaxKey.value}`
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.5',
        max_tokens: 2048,
        messages: apiMessages
      })
    })

    if (res.ok) {
      const data = await res.json()
      const msg = data.choices[0].message
      const reply = msg.content || msg.reasoning_content || '...'
      messages.value.push({ role: 'assistant', content: reply })
    } else {
      messages.value.push({ role: 'assistant', content: '抱歉，出了点问题...' })
    }
  } catch {
    messages.value.push({ role: 'assistant', content: '网络错误，请稍后再试' })
  }

  loading.value = false
  scrollToBottom()
  // 每次对话后自动保存
  saveChat()
}

// 离开页面时保存
onBeforeUnmount(() => {
  saveChat()
})
</script>
