import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IMPACT_GIFTS_50 } from '../data/giftsData';
import { GiftItem } from '../types';
import { X, Flame, Coins, Gem, AlertCircle, PlusCircle, Check } from 'lucide-react';

export const GiftModal: React.FC = () => {
  const {
    activeGiftModalVideo,
    setActiveGiftModalVideo,
    triggerGiftAnimation,
    wallet,
    setIsWalletModalOpen,
  } = useApp();

  const [selectedTier, setSelectedTier] = useState<string>('impact');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successGiftName, setSuccessGiftName] = useState<string | null>(null);

  if (!activeGiftModalVideo) return null;

  const displayedGifts =
    selectedTier === 'all'
      ? IMPACT_GIFTS_50
      : IMPACT_GIFTS_50.filter(g => g.tier === selectedTier);

  const handleSendGift = (gift: GiftItem) => {
    setErrorMessage(null);
    setSuccessGiftName(null);

    if (wallet.coinsBalance < gift.costCoins) {
      setErrorMessage(`رصيدك (${wallet.coinsBalance.toLocaleString()} عملة) لا يكفي لإرسال ${gift.nameAr}. اضغط "شحن" لإضافة رصيد.`);
      return;
    }

    const success = triggerGiftAnimation(gift, activeGiftModalVideo.author);
    if (success) {
      setSuccessGiftName(gift.nameAr);
      setTimeout(() => {
        setActiveGiftModalVideo(null);
      }, 900);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity p-0 sm:p-4">
      <div className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                <span>إرسال هدية إلى @{activeGiftModalVideo.author.username}</span>
              </h3>
              <p className="text-[10px] text-amber-300">اختر من بين 50 مجسماً ثلاثي الأبعاد مع مؤثرات حركية فائقة</p>
            </div>
          </div>
          <button
            onClick={() => setActiveGiftModalVideo(null)}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance & Recharge Header */}
        <div className="flex items-center justify-between py-2.5 px-3 bg-neutral-900/90 rounded-2xl border border-neutral-800 my-2.5">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-neutral-300">رصيدك المتاح:</span>
            <span className="text-sm font-black text-amber-300 font-mono">
              {wallet.coinsBalance.toLocaleString()} عملة
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              (${wallet.fiatBalance.toFixed(2)})
            </span>
          </div>

          <button
            onClick={() => {
              setActiveGiftModalVideo(null);
              setIsWalletModalOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-black text-xs font-black shadow-md active:scale-95 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>شحن المحفظة</span>
          </button>
        </div>

        {/* Error / Success Feedback */}
        {errorMessage && (
          <div className="mb-2 p-2.5 rounded-xl bg-red-950/80 border border-red-500 text-red-200 text-xs font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="truncate">{errorMessage}</span>
            </div>
            <button
              onClick={() => {
                setActiveGiftModalVideo(null);
                setIsWalletModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-red-800 text-white text-[11px] font-bold shrink-0 hover:bg-red-700"
            >
              شحن الآن
            </button>
          </div>
        )}

        {successGiftName && (
          <div className="mb-2 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>تم إطلاق {successGiftName} بنجاح! 🚀</span>
          </div>
        )}

        {/* Tier Tabs */}
        <div className="flex items-center gap-1.5 py-1.5 overflow-x-auto no-scrollbar text-xs font-bold">
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
            onClick={() => setSelectedTier('diamond')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              selectedTier === 'diamond'
                ? 'bg-cyan-600 text-white font-bold'
                : 'bg-neutral-900 text-neutral-400'
            }`}
          >
            💠 ماسي
          </button>

          <button
            onClick={() => setSelectedTier('gold')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              selectedTier === 'gold'
                ? 'bg-amber-500 text-black font-bold'
                : 'bg-neutral-900 text-neutral-400'
            }`}
          >
            🪙 ذهبي
          </button>

          <button
            onClick={() => setSelectedTier('all')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              selectedTier === 'all'
                ? 'bg-neutral-800 text-white'
                : 'bg-neutral-900 text-neutral-400'
            }`}
          >
            الكل (50)
          </button>
        </div>

        {/* 50 Gifts Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-4 sm:grid-cols-5 gap-2 py-2">
          {displayedGifts.map(g => {
            const canAfford = wallet.coinsBalance >= g.costCoins;
            return (
              <button
                key={g.id}
                onClick={() => handleSendGift(g)}
                className={`group flex flex-col items-center p-2 rounded-2xl border transition-all text-center relative ${
                  canAfford
                    ? 'bg-neutral-900 hover:bg-neutral-850 border-neutral-800 hover:border-amber-400/80 active:scale-95 shadow-md'
                    : 'bg-neutral-900/50 border-neutral-850 opacity-60 hover:opacity-100'
                }`}
              >
                <span className="text-3xl mb-1 group-hover:scale-125 transition-transform drop-shadow-md">
                  {g.emoji}
                </span>
                <span className="text-[10px] font-bold text-white line-clamp-1">
                  {g.nameAr.split(' ')[0]} {g.nameAr.split(' ')[1] || ''}
                </span>
                <span className="text-[9px] font-black text-amber-300 tabular-nums">
                  {g.costCoins.toLocaleString()} عملة
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
