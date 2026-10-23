import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  VideoItem,
  CommentItem,
  Sound,
  Creator,
  MainTab,
  FeedType,
  Language,
  VideoCategory,
  VideoPrivacy,
  GiftItem,
  UserWallet,
  WalletTransaction,
  VerificationRequest
} from '../types';
import { INITIAL_VIDEOS, INITIAL_COMMENTS, TRENDING_SOUNDS } from '../data/initialVideos';
import { sendGiftRpc } from '../services/supabaseService';
import { MR_JOO_FOUNDER_AVATAR } from '../assets/mrJooAssets';

interface AppContextType {
  videos: VideoItem[];
  filteredVideos: VideoItem[];
  currentVideoIndex: number;
  setCurrentVideoIndex: (index: number) => void;
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  feedType: FeedType;
  setFeedType: (feed: FeedType) => void;
  likedVideoIds: Set<string>;
  bookmarkedVideoIds: Set<string>;
  followingCreatorIds: Set<string>;
  toggleLike: (videoId: string) => void;
  toggleBookmark: (videoId: string) => void;
  toggleFollow: (creatorId: string) => void;
  comments: Record<string, CommentItem[]>;
  addComment: (videoId: string, text: string) => void;
  likeComment: (videoId: string, commentId: string) => void;
  activeCommentsModalVideoId: string | null;
  setActiveCommentsModalVideoId: (id: string | null) => void;
  activeShareModalVideo: VideoItem | null;
  setActiveShareModalVideo: (video: VideoItem | null) => void;
  activeGiftModalVideo: VideoItem | null;
  setActiveGiftModalVideo: (video: VideoItem | null) => void;
  activeSoundModal: Sound | null;
  setActiveSoundModal: (sound: Sound | null) => void;
  isMuted: boolean;
  toggleMute: () => void;
  currentUser: Creator;
  updateCurrentUser: (updates: Partial<Creator>) => void;
  publishVideo: (data: {
    videoUrl: string;
    caption: string;
    hashtags: string[];
    category: VideoCategory;
    music: Sound;
    posterUrl?: string;
    filterApplied?: string;
    privacy?: VideoPrivacy;
  }) => VideoItem;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  language: Language;
  toggleLanguage: () => void;
  selectedSoundForUpload: Sound | null;
  setSelectedSoundForUpload: (sound: Sound | null) => void;
  userInterests: VideoCategory[];
  setUserInterests: (interests: VideoCategory[]) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  wallet: UserWallet;
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (open: boolean) => void;
  updateWalletDetails: (updates: { vodafoneCashNumber?: string; linkedIban?: string }) => void;
  depositCoins: (coins: number, fiatUsd: number, customNote?: string, referenceCode?: string) => void;
  withdrawCash: (fiatUsd: number, targetAccount: string, provider: string, customRef?: string) => void;
  setExactCoinsBalance: (coins: number) => void;
  resetTo100kCoins: () => void;
  activeGiftAnimation: GiftItem | null;
  triggerGiftAnimation: (gift: GiftItem, recipientCreator?: Creator) => boolean;
  clearGiftAnimation: () => void;
  autoAdvanceVideos: boolean;
  setAutoAdvanceVideos: (enable: boolean) => void;
  directVideoIdParam: string | null;
  verificationRequests: VerificationRequest[];
  submitVerificationRequest: (req: Omit<VerificationRequest, 'id' | 'submittedAt' | 'status'>) => void;
  approveVerificationRequest: (requestId: string) => void;
  rejectVerificationRequest: (requestId: string, note?: string) => void;
  isVerificationModalOpen: boolean;
  setIsVerificationModalOpen: (open: boolean) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_VIDEOS_KEY = 'jo1_user_videos_v3';
const LOCAL_STORAGE_LIKES_KEY = 'jo1_user_likes_v3';
const LOCAL_STORAGE_BOOKMARKS_KEY = 'jo1_user_bookmarks_v3';
const LOCAL_STORAGE_FOLLOWS_KEY = 'jo1_user_follows_v3';
const LOCAL_STORAGE_INTERESTS_KEY = 'jo1_user_interests_v3';
const LOCAL_STORAGE_WALLET_KEY = 'jo1_user_wallet_v3';
const LOCAL_STORAGE_AUTO_ADVANCE_KEY = 'jo1_auto_advance_videos';
const LOCAL_STORAGE_VERIFICATIONS_KEY = 'jo1_verification_requests_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user: MR JOO — Founder & CEO with ENIGMA Level 52 Imperial Supporter Crest
  const [currentUser, setCurrentUser] = useState<Creator>(() => {
    return {
      id: 'current-user-1',
      username: 'mr_joo_official',
      displayName: 'MR JOO 👑',
      avatarUrl: MR_JOO_FOUNDER_AVATAR,
      isVerified: true,
      bio: 'المؤسس والمدير التنفيذي لمنصة Jo1 | أعلى داعم إمبراطوري ENIGMA Level 52 👑💎',
      followersCount: 245000,
      followingCount: 150,
      totalLikes: '4.8M',
      supporterLevel: 52,
      supporterTitle: 'داعم إمبراطوري أسطوري (ENIGMA Level 52)',
      vodafoneCashMasked: '010*****514',
    };
  });

