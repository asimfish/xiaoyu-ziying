<template>
  <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5 mb-4">
    <!-- 头部：头像 + 昵称 + 时间 + 标签 + 菜单 -->
    <div class="flex items-start gap-3">
      <img :src="user.avatar" alt="" class="w-10 h-10 rounded-full object-cover shrink-0">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium" :class="diary.author === 'xiaoyu' ? 'text-deep-rose' : 'text-friend-blue'">{{ user.label }}</span>
          <span v-if="diary.mood" class="text-xs px-1.5 py-0.5 rounded-full bg-warm text-light-ink">{{ moodLabel(diary.mood) }}</span>
          <span v-if="diary.weather" class="text-xs px-1.5 py-0.5 rounded-full bg-warm text-light-ink">{{ weatherLabel(diary.weather) }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-xs text-light-ink/70 mt-0.5">
          <span>{{ relativeTimeStr(diary.date) }}</span>
          <span v-if="diary.edited" class="text-light-ink/50">. 已编辑</span>
        </div>
      </div>
      <!-- 操作菜单 -->
      <div v-if="isOwner" class="relative shrink-0">
        <button class="w-8 h-8 flex items-center justify-center rounded-full text-light-ink hover:bg-warm/50 transition-colors" @click="showMenu = !showMenu">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
        </button>
        <div v-if="showMenu" class="absolute right-0 top-9 bg-white rounded-lg shadow-lg py-1 z-10 min-w-[80px]">
          <button class="w-full px-4 py-2 text-sm text-ink text-left hover:bg-cream transition-colors" @click="$emit('edit', diary.id); showMenu = false">编辑</button>
          <button class="w-full px-4 py-2 text-sm text-red-500 text-left hover:bg-cream transition-colors" @click="onDelete">删除</button>
        </div>
      </div>
    </div>

    <!-- 标题 -->
    <h3 v-if="diary.title" class="font-serif text-lg text-ink mt-3">{{ diary.title }}</h3>

    <!-- 正文 -->
    <p class="text-ink leading-[1.8] whitespace-pre-line break-words mt-2">{{ diary.content }}</p>

    <!-- 图片 -->
    <DiaryImageGrid v-if="diary.images.length" :images="diary.images" />

    <!-- 分隔线 -->
    <div class="border-t border-warm/50 my-3"></div>

    <!-- 反应栏 -->
    <DiaryReactionBar
      :likes="diary.likes"
      :reactions="diary.reactions"
      :current-user="currentUser"
      :comment-count="diary.comments.length"
      @like="$emit('like', diary.id)"
      @react="(emoji) => $emit('react', { diaryId: diary.id, emoji })"
      @toggle-comments="showComments = !showComments"
    />

    <!-- 评论区 -->
    <DiaryCommentSection
      v-if="showComments || diary.comments.length"
      :comments="diary.comments"
      :current-user="currentUser"
      @submit="(payload) => $emit('comment', { diaryId: diary.id, ...payload })"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

import { USERS, relativeTimeStr, moodLabel, weatherLabel } from '@/libs/diary_helpers'
import DiaryImageGrid from '@/components/diary_image_grid.vue'
import DiaryReactionBar from '@/components/diary_reaction_bar.vue'
import DiaryCommentSection from '@/components/diary_comment_section.vue'

const props = defineProps({
  diary: { type: Object, required: true },
  currentUser: { type: String, required: true }
})

const emit = defineEmits(['like', 'react', 'comment', 'edit', 'delete'])

const showMenu = ref(false)
const showComments = ref(false)

const user = computed(() => USERS[props.diary.author] ?? { label: props.diary.author, avatar: '' })
const isOwner = computed(() => props.diary.author === props.currentUser)

const onDelete = () => {
  showMenu.value = false
  if (confirm('确定删除这条动态吗?')) emit('delete', props.diary.id)
}
</script>
