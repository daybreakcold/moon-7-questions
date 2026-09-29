import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Props {
  lines: string[]
  /** 每行间隔秒 */
  stagger?: number
  /** 最后一行出现后再停顿秒数，然后 onDone */
  hold?: number
  className?: string
  lineClassName?: string
  onDone?: () => void
}

/** 叙事文案：逐行 Blur In / Fade In + 轻微上移 */
export default function Narrative({
  lines,
  stagger = 1.1,
  hold = 1.4,
  className = '',
  lineClassName = '',
  onDone,
}: Props) {
  const done = useRef(false)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (done.current) return
    const ms = (lines.length - 1) * stagger * 1000 + 900 + hold * 1000
    const t = setTimeout(() => {
      if (done.current) return
      done.current = true
      onDoneRef.current?.()
    }, ms)
    return () => clearTimeout(t)
  }, [lines, stagger, hold])

  return (
    <div className={className}>
      {lines.map((l, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.35 + i * stagger, duration: 0.9, ease: 'easeOut' }}
          className={lineClassName}
        >
          {l}
        </motion.p>
      ))}
    </div>
  )
}
