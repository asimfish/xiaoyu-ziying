<template>
  <div class="flex gap-3 mb-4" :class="isUser ? 'flex-row-reverse' : 'flex-row'">
    <img :src="avatar" alt="" class="w-8 h-8 rounded-full object-cover shrink-0 mt-1">
    <div class="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-[1.8]"
      :class="isUser
        ? 'bg-deep-rose text-white rounded-br-sm'
        : 'bg-white text-ink shadow-[0_2px_8px_rgba(0,0,0,0.06)] rounded-bl-sm'"
    >
      <div class="whitespace-pre-line break-words">{{ text }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({ text: String, isUser: Boolean, avatar: String })
</script>
