import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  VerificationRequest,
} from '../types';
import { INITIAL_VIDEOS, INITIAL_COMMENTS, TRENDING_SOUNDS } from '../data/initialVideos';
import { isSupabaseConfigured } from '../lib/supabase';
import { USD_TO_EGP_RATE } from '../services/vodafoneCashService';
import {
  getCurrentSession,
  onAuthStateChange,
  getWallet,
  getAppSettings,
  listMyRequests,
  requestDeposit,
  requestWithdrawal,
  type DepositRequestRecord,
  type WithdrawalRequestRecord,
} from '../services/supabaseService';
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
  walletStatus: WalletStatus;
  refreshWallet: () => Promise<void>;
  submitDeposit: (amountEgp: number, vfNumber: string, txRef: string) => Promise<string>;
  submitWithdrawal: (amountUsd: number, vfNumber: string) => Promise<{ id: string; diamonds: number }>;
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

type WalletStatus = 'signed_out' | 'loading' | 'ready' | 'error';

const EMPTY_WALLET: UserWallet = {
  coinsBalance: 0,
  diamondsBalance: 0,
  fiatBalance: 0,
  currency: 'USD',
  vodafoneCashNumber: '',
  vodafoneCashMasked: '',
  linkedIban: '',
  transactions: [],
};

const maskPhone = (value: string) => (value && value.length >= 6 ? `${value.slice(0, 3)}*****${value.slice(-3)}` : value);

