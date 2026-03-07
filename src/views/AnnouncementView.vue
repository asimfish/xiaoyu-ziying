<template>
  <div class="max-w-[700px] mx-auto px-4 py-8">
    <h1 class="font-serif text-3xl text-ink text-center mb-8 tracking-wider">公告板</h1>

    <!-- add form -->
    <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 mb-8">
      <IdentityPicker v-model="newAuthor" />
      <input v-model="newTitle" placeholder="公告标题" class="w-full text-lg font-serif text-ink bg-transparent border-b border-warm pb-2 mb-4 outline-none placeholder:text-light-ink/50">
      <textarea v-model="newContent" placeholder="公告内容..." rows="3" class="w-full text-ink bg-transparent border-none outline-none resize-none leading-[1.8] placeholder:text-light-ink/50"></textarea>
      <div class="flex justify-end mt-4">
        <button @click="addAnnouncement" :disabled="!newTitle.trim() || !newContent.trim()" class="px-6 py-2 rounded-full bg-deep-rose text-white text-sm tracking-wider hover:bg-rose transition-colors disabled:opacity-40">发布</button>
      </div>
    </div>

    <!-- list -->
    <template v-if="loaded">
      <div v-for="a in announcements" :key="a.id" class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 mb-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-serif text-lg text-ink">{{ a.title }}</h2>
          <span class="text-xs text-light-ink">{{ a.date }}</span>
        </div>
        <p class="text-ink leading-[1.8] whitespace-pre-wrap">{{ a.content }}</p>
        <p class="text-sm text-light-ink mt-3">-- {{ a.author === 'xiaoyu' ? '小鱼' : '梓樱' }}</p>
      </div>
      <p v-if="!announcements.length" class="text-center text-light-ink py-16">还没有公告</p>
    </template>
    <p v-else class="text-center text-light-ink py-16 animate-pulse">加载中...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import IdentityPicker from '@/components/IdentityPicker.vue'
import { useAutoSync } from '@/composables/use_auto_sync'
import dayjs from 'dayjs'

const { data: raw, save, init, loaded } = useAutoSync('announcements')
const announcements = computed(() => [...raw.value].sort((a, b) => b.id - a.id))

const newTitle = ref('')
const newContent = ref('')
const newAuthor = ref('xiaoyu')

const addAnnouncement = async () => {
  if (!newTitle.value.trim() || !newContent.value.trim()) return
  const newList = [...raw.value, {
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

onMounted(() => init())
</script>
