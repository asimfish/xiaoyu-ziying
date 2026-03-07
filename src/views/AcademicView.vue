<template>
  <div class="max-w-[700px] mx-auto px-4 py-8">
    <h1 class="font-serif text-3xl text-ink text-center mb-8 tracking-wider">学术空间</h1>

    <!-- folder management -->
    <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 mb-6">
      <h2 class="font-serif text-lg text-ink mb-4">文件夹</h2>
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="f in folders" :key="f.id"
          @click="activeFolder = f.id"
          class="px-4 py-2 rounded-full text-sm transition-all border"
          :class="activeFolder === f.id ? 'bg-deep-rose text-white border-deep-rose' : 'bg-white text-light-ink border-warm hover:border-rose'"
        >{{ f.name }}</button>
        <button @click="activeFolder = null" class="px-4 py-2 rounded-full text-sm border border-warm text-light-ink hover:border-rose transition-all" :class="!activeFolder ? 'bg-deep-rose text-white border-deep-rose' : ''">全部</button>
      </div>
      <div class="flex gap-2">
        <input v-model="newFolderName" placeholder="新文件夹名称" class="flex-1 px-4 py-2 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none focus:border-rose transition-colors">
        <button @click="addFolder" :disabled="!newFolderName.trim()" class="px-4 py-2 rounded-full bg-deep-rose text-white text-sm hover:bg-rose transition-colors disabled:opacity-40">创建</button>
      </div>
    </div>

    <!-- add paper -->
    <div class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 mb-6">
      <h2 class="font-serif text-lg text-ink mb-4">添加论文</h2>
      <select v-model="newPaperFolder" class="w-full px-4 py-2 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none mb-3">
        <option value="">选择文件夹</option>
        <option v-for="f in folders" :key="f.id" :value="f.id">{{ f.name }}</option>
      </select>
      <input v-model="newPaperTitle" placeholder="论文标题" class="w-full px-4 py-2 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none focus:border-rose transition-colors mb-3">
      <div class="flex items-center justify-between">
        <label class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-friend-blue text-white text-sm cursor-pointer hover:bg-friend-border transition-colors">
          <span>{{ uploading ? '上传中...' : '选择 PDF' }}</span>
          <input type="file" accept=".pdf" class="hidden" @change="onPdfSelect" :disabled="uploading">
        </label>
        <button @click="addPaper" :disabled="!newPaperTitle.trim() || !newPaperFolder" class="px-6 py-2 rounded-full bg-deep-rose text-white text-sm tracking-wider hover:bg-rose transition-colors disabled:opacity-40">添加</button>
      </div>
      <p v-if="selectedPdf" class="text-xs text-light-ink mt-2">已选: {{ selectedPdf.name }}</p>
    </div>

    <!-- papers list -->
    <div v-for="p in filteredPapers" :key="p.id" class="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6 mb-4">
      <div class="flex items-center justify-between mb-2">
        <h3 class="font-serif text-lg text-ink">{{ p.title }}</h3>
        <span class="text-xs px-2 py-0.5 rounded-full bg-cream text-light-ink">{{ getFolderName(p.folderId) }}</span>
      </div>
      <p v-if="p.fileName" class="text-sm text-light-ink mb-3">{{ p.fileName }}</p>

      <!-- comments -->
      <div v-if="p.comments && p.comments.length" class="border-t border-warm pt-3 mt-3 space-y-2">
        <div v-for="c in p.comments" :key="c.id" class="text-sm">
          <span class="text-deep-rose">{{ c.author === 'xiaoyu' ? '小鱼' : '梓樱' }}</span>
          <span class="text-light-ink text-xs ml-2">{{ c.date }}</span>
          <p class="text-ink mt-1">{{ c.content }}</p>
        </div>
      </div>

      <!-- add comment -->
      <div class="mt-3 flex gap-2">
        <IdentityPicker v-model="commentAuthors[p.id]" />
      </div>
      <div class="flex gap-2 mt-2">
        <input v-model="commentTexts[p.id]" placeholder="添加评论..." class="flex-1 px-3 py-1.5 rounded-lg border border-warm bg-cream/50 text-ink text-sm outline-none focus:border-rose transition-colors">
        <button @click="addComment(p.id)" :disabled="!commentTexts[p.id]?.trim()" class="px-4 py-1.5 rounded-full bg-deep-rose text-white text-xs hover:bg-rose transition-colors disabled:opacity-40">评论</button>
      </div>
    </div>
    <p v-if="!filteredPapers.length" class="text-center text-light-ink py-16">还没有论文</p>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'

