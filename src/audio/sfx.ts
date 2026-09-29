/**
 * WebAudio 合成音效引擎（零外部音频素材）。
 * 首次用户手势时 unlock() 创建并 resume AudioContext。
 */
class Sfx {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private noiseBuf: AudioBuffer | null = null
  private windGain: GainNode | null = null
  private windStarted = false

  unlock(): void {
    if (!this.ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.9
      this.master.connect(this.ctx.destination)
      const len = this.ctx.sampleRate * 2
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
      const d = this.noiseBuf.getChannelData(0)
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
  }

  private get ok(): boolean {
    return this.ctx !== null && this.master !== null
  }

  private tone(opts: {
    type: OscillatorType
    f0: number
    f1?: number
    t?: number
    dur: number
    peak: number
    attack?: number
  }): void {
    if (!this.ok) return
    const ctx = this.ctx!
    const master = this.master!
    const t0 = ctx.currentTime + (opts.t ?? 0)
    const osc = ctx.createOscillator()
    osc.type = opts.type
    osc.frequency.setValueAtTime(opts.f0, t0)
    if (opts.f1) osc.frequency.exponentialRampToValueAtTime(opts.f1, t0 + opts.dur)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(opts.peak, t0 + (opts.attack ?? 0.012))
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur)
    osc.connect(g)
    g.connect(master)
    osc.start(t0)
    osc.stop(t0 + opts.dur + 0.05)
  }

  private noiseBurst(opts: {
    dur: number
    peak: number
    f0: number
    f1?: number
    q?: number
    type?: BiquadFilterType
    t?: number
  }): void {
    if (!this.ok || !this.noiseBuf) return
    const ctx = this.ctx!
    const master = this.master!
    const t0 = ctx.currentTime + (opts.t ?? 0)
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuf
    src.loop = true
    const f = ctx.createBiquadFilter()
    f.type = opts.type ?? 'bandpass'
    f.frequency.setValueAtTime(opts.f0, t0)
    f.Q.value = opts.q ?? 1
    if (opts.f1) f.frequency.exponentialRampToValueAtTime(opts.f1, t0 + opts.dur)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(opts.peak, t0 + 0.025)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur)
    src.connect(f)
    f.connect(g)
    g.connect(master)
    src.start(t0)
    src.stop(t0 + opts.dur + 0.05)
  }

  /** 接住：短促 sine blip */
  blip(): void {
    this.tone({ type: 'sine', f0: 620, f1: 940, dur: 0.2, peak: 0.14 })
  }

  pop(): void {
    this.tone({ type: 'sine', f0: 360, f1: 720, dur: 0.09, peak: 0.1 })
  }

  tick(): void {
    this.tone({ type: 'square', f0: 1500, dur: 0.03, peak: 0.028 })
  }

  failBuzz(): void {
    this.tone({ type: 'sawtooth', f0: 170, f1: 110, dur: 0.26, peak: 0.05 })
  }

  /** 丢进垃圾桶：低频 thud + 高频噪声 click */
  trash(): void {
    this.tone({ type: 'sine', f0: 150, f1: 65, dur: 0.18, peak: 0.14 })
    this.noiseBurst({ dur: 0.12, peak: 0.05, f0: 2200, type: 'highpass' })
  }

  /** 碎片 chime */
  chime(): void {
    this.tone({ type: 'sine', f0: 1318.5, dur: 0.9, peak: 0.05 })
    this.tone({ type: 'sine', f0: 1975.5, dur: 1.1, peak: 0.033, t: 0.02 })
  }

  /** 月光 +1：小三度上行琶音 */
  moonUp(): void {
    ;[880, 1108.7, 1318.5].forEach((f, i) =>
      this.tone({ type: 'sine', f0: f, dur: 0.55, peak: 0.055, t: i * 0.09 }),
    )
  }

  /** 水花 */
  splash(): void {
    this.noiseBurst({ dur: 0.5, peak: 0.09, f0: 1000, f1: 260, q: 0.8 })
  }

  /** whoosh（滑动/过渡） */
  whoosh(): void {
    this.noiseBurst({ dur: 0.45, peak: 0.06, f0: 380, f1: 1500, q: 1.4 })
  }

  deleteWhoosh(): void {
    this.noiseBurst({ dur: 0.25, peak: 0.045, f0: 900, f1: 300, q: 1 })
  }

  /** 最终 reveal 和弦：C 大三和弦 + 高八度微光 */
  chord(): void {
    ;[261.63, 329.63, 392, 523.25].forEach((f, i) => {
      this.tone({ type: 'triangle', f0: f, dur: 3.2, peak: 0.042, attack: 0.6, t: i * 0.05 })
      this.tone({ type: 'sine', f0: f * 2, dur: 2.6, peak: 0.013, attack: 0.8, t: i * 0.05 })
    })
  }

  /** 环境风声：滤波噪声循环 + LFO 摆动 */
  startWind(): void {
    if (!this.ok || !this.noiseBuf || this.windStarted) return
    this.windStarted = true
    const ctx = this.ctx!
    const master = this.master!
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuf
    src.loop = true
    const f = ctx.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.value = 340
    f.Q.value = 0.6
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.07
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 120
    lfo.connect(lfoGain)
    lfoGain.connect(f.frequency)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 2.5)
    src.connect(f)
    f.connect(g)
    g.connect(master)
    src.start()
    lfo.start()
    this.windGain = g
  }

  setWind(level: number): void {
    if (this.windGain && this.ctx) {
      this.windGain.gain.setTargetAtTime(level, this.ctx.currentTime, 0.8)
    }
  }
}

export const sfx = new Sfx()
