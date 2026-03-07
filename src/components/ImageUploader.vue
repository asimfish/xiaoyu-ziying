<template>
  <div>
    <label class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-deep-rose text-white text-sm cursor-pointer hover:bg-rose transition-colors">
      <span>{{ uploading ? '上传中...' : '上传图片' }}</span>
      <input type="file" accept="image/*" multiple class="hidden" @change="onSelect" :disabled="uploading">
    </label>

    <!-- preview -->
    <div v-if="previews.length" class="mt-4 flex flex-wrap gap-3">
      <div v-for="(p, i) in previews" :key="i" class="relative">
        <img :src="p.url" alt="" class="w-20 h-20 rounded-lg object-cover">
        <div class="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center text-white text-xs">
          {{ p.sizeLabel }}
        </div>
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-500 mt-2">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

import { compressImage } from '@/libs/image'
import { uploadImage } from '@/libs/github'
import { useSettings } from '@/composables/use_settings'

const emit = defineEmits(['uploaded'])
const props = defineProps({
  folder: { type: String, default: '' }
})
const { githubToken, githubOwner, githubRepo, hasGithubConfig } = useSettings()

const uploading = ref(false)
const error = ref('')
const previews = ref([])

// 组件卸载时释放 blob URL
onUnmounted(() => {
  previews.value.forEach(p => URL.revokeObjectURL(p.url))
})

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB'
}

const onSelect = async (e) => {
  const files = Array.from(e.target.files)
  if (!files.length) return

  if (!hasGithubConfig()) {
    error.value = '请先在设置中配置 GitHub'
    return
  }

  error.value = ''
  uploading.value = true
  previews.value = []

  for (const file of files) {
    try {
      const compressed = await compressImage(file)
      previews.value.push({
        url: URL.createObjectURL(compressed.blob),
        sizeLabel: formatSize(compressed.blob.size)
      })

      // 上传到 GitHub（优先用 prop 指定的文件夹）
      const d = new Date()
      const fallback = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const folder = props.folder || fallback
      const path = `data/images/${folder}/${compressed.name}`

      const result = await uploadImage(
        githubToken.value, githubOwner.value, githubRepo.value,
        path, compressed.base64
      )

      if (result.ok) {
        emit('uploaded', { url: result.url, path })
      } else {
        error.value = `上传失败: ${result.error}`
      }
    } catch (err) {
      error.value = `处理失败: ${err.message}`
    }
  }

  uploading.value = false
  e.target.value = ''
}
</script>
