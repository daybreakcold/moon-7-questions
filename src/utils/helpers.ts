export function vibrate(pattern: number | number[]): void {
  try {
    if ('vibrate' in navigator) navigator.vibrate(pattern)
  } catch {
    /* 不支持时静默降级 */
  }
}

export const rand = (a: number, b: number): number => a + Math.random() * (b - a)

export const randInt = (a: number, b: number): number => Math.floor(rand(a, b + 1))

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v))

/** 测试专用：?debug 时放慢动画/取消长按延迟（默认关闭，不影响正式玩法） */
export const IS_DEBUG =
  typeof window !== 'undefined' && window.location.search.includes('debug')
