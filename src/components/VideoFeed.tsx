import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { VideoCard } from './VideoCard';
import { VideoItem } from '../types';
import { ChevronUp, ChevronDown, RefreshCw, Compass, Sparkles } from 'lucide-react';

export const VideoFeed: React.FC = () => {
  const {
    filteredVideos,
    currentVideoIndex,
    setCurrentVideoIndex,
    feedType,
    setFeedType,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    userInterests,
  } = useApp();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [isLiveRefreshing, setIsLiveRefreshing] = useState(false);
  const [infiniteFeed, setInfiniteFeed] = useState<VideoItem[]>(filteredVideos);

  // Sync and extend infinite feed
  useEffect(() => {
    setInfiniteFeed(filteredVideos);
  }, [filteredVideos]);

  // Infinite video generator: when user approaches the end of the playlist, automatically generate & append more clips
  const appendMoreVideos = useCallback(() => {
    if (filteredVideos.length === 0) return;

    setInfiniteFeed(prev => {
      const additional = filteredVideos.map((item, idx) => ({
        ...item,
        id: `${item.id}-loop-${Date.now()}-${idx}`,
        stats: {
          ...item.stats,
          views: item.stats.views + Math.floor(Math.random() * 5000),
          likes: item.stats.likes + Math.floor(Math.random() * 500),
        },
      }));
      return [...prev, ...additional];
    });
  }, [filteredVideos]);

  // Keyboard navigation (ArrowUp, ArrowDown, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        scrollToIndex(currentVideoIndex + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        scrollToIndex(currentVideoIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVideoIndex, infiniteFeed.length]);

  const scrollToIndex = (index: number) => {
    if (index < 0) return;

    // Check if we need to append more continuous videos
    if (index >= infiniteFeed.length - 2) {
      appendMoreVideos();
    }

    setCurrentVideoIndex(index);

    const container = containerRef.current;
    if (container) {
      const targetChild = container.children[index] as HTMLElement;
      if (targetChild) {
        targetChild.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const scrollPosition = container.scrollTop;
    const itemHeight = container.clientHeight;
    if (itemHeight <= 0) return;

    const newIndex = Math.round(scrollPosition / itemHeight);
    if (newIndex !== currentVideoIndex && newIndex >= 0 && newIndex < infiniteFeed.length) {
      setCurrentVideoIndex(newIndex);

      // Trigger continuous infinite append
      if (newIndex >= infiniteFeed.length - 2) {
        appendMoreVideos();
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    const SWIPE_THRESHOLD = 50;

    if (diff > SWIPE_THRESHOLD) {
      scrollToIndex(currentVideoIndex + 1);
    } else if (diff < -SWIPE_THRESHOLD) {
      scrollToIndex(currentVideoIndex - 1);
    }
    setTouchStartY(null);
  };

  const handleLiveRefresh = () => {
    setIsLiveRefreshing(true);
    setTimeout(() => {
      appendMoreVideos();
      scrollToIndex(0);
      setIsLiveRefreshing(false);
    }, 600);
  };

  if (infiniteFeed.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-black text-white select-none">
        <Compass className="w-16 h-16 text-rose-500 mb-4 animate-pulse" />
        <h3 className="text-xl font-bold mb-2">لا توجد فيديوهات مطابقة</h3>
        <p className="text-white/60 text-sm max-w-sm mb-6">
          {searchQuery
            ? `لم نجد نتائج للبحث عن "${searchQuery}".`
            : 'اضغط على زر التحديث اللحظي لجلب أحدث المقاطع!'}
        </p>
        <button
          onClick={handleLiveRefresh}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4 animate-spin" />
          تحديث لحظي
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      {/* Live Refresh Pill Button */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <button
          onClick={handleLiveRefresh}
          disabled={isLiveRefreshing}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white/90 hover:text-white hover:bg-black/80 active:scale-95 transition-all shadow-lg"
          title="تحديث لحظي مستمر للفيديوهات"
        >
          <RefreshCw className={`w-3 h-3 text-rose-400 ${isLiveRefreshing ? 'animate-spin' : ''}`} />
          <span>تحديث لحظي مستمر</span>
        </button>
      </div>

      {/* Vertical Snap Feed Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {infiniteFeed.map((video, index) => (
          <div key={`${video.id}-${index}`} className="w-full h-full snap-start snap-always shrink-0">
            <VideoCard
              video={video}
              isActive={index === currentVideoIndex}
              onHashtagClick={tag => {
                setSearchQuery(tag);
                setActiveTab('discover');
              }}
            />
          </div>
        ))}
      </div>

      {/* Desktop Quick Nav Arrows */}
      <div className="hidden lg:flex flex-col gap-3 absolute right-6 top-1/2 -translate-y-1/2 z-30 pointer-events-auto">
        <button
          onClick={() => scrollToIndex(currentVideoIndex - 1)}
          disabled={currentVideoIndex === 0}
          className="p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-90 shadow-xl"
          title="الفيديو السابق"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button
          onClick={() => scrollToIndex(currentVideoIndex + 1)}
          className="p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all active:scale-90 shadow-xl"
          title="الفيديو التالي"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
