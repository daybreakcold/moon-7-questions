import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '../store'
import { greetingFor } from '../data/content'
import { sfx } from '../audio/sfx'
import Narrative from '../components/Narrative'
import MoonRabbit from '../components/MoonRabbit'

export default function Intro() {
  const playCount = useGame((s) => s.playCount)
  const setScene = useGame((s) => s.setScene)
  const [ready, setReady] = useState(false)

  return (
    <div className="relative flex h-full flex-col items-center justify-center px-10">
      <Narrative
        lines={['今晚，月亮想问你 7 个问题。']}
        hold={0.5}
        onDone={() => setReady(true)}
        className="text-center"
        lineClassName="font-title text-[22px] leading-[2.2] tracking-wide text-white/90"
      />
      <AnimatePresence>
        {ready && (
          <motion.button
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="btn-gold mt-16"
            onClick={() => {
              sfx.unlock()
              sfx.startWind()
              sfx.pop()
              setScene('stage')
            }}
          >
            抬头看月亮
          </motion.button>
        )}
      </AnimatePresence>
      <MoonRabbit className="safe-bottom absolute bottom-8 left-5" text={greetingFor(playCount)} />
    </div>
  )
}
