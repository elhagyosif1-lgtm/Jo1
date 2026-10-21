import { NextRequest, NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const room = searchParams.get('room') ?? 'atrk-room'
  const identity = searchParams.get('identity') ?? 'guest-user'

  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

  if (!apiKey || !apiSecret || !livekitUrl) {
    return NextResponse.json({ error: 'LiveKit configuration missing' }, { status: 500 })
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    ttl: 60 * 60,
  })

  token.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  })

  return NextResponse.json({ token: await token.toJwt() })
}
