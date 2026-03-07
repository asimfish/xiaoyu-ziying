<template>
  <div class="max-w-[900px] mx-auto px-4 py-8">
    <h1 class="font-serif text-3xl text-ink text-center mb-8 tracking-wider">相册</h1>

    <!-- upload + add month -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <ImageUploader :folder="uploadFolder" @uploaded="onUploaded" />
        <button @click="showAddMonth = true" class="px-4 py-2 rounded-full bg-cream text-light-ink text-sm hover:text-ink transition-colors">
          + 新增月份
        </button>
      </div>
      <button @click="downloadAll" class="text-sm text-light-ink hover:text-ink transition-colors">下载全部</button>
    </div>

    <!-- add month dialog -->
    <div v-if="showAddMonth" class="mb-6 flex items-center gap-3">
      <input type="month" v-model="newMonth" class="px-3 py-1.5 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none">
      <button @click="addMonth" class="px-4 py-1.5 rounded-full bg-deep-rose text-white text-sm hover:bg-rose transition-colors">确认</button>
      <button @click="showAddMonth = false" class="px-4 py-1.5 rounded-full bg-cream text-light-ink text-sm hover:text-ink transition-colors">取消</button>
    </div>

    <!-- month tabs -->
    <div class="flex flex-wrap gap-2 justify-center mb-8">
      <button
        v-for="m in sortedMonths" :key="m"
        class="px-4 py-1.5 rounded-full text-sm transition-all"
        :class="activeMonth === m ? 'bg-deep-rose text-white' : 'bg-warm text-light-ink hover:bg-rose hover:text-white'"
        @click="activeMonth = m"
      >{{ m }}</button>
    </div>

    <!-- photo wall -->
    <div class="photo-wall">
      <img
        v-for="(src, i) in filteredImages" :key="i"
        :src="src" alt=""
        class="cursor-pointer"
        loading="lazy"
        @click="openLightbox(src)"
      >
    </div>

    <p v-if="!filteredImages.length" class="text-center text-light-ink py-16">暂无该月份的图片</p>
  </div>
</template>
<script setup>
import { ref, computed, inject, onMounted, watch } from 'vue'

import { loveChapters, friendChapters } from '@/data/chapters'
import { useGithubSync } from '@/composables/use_github_sync'
import ImageUploader from '@/components/ImageUploader.vue'

const openLightbox = inject('openLightbox')
const { loadRemote, saveRemote } = useGithubSync()

// 从 GitHub 加载的上传图片索引
const uploadedImages = ref([])
// 手动添加的空月份
const extraMonths = ref([])

const showAddMonth = ref(false)
const newMonth = ref('')

onMounted(async () => {
  const remote = await loadRemote('gallery')
  if (remote && remote.data) {
    uploadedImages.value = remote.data.images || []
    extraMonths.value = remote.data.months || []
  }
})

// 上传成功后持久化
const onUploaded = async ({ url, path }) => {
  if (!url) return
  uploadedImages.value.push(url)
  await saveGallery()
}

const saveGallery = async () => {
  await saveRemote('gallery', {
    images: uploadedImages.value,
    months: extraMonths.value
  })
}

// 当前选中月份对应的上传文件夹
const uploadFolder = computed(() => {
  if (!activeMonth.value) return ''
  const match = activeMonth.value.match(/(\d{4})年(.+)/)
  if (!match) return ''
  const monthMap = { '一月': '01', '二月': '02', '三月': '03', '四月': '04', '五月': '05', '六月': '06', '七月': '07', '八月': '08', '九月': '09', '十月': '10', '十一月': '11', '十二月': '12' }
  return `${match[1]}-${monthMap[match[2]]}`
})

// 从章节收集图片
const chapterImages = computed(() => {
  const images = []
  const chapters = [...loveChapters, ...friendChapters]
  chapters.forEach(ch => {
    ch.blocks.forEach(b => {
      if (b.type === 'photo-wall' && b.images) b.images.forEach(src => images.push(src))
      if (b.type === 'photo-grid' && b.images) b.images.forEach(src => images.push(src))
      if (b.type === 'photo-single' && b.src) images.push(b.src)
      if (b.type === 'photo-together' && b.src) images.push(b.src)
    })
  })
  return images
})

const allImages = computed(() => [...chapterImages.value, ...uploadedImages.value])

const monthNames = { '01': '一月', '02': '二月', '03': '三月', '04': '四月', '05': '五月', '06': '六月', '07': '七月', '08': '八月', '09': '九月', '10': '十月', '11': '十一月', '12': '十二月' }

const getMonth = (src) => {
  const match = src.match(/(\d{4}-\d{2})/)
  if (!match) return '其他'
  const [year, month] = match[1].split('-')
  return `${year}年${monthNames[month]}`
}

const months = computed(() => {
  const set = new Set(allImages.value.map(getMonth))
  // 加入手动添加的空月份
  extraMonths.value.forEach(m => set.add(m))
  return [...set]
})

// 按时间倒序排列月份
const sortedMonths = computed(() =>
  [...months.value].sort((a, b) => {
    if (a === '其他') return 1
    if (b === '其他') return -1
    return b.localeCompare(a)
  })
)

const activeMonth = ref('')

watch(sortedMonths, (val) => {
  if (!activeMonth.value && val.length) activeMonth.value = val[0]
}, { immediate: true })

const filteredImages = computed(() =>
  allImages.value.filter(src => getMonth(src) === activeMonth.value)
)

// 新增月份
const addMonth = async () => {
  if (!newMonth.value) return
  const [year, month] = newMonth.value.split('-')
  const label = `${year}年${monthNames[month]}`
  if (!months.value.includes(label)) {
    extraMonths.value.push(label)
    await saveGallery()
  }
  activeMonth.value = label
  showAddMonth.value = false
  newMonth.value = ''
}

const downloadAll = async () => {
  for (const src of filteredImages.value) {
    const a = document.createElement('a')
    a.href = src
    a.download = src.split('/').pop()
    a.target = '_blank'
    a.click()
  }
}
</script>
