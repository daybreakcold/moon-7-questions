import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { rand } from '../utils/helpers'

/** 深夜天空：渐变 + 多层星星 + 偶发流星 + 漂浮云层 + 地平线暖光 */
export default function NightSky() {
  const stars = useMemo(
    () =>
      Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        x: rand(0, 100),
        y: rand(0, 72),
        s: rand(1, 2.4),
        d: rand(2.2, 5),
        dl: rand(0, 5),
      })),
    [],
  )
  const meteors = useMemo(
    () =>
      Array.from({ length: 2 }).map((_, i) => ({
        id: i,
        top: rand(6, 26),
        left: rand(55, 90),
        d: rand(9, 14),
        dl: rand(3, 10) + i * 5,
      })),
    [],
  )

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg,#0b1026 0%,#1b2340 58%,#2a2f55 100%)' }}
      />
      {/* 地平线暖橙辉光 */}
      <div
        className="absolute inset-x-0 bottom-0 h-56"
        style={{
          background: 'radial-gradient(120% 90% at 50% 108%, rgba(244,165,96,0.16) 0%, transparent 60%)',
        }}
      />
      {stars.map((s) => (
        <span
          key={s.id}
          className="twinkle rounded-full bg-white"
          style={
            {
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.s,
              height: s.s,
              '--d': `${s.d}s`,
              '--dl': `${s.dl}s`,
            } as React.CSSProperties
          }
        />
      ))}
      {meteors.map((m) => (
        <span
          key={m.id}
          className="meteor"
          style={
            {
              top: `${m.top}%`,
              left: `${m.left}%`,
              '--d': `${m.d}s`,
              '--dl': `${m.dl}s`,
            } as React.CSSProperties
          }
        />
      ))}
      <motion.div
        className="cloud"
        style={{ top: '13%', width: 220, height: 56 }}
        animate={{ x: ['-32vw', '112vw'] }}
        transition={{ duration: 95, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="cloud"
        style={{ top: '30%', width: 180, height: 44, opacity: 0.6 }}
        animate={{ x: ['112vw', '-42vw'] }}
        transition={{ duration: 125, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="cloud"
        style={{ top: '54%', width: 260, height: 60, opacity: 0.45 }}
        animate={{ x: ['-42vw', '112vw'] }}
        transition={{ duration: 150, repeat: Infinity, ease: 'linear', delay: 12 }}
      />
    </div>
  )
}