  // Enterprise Broadcaster Verification State (Paid 200 EGP Program)
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_VERIFICATIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'ver-req-1',
        creatorId: 'creator-4',
        creatorName: 'كريم أحمد',
        creatorUsername: 'tech_kareem',
        creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        feeEgp: 200,
        feeCoins: 4000,
        status: 'pending',
        channelUrl: 'https://mrjo1.vercel.app/@tech_kareem',
        category: 'Tech Media & AI',
        nationalIdMasked: '298********512',
        submittedAt: 'اليوم، 11:30 ص',
      },
      {
        id: 'ver-req-2',
        creatorId: 'creator-2',
        creatorName: 'سارة خالد',
        creatorUsername: 'sara_adventures',
        creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        feeEgp: 200,
        feeCoins: 4000,
        status: 'pending',
        channelUrl: 'https://mrjo1.vercel.app/@sara_adventures',
        category: 'Travel & Adventures',
        nationalIdMasked: '295********920',
        submittedAt: 'أمس، 08:15 م',
      },
    ];
  });

  const submitVerificationRequest = (reqData: Omit<VerificationRequest, 'id' | 'submittedAt' | 'status'>) => {
    const newReq: VerificationRequest = {
      ...reqData,
      id: `ver-req-${Date.now()}`,
      status: 'pending',
      submittedAt: 'الآن',
    };

    setVerificationRequests(prev => {
      const updated = [newReq, ...prev];
      try {
        localStorage.setItem(LOCAL_STORAGE_VERIFICATIONS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const approveVerificationRequest = (requestId: string) => {
    setVerificationRequests(prev => {
      const updated = prev.map(r => (r.id === requestId ? { ...r, status: 'approved' as const, reviewedAt: 'الآن' } : r));
      try {
        localStorage.setItem(LOCAL_STORAGE_VERIFICATIONS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const rejectVerificationRequest = (requestId: string, note?: string) => {
    setVerificationRequests(prev => {
      const updated = prev.map(r => (r.id === requestId ? { ...r, status: 'rejected' as const, reviewNote: note, reviewedAt: 'الآن' } : r));
      try {
        localStorage.setItem(LOCAL_STORAGE_VERIFICATIONS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const [userInterests, setUserInterestsState] = useState<VideoCategory[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_INTERESTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['tech', 'comedy', 'education', 'sports', 'art', 'animals', 'drama', 'news'];
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [autoAdvanceVideos, setAutoAdvanceVideosState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_AUTO_ADVANCE_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const setAutoAdvanceVideos = (enable: boolean) => {
    setAutoAdvanceVideosState(enable);
    try {
      localStorage.setItem(LOCAL_STORAGE_AUTO_ADVANCE_KEY, JSON.stringify(enable));
    } catch {}
  };

  // Persistent Real Wallet (1,000 coins = $5 USD => 100,000 coins = $500.00 USD)
  const [wallet, setWallet] = useState<UserWallet>(() => {
    const TARGET_COINS = 100000;
    const TARGET_FIAT = 500.00;

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_WALLET_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Valid non-negative balance preservation (fixes issue of reverting spent coins back to 100k)
        const coins =
          typeof parsed.coinsBalance === 'number' && !isNaN(parsed.coinsBalance) && parsed.coinsBalance >= 0
            ? parsed.coinsBalance
            : TARGET_COINS;
        const fiat = Number((coins * 0.005).toFixed(2));

        const validatedWallet: UserWallet = {
          ...parsed,
          coinsBalance: coins,
          fiatBalance: fiat,
          currency: 'USD',
          vodafoneCashNumber: parsed.vodafoneCashNumber || '01090718514',
          vodafoneCashMasked: parsed.vodafoneCashMasked || '010*****514',
          linkedIban: parsed.linkedIban || 'EG80 4000 0000 1234 5678 9012',
          transactions: Array.isArray(parsed.transactions) && parsed.transactions.length > 0 ? parsed.transactions : [
            {
              id: 'tx-init-100k',
              type: 'deposit',
              amountCoins: 100000,
              amountFiat: 500.00,
              currency: 'USD',
              status: 'completed',
              timestamp: 'الآن',
              note: 'رصيد مؤكد معتمد بمحفظة فودافون كاش (100,000 عملة = 500$ دولار / 25,250 ج.م)',
              paymentMethod: 'vodafone_cash',
              accountRefMasked: '010*****514',
              referenceNumber: 'VF-CASH-100K-90718514',
            },
          ],
        };
        try {
          localStorage.setItem(LOCAL_STORAGE_WALLET_KEY, JSON.stringify(validatedWallet));
        } catch {}
        return validatedWallet;
      }
    } catch {}

    const initialWallet: UserWallet = {
      coinsBalance: TARGET_COINS,
      fiatBalance: TARGET_FIAT,
      currency: 'USD',
      vodafoneCashNumber: '01090718514',
      vodafoneCashMasked: '010*****514',
      linkedIban: 'EG80 4000 0000 1234 5678 9012',
      transactions: [
        {
          id: 'tx-init-100k',
          type: 'deposit',
          amountCoins: 100000,
          amountFiat: 500.00,
          currency: 'USD',
          status: 'completed',
          timestamp: 'الآن',
          note: 'رصيد مؤكد معتمد بمحفظة فودافون كاش (100,000 عملة = 500$ دولار / 25,250 ج.م)',
          paymentMethod: 'vodafone_cash',
          accountRefMasked: '010*****514',
          referenceNumber: 'VF-CASH-100K-90718514',
        },
      ],
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_WALLET_KEY, JSON.stringify(initialWallet));
    } catch {}
    return initialWallet;
  });

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [activeGiftAnimation, setActiveGiftAnimation] = useState<GiftItem | null>(null);
  const [activeGiftModalVideo, setActiveGiftModalVideo] = useState<VideoItem | null>(null);

  // Check URL query parameters for ?v=<id> (secret private link)
  const [directVideoIdParam] = useState<string | null>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('v');
    } catch {
      return null;
    }
  });

  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_VIDEOS_KEY);
      if (saved) {
        const parsed: VideoItem[] = JSON.parse(saved);
        const map = new Map<string, VideoItem>();
        [...parsed, ...INITIAL_VIDEOS].forEach(v => map.set(v.id, v));
        return Array.from(map.values());
      }
    } catch {}
    return INITIAL_VIDEOS;
  });

  const [likedVideoIds, setLikedVideoIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_LIKES_KEY);
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set(['vid-tech-1']);
  });

  const [bookmarkedVideoIds, setBookmarkedVideoIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BOOKMARKS_KEY);
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set(['vid-edu-1']);
  });

  const [followingCreatorIds, setFollowingCreatorIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_FOLLOWS_KEY);
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set(['creator-4']);
  });

  const [comments, setComments] = useState<Record<string, CommentItem[]>>(INITIAL_COMMENTS);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<MainTab>('feed');
  const [feedType, setFeedType] = useState<FeedType>('foryou');
  const [isMuted, setIsMuted] = useState(true);
  const [activeCommentsModalVideoId, setActiveCommentsModalVideoId] = useState<string | null>(null);
  const [activeShareModalVideo, setActiveShareModalVideo] = useState<VideoItem | null>(null);
  const [activeSoundModal, setActiveSoundModal] = useState<Sound | null>(null);
  const [selectedSoundForUpload, setSelectedSoundForUpload] = useState<Sound | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Real-time persistent sync for wallet balance across tabs and windows
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('jo1_wallet_sync');
        channel.onmessage = (event) => {
          if (event.data && typeof event.data.coinsBalance === 'number') {
            setWallet(event.data);
          }
        };
      }
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_WALLET_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && typeof parsed.coinsBalance === 'number') {
            setWallet(parsed);
          }
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) channel.close();
    };
  }, []);

  // If a direct private link was opened (e.g. ?v=id), jump to that video
  useEffect(() => {
    if (directVideoIdParam) {
      const targetIdx = videos.findIndex(v => v.id === directVideoIdParam);
      if (targetIdx !== -1) {
        setCurrentVideoIndex(targetIdx);
        setActiveTab('feed');
      }
    }
  }, [directVideoIdParam, videos]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const setUserInterests = (interests: VideoCategory[]) => {
    setUserInterestsState(interests);
    try {
      localStorage.setItem(LOCAL_STORAGE_INTERESTS_KEY, JSON.stringify(interests));
    } catch {}
  };

  // Link and update personal wallet accounts (Vodafone Cash, IBAN)
  const updateWalletDetails = (updates: { vodafoneCashNumber?: string; linkedIban?: string }) => {
    setWallet(prev => {
      const num = updates.vodafoneCashNumber ? updates.vodafoneCashNumber.trim() : prev.vodafoneCashNumber;
      const masked = num.length >= 6 ? `${num.slice(0, 3)}*****${num.slice(-3)}` : num;
      const updated: UserWallet = {
        ...prev,
        vodafoneCashNumber: num,
        vodafoneCashMasked: masked,
        linkedIban: updates.linkedIban ? updates.linkedIban.trim() : prev.linkedIban,
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_WALLET_KEY, JSON.stringify(updated));
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('jo1_wallet_sync');
          bc.postMessage(updated);
          bc.close();
        }
      } catch {}
      return updated;
    });
  };

  // Fixed Deposit & Withdraw calculations (1,000 coins = $5 USD => 1 coin = $0.005)
  const depositCoins = (coins: number, fiatUsd: number, customNote?: string, referenceCode?: string) => {
    setWallet(prev => {
      const newCoins = prev.coinsBalance + coins;
      const newFiat = Number((newCoins * 0.005).toFixed(2));
      const refCode = referenceCode || `VF-DEP-${Math.floor(100000 + Math.random() * 900000)}`;

      const newTx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        type: 'deposit',
        amountCoins: coins,
        amountFiat: fiatUsd,
        currency: 'USD',
        status: 'completed',
        timestamp: 'الآن',
        note: customNote || `شحن فودافون كاش فوري (+${coins.toLocaleString()} عملة)`,
        paymentMethod: 'vodafone_cash',
        accountRefMasked: prev.vodafoneCashMasked,
        referenceNumber: refCode,
      };

      const updated: UserWallet = {
        ...prev,
        coinsBalance: newCoins,
        fiatBalance: newFiat,
        transactions: [newTx, ...prev.transactions],
      };

      try {
        localStorage.setItem(LOCAL_STORAGE_WALLET_KEY, JSON.stringify(updated));
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('jo1_wallet_sync');
          bc.postMessage(updated);
          bc.close();
        }
      } catch {}
      return updated;
    });
  };

  const withdrawCash = (fiatUsd: number, targetAccount: string, provider: string, customRef?: string) => {
    setWallet(prev => {
      const coinsToDeduct = Math.round(fiatUsd / 0.005);
      const newCoins = Math.max(0, prev.coinsBalance - coinsToDeduct);
      const newFiat = Number((newCoins * 0.005).toFixed(2));
      const refCode = customRef || `VF-WTH-${Math.floor(100000 + Math.random() * 900000)}`;
      const maskedTarget = targetAccount.length >= 6 ? `${targetAccount.slice(0, 3)}*****${targetAccount.slice(-3)}` : targetAccount;

      const newTx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        type: 'withdraw',
        amountCoins: coinsToDeduct,
        amountFiat: fiatUsd,
        currency: 'USD',
        status: 'completed',
        timestamp: 'الآن',
        note: `سحب نقدي $${fiatUsd} إلى ${provider} (${maskedTarget})`,
        paymentMethod: 'vodafone_cash',
        accountRefMasked: prev.vodafoneCashMasked,
        referenceNumber: refCode,
      };

      const updated: UserWallet = {
        ...prev,
        coinsBalance: newCoins,
        fiatBalance: newFiat,
        transactions: [newTx, ...prev.transactions],
      };

      try {
        localStorage.setItem(LOCAL_STORAGE_WALLET_KEY, JSON.stringify(updated));
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('jo1_wallet_sync');
          bc.postMessage(updated);
          bc.close();
        }
      } catch {}
      return updated;
    });
  };

  const setExactCoinsBalance = (coins: number) => {
    setWallet(prev => {
      const sanitizedCoins = Math.max(0, Math.round(coins));
      const fiat = Number((sanitizedCoins * 0.005).toFixed(2));
      const updated: UserWallet = {
        ...prev,
        coinsBalance: sanitizedCoins,
        fiatBalance: fiat,
        transactions: [
          {
            id: `tx-${Date.now()}`,
            type: 'deposit',
            amountCoins: sanitizedCoins,
            amountFiat: fiat,
            currency: 'USD',
            status: 'completed',
            timestamp: 'الآن',
            note: `تأكيد وتثبيت رصيد المحفظة إلى ${sanitizedCoins.toLocaleString()} عملة`,
            paymentMethod: 'vodafone_cash',
            accountRefMasked: prev.vodafoneCashMasked,
            referenceNumber: `VF-SYNC-${Date.now().toString().slice(-6)}`,
          },
          ...prev.transactions,
        ],
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_WALLET_KEY, JSON.stringify(updated));
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('jo1_wallet_sync');
          bc.postMessage(updated);
          bc.close();
        }
      } catch {}
      return updated;
    });
  };

  const resetTo100kCoins = () => {
    setExactCoinsBalance(100000);
  };

  // Safe gift sending with balance validation, transaction record, and full screen impact animation
  const triggerGiftAnimation = (gift: GiftItem, recipientCreator?: Creator): boolean => {
    if (wallet.coinsBalance < gift.costCoins) {
      return false;
    }

    const recipientName = recipientCreator ? recipientCreator.displayName : 'صانع المحتوى';

    setWallet(prev => {
      const newCoins = prev.coinsBalance - gift.costCoins;
      const updated: UserWallet = {
        ...prev,
        coinsBalance: newCoins,
        fiatBalance: Number((newCoins * 0.005).toFixed(2)),
        transactions: [
          {
            id: `tx-${Date.now()}`,
            type: 'gift_sent',
            amountCoins: gift.costCoins,
            amountFiat: Number((gift.costCoins * 0.005).toFixed(2)),
            currency: 'USD',
            status: 'completed',
            timestamp: 'الآن',
            note: `إطلاق مجسم: ${gift.nameAr} إلى ${recipientName}`,
            paymentMethod: 'vodafone_cash',
            accountRefMasked: prev.vodafoneCashMasked,
            referenceNumber: `VF-GIFT-${Date.now().toString().slice(-6)}`,
          },
          ...prev.transactions,
        ],
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_WALLET_KEY, JSON.stringify(updated));
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('jo1_wallet_sync');
          bc.postMessage(updated);
          bc.close();
        }
      } catch {}
      return updated;
    });

    // Notify backend RPC safely
    if (recipientCreator?.id) {
      sendGiftRpc({
        senderId: currentUser.id,
        recipientId: recipientCreator.id,
        giftId: gift.id,
        costCoins: gift.costCoins,
      }).catch(() => {});
    }

    setActiveGiftAnimation(gift);
    return true;
  };

  const clearGiftAnimation = () => {
    setActiveGiftAnimation(null);
  };

  const toggleLike = (videoId: string) => {
    setLikedVideoIds(prev => {
      const next = new Set(prev);
      const isLiked = next.has(videoId);
      if (isLiked) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_LIKES_KEY, JSON.stringify(Array.from(next)));
      } catch {}

      setVideos(videoList =>
        videoList.map(v => {
          if (v.id === videoId) {
            return {
              ...v,
              stats: {
                ...v.stats,
                likes: isLiked ? v.stats.likes - 1 : v.stats.likes + 1,
              },
            };
          }
          return v;
        })
      );
      return next;
    });
  };

  const toggleBookmark = (videoId: string) => {
    setBookmarkedVideoIds(prev => {
      const next = new Set(prev);
      const isBookmarked = next.has(videoId);
      if (isBookmarked) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_BOOKMARKS_KEY, JSON.stringify(Array.from(next)));
      } catch {}

      setVideos(videoList =>
        videoList.map(v => {
          if (v.id === videoId) {
            return {
              ...v,
              stats: {
                ...v.stats,
                bookmarks: isBookmarked ? v.stats.bookmarks - 1 : v.stats.bookmarks + 1,
              },
            };
          }
          return v;
        })
      );
      return next;
    });
  };

  const toggleFollow = (creatorId: string) => {
    setFollowingCreatorIds(prev => {
      const next = new Set(prev);
      if (next.has(creatorId)) {
        next.delete(creatorId);
      } else {
        next.add(creatorId);
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_FOLLOWS_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const addComment = (videoId: string, text: string) => {
    if (!text.trim()) return;
    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      videoId,
      author: {
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        supporterLevel: currentUser.supporterLevel,
      },
      text: text.trim(),
      likes: 0,
      isLiked: false,
      createdAt: language === 'ar' ? 'الآن' : 'Just now',
    };

    setComments(prev => {
      const list = prev[videoId] || [];
      return {
        ...prev,
        [videoId]: [newComment, ...list],
      };
    });

    setVideos(videoList =>
      videoList.map(v => {
        if (v.id === videoId) {
          return {
            ...v,
            stats: {
              ...v.stats,
              comments: v.stats.comments + 1,
            },
          };
        }
        return v;
      })
    );
  };

  const likeComment = (videoId: string, commentId: string) => {
    setComments(prev => {
      const list = prev[videoId] || [];
      return {
        ...prev,
        [videoId]: list.map(c => {
          if (c.id === commentId) {
            const isLiked = !c.isLiked;
            return {
              ...c,
              isLiked,
              likes: isLiked ? c.likes + 1 : c.likes - 1,
            };
          }
          return c;
        }),
      };
    });
  };

  // Video publishing with default public visibility, preserving creator ownership
  const publishVideo = (data: {
    videoUrl: string;
    caption: string;
    hashtags: string[];
    category: VideoCategory;
    music: Sound;
    posterUrl?: string;
    filterApplied?: string;
    privacy?: VideoPrivacy;
  }): VideoItem => {
    const videoId = `vid-user-${Date.now()}`;
    const newVideo: VideoItem = {
      id: videoId,
      videoUrl: data.videoUrl,
      posterUrl: data.posterUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
      caption: data.caption,
      hashtags: data.hashtags.length > 0 ? data.hashtags : ['#Jo1', '#فيديو_جديد'],
      category: data.category,
      author: currentUser,
      music: data.music || TRENDING_SOUNDS[0],
      stats: {
        likes: 1,
        comments: 0,
        bookmarks: 0,
        shares: 0,
        views: 1,
      },
      createdAt: language === 'ar' ? 'الآن' : 'Just now',
      filterApplied: data.filterApplied,
      privacy: data.privacy || 'public',
      secretToken: `sec_${Date.now()}`,
      isUserUploaded: true,
    };

    setVideos(prev => {
      const updated = [newVideo, ...prev.filter(v => v.id !== newVideo.id)];
      try {
        const userUploadedOnly = updated.filter(v => v.isUserUploaded);
        localStorage.setItem(LOCAL_STORAGE_VIDEOS_KEY, JSON.stringify(userUploadedOnly));
      } catch {}
      return updated;
    });

    setLikedVideoIds(prev => new Set(prev).add(newVideo.id));
    return newVideo;
  };

  const updateCurrentUser = (updates: Partial<Creator>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  // Filtered videos: Author can always see their own videos, plus public videos and direct shared links
  const filteredVideos = React.useMemo(() => {
    let list = videos.filter(v => {
      // If video is only_me, only the author can see it
      if (v.privacy === 'only_me') {
        return v.author.id === currentUser.id;
      }
      // If video is private_link, it's visible to the author OR if accessed via direct secret link (?v=id)
      if (v.privacy === 'private_link') {
        return directVideoIdParam === v.id || v.author.id === currentUser.id;
      }
      return true;
    });

    // Followed Creators feed
    if (feedType === 'following') {
      const followingList = list.filter(
        v => followingCreatorIds.has(v.author.id) || v.isUserUploaded
      );
      if (followingList.length > 0) {
        list = followingList;
      }
    } else {
      // Recommendation algorithm sorting
      list.sort((a, b) => {
        // If direct param matched, put at very top
        if (directVideoIdParam && a.id === directVideoIdParam) return -1;
        if (directVideoIdParam && b.id === directVideoIdParam) return 1;

        const aMatchesInterest = userInterests.includes(a.category);
        const bMatchesInterest = userInterests.includes(b.category);
        if (aMatchesInterest && !bMatchesInterest) return -1;
        if (!aMatchesInterest && bMatchesInterest) return 1;
        return 0;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        v =>
          v.caption.toLowerCase().includes(q) ||
          v.author.username.toLowerCase().includes(q) ||
          v.author.displayName.toLowerCase().includes(q) ||
          v.hashtags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    return list;
  }, [videos, feedType, followingCreatorIds, userInterests, searchQuery, directVideoIdParam, currentUser.id]);

  const translations: Record<string, { ar: string; en: string }> = {
    forYou: { ar: 'لك', en: 'For You' },
    following: { ar: 'أتابعه', en: 'Following' },
    live: { ar: 'بث مباشر', en: 'LIVE' },
    home: { ar: 'الرئيسية', en: 'Home' },
    discover: { ar: 'استكشف', en: 'Discover' },
    upload: { ar: 'إنشاء', en: 'Create' },
    inbox: { ar: 'الرسائل', en: 'Inbox' },
    profile: { ar: 'صفحتي', en: 'Profile' },
    comments: { ar: 'التعليقات', en: 'Comments' },
    addComment: { ar: 'أضف تعليقاً...', en: 'Add a comment...' },
    share: { ar: 'مشاركة', en: 'Share' },
    gift: { ar: 'إرسال هدية', en: 'Send Gift' },
    copyLink: { ar: 'نسخ الرابط', en: 'Copy Link' },
    linkCopied: { ar: 'تم نسخ الرابط!', en: 'Link copied!' },
    useSound: { ar: 'استخدم هذا الصوت', en: 'Use this sound' },
    publish: { ar: 'نشر الفيديو', en: 'Publish Video' },
    uploadVideoTitle: { ar: 'نشر فيديو بالمرشحات', en: 'Publish Video with Filters' },
    captionPlaceholder: { ar: 'اكتب وصفاً للفيديو وأضف وسوماً...', en: 'Write a caption with #hashtags...' },
    selectSound: { ar: 'اختيار الصوت / الموسيقى', en: 'Select Audio / Sound' },
    editProfile: { ar: 'تعديل الملف الشخصي', en: 'Edit Profile' },
    followers: { ar: 'متابع', en: 'Followers' },
    followingCount: { ar: 'يتابع', en: 'Following' },
    likesCount: { ar: 'إعجاب', en: 'Likes' },
    videosTab: { ar: 'فيديوهاتي', en: 'My Videos' },
    likedTab: { ar: 'المعجب بها', en: 'Liked' },
    savedTab: { ar: 'المفضلة', en: 'Saved' },
  };

  const t = (key: string): string => {
    const item = translations[key];
    if (!item) return key;
    return item[language] || item.ar;
  };

  return (
    <AppContext.Provider
      value={{
        videos,
        filteredVideos,
        currentVideoIndex,
        setCurrentVideoIndex,
        activeTab,
        setActiveTab,
        feedType,
        setFeedType,
        likedVideoIds,
        bookmarkedVideoIds,
        followingCreatorIds,
        toggleLike,
        toggleBookmark,
        toggleFollow,
        comments,
        addComment,
        likeComment,
        activeCommentsModalVideoId,
        setActiveCommentsModalVideoId,
        activeShareModalVideo,
        setActiveShareModalVideo,
        activeGiftModalVideo,
        setActiveGiftModalVideo,
        activeSoundModal,
        setActiveSoundModal,
        isMuted,
        toggleMute,
        currentUser,
        updateCurrentUser,
        publishVideo,
        searchQuery,
        setSearchQuery,
        language,
        toggleLanguage,
        selectedSoundForUpload,
        setSelectedSoundForUpload,
        userInterests,
        setUserInterests,
        isOnboardingOpen,
        setIsOnboardingOpen,
        wallet,
        isWalletModalOpen,
        setIsWalletModalOpen,
        updateWalletDetails,
        depositCoins,
        withdrawCash,
        setExactCoinsBalance,
        resetTo100kCoins,
        activeGiftAnimation,
        triggerGiftAnimation,
        clearGiftAnimation,
        autoAdvanceVideos,
        setAutoAdvanceVideos,
        directVideoIdParam,
        verificationRequests,
        submitVerificationRequest,
        approveVerificationRequest,
        rejectVerificationRequest,
        isVerificationModalOpen,
        setIsVerificationModalOpen,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
