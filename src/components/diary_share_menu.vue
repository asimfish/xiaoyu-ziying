<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-end justify-center" @click.self="$emit('close')">
      <div class="bg-white rounded-t-2xl w-full max-w-[500px] pb-6 pt-4 px-5 shadow-xl animate-slide-up">
        <div class="text-center text-sm text-ink font-medium mb-4">分享到</div>
        <div class="grid grid-cols-4 gap-4">
          <!-- 微博 -->
          <button class="flex flex-col items-center gap-2" @click="shareWeibo">
            <div class="w-12 h-12 rounded-full bg-[#E6162D]/10 flex items-center justify-center">
              <svg class="w-6 h-6 text-[#E6162D]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.098 20c-4.612 0-8.348-2.724-8.348-6.078 0-1.756.852-3.68 2.326-5.42 1.963-2.318 4.244-3.37 5.094-2.35.384.46.34 1.22-.048 2.088-.16.36.2.48.2.48s1.156-.48 2.244-.48c.544 0 .952.12 1.22.36-.544.24-1.156.72-1.156 1.44 0 .84.748 1.2 1.428 1.56.68.36 1.384.78 1.384 1.92 0 2.82-2.244 6.48-4.344 6.48zm-.612-9.96c-2.584.12-4.74 2.16-4.812 4.56-.072 2.4 1.96 4.26 4.544 4.14 2.584-.12 4.74-2.16 4.812-4.56.072-2.4-1.96-4.26-4.544-4.14zm.204 6.84c-1.088.24-2.176-.36-2.432-1.32-.256-.96.408-1.92 1.496-2.16 1.088-.24 2.176.36 2.432 1.32.256.96-.408 1.92-1.496 2.16zm1.156-2.76c-.408.12-.816-.12-.884-.48-.068-.36.204-.72.612-.84.408-.12.816.12.884.48.068.36-.204.72-.612.84zM17.83 8.4c-.34-.84-.34-1.8.068-2.76.612-1.44 2.04-2.28 2.04-2.28s-.476 1.08-.136 2.16c.204.66.748 1.08 1.292 1.68.544.6.952 1.38.816 2.52-.068.6-.34 1.14-.748 1.56 0 0 .068-.6-.272-1.2-.34-.6-.816-.84-1.36-1.08-.544-.24-1.36-.36-1.7-.6z"/>
              </svg>
            </div>
            <span class="text-xs text-light-ink">微博</span>
          </button>
          <!-- 微信 -->
          <button class="flex flex-col items-center gap-2" @click="shareWechat">
            <div class="w-12 h-12 rounded-full bg-[#07C160]/10 flex items-center justify-center">
              <svg class="w-6 h-6 text-[#07C160]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05a6.127 6.127 0 01-.253-1.736c0-3.54 3.258-6.41 7.272-6.41.256 0 .507.017.756.04C16.538 4.97 12.972 2.188 8.691 2.188zm-2.87 4.795a1.1 1.1 0 11-.001 2.2 1.1 1.1 0 010-2.2zm5.742 0a1.1 1.1 0 110 2.2 1.1 1.1 0 010-2.2z"/>
                <path d="M23.503 14.638c0-3.244-3.09-5.876-6.902-5.876-3.81 0-6.9 2.632-6.9 5.876 0 3.245 3.09 5.877 6.9 5.877.756 0 1.489-.098 2.18-.294a.67.67 0 01.553.076l1.467.858a.25.25 0 00.129.041.227.227 0 00.224-.228c0-.055-.022-.11-.037-.164l-.3-1.142a.456.456 0 01.164-.513c1.413-1.04 2.322-2.584 2.322-4.511zm-9.553-.99a.85.85 0 110-1.7.85.85 0 010 1.7zm5.306 0a.85.85 0 110-1.7.85.85 0 010 1.7z"/>
              </svg>
            </div>
            <span class="text-xs text-light-ink">微信</span>
          </button>
          <!-- QQ -->
          <button class="flex flex-col items-center gap-2" @click="shareQQ">
            <div class="w-12 h-12 rounded-full bg-[#12B7F5]/10 flex items-center justify-center">
              <svg class="w-6 h-6 text-[#12B7F5]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 13.27c-.18.52-.76.94-1.63 1.18.12.36.18.68.18.92 0 .72-.44 1.08-.88 1.08-.36 0-.72-.2-1.04-.56-.32.08-.68.12-1.04.12-.4 0-.8-.04-1.16-.16-.32.4-.72.6-1.08.6-.44 0-.88-.36-.88-1.08 0-.24.08-.56.2-.92-.88-.24-1.48-.68-1.64-1.2-.08-.24 0-.48.2-.56.2-.08.44 0 .52.2.12.32.56.64 1.24.84-.04-.2-.04-.4 0-.6-1.04-.72-1.72-1.96-1.72-3.36 0-.4.04-.76.12-1.12-.44-.52-.72-1.2-.72-1.92 0-.24.2-.44.44-.44.12 0 .24.04.32.16.36.44.88.72 1.44.84C10 7.68 10.92 7.2 12 7.2s2 .48 2.72 1.24c.56-.12 1.08-.4 1.44-.84.08-.12.2-.16.32-.16.24 0 .44.2.44.44 0 .72-.28 1.4-.72 1.92.08.36.12.72.12 1.12 0 1.4-.68 2.64-1.72 3.36.04.2.04.4 0 .6.68-.2 1.12-.52 1.24-.84.08-.2.32-.28.52-.2.2.08.28.32.2.56z"/>
              </svg>
            </div>
            <span class="text-xs text-light-ink">QQ</span>
          </button>
          <!-- 复制链接 -->
          <button class="flex flex-col items-center gap-2" @click="copyLink">
            <div class="w-12 h-12 rounded-full bg-warm flex items-center justify-center">
              <svg class="w-6 h-6 text-light-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.757 8.25" />
              </svg>
            </div>
            <span class="text-xs text-light-ink">复制链接</span>
          </button>
        </div>
        <!-- 取消 -->
        <button class="w-full mt-4 py-2.5 text-sm text-light-ink bg-cream rounded-xl" @click="$emit('close')">取消</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

