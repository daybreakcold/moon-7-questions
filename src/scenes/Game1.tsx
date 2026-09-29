import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '../store'
import { G1Item } from '../data/content'
import { sfx } from '../audio/sfx'
import { IS_DEBUG, rand, vibrate } from '../utils/helpers'
import MoonRabbit from '../components/MoonRabbit'
import SceneTitle from '../components/SceneTitle'

interface Falling {
  uid: number
  item: G1Item
  x: number
  drift: number
  dur: number
  size: number
}

/** 测试专用：?debug 时掉落大幅减速且不漂移（默认关闭，不影响正式玩法） */
const DEBUG_SLOW = IS_DEBUG

/** 第1关《接住一个》：点击/接住 */
export default function Game1() {
  const run = useGame((s) => s.run)
  const completeLevel = useGame((s) => s.completeLevel)
  const [items, setItems] = useState<Falling[]>([])
  const [caught, setCaught] = useState<G1Item | null>(null)
  const uid = useRef(0)
  const done = useRef(false)

  // 持续生成掉落物，接住后停止（无限循环，防止玩家不接时卡关）
  useEffect(() => {
    if (caught) return
    let timer = 0
    const spawn = () => {
      const item = run.g1[Math.floor(Math.random() * run.g1.length)]
      setItems((prev) => [
        ...prev.slice(-16),
        {
          uid: ++uid.current,
          item,
          x: rand(6, 84),
          drift: DEBUG_SLOW ? 0 : rand(-48, 48),
          dur: DEBUG_SLOW ? 80 : rand(6, 9.5),
          size: rand(34, 46),
        },
      ])
      timer = window.setTimeout(spawn, rand(550, 950))
    }
    timer = window.setTimeout(spawn, 450)
    return () => clearTimeout(timer)
  }, [caught, run.g1])

  const catchItem = (f: Falling) => {
    if (caught || done.current) return
    setCaught(f.item)
    setItems((prev) => prev.filter((x) => x.uid !== f.uid))
    sfx.blip()
    vibrate(25)
  }

  // 接住后：点评停留 → 月光+1 → 下一关
  useEffect(() => {
    if (!caught || done.current) return
    done.current = true
    const t = setTimeout(() => {
      sfx.moonUp()
      vibrate([30, 50, 30])
      completeLevel(
        { level: 1, choice: caught.id, label: `${caught.emoji} ${caught.label}`, flash: caught.emoji, tags: caught.tags },
        'game2',
      )
    }, 2500)
    return () => clearTimeout(t)
  }, [caught, completeLevel])

  return (
    <div className="h-full touch-none">
      <SceneTitle title="第 1 问 · 接住一个" hint="它们只会落一次" />

      {/* 掉落物 */}
      {items.map((f) => (
        <motion.div
          key={f.uid}
          className="absolute top-0"
          style={{ left: `${f.x}%` }}
          initial={{ y: '-14vh' }}
          animate={{ y: '114vh' }}
          transition={{ duration: f.dur, ease: 'linear' }}
          onAnimationComplete={() => setItems((prev) => prev.filter((x) => x.uid !== f.uid))}
        >
          <motion.div
            animate={{ x: [0, f.drift, 0, -f.drift, 0] }}
            transition={{ duration: f.dur, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.75, 1] }}
          >
            <button
              className="touch-none select-none p-3.5"
              style={{ fontSize: f.size, WebkitTapHighlightColor: 'transparent' }}
              onPointerDown={() => catchItem(f)}
            >
              {f.item.emoji}
            </button>
          </motion.div>
        </motion.div>
      ))}

      {/* 被接住的物品：放大发光停在手中 */}
      <AnimatePresence>
        {caught && (
          <motion.div
            className="absolute bottom-[19%] left-1/2 z-30 -translate-x-1/2"
            initial={{ scale: 0.4, opacity: 0, y: -60 }}
            animate={{ scale: 1.5, opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 13 }}
          >
            <div
              className="text-center"
              style={{ fontSize: 58, filter: 'drop-shadow(0 0 20px rgba(245,215,142,0.9))' }}
            >
              {caught.emoji}
            </div>
            <div className="-mt-1 text-center text-3xl">🤲</div>
          </motion.div>
        )}
      </AnimatePresence>

      <MoonRabbit
        className="safe-bottom absolute bottom-6 left-4 z-20"
        text={caught ? caught.comment : '随便接一个，别贪心。'}
      />
    </div>
  )
}
