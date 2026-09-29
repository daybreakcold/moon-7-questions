export interface PosterData {
  name: string
  text: string
  keep: string
}

/** 带字距的居中文本 */
function drawTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  tracking: number,
): void {
  const chars = [...text]
  const widths = chars.map((c) => ctx.measureText(c).width)
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (chars.length - 1)
  let x = cx - total / 2
  const prevAlign = ctx.textAlign
  ctx.textAlign = 'left'
  chars.forEach((c, i) => {
    ctx.fillText(c, x, y)
    x += widths[i] + tracking
  })
  ctx.textAlign = prevAlign
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxW && line) {
      lines.push(line)
      line = ch
    } else {
      line += ch
    }
  }
  if (line) lines.push(line)
  return lines
}

/** 离屏 Canvas 绘制 750×1200 分享海报，返回 dataURL */
export function drawPoster(d: PosterData): string {
  const w = 750
  const h = 1200
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const serif = '"Songti SC","STSong","Noto Serif SC",serif'

  // 深空渐变
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#0b1026')
  g.addColorStop(0.55, '#1b2340')
  g.addColorStop(1, '#2a2f55')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  // 地平线暖光
  const hg = ctx.createRadialGradient(w / 2, h + 80, 10, w / 2, h + 80, 430)
  hg.addColorStop(0, 'rgba(244,165,96,0.20)')
  hg.addColorStop(1, 'rgba(244,165,96,0)')
  ctx.fillStyle = hg
  ctx.fillRect(0, h - 430, w, 430)

  // 星星
  for (let i = 0; i < 170; i++) {
    const x = Math.random() * w
    const y = Math.random() * h * 0.72
    const r = Math.random() * 1.4 + 0.4
    const a = Math.random() * 0.6 + 0.25
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,255,255,${a})`
    ctx.fill()
  }

  // 大满月 + 光晕
  const mx = w / 2
  const my = 320
  const mr = 128
  const mg = ctx.createRadialGradient(mx, my, mr * 0.4, mx, my, mr * 2.6)
  mg.addColorStop(0, 'rgba(245,215,142,0.35)')
  mg.addColorStop(0.5, 'rgba(245,215,142,0.10)')
  mg.addColorStop(1, 'rgba(245,215,142,0)')
  ctx.fillStyle = mg
  ctx.beginPath()
  ctx.arc(mx, my, mr * 2.6, 0, Math.PI * 2)
  ctx.fill()

  const mb = ctx.createRadialGradient(mx - 30, my - 36, 10, mx, my, mr)
  mb.addColorStop(0, '#fff9e8')
  mb.addColorStop(0.65, '#fbeecb')
  mb.addColorStop(1, '#efd9a2')
  ctx.fillStyle = mb
  ctx.beginPath()
  ctx.arc(mx, my, mr, 0, Math.PI * 2)
  ctx.fill()

  // 月海
  ctx.fillStyle = 'rgba(198,164,110,0.16)'
  ;[
    [mx + 38, my - 52, 16],
    [mx - 42, my + 18, 22],
    [mx + 18, my + 48, 12],
    [mx - 8, my - 16, 9],
  ].forEach(([x, y, r]) => {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  })

  // 文案
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = `26px ${serif}`
  drawTracked(ctx, '我的月亮', w / 2, 575, 10)

  ctx.fillStyle = '#f5d78e'
  ctx.font = `600 62px ${serif}`
  ctx.fillText(`「${d.name}」`, w / 2, 672)

  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.font = `30px ${serif}`
  const lines = wrapText(ctx, d.text, 560)
  let y = 772
  for (const line of lines) {
    ctx.fillText(line, w / 2, y)
    y += 54
  }

  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.font = `28px ${serif}`
  ctx.fillText(`今年我最想留下：「${d.keep}」`, w / 2, y + 56)

  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = `26px ${serif}`
  drawTracked(ctx, '2026 中秋', w / 2, 1030, 8)

  ctx.fillStyle = 'rgba(255,255,255,0.42)'
  ctx.font = `24px ${serif}`
  ctx.fillText('今晚，月亮问了你 7 个问题', w / 2, 1115)

  return canvas.toDataURL('image/png')
}
