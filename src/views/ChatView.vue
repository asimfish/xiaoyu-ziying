<template>
  <div class="max-w-[700px] mx-auto px-4 py-8 flex flex-col" style="min-height: calc(100vh - 48px)">
    <h1 class="font-serif text-3xl text-ink text-center mb-8 tracking-wider">聊天</h1>

    <!-- scene picker -->
    <div v-if="!activeScene" class="flex-1 flex flex-col justify-center">
      <p class="text-center text-light-ink mb-6">选择一个聊天场景</p>
      <ChatScenePicker @select="selectScene" />
      <p v-if="!hasClaudeKey()" class="text-center text-sm text-light-ink mt-6">
        需要先在 <router-link to="/settings" class="text-deep-rose underline">设置</router-link> 中配置 Claude API Key，或在 .env 文件中设置 VITE_CLAUDE_API_KEY
      </p>
      <p v-else-if="hasEnvClaudeKey()" class="text-center text-xs text-light-ink/60 mt-6">
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
        <button @click="resetChat" class="text-sm text-light-ink hover:text-ink transition-colors">换场景</button>
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
import { ref, nextTick, computed } from 'vue'

import ChatScenePicker from '@/components/ChatScenePicker.vue'
import ChatBubble from '@/components/ChatBubble.vue'
import ChatInput from '@/components/ChatInput.vue'
import { useSettings } from '@/composables/use_settings'

const base = import.meta.env.BASE_URL
const { claudeKey, hasClaudeKey, hasEnvClaudeKey } = useSettings()

const activeScene = ref(null)
const messages = ref([])
const loading = ref(false)
const messagesRef = ref(null)

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

const selectScene = (scene) => {
  activeScene.value = scene
  messages.value = []
}

const resetChat = () => {
  activeScene.value = null
  messages.value = []
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

const sendMessage = async (text) => {
  if (!hasClaudeKey()) return

  messages.value.push({ role: 'user', content: text })
  scrollToBottom()
  loading.value = true

  try {
    const apiMessages = messages.value.map(m => ({
      role: m.role,
      content: m.content
    }))

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey.value,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: activeScene.value.system,
        messages: apiMessages
      })
    })

    if (res.ok) {
      const data = await res.json()
      const reply = data.content[0].text
      messages.value.push({ role: 'assistant', content: reply })
    } else {
      messages.value.push({ role: 'assistant', content: '抱歉，出了点问题...' })
    }
  } catch {
    messages.value.push({ role: 'assistant', content: '网络错误，请稍后再试' })
  }

  loading.value = false
  scrollToBottom()
}
</script>
