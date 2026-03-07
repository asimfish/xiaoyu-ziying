// 自动同步 - 8秒轮询 GitHub
// 解决跨浏览器/跨设备实时同步问题

import { ref, onUnmounted } from 'vue'

import { useGithubSync } from './use_github_sync'

const POLL_INTERVAL = 8000

export const useAutoSync = (type, options = {}) => {
  const { loadRemote, saveRemote, hasGithubConfig } = useGithubSync()
  const data = ref(options.default !== undefined ? options.default : [])
  const loaded = ref(false)

  const cacheKey = `memorial-${type}`
  let pollTimer = null
  let lastJson = ''
  let pulling = false
  let pushing = false

  const loadCache = () => {
    try { return JSON.parse(localStorage.getItem(cacheKey)) }
    catch { return null }
  }

  const saveCache = (d) => localStorage.setItem(cacheKey, JSON.stringify(d))

  // 从 GitHub 拉取最新数据
  const pull = async () => {
    if (pulling || pushing || !hasGithubConfig()) return
    pulling = true
    try {
      const remote = await loadRemote(type)
      if (!remote || remote.data === undefined || remote.data === null) {
        pulling = false
        loaded.value = true
        return
      }
      // 远程是空数据且本地有数据时，不覆盖（防止远程空文件清掉本地记录）
      const remoteEmpty = Array.isArray(remote.data) ? remote.data.length === 0 : !remote.data
      const localHasData = Array.isArray(data.value) ? data.value.length > 0 : !!data.value
      if (remoteEmpty && localHasData) {
        // 本地有数据但远程是空的，把本地数据推上去
        pulling = false
        loaded.value = true
        await save(data.value)
        return
      }
      const json = JSON.stringify(remote.data)
      if (json !== lastJson) {
        lastJson = json
        data.value = remote.data
        saveCache(remote.data)
      }
      loaded.value = true
    } catch {
      // 网络错误，跳过本轮
    }
    pulling = false
  }

  // 推送到 GitHub，冲突时合并重试
  const save = async (newData) => {
    pushing = true
    data.value = newData
    saveCache(newData)

    if (!hasGithubConfig()) { pushing = false; return }

    const ok = await saveRemote(type, newData)
    if (ok) {
      lastJson = JSON.stringify(newData)
      pushing = false
      return
    }
    // 写入失败（SHA 冲突）- 重新读取、合并、重试
    const remote = await loadRemote(type)
    if (!remote) { pushing = false; return }
    const merged = mergeData(remote.data, newData)
    data.value = merged
    saveCache(merged)
    lastJson = JSON.stringify(merged)
    await saveRemote(type, merged)
    pushing = false
  }

  // 合并策略：自定义 > 数组按 ID 合并 > 直接覆盖
  const mergeData = (remote, local) => {
    if (options.merge) return options.merge(remote, local)
    if (!Array.isArray(remote) || !Array.isArray(local)) return local
    const map = new Map()
    remote.forEach(d => d && d.id !== undefined && map.set(d.id, d))
    local.forEach(d => d && d.id !== undefined && map.set(d.id, d))
    return [...map.values()]
  }

  // 初始化：先用缓存渲染，再从 GitHub 拉取，启动轮询
  const init = async () => {
    const cached = loadCache()
    if (cached) data.value = cached
    await pull()
    pollTimer = setInterval(pull, POLL_INTERVAL)
  }

  const stop = () => {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
  }

  onUnmounted(stop)

  return { data, loaded, pull, save, init, stop }
}
