<template>
  <div class="flex items-center gap-4 text-sm">
    <!-- 点赞 -->
    <button
      class="flex items-center gap-1 transition-colors"
      :class="liked ? 'text-red-500' : 'text-light-ink hover:text-red-400'"
      @click="onLike"
    >
      <svg class="w-5 h-5" :class="{ 'like-bounce': likeBounce }" :fill="liked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
      <span v-if="likes.length">{{ likes.length }}</span>
    </button>

    <!-- 表情反应 -->
    <div class="flex items-center gap-1 relative">
      <button
        class="text-light-ink hover:text-ink transition-colors px-1"
        @click.stop="showPicker = !showPicker"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
        </svg>
      </button>
      <!-- 表情选择器弹窗 -->
      <div v-if="showPicker" class="absolute bottom-8 left-0 bg-white rounded-xl shadow-lg z-10 w-[260px]" @click.stop>
        <!-- 分类 tab -->
        <div class="flex border-b border-warm/50 px-2 pt-2">
          <button
            v-for="(cat, ci) in EMOJI_CATEGORIES" :key="ci"
            class="px-3 py-1.5 text-xs rounded-t-lg transition-colors"
            :class="activeTab === ci ? 'bg-rose/10 text-deep-rose font-medium' : 'text-light-ink hover:text-ink'"
            @click="activeTab = ci"
          >{{ cat.name }}</button>
        </div>
        <!-- 表情网格 -->
        <div class="grid grid-cols-6 gap-1 p-2">
          <button
            v-for="emoji in EMOJI_CATEGORIES[activeTab].emojis" :key="emoji"
            class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-warm/50 hover:scale-110 transition-all text-lg"
            @click="$emit('react', emoji); showPicker = false"
          >{{ emoji }}</button>
        </div>
      </div>
    </div>

    <!-- 评论数 -->
    <button
      class="flex items-center gap-1 text-light-ink hover:text-ink transition-colors"
      @click="$emit('toggle-comments')"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
      </svg>
      <span v-if="commentCount">{{ commentCount }}</span>
    </button>

    <!-- 分享 -->
    <button
      class="flex items-center gap-1 text-light-ink hover:text-ink transition-colors"
      @click="$emit('share')"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
    </button>
  </div>

  <!-- 已有的表情反应展示 -->
  <div v-if="reactionList.length" class="flex flex-wrap gap-1.5 mt-2">
    <button
      v-for="r in reactionList" :key="r.emoji"
      class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors hover:scale-105"
      :class="r.active ? 'bg-rose/15 border-rose text-deep-rose' : 'bg-cream border-warm text-light-ink hover:border-rose'"
      @click="$emit('react', r.emoji)"
    >
      <span>{{ r.emoji }}</span>
      <span>{{ r.count }}</span>
    </button>
  </div>

  <!-- 点赞人 -->
  <p v-if="likeText" class="text-xs text-light-ink mt-1.5">{{ likeText }}</p>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

import { REACTION_EMOJIS, EMOJI_CATEGORIES, USERS } from '@/libs/diary_helpers'

const props = defineProps({
  likes: { type: Array, required: true },
  reactions: { type: Object, required: true },
  currentUser: { type: String, required: true },
  commentCount: { type: Number, default: 0 }
})

const emit = defineEmits(['like', 'react', 'toggle-comments', 'share'])

const showPicker = ref(false)
const activeTab = ref(0)
const likeBounce = ref(false)

// 点赞动画
const onLike = () => {
  likeBounce.value = true
  setTimeout(() => { likeBounce.value = false }, 400)
  emit('like')
}

// 点击外部关闭表情选择器
const onDocClick = () => { showPicker.value = false }
onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))

const liked = computed(() => props.likes.includes(props.currentUser))

const reactionList = computed(() =>
  Object.entries(props.reactions)
    .filter(([, users]) => users.length > 0)
    .map(([emoji, users]) => ({ emoji, count: users.length, active: users.includes(props.currentUser) }))
)

const likeText = computed(() => {
  if (!props.likes.length) return ''
  const names = props.likes.map(u => USERS[u]?.label ?? u)
  return names.join('、') + ' 觉得很赞'
})
</script>
