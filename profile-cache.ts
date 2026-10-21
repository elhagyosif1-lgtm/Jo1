'use client'

import { createClient } from '@/lib/supabase/client'
import type { PublicProfile } from '@/lib/types'

const cache = new Map<string, PublicProfile>()
const pending = new Map<string, Promise<PublicProfile | null>>()

export function cachedProfile(id: string) {
  return cache.get(id) ?? null
}

export async function loadProfiles(ids: string[]) {
  const missing = [...new Set(ids)].filter((id) => !cache.has(id) && !pending.has(id))
  if (missing.length) {
    const supabase = createClient()
    const req = supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, level')
      .in('id', missing)
      .then(({ data }) => {
        data?.forEach((p) => cache.set(p.id, p as PublicProfile))
        return null
      })
    missing.forEach((id) => pending.set(id, req.then(() => cache.get(id) ?? null)))
    await req
    missing.forEach((id) => pending.delete(id))
  }
  await Promise.all(ids.map((id) => pending.get(id)))
  return ids.map((id) => cache.get(id)).filter(Boolean) as PublicProfile[]
}
