// 图片压缩工具 - canvas resize + quality 递减直到 < 1MB

const MAX_SIZE = 1024 * 1024 // 1MB
const MAX_WIDTH = 1920

const loadImage = (file) => new Promise((resolve, reject) => {
  const img = new Image()
  img.onload = () => resolve(img)
  img.onerror = reject
  img.src = URL.createObjectURL(file)
})

const canvasToBlob = (canvas, quality) => new Promise((resolve) => {
  canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality)
})

// 压缩图片，返回 { blob, base64 }
export const compressImage = async (file) => {
  const img = await loadImage(file)

  const canvas = document.createElement('canvas')
  let { width, height } = img

  if (width > MAX_WIDTH) {
    height = Math.round(height * (MAX_WIDTH / width))
    width = MAX_WIDTH
  }

  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, width, height)

  URL.revokeObjectURL(img.src)

  // 递减 quality 直到 < 1MB
  let quality = 0.9
  let blob = await canvasToBlob(canvas, quality)

  while (blob.size > MAX_SIZE && quality > 0.1) {
    quality -= 0.1
    blob = await canvasToBlob(canvas, quality)
  }

  // 转 base64（GitHub API 需要）
  const base64 = await new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.readAsDataURL(blob)
  })

  return { blob, base64, name: file.name.replace(/\.[^.]+$/, '.jpg') }
}
