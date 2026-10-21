export type Profile = {
  id: string
  username: string
  display_name: string
  avatar_url?: string | null
  bio?: string | null
  level: number
  current_xp: number
  coins_balance: number
  diamonds_balance: number
  is_streamer: boolean
  is_banned: boolean
  created_at: string
}

export type VideoCard = {
  id: string
  user: string
  handle: string
  title: string
  description: string
  duration: string
  views: string
  likes: string
}
