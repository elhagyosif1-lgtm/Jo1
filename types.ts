export type Profile = {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  level: number
  current_xp: number
  coins_balance: number
  diamonds_balance: number
  league_tier: number
  weekly_score: number
  is_streamer: boolean
  is_banned: boolean
  welcome_bonus_claimed: boolean
  created_at: string
}

export type PublicProfile = Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'level'>

export type StreamLayout = 'hero' | 'grid' | 'pip'

export type Stream = {
  id: string
  streamer_id: string
  title: string
  status: 'live' | 'ended'
  layout: StreamLayout
  current_viewers: number
  peak_viewers: number
  total_coins: number
  created_at: string
  ended_at: string | null
  streamer?: PublicProfile
}

export type GiftTier = 'standard' | 'major' | 'legendary'

export type Gift = {
  id: string
  name_ar: string
  name_en: string
  price_coins: number
  xp_reward: number
  tier: GiftTier
  animation_type: string
  color: string
  image_url: string | null
  sort_order: number
}

export type GiftTransaction = {
  id: string
  sender_id: string
  receiver_id: string
  stream_id: string | null
  gift_id: string
  quantity: number
  coins_spent: number
  diamonds_earned: number
  xp_earned: number
  created_at: string
}

export type StreamMessage = {
  id: string
  stream_id: string
  user_id: string
  content: string
  created_at: string
}

export type DirectMessage = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read_at: string | null
  created_at: string
}

export type Video = {
  id: string
  author_id: string
  video_path: string
  caption: string | null
  status: 'pending' | 'published' | 'rejected'
  likes_count: number
  comments_count: number
  created_at: string
  author?: PublicProfile
}

export type VideoComment = {
  id: string
  video_id: string
  user_id: string
  content: string
  created_at: string
  author?: PublicProfile
}
