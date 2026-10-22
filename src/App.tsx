import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopHeader } from './components/TopHeader';
import { VideoFeed } from './components/VideoFeed';
import { CommentsModal } from './components/CommentsModal';
import { ShareModal } from './components/ShareModal';
import { SoundDetailModal } from './components/SoundDetailModal';
import { UploadModal } from './components/UploadModal';
import { DiscoverView } from './components/DiscoverView';
import { ProfileView } from './components/ProfileView';
import { LiveStreamView } from './components/LiveStreamView';
import { LiveStudioOBS } from './components/LiveStudioOBS';
import { MessagesView } from './components/MessagesView';
import { BottomNavBar } from './components/BottomNavBar';
import { GiftAnimationOverlay } from './components/GiftAnimationOverlay';
import { WalletModal } from './components/WalletModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AdminBackstageModal } from './components/AdminBackstageModal';
import {
  Compass,
  TrendingUp,
  UploadCloud,
  Sparkles,
  Users,
  Film,
  Music,
  Wallet,
  ShieldCheck,
  Crown,
  Tv,
  MessageCircle,
  SlidersHorizontal,
  Flame,
  Gem,
  LayoutDashboard
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    followingCreatorIds,
    toggleFollow,
    wallet,
    isWalletModalOpen,
    setIsWalletModalOpen,
    isOnboardingOpen,
    setIsOnboardingOpen,
    activeGiftAnimation,
    clearGiftAnimation,
    currentUser,
    setSearchQuery,
  } = useApp();

  const suggestedCreators = [
    {
      id: 'creator-4',
      username: 'tech_kareem',
      displayName: 'كريم تك ⚡',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      followers: '670K',
      level: 52,
    },
    {
      id: 'creator-2',
      username: 'sara_adventures',
      displayName: 'سارة المغامرة 🏄‍♀️',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      followers: '512K',
      level: 50,
    },
    {
      id: 'creator-1',
      username: 'youssef_films',
      displayName: 'يوسف السينمائي 🎥',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      followers: '384K',
      level: 52,
    },
  ];

  const popularTags = [
    { tag: '#ترند_اليوم', count: '2.4B' },
    { tag: '#Jo1_TikTok', count: '1.9B' },
    { tag: '#مرشحات_سينمائية', count: '1.2B' },
    { tag: '#اترك_أثر_الأسطوري', count: '940M' },
    { tag: '#تكنولوجيا_2026', count: '620M' },
  ];

  return (
    <div className="relative w-full h-screen h-[100dvh] bg-black text-white flex justify-center overflow-hidden font-sans">
      {/* Desktop Left Sidebar (Navigation, Wallet & Discovery) */}
      <aside className="hidden xl:flex flex-col w-72 h-full border-l border-neutral-900 bg-neutral-950 p-5 select-none overflow-y-auto no-scrollbar">
        {/* Brand Lockup */}
        <div
          onClick={() => setActiveTab('feed')}
          className="flex items-center gap-3 cursor-pointer mb-5 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-cyan-400 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
              <span className="font-black text-lg text-white tracking-tighter">Jo1</span>
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white leading-none">منصة Jo1</h1>
            <p className="text-[11px] text-neutral-400 font-semibold mt-1">TikTok Video Studio</p>
          </div>
        </div>

        {/* User Level 52 Quick Card in Sidebar */}
        <div
          onClick={() => setActiveTab('profile')}
          className="p-3 mb-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-cyan-500/15 border border-amber-400/30 flex items-center gap-3 cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="relative">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400"
            />
            <span className="absolute -bottom-1 -right-1 px-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-600 text-[9px] font-black text-white">
              52
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-white truncate">{currentUser.displayName}</span>
              <Crown className="w-3 h-3 text-amber-400 shrink-0" />
            </div>
            <span className="text-[10px] text-amber-300 font-bold block truncate">
              داعم إمبراطوري أسطوري
            </span>
          </div>
        </div>

        {/* Primary Desktop Nav Links */}
        <div className="space-y-1 mb-5 border-b border-neutral-900 pb-4">
          <button
            onClick={() => setActiveTab('feed')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'feed'
                ? 'bg-rose-950/40 text-rose-500 border border-rose-900/40'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>خلاصة الفيديوهات (Feed)</span>
          </button>

          <button
            onClick={() => setActiveTab('discover')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'discover'
                ? 'bg-rose-950/40 text-rose-500 border border-rose-900/40'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>استكشف والبحث</span>
          </button>

          <button
            onClick={() => setActiveTab('live')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'live'
                ? 'bg-rose-950/40 text-rose-500 border border-rose-900/40'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>البث المباشر (LIVE)</span>
          </button>

          <button
            onClick={() => setActiveTab('obs_studio')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'obs_studio'
                ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-800/40'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Tv className="w-4 h-4 text-cyan-400" />
            <span>ستوديو OBS المباشر</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'messages'
                ? 'bg-rose-950/40 text-rose-500 border border-rose-900/40'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>المحادثات المشفرة</span>
          </button>

          <button
            onClick={() => setActiveTab('backstage')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'backstage'
                ? 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-amber-400" />
            <span>الباك ستيدج (لوحة التحكم)</span>
          </button>
        </div>

        {/* Quick Upload CTA */}
        <button
          onClick={() => setActiveTab('upload')}
          className="w-full py-3 mb-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 active:scale-95 transition-all"
        >
          <UploadCloud className="w-4 h-4 stroke-[2.5]" />
          <span>نشر فيديو بالمرشحات</span>
        </button>

        {/* Wallet CTA Button */}
        <button
          onClick={() => setIsWalletModalOpen(true)}
          className="w-full py-2.5 mb-5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center justify-between px-3 shadow-md active:scale-95 transition-all"
        >
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-amber-400" />
            <span>محفظتي الرسمية</span>
          </div>
          <span className="font-mono font-black">{wallet.coinsBalance.toLocaleString()} عملة</span>
        </button>

        {/* Accounts to Follow */}
        <div className="mb-5">
          <h3 className="text-xs font-bold text-neutral-500 mb-2.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>كبار صناع المحتوى والداعمين</span>
          </h3>
          <div className="space-y-2.5">
            {suggestedCreators.map(creator => {
              const isFollowing = followingCreatorIds.has(creator.id);
              return (
                <div key={creator.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={creator.avatar}
                      alt={creator.displayName}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-bold text-white truncate">
                          {creator.displayName}
                        </p>
                        {creator.level && (
                          <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[8px] font-black">
                            {creator.level}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-500 truncate">
                        @{creator.username}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFollow(creator.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      isFollowing
                        ? 'bg-neutral-800 text-neutral-400'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    {isFollowing ? 'متابَع' : 'متابعة'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Algorithm Settings Shortcut */}
        <button
          onClick={() => setIsOnboardingOpen(true)}
          className="mt-auto py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-bold flex items-center justify-between border border-neutral-800"
        >
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-rose-500" />
            <span>تخصيص اهتمامات الخوارزمية</span>
          </span>
          <span className="text-[10px] text-rose-400">تعديل ◀</span>
        </button>
      </aside>

      {/* Center Phone / Responsive Viewport */}
      <main
        className={`relative h-full flex flex-col bg-black overflow-hidden shadow-2xl transition-all duration-300 ${
          activeTab === 'backstage'
            ? 'w-full flex-1 max-w-none'
            : 'w-full max-w-md md:max-w-lg lg:max-w-xl'
        }`}
      >
        {/* Render Active View */}
        {activeTab === 'feed' && (
          <div className="relative w-full h-full">
            <TopHeader />
            <VideoFeed />
          </div>
        )}

        {activeTab === 'discover' && <DiscoverView />}

        {activeTab === 'upload' && <UploadModal />}

        {activeTab === 'live' && <LiveStreamView />}

        {activeTab === 'obs_studio' && <LiveStudioOBS />}

        {activeTab === 'messages' && <MessagesView />}

        {activeTab === 'profile' && <ProfileView />}

        {activeTab === 'backstage' && <AdminBackstageModal />}

        {/* Bottom Navigation Bar */}
        {activeTab !== 'live' && activeTab !== 'obs_studio' && activeTab !== 'backstage' && (
          <BottomNavBar />
        )}
      </main>

      {/* Desktop Right Panel (50 Gifts & Support Impact Deck) */}
      <aside className="hidden 2xl:flex flex-col w-80 h-full border-r border-neutral-900 bg-neutral-950 p-5 select-none overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-amber-400">
          <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
          <span>منظومة هدايا (اترك أثر) - 50 هدية</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900 to-amber-950/40 border border-amber-500/30 space-y-2 mb-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-300">أقوى من حركة الأسد بمراحل</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-[11px] text-neutral-300 leading-relaxed">
            تم تطوير 50 هدية حركية واقعية وسينمائية تشمل نيزك الألماس الكوني، طائر الفينيق الناري، وسوبرنوفا المجرات مع اهتزاز الشاشة ومؤثرات صوتية أوركسترالية!
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">☄️</span>
              <div>
                <p className="font-bold text-white">نيزك الألماس الكوني</p>
                <span className="text-[10px] text-amber-400 font-black">100,000 عملة</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black">
              أعلى أثر
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">🦅</span>
              <div>
                <p className="font-bold text-white">طائر الفينيق الناري</p>
                <span className="text-[10px] text-amber-400 font-black">50,000 عملة</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black">
              أسطوري
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏙️</span>
              <div>
                <p className="font-bold text-white">برج خليفة وليزر دبي</p>
                <span className="text-[10px] text-amber-400 font-black">45,000 عملة</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black">
              عالمي
            </span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-neutral-900">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>قواعد البيانات والمحفظة مؤكدة ودائمة</span>
          </div>
          <p className="text-[10px] text-neutral-500 leading-relaxed">
            الربط الحقيقي للمحفظة مع إمكانية السحب البنكي المباشر وتأكيد استلام الأرباح.
          </p>
        </div>
      </aside>

      {/* Full-Screen Ultra Gift Animation Overlay */}
      <GiftAnimationOverlay
        gift={activeGiftAnimation}
        senderName={currentUser.displayName}
        senderLevel={currentUser.supporterLevel || 52}
        onAnimationEnd={clearGiftAnimation}
      />

      {/* Global Interactive Modals */}
      <CommentsModal />
      <ShareModal />
      <SoundDetailModal />
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
