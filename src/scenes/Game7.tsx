import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, PanInfo } from 'framer-motion'
import { useGame } from '../store'
import { G7_PLACEHOLDERS, g7Tags } from '../data/content'
import { sfx } from '../audio/sfx'
import { vibrate } from '../utils/helpers'
import Moon from '../components/Moon'
import MoonRabbit from '../components/MoonRabbit'
import SceneTitle from '../components/SceneTitle'

/** 第7关《留一样东西到明年》：输入 → 文字变成月亮碎片 → 向上推给月亮 */
export default function Game7() {
  const completeLevel = useGame((s) => s.completeLevel)
  const pushToast = useGame((s) => s.pushToast)

  const [text, setText] = useState('')
  const [phIdx, setPhIdx] = useState(0)
  const [frag, setFrag] = useState<string | null>(null)
  const [launched, setLaunched] = useState(false)
  const [target, setTarget] = useState({ x: 0, y: 0 })
  const [full, setFull] = useState(false)
  const [flash, setFlash] = useState(false)

  const moonRef = useRef<HTMLDivElement>(null)
  const fragRef = useRef<HTMLDivElement>(null)
  const homeRect = useRef<DOMRect | null>(null)
  const done = useRef(false)

  // placeholder 轮换
  useEffect(() => {
    const t = setInterval(() => setPhIdx((i) => (i + 1) % G7_PLACEHOLDERS.length), 2600)
    return () => clearInterval(t)
  }, [])

  // 记录碎片初始位置（拖拽前）
  useLayoutEffect(() => {
    if (frag && fragRef.current && !homeRect.current) {
      homeRect.current = fragRef.current.getBoundingClientRect()
    }
  }, [frag])

  const submit = () => {
    const v = text.trim()
    if (!v) {
      pushToast('写点什么，一个字也行。')
      return
    }
    setFrag(v)
    sfx.chime()
    vibrate(15)
  }

  const onFragDragEnd = (_: unknown, info: PanInfo) => {
    if (launched || done.current) return
    if (info.offset.y < -110 || info.velocity.y < -500) {
      // 向上甩出 → 飞向月亮缺口
      const m = moonRef.current?.getBoundingClientRect()
      const h = homeRect.current
      if (!m || !h) return
      setLaunched(true)
      setTarget({
        x: m.left + m.width / 2 - (h.left + h.width / 2),
        y: m.top + m.height / 2 - (h.top + h.height / 2),
      })
      sfx.whoosh()
    }
  }

  const onArrive = () => {
    if (!launched || done.current) return
    done.current = true
    setFull(true)
    setFlash(true)
    vibrate([30, 50, 30])
    sfx.chord()
    setTimeout(() => setFlash(false), 1200)
    setTimeout(() => {
      const v = frag!
      completeLevel(
        { level: 7, choice: v, label: `「${v}」`, flash: v, tags: g7Tags(v) },
        'flashback',
      )
    }, 1600)
  }

  return (
    <div className="flex h-full touch-none select-none flex-col items-center">
      <SceneTitle title="第 7 问 · 留一样东西到明年" />

      {/* 6/7 → 7/7 的大月亮 */}
      <div ref={moonRef} className="mt-[9vh]">
        <Moon phase={full ? 1 : 6 / 7} size={150} />
      </div>

      {/* 输入阶段 */}
      {!frag && (
        <div className="mt-[9vh] flex w-full flex-col items-center px-10">
          <motion.p
            initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9 }}
            className="text-center font-title text-xl leading-[2.2] text-white/90"
          >
            今年，你最想把什么留到明年？
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-10 flex flex-col items-center"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 8))}
              maxLength={8}
              placeholder={G7_PLACEHOLDERS[phIdx]}
              className="w-56 border-b border-white/30 bg-transparent pb-2 text-center font-title text-xl tracking-[0.2em] text-gold outline-none placeholder:text-white/25"
            />
            <p className="mt-2 text-[11px] text-white/35">{text.length} / 8</p>
            <button
              className="btn-gold mt-9"
              style={{ opacity: text.trim() ? 1 : 0.35 }}
              onClick={submit}
            >
              留下来
            </button>
          </motion.div>
        </div>
      )}

      {/* 碎片阶段：推给月亮 */}
      {frag && (
        <div className="mt-[10vh] flex flex-col items-center">
          {!launched && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-8 text-xs tracking-[0.3em] text-white/45"
            >
              按住它，推给月亮
            </motion.p>
          )}
          <motion.div
            ref={fragRef}
            drag={!launched}
            dragMomentum={false}
            dragSnapToOrigin={!launched}
            whileDrag={{ scale: 1.12 }}
            onDragEnd={onFragDragEnd}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={
              launched
                ? { x: target.x, y: target.y, scale: 0.25, opacity: [1, 1, 0] }
                : { scale: 1, opacity: 1 }
            }
            transition={
              launched
                ? { duration: 0.85, ease: 'easeIn', opacity: { duration: 0.85, times: [0, 0.75, 1] } }
                : { type: 'spring', stiffness: 220, damping: 15 }
            }
            onAnimationComplete={launched ? onArrive : undefined}
            className="touch-none rounded-full px-6 py-3.5 font-title text-xl tracking-[0.15em] text-[#4a3a12]"
            style={{
              background: 'radial-gradient(circle at 35% 30%, #fff6dc, #f5d78e)',
              boxShadow: '0 0 34px rgba(245,215,142,0.75), 0 0 80px rgba(245,215,142,0.35)',
            }}
          >
            {frag}
          </motion.div>
        </div>
      )}

      {/* 拼合光爆 */}
      <AnimatePresence>
        {flash && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-40"
            style={{
              background: 'radial-gradient(circle at 50% 22%, rgba(255,246,220,0.95) 0%, rgba(245,215,142,0.5) 30%, transparent 65%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      <MoonRabbit
        className="safe-bottom absolute bottom-6 left-4 z-20"
        text={full ? '圆了。' : frag ? '送它上去。' : '最后一个问题。'}
      />
    </div>
  )
}
