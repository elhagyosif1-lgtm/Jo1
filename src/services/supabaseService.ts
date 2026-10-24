export type Language = 'ar' | 'en';

export type VideoCategory =
  | 'education'
  | 'comedy'
  | 'tech'
  | 'art'
  | 'drama'
  | 'animals'
  | 'news'
  | 'sports';

export type VideoPrivacy = 'private_link' | 'public' | 'only_me';

export interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  isVerified: boolean;
  bio?: string;
  followersCount: number;
  followingCount?: number;
  totalLikes?: string;
  supporterLevel?: number; // e.g. 52
  supporterTitle?: string;
  vodafoneCashMasked?: string;
}

export interface Sound {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  duration?: string;
  usesCount?: number;
  audioUrl?: string;
}

export interface VideoStats {
  likes: number;
  comments: number;
  bookmarks: number;
  shares: number;
  views: number;
}

export interface VideoItem {
  id: string;
  videoUrl: string;
  fallbackUrl?: string;
  posterUrl?: string;
  caption: string;
  hashtags: string[];
  category: VideoCategory;
  author: Creator;
  music: Sound;
  stats: VideoStats;
  createdAt: string;
  filterApplied?: string;
  privacy?: VideoPrivacy; // 'private_link' = unlisted private
  secretToken?: string;
  isUserUploaded?: boolean;
}

export interface CommentItem {
  id: string;
  videoId: string;
  author: {
    username: string;
    displayName: string;
    avatarUrl: string;
    supporterLevel?: number;
  };
  text: string;
  likes: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  nameAr: string;
  cssFilter: string;
  overlayClass?: string;
  badge: string;
}

export type GiftTier = 'impact' | 'legendary' | 'royal' | 'diamond' | 'gold';

export interface VerificationRequest {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  feeEgp: number; // 200 EGP
  feeCoins: number;
  status: 'pending' | 'approved' | 'rejected';
  channelUrl: string;
  category: string;
  nationalIdMasked: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface GiftItem {
  id: string;
  nameAr: string;
  nameEn: string;
  emoji: string;
  costCoins: number;
  tier: GiftTier;
  animationType:
    | 'golden_lion'
    | 'neon_tiger'
    | 'golden_giraffe'
    | 'cosmic_whale'
    | 'golden_eagle'
    | 'golden_trex'
    | 'golden_triceratops'
    | 'enigma_galaxy'
    | 'lion_king'
    | 'universe'
    | 'phoenix'
    | 'dragon'
    | 'burj_khalifa'
    | 'galaxy_fleet'
    | 'diamond_rain'
    | 'golden_citadel'
    | 'meteor_strike'
    | 'solar_eclipse'
    | 'lightning_storm'
    | 'supernova'
    | 'tiger'
    | 'wolf'
    | 'panther'
    | 'falcon'
    | 'hypercar'
    | 'private_jet'
    | 'big_bang';
  descriptionAr: string;
}

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'gift_sent' | 'gift_received';
  amountCoins: number;
  amountFiat: number;
  currency: string;
  status: 'completed' | 'processing' | 'failed';
  timestamp: string;
  note: string;
  paymentMethod?: 'vodafone_cash' | 'bank_iban' | 'apple_pay' | 'card';
  accountRefMasked?: string;
  referenceNumber?: string;
}

export interface UserWallet {
  coinsBalance: number;
  diamondsBalance: number;
  fiatBalance: number;
  currency: string;
  vodafoneCashNumber: string;
  vodafoneCashMasked: string;
  linkedIban: string;
  cryptoAddress?: string;
  transactions: WalletTransaction[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isEncrypted: boolean;
  isSender: boolean;
}

export interface StreamSettings4K {
  resolution: '4K_UHD' | '2K_QHD' | '1080p_FHD' | '720p_HD';
  fps: 60 | 30;
  videoBitrateKbps: number;
  audioBitrateKbps: number;
  encoder: 'NVENC_AV1' | 'NVENC_HEVC' | 'NVENC_H264' | 'X264_CPU' | 'QUICKSYNC';
  rtmpServer: string;
  streamKey: string;
  latencyMode: 'ultra_low' | 'low' | 'normal';
}

export type MainTab =
  | 'feed'
  | 'discover'
  | 'upload'
  | 'live'
  | 'obs_studio'
  | 'messages'
  | 'profile'
  | 'backstage';

export type FeedType = 'foryou' | 'following';
