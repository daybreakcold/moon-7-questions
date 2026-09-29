import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../store'
import { G2_CHARS, G2Char } from '../data/content'
import { sfx } from '../audio/sfx'
import { IS_DEBUG, vibrate } from '../utils/helpers'
import MoonRabbit from '../components/MoonRabbit'
import SceneTitle from '../components/SceneTitle'

/** 第2关《船还能坐一个》：长按 300ms 激活拖拽，拖上船 */
const PRESS_MS = IS_DEBUG ? 0 : 300

export default function Game2() {
  const completeLevel = useGame((s) => s.completeLevel)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragPos, setDragPos] = useState({ dx: 0, dy: 0 })
  const [boarded, setBoarded] = useState<G2Char | null>(null)
  const [sailing, setSailing] = useState(false)
  const pressTimer = useRef(0)
  const startPos = useRef({ x: 0, y: 0 })
  const boatRef = useRef<HTMLDivElement>(null)
  const done = useRef(false)

  const cancelPress = () => {
    window.clearTimeout(pressTimer.current)
  }

  const onDown = (e: React.PointerEvent, c: G2Char) => {
    if (boarded) return
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    startPos.current = { x: e.clientX, y: e.clientY }
    cancelPress()
    if (IS_DEBUG) {
      setDragId(c.id)
      setDragPos({ dx: 0, dy: 0 })
      return
    }
    pressTimer.current = window.setTimeout(() => {
      setDragId(c.id)
      setDragPos({ dx: 0, dy: 0 })
      vibrate(20)
      sfx.pop()
    }, PRESS_MS)
  }

  const onMove = (e: React.PointerEvent, c: G2Char) => {
    const dx = e.clientX - startPos.current.x
    const dy = e.clientY - startPos.current.y
    if (!dragId) {
      // 长按前移动过多则取消
      if (Math.hypot(dx, dy) > 12) cancelPress()
      return
    }
    if (dragId === c.id) setDragPos({ dx, dy })
  }

  const onUp = (e: React.PointerEvent, c: G2Char) => {
    cancelPress()
    if (dragId !== c.id) return
    setDragId(null)
    const rect = boatRef.current?.getBoundingClientRect()
    const inside =
      rect &&
      e.clientX > rect.left - 40 &&
      e.clientX < rect.right + 40 &&
      e.clientY > rect.top - 70 &&
      e.clientY < rect.bottom + 50
    if (inside) {
      setBoarded(c)
      sfx.splash()
      vibrate(20)
    } else {
      setDragPos({ dx: 0, dy: 0 })
    }
  }

  // 上船后：开船 → 月光+1 → 下一关
  useEffect(() => {
    if (!boarded || done.current) return
    done.current = true
    const t1 = setTimeout(() => {
      setSailing(true)
      sfx.whoosh()
    }, 900)
    const t2 = setTimeout(() => {
      sfx.moonUp()
      vibrate([30, 50, 30])
      completeLevel(
        {
          level: 2,
          choice: boarded.id,
          label: boarded.label,
          flash: boarded.label === '一个模糊的人' ? '那个谁' : boarded.label,
          tags: boarded.tags,
        },
        'game3',
      )
    }, 3400)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [boarded, completeLevel])

  return (
    <div className="h-full touch-none select-none">
      <SceneTitle title="第 2 问 · 船还能坐一个" hint="长按，把 TA 拖上船" />

      {/* 岸上角色 */}
      <div className="grid grid-cols-3 gap-x-3 gap-y-5 px-10 pt-[calc(env(safe-area-inset-top)+8rem)]">
        {G2_CHARS.map((c) => {
          const active = dragId === c.id
          const gone = boarded?.id === c.id
          return (
            <div key={c.id} className="flex flex-col items-center gap-1.5">
              <div
                className="flex h-16 w-16 touch-none items-center justify-center rounded-full border text-3xl transition-shadow"
                style={{
                  opacity: gone ? 0 : 1,
                  transform: active
                    ? `translate(${dragPos.dx}px, ${dragPos.dy}px) scale(1.18)`
                    : 'translate(0,0) scale(1)',
                  zIndex: active ? 50 : 1,
                  position: 'relative',
                  background: active ? 'rgba(245,215,142,0.18)' : 'rgba(255,255,255,0.08)',
                  borderColor: active ? 'rgba(245,215,142,0.7)' : 'rgba(255,255,255,0.15)',
                  boxShadow: active ? '0 0 24px rgba(245,215,142,0.45)' : 'none',
                  transition: active ? 'box-shadow .15s' : 'transform .25s ease, box-shadow .15s',
                }}
                onPointerDown={(e) => onDown(e, c)}
                onPointerMove={(e) => onMove(e, c)}
                onPointerUp={(e) => onUp(e, c)}
                onPointerCancel={() => {
                  cancelPress()
                  setDragId(null)
                  setDragPos({ dx: 0, dy: 0 })
                }}
              >
                {c.emoji}
              </div>
              <span className="text-[11px] text-white/65" style={{ opacity: gone ? 0 : 1 }}>
                {c.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* 水面 */}
      <div className="water">
        <div className="waves" />
        <div className="waves slow" />
      </div>

      {/* 小船（摇曳 + 上船后驶向月亮） */}
      <motion.div
        className="absolute bottom-[16%] left-1/2 z-10 -ml-[75px]"
        animate={sailing ? { x: '22vw', y: '-13vh', opacity: 0.95 } : { x: 0, y: 0 }}
        transition={{ duration: 3.4, ease: 'easeIn' }}
      >
        <motion.div
          ref={boatRef}
          animate={{ y: [0, -5, 0], rotate: [-1.8, 1.8, -1.8] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="150" height="92" viewBox="0 0 150 92">
            {/* 船体 */}
            <path
              d="M10 52 Q 75 84 140 52 L 128 36 Q 75 54 22 36 Z"
              fill="#4a3a2c"
              stroke="rgba(245,215,142,0.45)"
              strokeWidth="1.5"
            />
            {/* 船头小灯 */}
            <circle cx="124" cy="42" r="3" fill="#f5d78e" />
            <circle cx="124" cy="42" r="8" fill="rgba(245,215,142,0.25)" />
            {/* 玩家剪影 */}
            <circle cx="72" cy="26" r="7" fill="#0d1128" />
            <path d="M59 52 Q 72 28 85 52 Z" fill="#0d1128" />
          </svg>
          {/* 上船的角色 */}
          {boarded && (
            <motion.span
              className="absolute -top-3 left-[52px] text-2xl"
              initial={{ scale: 0, y: -14 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            >
              {boarded.emoji}
            </motion.span>
          )}
        </motion.div>
      </motion.div>

      <MoonRabbit
        className="safe-bottom absolute bottom-6 left-4 z-20"
        text={boarded ? boarded.comment : '只能带一个。'}
      />
    </div>
  )
}
