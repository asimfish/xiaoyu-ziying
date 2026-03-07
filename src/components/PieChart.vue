<template>
  <div class="flex items-center gap-4">
    <svg :width="size" :height="size" viewBox="0 0 100 100">
      <circle v-if="!slices.length" cx="50" cy="50" r="40" fill="#e5e0d8" />
      <path v-for="(s, i) in slices" :key="i" :d="s.path" :fill="s.color" />
    </svg>
    <div class="space-y-1.5 text-sm min-w-0">
      <div v-for="(item, i) in legend" :key="i" class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: item.color }"></span>
        <span class="text-ink truncate">{{ item.label }}</span>
        <span class="text-light-ink ml-auto shrink-0">{{ item.value }}{{ unit }}</span>
        <span class="text-light-ink/60 shrink-0">({{ item.pct }}%)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  size: { type: Number, default: 120 },
  unit: { type: String, default: '' }
})

const COLORS = ['#c06070', '#6b8cae', '#d4a574', '#7eb89e', '#9b8ec4', '#e8a87c', '#85c1e9', '#c39bd3']

const total = computed(() => props.data.reduce((sum, d) => sum + d.value, 0))

const slices = computed(() => {
  if (!total.value) return []
  let angle = -90
  return props.data.map((d, i) => {
    const pct = d.value / total.value
    const start = angle
    const sweep = pct * 360
    angle += sweep
    return { path: arcPath(50, 50, 40, start, start + sweep), color: COLORS[i % COLORS.length] }
  })
})

const legend = computed(() =>
  props.data.map((d, i) => ({
    label: d.label,
    value: d.value,
    pct: total.value ? Math.round(d.value / total.value * 100) : 0,
    color: COLORS[i % COLORS.length]
  }))
)

const arcPath = (cx, cy, r, startAngle, endAngle) => {
  if (endAngle - startAngle >= 359.99) {
    return `M${cx - r},${cy}A${r},${r},0,1,1,${cx + r},${cy}A${r},${r},0,1,1,${cx - r},${cy}Z`
  }
  const rad = (a) => (a * Math.PI) / 180
  const x1 = cx + r * Math.cos(rad(startAngle))
  const y1 = cy + r * Math.sin(rad(startAngle))
  const x2 = cx + r * Math.cos(rad(endAngle))
  const y2 = cy + r * Math.sin(rad(endAngle))
  const large = endAngle - startAngle > 180 ? 1 : 0
  return `M${cx},${cy}L${x1},${y1}A${r},${r},0,${large},1,${x2},${y2}Z`
}
</script>
