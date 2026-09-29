import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, PanInfo } from 'framer-motion'
import { useGame } from '../store'
import { G3Chip } from '../data/content'
import { sfx } from '../audio/sfx'
import { rand, vibrate } from '../utils/helpers'
import MoonRabbit from '../components/MoonRabbit'
import SceneTitle from '../components/SceneTitle'

interface Chip extends G3Chip {
  x: number
  y: number
  rot: number
  fdur: number
  fdl: number
}

/** 第3关《扔掉三个》：拖拽词条进垃圾桶，只能扔 3 个（笑点担当） */
export default function Game3() {
  const run = useGame((s) => s.run)
  const completeLevel = useGame((s) => s.completeLevel)
  const pushToast = useGame((s) => s.pushToast)

  const chips = useMemo<Chip[]>(
    () =>
      run.g3.map((c) => ({
        ...c,
        x: rand(4, 62),
        y: rand(13, 55),
        rot: rand(-8, 8),
        fdur: rand(2.6, 4.4),
        fdl: rand(0, 2),
      })),
    [run.g3],
  )

  const [thrown, setThrown] = useState<Chip[]>([])
  const [goneIds, setGoneIds] = useState<string[]>([])
  const [binOpen, setBinOpen] = useState(false)
  const binRef = useRef<HTMLDivElement>(null)
  const done = useRef(false)

  const overBin = (p: { x: number; y: number }): boolean => {
    const r = binRef.current?.getBoundingClientRect()
    if (!r) return false
    return p.x > r.left - 34 && p.x < r.right + 34 && p.y > r.top - 60 && p.y < r.bottom + 30
  }

  const onDrag = (_: unknown, info: PanInfo) => {
    const open = overBin(info.point)
    setBinOpen((prev) => (prev === open ? prev : open))
  }

  const throwChip = (chip: Chip) => {
    if (done.current) return
    const next = [...thrown, chip]
    setThrown(next)
    sfx.trash()
    vibrate(15)
    pushToast(chip.fb)
    if (chip.fb2) setTimeout(() => pushToast(chip.fb2!), 1100)
    if (chip.fail) {
      // 删除失败：弹回原位（计数照常 +1）
      setTimeout(() => sfx.failBuzz(), 180)
    } else {
      setGoneIds((prev) => [...prev, chip.id])
    }
    if (next.length >= 3) {
      done.current = true
      setTimeout(() => {
        sfx.moonUp()
        vibrate([30, 50, 30])
        completeLevel(
          {
            level: 3,
            choice: next.map((c) => c.id).join(','),
            label: next.map((c) => c.text).join('、'),
            flash: next[0].text,
            tags: next.flatMap((c) => c.tags),
            detail: { thrown: next.map((c) => c.id), cats: next.map((c) => c.cat) },
          },
          'game4',
        )
      }, 1700)
    }
  }

  return (
    <div className="h-full touch-none select-none">
      <SceneTitle title="第 3 问 · 扔掉三个" hint="抓住烦恼，拖进垃圾桶" />

      {/* 计数 */}
      <div className="safe-top absolute left-6 top-[72px] z-10 text-xs text-white/40">
        已扔 {Math.min(thrown.length, 3)} / 3
      </div>

      {/* 漂浮的烦恼词条 */}
      <AnimatePresence>
        {chips
          .filter((c) => !goneIds.includes(c.id))
          .map((c) => (
            <motion.div
              key={c.id}
              className="absolute z-10"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
              drag={!done.current}
              dragMomentum={false}
              dragSnapToOrigin
              whileDrag={{ scale: 1.12, zIndex: 40 }}
              onDrag={onDrag}
              onDragEnd={(_, info) => {
                setBinOpen(false)
                if (overBin(info.point)) throwChip(c)
              }}
              exit={{ scale: 0.1, opacity: 0, y: 220, transition: { duration: 0.4 } }}
            >
              <div
                className="floaty rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/85 backdrop-blur-sm"
                style={{ '--d': `${c.fdur}s`, '--dl': `${c.fdl}s`, '--r': `${c.rot}deg` } as React.CSSProperties}
              >
                {c.text}
              </div>
            </motion.div>
          ))}
      </AnimatePresence>

      {/* 垃圾桶（张嘴动画） */}
      <div ref={binRef} className="safe-bottom absolute bottom-16 left-1/2 z-10 -translate-x-1/2">
        <motion.div animate={{ scale: binOpen ? 1.12 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
          <svg width="92" height="104" viewBox="0 0 92 104">
            {/* 盖子 */}
            <motion.g
              initial={false}
              animate={{ rotate: binOpen ? -26 : 0 }}
              style={{ transformOrigin: '20px 26px' }}
              transition={{ type: 'spring', stiffness: 300, damping: 16 }}
            >
              <rect x="12" y="20" width="68" height="9" rx="4.5" fill="#3a467a" />
              <rect x="38" y="12" width="16" height="8" rx="4" fill="#3a467a" />
            </motion.g>
            {/* 桶身 */}
            <path
              d="M18 34 L26 100 L66 100 L74 34 Z"
              fill={binOpen ? '#35427a' : '#2b3560'}
              stroke={binOpen ? 'rgba(245,215,142,0.7)' : 'rgba(255,255,255,0.2)'}
              strokeWidth="1.5"
            />
            {/* 眼睛 */}
            <circle cx="38" cy="58" r="3.2" fill="#cdd6f4" />
            <circle cx="54" cy="58" r="3.2" fill="#cdd6f4" />
            {/* 嘴（张嘴） */}
            <motion.ellipse
              cx="46"
              cy="74"
              rx="7"
              initial={false}
              animate={{ ry: binOpen ? 8 : 2.4 }}
              transition={{ type: 'spring', stiffness: 320, damping: 15 }}
              fill="#161d3f"
            />
          </svg>
        </motion.div>
      </div>

      <MoonRabbit
        className="safe-bottom absolute bottom-5 left-4 z-20"
        text={done.current ? '扔掉的不算数，放下的才算。' : '挑三个，扔进来。'}
      />
    </div>
  )
}
