import type { GiftTier } from '@/lib/types'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  kind: 'spark' | 'ring' | 'star'
}

const TIER_CONFIG: Record<GiftTier, { count: number; rings: number; duration: number }> = {
  standard: { count: 36, rings: 0, duration: 1.2 },
  major: { count: 140, rings: 1, duration: 2.4 },
  legendary: { count: 320, rings: 3, duration: 4 },
}

/**
 * Canvas 2D particle renderer for gift effects. Renders only while particles are alive,
 * so an idle overlay costs nothing. Call dispose() on unmount to release the audio context.
 */
export class GiftFxEngine {
  private ctx: CanvasRenderingContext2D
  private particles: Particle[] = []
  private raf = 0
  private last = 0
  private audio: AudioContext | null = null
  private disposed = false

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D unavailable')
    this.ctx = ctx
    this.resize()
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const { clientWidth: w, clientHeight: h } = this.canvas
    this.canvas.width = w * dpr
    this.canvas.height = h * dpr
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  play(tier: GiftTier, color: string, quantity: number) {
    if (this.disposed) return
    const cfg = TIER_CONFIG[tier]
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    const cx = w / 2
    const cy = tier === 'standard' ? h * 0.62 : h * 0.42
    const count = Math.min(cfg.count * Math.min(quantity, 5), 900)
    const palette = [color, '#ffd700', '#ffffff', tier === 'legendary' ? '#00f2fe' : color]

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = (tier === 'legendary' ? 260 : 160) * (0.3 + Math.random())
      const maxLife = cfg.duration * (0.5 + Math.random() * 0.6)
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (tier === 'standard' ? 120 : 40),
        life: maxLife,
        maxLife,
        size: 1.5 + Math.random() * (tier === 'standard' ? 3 : 5),
        color: palette[i % palette.length],
        kind: Math.random() < 0.15 ? 'star' : 'spark',
      })
    }
    for (let r = 0; r < cfg.rings; r++) {
      this.particles.push({
        x: cx,
        y: cy,
        vx: 0,
        vy: 0,
        life: 1.2 + r * 0.35,
        maxLife: 1.2 + r * 0.35,
        size: Math.max(w, h) * (0.6 + r * 0.25),
        color: r % 2 ? '#00f2fe' : color,
        kind: 'ring',
      })
    }
    this.sound(tier)
    if (!this.raf) {
      this.last = performance.now()
      this.raf = requestAnimationFrame(this.tick)
    }
  }

  private tick = (now: number) => {
    const dt = Math.min((now - this.last) / 1000, 0.05)
    this.last = now
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight)
    ctx.globalCompositeOperation = 'lighter'

    this.particles = this.particles.filter((p) => (p.life -= dt) > 0)
    for (const p of this.particles) {
      const t = p.life / p.maxLife
      if (p.kind === 'ring') {
        const radius = p.size * (1 - t)
        ctx.strokeStyle = p.color
        ctx.globalAlpha = t * 0.7
        ctx.lineWidth = 6 * t + 1
        ctx.beginPath()
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
        ctx.stroke()
        continue
      }
      p.vy += 220 * dt
      p.vx *= 0.985
      p.x += p.vx * dt
      p.y += p.vy * dt
      ctx.globalAlpha = Math.min(1, t * 1.6)
      ctx.fillStyle = p.color
      if (p.kind === 'star') {
        const s = p.size * 2.2
        ctx.fillRect(p.x - s / 2, p.y - 0.75, s, 1.5)
        ctx.fillRect(p.x - 0.75, p.y - s / 2, 1.5, s)
      } else {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * t + 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'

    if (this.particles.length && !this.disposed) {
      this.raf = requestAnimationFrame(this.tick)
    } else {
      this.raf = 0
    }
  }

  private sound(tier: GiftTier) {
    try {
      this.audio ??= new AudioContext()
      const ac = this.audio
      if (ac.state === 'suspended') void ac.resume()
      const now = ac.currentTime
      const master = ac.createGain()
      master.gain.value = tier === 'legendary' ? 0.22 : 0.14
      master.connect(ac.destination)

      const notes = tier === 'standard' ? [880, 1320] : tier === 'major' ? [523, 659, 784, 1047] : [196, 392, 523, 784, 1047, 1568]
      notes.forEach((freq, i) => {
        const osc = ac.createOscillator()
        const g = ac.createGain()
        osc.type = i === 0 && tier === 'legendary' ? 'sawtooth' : 'triangle'
        osc.frequency.setValueAtTime(freq, now + i * 0.08)
        g.gain.setValueAtTime(0, now + i * 0.08)
        g.gain.linearRampToValueAtTime(1, now + i * 0.08 + 0.02)
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + (tier === 'legendary' ? 1.6 : 0.6))
        osc.connect(g).connect(master)
        osc.start(now + i * 0.08)
        osc.stop(now + i * 0.08 + 1.8)
      })
    } catch {
      // Audio is best-effort; browsers may block it before a user gesture.
    }
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    this.particles = []
    void this.audio?.close()
    this.audio = null
  }
}
