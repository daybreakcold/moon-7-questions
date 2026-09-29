import { shuffle } from '../utils/helpers'

/* ---------- 结构化结果 ---------- */

export interface LevelResult {
  level: number
  choice: string
  label: string
  /** flashback 快闪关键词 */
  flash: string
  tags: string[]
  detail?: unknown
}

export interface G6Pick {
  qid: string
  side: 'left' | 'right' | 'timeout'
  label: string
  tags: string[]
}

/* ---------- 第1关《接住一个》 ---------- */

export interface G1Item {
  id: string
  emoji: string
  label: string
  comment: string
  tags: string[]
}

const G1_BASE: G1Item[] = [
  { id: 'money', emoji: '💰', label: '钱', comment: '嗯，很诚实。', tags: ['money'] },
  { id: 'love', emoji: '❤️', label: '爱', comment: '哟。', tags: ['love'] },
  { id: 'fly', emoji: '✈️', label: '远方', comment: '最近很想出去？', tags: ['freedom'] },
  { id: 'home', emoji: '🏠', label: '家', comment: '想家了？', tags: ['family'] },
  { id: 'phone', emoji: '📱', label: '手机', comment: '……放下它试试？', tags: ['alone'] },
  { id: 'mooncake', emoji: '🥮', label: '月饼', comment: '饿了？', tags: ['warm'] },
]

const G1_ALT: G1Item[] = [
  { id: 'cat', emoji: '🐱', label: '猫', comment: '它也想看月亮。', tags: ['warm', 'alone'] },
  { id: 'book', emoji: '📚', label: '书', comment: '这个习惯不错。', tags: ['self'] },
  { id: 'headphone', emoji: '🎧', label: '耳机', comment: '世界吵到你了吗？', tags: ['alone'] },
]

/* ---------- 第2关《船还能坐一个》 ---------- */

export interface G2Char {
  id: string
  emoji: string
  label: string
  comment: string
  tags: string[]
}

export const G2_CHARS: G2Char[] = [
  { id: 'family', emoji: '👪', label: '家人', comment: '船有点晃，但值了。', tags: ['family'] },
  { id: 'lover', emoji: '💑', label: '爱人', comment: '坐稳了，月亮在前面。', tags: ['love'] },
  { id: 'friend', emoji: '🧑‍🤝‍🧑', label: '朋友', comment: '这船认人。', tags: ['warm'] },
  { id: 'pet', emoji: '🐈', label: '宠物', comment: '它早就想上船了。', tags: ['warm', 'alone'] },
  { id: 'self', emoji: '🪞', label: '自己', comment: '带上自己，也算数。', tags: ['alone', 'self'] },
  { id: 'stranger', emoji: '🌫️', label: '一个模糊的人', comment: '有些人看不清，也放不下。', tags: ['past'] },
]

/* ---------- 第3关《扔掉三个》 ---------- */

export interface G3Chip {
  id: string
  text: string
  fb: string
  fb2?: string
  /** 删除失败 → 弹回原位（计数照常） */
  fail?: boolean
  cat: 'work' | 'relation' | 'self' | 'money'
  tags: string[]
}

const G3_BASE: G3Chip[] = [
  { id: 'overtime', text: '加班', fb: '已删除，明天自动重装。', cat: 'work', tags: ['freedom'] },
  { id: 'kpi', text: 'KPI', fb: '已删除，明天自动重装。', cat: 'work', tags: ['freedom'] },
  { id: 'ex', text: '前任', fb: '删除成功。', fb2: '正在从回收站恢复……', cat: 'relation', tags: ['past'] },
  { id: 'weight', text: '体重', fb: '删除失败：文件过大。', fail: true, cat: 'self', tags: ['self'] },
  { id: 'anxiety', text: '焦虑', fb: '删除失败：它会自己长回来。', fail: true, cat: 'self', tags: ['self'] },
  { id: 'mortgage', text: '房贷', fb: '删除失败：权限不足。', fail: true, cat: 'money', tags: ['money'] },
  { id: 'boss', text: '老板：简单改一下', fb: '对方已开启消息免打扰。', cat: 'work', tags: ['freedom'] },
  { id: 'client', text: '甲方：感觉差一点', fb: '对方已开启消息免打扰。', cat: 'work', tags: ['freedom'] },
  { id: 'insomnia', text: '失眠', fb: '删除失败：今晚再试。', fail: true, cat: 'self', tags: ['self'] },
  { id: 'age', text: '年龄', fb: '删除失败：时间不支持此操作。', fail: true, cat: 'self', tags: ['self'] },
  { id: 'unread', text: '未读消息99+', fb: '已删除。红点明天见。', cat: 'relation', tags: ['alone'] },
]

const G3_ALT: G3Chip[] = [
  { id: 'blinddate', text: '相亲', fb: '已删除。介绍人还会再来。', cat: 'relation', tags: ['love'] },
  { id: 'huabei', text: '花呗', fb: '删除失败：权限不足。', fail: true, cat: 'money', tags: ['money'] },
  { id: 'monday', text: '周一', fb: '已删除，七天后自动重装。', cat: 'work', tags: ['freedom'] },
]

