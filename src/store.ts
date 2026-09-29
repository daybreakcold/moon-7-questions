import { create } from 'zustand'
import { buildRunQuestions, LevelResult, RunQuestions } from './data/content'

export type { LevelResult }

export type SceneId =
  | 'loading'
  | 'intro'
  | 'stage'
  | 'game1'
  | 'game2'
  | 'game3'
  | 'game4'
  | 'game5'
  | 'game6'
  | 'game7'
  | 'flashback'
  | 'ending'
  | 'result'
  | 'poster'

export interface ToastMsg {
  id: number
  text: string
}

const LS_KEY = 'moon7.playCount'

function readCount(): number {
  try {
    return parseInt(localStorage.getItem(LS_KEY) ?? '0', 10) || 0
  } catch {
    return 0
  }
}

function writeCount(n: number): void {
  try {
    localStorage.setItem(LS_KEY, String(n))
  } catch {
    /* 无痕模式静默降级 */
  }
}

interface GameState {
  scene: SceneId
  /** 7 关的结构化选择结果（顺序即关卡顺序） */
  results: LevelResult[]
  /** 游玩次数（localStorage 持久化） */
  playCount: number
  /** 本局随机抽取的题库 */
  run: RunQuestions
  toasts: ToastMsg[]
  setScene: (s: SceneId) => void
  startRun: () => void
  completeLevel: (r: LevelResult, next: SceneId) => void
  pushToast: (text: string) => void
  replay: () => void
}

let toastId = 0

export const useGame = create<GameState>((set, get) => ({
  scene: 'loading',
  results: [],
  playCount: readCount(),
  run: buildRunQuestions(),
  toasts: [],

  setScene: (s) => set({ scene: s }),

  startRun: () => {
    const c = get().playCount + 1
    writeCount(c)
    set({ playCount: c, results: [], run: buildRunQuestions() })
  },

  completeLevel: (r, next) => {
    if (get().results.some((x) => x.level === r.level)) return
    set({ results: [...get().results, r], scene: next })
  },

  pushToast: (text) => {
    const id = ++toastId
    set({ toasts: [...get().toasts, { id, text }] })
    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) })
    }, 2400)
  },

  replay: () => {
    get().startRun()
    set({ scene: 'intro' })
  },
}))
