<template>
  <div class="max-w-[700px] mx-auto px-4 py-8">
    <h1 class="font-serif text-3xl text-ink text-center mb-8 tracking-wider">设置</h1>

    <!-- MiniMax API -->
    <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 mb-6">
      <h2 class="font-serif text-lg text-ink mb-4">MiniMax API</h2>
      <p class="text-sm text-light-ink mb-3">用于 AI 聊天功能，密钥仅存储在浏览器本地</p>
      <input v-model="minimaxKey" type="password" placeholder="sk-api-..." class="w-full px-4 py-2.5 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none focus:border-rose transition-colors">
      <div class="flex items-center gap-2 mt-3">
        <button @click="testMinimax" :disabled="!minimaxKey || testingChat" class="px-4 py-1.5 rounded-full text-sm bg-deep-rose text-white hover:bg-rose transition-colors disabled:opacity-40">
          {{ testingChat ? '测试中...' : '测试连接' }}
        </button>
        <span v-if="chatStatus" class="text-sm" :class="chatStatus === 'ok' ? 'text-green-600' : 'text-red-500'">
          {{ chatStatus === 'ok' ? '连接成功' : '连接失败' }}
        </span>
      </div>
    </div>

    <!-- GitHub API -->
    <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 mb-6">
      <h2 class="font-serif text-lg text-ink mb-4">GitHub 同步</h2>
      <p class="text-sm text-light-ink mb-3">用于数据持久化和图片存储，需要 repo 的读写权限</p>
      <div class="space-y-3">
        <input v-model="githubToken" type="password" placeholder="GitHub Personal Access Token" class="w-full px-4 py-2.5 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none focus:border-rose transition-colors">
        <div class="flex gap-3">
          <input v-model="githubOwner" placeholder="用户名 (owner)" class="flex-1 px-4 py-2.5 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none focus:border-rose transition-colors">
          <input v-model="githubRepo" placeholder="仓库名 (repo)" class="flex-1 px-4 py-2.5 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none focus:border-rose transition-colors">
        </div>
      </div>
      <div class="flex items-center gap-2 mt-3">
        <button @click="testGithub" :disabled="!githubToken || !githubOwner || !githubRepo || testingGithub" class="px-4 py-1.5 rounded-full text-sm bg-friend-blue text-white hover:bg-friend-border transition-colors disabled:opacity-40">
          {{ testingGithub ? '测试中...' : '测试连接' }}
        </button>
        <span v-if="githubStatus" class="text-sm" :class="githubStatus === 'ok' ? 'text-green-600' : 'text-red-500'">
          {{ githubStatus === 'ok' ? '连接成功' : '连接失败' }}
        </span>
      </div>
    </div>

    <!-- tips -->
    <div class="text-sm text-light-ink text-center mt-8 space-y-1">
      <p>所有密钥仅存储在你的浏览器 localStorage 中</p>
      <p>不会发送到除对应 API 以外的任何地方</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import { useSettings } from '@/composables/use_settings'
import { testConnection } from '@/libs/github'

const { minimaxKey, githubToken, githubOwner, githubRepo } = useSettings()

const testingChat = ref(false)
const chatStatus = ref('')
const testingGithub = ref(false)
const githubStatus = ref('')

const testMinimax = async () => {
  testingChat.value = true
  chatStatus.value = ''
  try {
    const res = await fetch('/api/minimax/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${minimaxKey.value}`
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.5',
        max_tokens: 16,
        messages: [{ role: 'user', content: 'hi' }]
      })
    })
    chatStatus.value = res.ok ? 'ok' : 'fail'
  } catch {
    chatStatus.value = 'fail'
  }
  testingChat.value = false
}

const testGithub = async () => {
  testingGithub.value = true
  githubStatus.value = ''
  const ok = await testConnection(githubToken.value, githubOwner.value, githubRepo.value)
  githubStatus.value = ok ? 'ok' : 'fail'
  testingGithub.value = false
}
</script>