/* ---------- 第4关《把时间往回拨》 ---------- */

export interface G4Stop {
  id: string
  label: string
  tags: string[]
}

export const G4_STOPS: G4Stop[] = [
  { id: 'today', label: '今天', tags: ['clear'] },
  { id: 'm1', label: '1个月前', tags: ['past'] },
  { id: 'm3', label: '3个月前', tags: ['past'] },
  { id: 'half', label: '半年前', tags: ['past', 'past'] },
  { id: 'winter', label: '去年冬天', tags: ['past', 'past'] },
  { id: 'lastMid', label: '去年中秋', tags: ['past', 'family'] },
]

/* ---------- 第5关《删掉一句话》 ---------- */

export const G5_SENDER = '妈妈'
export const G5_MESSAGES: string[] = [
  '到了吗？',
  '记得吃饭。',
  '什么时候回来？',
  '最近怎么样？',
  '别太累。',
  '早点睡。',
  '有空回来看看。',
  '我挺好的。',
]

/* ---------- 第6关《别想，快选》 ---------- */

export interface G6Q {
  id: string
  left: string
  right: string
  ltags: string[]
  rtags: string[]
}

const G6_POOL: G6Q[] = [
  { id: 'q1', left: '中秋放假7天', right: '到账5000', ltags: ['freedom'], rtags: ['money'] },
  { id: 'q2', left: '现在暴富', right: '回到18岁', ltags: ['money'], rtags: ['youth', 'past'] },
  { id: 'q3', left: '一个人自由', right: '有人一直等你', ltags: ['alone', 'freedom'], rtags: ['love', 'warm'] },
  { id: 'q4', left: '喜欢的人', right: '1000万', ltags: ['love'], rtags: ['money'] },
  { id: 'q5', left: '熬夜自由', right: '倒头就睡', ltags: ['alone'], rtags: ['relaxed'] },
  { id: 'q6', left: '诗和远方', right: '热饭热汤', ltags: ['freedom', 'romantic'], rtags: ['warm'] },
]

/* ---------- 第7关《留一样东西到明年》 ---------- */

export const G7_PLACEHOLDERS = ['家人平安', '现在的自己', '她', '健康', '钱', '快乐', '勇气']

export function g7Tags(text: string): string[] {
  if (/钱|财|富|薪|工资|余额|存款/.test(text)) return ['money']
  if (/她|他|你|爱|喜欢|对象/.test(text)) return ['love']
  if (/家|妈|爸|平安|团圆|父母/.test(text)) return ['family']
  if (/健康|身体|睡眠/.test(text)) return ['relaxed']
  if (/自由|远方|旅行|诗|月亮/.test(text)) return ['freedom', 'romantic']
  if (/勇气|自己|快乐|现在/.test(text)) return ['youth', 'self']
  return ['warm']
}

/* ---------- 月兔开场白（随游玩次数变化） ---------- */

export function greetingFor(count: number): string {
  if (count <= 1) return '你来了。'
  if (count === 2) return '又见面了。'
  if (count === 3) return '你是不是还有心事？'
  if (count === 4) return '月亮都快认识你了。'
  return '要不今晚住这儿？'
}

/* ---------- 每局随机题库 ---------- */

export interface RunQuestions {
  g1: G1Item[]
  g3: G3Chip[]
  g6: G6Q[]
}

export function buildRunQuestions(): RunQuestions {
  // 第1关：6 个坑位，随机替换 2 个为替补物品（每次游玩不同）
  const g1 = [...G1_BASE]
  const alts = shuffle(G1_ALT)
  shuffle([0, 1, 2, 3, 4, 5])
    .slice(0, 2)
    .forEach((idx, i) => {
      if (alts[i]) g1[idx] = alts[i]
    })
  // 第3关：14 个词条抽 8 个
  const g3 = shuffle([...G3_BASE, ...G3_ALT]).slice(0, 8)
  // 第6关：6 题抽 4 题
  const g6 = shuffle(G6_POOL).slice(0, 4)
  return { g1, g3, g6 }
}

/* ---------- 结局系统：12 普通 + 4 隐藏 ---------- */

export interface Ending {
  id: string
  name: string
  text: string
  hidden?: boolean
}

