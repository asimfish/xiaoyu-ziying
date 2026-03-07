<template>
  <div class="max-w-[700px] mx-auto px-4 py-8">
    <h1 class="font-serif text-3xl text-ink text-center mb-8 tracking-wider">日历</h1>

    <!-- calendar grid -->
    <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 mb-8">
      <CalendarGrid :events="allEvents" @selectDate="onSelectDate" />
    </div>

    <!-- selected date events -->
    <div v-if="selectedDate" class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 mb-4">
      <h2 class="font-serif text-lg text-ink mb-4">{{ selectedDate }} 的事件</h2>
      <div v-if="selectedDateEvents.length" class="space-y-0">
        <CalendarEvent v-for="e in selectedDateEvents" :key="e.id" :event="e" />
      </div>
      <p v-else class="text-light-ink text-sm">该日期暂无事件</p>
    </div>

    <!-- add event form -->
    <div v-if="selectedDate" class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 mb-8">
      <h2 class="font-serif text-lg text-ink mb-4">{{ selectedDate }} 添加事件</h2>
      <div class="flex gap-3 mb-3">
        <input v-model="newEmoji" placeholder="emoji" class="w-16 px-3 py-2 rounded-lg border border-warm bg-cream/50 text-center text-lg outline-none">
        <input v-model="newEventTitle" placeholder="事件标题" class="flex-1 px-4 py-2 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none focus:border-rose transition-colors">
      </div>
      <input v-model="newEventNote" placeholder="备注（可选）" class="w-full px-4 py-2 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none focus:border-rose transition-colors mb-3">
      <div class="flex justify-between items-center">
        <button @click="selectedDate = ''" class="text-sm text-light-ink hover:text-ink transition-colors">取消</button>
        <button @click="addEvent" :disabled="!newEventTitle.trim()" class="px-6 py-2 rounded-full bg-deep-rose text-white text-sm tracking-wider hover:bg-rose transition-colors disabled:opacity-40">添加</button>
      </div>
    </div>

    <!-- sync status -->
    <div v-if="syncing" class="flex justify-end mb-6">
      <span class="text-sm text-friend-blue">同步中...</span>
    </div>

    <!-- events list for selected month -->
    <div class="space-y-0">
      <CalendarEvent v-for="e in monthEvents" :key="e.id" :event="e" />
    </div>
    <p v-if="!monthEvents.length" class="text-center text-light-ink py-8">本月暂无事件</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import CalendarGrid from '@/components/CalendarGrid.vue'
import CalendarEvent from '@/components/CalendarEvent.vue'
import { calendarPresets } from '@/data/calendar_presets'
import { useGithubSync } from '@/composables/use_github_sync'

const STORAGE_KEY = 'memorial-calendar'

const { syncing, loadRemote, saveRemote, hasGithubConfig } = useGithubSync()

const loadEvents = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

const customEvents = ref(loadEvents())
const saveEvents = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(customEvents.value))

const allEvents = computed(() => [...calendarPresets, ...customEvents.value])

// 选中日期的事件
const selectedDateEvents = computed(() =>
  allEvents.value.filter(e => e.date === selectedDate.value).sort((a, b) => a.id > b.id ? 1 : -1)
)

// 当前月份事件
const monthEvents = computed(() => {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const prefix = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
  return allEvents.value
    .filter(e => e.date.startsWith(prefix))
    .sort((a, b) => a.date.localeCompare(b.date))
})

const selectedDate = ref('')
const newEmoji = ref('📌')
const newEventTitle = ref('')
const newEventNote = ref('')

const onSelectDate = (dateStr) => {
  selectedDate.value = dateStr
  newEventTitle.value = ''
  newEventNote.value = ''
  newEmoji.value = '📌'
}

const addEvent = async () => {
  if (!newEventTitle.value.trim()) return
  customEvents.value.push({
    id: `custom-${Date.now()}`,
    date: selectedDate.value,
    title: newEventTitle.value.trim(),
    emoji: newEmoji.value || '📌',
    note: newEventNote.value.trim(),
    color: 'rose'
  })
  saveEvents()
  selectedDate.value = ''

  if (hasGithubConfig()) {
    await saveRemote('calendar', customEvents.value)
  }
}

onMounted(async () => {
  if (hasGithubConfig()) {
    const remote = await loadRemote('calendar')
    if (remote && remote.data && remote.data.length) {
      const map = new Map()
      remote.data.forEach(e => map.set(e.id, e))
      customEvents.value.forEach(e => map.set(e.id, e))
      customEvents.value = [...map.values()]
      saveEvents()
    }
  }
})
</script>
