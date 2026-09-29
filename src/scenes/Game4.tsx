import { useEffect, useReducer, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '../store'
import { G4_STOPS } from '../data/content'
import { sfx } from '../audio/sfx'
import { clamp, vibrate } from '../utils/helpers'
import MoonRabbit from '../components/MoonRabbit'
import SceneTitle from '../components/SceneTitle'

const N = G4_STOPS.length - 1 // 5
const DEG = 50 // 每档角度

/** 第4关《把时间往回拨》：左右滑动 + 惯性减速停靠 */
export default function Game4() {
  const completeLevel = useGame((s) => s.completeLevel)
  const value = useRef(0) // 0..5 连续值
  const vel = useRef(0)
  const dragging = useRef(false)
  const lastX = useRef(0)
  const lastT = useRef(0)
  const raf = useRef(0)
  const lastIdx = useRef(0)
  const [, force] = useReducer((x: number) => x + 1, 0)

  const [locked, setLocked] = useState<number | null>(null)
  const [step, setStep] = useState<'spin' | 'why' | 'answer'>('spin')

  const tickIfCross = () => {
    const ci = Math.round(clamp(value.current, 0, N))
    if (ci !== lastIdx.current) {
      lastIdx.current = ci
      sfx.tick()
    }
  }

  const lock = (i: number) => {
    setLocked(i)
    vibrate(20)
    sfx.pop()
    setTimeout(() => setStep('why'), 700)
    setTimeout(() => setStep('answer'), 4200)
    setTimeout(() => {
      sfx.moonUp()
      vibrate([30, 50, 30])
      const stop = G4_STOPS[i]
      completeLevel(
        { level: 4, choice: stop.id, label: stop.label, flash: stop.label, tags: stop.tags },
        'game5',
      )
    }, 7100)
  }

  // 惯性 + 吸附
  const startInertia = () => {
    let prevT = performance.now()
    const stepFn = (t: number) => {
      const dt = Math.min(0.05, (t - prevT) / 1000)
      prevT = t
      vel.current *= Math.pow(0.1, dt)
      value.current += vel.current * dt
      if (value.current < 0) {
        value.current = 0
        vel.current = 0
      }
      if (value.current > N) {
        value.current = N
        vel.current = 0
      }
      tickIfCross()
      if (Math.abs(vel.current) < 0.45) {
        const target = Math.round(clamp(value.current, 0, N))
        value.current += (target - value.current) * 0.22
        if (Math.abs(target - value.current) < 0.004) {
          value.current = target
          force()
          lock(target)
          return
        }
      }
      force()
      raf.current = requestAnimationFrame(stepFn)
    }
    raf.current = requestAnimationFrame(stepFn)
  }

  const onDown = (e: React.PointerEvent) => {
    if (locked !== null) return
    dragging.current = true
    cancelAnimationFrame(raf.current)
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    lastX.current = e.clientX
    lastT.current = performance.now()
    vel.current = 0
  }

  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current || locked !== null) return
    const now = performance.now()
    const dx = e.clientX - lastX.current
    const dt = Math.max(1, now - lastT.current) / 1000
    const dv = -dx * 0.006 // 左滑 → 往过去拨
    value.current = clamp(value.current + dv, -0.35, N + 0.35)
    vel.current = vel.current * 0.65 + (dv / dt) * 0.35
    lastX.current = e.clientX
    lastT.current = now
    tickIfCross()
    force()
  }

  const onUp = () => {
    if (!dragging.current) return
    dragging.current = false
    if (locked === null) startInertia()
  }

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const cur = Math.round(clamp(value.current, 0, N))
  const angle = -value.current * DEG

  return (
    <div
      className="flex h-full touch-none select-none flex-col items-center"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <SceneTitle title="第 4 问 · 把时间往回拨" hint="左右滑动，松手就会停下" />

      {/* 时间轮盘 */}
      <div className="relative mt-[16vh]">
        <svg width="310" height="310" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="138" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
          <circle cx="160" cy="160" r="106" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '160px 160px' }}>
            {Array.from({ length: 60 }).map((_, i) => {
              const major = i % 10 === 0
              return (
                <line
                  key={i}
                  x1="160"
                  y1={major ? 18 : 24}
                  x2="160"
                  y2="30"
                  stroke={major ? 'rgba(245,215,142,0.55)' : 'rgba(255,255,255,0.18)'}
                  strokeWidth={major ? 2 : 1}
                  transform={`rotate(${i * 6} 160 160)`}
                />
              )
            })}
            {G4_STOPS.map((s, i) => (
              <text
                key={s.id}
                x="160"
                y="60"
                textAnchor="middle"
                fontSize="12"
                fill={i === cur ? '#f5d78e' : 'rgba(255,255,255,0.5)'}
                transform={`rotate(${i * DEG} 160 160)`}
              >
                {s.label}
              </text>
            ))}
          </g>
          {/* 指针 */}
          <polygon points="160,10 152,26 168,26" fill="#f5d78e" />
        </svg>

        {/* 中央文字 */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={cur}
              initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="font-title text-3xl tracking-widest text-white/90"
            >
              {G4_STOPS[cur].label}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* 停下后的叙事 */}
      <div className="pointer-events-none mt-[7vh] px-10 text-center">
        {step === 'why' && (
          <motion.p
            initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9 }}
            className="font-title text-lg leading-[2.2] text-white/85"
          >
            如果真的可以回去，
            <br />
            你为什么停在这里？
          </motion.p>
        )}
        {step === 'answer' && (
          <motion.p
            initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9 }}
            className="font-title text-lg leading-[2.2] text-gold/90"
          >
            算了。有些答案自己知道就好。
          </motion.p>
        )}
      </div>

      <MoonRabbit
        className="safe-bottom absolute bottom-6 left-4 z-20"
        text={locked !== null ? '嗯，我看见了。' : '往回拨拨看。'}
      />
    </div>
  )
}
