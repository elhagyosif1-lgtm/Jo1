'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { GiftFxEngine } from '@/lib/gift-engine'
import type { Gift } from '@/lib/types'

export type GiftEvent = { key: string; gift: Gift; quantity: number; senderName: string }
export type GiftOverlayHandle = { enqueue: (event: GiftEvent) => void }

const DURATION_MS = { standard: 2600, major: 3000, legendary: 4600 }

export const GiftOverlay = forwardRef<GiftOverlayHandle>(function GiftOverlay(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<GiftFxEngine | null>(null)
  const seen = useRef(new Set<string>())
  const queue = useRef<GiftEvent[]>([])
  const [banners, setBanners] = useState<GiftEvent[]>([])
  const [spotlight, setSpotlight] = useState<GiftEvent | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const engine = new GiftFxEngine(canvas)
    engineRef.current = engine
    const onResize = () => engine.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      engine.dispose()
      engineRef.current = null
    }
  }, [])

  const playNextSpotlight = useCallback(() => {
    const next = queue.current.shift()
    if (!next) {
      setSpotlight(null)
      return
    }
    setSpotlight(next)
    engineRef.current?.play(next.gift.tier, next.gift.color, next.quantity)
    window.setTimeout(playNextSpotlight, DURATION_MS[next.gift.tier as 'major' | 'legendary'])
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      enqueue(event) {
        if (seen.current.has(event.key)) return
        seen.current.add(event.key)
        if (event.gift.tier === 'standard') {
          engineRef.current?.play('standard', event.gift.color, event.quantity)
          setBanners((b) => [...b.slice(-2), event])
          window.setTimeout(() => setBanners((b) => b.filter((x) => x.key !== event.key)), DURATION_MS.standard)
          return
        }
        queue.current.push(event)
        setSpotlight((current) => {
          if (!current) queueMicrotask(playNextSpotlight)
          return current
        })
      },
    }),
    [playNextSpotlight],
  )

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-live="polite">
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />

      <div className="absolute inset-x-3 top-[38%] flex flex-col items-start gap-2">
        <AnimatePresence>
          {banners.map((b) => (
            <motion.div
              key={b.key}
              initial={{ x: 120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              className="glass flex items-center gap-2 rounded-full py-1 ps-1 pe-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.gift.image_url ?? ''} alt="" className="size-9 rounded-full object-cover" />
              <div className="leading-tight">
                <p className="text-xs font-bold">{b.senderName}</p>
                <p className="text-[11px] text-muted-foreground">أرسل {b.gift.name_ar}</p>
              </div>
              <motion.span
                initial={{ scale: 2.2 }}
                animate={{ scale: 1 }}
                className="font-display text-xl font-extrabold italic text-gold"
              >
                x{b.quantity}
              </motion.span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {spotlight && (
          <motion.div
            key={spotlight.key}
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {spotlight.gift.tier === 'legendary' && (
              <motion.div
                className="absolute inset-0"
                style={{ background: `radial-gradient(circle at 50% 42%, ${spotlight.gift.color}55, transparent 65%)` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.6] }}
                transition={{ duration: 1.2 }}
              />
            )}
            <motion.img
              src={spotlight.gift.image_url ?? ''}
              alt={spotlight.gift.name_ar}
              className="relative w-3/4 max-w-xs object-contain mix-blend-screen"
              initial={{ scale: 0.2, y: 80, rotate: -8 }}
              animate={{ scale: [0.2, 1.15, 1], y: 0, rotate: 0 }}
              exit={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            <motion.div
              className="glass relative -mt-4 rounded-2xl px-5 py-2 text-center"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm font-bold">
                <span className="text-gold">{spotlight.senderName}</span> أرسل {spotlight.gift.name_ar}
              </p>
              <p className="font-display text-2xl font-extrabold italic text-gold">x{spotlight.quantity}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
