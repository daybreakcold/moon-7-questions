import { motion } from 'framer-motion'

/** 角落月相点阵：● ○ ○ ○ ○ ○ ○ */
export default function ProgressDots({ progress }: { progress: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: 7 }).map((_, i) => (
        <motion.span
          key={i}
          className="text-[9px] leading-none"
          initial={false}
          animate={{
            color: i < progress ? '#f5d78e' : 'rgba(255,255,255,0.28)',
            textShadow: i < progress ? '0 0 8px rgba(245,215,142,0.8)' : '0 0 0 rgba(0,0,0,0)',
            scale: i < progress ? 1.25 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        >
          ●
        </motion.span>
      ))}
    </div>
  )
}
