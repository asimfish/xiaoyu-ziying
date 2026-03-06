<template>
  <div class="flex gap-3 items-end">
    <textarea
      ref="inputRef"
      v-model="text"
      rows="1"
      placeholder="说点什么..."
      class="flex-1 px-4 py-2.5 rounded-2xl border border-warm bg-white text-ink text-sm outline-none resize-none leading-[1.6] focus:border-rose transition-colors max-h-[120px]"
      @keydown.enter.exact.prevent="send"
      @input="autoResize"
    ></textarea>
    <button
      @click="send"
      :disabled="!text.trim() || loading"
      class="px-5 py-2.5 rounded-full bg-deep-rose text-white text-sm hover:bg-rose transition-colors disabled:opacity-40 shrink-0"
    >{{ loading ? '...' : '发送' }}</button>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({ loading: Boolean })
const emit = defineEmits(['send'])

const text = ref('')
const inputRef = ref(null)

const autoResize = () => {
  nextTick(() => {
    if (!inputRef.value) return
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = inputRef.value.scrollHeight + 'px'
  })
}

const send = () => {
  if (!text.value.trim() || props.loading) return
  emit('send', text.value.trim())
  text.value = ''
  nextTick(() => {
    if (inputRef.value) inputRef.value.style.height = 'auto'
  })
}
</script>
