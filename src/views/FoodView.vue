<template>
  <div class="max-w-[700px] mx-auto px-4 py-8">
    <h1 class="font-serif text-3xl text-ink text-center mb-8 tracking-wider">一起吃过的美食</h1>

    <!-- add form -->
    <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 mb-8">
      <IdentityPicker v-model="newAuthor" />
      <div class="grid grid-cols-2 gap-3 mb-3">
        <input v-model="newDate" type="date" class="px-4 py-2 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none focus:border-rose transition-colors">
        <input v-model="newLocation" placeholder="地点" class="px-4 py-2 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none focus:border-rose transition-colors">
      </div>
      <input v-model="newDish" placeholder="菜品/餐厅名" class="w-full px-4 py-2 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none focus:border-rose transition-colors mb-3">
      <input v-model="newNote" placeholder="备注（可选）" class="w-full px-4 py-2 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none focus:border-rose transition-colors mb-3">
      <div class="flex justify-end">
        <button @click="addFood" :disabled="!newDish.trim()" class="px-6 py-2 rounded-full bg-deep-rose text-white text-sm tracking-wider hover:bg-rose transition-colors disabled:opacity-40">添加</button>
      </div>
    </div>

    <!-- list -->
    <template v-if="loaded">
      <div v-for="f in foods" :key="f.id" class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5 mb-4">
        <div class="flex items-center justify-between mb-2">
          <h2 class="font-serif text-lg text-ink">{{ f.dish }}</h2>
          <span class="text-xs text-light-ink">{{ f.date }}</span>
        </div>
        <p v-if="f.location" class="text-sm text-light-ink mb-1">{{ f.location }}</p>
        <p v-if="f.note" class="text-sm text-ink">{{ f.note }}</p>
        <p class="text-xs text-deep-rose mt-2">-- {{ f.author === 'xiaoyu' ? '小鱼' : '梓樱' }}</p>
      </div>
      <p v-if="!foods.length" class="text-center text-light-ink py-16">还没有美食记录</p>
    </template>
    <p v-else class="text-center text-light-ink py-16 animate-pulse">加载中...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import IdentityPicker from '@/components/IdentityPicker.vue'
import { useAutoSync } from '@/composables/use_auto_sync'
import dayjs from 'dayjs'

const PRESET = [{
  id: 1,
  date: '2025-12-01',
  location: '上海交通大学闵行校区龙湖天街',
  dish: '聚鑫阁 - 疯狂的芋头',
  note: '梓樱特别喜欢',
  author: 'xiaoyu'
}]

const { data: raw, save, init, loaded } = useAutoSync('foods', { default: PRESET })
const foods = computed(() => [...raw.value].sort((a, b) => b.id - a.id))

const newDate = ref(dayjs().format('YYYY-MM-DD'))
const newLocation = ref('')
const newDish = ref('')
const newNote = ref('')
const newAuthor = ref('xiaoyu')

const addFood = async () => {
  if (!newDish.value.trim()) return
  const newList = [...raw.value, {
    id: Date.now(),
    date: newDate.value,
    location: newLocation.value.trim(),
    dish: newDish.value.trim(),
    note: newNote.value.trim(),
    author: newAuthor.value
  }]
  newDish.value = ''
  newNote.value = ''
  newLocation.value = ''
  await save(newList)
}

onMounted(() => init())
</script>
