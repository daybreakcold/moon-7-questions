import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '../store'
import { G6Pick } from '../data/content'
import { sfx } from '../audio/sfx'
import { vibrate } from '../utils/helpers'
import SceneTitle from '../components/SceneTitle'

interface DragState {
  x: number
  t: number
  signChanges: number
  lastSign: number
}

/** 第6关《别想，快选》：3 秒倒计时 + 左滑选左 / 右滑选右 */
export default function Game6() {
  const run = useGame((s) => s.run)
  const completeLevel = useGame((s) => s.completeLevel)
  const pushToast = useGame((s) => s.pushToast)

  const qs = run.g6
  const [idx, setIdx] = useState(0)
  const [picks, setPicks] = useState<G6Pick[]>([])
  const [dragX, setDragX] = useState(0)
  const drag = useRef<DragState | null>(null)
  const finished = useRef(false)

  const q = qs[Math.min(idx, qs.length - 1)]
  const answered = picks.length

  const pushPick = (p: G6Pick) => {
    setPicks((prev) => [...prev, p])
    setIdx((i) => i + 1)
    setDragX(0)
  }

  const choose = (side: 'left' | 'right') => {
    const st = drag.current
    const tags = side === 'left' ? q.ltags : q.rtags
    const label = side === 'left' ? q.left : q.right
    const elapsed = st ? performance.now() - st.t : 9999
    if (elapsed < 900 && tags.includes('money')) pushToast('毫不犹豫。')
    else if (st && st.signChanges > 0) pushToast('刚才那个我看见了。')
    sfx.pop()
    vibrate(12)
    pushPick({ qid: q.id, side, label, tags })
  }

  const onTimeout = () => {
    if (answered !== idx || finished.current) return
    pushToast('成年人的答案：我都要。')
    sfx.failBuzz()
    vibrate(8)
    pushPick({ qid: q.id, side: 'timeout', label: '都要', tags: ['hesitate'] })
  }

  const onDown = (e: React.PointerEvent) => {
    if (finished.current) return
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    drag.current = { x: e.clientX, t: performance.now(), signChanges: 0, lastSign: 0 }
  }

  const onMove = (e: React.PointerEvent) => {
    const st = drag.current
    if (!st || finished.current) return
    const dx = e.clientX - st.x
    setDragX(dx)
    const sign = Math.sign(dx)
    if (Math.abs(dx) > 24 && sign !== 0) {
      if (st.lastSign !== 0 && sign !== st.lastSign) st.signChanges++
      st.lastSign = sign
    }
  }

  const onUp = (e: React.PointerEvent) => {
    const st = drag.current
    if (!st || finished.current) return
    const dx = e.clientX - st.x
    drag.current = null
    if (Math.abs(dx) > 60) choose(dx < 0 ? 'left' : 'right')
    else setDragX(0)
  }

  // 全部答完 → 下一关
  useEffect(() => {
    if (picks.length !== qs.length || finished.current) return
    finished.current = true
    const t = setTimeout(() => {
      sfx.moonUp()
      vibrate([30, 50, 30])
      completeLevel(
        {
          level: 6,
          choice: picks.map((p) => `${p.qid}:${p.side}`).join(','),
          label: picks.map((p) => p.label).join(' / '),
          flash: (picks.find((p) => p.side !== 'timeout') ?? picks[0]).label,
          tags: picks.flatMap((p) => p.tags),
          detail: { picks },
        },
        'game7',
      )
    }, 1100)
    return () => clearTimeout(t)
  }, [picks, qs.length, completeLevel])

  const leftGlow = dragX < -30 ? Math.min(1, -dragX / 150) : 0
  const rightGlow = dragX > 30 ? Math.min(1, dragX / 150) : 0

  return (
    <div
      className="flex h-full touch-none select-none flex-col"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <SceneTitle title="第 6 问 · 别想，快选" hint={`第 ${Math.min(idx + 1, qs.length)} / ${qs.length} 题`} />

      {/* 倒计时条 */}
      <div className="safe-top mx-8 mt-[74px] h-1 overflow-hidden rounded-full bg-white/10">
        {idx < qs.length && (
          <motion.div
            key={idx}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg,#f5d78e,#e8a94e)' }}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 3, ease: 'linear' }}
            onAnimationComplete={onTimeout}
          />
        )}
      </div>

      {/* 左右选项半屏 */}
      <AnimatePresence mode="wait">
        {idx < qs.length && (
          <motion.div
            key={idx}
            className="relative flex flex-1 items-stretch"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0, x: dragX * 0.12, rotate: dragX * 0.012 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.22 }}
          >
            {/* 左半 */}
            <div className="relative flex flex-1 items-center justify-end pr-7">
              <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(90deg, rgba(245,215,142,0.22), transparent)' }}
                animate={{ opacity: leftGlow }}
              />
              <span className="text-right font-title text-[26px] leading-snug text-white/90">{q.left}</span>
            </div>
            {/* 中线 + VS */}
            <div className="relative flex w-px items-center justify-center bg-white/15">
              <span className="absolute rounded-full border border-white/25 bg-night2 px-2 py-1 text-[10px] text-white/50">
                VS
              </span>
            </div>
            {/* 右半 */}
            <div className="relative flex flex-1 items-center justify-start pl-7">
              <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(-90deg, rgba(245,215,142,0.22), transparent)' }}
                animate={{ opacity: rightGlow }}
              />
              <span className="font-title text-[26px] leading-snug text-white/90">{q.right}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部提示 */}
      <div className="safe-bottom pointer-events-none pb-10 text-center text-xs text-white/40">
        ← 左滑选左 · 右滑选右 →
      </div>
    </div>
  )
}
