'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cachedProfile, loadProfiles } from '@/lib/profile-cache'
import type { GiftTransaction, PublicProfile, Stream, StreamMessage } from '@/lib/types'

export type ChatLine = StreamMessage & { author: PublicProfile | null }
export type Viewer = { user_id: string; name: string; avatar: string | null }

type Options = {
  streamId: string
  me: { id: string; name: string; avatar: string | null } | null
  onGift?: (tx: GiftTransaction, sender: PublicProfile | null) => void
}

export function useStreamChannel({ streamId, me, onGift }: Options) {
  const [messages, setMessages] = useState<ChatLine[]>([])
  const [viewers, setViewers] = useState<Viewer[]>([])
  const [streamPatch, setStreamPatch] = useState<Partial<Stream>>({})
  const onGiftRef = useRef(onGift)
  onGiftRef.current = onGift

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    supabase
      .from('stream_messages')
      .select('id, stream_id, user_id, content, created_at')
      .eq('stream_id', streamId)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(async ({ data }) => {
        if (cancelled || !data) return
        await loadProfiles(data.map((m) => m.user_id))
        const lines = data.reverse().map((m) => ({ ...m, author: cachedProfile(m.user_id) }))
        setMessages((prev) => {
          const ids = new Set(lines.map((l) => l.id))
          return [...lines, ...prev.filter((p) => !ids.has(p.id))]
        })
      })

    const presenceKey = me?.id ?? `guest-${crypto.randomUUID()}`
    const channel = supabase.channel(`stream:${streamId}`, { config: { presence: { key: presenceKey } } })

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stream_messages', filter: `stream_id=eq.${streamId}` },
        async (payload) => {
          const msg = payload.new as StreamMessage
          const [author] = await loadProfiles([msg.user_id])
          setMessages((prev) => (prev.some((p) => p.id === msg.id) ? prev : [...prev.slice(-80), { ...msg, author: author ?? null }]))
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'gift_transactions', filter: `stream_id=eq.${streamId}` },
        async (payload) => {
          const tx = payload.new as GiftTransaction
          const [sender] = await loadProfiles([tx.sender_id])
          onGiftRef.current?.(tx, sender ?? null)
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'streams', filter: `id=eq.${streamId}` },
        (payload) => setStreamPatch(payload.new as Stream),
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<Viewer>()
        setViewers(Object.values(state).map((entries) => entries[0]).filter((v) => v && !v.user_id.startsWith('guest-')))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: presenceKey, name: me?.name ?? 'زائر', avatar: me?.avatar ?? null })
        }
      })

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [streamId, me?.id, me?.name, me?.avatar])

  return { messages, viewers, streamPatch }
}
