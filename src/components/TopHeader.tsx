import React from 'react';
import { useApp } from '../context/AppContext';
import { Radio, Search, Volume2, VolumeX, Globe } from 'lucide-react';
import { AuthModal } from './AuthModal';

export const TopHeader: React.FC = () => {
  const {
    feedType,
    setFeedType,
    isMuted,
    toggleMute,
    language,
    toggleLanguage,
    setActiveTab,
    t,
  } = useApp();

  return (
    <header className="absolute top-0 left-0 right-0 z-30 pt-safe px-4 py-3 flex items-center justify-between pointer-events-none select-none">
      {/* Left zone: Live Mode & Sound Toggle */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setActiveTab('live')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-semibold text-rose-400 hover:bg-black/60 active:scale-95 transition-transform"
          title={t('live')}
        >
          <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
          <span className="hidden sm:inline">{t('live')}</span>
        </button>

        <button
          onClick={toggleMute}
          className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 active:scale-95 transition-transform"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>

        <button
          onClick={() => setActiveTab('backstage')}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-600/20 border border-amber-400/40 text-amber-300 text-xs font-bold hover:bg-black/60 active:scale-95 transition-transform shadow-md"
          title="لوحة تحكم المنصة (الباك ستيدج)"
        >
          <span className="font-black text-[10px]">الباك ستيدج</span>
        </button>
      </div>

      {/* Middle zone: Feed Type Tabs (Following | For You) */}
      <div className="flex items-center gap-4 text-base font-bold pointer-events-auto">
        <button
          onClick={() => setFeedType('following')}
          className={`relative px-1 py-1 transition-all duration-200 ${
            feedType === 'following'
              ? 'text-white text-base font-extrabold scale-105'
              : 'text-white/60 hover:text-white/90 text-sm font-semibold'
          }`}
        >
          {t('following')}
          {feedType === 'following' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-1 bg-white rounded-full shadow-sm" />
          )}
        </button>

        <span className="text-white/20 select-none">|</span>

        <button
          onClick={() => setFeedType('foryou')}
          className={`relative px-1 py-1 transition-all duration-200 ${
            feedType === 'foryou'
              ? 'text-white text-base font-extrabold scale-105'
              : 'text-white/60 hover:text-white/90 text-sm font-semibold'
          }`}
        >
          {t('forYou')}
          {feedType === 'foryou' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-1 bg-rose-500 rounded-full shadow-sm" />
          )}
        </button>
      </div>

      {/* Right zone: Search, account & language toggle */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <AuthModal />
        <button
          onClick={() => setActiveTab('discover')}
          className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 active:scale-95 transition-transform"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-semibold text-white/90 hover:bg-black/60 active:scale-95 transition-transform"
          title="Change language / تغيير اللغة"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
        </button>
      </div>
    </header>
  );
};
