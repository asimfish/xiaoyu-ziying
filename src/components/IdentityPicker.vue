<template>
  <div class="flex gap-3 mb-4">
    <button
      v-for="opt in options" :key="opt.id"
      class="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all border"
      :class="modelValue === opt.id
        ? 'bg-deep-rose text-white border-deep-rose'
        : 'bg-white text-light-ink border-warm hover:border-rose'"
      @click="$emit('update:modelValue', opt.id)"
    >
      <img :src="opt.avatar" alt="" class="w-6 h-6 rounded-full object-cover">
      {{ opt.label }}
    </button>
  </div>
</template>

<script setup>
const base = import.meta.env.BASE_URL

defineProps({ modelValue: String })
defineEmits(['update:modelValue'])

const options = [
  { id: 'xiaoyu', label: '小鱼', avatar: `${base}assets/images/avatars/xiaoyu.png` },
  { id: 'ziying', label: '梓樱', avatar: `${base}assets/images/avatars/ziying.png` }
]
</script>
