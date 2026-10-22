import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, X, TrendingUp, Music, Play, Hash } from 'lucide-react';

export const DiscoverView: React.FC = () => {
  const {
    videos,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    setCurrentVideoIndex,
    setActiveSoundModal,
  } = useApp();

  const trendingHashtags = [
    { tag: '#ترند_اليوم', views: '2.4B' },
    { tag: '#Jo1', views: '1.8B' },
    { tag: '#إبداع_عربي', views: '980M' },
    { tag: '#تقنية_2026', views: '450M' },
    { tag: '#مغامرات', views: '670M' },
    { tag: '#موضة_وأناقة', views: '320M' },
  ];

  const handleSelectVideo = (index: number) => {
    setCurrentVideoIndex(index);
    setActiveTab('feed');
  };

  const filtered = videos.filter(v => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.caption.toLowerCase().includes(q) ||
      v.author.displayName.toLowerCase().includes(q) ||
      v.author.username.toLowerCase().includes(q) ||
      v.hashtags.some(t => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full h-full bg-black text-white overflow-y-auto no-scrollbar pt-safe pb-24 px-4 sm:px-6">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-md py-3">
        <div className="relative flex items-center">
          <Search className="absolute right-4 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث عن فيديوهات، وسوم، صناع محتوى أو أصوات..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-full py-2.5 pr-11 pl-10 text-sm text-white placeholder-neutral-500 outline-none focus:ring-1 focus:ring-rose-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 p-1 rounded-full text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Trending Hashtags Horizontal Strip */}
      <div className="my-4">
        <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-neutral-400">
          <TrendingUp className="w-4 h-4 text-rose-500" />
          <span>الوسوم الأكثر رواجاً اليوم</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {trendingHashtags.map(item => (
            <button
              key={item.tag}
              onClick={() => setSearchQuery(item.tag)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold whitespace-nowrap active:scale-95 transition-transform"
            >
              <Hash className="w-3.5 h-3.5 text-rose-500" />
              <span>{item.tag}</span>
              <span className="text-[10px] text-neutral-500">({item.views})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Discover Video Grid */}
      <div className="my-6">
        <h3 className="font-extrabold text-base text-white mb-3">
          {searchQuery ? `نتائج البحث عن "${searchQuery}"` : 'فيديوهات مقترحة لك 🔥'}
        </h3>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-sm">
            لا توجد فيديوهات مطابقة لبحثك. جرب كلمة بحث أخرى!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map((video, idx) => (
              <div
                key={video.id}
                onClick={() => handleSelectVideo(idx)}
                className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-900 cursor-pointer shadow-lg border border-neutral-800/80 hover:border-rose-500/50 transition-all"
              >
                <img
                  src={video.posterUrl || video.author.avatarUrl}
                  alt={video.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Overlay Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 p-2.5 flex flex-col justify-between">
                  <div className="flex justify-end">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full">
                      <Play className="w-2.5 h-2.5 fill-white" />
                      {(video.stats.views / 1000).toFixed(0)}K
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-white line-clamp-2 mb-1.5 drop-shadow-md">
                      {video.caption}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <img
                        src={video.author.avatarUrl}
                        alt={video.author.displayName}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span className="text-[10px] font-medium text-neutral-300 truncate">
                        {video.author.displayName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
