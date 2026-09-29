import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../store'
import { computeEnding } from '../data/content'
import { sfx } from '../audio/sfx'
import Moon from '../components/Moon'

export default function Result() {
  const results = useGame((s) => s.results)
  const setScene = useGame((s) => s.setScene)
  const replay = useGame((s) => s.replay)
  const pushToast = useGame((s) => s.pushToast)

  const ending = useMemo(() => computeEnding(results), [results])
  const keep = useMemo(() => results.find((r) => r.level === 7)?.choice ?? '', [results])

  const share = async () => {
    sfx.pop()
    try {
      await navigator.clipboard.writeText(window.location.href)
      pushToast('链接已复制，去送给朋友吧。')
    } catch {
      pushToast('微信内点右上角，把月亮送给朋友。')
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center px-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex w-full max-w-[320px] flex-col items-center rounded-3xl border border-white/10 bg-white/[0.05] px-8 py-10 backdrop-blur-sm"
      >
        <Moon phase={1} size={92} halo={false} />
        <p className="mt-6 text-[12px] tracking-[0.4em] text-white/50">我的月亮</p>
        <p className="mt-3 font-title text-4xl tracking-[0.12em] text-gold">{ending.name}</p>
        <p className="mt-6 text-center font-title text-[16px] leading-[2.1] text-white/85">{ending.text}</p>
        <div className="my-6 h-px w-16 bg-white/15" />
        <p className="text-center text-[14px] leading-relaxed text-white/70">
          今年我最想留下：<span className="text-gold">「{keep}」</span>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="mt-10 flex flex-col items-center gap-4"
      >
        <button
          className="btn-gold"
          onClick={() => {
            sfx.pop()
            setScene('poster')
          }}
        >
          保存我的月亮
        </button>
        <button
          className="btn-ghost"
          onClick={() => {
            sfx.pop()
            replay()
          }}
        >
          再见一次月亮
        </button>
        <button className="btn-ghost" onClick={share}>
          把月亮送给朋友
        </button>
      </motion.div>
    </div>
  )
}
