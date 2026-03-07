// 在线状态 - 心跳机制，写入 data/online.json

import { ref } from 'vue'

import { useGithubSync } from '@/composables/use_github_sync'

const HEARTBEAT_INTERVAL = 30000
const ONLINE_THRESHOLD = 90000

let heartbeatTimer = null
let currentUser = null
let currentPath = '/'

const onlineStatus = ref({})

const now = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const PAGE_NAMES = {
  '/': '首页', '/memorial/love': '上篇', '/memorial/friend': '下篇',
  '/gallery': '相册', '/diary': '日记', '/chat': '聊天',
  '/calendar': '日历', '/announcements': '公告', '/games': '游戏',
  '/food': '美食', '/places': '足迹', '/academic': '学术',
  '/settings': '设置', '/admin': '管理'
}

// 发送心跳
const sendHeartbeat = async () => {
  if (!currentUser) return
  const { loadRemote, saveRemote, hasGithubConfig } = useGithubSync()
  if (!hasGithubConfig()) return
  const remote = await loadRemote('online')
  const data = (remote && remote.data) ? remote.data : {}
  data[currentUser] = {
    lastSeen: now(),
    page: currentPath,
    pageName: PAGE_NAMES[currentPath] || currentPath
  }
  await saveRemote('online', data)
}

// 读取在线状态
const fetchOnlineStatus = async () => {
  const { loadRemote, hasGithubConfig } = useGithubSync()
  if (!hasGithubConfig()) return
  const remote = await loadRemote('online')
  if (remote && remote.data) onlineStatus.value = remote.data
}

// 判断用户是否在线
const isOnline = (user) => {
  const info = onlineStatus.value[user]
  if (!info) return false
  const last = new Date(info.lastSeen).getTime()
  return Date.now() - last < ONLINE_THRESHOLD
}

// 启动心跳
const startHeartbeat = (user) => {
  currentUser = user
  sendHeartbeat()
  if (heartbeatTimer) clearInterval(heartbeatTimer)
  heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)
  // 离开页面时发送离线心跳
  window.addEventListener('beforeunload', stopHeartbeat)
}

// 更新当前页面
const updatePage = (path) => {
  currentPath = path
}

// 停止心跳
const stopHeartbeat = async () => {
  if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null }
  if (!currentUser) return
  const { loadRemote, saveRemote, hasGithubConfig } = useGithubSync()
  if (!hasGithubConfig()) return
  const remote = await loadRemote('online')
  const data = (remote && remote.data) ? remote.data : {}
  // 设置一个过去的时间，让其判定为离线
  data[currentUser] = { lastSeen: '2000-01-01 00:00:00', page: '', pageName: '' }
  await saveRemote('online', data)
}

export { onlineStatus, isOnline, startHeartbeat, updatePage, stopHeartbeat, fetchOnlineStatus }
