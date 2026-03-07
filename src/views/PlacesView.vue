<template>
  <div class="max-w-[700px] mx-auto px-4 py-8">
    <h1 class="font-serif text-3xl text-ink text-center mb-8 tracking-wider">去过的地方</h1>

    <!-- add form -->
    <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 mb-8">
      <IdentityPicker v-model="newAuthor" />
      <div class="grid grid-cols-2 gap-3 mb-3">
        <input v-model="newDate" type="date" class="px-4 py-2 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none focus:border-rose transition-colors">
        <input v-model="newPlace" placeholder="地点名称" class="px-4 py-2 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none focus:border-rose transition-colors">
      </div>
      <textarea v-model="newDesc" placeholder="描述这次经历..." rows="2" class="w-full px-4 py-2 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none focus:border-rose transition-colors resize-none mb-3"></textarea>
      <div class="flex items-center justify-between">
        <ImageUploader v-if="hasGithubConfig()" @uploaded="onImageUploaded" />
        <button @click="addPlace" :disabled="!newPlace.trim()" class="px-6 py-2 rounded-full bg-deep-rose text-white text-sm tracking-wider hover:bg-rose transition-colors disabled:opacity-40">添加</button>
      </div>
      <div v-if="newImages.length" class="mt-3 flex flex-wrap gap-2">
        <span v-for="(img, i) in newImages" :key="i" class="text-xs text-light-ink bg-cream px-2 py-1 rounded">{{ img.path }}</span>
      </div>
    </div>

    <!-- list -->
    <template v-if="loaded">
      <div v-for="p in places" :key="p.id" class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 mb-4">
        <div class="flex items-center justify-between mb-2">
          <h2 class="font-serif text-lg text-ink">{{ p.place }}</h2>
          <span class="text-xs text-light-ink">{{ p.date }}</span>
        </div>
        <p v-if="p.description" class="text-ink leading-[1.8] whitespace-pre-wrap mb-3">{{ p.description }}</p>
        <div v-if="p.images && p.images.length" class="flex flex-wrap gap-2 mb-3">
          <img v-for="(img, i) in p.images" :key="i" :src="img.url" alt="" class="w-24 h-24 rounded-lg object-cover">
        </div>
        <p class="text-xs text-deep-rose">-- {{ p.author === 'xiaoyu' ? '小鱼' : '梓樱' }}</p>
      </div>
      <p v-if="!places.length" class="text-center text-light-ink py-16">还没有足迹记录</p>
    </template>
    <p v-else class="text-center text-light-ink py-16 animate-pulse">加载中...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import IdentityPicker from '@/components/IdentityPicker.vue'
import ImageUploader from '@/components/ImageUploader.vue'
import { useAutoSync } from '@/composables/use_auto_sync'
import { useGithubSync } from '@/composables/use_github_sync'
import dayjs from 'dayjs'

const { hasGithubConfig } = useGithubSync()
const { data: raw, save, init, loaded } = useAutoSync('places')
const places = computed(() => [...raw.value].sort((a, b) => b.id - a.id))

const newDate = ref(dayjs().format('YYYY-MM-DD'))
const newPlace = ref('')
const newDesc = ref('')
const newAuthor = ref('xiaoyu')
const newImages = ref([])

const onImageUploaded = (img) => newImages.value.push(img)

const addPlace = async () => {
  if (!newPlace.value.trim()) return
  const newList = [...raw.value, {
    id: Date.now(),
    date: newDate.value,
    place: newPlace.value.trim(),
    description: newDesc.value.trim(),
    images: [...newImages.value],
    author: newAuthor.value
  }]
  newPlace.value = ''
  newDesc.value = ''
  newImages.value = []
  await save(newList)
}

onMounted(() => init())
</script>
