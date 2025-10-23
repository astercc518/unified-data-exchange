/**
 * 图像验证码生成工具
 */

/**
 * 生成随机验证码字符串
 * @param {number} length 验证码长度
 * @returns {string} 验证码字符串
 */
export function generateCaptchaText(length = 4) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 排除容易混淆的字符 I,O,0,1
  let text = ''
  for (let i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return text
}

/**
 * 生成随机颜色
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @returns {string} RGB颜色
 */
function randomColor(min, max) {
  const r = randomNum(min, max)
  const g = randomNum(min, max)
  const b = randomNum(min, max)
  return `rgb(${r},${g},${b})`
}

/**
 * 生成随机数
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @returns {number} 随机数
 */
function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

/**
 * 绘制验证码图片
 * @param {string} text 验证码文本
 * @param {number} width 图片宽度
 * @param {number} height 图片高度
 * @returns {string} base64图片
 */
export function drawCaptcha(text, width = 120, height = 40) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  // 绘制背景
  ctx.fillStyle = randomColor(180, 240)
  ctx.fillRect(0, 0, width, height)

  // 绘制干扰线
  for (let i = 0; i < 8; i++) {
    ctx.strokeStyle = randomColor(40, 180)
    ctx.beginPath()
    ctx.moveTo(randomNum(0, width), randomNum(0, height))
    ctx.lineTo(randomNum(0, width), randomNum(0, height))
    ctx.stroke()
  }

  // 绘制干扰点
  for (let i = 0; i < 100; i++) {
    ctx.fillStyle = randomColor(0, 255)
    ctx.beginPath()
    ctx.arc(randomNum(0, width), randomNum(0, height), 1, 0, 2 * Math.PI)
    ctx.fill()
  }

  // 绘制验证码文字
  for (let i = 0; i < text.length; i++) {
    const fontSize = randomNum(20, 28)
    ctx.font = `${fontSize}px Arial`
    ctx.fillStyle = randomColor(50, 160)
    ctx.textBaseline = 'middle'

    const x = (width / text.length) * i + randomNum(10, 15)
    const y = height / 2 + randomNum(-5, 5)
    const angle = randomNum(-15, 15) * Math.PI / 180

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.fillText(text[i], 0, 0)
    ctx.restore()
  }

  return canvas.toDataURL('image/png')
}

/**
 * 创建验证码对象
 * @param {number} length 验证码长度
 * @param {number} width 图片宽度
 * @param {number} height 图片高度
 * @returns {object} 包含验证码文本和图片的对象
 */
export function createCaptcha(length = 4, width = 120, height = 40) {
  const text = generateCaptchaText(length)
  const image = drawCaptcha(text, width, height)
  return {
    text: text,
    image: image
  }
}

/**
 * 验证验证码（不区分大小写）
 * @param {string} input 用户输入
 * @param {string} correct 正确的验证码
 * @returns {boolean} 是否正确
 */
export function verifyCaptcha(input, correct) {
  if (!input || !correct) {
    return false
  }
  return input.toUpperCase() === correct.toUpperCase()
}
