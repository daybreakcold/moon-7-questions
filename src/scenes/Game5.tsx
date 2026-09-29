import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, PanInfo } from 'framer-motion'
import { useGame } from '../store'
import { G5_MESSAGES, G5_SENDER } from '../data/content'
import { sfx } from '../audio/sfx'
import { IS_DEBUG, vibrate } from '../utils/helpers'
import MoonRabbit from '../components/MoonRabbit'
import SceneTitle from '../components/SceneTitle'

/** 第5关《删掉一句话》：长按出现「删除？」→ 左滑删除 → 删除失败 */
const PRESS_MS = IS_DEBUG ? 0 : 400
export default function Game5() {
  const completeLevel = useGame((s) => s.completeLevel)
  const pushToast = useGame((s) => s.pushToast)

  const [visibleCount, setVisibleCount] = useState(0)
  const [armId, setArmId] = useState<number | null>(null)
  const [deletedIdx, setDeletedIdx] = useState<number | null>(null)
  const [restored, setRestored] = useState(false)
  const [showNarrative, setShowNarrative] = useState(false)
  const pressTimer = useRef(0)
  const done = useRef(false)

  // 消息逐条浮现
  useEffect(() => {
    if (visibleCount >= G5_MESSAGES.length) return
    const t = setTimeout(() => setVisibleCount((c) => c + 1), visibleCount === 0 ? 500 : 720)
    return () => clearTimeout(t)
  }, [visibleCount])

  const onMsgDown = (i: number) => {
    if (done.current) return
    window.clearTimeout(pressTimer.current)
    if (IS_DEBUG) {
      setArmId(i)
      return
    }
    pressTimer.current = window.setTimeout(() => {
      setArmId(i)
      vibrate(15)
      sfx.pop()
    }, PRESS_MS)
  }

  const doDelete = (i: number, info: PanInfo) => {
    if (done.current || armId !== i || info.offset.x > -70) return
    done.current = true
    setArmId(null)
    setDeletedIdx(i)
    sfx.deleteWhoosh()
    vibrate(20)
    sfx.setWind(0.012)

    // 2 秒后消息重新浮现 → 删除失败 → 叙事
    setTimeout(() => {
      setRestored(true)
      pushToast('删除失败。')
      sfx.failBuzz()
    }, 2000)
    setTimeout(() => setShowNarrative(true), 2900)
    setTimeout(() => {
      sfx.moonUp()
      vibrate([30, 50, 30])
      const msg = G5_MESSAGES[i]
      completeLevel(
        { level: 5, choice: msg, label: `“${msg}”`, flash: msg, tags: ['family', 'warm'], detail: { deleted: msg } },
        'game6',
      )
    }, 6800)
  }

  return (
    <div className="h-full touch-none select-none" onPointerDown={() => armId === null && window.clearTimeout(pressTimer.current)}>
      <SceneTitle title="第 5 问 · 删掉一句话" hint="长按一条消息，试着删掉它" />

      {/* 聊天记录 */}
      <div className="mx-auto flex w-full max-w-[330px] flex-col gap-3 px-6 pt-[calc(env(safe-area-inset-top)+6rem)]">
        <p className="mb-1 text-center text-[11px] text-white/35">{G5_SENDER}</p>
        {G5_MESSAGES.slice(0, visibleCount).map((m, i) => {
          const hidden = deletedIdx === i && !restored
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: hidden ? 0 : 1, y: 0, x: hidden ? -90 : 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="relative self-start"
            >
              <AnimatePresence>
                {armId === i && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-2.5 right-2 z-10 rounded-full bg-red-400/90 px-2 py-0.5 text-[10px] text-white"
                  >
                    删除？
                  </motion.span>
                )}
              </AnimatePresence>
              <motion.div
                drag={armId === i ? 'x' : false}
                dragConstraints={{ left: -140, right: 0 }}
                dragElastic={0.08}
                onDragEnd={(_, info) => doDelete(i, info)}
                onPointerDown={() => onMsgDown(i)}
                onPointerUp={() => window.clearTimeout(pressTimer.current)}
                onPointerCancel={() => window.clearTimeout(pressTimer.current)}
                className="touch-none rounded-2xl rounded-tl-sm bg-[#2b3560] px-4 py-2.5 text-[15px] text-white/90 shadow-md"
              >
                {m}
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {/* 叙事文案 */}
      <AnimatePresence>
        {showNarrative && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-x-0 bottom-[15%] px-10 text-center"
          >
            {['有些话，当时觉得很普通。', '后来才发现，有人愿意一直问，也挺难得。'].map((l, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.2 + i * 1.3, duration: 0.9 }}
                className="font-title text-[17px] leading-[2.2] text-white/85"
              >
                {l}
              </motion.p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <MoonRabbit
        className="safe-bottom absolute bottom-6 left-4 z-20"
        text={done.current ? '删不掉的。' : '长按试试。'}
      />
    </div>
  )
}
