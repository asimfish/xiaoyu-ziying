// 用户行为追踪 - 记录登录、页面浏览、操作行为

import { useGithubSync } from '@/composables/use_github_sync'

const FLUSH_INTERVAL = 30000
const BUFFER_KEY = 'tracker-buffer'

let session = null
let currentPage = null
let flushTimer = null
let flushing = false

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
  // 始终从远程读取最新数据再合并
  const remote = await loadRemote('analytics')
  const list = (remote && Array.isArray(remote.data)) ? remote.data : []
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

// 采集设备信息
const getDeviceInfo = () => {
  const ua = navigator.userAgent
  let browser = '未知浏览器'
  let os = '未知系统'
  let model = ''
  // 浏览器识别（顺序重要，微信/QQ 内置浏览器优先判断）
  if (/MicroMessenger/i.test(ua)) browser = '微信'
  else if (/QQ\//i.test(ua)) browser = 'QQ'
  else if (/Edg\/([\d.]+)/i.test(ua)) browser = `Edge ${RegExp.$1.split('.')[0]}`
  else if (/Chrome\/([\d.]+)/i.test(ua)) browser = `Chrome ${RegExp.$1.split('.')[0]}`
  else if (/Version\/([\d.]+).*Safari/i.test(ua)) browser = `Safari ${RegExp.$1}`
  else if (/Firefox\/([\d.]+)/i.test(ua)) browser = `Firefox ${RegExp.$1.split('.')[0]}`
  // 系统 + 设备型号识别
  if (/iPhone/.test(ua)) {
    os = 'iOS'
    // iPhone 无法从 UA 拿型号，用屏幕尺寸推断
    const h = screen.height
    const w = screen.width
    const r = window.devicePixelRatio
    model = guessIPhone(h, w, r)
  } else if (/iPad/.test(ua)) {
    os = 'iPadOS'
    model = 'iPad'
  } else if (/Android/.test(ua)) {
    os = 'Android'
    const m = ua.match(/;\s*([^;)]+)\s+Build/i)
    if (m) model = m[1].trim()
  } else if (/Mac OS X ([\d_]+)/.test(ua)) {
    os = `macOS ${RegExp.$1.replace(/_/g, '.')}`
    // 判断是否 Apple Silicon（通过 WebGL renderer）
    model = guessMac()
  } else if (/Windows NT ([\d.]+)/.test(ua)) {
    const ver = RegExp.$1
    const winMap = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' }
    os = `Windows ${winMap[ver] || ver}`
  } else if (/Linux/.test(ua)) {
    os = 'Linux'
  }
  const isMobile = /Mobile|Android|iPhone/i.test(ua)
  return {
    browser, os, model, mobile: isMobile,
    screen: `${screen.width}x${screen.height}`,
    ua: ua.slice(0, 200),
    location: ''
  }
}

// 通过屏幕参数推断 iPhone 型号
const guessIPhone = (h, w, r) => {
  const key = `${Math.max(h, w)}_${Math.min(h, w)}_${r}`
  const map = {
    // iPhone 17 系列 (2025)
    '956_440_3': 'iPhone 17 Pro Max',
    '874_402_3': 'iPhone 17 Pro',
    '852_393_3': 'iPhone 17 / 16',
    '932_430_3': 'iPhone 17 Air / 16 Plus',
    // iPhone 16 系列 (2024)
    // 16 Pro Max: 440x956 @3x (同 17 Pro Max)
    // 16 Pro: 402x874 @3x (同 17 Pro)
    // 16: 393x852 @3x (同 17)
    // 16 Plus: 430x932 @3x (同 17 Air)
    // iPhone 15 系列 (2023)
    // 15 Pro Max: 430x932 @3x
    // 15 Pro: 393x852 @3x
    // 15 Plus: 430x932 @3x
    // 15: 393x852 @3x
    // iPhone 14 系列
    '844_390_3': 'iPhone 14 / 13',
    '926_428_3': 'iPhone 14 Plus / 13 Pro Max',
    // iPhone 13 系列
    '812_375_3': 'iPhone 13 mini / 12 mini',
    // iPhone 12 系列
    '896_414_3': 'iPhone 12 / 11',
    '896_414_2': 'iPhone XR / 11',
    // 旧机型
    '736_414_3': 'iPhone 8 Plus / 7 Plus',
    '667_375_2': 'iPhone SE3 / SE2 / 8',
    '568_320_2': 'iPhone SE1 / 5s'
  }
  return map[key] || `iPhone`
}

// 通过 WebGL 推断 Mac 型号
const guessMac = () => {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')
    if (!gl) return 'Mac'
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    if (!ext) return 'Mac'
    const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
    if (/Apple M\d/i.test(renderer)) return renderer.match(/Apple M\d[\w]*/i)[0]
    if (/Apple GPU/i.test(renderer)) return 'Apple Silicon Mac'
    if (/Intel/i.test(renderer)) return 'Intel Mac'
    return 'Mac'
  } catch { return 'Mac' }
}

// 通过 IP 获取省级位置（异步，后续补充到 session）
const fetchLocation = async () => {
  try {
    const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' })
    if (!res.ok) return ''
    const data = await res.json()
    // 中国返回 region，国外返回 country
    if (data.country_code === 'CN') return data.region || data.city || '未知'
    return `${data.country_name} ${data.region || ''}`.trim()
  } catch { return '' }
}

// 开始新会话（追踪所有用户）
const startSession = (user) => {
  flushBuffer()
  const time = now()
  session = {
    id: `session_${Date.now()}`,
    user,
    loginTime: time,
    device: getDeviceInfo(),
    pages: [],
    actions: [{ type: 'login', detail: '登录成功', time }]
  }
  startAutoFlush()
  // 立即 flush 一次，确保登录记录实时同步
  flush()
  // 异步获取位置，拿到后补充并再次 flush
  fetchLocation().then(loc => {
    if (loc && session) {
      session.device.location = loc
      flush()
    }
  })
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
