<template>
  <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5 mb-6">
    <!-- 身份选择（仅新建模式） -->
    <IdentityPicker v-if="!editingDiary" v-model="author" />

    <!-- 内容输入 -->
    <textarea
      v-model="content"
      :placeholder="editingDiary ? '编辑内容...' : '说点什么...'"
      rows="3"
      class="w-full text-ink bg-transparent border-none outline-none resize-none leading-[1.8] placeholder:text-light-ink/50"
    ></textarea>

    <!-- 标题（可选，折叠） -->
    <div v-if="showTitle" class="mt-2">
      <input
        v-model="title"
        placeholder="标题（可选）"
        class="w-full text-sm text-ink bg-transparent border-b border-warm pb-1.5 outline-none placeholder:text-light-ink/50 focus:border-rose transition-colors"
      >
    </div>

    <!-- 已选图片预览 -->
    <div v-if="images.length" class="flex flex-wrap gap-2 mt-3">
      <div v-for="(src, i) in images" :key="i" class="relative group">
        <img :src="src" alt="" class="w-16 h-16 rounded-lg object-cover">
        <button
          class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-ink/60 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          @click="removeImage(i)"
        >x</button>
      </div>
    </div>

    <!-- 心情/天气标签 -->
    <div v-if="showTags" class="flex flex-wrap gap-3 mt-3">
      <!-- 心情 -->
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-light-ink">心情</span>
        <button
          v-for="m in MOODS" :key="m.key"
          class="text-xs px-2 py-0.5 rounded-full border transition-colors"
          :class="mood === m.key ? 'bg-rose/15 border-rose text-deep-rose' : 'bg-cream border-warm text-light-ink hover:border-rose'"
          @click="mood = mood === m.key ? '' : m.key"
        >{{ m.label }}</button>
      </div>
      <!-- 天气 -->
      <div class="flex items-center gap-1.5">
        <span class="text-xs text-light-ink">天气</span>
        <button
          v-for="w in WEATHERS" :key="w.key"
          class="text-xs px-2 py-0.5 rounded-full border transition-colors"
          :class="weather === w.key ? 'bg-rose/15 border-rose text-deep-rose' : 'bg-cream border-warm text-light-ink hover:border-rose'"
          @click="weather = weather === w.key ? '' : w.key"
        >{{ w.label }}</button>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="flex items-center justify-between mt-3 pt-3 border-t border-warm/30">
      <div class="flex items-center gap-2">
        <!-- 图片上传 -->
        <ImageUploader folder="" @uploaded="onUploaded" />
        <!-- 标题开关 -->
        <button
          class="text-xs px-3 py-1.5 rounded-full transition-colors"
          :class="showTitle ? 'bg-rose/15 text-deep-rose' : 'bg-cream text-light-ink hover:text-ink'"
          @click="showTitle = !showTitle"
        >标题</button>
        <!-- 标签开关 -->
        <button
          class="text-xs px-3 py-1.5 rounded-full transition-colors"
          :class="showTags ? 'bg-rose/15 text-deep-rose' : 'bg-cream text-light-ink hover:text-ink'"
          @click="showTags = !showTags"
        >心情/天气</button>
      </div>
      <div class="flex items-center gap-2">
        <button v-if="editingDiary" class="px-4 py-1.5 rounded-full text-sm text-light-ink hover:text-ink transition-colors" @click="emit('cancel')">取消</button>
        <button
          :disabled="!content.trim()"
          class="px-5 py-1.5 rounded-full bg-deep-rose text-white text-sm tracking-wider hover:bg-rose transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          @click="submit"
        >{{ editingDiary ? '保存' : '发布' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

import IdentityPicker from '@/components/IdentityPicker.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import { MOODS, WEATHERS } from '@/libs/diary_helpers'

const props = defineProps({
  editingDiary: { type: Object, default: null },
  currentUser: { type: String, default: 'xiaoyu' }
})

const emit = defineEmits(['submit', 'cancel'])

const author = ref(props.currentUser)
const content = ref('')
const title = ref('')
const images = ref([])
const mood = ref('')
const weather = ref('')
const showTitle = ref(false)
const showTags = ref(false)

// 编辑模式预填 / 取消时重置
watch(() => props.editingDiary, (d) => {
  if (!d) {
    content.value = ''
    title.value = ''
    images.value = []
    mood.value = ''
    weather.value = ''
    showTitle.value = false
    showTags.value = false
    return
  }
  content.value = d.content
  title.value = d.title ?? ''
  images.value = [...(d.images ?? [])]
  mood.value = d.mood ?? ''
  weather.value = d.weather ?? ''
  showTitle.value = !!d.title
  showTags.value = !!(d.mood || d.weather)
}, { immediate: true })

const removeImage = (i) => { images.value = images.value.filter((_, idx) => idx !== i) }

const onUploaded = ({ url }) => {
  if (url) images.value = [...images.value, url]
}

const submit = () => {
  if (!content.value.trim()) return
  emit('submit', {
    title: title.value.trim(),
    content: content.value.trim(),
    images: [...images.value],
    mood: mood.value,
    weather: weather.value,
    author: author.value
  })
  // 重置
  content.value = ''
  title.value = ''
  images.value = []
  mood.value = ''
  weather.value = ''
  showTitle.value = false
  showTags.value = false
}
</script>
