'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

type Me = { userId: string; email: string | null; emailConfirmed: boolean; profile: Profile | null } | null

async function fetchMe(): Promise<Me> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select(
      'id, username, display_name, avatar_url, bio, level, current_xp, coins_balance, diamonds_balance, league_tier, weekly_score, is_streamer, is_banned, welcome_bonus_claimed, created_at',
    )
    .eq('id', user.id)
    .maybeSingle()
  return { userId: user.id, email: user.email ?? null, emailConfirmed: !!user.email_confirmed_at, profile: data }
}

export function useMe() {
  const swr = useSWR('me', fetchMe, { revalidateOnFocus: true })
  const { mutate } = swr

  useEffect(() => {
    const supabase = createClient()
    const { data } = supabase.auth.onAuthStateChange(() => mutate())
    return () => data.subscription.unsubscribe()
  }, [mutate])

  return swr
}