function mapRequestsToTransactions(
  deposits: DepositRequestRecord[],
  withdrawals: WithdrawalRequestRecord[],
): WalletTransaction[] {
  const rows: Array<{ ts: number; tx: WalletTransaction }> = [];

  for (const d of deposits) {
    const status = d.status === 'approved' ? 'completed' : d.status === 'rejected' ? 'failed' : 'processing';
    const note =
      d.status === 'approved'
        ? 'تمت الموافقة وإضافة العملات إلى رصيدك'
        : d.status === 'rejected'
          ? `تم رفض طلب الإيداع${d.note ? ` — ${d.note}` : ''}`
          : 'طلب إيداع قيد المراجعة';
    rows.push({
      ts: new Date(d.created_at).getTime(),
      tx: {
        id: `dep-${d.id}`,
        type: 'deposit',
        amountCoins: Number(d.coins),
        amountFiat: Number((Number(d.amount_egp) / USD_TO_EGP_RATE).toFixed(2)),
        currency: 'USD',
        status,
        timestamp: new Date(d.created_at).toLocaleString('ar-EG'),
        note,
        paymentMethod: 'vodafone_cash',
        accountRefMasked: maskPhone(d.vf_number),
        referenceNumber: d.tx_ref,
      },
    });
  }

  for (const w of withdrawals) {
    const status = w.status === 'paid' ? 'completed' : w.status === 'rejected' ? 'failed' : 'processing';
    const note =
      w.status === 'paid'
        ? `تم تحويل المبلغ إلى ${maskPhone(w.vf_number)}${w.note ? ` — مرجع: ${w.note}` : ''}`
        : w.status === 'rejected'
          ? `تم رفض طلب السحب وإرجاع الرصيد${w.note ? ` — ${w.note}` : ''}`
          : 'طلب سحب قيد المراجعة (الرصيد محجوز)';
    rows.push({
      ts: new Date(w.created_at).getTime(),
      tx: {
        id: `wd-${w.id}`,
        type: 'withdraw',
        amountCoins: Number(w.diamonds),
        amountFiat: Number((Number(w.amount_egp) / USD_TO_EGP_RATE).toFixed(2)),
        currency: 'USD',
        status,
        timestamp: new Date(w.created_at).toLocaleString('ar-EG'),
        note,
        paymentMethod: 'vodafone_cash',
        accountRefMasked: maskPhone(w.vf_number),
        referenceNumber: w.id.slice(0, 8),
      },
    });
  }

  return rows.sort((a, b) => b.ts - a.ts).map(r => r.tx);
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const [wallet, setWallet] = useState<UserWallet>(EMPTY_WALLET);
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('loading');

  const refreshWallet = useCallback(async (): Promise<void> => {
    if (!isSupabaseConfigured) {
      setWallet(EMPTY_WALLET);
      setWalletStatus('signed_out');
      return;
    }

    try {
      const session = await getCurrentSession();
      if (!session) {
        setWallet(EMPTY_WALLET);
        setWalletStatus('signed_out');
        return;
      }

      const [row, settings, requests] = await Promise.all([
        getWallet(session.user.id),
        getAppSettings(),
        listMyRequests(),
      ]);

      const diamondsPerEgp = settings && settings.diamonds_per_egp > 0 ? settings.diamonds_per_egp : 10;
      const diamonds = Number(row?.diamonds ?? 0);

      setWallet({
        ...EMPTY_WALLET,
        coinsBalance: Number(row?.coins ?? 0),
        diamondsBalance: diamonds,
        fiatBalance: Number((diamonds / diamondsPerEgp / USD_TO_EGP_RATE).toFixed(2)),
        vodafoneCashNumber: row?.phone || '',
        vodafoneCashMasked: row?.phone ? maskPhone(row.phone) : '',
        transactions: mapRequestsToTransactions(requests.deposits, requests.withdrawals),
      });
      setWalletStatus('ready');
    } catch {
      setWallet(EMPTY_WALLET);
      setWalletStatus('error');
    }
  }, []);

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [activeGiftAnimation, setActiveGiftAnimation] = useState<GiftItem | null>(null);
  const [activeGiftModalVideo, setActiveGiftModalVideo] = useState<VideoItem | null>(null);

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

  useEffect(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_WALLET_KEY);
    } catch {}

    void refreshWallet();

    if (!isSupabaseConfigured) return;

    const { data } = onAuthStateChange(() => {
      setTimeout(() => {
        void refreshWallet();
      }, 0);
    });
    return () => data.subscription.unsubscribe();
  }, [refreshWallet]);

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
      return updated;
    });
  };

  const submitDeposit = async (amountEgp: number, vfNumber: string, txRef: string): Promise<string> => {
    const id = await requestDeposit(amountEgp, vfNumber, txRef);
    await refreshWallet();
    return id;
  };

  const submitWithdrawal = async (
    amountUsd: number,
    vfNumber: string,
  ): Promise<{ id: string; diamonds: number }> => {
    const settings = await getAppSettings();
    if (!settings || !(settings.diamonds_per_egp > 0)) {
      throw new Error('INVALID_WITHDRAWAL_SETTINGS');
    }

    const diamonds = Math.round(amountUsd * USD_TO_EGP_RATE * settings.diamonds_per_egp);
    const id = await requestWithdrawal(diamonds, vfNumber);
    await refreshWallet();
    return { id, diamonds };
  };

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
      return updated;
    });

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
        }),
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
        }),
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
      }),
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

  const filteredVideos = React.useMemo(() => {
    let list = videos.filter(v => {
      if (v.privacy === 'only_me') {
        return v.author.id === currentUser.id;
      }
      if (v.privacy === 'private_link') {
        return directVideoIdParam === v.id || v.author.id === currentUser.id;
      }
      return true;
    });

    if (feedType === 'following') {
      const followingList = list.filter(v => followingCreatorIds.has(v.author.id) || v.isUserUploaded);
      if (followingList.length > 0) {
        list = followingList;
      }
    } else {
      list.sort((a, b) => {
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
          v.hashtags.some(tag => tag.toLowerCase().includes(q)),
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
        walletStatus,
        refreshWallet,
        submitDeposit,
        submitWithdrawal,
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

export type WalletStatus = 'signed_out' | 'loading' | 'ready' | 'error';
