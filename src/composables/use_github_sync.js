// GitHub 数据同步 - 读写 diaries.json, calendar.json, announcements.json, foods.json, places.json, academic.json

import { ref } from 'vue'

import { readFile, writeFile } from '@/libs/github'
import { useSettings } from '@/composables/use_settings'

const PATHS = {
  diaries: 'data/diaries.json',
  calendar: 'data/calendar.json',
  announcements: 'data/announcements.json',
  foods: 'data/foods.json',
  places: 'data/places.json',
  academic: 'data/academic.json',
  analytics: 'data/analytics.json',
  online: 'data/online.json',
  chats: 'data/chats.json',
  chat_memory_extra: 'data/chat_memory_extra.json'
}

export const useGithubSync = () => {
  const { githubToken, githubOwner, githubRepo, hasGithubConfig } = useSettings()
  const syncing = ref(false)
  const lastError = ref('')

  const getConfig = () => ({
    token: githubToken.value,
    owner: githubOwner.value,
    repo: githubRepo.value
  })

  // 读取远程数据
  const loadRemote = async (type) => {
    if (!hasGithubConfig()) return null
    const { token, owner, repo } = getConfig()
    const path = PATHS[type]
    const { content, sha, error } = await readFile(token, owner, repo, path)
    if (error) {
      lastError.value = error
      return null
    }
    // 文件不存在或内容为空，返回 null（不要返回空数组，防止覆盖本地数据）
    if (!content) return null
    try {
      return { data: JSON.parse(content), sha }
    } catch {
      return null
    }
  }

  // 保存到远程
  const saveRemote = async (type, data) => {
    if (!hasGithubConfig()) return false
    syncing.value = true
    lastError.value = ''
    const { token, owner, repo } = getConfig()
    const path = PATHS[type]

    // 先读取获取最新 sha
    const existing = await readFile(token, owner, repo, path)
    const content = JSON.stringify(data, null, 2)
    const result = await writeFile(token, owner, repo, path, content, existing.sha)

    syncing.value = false
    if (!result.ok) {
      lastError.value = result.error
      return false
    }
    return true
  }

  // 同步日记（合并本地和远程）
  const syncDiaries = async (localDiaries) => {
    const remote = await loadRemote('diaries')
    if (!remote) return localDiaries

    // 以 id 为 key 合并，本地优先
    const map = new Map()
    remote.data.forEach(d => map.set(d.id, d))
    localDiaries.forEach(d => map.set(d.id, d))
    const merged = [...map.values()]

    // 保存合并结果到远程
    await saveRemote('diaries', merged)
    return merged
  }

  // 同步日历事件
  const syncCalendar = async (localEvents) => {
    const remote = await loadRemote('calendar')
    if (!remote) return localEvents

    const map = new Map()
    remote.data.forEach(e => map.set(e.id, e))
    localEvents.forEach(e => map.set(e.id, e))
    const merged = [...map.values()]

    await saveRemote('calendar', merged)
    return merged
  }

  // 通用同步方法（公告、美食、地点、学术）
  const syncData = async (type, localData) => {
    const remote = await loadRemote(type)
    if (!remote) return localData

    const map = new Map()
    remote.data.forEach(d => map.set(d.id, d))
    localData.forEach(d => map.set(d.id, d))
    const merged = [...map.values()]

    await saveRemote(type, merged)
    return merged
  }

  return { syncing, lastError, loadRemote, saveRemote, syncDiaries, syncCalendar, syncData, hasGithubConfig }
}
