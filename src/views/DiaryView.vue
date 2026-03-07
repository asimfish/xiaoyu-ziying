<template>
  <div class="max-w-[700px] mx-auto px-4 py-8">
    <h1 class="font-serif text-3xl text-ink text-center mb-8 tracking-wider">日记</h1>

    <!-- new diary form -->
    <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 mb-8">
      <IdentityPicker v-model="newAuthor" />
      <input v-model="newTitle" placeholder="标题" class="w-full text-lg font-serif text-ink bg-transparent border-b border-warm pb-2 mb-4 outline-none placeholder:text-light-ink/50">
      <textarea v-model="newContent" placeholder="写点什么..." rows="4" class="w-full text-ink bg-transparent border-none outline-none resize-none leading-[1.8] placeholder:text-light-ink/50"></textarea>
      <div class="flex justify-between items-center mt-4">
        <span v-if="syncing" class="text-sm text-light-ink">同步中...</span>
        <span v-else-if="lastError" class="text-sm text-red-500">{{ lastError }}</span>
        <span v-else></span>
        <button @click="addDiary" :disabled="!newTitle.trim() || !newContent.trim()" class="px-6 py-2 rounded-full bg-deep-rose text-white text-sm tracking-wider hover:bg-rose transition-colors disabled:opacity-40 disabled:cursor-not-allowed">保存</button>
      </div>
    </div>

    <!-- actions -->
    <div class="flex justify-end gap-3 mb-6 text-sm">
      <span v-if="syncing" class="text-friend-blue">同步中...</span>
      <button @click="exportData" class="text-light-ink hover:text-ink transition-colors">导出</button>
      <label class="text-light-ink hover:text-ink transition-colors cursor-pointer">
        导入
        <input type="file" accept=".json" class="hidden" @change="importData">
      </label>
    </div>

    <!-- diary list -->
    <DiaryEntry v-for="d in diaries" :key="d.id" :title="d.title" :content="d.content" :date="d.date" :author="d.author" />
    <p v-if="!diaries.length" class="text-center text-light-ink py-16">还没有日记，写下第一篇吧</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import DiaryEntry from '@/components/DiaryEntry.vue'
import IdentityPicker from '@/components/IdentityPicker.vue'
import { useGithubSync } from '@/composables/use_github_sync'

const STORAGE_KEY = 'memorial-diaries'

const { syncing, lastError, loadRemote, saveRemote, hasGithubConfig } = useGithubSync()

const loadDiaries = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

const diariesRaw = ref(loadDiaries())
const diaries = computed(() => [...diariesRaw.value].sort((a, b) => b.id - a.id))

const saveDiaries = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(diariesRaw.value))

const newTitle = ref('')
const newContent = ref('')
const newAuthor = ref('xiaoyu')

const addDiary = async () => {
  if (!newTitle.value.trim() || !newContent.value.trim()) return
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  diariesRaw.value.push({
    id: Date.now(),
    title: newTitle.value.trim(),
    content: newContent.value.trim(),
    date,
    author: newAuthor.value
  })
  saveDiaries()
  newTitle.value = ''
  newContent.value = ''

  // 自动同步到 GitHub
  if (hasGithubConfig()) {
    await saveRemote('diaries', diariesRaw.value)
  }
}

const exportData = () => {
  const blob = new Blob([JSON.stringify(diariesRaw.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'memorial-diaries.json'
  a.click()
  URL.revokeObjectURL(url)
}

const importData = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result)
      if (Array.isArray(data)) {
        diariesRaw.value = data
        saveDiaries()
      }
    } catch {
      // ignore invalid json
    }
  }
  reader.readAsText(file)
}

onMounted(async () => {
  // GitHub 优先加载
  if (hasGithubConfig()) {
    const remote = await loadRemote('diaries')
    if (remote && remote.data && remote.data.length) {
      // 合并远程和本地
      const map = new Map()
      remote.data.forEach(d => map.set(d.id, d))
      diariesRaw.value.forEach(d => map.set(d.id, d))
      diariesRaw.value = [...map.values()]
      saveDiaries()
    }
  }
})
</script>