export const ENDINGS: Record<string, Ending> = {
  tsundere: { id: 'tsundere', name: '嘴硬月', text: '嘴上：无所谓。心里：最好一个都别走。' },
  freedom: { id: 'freedom', name: '自由月', text: '你想去远方，不一定是为了逃离什么。只是想看看，人生是不是还有别的版本。' },
  fortune: { id: 'fortune', name: '发财月', text: '别人中秋思念故乡。你：思念余额。' },
  nostalgia: { id: 'nostalgia', name: '念旧月', text: '你一直往前走。只是偶尔，会偷偷回头。' },
  solo: { id: 'solo', name: '独行月', text: '很多事情，你已经习惯自己解决。但不代表，你不期待有人陪你看月亮。' },
  gentle: { id: 'gentle', name: '温柔月', text: '你对世界很轻。世界也会慢慢对你轻一点。' },
  reunion: { id: 'reunion', name: '团圆月', text: '走得再远，你的导航终点，始终是家。' },
  fireworks: { id: 'fireworks', name: '人间烟火月', text: '你爱的不是月亮，是月亮底下那桌热饭，和吃饭的人。' },
  relaxed: { id: 'relaxed', name: '松弛月', text: '急什么呢。月亮绕一圈要一个月。你也可以慢慢来。' },
  youth: { id: 'youth', name: '少年月', text: '你心里那个不怕输的人还在。今晚，它抬头看了看月亮。' },
  clear: { id: 'clear', name: '清醒月', text: '你不向月亮许愿。想要的东西，你打算自己去拿。' },
  romantic: { id: 'romantic', name: '浪漫月', text: '你把日子过成慢慢的东西。月亮很欣赏你。' },
  // 隐藏结局
  hFortune: { id: 'hFortune', name: '招财月', hidden: true, text: '别人拜月亮，你拜财神。放心，月亮不记仇——它已经帮你把愿望转达了。' },
  hGrace: { id: 'hGrace', name: '体面月', hidden: true, text: '你把体面留给了别人，把委屈留给了自己。今晚，月亮站在你这边。' },
  hMiss: { id: 'hMiss', name: '相思月', hidden: true, text: '你停在那个月亮下面，不是因为过去有多好。是因为那里有个人。' },
  hHesitate: { id: 'hHesitate', name: '纠结月', hidden: true, text: '不是选不出来。是每个选项里，都有你舍不得的东西。' },
}

/**
 * 隐藏结局触发规则（优先于普通结局）：
 * 1. 招财月：第1关接住 💰 + 第6关选钱≥2 次 + 第7关输入含钱类关键词
 * 2. 体面月：第3关扔掉的 3 个全是人际关系类（前任/相亲/未读消息99+）+ 第5关删的是「我挺好的。」
 * 3. 相思月：第4关停在「去年中秋」+ 第7关输入包含 你/她/他
 * 4. 纠结月：第6关全部超时
 */
function hiddenEnding(results: LevelResult[]): Ending | null {
  const g1 = results.find((r) => r.level === 1)
  const g3 = results.find((r) => r.level === 3)
  const g4 = results.find((r) => r.level === 4)
  const g5 = results.find((r) => r.level === 5)
  const g6 = results.find((r) => r.level === 6)
  const g7 = results.find((r) => r.level === 7)

  // 纠结月
  const g6d = g6?.detail as { picks?: G6Pick[] } | undefined
  const picks = g6d?.picks ?? []
  if (picks.length > 0 && picks.every((p) => p.side === 'timeout')) return ENDINGS.hHesitate

  // 招财月
  const moneyPicks = picks.filter((p) => p.tags.includes('money')).length
  if (g1?.choice === 'money' && moneyPicks >= 2 && g7 && /钱|财|富|薪|金|钞|存款|余额/.test(g7.choice))
    return ENDINGS.hFortune

  // 体面月
  const g3d = g3?.detail as { cats?: string[] } | undefined
  if (
    g3d?.cats &&
    g3d.cats.length === 3 &&
    g3d.cats.every((c) => c === 'relation') &&
    g5?.choice === '我挺好的。'
  )
    return ENDINGS.hGrace

  // 相思月
  if (g4?.choice === 'lastMid' && g7 && /你|她|他/.test(g7.choice)) return ENDINGS.hMiss

  return null
}

/** 普通结局：标签加权计分取最高，兜底为嘴硬月 */
export function computeEnding(results: LevelResult[]): Ending {
  const hidden = hiddenEnding(results)
  if (hidden) return hidden

  const count = new Map<string, number>()
  results.forEach((r) => r.tags.forEach((t) => count.set(t, (count.get(t) ?? 0) + 1)))
  const s = (t: string) => count.get(t) ?? 0

  const g5 = results.find((r) => r.level === 5)

  const candidates: [Ending, number][] = [
    [ENDINGS.fortune, s('money') * 2],
    [ENDINGS.freedom, s('freedom') * 2],
    [ENDINGS.nostalgia, s('past') * 2],
    [ENDINGS.solo, s('alone') * 2],
    [ENDINGS.gentle, s('love') * 2 + s('warm') * 0.5],
    [ENDINGS.reunion, s('family') * 2],
    [ENDINGS.fireworks, s('warm') * 2],
    [ENDINGS.relaxed, s('relaxed') * 2 + s('self') * 0.5],
    [ENDINGS.youth, s('youth') * 2 + s('freedom') * 0.5],
    [ENDINGS.clear, s('clear') * 3 + s('self')],
    [ENDINGS.romantic, s('romantic') * 2 + s('love') * 0.5],
    // 嘴硬月：删掉「我挺好的。」加权，否则作为兜底
    [ENDINGS.tsundere, (g5?.choice === '我挺好的。' ? 3 : 0) + s('alone') * 0.5 + 0.01],
  ]

  let best = candidates[0]
  for (const c of candidates) if (c[1] > best[1]) best = c
  return best[0]
}
