<template>
  <div class="max-w-[700px] mx-auto px-4 py-8">
    <h1 class="font-serif text-3xl text-ink text-center mb-8 tracking-wider">日记</h1>

    <!-- new diary form -->
    <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 mb-8">
      <IdentityPicker v-model="newAuthor" />
      <input v-model="newTitle" placeholder="标题" class="w-full text-lg font-serif text-ink bg-transparent border-b border-warm pb-2 mb-4 outline-none placeholder:text-light-ink/50">
      <textarea v-model="newContent" placeholder="写点什么..." rows="4" class="w-full text-ink bg-transparent border-none outline-none resize-none leading-[1.8] placeholder:text-light-ink/50"></textarea>
      <div class="flex justify-end mt-4">
        <button @click="addDiary" :disabled="!newTitle.trim() || !newContent.trim()" class="px-6 py-2 rounded-full bg-deep-rose text-white text-sm tracking-wider hover:bg-rose transition-colors disabled:opacity-40 disabled:cursor-not-allowed">保存</button>
      </div>
    </div>

    <!-- actions -->
    <div class="flex justify-end gap-3 mb-6 text-sm">
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
import { useAutoSync } from '@/composables/use_auto_sync'
import dayjs from 'dayjs'

const { data: diariesRaw, save, init } = useAutoSync('diaries')
const diaries = computed(() => [...diariesRaw.value].sort((a, b) => b.id - a.id))

const newTitle = ref('')
const newContent = ref('')
const newAuthor = ref('xiaoyu')

const addDiary = async () => {
  if (!newTitle.value.trim() || !newContent.value.trim()) return
  const newList = [...diariesRaw.value, {
    id: Date.now(),
    title: newTitle.value.trim(),
    content: newContent.value.trim(),
    date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    author: newAuthor.value
  }]
  newTitle.value = ''
  newContent.value = ''
  await save(newList)
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

const importData = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result)
      if (Array.isArray(parsed)) await save(parsed)
    } catch { /* ignore */ }
  }
  reader.readAsText(file)
}

onMounted(() => init())
</script>
