<template>
  <div class="max-w-[700px] mx-auto px-4 py-8">
    <h1 class="font-serif text-3xl text-ink text-center mb-8 tracking-wider">公告板</h1>

    <!-- add form -->
    <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 mb-8">
      <IdentityPicker v-model="newAuthor" />
      <input v-model="newTitle" placeholder="公告标题" class="w-full text-lg font-serif text-ink bg-transparent border-b border-warm pb-2 mb-4 outline-none placeholder:text-light-ink/50">
      <textarea v-model="newContent" placeholder="公告内容..." rows="3" class="w-full text-ink bg-transparent border-none outline-none resize-none leading-[1.8] placeholder:text-light-ink/50"></textarea>
      <div class="flex justify-between items-center mt-4">
        <span v-if="syncing" class="text-sm text-light-ink">同步中...</span>
        <span v-else></span>
        <button @click="addAnnouncement" :disabled="!newTitle.trim() || !newContent.trim()" class="px-6 py-2 rounded-full bg-deep-rose text-white text-sm tracking-wider hover:bg-rose transition-colors disabled:opacity-40">发布</button>
      </div>
    </div>

    <!-- sync status -->
    <div v-if="syncing" class="flex justify-end mb-6">
      <span class="text-sm text-friend-blue">同步中...</span>
    </div>

    <!-- list -->
    <div v-for="a in announcements" :key="a.id" class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 mb-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-serif text-lg text-ink">{{ a.title }}</h2>
        <span class="text-xs text-light-ink">{{ a.date }}</span>
      </div>
      <p class="text-ink leading-[1.8] whitespace-pre-wrap">{{ a.content }}</p>
      <p class="text-sm text-light-ink mt-3">-- {{ a.author === 'xiaoyu' ? '小鱼' : '梓樱' }}</p>
    </div>
    <p v-if="!announcements.length" class="text-center text-light-ink py-16">还没有公告</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import IdentityPicker from '@/components/IdentityPicker.vue'
import { useGithubSync } from '@/composables/use_github_sync'
import dayjs from 'dayjs'

const STORAGE_KEY = 'memorial-announcements'
const { syncing, loadRemote, saveRemote, hasGithubConfig } = useGithubSync()

const loadData = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
  catch { return [] }
}

const raw = ref(loadData())
const announcements = computed(() => [...raw.value].sort((a, b) => b.id - a.id))
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(raw.value))

const newTitle = ref('')
const newContent = ref('')
const newAuthor = ref('xiaoyu')

const addAnnouncement = async () => {
  if (!newTitle.value.trim() || !newContent.value.trim()) return
  raw.value.push({
    id: Date.now(),
    title: newTitle.value.trim(),
    content: newContent.value.trim(),
    date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    author: newAuthor.value
  })
  save()
  newTitle.value = ''
  newContent.value = ''

  if (hasGithubConfig()) {
    await saveRemote('announcements', raw.value)
  }
}

onMounted(async () => {
  if (hasGithubConfig()) {
    const remote = await loadRemote('announcements')
    if (remote && remote.data && remote.data.length) {
      const map = new Map()
      remote.data.forEach(d => map.set(d.id, d))
      raw.value.forEach(d => map.set(d.id, d))
      raw.value = [...map.values()]
      save()
    }
  }
})
</script>
