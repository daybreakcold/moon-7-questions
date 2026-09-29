import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  text?: string
  className?: string
}

/** 月兔：简约玉兔 SVG，会眨眼，带旁白气泡 */
export default function MoonRabbit({ text, className = '' }: Props) {
  return (
    <div className={`pointer-events-none ${className}`}>
      <AnimatePresence mode="wait">
        {text && (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="mb-2 ml-10 max-w-[190px] rounded-2xl rounded-bl-sm bg-white/90 px-3.5 py-2 text-[13px] leading-relaxed text-slate-700 shadow-lg"
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
      <svg width="84" height="96" viewBox="0 0 86 98">
        {/* 耳朵 */}
        <ellipse cx="31" cy="24" rx="7" ry="24" fill="#f4f6ff" transform="rotate(-8 31 24)" />
        <ellipse cx="31" cy="26" rx="3.4" ry="17" fill="#f9d9d2" opacity="0.75" transform="rotate(-8 31 26)" />
        <ellipse cx="55" cy="24" rx="7" ry="24" fill="#f4f6ff" transform="rotate(10 55 24)" />
        <ellipse cx="55" cy="26" rx="3.4" ry="17" fill="#f9d9d2" opacity="0.75" transform="rotate(10 55 26)" />
        {/* 身体 */}
        <ellipse cx="43" cy="74" rx="26" ry="22" fill="#f7f9ff" />
        {/* 头 */}
        <circle cx="43" cy="50" r="20" fill="#f9fbff" />
        {/* 眼睛（眨眼） */}
        <motion.ellipse
          cx="35"
          cy="49"
          rx="3.1"
          fill="#232a4a"
          initial={false}
          animate={{ ry: [3.4, 3.4, 0.4, 3.4, 3.4] }}
          transition={{ duration: 3.8, repeat: Infinity, times: [0, 0.86, 0.9, 0.94, 1], ease: 'easeInOut' }}
        />
        <motion.ellipse
          cx="51"
          cy="49"
          rx="3.1"
          fill="#232a4a"
          initial={false}
          animate={{ ry: [3.4, 3.4, 0.4, 3.4, 3.4] }}
          transition={{ duration: 3.8, repeat: Infinity, times: [0, 0.86, 0.9, 0.94, 1], ease: 'easeInOut' }}
        />
        {/* 腮红 & 鼻子 */}
        <circle cx="30" cy="56" r="3.4" fill="#f9c9c0" opacity="0.65" />
        <circle cx="56" cy="56" r="3.4" fill="#f9c9c0" opacity="0.65" />
        <ellipse cx="43" cy="55" rx="2" ry="1.5" fill="#e89aa0" />
        {/* 小爪子 */}
        <ellipse cx="34" cy="92" rx="6" ry="3.4" fill="#eef1fb" />
        <ellipse cx="52" cy="92" rx="6" ry="3.4" fill="#eef1fb" />
      </svg>
    </div>
  )
}
