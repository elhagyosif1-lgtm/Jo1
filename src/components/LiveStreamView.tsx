import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { IMPACT_GIFTS_50 } from '../data/giftsData';
import { GiftItem } from '../types';
import {
  X,
  Radio,
  Send,
  Users,
  Sparkles,
  Gift,
  Tv,
  Coins,
  Flame,
  ChevronDown
} from 'lucide-react';

interface LiveMessage {
  id: string;
  user: string;
  avatar: string;
  text: string;
  isGift?: boolean;
}

export const LiveStreamView: React.FC = () => {
  const {
    setActiveTab,
    triggerGiftAnimation,
    wallet,
    setIsWalletModalOpen,
    currentUser,
  } = useApp();

  const [messages, setMessages] = useState<LiveMessage[]>([
    {
      id: 'm1',
      user: 'سارة خالد',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      text: 'منور البث يا بطل! 🚀',
    },
    {
      id: 'm2',
      user: 'أحمد التميمي',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      text: 'ما شاء الله البث عالي الدقة جداً 👏',
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [viewerCount, setViewerCount] = useState(18920);
  const [showGiftTray, setShowGiftTray] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('impact');
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sampleUsers = [
      { name: 'محمد المصري', msg: 'أهلاً بالجميع في Jo1 Live 🚀' },
      { name: 'هدى كريم', msg: 'الصوت والصورة روعة! 💯' },
      { name: 'فهد الشمري', msg: 'أقوى بث اليوم 🔥' },
      { name: 'ليان', msg: 'أرسلت هدية أثر أسطوري 💎' },
      { name: 'طارق', msg: 'البث مشفر وسريع جداً' },
    ];

    const interval = setInterval(() => {
      const random = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      setMessages(prev => [
        ...prev.slice(-30),
        {
          id: `m-${Date.now()}`,
          user: random.name,
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80`,
          text: random.msg,
        },
      ]);
      setViewerCount(c => c + Math.floor(Math.random() * 7) - 3);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    setMessages(prev => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        user: 'أنت (الداعم 52)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        text: inputVal.trim(),
      },
    ]);
    setInputVal('');
  };

  const handleFireGift = (gift: GiftItem) => {
    const success = triggerGiftAnimation(gift);
    if (!success) {
      alert(`رصيدك المتاح (${wallet.coinsBalance.toLocaleString()} عملة) لا يكفي لإرسال ${gift.nameAr}. اضغط على المحفظة لشحن الرصيد.`);
      setIsWalletModalOpen(true);
      return;
    }
    setMessages(prev => [
      ...prev,
      {
        id: `gift-${Date.now()}`,
        user: `${currentUser.displayName} [LVL ${currentUser.supporterLevel || 52}]`,
        avatar: currentUser.avatarUrl,
        text: `أطلق هدية أثر: ${gift.nameAr} (${gift.costCoins.toLocaleString()} عملة)! 💥`,
        isGift: true,
      },
    ]);
    setShowGiftTray(false);
  };

  const displayedGifts =
    selectedTier === 'all'
      ? IMPACT_GIFTS_50
      : IMPACT_GIFTS_50.filter(g => g.tier === selectedTier);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {/* Background Live Stream Video */}
      <video
        src="https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-fashion-model-in-the-city-43285-large.mp4"
        playsInline
        loop
        autoPlay
        muted
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 pointer-events-none" />

      {/* Top Live Bar */}
      <div className="absolute top-0 inset-x-0 pt-safe px-4 py-3 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2 p-1 pl-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
          <img
            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80"
            alt="Streamer"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <p className="text-xs font-bold text-white">ليلى فاشن لايف 🔴</p>
            <p className="text-[10px] text-neutral-400">Jo1 LIVE Host</p>
          </div>
          <button className="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold mr-1 active:scale-95 transition-transform">
            متابعة
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch to OBS Studio Mode Button */}
          <button
            onClick={() => setActiveTab('obs_studio')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-extrabold hover:bg-cyan-900 active:scale-95 transition-all shadow-md"
            title="فتح لوحة تحكم OBS Studio"
          >
            <Tv className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">ستوديو OBS</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600/90 text-white text-xs font-extrabold shadow-lg">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>LIVE</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-bold border border-white/10">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="tabular-nums">{viewerCount.toLocaleString()}</span>
          </div>

          <button
            onClick={() => setActiveTab('feed')}
            className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="absolute bottom-28 left-4 right-16 z-20 max-w-sm">
        <div
          ref={chatScrollRef}
          className="h-56 overflow-y-auto no-scrollbar space-y-2 flex flex-col justify-end"
        >
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex items-start gap-2 p-2 rounded-xl backdrop-blur-md max-w-fit ${
                m.isGift
                  ? 'bg-gradient-to-r from-amber-600/90 to-rose-600/90 text-white border border-amber-300/40 shadow-lg'
                  : 'bg-black/50 text-white/90 border border-white/10'
              }`}
            >
              <img
                src={m.avatar}
                alt={m.user}
                className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5"
              />
              <div className="text-xs">
                <span className="font-extrabold text-cyan-300 ml-1.5">{m.user}:</span>
                <span className="font-medium">{m.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Rail: Quick Gift Button */}
      <div className="absolute right-3 bottom-28 z-20 flex flex-col items-center gap-3">
        <button
          onClick={() => setShowGiftTray(!showGiftTray)}
          className="p-3 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-cyan-400 text-white shadow-[0_0_25px_rgba(245,158,11,0.6)] active:scale-95 transition-all animate-bounce"
          title="افتح قائمة 50 هدية (اترك أثر)"
        >
          <Gift className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          onClick={() => setIsWalletModalOpen(true)}
          className="flex flex-col items-center p-2 rounded-2xl bg-black/60 backdrop-blur-md border border-amber-400/40 text-amber-300 hover:scale-105 active:scale-95 transition-all shadow-md"
          title="شحن محفظة Jo1"
        >
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-[9px] font-black tabular-nums mt-0.5">
            {(wallet.coinsBalance / 1000).toFixed(0)}K
          </span>
        </button>
      </div>

      {/* 50 Gifts Bottom Sheet (اترك أثر) */}
      {showGiftTray && (
        <div className="absolute bottom-0 inset-x-0 z-40 bg-neutral-950/95 backdrop-blur-xl border-t border-amber-500/30 rounded-t-3xl p-4 flex flex-col max-h-[65vh] shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-black text-sm text-white">هدايا (اترك أثر) الأسطورية - 50 هدية</h3>
                <p className="text-[10px] text-amber-300">تأثيرات حركية خرافية تتجاوز الأسد بكثير</p>
              </div>
            </div>
            <button
              onClick={() => setShowGiftTray(false)}
              className="p-1 rounded-full text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tier Tabs */}
          <div className="flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar text-xs font-bold">
            <button
              onClick={() => setSelectedTier('impact')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                selectedTier === 'impact'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-black font-black shadow-md'
                  : 'bg-neutral-900 text-neutral-400'
              }`}
            >
              💥 اترك أثر (تتجاوز الأسد)
            </button>

            <button
              onClick={() => setSelectedTier('legendary')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                selectedTier === 'legendary'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-neutral-900 text-neutral-400'
              }`}
            >
              👑 أسطوري
            </button>

            <button
              onClick={() => setSelectedTier('royal')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                selectedTier === 'royal'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-neutral-900 text-neutral-400'
              }`}
            >
              💎 ملكي
            </button>

            <button
              onClick={() => setSelectedTier('all')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                selectedTier === 'all'
                  ? 'bg-neutral-800 text-white'
                  : 'bg-neutral-900 text-neutral-400'
              }`}
            >
              جميع الـ 50 هدية
            </button>
          </div>

          {/* 50 Gifts Grid */}
          <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-4 sm:grid-cols-5 gap-2 py-2">
            {displayedGifts.map(g => (
              <button
                key={g.id}
                onClick={() => handleFireGift(g)}
                className="group flex flex-col items-center p-2 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-400/80 active:scale-95 transition-all shadow-md text-center"
              >
                <span className="text-3xl mb-1 group-hover:scale-125 transition-transform">
                  {g.emoji}
                </span>
                <span className="text-[10px] font-bold text-white line-clamp-1">
                  {g.nameAr}
                </span>
                <span className="text-[9px] font-black text-amber-300 tabular-nums">
                  {g.costCoins.toLocaleString()} عملة
                </span>
              </button>
            ))}
          </div>

          {/* Footer with Wallet Info & Recharge button */}
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-neutral-300">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>رصيدك: <b className="text-amber-400 font-bold tabular-nums">{wallet.coinsBalance.toLocaleString()}</b> عملة</span>
            </div>
            <button
              onClick={() => {
                setShowGiftTray(false);
                setIsWalletModalOpen(true);
              }}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-black shadow-md transition-colors"
            >
              شحن العملات
            </button>
          </div>
        </div>
      )}

      {/* Live Chat Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="absolute bottom-0 inset-x-0 p-3 bg-black/80 backdrop-blur-md border-t border-white/10 z-30 flex items-center gap-2 pb-safe"
      >
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="أرسل رسالة للبث المباشر..."
          className="flex-1 bg-white/10 text-white placeholder-white/40 text-xs rounded-full px-4 py-2.5 outline-none focus:ring-1 focus:ring-rose-500"
        />
        <button
          type="submit"
          disabled={!inputVal.trim()}
          className="p-2.5 rounded-full bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
