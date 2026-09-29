import { motion } from 'framer-motion'

export default function SceneTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="pointer-events-none absolute left-6 top-0 z-10 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <motion.p
        initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="font-title text-lg tracking-[0.2em] text-white/85"
      >
        {title}
      </motion.p>
      {hint && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-1.5 text-xs text-white/40"
        >
          {hint}
        </motion.p>
      )}
    </div>
  )
}
