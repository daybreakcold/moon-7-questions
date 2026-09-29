import { useId } from 'react'
import { motion } from 'framer-motion'

interface Props {
  /** 0~1，月被点亮的比例（残月→满月） */
  phase: number
  size?: number
  halo?: boolean
}

/** 月亮：多层光晕 + 呼吸动画 + 月相（光从右侧漫过来） */
export default function Moon({ phase, size = 120, halo = true }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const p = Math.max(0, Math.min(1, phase))
  const r = 50
  const cx = 60
  const cy = 60
  const litW = 2 * r * p
  const litX = cx + r - litW

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {halo && (
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: -size * 0.55,
            background:
              'radial-gradient(circle, rgba(245,215,142,0.26) 0%, rgba(245,215,142,0.08) 45%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.07, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <svg viewBox="0 0 120 120" width={size} height={size}>
        <defs>
          <radialGradient id={`mb-${uid}`} cx="42%" cy="38%" r="75%">
            <stop offset="0%" stopColor="#fff9e8" />
            <stop offset="60%" stopColor="#fbeecb" />
            <stop offset="100%" stopColor="#f0d9a0" />
          </radialGradient>
          <clipPath id={`clip-${uid}`}>
            <motion.rect
              y={cy - r - 2}
              height={2 * r + 4}
              initial={false}
              animate={{ x: litX, width: Math.max(litW, 0.001) }}
              transition={{ type: 'spring', stiffness: 55, damping: 16 }}
            />
          </clipPath>
          <filter id={`soft-${uid}`}>
            <feGaussianBlur stdDeviation="1.1" />
          </filter>
        </defs>
        {/* 暗面（残月轮廓） */}
        <circle cx={cx} cy={cy} r={r} fill="rgba(205,214,238,0.16)" />
        {/* 亮面：随 phase 从右侧漫过来 */}
        <g clipPath={`url(#clip-${uid})`} filter={`url(#soft-${uid})`}>
          <circle cx={cx} cy={cy} r={r} fill={`url(#mb-${uid})`} />
          <circle cx={78} cy={46} r={7} fill="rgba(190,160,110,0.18)" />
          <circle cx={60} cy={74} r={10} fill="rgba(190,160,110,0.14)" />
          <circle cx={86} cy={72} r={5} fill="rgba(190,160,110,0.16)" />
        </g>
      </svg>
    </div>
  )
}
