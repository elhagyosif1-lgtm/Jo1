import React, { useRef, useState, useEffect } from 'react';
import { VideoItem } from '../types';
import { useApp } from '../context/AppContext';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music,
  Plus,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Lock,
  Gift
} from 'lucide-react';

interface VideoCardProps {
  video: VideoItem;
  isActive: boolean;
  onHashtagClick?: (tag: string) => void;
  onVideoEnded?: () => void;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, isActive, onHashtagClick, onVideoEnded }) => {
  const {
    likedVideoIds,
    toggleLike,
    bookmarkedVideoIds,
    toggleBookmark,
    followingCreatorIds,
    toggleFollow,
    setActiveCommentsModalVideoId,
    setActiveShareModalVideo,
    setActiveGiftModalVideo,
    setActiveSoundModal,
    isMuted,
    toggleMute,
    setActiveTab,
    setSearchQuery,
    autoAdvanceVideos,
  } = useApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string>(video.videoUrl);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    setStreamUrl(video.videoUrl);
  }, [video.videoUrl]);

  const isLiked = likedVideoIds.has(video.id);
  const isBookmarked = bookmarkedVideoIds.has(video.id);
  const isFollowing = followingCreatorIds.has(video.author.id);

  // Auto-play when active with browser audio-policy safety
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (isActive) {
      vid.currentTime = 0;
      setIsBuffering(true);

      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
          })
          .catch(() => {
            // If browser blocks unmuted playback, mute and retry seamlessly
            vid.muted = true;
            vid.play()
              .then(() => {
                setIsPlaying(true);
                setIsBuffering(false);
              })
              .catch(() => {
                setIsPlaying(false);
                setIsBuffering(false);
              });
          });
      }
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  }, [isActive, streamUrl]);

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;

    if (isPlaying) {
      vid.pause();
      setIsPlaying(false);
      setShowPlayIcon(true);
    } else {
      vid.play()
        .then(() => {
          setIsPlaying(true);
          setShowPlayIcon(true);
          setTimeout(() => setShowPlayIcon(false), 500);
        })
        .catch(() => {
          vid.muted = true;
          vid.play().then(() => {
            setIsPlaying(true);
            setShowPlayIcon(true);
            setTimeout(() => setShowPlayIcon(false), 500);
          });
        });
    }
  };

  const handleVideoTouch = (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    let clientX = 0;
    let clientY = 0;

    if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected!
      if (!isLiked) {
        toggleLike(video.id);
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const heartId = Date.now();
      setFloatingHearts(prev => [...prev, { id: heartId, x, y }]);
      setTimeout(() => {
        setFloatingHearts(prev => prev.filter(h => h.id !== heartId));
      }, 1000);

      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= DOUBLE_TAP_DELAY - 50 && lastTapRef.current !== 0) {
          togglePlay();
          lastTapRef.current = 0;
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current || !videoRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    videoRef.current.currentTime = ratio * videoRef.current.duration;
    setProgress(ratio * 100);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onHashtagClick) {
      onHashtagClick(tag);
    } else {
      setSearchQuery(tag);
      setActiveTab('discover');
    }
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center select-none overflow-hidden snap-start snap-always">
      {/* Resilient Video Stream Player (Direct src binding with instant fallback and zero reload error overlays) */}
      <video
        ref={videoRef}
        src={streamUrl}
        poster={video.posterUrl}
        playsInline
        loop={!autoAdvanceVideos}
        preload="auto"
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          if (autoAdvanceVideos && onVideoEnded) {
            onVideoEnded();
          }
        }}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onLoadedData={() => setIsBuffering(false)}
        onPlaying={() => setIsBuffering(false)}
        onError={() => {
          // If primary source encounters an issue, fallback seamlessly to secondary mirror
          if (video.fallbackUrl && streamUrl !== video.fallbackUrl) {
            setStreamUrl(video.fallbackUrl);
          } else {
            setIsBuffering(false);
          }
        }}
        style={video.filterApplied ? { filter: video.filterApplied } : undefined}
        className="w-full h-full object-cover cursor-pointer"
        onClick={handleVideoTouch}
      />

      {/* Secret Private Video Link Indicator */}
      {video.privacy === 'private_link' && (
        <div className="absolute top-16 right-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-amber-400/70 shadow-2xl">
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-bold text-amber-300">مقطع سري خاص (غير مدرج)</span>
          <button
            onClick={e => {
              e.stopPropagation();
              const url = `${window.location.origin}/?v=${video.id}`;
              navigator.clipboard?.writeText(url);
              setCopiedSecret(true);
              setTimeout(() => setCopiedSecret(false), 2000);
            }}
            className="px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-[10px] font-bold border border-amber-500/40 transition-colors"
          >
            {copiedSecret ? '✓ تم النسخ!' : 'نسخ الرابط'}
          </button>
        </div>
      )}

      {/* Subtle Buffering Spinner (Never hides the video or shows an ugly card) */}
      {isBuffering && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-15 bg-black/20">
          <div className="w-10 h-10 border-2 border-white/20 border-t-rose-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Floating Animated Hearts on Double Tap */}
      {floatingHearts.map(heart => (
        <div
          key={heart.id}
          style={{ left: heart.x - 40, top: heart.y - 40 }}
          className="pointer-events-none absolute z-40 transform -translate-x-1/2 -translate-y-1/2 animate-float-up"
        >
          <Heart className="w-20 h-20 text-rose-500 fill-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]" />
        </div>
      ))}

      {/* Play / Pause Central Overlay Icon */}
      {showPlayIcon && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-300">
          <div className="p-5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white shadow-2xl scale-125 transition-transform">
            {!isPlaying ? (
              <Play className="w-12 h-12 fill-white translate-x-0.5" />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center gap-1.5">
                <span className="w-2.5 h-8 bg-white rounded-full" />
                <span className="w-2.5 h-8 bg-white rounded-full" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtle Top & Bottom Gradient Scrims for Readability */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 via-black/30 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

      {/* Right Action Rail (Avatar, Likes, Comments, Bookmarks, Share, Vinyl) */}
      <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-5 select-none">
        {/* Creator Avatar with Follow Button */}
        <div className="relative mb-2 flex flex-col items-center">
          <div
            onClick={() => setActiveTab('profile')}
            className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-rose-500 to-cyan-400 cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-lg"
          >
            <img
              src={video.author.avatarUrl}
              alt={video.author.displayName}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          {!isFollowing && (
            <button
              onClick={e => {
                e.stopPropagation();
                toggleFollow(video.author.id);
              }}
              className="absolute -bottom-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 active:scale-90 transition-transform shadow-md"
              title="متابعة"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          )}
          {isFollowing && (
            <span className="absolute -bottom-2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={e => {
            e.stopPropagation();
            toggleLike(video.id);
          }}
          className="group flex flex-col items-center gap-1 active:scale-75 transition-transform"
        >
          <div
            className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
              isLiked ? 'text-rose-500' : 'text-white hover:text-rose-400'
            }`}
          >
            <Heart
              className={`w-8 h-8 transition-all duration-200 ${
                isLiked ? 'fill-rose-500 scale-110 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]' : 'hover:scale-110'
              }`}
            />
          </div>
          <span className="text-xs font-bold text-white drop-shadow-md tabular-nums">
            {formatNumber(video.stats.likes)}
          </span>
        </button>

        {/* Comment Button */}
        <button
          onClick={e => {
            e.stopPropagation();
            setActiveCommentsModalVideoId(video.id);
          }}
          className="group flex flex-col items-center gap-1 active:scale-75 transition-transform"
        >
          <div className="p-2.5 rounded-full text-white hover:text-cyan-400 transition-colors">
            <MessageCircle className="w-8 h-8 transition-transform group-hover:scale-110 fill-white/10" />
          </div>
          <span className="text-xs font-bold text-white drop-shadow-md tabular-nums">
            {formatNumber(video.stats.comments)}
          </span>
        </button>

        {/* Bookmark Button */}
        <button
          onClick={e => {
            e.stopPropagation();
            toggleBookmark(video.id);
          }}
          className="group flex flex-col items-center gap-1 active:scale-75 transition-transform"
        >
          <div
            className={`p-2.5 rounded-full transition-colors ${
              isBookmarked ? 'text-amber-400' : 'text-white hover:text-amber-300'
            }`}
          >
            <Bookmark
              className={`w-8 h-8 transition-transform group-hover:scale-110 ${
                isBookmarked ? 'fill-amber-400' : 'fill-white/10'
              }`}
            />
          </div>
          <span className="text-xs font-bold text-white drop-shadow-md tabular-nums">
            {formatNumber(video.stats.bookmarks)}
          </span>
        </button>

        {/* Gift Button */}
        <button
          onClick={e => {
            e.stopPropagation();
            setActiveGiftModalVideo(video);
          }}
          className="group flex flex-col items-center gap-1 active:scale-75 transition-transform"
          title="إرسال هدية للمنشئ"
        >
          <div className="p-2.5 rounded-full text-amber-400 hover:text-amber-300 transition-colors bg-gradient-to-tr from-amber-500/20 to-rose-600/20 border border-amber-400/40 shadow-lg group-hover:scale-110">
            <Gift className="w-8 h-8 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
          </div>
          <span className="text-xs font-bold text-amber-300 drop-shadow-md">
            هدية
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={e => {
            e.stopPropagation();
            setActiveShareModalVideo(video);
          }}
          className="group flex flex-col items-center gap-1 active:scale-75 transition-transform"
        >
          <div className="p-2.5 rounded-full text-white hover:text-emerald-400 transition-colors">
            <Share2 className="w-8 h-8 transition-transform group-hover:scale-110" />
          </div>
          <span className="text-xs font-bold text-white drop-shadow-md tabular-nums">
            {formatNumber(video.stats.shares)}
          </span>
        </button>

        {/* Spinning Vinyl Record */}
        <div
          onClick={e => {
            e.stopPropagation();
            setActiveSoundModal(video.music);
          }}
          className="relative mt-2 cursor-pointer group"
          title={video.music.title}
        >
          <div
            className={`w-12 h-12 rounded-full bg-gradient-to-r from-neutral-900 to-black p-2 border-2 border-neutral-700/80 shadow-xl flex items-center justify-center ${
              isPlaying ? 'animate-spin-slow' : ''
            }`}
          >
            <img
              src={video.music.coverUrl}
              alt={video.music.title}
              className="w-6 h-6 rounded-full object-cover"
            />
          </div>
          {isPlaying && (
            <div className="absolute -top-3 -right-2 pointer-events-none">
              <Music className="w-4 h-4 text-rose-400 animate-float-up" />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Information Overlay */}
      <div className="absolute bottom-16 left-3 right-16 z-20 text-white select-none">
        {/* Creator Identity with Level 52 badge */}
        <div
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-2 mb-2 cursor-pointer group w-fit"
        >
          <span className="font-extrabold text-base tracking-wide drop-shadow-md group-hover:text-rose-400 transition-colors">
            @{video.author.username}
          </span>
          {video.author.isVerified && (
            <span className="w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[10px] font-black">
              ✓
            </span>
          )}
          {video.author.supporterLevel && (
            <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-400 via-rose-600 to-cyan-400 text-white text-[9px] font-black shadow-md flex items-center gap-0.5">
              <span>👑</span>
              <span>{video.author.supporterLevel}</span>
            </span>
          )}
          {video.privacy === 'private_link' && (
            <span className="px-2 py-0.5 rounded-full bg-neutral-800/80 border border-amber-400/50 text-amber-300 text-[10px] font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>رابط خاص</span>
            </span>
          )}
          <span className="text-xs text-white/60 font-medium">· {video.createdAt}</span>
        </div>

        {/* Caption & Hashtags */}
        <div className="mb-3 text-sm leading-relaxed text-white/95 drop-shadow-md">
          <p className={isCaptionExpanded ? 'line-clamp-none' : 'line-clamp-2'}>
            {video.caption}{' '}
            {video.hashtags.map((tag, idx) => (
              <span
                key={idx}
                onClick={e => handleTagClick(tag, e)}
                className="font-bold text-white hover:text-cyan-300 cursor-pointer ml-1 inline-block"
              >
                {tag}
              </span>
            ))}
          </p>
          {video.caption.length > 70 && (
            <button
              onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
              className="text-xs font-bold text-white/80 hover:text-white mt-1 cursor-pointer"
            >
              {isCaptionExpanded ? 'عرض أقل' : '...المزيد'}
            </button>
          )}
        </div>

        {/* Music Marquee */}
        <div
          onClick={() => setActiveSoundModal(video.music)}
          className="flex items-center gap-2 text-xs font-semibold text-white/90 cursor-pointer hover:text-white bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full w-fit max-w-[85%] border border-white/10"
        >
          <Music className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <div className="overflow-hidden whitespace-nowrap">
            <span className="inline-block animate-pulse truncate">
              {video.music.title} - {video.music.author}
            </span>
          </div>
        </div>
      </div>

      {/* Scrubbable Progress Bar */}
      <div
        onClick={handleProgressBarClick}
        className="absolute bottom-14 left-0 right-0 h-2 group cursor-pointer z-30 flex items-end"
      >
        <div className="w-full h-1 bg-white/20 group-hover:h-1.5 transition-all">
          <div
            className="h-full bg-rose-500 rounded-r-full transition-all duration-75 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-md" />
          </div>
        </div>
      </div>
    </div>
  );
};
