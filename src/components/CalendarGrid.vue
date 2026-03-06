<template>
  <div>
    <!-- month nav -->
    <div class="flex items-center justify-center gap-4 mb-6">
      <button @click="prevMonth" class="text-light-ink hover:text-ink transition-colors text-lg">&lt;</button>
      <span class="font-serif text-xl text-ink tracking-wider min-w-[140px] text-center">{{ yearMonth }}</span>
      <button @click="nextMonth" class="text-light-ink hover:text-ink transition-colors text-lg">&gt;</button>
    </div>

    <!-- weekday headers -->
    <div class="grid grid-cols-7 gap-1 mb-1">
      <div v-for="d in weekdays" :key="d" class="text-center text-sm text-light-ink py-1">{{ d }}</div>
    </div>

    <!-- day cells -->
    <div class="grid grid-cols-7 gap-1">
      <div v-for="(cell, i) in cells" :key="i"
        class="aspect-square flex flex-col items-center justify-center rounded-lg text-sm cursor-pointer transition-all"
        :class="cellClass(cell)"
        @click="cell.day && $emit('selectDate', cell.dateStr)"
      >
        <span v-if="cell.day">{{ cell.day }}</span>
        <span v-if="cell.events.length" class="text-[10px] leading-none mt-0.5">
          {{ cell.events[0].emoji }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({ events: { type: Array, default: () => [] } })
defineEmits(['selectDate'])

const weekdays = ['一', '二', '三', '四', '五', '六', '日']

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth()) // 0-indexed

const yearMonth = computed(() => `${currentYear.value}年${currentMonth.value + 1}月`)

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const pad = (n) => String(n).padStart(2, '0')

const cells = computed(() => {
  const y = currentYear.value
  const m = currentMonth.value
  const firstDay = new Date(y, m, 1).getDay() // 0=Sun
  const daysInMonth = new Date(y, m + 1, 0).getDate()

  // 调整为周一开始：Sun(0)->6, Mon(1)->0, ...
  const offset = firstDay === 0 ? 6 : firstDay - 1

  const result = []
  // 空白填充
  for (let i = 0; i < offset; i++) {
    result.push({ day: null, events: [], dateStr: '' })
  }
  // 日期
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${y}-${pad(m + 1)}-${pad(d)}`
    const events = props.events.filter(e => e.date === dateStr)
    result.push({ day: d, events, dateStr })
  }
  return result
})

const today = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
})

const cellClass = (cell) => {
  if (!cell.day) return 'bg-transparent'
  if (cell.dateStr === today.value) return 'bg-deep-rose/10 text-deep-rose font-bold'
  if (cell.events.length) return 'bg-rose/10 text-ink hover:bg-rose/20'
  return 'text-ink hover:bg-warm'
}
</script>
