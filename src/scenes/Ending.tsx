import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../store'
import { computeEnding } from '../data/content'
import { sfx } from '../audio/sfx'
import Moon from '../components/Moon'

/** Ending：结局名揭示（轻拍可跳过） */
export default function Ending() {
  const results = useGame((s) => s.results)
  const setScene = useGame((s) => s.setScene)
  const ending = useMemo(() => computeEnding(results), [results])

  useEffect(() => {
    sfx.chime()
    const t = setTimeout(() => setScene('result'), 3800)
    return () => clearTimeout(t)
  }, [setScene])

  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-10 px-10"
      onPointerDown={() => setScene('result')}
    >
      <Moon phase={1} size={170} />
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-[13px] tracking-[0.4em] text-white/50"
        >
          你的月亮是
        </motion.p>
        <motion.p
          initial={{ scale: 0.6, opacity: 0, filter: 'blur(10px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          transition={{ delay: 0.9, type: 'spring', stiffness: 130, damping: 15 }}
          className="mt-4 font-title text-5xl tracking-[0.12em] text-gold"
        >
          {ending.name}
        </motion.p>
        {ending.hidden && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="mt-3 text-[11px] tracking-[0.3em] text-white/40"
          >
            — 隐藏款 —
          </motion.p>
        )}
      </div>
    </div>
  )
}
