<template>
  <div class="max-w-[700px] mx-auto px-4 py-8">
    <h1 class="font-serif text-3xl text-ink text-center mb-8 tracking-wider">动态</h1>

    <!-- 发帖/编辑区 -->
    <DiaryComposer
      :editing-diary="editingDiary"
      :current-user="currentUser"
      @submit="onSubmit"
      @cancel="editingId = null"
    />

    <!-- 筛选栏 -->
    <DiaryFilterBar v-model:author-filter="authorFilter" v-model:keyword="keyword" />

    <!-- 动态列表 -->
    <template v-if="loaded">
      <DiaryCard
        v-for="d in filteredDiaries" :key="d.id"
        :diary="d"
        :current-user="currentUser"
        @like="onLike"
        @react="onReact"
        @comment="onComment"
        @edit="onEdit"
        @delete="onDelete"
      />
      <p v-if="!filteredDiaries.length" class="text-center text-light-ink py-16">
        {{ keyword || authorFilter ? '没有找到相关动态' : '还没有动态，发一条吧' }}
      </p>
    </template>
    <p v-else class="text-center text-light-ink py-16 animate-pulse">加载中...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import { getUser } from '@/router'
import { useAutoSync } from '@/composables/use_auto_sync'
import { normalizeDiary, mergeDiaries, normalizeUserId } from '@/libs/diary_helpers'
import DiaryComposer from '@/components/diary_composer.vue'
import DiaryCard from '@/components/diary_card.vue'
import DiaryFilterBar from '@/components/diary_filter_bar.vue'
import dayjs from 'dayjs'

// 登录名 → 标准 key（'小鱼' → 'xiaoyu'，'root' → 'xiaoyu'）
const currentUser = normalizeUserId(getUser())

const { data: diariesRaw, save, init, loaded } = useAutoSync('diaries', { merge: mergeDiaries })

const authorFilter = ref('')
const keyword = ref('')
const editingId = ref(null)

// 标准化 + 排序 + 筛选
const allDiaries = computed(() => diariesRaw.value.map(normalizeDiary).sort((a, b) => b.id - a.id))

const filteredDiaries = computed(() => {
  let list = allDiaries.value
  if (authorFilter.value) list = list.filter(d => d.author === authorFilter.value)
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(d => (d.title + d.content).toLowerCase().includes(kw))
  }
  return list
})

const editingDiary = computed(() => {
  if (!editingId.value) return null
  return allDiaries.value.find(d => d.id === editingId.value)
})

// 不可变更新单条动态
const updateDiary = (id, updater) => {
  const newList = diariesRaw.value.map(d => d.id === id ? updater(normalizeDiary(d)) : d)
  return save(newList)
}

// 发布/编辑
const onSubmit = async (payload) => {
  if (editingId.value) {
    await updateDiary(editingId.value, (d) => ({
      ...d,
      title: payload.title,
      content: payload.content,
      images: payload.images,
      mood: payload.mood,
      weather: payload.weather,
      edited: true
    }))
    editingId.value = null
    return
  }
  const newDiary = {
    id: Date.now(),
    title: payload.title,
    content: payload.content,
    images: payload.images,
    mood: payload.mood,
    weather: payload.weather,
    location: payload.location,
    date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    author: payload.author,
    likes: [],
    reactions: {},
    comments: [],
    edited: false
  }
  await save([...diariesRaw.value, newDiary])
}

// 点赞
const onLike = (diaryId) => {
  updateDiary(diaryId, (d) => {
    const has = d.likes.includes(currentUser)
    return { ...d, likes: has ? d.likes.filter(u => u !== currentUser) : [...d.likes, currentUser] }
  })
}

// 表情反应
const onReact = ({ diaryId, emoji }) => {
  updateDiary(diaryId, (d) => {
    const users = d.reactions[emoji] ?? []
    const has = users.includes(currentUser)
    const newUsers = has ? users.filter(u => u !== currentUser) : [...users, currentUser]
    const newReactions = { ...d.reactions }
    if (newUsers.length) { newReactions[emoji] = newUsers } else { delete newReactions[emoji] }
    return { ...d, reactions: newReactions }
  })
}

// 评论
const onComment = ({ diaryId, content, replyTo }) => {
  updateDiary(diaryId, (d) => ({
    ...d,
    comments: [...d.comments, {
      id: Date.now(),
      author: currentUser,
      content,
      date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      replyTo
    }]
  }))
}

// 编辑
const onEdit = (diaryId) => { editingId.value = diaryId; window.scrollTo({ top: 0, behavior: 'smooth' }) }

// 删除
const onDelete = (diaryId) => {
  save(diariesRaw.value.filter(d => d.id !== diaryId))
}

onMounted(() => init())
</script>
