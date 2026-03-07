<template>
  <div class="flex items-center gap-3 mb-6">
    <!-- 作者筛选 -->
    <div class="flex gap-1.5">
      <button
        v-for="opt in filterOptions" :key="opt.value"
        class="px-3.5 py-1 rounded-full text-sm transition-all"
        :class="authorFilter === opt.value ? 'bg-deep-rose text-white' : 'bg-warm text-light-ink hover:bg-rose/30'"
        @click="$emit('update:authorFilter', opt.value)"
      >{{ opt.label }}</button>
    </div>

    <!-- 搜索框 -->
    <div class="flex-1 relative">
      <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-light-ink/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input
        :value="keyword"
        @input="$emit('update:keyword', $event.target.value)"
        placeholder="搜索动态..."
        class="w-full text-sm pl-9 pr-3 py-1.5 rounded-full bg-cream/80 border border-warm text-ink outline-none placeholder:text-light-ink/50 focus:border-rose transition-colors"
      >
    </div>
  </div>
</template>

<script setup>
defineProps({
  authorFilter: { type: String, default: '' },
  keyword: { type: String, default: '' }
})

defineEmits(['update:authorFilter', 'update:keyword'])

const filterOptions = [
  { value: '', label: '全部' },
  { value: 'xiaoyu', label: '小鱼' },
  { value: 'ziying', label: '梓樱' }
]
</script>
