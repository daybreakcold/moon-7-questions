import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../store'
import Moon from '../components/Moon'
import Narrative from '../components/Narrative'

/** 主舞台：大月亮 + 开场提示，轻拍可跳过 */
export default function MoonStage() {
  const setScene = useGame((s) => s.setScene)
  const progress = useGame((s) => s.results.length)

  useEffect(() => {
    const t = setTimeout(() => setScene('game1'), 4600)
    return () => clearTimeout(t)
  }, [setScene])

  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-14 px-10"
      onPointerDown={() => setScene('game1')}
    >
      <motion.div
        initial={{ scale: 0.65, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
      >
        <Moon phase={progress / 7} size={168} />
      </motion.div>
      <Narrative
        lines={['答错也没关系。', '月亮不打分。']}
        stagger={1.3}
        className="text-center"
        lineClassName="font-title text-xl leading-[2.3] tracking-wide text-white/85"
      />
    </div>
  )
}
