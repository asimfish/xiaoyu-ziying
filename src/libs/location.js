const CACHE_KEY = 'ip_location'

export const getLocation = async () => {
  const cached = sessionStorage.getItem(CACHE_KEY)
  if (cached) return JSON.parse(cached)

  const result = { province: '', city: '' }

  try {
    const res = await fetch('https://ip-api.com/json/?lang=zh-CN')
    if (res.ok) {
      const data = await res.json()
      if (data.status === 'success') {
        result.province = data.regionName
        result.city = data.city
      }
    }
  } catch {
    try {
      const res = await fetch('https://ipapi.co/json/')
      if (res.ok) {
        const data = await res.json()
        result.province = data.region
        result.city = data.city
      }
    } catch {
      // 定位失败，返回空
    }
  }

  sessionStorage.setItem(CACHE_KEY, JSON.stringify(result))
  return result
}
