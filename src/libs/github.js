// GitHub Contents API 封装

const API_BASE = 'https://api.github.com'

const headers = (token) => ({
  Authorization: `token ${token}`,
  Accept: 'application/vnd.github.v3+json',
  'Content-Type': 'application/json'
})

// 读取文件内容（禁用浏览器缓存，GitHub API 默认 max-age=60 会导致轮询拿到旧数据）
export const readFile = async (token, owner, repo, path) => {
  const res = await fetch(`${API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
    headers: headers(token),
    cache: 'no-store'
  })
  if (res.status === 404) return { content: null, sha: null }
  if (!res.ok) return { content: null, sha: null, error: `${res.status} ${res.statusText}` }
  const data = await res.json()
  const raw = atob(data.content.replace(/\n/g, ''))
  const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0))
  const content = new TextDecoder().decode(bytes)
  return { content, sha: data.sha }
}

// 写入文件（创建或更新）
export const writeFile = async (token, owner, repo, path, content, sha) => {
  const body = {
    message: `update ${path}`,
    content: btoa(unescape(encodeURIComponent(content)))
  }
  if (sha) body.sha = sha
  const res = await fetch(`${API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(body)
  })
  if (!res.ok) return { ok: false, error: `${res.status} ${res.statusText}` }
  const data = await res.json()
  return { ok: true, sha: data.content.sha }
}

// 只获取文件 sha（不解码内容，适用于图片等二进制文件）
const getFileSha = async (token, owner, repo, path) => {
  const res = await fetch(`${API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
    headers: headers(token),
    cache: 'no-store'
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.sha
}

// 上传图片（base64）
export const uploadImage = async (token, owner, repo, path, base64Content) => {
  const body = {
    message: `upload ${path}`,
    content: base64Content
  }
  // 检查文件是否已存在，获取 sha 用于覆盖
  const sha = await getFileSha(token, owner, repo, path)
  if (sha) body.sha = sha
  const res = await fetch(`${API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(body)
  })
  if (!res.ok) return { ok: false, error: `${res.status} ${res.statusText}` }
  const data = await res.json()
  return { ok: true, sha: data.content.sha, url: data.content.download_url }
}

// 测试连接
export const testConnection = async (token, owner, repo) => {
  const res = await fetch(`${API_BASE}/repos/${owner}/${repo}`, {
    headers: headers(token),
    cache: 'no-store'
  })
  return res.ok
}
