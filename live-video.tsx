'use client'

import { useEffect, useRef, useState } from 'react'
import { Room, RoomEvent, Track, type RemoteTrack } from 'livekit-client'
import { GenerativeBackdrop } from '@/components/live/generative-backdrop'

type State = 'connecting' | 'playing' | 'unavailable'

export function LiveVideo({ streamId, seed }: { streamId: string; seed: number }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [state, setState] = useState<State>('connecting')

  useEffect(() => {
    let room: Room | null = null
    let cancelled = false

    async function connect() {
      const res = await fetch(`/api/livekit-token?room=${encodeURIComponent(streamId)}`)
      if (!res.ok) {
        setState('unavailable')
        return
      }
      const { token, url } = (await res.json()) as { token: string; url: string }
      if (cancelled) return
      room = new Room({ adaptiveStream: true, dynacast: true })
      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Video && videoRef.current) {
          track.attach(videoRef.current)
          setState('playing')
        } else if (track.kind === Track.Kind.Audio && audioRef.current) {
          track.attach(audioRef.current)
        }
      })
      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        track.detach()
        if (track.kind === Track.Kind.Video) setState('connecting')
      })
      await room.connect(url, token)
    }

    connect().catch((err) => {
      console.error('LiveKit connect failed:', err)
      if (!cancelled) setState('unavailable')
    })

    return () => {
      cancelled = true
      void room?.disconnect()
    }
  }, [streamId])

  return (
    <div className="absolute inset-0 bg-background">
      {state !== 'playing' && <GenerativeBackdrop seed={seed} />}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
        className={state === 'playing' ? 'absolute inset-0 size-full object-cover' : 'hidden'}
      />
      <audio ref={audioRef} autoPlay />
      {state === 'connecting' && (
        <p className="absolute inset-x-0 top-1/2 text-center text-sm text-muted-foreground">جارٍ الاتصال بالبث...</p>
      )}
    </div>
  )
}
