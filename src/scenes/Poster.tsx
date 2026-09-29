import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../store'
import { computeEnding } from '../data/content'
import { drawPoster } from '../utils/poster'
import { sfx } from '../audio/sfx'

/** SharePoster：离屏 Canvas 生成 750×1200 海报，长按保存 / 下载 */
export default function Poster() {
  const results = useGame((s) => s.results)
  const setScene = useGame((s) => s.setScene)
  const ending = useMemo(() => computeEnding(results), [results])
  const keep = useMemo(() => results.find((r) => r.level === 7)?.choice ?? '', [results])
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setUrl(drawPoster({ name: ending.name, text: ending.text, keep }))
    }, 60)
    return () => clearTimeout(t)
  }, [ending, keep])

  return (
    <div className="flex h-full flex-col items-center justify-center px-8">
      {url ? (
        <motion.img
          src={url}
          alt="我的月亮"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 18 }}
          className="max-h-[58vh] rounded-2xl border border-white/10 shadow-2xl"
        />
      ) : (
        <p className="text-sm text-white/50">正在画你的月亮……</p>
      )}
      <p className="mt-5 text-xs tracking-[0.2em] text-white/50">长按图片保存到相册</p>
      <div className="mt-6 flex items-center gap-4">
        {url && (
          <a href={url} download="我的月亮-2026中秋.png" className="btn-gold !px-6 !py-2.5 text-[13px]">
            下载图片
          </a>
        )}
        <button
          className="btn-ghost !px-6 !py-2.5 text-[13px]"
          onClick={() => {
            sfx.pop()
            setScene('result')
          }}
        >
          返回
        </button>
      </div>
    </div>
  )
}
