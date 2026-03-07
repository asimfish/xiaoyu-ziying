import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const base = import.meta.env.BASE_URL

// 用户信息
export const USERS = {
  xiaoyu: { label: '小鱼', avatar: `${base}assets/images/avatars/xiaoyu.png`, colorClass: 'bg-rose/20 text-deep-rose' },
  ziying: { label: '梓樱', avatar: `${base}assets/images/avatars/ziying.png`, colorClass: 'bg-friend-border/20 text-friend-blue' }
}

// 心情选项
export const MOODS = [
  { key: 'happy', label: '开心' },
  { key: 'sad', label: '难过' },
  { key: 'angry', label: '生气' },
  { key: 'calm', label: '平静' },
  { key: 'excited', label: '兴奋' },
  { key: 'tired', label: '疲惫' },
  { key: 'missing', label: '思念' }
]

// 天气选项
export const WEATHERS = [
  { key: 'sunny', label: '晴' },
  { key: 'cloudy', label: '多云' },
  { key: 'rainy', label: '雨' },
  { key: 'snowy', label: '雪' },
  { key: 'windy', label: '风' }
]

// 表情反应选项
export const REACTION_EMOJIS = ['\u2764\uFE0F', '\uD83D\uDE02', '\uD83D\uDE22', '\uD83D\uDE2E', '\uD83D\uDC4D', '\uD83C\uDF89']

// 标准化动态数据（兼容旧日记）
export const normalizeDiary = (d) => ({
  ...d,
  title: d.title ?? '',
  images: d.images ?? [],
  mood: d.mood ?? '',
  weather: d.weather ?? '',
  likes: d.likes ?? [],
  reactions: d.reactions ?? {},
  comments: d.comments ?? [],
  edited: d.edited ?? false
})

// 相对时间
export const relativeTimeStr = (dateStr) => dayjs(dateStr).fromNow()

// 心情/天气 key → label
export const moodLabel = (key) => MOODS.find(m => m.key === key)?.label
export const weatherLabel = (key) => WEATHERS.find(w => w.key === key)?.label

// 合并两个动态数组（解决并发冲突）
export const mergeDiaries = (remote, local) => {
  if (!Array.isArray(remote) || !Array.isArray(local)) return local
  const map = new Map()
  remote.forEach(d => d && d.id !== undefined && map.set(d.id, d))
  local.forEach(d => {
    if (!d || d.id === undefined) return
    const existing = map.get(d.id)
    if (!existing) { map.set(d.id, d); return }
    // 合并互动数据
    const mergedLikes = [...new Set([...(existing.likes ?? []), ...(d.likes ?? [])])]
    const commentMap = new Map()
    ;(existing.comments ?? []).forEach(c => commentMap.set(c.id, c))
    ;(d.comments ?? []).forEach(c => commentMap.set(c.id, c))
    const mergedReactions = { ...(existing.reactions ?? {}) }
    Object.entries(d.reactions ?? {}).forEach(([emoji, users]) => {
      mergedReactions[emoji] = [...new Set([...(mergedReactions[emoji] ?? []), ...users])]
    })
    // 内容以较新的为准
    const newer = d.date >= existing.date ? d : existing
    map.set(d.id, { ...newer, likes: mergedLikes, comments: [...commentMap.values()], reactions: mergedReactions })
  })
  return [...map.values()]
}
