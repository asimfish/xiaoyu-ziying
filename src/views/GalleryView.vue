<template>
  <div class="max-w-[900px] mx-auto px-4 py-8">
    <h1 class="font-serif text-3xl text-ink text-center mb-8 tracking-wider">相册</h1>

    <!-- upload + download -->
    <div class="flex items-center justify-between mb-6">
      <ImageUploader @uploaded="onUploaded" />
      <button @click="downloadAll" class="text-sm text-light-ink hover:text-ink transition-colors">下载全部</button>
    </div>

    <!-- month tabs -->
    <div class="flex flex-wrap gap-2 justify-center mb-8">
      <button
        v-for="m in months" :key="m"
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
import { ref, computed, inject } from 'vue'

import { loveChapters, friendChapters } from '@/data/chapters'
import ImageUploader from '@/components/ImageUploader.vue'

const openLightbox = inject('openLightbox')

// 额外上传的图片（GitHub URL）
const uploadedImages = ref([])

const onUploaded = ({ url }) => {
  if (url) uploadedImages.value.push(url)
}

// collect all images from chapters
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

// extract month from path
const getMonth = (src) => {
  const match = src.match(/(\d{4}-\d{2})/)
  if (!match) return '其他'
  const [year, month] = match[1].split('-')
  const monthNames = { '01': '一月', '02': '二月', '03': '三月', '04': '四月', '05': '五月', '06': '六月', '07': '七月', '08': '八月', '09': '九月', '10': '十月', '11': '十一月', '12': '十二月' }
  return `${year}年${monthNames[month]}`
}

const months = computed(() => {
  const set = new Set(allImages.value.map(getMonth))
  return [...set]
})

const activeMonth = ref('')

// 初始化选中第一个月份
const initMonth = () => {
  if (!activeMonth.value && months.value.length) activeMonth.value = months.value[0]
}
initMonth()

const filteredImages = computed(() => {
  if (!activeMonth.value && months.value.length) activeMonth.value = months.value[0]
  return allImages.value.filter(src => getMonth(src) === activeMonth.value)
})

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
