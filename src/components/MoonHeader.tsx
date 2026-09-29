import { motion } from 'framer-motion'
import { useGame } from '../store'
import Moon from './Moon'
import ProgressDots from './ProgressDots'

/** 常驻右上角的小月亮（月相进度）+ 月相点阵 */
export default function MoonHeader() {
  const progress = useGame((s) => s.results.length)
  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      className="pointer-events-none absolute right-4 top-0 z-20 flex flex-col items-center gap-1.5 pt-[calc(env(safe-area-inset-top)+1rem)]"
    >
      <Moon phase={progress / 7} size={46} halo={false} />
      <ProgressDots progress={progress} />
    </motion.div>
  )
}
