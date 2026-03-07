<template>
  <div v-if="comments.length || replyTarget" class="mt-3">
    <!-- 评论列表 -->
    <div class="space-y-2.5">
      <div v-for="c in sortedComments" :key="c.id" class="flex gap-2">
        <img :src="userInfo(c.author).avatar" alt="" class="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5">
        <div class="flex-1 min-w-0">
          <div class="text-xs">
            <span class="font-medium" :class="c.author === 'xiaoyu' ? 'text-deep-rose' : 'text-friend-blue'">{{ userInfo(c.author).label }}</span>
            <template v-if="c.replyTo && replyTargetComment(c.replyTo)">
              <span class="text-light-ink"> 回复 </span>
              <span class="font-medium" :class="replyTargetComment(c.replyTo).author === 'xiaoyu' ? 'text-deep-rose' : 'text-friend-blue'">{{ userInfo(replyTargetComment(c.replyTo).author).label }}</span>
            </template>
          </div>
          <p class="text-sm text-ink leading-relaxed break-words">{{ c.content }}</p>
          <div class="flex items-center gap-3 mt-0.5">
            <span class="text-xs text-light-ink/70">{{ relativeTimeStr(c.date) }}</span>
            <button class="text-xs text-light-ink hover:text-ink transition-colors" @click="startReply(c)">回复</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 回复提示 -->
    <div v-if="replyTarget" class="flex items-center gap-2 mt-3 text-xs text-light-ink">
      <span>回复 {{ userInfo(replyTarget.author).label }}</span>
      <button class="hover:text-ink transition-colors" @click="replyTarget = null">取消</button>
    </div>
  </div>

  <!-- 评论输入 -->
  <div class="flex items-center gap-2 mt-3">
    <input
      v-model="inputText"
      :placeholder="replyTarget ? `回复 ${userInfo(replyTarget.author).label}...` : '写评论...'"
      class="flex-1 text-sm px-3 py-1.5 rounded-full bg-cream/80 border border-warm text-ink outline-none placeholder:text-light-ink/50 focus:border-rose transition-colors"
      @keydown.enter="submitComment"
    >
    <button
      :disabled="!inputText.trim()"
      class="px-4 py-1.5 rounded-full bg-deep-rose text-white text-xs hover:bg-rose transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      @click="submitComment"
    >发送</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

import { USERS, relativeTimeStr } from '@/libs/diary_helpers'

const props = defineProps({
  comments: { type: Array, required: true },
  currentUser: { type: String, required: true }
})

const emit = defineEmits(['submit'])

const inputText = ref('')
const replyTarget = ref(null)

const sortedComments = computed(() => [...props.comments].sort((a, b) => a.id - b.id))

const userInfo = (author) => USERS[author] ?? { label: author, avatar: '', colorClass: '' }

const replyTargetComment = (id) => props.comments.find(c => c.id === id)

const startReply = (comment) => { replyTarget.value = comment }

const submitComment = () => {
  if (!inputText.value.trim()) return
  emit('submit', { content: inputText.value.trim(), replyTo: replyTarget.value?.id ?? null })
  inputText.value = ''
  replyTarget.value = null
}
</script>
