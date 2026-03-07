// 用户行为追踪 - 记录登录、页面浏览、操作行为

import { useGithubSync } from '@/composables/use_github_sync'

const FLUSH_INTERVAL = 30000
const BUFFER_KEY = 'tracker-buffer'

let session = null
let currentPage = null
let flushTimer = null
let flushing = false
let dataRebuilt = false

// 页面路径到中文名映射
const PAGE_NAMES = {
  '/': '首页',
  '/memorial/love': '上篇',
  '/memorial/friend': '下篇',
  '/gallery': '相册',
  '/diary': '日记',
  '/chat': '聊天',
  '/calendar': '日历',
  '/announcements': '公告',
  '/games': '游戏',
  '/food': '美食',
  '/places': '足迹',
  '/academic': '学术',
  '/settings': '设置',
  '/admin': '管理'
}

const now = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// 上传数据到 GitHub
const flush = async () => {
  if (!session || flushing) return
  flushing = true
  // 快照当前页面计时
  if (currentPage && !currentPage.leave) {
    currentPage.leave = now()
    currentPage.duration = Math.round((new Date(currentPage.leave) - new Date(currentPage.enter)) / 1000)
  }
  const { loadRemote, saveRemote, hasGithubConfig } = useGithubSync()
  if (!hasGithubConfig()) { flushing = false; return }
  // 首次 flush 清空旧乱码数据，重建干净数组
  let list = []
  if (dataRebuilt) {
    const remote = await loadRemote('analytics')
    list = (remote && Array.isArray(remote.data)) ? remote.data : []
  } else {
    dataRebuilt = true
  }
  const idx = list.findIndex((s) => s.id === session.id)
  if (idx >= 0) {
    list[idx] = { ...session }
  } else {
    list.push({ ...session })
  }
  await saveRemote('analytics', list)
  // flush 后重置当前页面的 leave，让计时继续
  if (currentPage) currentPage.leave = ''
  flushing = false
}

// 开始新会话（追踪所有用户）
const startSession = (user) => {
  flushBuffer()
  const time = now()
  session = {
    id: `session_${Date.now()}`,
    user,
    loginTime: time,
    pages: [],
    actions: [{ type: 'login', detail: '登录成功', time }]
  }
  startAutoFlush()
  // 立即 flush 一次，确保登录记录实时同步
  flush()
  window.addEventListener('beforeunload', onBeforeUnload)
}

// 记录页面浏览
const trackPage = (path) => {
  if (!session) return
  const time = now()
  if (currentPage) {
    currentPage.leave = time
    currentPage.duration = Math.round((new Date(time) - new Date(currentPage.enter)) / 1000)
  }
  const name = PAGE_NAMES[path]
  if (!name) return
  currentPage = { path, name, enter: time, leave: '', duration: 0 }
  session.pages.push(currentPage)
  // 页面切换时立即同步
  flush()
}

// 记录操作
const trackAction = (type, detail) => {
  if (!session) return
  session.actions.push({ type, detail, time: now() })
}

const startAutoFlush = () => {
  if (flushTimer) clearInterval(flushTimer)
  flushTimer = setInterval(flush, FLUSH_INTERVAL)
}

const onBeforeUnload = () => {
  if (!session) return
  if (currentPage && !currentPage.leave) {
    currentPage.leave = now()
    currentPage.duration = Math.round((new Date(currentPage.leave) - new Date(currentPage.enter)) / 1000)
  }
  localStorage.setItem(BUFFER_KEY, JSON.stringify(session))
}

// 恢复并上传上次未完成的缓冲数据
const flushBuffer = async () => {
  const saved = localStorage.getItem(BUFFER_KEY)
  if (!saved) return
  localStorage.removeItem(BUFFER_KEY)
  try {
    const buffered = JSON.parse(saved)
    const { loadRemote, saveRemote, hasGithubConfig } = useGithubSync()
    if (!hasGithubConfig()) return
    const remote = await loadRemote('analytics')
    const list = (remote && Array.isArray(remote.data)) ? remote.data : []
    const idx = list.findIndex((s) => s.id === buffered.id)
    if (idx >= 0) {
      list[idx] = buffered
    } else {
      list.push(buffered)
    }
    await saveRemote('analytics', list)
  } catch {
    // 缓冲数据损坏，忽略
  }
}

export { startSession, trackPage, trackAction, flush }
