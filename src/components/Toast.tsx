import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '../store'

/** 全局 Toast（搞笑反馈/点评），弹性弹出 */
export default function ToastHost() {
  const toasts = useGame((s) => s.toasts)
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[15%] z-50 flex flex-col items-center gap-2 px-6">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            className="max-w-full rounded-full bg-white/90 px-4 py-1.5 text-center text-sm text-slate-700 shadow-lg"
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
