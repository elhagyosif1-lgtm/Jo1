import React from 'react';
import { useApp } from '../context/AppContext';
import { MainTab } from '../types';
import { Home, Compass, Plus, MessageCircle, User } from 'lucide-react';

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab, t } = useApp();

  const handleTabClick = (tab: MainTab) => {
    setActiveTab(tab);
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-black/95 backdrop-blur-md border-t border-neutral-900 pb-safe select-none">
      <div className="max-w-lg mx-auto flex items-center justify-around h-14 px-2">
        {/* Tab 1: Home / Feed */}
        <button
          onClick={() => handleTabClick('feed')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] transition-colors ${
            activeTab === 'feed' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'feed' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] font-bold tracking-tight mt-1">{t('home')}</span>
        </button>

        {/* Tab 2: Discover */}
        <button
          onClick={() => handleTabClick('discover')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] transition-colors ${
            activeTab === 'discover' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Compass className={`w-5 h-5 ${activeTab === 'discover' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] font-bold tracking-tight mt-1">{t('discover')}</span>
        </button>

        {/* Tab 3: Famous TikTok Center Create / Plus Button */}
        <button
          onClick={() => handleTabClick('upload')}
          className="relative min-w-[50px] min-h-[48px] flex items-center justify-center group active:scale-90 transition-transform"
          aria-label={t('upload')}
        >
          <div className="relative w-12 h-8 rounded-xl flex items-center justify-center">
            <span className="absolute -left-1 top-0 bottom-0 w-8 bg-cyan-400 rounded-xl" />
            <span className="absolute -right-1 top-0 bottom-0 w-8 bg-rose-500 rounded-xl" />
            <span className="relative z-10 w-11 h-8 bg-white rounded-lg flex items-center justify-center text-black font-black shadow-md">
              <Plus className="w-5 h-5 stroke-[3.5]" />
            </span>
          </div>
        </button>

        {/* Tab 4: Encrypted Messages */}
        <button
          onClick={() => handleTabClick('messages')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] transition-colors relative ${
            activeTab === 'messages' ? 'text-rose-500' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <MessageCircle className={`w-5 h-5 ${activeTab === 'messages' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] font-bold tracking-tight mt-1">{t('inbox')}</span>
          <span className="absolute top-1.5 right-3 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-black" />
        </button>

        {/* Tab 5: Profile */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] transition-colors ${
            activeTab === 'profile' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] font-bold tracking-tight mt-1">{t('profile')}</span>
        </button>
      </div>
    </nav>
  );
};
