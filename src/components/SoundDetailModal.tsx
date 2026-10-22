import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Music, Play, Plus, Film } from 'lucide-react';

export const SoundDetailModal: React.FC = () => {
  const {
    activeSoundModal,
    setActiveSoundModal,
    setSelectedSoundForUpload,
    setActiveTab,
    videos,
    t,
  } = useApp();

  if (!activeSoundModal) return null;

  const soundVideos = videos.filter(
    v => v.music.id === activeSoundModal.id || v.music.title === activeSoundModal.title
  );

  const handleUseSound = () => {
    setSelectedSoundForUpload(activeSoundModal);
    setActiveSoundModal(null);
    setActiveTab('upload');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="absolute inset-0"
        onClick={() => setActiveSoundModal(null)}
      />

      <div className="relative z-10 w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl select-none max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-rose-500" />
            <h3 className="font-extrabold text-white text-base">تفاصيل الصوت</h3>
          </div>
          <button
            onClick={() => setActiveSoundModal(null)}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sound Header Info */}
        <div className="flex items-center gap-4 py-4">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-neutral-700 shadow-xl group">
            <img
              src={activeSoundModal.coverUrl}
              alt={activeSoundModal.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-8 h-8 fill-white text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-white text-lg truncate">
              {activeSoundModal.title}
            </h4>
            <p className="text-sm text-neutral-400 mb-2 truncate">
              {activeSoundModal.author}
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-500 font-semibold">
              <Film className="w-3.5 h-3.5 text-rose-400" />
              <span>
                {activeSoundModal.usesCount
                  ? activeSoundModal.usesCount.toLocaleString()
                  : soundVideos.length}{' '}
                فيديو استخدم هذا الصوت
              </span>
            </div>
          </div>
        </div>

        {/* CTA: Use this Sound */}
        <button
          onClick={handleUseSound}
          className="w-full py-3 mb-5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t('useSound')}</span>
        </button>

        {/* Videos Using This Sound */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <h5 className="font-bold text-neutral-300 text-sm mb-3">فيديوهات مميزة بهذا الصوت</h5>
          <div className="grid grid-cols-3 gap-2">
            {(soundVideos.length > 0 ? soundVideos : videos.slice(0, 6)).map(v => (
              <div
                key={v.id}
                onClick={() => {
                  setActiveSoundModal(null);
                  setActiveTab('feed');
                }}
                className="relative aspect-[9/16] rounded-xl overflow-hidden bg-neutral-800 cursor-pointer group"
              >
                <img
                  src={v.posterUrl || v.author.avatarUrl}
                  alt={v.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                  <span className="text-[10px] font-bold text-white truncate">
                    ▶ {(v.stats.views / 1000).toFixed(0)}K
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
