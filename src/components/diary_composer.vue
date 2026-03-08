<template>
  <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5 mb-6 transition-shadow" :class="{ 'shadow-[0_2px_20px_rgba(212,160,160,0.25)]': isFocused }">
    <!-- 身份选择（仅新建模式） -->
    <IdentityPicker v-if="!editingDiary" v-model="author" />

    <!-- 头像 + 输入区 -->
    <div class="flex gap-3">
      <img :src="currentAvatar" alt="" class="w-10 h-10 rounded-full object-cover shrink-0 mt-0.5 ring-2 ring-warm">
      <div class="flex-1 min-w-0">
        <!-- 内容输入 -->
        <textarea
          v-model="content"
          :placeholder="editingDiary ? '编辑内容...' : '说点什么...'"
          rows="3"
          class="w-full text-ink bg-transparent border-none outline-none resize-none leading-[1.8] placeholder:text-light-ink/50"
          @focus="isFocused = true"
          @blur="isFocused = false"
        ></textarea>

        <!-- 标题（可选，折叠） -->
        <div v-if="showTitle" class="mt-2">
          <input
            v-model="title"
            placeholder="标题（可选）"
            class="w-full text-sm text-ink bg-transparent border-b border-warm pb-1.5 outline-none placeholder:text-light-ink/50 focus:border-rose transition-colors"
          >
        </div>
      </div>
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
      <div class="flex items-center gap-1">
        <!-- 图片上传 -->
        <ImageUploader folder="" @uploaded="onUploaded" />
        <!-- 标题开关 -->
        <button
          class="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          :class="showTitle ? 'bg-rose/15 text-deep-rose' : 'text-light-ink hover:text-ink hover:bg-warm/50'"
          title="标题"
          @click="showTitle = !showTitle"
        >
          <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </button>
        <!-- 标签开关 -->
        <button
          class="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          :class="showTags ? 'bg-rose/15 text-deep-rose' : 'text-light-ink hover:text-ink hover:bg-warm/50'"
          title="心情/天气"
          @click="showTags = !showTags"
        >
          <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
        </button>
        <!-- 定位显示 -->
        <button
          v-if="locationText"
          class="flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors"
          :class="showLocation ? 'bg-rose/15 text-deep-rose' : 'text-light-ink hover:text-ink'"
          @click="showLocation = !showLocation"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {{ locationText }}
        </button>
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
import { ref, computed, watch, onMounted } from 'vue'

import IdentityPicker from '@/components/IdentityPicker.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import { MOODS, WEATHERS, USERS } from '@/libs/diary_helpers'
import { getLocation } from '@/libs/location'

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
const isFocused = ref(false)
const locationData = ref({ province: '', city: '' })
const showLocation = ref(true)

const currentAvatar = computed(() => USERS[author.value]?.avatar ?? '')
const locationText = computed(() => locationData.value.province)

// 挂载时获取位置
onMounted(async () => {
  locationData.value = await getLocation()
})

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
    author: author.value,
    location: showLocation.value ? locationData.value.province : ''
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
