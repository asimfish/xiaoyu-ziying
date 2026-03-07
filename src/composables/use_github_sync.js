// GitHub 数据同步 - 读写 JSON 数据文件
// 缓存策略：loadRemote 先返回 localStorage 缓存，后台刷新

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
  chat_memory_extra: 'data/chat_memory_extra.json',
  gallery: 'data/gallery.json'
}

// 不走缓存的类型（实时性要求高）
const NO_CACHE_TYPES = new Set(['analytics', 'online'])

const cacheKey = (type) => `gh-cache-${type}`

const getCache = (type) => {
  try {
    const raw = localStorage.getItem(cacheKey(type))
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

const setCache = (type, data) => {
  try { localStorage.setItem(cacheKey(type), JSON.stringify(data)) } catch {}
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

  // 读取远程数据（带缓存）
  const loadRemote = async (type) => {
    if (!hasGithubConfig()) return null
    const { token, owner, repo } = getConfig()
    const path = PATHS[type]
    const { content, sha, error } = await readFile(token, owner, repo, path)
    if (error) {
      lastError.value = error
      // 请求失败时返回缓存
      const cached = getCache(type)
      return cached ? { data: cached, sha: null } : null
    }
    if (!content) return null
    try {
      const data = JSON.parse(content)
      // 更新缓存（实时类型不缓存）
      if (!NO_CACHE_TYPES.has(type)) setCache(type, data)
      return { data, sha }
    } catch {
      return null
    }
  }

  // 快速加载：先返回缓存，后台刷新（用于页面初始化）
  const loadCached = (type) => {
    if (NO_CACHE_TYPES.has(type)) return null
    const cached = getCache(type)
    return cached ? { data: cached, sha: null } : null
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
    // 写入成功后更新缓存
    if (!NO_CACHE_TYPES.has(type)) setCache(type, data)
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

  return { syncing, lastError, loadRemote, loadCached, saveRemote, syncDiaries, syncCalendar, syncData, hasGithubConfig }
}
