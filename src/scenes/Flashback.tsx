import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '../store'
import { sfx } from '../audio/sfx'
import Moon from '../components/Moon'

const LINES = [
  '月亮今晚，一共问了你 7 个问题。',
  '其实，它没有想知道正确答案。',
  '它只是想让你看看：这一年，你把什么放在了心上。',
  '月亮会缺，也会圆。人也是。',
]

/** Flashback：黑场快闪 7 个关键词 → 只剩月亮 → 逐段叙事 → 中秋快乐 */
export default function Flashback() {
  const results = useGame((s) => s.results)
  const setScene = useGame((s) => s.setScene)
  const flashes = results.map((r) => r.flash)

  const [wi, setWi] = useState(0)
  const [stage, setStage] = useState<'words' | 'lines' | 'finale'>('words')
  const [li, setLi] = useState(0)

  // 关键词快闪（约 400ms 一个）
  useEffect(() => {
    if (wi < flashes.length) {
      const t = setTimeout(() => setWi((i) => i + 1), 400)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      setStage('lines')
      sfx.chord()
    }, 700)
    return () => clearTimeout(t)
  }, [wi, flashes.length])

  // 叙事逐段（每段约 2.2s）
  useEffect(() => {
    if (stage !== 'lines') return
    if (li < LINES.length) {
      const t = setTimeout(() => setLi((i) => i + 1), 2200)
      return () => clearTimeout(t)
    }
    setStage('finale')
  }, [stage, li])

  // 中秋快乐 → 结局揭示（独立 effect，避免 setStage 重渲染清掉自己的定时器）
  useEffect(() => {
    if (stage !== 'finale') return
    const t = setTimeout(() => setScene('ending'), 3400)
    return () => clearTimeout(t)
  }, [stage, setScene])

  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#05070f] px-10">
      {/* 关键词快闪 */}
      {stage === 'words' && wi < flashes.length && (
        <AnimatePresence mode="popLayout">
          <motion.span
            key={wi}
            initial={{ scale: 0.55, opacity: 0 }}
            animate={{ scale: [0.55, 1.14, 1], opacity: 1 }}
            exit={{ scale: 1.35, opacity: 0 }}
            transition={{ duration: 0.32 }}
            className="font-title text-3xl tracking-wider text-white/90"
          >
            {flashes[wi]}
          </motion.span>
        </AnimatePresence>
      )}

      {/* 只剩月亮 + 叙事 */}
      {stage !== 'words' && (
        <>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4 }}>
            <Moon phase={1} size={150} />
          </motion.div>
          <div className="mt-14 text-center">
            {stage === 'finale' ? (
              <motion.p
                initial={{ scale: 0.6, opacity: 0, filter: 'blur(10px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                className="font-title text-4xl tracking-[0.2em] text-gold"
              >
                中秋快乐 🌕
              </motion.p>
            ) : (
              LINES.slice(0, li + 1).map((l, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.9 }}
                  className="font-title text-[17px] leading-[2.3] text-white/85"
                >
                  {l}
                </motion.p>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
