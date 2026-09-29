import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SceneId, useGame } from './store'
import { sfx } from './audio/sfx'
import NightSky from './components/NightSky'
import MoonHeader from './components/MoonHeader'
import ToastHost from './components/Toast'
import Loading from './scenes/Loading'
import Intro from './scenes/Intro'
import MoonStage from './scenes/MoonStage'
import Game1 from './scenes/Game1'
import Game2 from './scenes/Game2'
import Game3 from './scenes/Game3'
import Game4 from './scenes/Game4'
import Game5 from './scenes/Game5'
import Game6 from './scenes/Game6'
import Game7 from './scenes/Game7'
import Flashback from './scenes/Flashback'
import Ending from './scenes/Ending'
import Result from './scenes/Result'
import Poster from './scenes/Poster'

/** 右上角常驻月相进度的场景（stage/game7 有自己的大月亮） */
const SCENES_WITH_HEADER: SceneId[] = ['game1', 'game2', 'game3', 'game4', 'game5', 'game6']

function renderScene(scene: SceneId) {
  switch (scene) {
    case 'loading':
      return <Loading />
    case 'intro':
      return <Intro />
    case 'stage':
      return <MoonStage />
    case 'game1':
      return <Game1 />
    case 'game2':
      return <Game2 />
    case 'game3':
      return <Game3 />
    case 'game4':
      return <Game4 />
    case 'game5':
      return <Game5 />
    case 'game6':
      return <Game6 />
    case 'game7':
      return <Game7 />
    case 'flashback':
      return <Flashback />
    case 'ending':
      return <Ending />
    case 'result':
      return <Result />
    case 'poster':
      return <Poster />
  }
}

export default function App() {
  const scene = useGame((s) => s.scene)

  // 首次用户手势解锁音频
  useEffect(() => {
    const unlock = () => {
      sfx.unlock()
      sfx.startWind()
    }
    window.addEventListener('pointerdown', unlock, { once: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])

  // 禁止长按弹系统菜单 / iOS 手势缩放
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault()
    document.addEventListener('contextmenu', prevent)
    document.addEventListener('gesturestart', prevent)
    return () => {
      document.removeEventListener('contextmenu', prevent)
      document.removeEventListener('gesturestart', prevent)
    }
  }, [])

  // 风声随场景起伏（第5关/闪回安静下来）
  useEffect(() => {
    if (scene === 'game5' || scene === 'flashback') sfx.setWind(0.015)
    else sfx.setWind(0.045)
  }, [scene])

  return (
    <div className="screen mx-auto max-w-[520px] bg-night1">
      <NightSky />

      <AnimatePresence>
        {SCENES_WITH_HEADER.includes(scene) && <MoonHeader key="moon-header" />}
      </AnimatePresence>

      {/* 场景切换：旧场景随 React 同步卸载，新场景淡入。
          不要用 AnimatePresence 包裹——Game5/Game6 内的嵌套 AnimatePresence 会让
          外层 onExitComplete 永远不触发，旧场景残留在 DOM 里叠罗汉、吞触摸。 */}
      <motion.div
        key={scene}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        {renderScene(scene)}
      </motion.div>

      <ToastHost />
    </div>
  )
}