import { USERS } from '@/libs/diary_helpers'

const props = defineProps({
  visible: { type: Boolean, default: false },
  diary: { type: Object, default: null }
})

const emit = defineEmits(['close'])

const siteUrl = computed(() => window.location.origin + import.meta.env.BASE_URL)

const shareText = computed(() => {
  if (!props.diary) return ''
  const author = USERS[props.diary.author]?.label ?? props.diary.author
  const text = props.diary.content.length > 50 ? props.diary.content.slice(0, 50) + '...' : props.diary.content
  return `${author}的动态：${text} 来自「小鱼与梓樱」${siteUrl.value}`
})

const shareWeibo = () => {
  const url = `https://service.weibo.com/share/share.php?title=${encodeURIComponent(shareText.value)}&url=${encodeURIComponent(siteUrl.value)}`
  window.open(url, '_blank')
  emit('close')
}

const shareWechat = async () => {
  try {
    await navigator.clipboard.writeText(shareText.value)
    alert('内容已复制到剪贴板，请打开微信粘贴分享')
  } catch {
    prompt('复制以下内容分享到微信：', shareText.value)
  }
  emit('close')
}

const shareQQ = () => {
  const url = `https://connect.qq.com/widget/shareqq/index.html?title=${encodeURIComponent('来自「小鱼与梓樱」')}&summary=${encodeURIComponent(shareText.value)}&url=${encodeURIComponent(siteUrl.value)}`
  window.open(url, '_blank')
  emit('close')
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareText.value)
    alert('已复制到剪贴板')
  } catch {
    prompt('复制以下内容：', shareText.value)
  }
  emit('close')
}
</script>
