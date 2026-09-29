import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../store'
import Moon from '../components/Moon'

export default function Loading() {
  const startRun = useGame((s) => s.startRun)
  const setScene = useGame((s) => s.setScene)

  useEffect(() => {
    const t = setTimeout(() => {
      startRun()
      setScene('intro')
    }, 1700)
    return () => clearTimeout(t)
  }, [startRun, setScene])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-10">
      <motion.div
        animate={{ opacity: [0.45, 1, 0.45], scale: [0.97, 1.03, 0.97] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Moon phase={0.16} size={92} />
      </motion.div>
      <p className="text-[13px] tracking-[0.5em] text-white/45">月亮正在升起</p>
    </div>
  )
}
