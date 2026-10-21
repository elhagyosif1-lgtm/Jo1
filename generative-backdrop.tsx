'use client'

import { useEffect, useRef } from 'react'

export function GenerativeBackdrop({ seed = 0 }: { seed?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    let raf = 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hues = [[255, 215, 0], [0, 242, 254], [255, 42, 95]]
    const blobs = Array.from({ length: 5 }, (_, i) => ({
      phase: i * 1.3 + seed,
      speed: 0.15 + ((i * 37 + seed) % 10) / 40,
      color: hues[(i + seed) % hues.length],
    }))

    const draw = (t: number) => {
      const w = (canvas.width = canvas.clientWidth)
      const h = (canvas.height = canvas.clientHeight)
      ctx.fillStyle = '#07080c'
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      for (const b of blobs) {
        const a = t / 1000 * b.speed + b.phase
        const x = w / 2 + Math.cos(a) * w * 0.35
        const y = h / 2 + Math.sin(a * 1.3) * h * 0.3
        const r = Math.max(w, h) * 0.45
        const g = ctx.createRadialGradient(x, y, 0, x, y, r)
        g.addColorStop(0, `rgba(${b.color.join(',')},0.28)`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      }
      ctx.globalCompositeOperation = 'source-over'
      if (!reduced) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [seed])

  return <canvas ref={ref} aria-hidden className="absolute inset-0 size-full" />
}
