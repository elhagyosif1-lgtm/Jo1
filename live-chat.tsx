'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ChatLine } from '@/hooks/use-stream-channel'

export function LiveChatFeed({ messages }: { messages: ChatLine[] }) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  return (
    <div
      className="no-scrollbar flex max-h-[34vh] flex-col gap-1.5 overflow-y-auto"
      style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%)' }}
      role="log"
      aria-label="محادثة البث"
    >
      {messages.map((m) => (
        <p key={m.id} className="w-fit max-w-[85%] rounded-2xl bg-black/35 px-3 py-1.5 text-sm leading-snug backdrop-blur-sm">
          <span className="me-1.5 font-bold text-gold">{m.author?.display_name ?? '...'}</span>
          <span className="text-foreground/90">{m.content}</span>
        </p>
      ))}
      <div ref={endRef} />
    </div>
  )
}

export function LiveChatInput({ streamId, userId, disabled }: { streamId: string; userId: string | null; disabled?: boolean }) {
  const [value, setValue] = useState('')
  const [sending, setSending] = useState(false)

  async function send() {
    const content = value.trim().slice(0, 300)
    if (!content || !userId || sending) return
    setSending(true)
    const { error } = await createClient().from('stream_messages').insert({ stream_id: streamId, user_id: userId, content })
    setSending(false)
    if (!error) setValue('')
  }

  return (
    <form
      className="flex-1"
      onSubmit={(e) => {
        e.preventDefault()
        void send()
      }}
    >
      <label className="sr-only" htmlFor="live-chat-input">
        اكتب تعليقاً
      </label>
      <input
        id="live-chat-input"
        value={value}
        maxLength={300}
        disabled={!userId || disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
        }}
        placeholder={userId ? 'اكتب تعليقاً...' : 'سجّل الدخول للتعليق'}
        className="glass h-11 w-full rounded-full px-4 text-sm placeholder:text-muted-foreground focus:border-gold focus:outline-none disabled:opacity-60"
      />
    </form>
  )
}
