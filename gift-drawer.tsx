'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Coins, X } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { formatCount, rpcErrorMessage } from '@/lib/format'
import type { Gift, GiftTier } from '@/lib/types'
import { cn } from '@/lib/utils'

const TABS: { id: GiftTier; label: string }[] = [
  { id: 'standard', label: 'عادية' },
  { id: 'major', label: 'كبرى' },
  { id: 'legendary', label: 'أسطورية' },
]
const QUANTITIES = [1, 10, 66, 99]

type Props = {
  open: boolean
  onClose: () => void
  gifts: Gift[]
  balance: number | null
  streamId: string
  onSent: (result: { transaction_id: string; coins_balance: number; leveled_up?: boolean; level: number }, gift: Gift, quantity: number) => void
}

export function GiftDrawer({ open, onClose, gifts, balance, streamId, onSent }: Props) {
  const [tab, setTab] = useState<GiftTier>('standard')
  const [selected, setSelected] = useState<Gift | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const idempotencyKey = useRef<string | null>(null)

  const visible = gifts.filter((g) => g.tier === tab)
  const total = selected ? selected.price_coins * quantity : 0

  function select(gift: Gift) {
    setSelected(gift)
    setError(null)
    idempotencyKey.current = null
  }

  async function send() {
    if (!selected || sending) return
    setSending(true)
    setError(null)
    idempotencyKey.current ??= crypto.randomUUID()
    try {
      const res = await fetch('/api/gifts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId, giftId: selected.id, quantity, idempotencyKey: idempotencyKey.current }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(rpcErrorMessage(data.error))
        if (res.status < 500) idempotencyKey.current = null
        return
      }
      idempotencyKey.current = null
      onSent(data, selected, quantity)
    } catch {
      setError('تعذّر الاتصال. أعد المحاولة.')
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label="إغلاق"
            className="absolute inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.section
            role="dialog"
            aria-label="الهدايا"
            className="glass absolute inset-x-0 bottom-0 z-50 rounded-b-none rounded-t-3xl px-4 pt-4 pb-safe"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex gap-1 rounded-full bg-secondary p-1">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-bold transition-colors',
                      tab === t.id ? 'bg-gold text-background' : 'text-muted-foreground',
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <button onClick={onClose} aria-label="إغلاق" className="rounded-full p-1.5 text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {visible.map((g) => (
                <button
                  key={g.id}
                  onClick={() => select(g)}
                  aria-pressed={selected?.id === g.id}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-2xl border p-2 transition-colors',
                    selected?.id === g.id ? 'border-gold bg-gold/10' : 'border-transparent hover:bg-white/5',
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.image_url ?? ''} alt="" className="size-14 object-contain" />
                  <span className="text-xs font-medium">{g.name_ar}</span>
                  <span className="flex items-center gap-0.5 text-[11px] text-gold">
                    <Coins className="size-3" /> {formatCount(g.price_coins)}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div className="flex gap-1" role="radiogroup" aria-label="الكمية">
                {QUANTITIES.map((q) => (
                  <button
                    key={q}
                    role="radio"
                    aria-checked={quantity === q}
                    onClick={() => {
                      setQuantity(q)
                      idempotencyKey.current = null
                    }}
                    className={cn(
                      'h-9 min-w-10 rounded-full px-2 font-display text-xs font-bold',
                      quantity === q ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground',
                    )}
                  >
                    x{q}
                  </button>
                ))}
              </div>
              {balance === null ? (
                <Link href="/auth/login" className="ms-auto h-10 rounded-full bg-gold px-5 text-sm font-bold leading-10 text-background">
                  سجّل الدخول
                </Link>
              ) : (
                <button
                  onClick={send}
                  disabled={!selected || sending || total > balance}
                  className="ms-auto h-10 rounded-full bg-gradient-to-l from-hot to-gold px-5 text-sm font-bold text-background disabled:opacity-40"
                >
                  {sending ? '...' : selected ? `إرسال · ${formatCount(total)}` : 'اختر هدية'}
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Coins className="size-3.5 text-gold" /> الرصيد: {balance === null ? '—' : formatCount(balance)}
              </span>
              {error && (
                <span role="alert" className="text-hot">
                  {error}
                </span>
              )}
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  )
}