import IdentityPicker from '@/components/IdentityPicker.vue'
import { useAutoSync } from '@/composables/use_auto_sync'
import { useGithubSync } from '@/composables/use_github_sync'
import { useSettings } from '@/composables/use_settings'
import { uploadImage } from '@/libs/github'
import dayjs from 'dayjs'

const { hasGithubConfig } = useGithubSync()
const { githubToken, githubOwner, githubRepo } = useSettings()

// 自定义合并：folders 按 id 合并，papers 按 id 合并（含 comments）
const mergeAcademic = (remote, local) => {
  if (!remote || !remote.folders) return local
  const fMap = new Map()
  ;(remote.folders || []).forEach(f => fMap.set(f.id, f))
  ;(local.folders || []).forEach(f => fMap.set(f.id, f))
  const pMap = new Map()
  ;(remote.papers || []).forEach(p => pMap.set(p.id, p))
  ;(local.papers || []).forEach(p => {
    const existing = pMap.get(p.id)
    if (existing) {
      // 合并 comments
      const cMap = new Map()
      ;(existing.comments || []).forEach(c => cMap.set(c.id, c))
      ;(p.comments || []).forEach(c => cMap.set(c.id, c))
      pMap.set(p.id, { ...p, comments: [...cMap.values()] })
    } else {
      pMap.set(p.id, p)
    }
  })
  return { folders: [...fMap.values()], papers: [...pMap.values()] }
}

const { data, save, init } = useAutoSync('academic', {
  default: { folders: [], papers: [] },
  merge: mergeAcademic
})

const folders = computed(() => data.value.folders || [])
const papers = computed(() => data.value.papers || [])

const activeFolder = ref(null)
const filteredPapers = computed(() => {
  const list = activeFolder.value ? papers.value.filter(p => p.folderId === activeFolder.value) : papers.value
  return [...list].sort((a, b) => b.id - a.id)
})

const getFolderName = (id) => folders.value.find(f => f.id === id)?.name || '未分类'

// folder
const newFolderName = ref('')
const addFolder = async () => {
  if (!newFolderName.value.trim()) return
  const newData = {
    folders: [...folders.value, { id: `folder-${Date.now()}`, name: newFolderName.value.trim() }],
    papers: [...papers.value]
  }
  newFolderName.value = ''
  await save(newData)
}

// paper
const newPaperTitle = ref('')
const newPaperFolder = ref('')
const selectedPdf = ref(null)
const uploading = ref(false)

const onPdfSelect = (e) => {
  selectedPdf.value = e.target.files[0]
}

const addPaper = async () => {
  if (!newPaperTitle.value.trim() || !newPaperFolder.value) return

  let fileName = ''
  let githubPath = ''

  if (selectedPdf.value && hasGithubConfig()) {
    uploading.value = true
    const folderName = getFolderName(newPaperFolder.value)
    const safeName = selectedPdf.value.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    githubPath = `data/papers/${folderName}/${safeName}`
    fileName = selectedPdf.value.name

    const reader = new FileReader()
    const base64 = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.readAsDataURL(selectedPdf.value)
    })

    await uploadImage(githubToken.value, githubOwner.value, githubRepo.value, githubPath, base64)
    uploading.value = false
  }

  const newData = {
    folders: [...folders.value],
    papers: [...papers.value, {
      id: Date.now(),
      folderId: newPaperFolder.value,
      title: newPaperTitle.value.trim(),
      fileName,
      githubPath,
      comments: []
    }]
  }
  newPaperTitle.value = ''
  selectedPdf.value = null
  await save(newData)
}

// comments
const commentTexts = reactive({})
const commentAuthors = reactive({})

const addComment = async (paperId) => {
  const text = commentTexts[paperId]?.trim()
  if (!text) return
  const paper = papers.value.find(p => p.id === paperId)
  if (!paper) return
  const updatedPapers = papers.value.map(p => {
    if (p.id !== paperId) return p
    return { ...p, comments: [...(p.comments || []), {
      id: Date.now(),
      author: commentAuthors[paperId] || 'xiaoyu',
      content: text,
      date: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }]}
  })
  commentTexts[paperId] = ''
  await save({ folders: [...folders.value], papers: updatedPapers })
}

onMounted(() => init())
</script>
