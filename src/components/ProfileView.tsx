import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Edit3,
  Grid,
  Heart,
  Bookmark,
  Play,
  Wallet,
  Sparkles,
  ShieldCheck,
  Crown,
  Flame,
  Gem,
  Award,
  X,
  SlidersHorizontal,
  Lock,
  Copy,
  CheckCircle2,
  Send,
  Terminal
} from 'lucide-react';
import { Level52Badge } from './Level52Badge';
import { VerificationModal } from './VerificationModal';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    updateCurrentUser,
    videos,
    likedVideoIds,
    bookmarkedVideoIds,
    setCurrentVideoIndex,
    setActiveTab,
    wallet,
    setIsWalletModalOpen,
    setIsOnboardingOpen,
    t,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'private' | 'my' | 'liked' | 'saved'>('private');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [copiedVideoId, setCopiedVideoId] = useState<string | null>(null);

  const privateVideos = videos.filter(
    v => (v.isUserUploaded || v.author.id === currentUser.id) && (v.privacy === 'private_link' || v.privacy === 'only_me')
  );
  const publicVideos = videos.filter(
    v => (v.isUserUploaded || v.author.id === currentUser.id) && v.privacy === 'public'
  );
  const likedVideos = videos.filter(v => likedVideoIds.has(v.id));
  const savedVideos = videos.filter(v => bookmarkedVideoIds.has(v.id));

  const handleCopyLink = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/?v=${videoId}`;
    navigator.clipboard?.writeText(url);
    setCopiedVideoId(videoId);
    setTimeout(() => setCopiedVideoId(null), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      displayName: displayName.trim() || currentUser.displayName,
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim() || currentUser.avatarUrl,
    });
    setShowEditModal(false);
  };

  const handlePlayVideo = (video: any) => {
    const idx = videos.findIndex(v => v.id === video.id);
    if (idx !== -1) {
      setCurrentVideoIndex(idx);
      setActiveTab('feed');
    }
  };

  const currentTabVideos =
    activeSubTab === 'private'
      ? privateVideos
      : activeSubTab === 'my'
      ? publicVideos
      : activeSubTab === 'liked'
      ? likedVideos
      : savedVideos;

  return (
    <div className="w-full h-full bg-black text-white overflow-y-auto no-scrollbar pt-safe pb-28 px-4 sm:px-6 select-none">
      {/* Top Profile Header Bar */}
      <div className="flex items-center justify-between py-2 border-b border-neutral-900">
        <button
          onClick={() => setIsOnboardingOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-300 hover:text-white"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span>تفضيلات الخوارزمية</span>
        </button>

        <button
          onClick={() => setIsWalletModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-600/20 border border-amber-400/40 text-amber-300 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
        >
          <Wallet className="w-3.5 h-3.5 text-amber-400" />
          <span className="tabular-nums font-black">{wallet.coinsBalance.toLocaleString()} عملة</span>
        </button>
      </div>

      {/* Main Profile Info */}
      <div className="flex flex-col items-center pt-5 pb-6 border-b border-neutral-900">
        {/* Avatar with Level 52 Legendary Supporter Ring */}
        <div className="relative mb-3 group cursor-pointer" onClick={() => setShowBadgeModal(true)}>
          {/* Animated Iridescent Outer Aura */}
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400 blur-md opacity-80 group-hover:opacity-100 animate-pulse transition-opacity" />

          {/* Golden Winged Ring */}
          <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-rose-500 to-cyan-400 shadow-2xl">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              className="w-full h-full rounded-full object-cover ring-2 ring-black"
            />
          </div>

          {/* LEVEL 52 ICONIC SUPPORTER BADGE */}
          <div className="absolute -bottom-3 inset-x-0 flex justify-center">
            <Level52Badge size="sm" interactive={true} />
          </div>
        </div>

        {/* Display Name & Official Verified Shield */}
        <div className="flex items-center gap-1.5 mt-3">
          <h2 className="text-xl font-extrabold text-white">{currentUser.displayName}</h2>
          {currentUser.isVerified && (
            <span
              className="px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-black flex items-center gap-1 shadow-[0_0_12px_rgba(6,182,212,0.8)] border border-cyan-300"
              title="موثق رسمياً برتبة الشريك المؤسسي المعتمد"
            >
              <ShieldCheck className="w-3 h-3 text-white" />
              <span>موثق معتمد</span>
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-400 font-semibold mb-2">@{currentUser.username}</p>

        {/* Top Supporter Title Pill */}
        <div
          onClick={() => setShowBadgeModal(true)}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-cyan-500/20 border border-amber-400/50 cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md my-1"
        >
          <Gem className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-xs font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-cyan-300">
            داعم إمبراطوري أسطوري (ENIGMA Level 52)
          </span>
        </div>

        {/* Supporter Level 52 Progress Bar */}
        <div className="w-full max-w-xs mt-3 p-3 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 mb-1">
            <span className="text-amber-400 flex items-center gap-1">
              <Crown className="w-3 h-3" /> أعلى مستوى دعم في العالم
            </span>
            <span className="font-mono text-white">15.8M / 20M XP</span>
          </div>
          <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400 w-[79%]" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 my-4 text-center">
          <div>
            <p className="text-base font-extrabold text-white tabular-nums">
              {currentUser.followingCount || 240}
            </p>
            <p className="text-xs text-neutral-500 font-medium">{t('followingCount')}</p>
          </div>
          <div className="w-px h-6 bg-neutral-800" />
          <div>
            <p className="text-base font-extrabold text-white tabular-nums">
              {(currentUser.followersCount / 1000).toFixed(1)}K
            </p>
            <p className="text-xs text-neutral-500 font-medium">{t('followers')}</p>
          </div>
          <div className="w-px h-6 bg-neutral-800" />
          <div>
            <p className="text-base font-extrabold text-white tabular-nums">
              {currentUser.totalLikes || '3.4M'}
            </p>
            <p className="text-xs text-neutral-500 font-medium">{t('likesCount')}</p>
          </div>
        </div>

        {/* Bio */}
        {currentUser.bio && (
          <p className="text-xs text-neutral-300 text-center max-w-sm mb-3 leading-relaxed">
            {currentUser.bio}
          </p>
        )}

        {/* Action Buttons Row 1 */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold border border-neutral-700 active:scale-95 transition-all shadow-md"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t('editProfile')}</span>
          </button>

          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black text-xs font-black active:scale-95 transition-all shadow-md"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>المحفظة والتحويلات</span>
          </button>

          {/* Paid Verification 200 EGP CTA */}
          <button
            onClick={() => setIsVerificationOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white text-xs font-bold active:scale-95 transition-all shadow-md"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>طلب توثيق (200 ج.م)</span>
          </button>

          {/* Sovereign Founder Terminal Entry */}
          <button
            onClick={() => setActiveTab('backstage')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#090e1a] hover:bg-[#0f172a] border border-amber-400/50 text-amber-300 text-xs font-mono font-bold active:scale-95 transition-all shadow-md"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>MR JOO Terminal</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs: Private Links, Public Videos, Liked, Saved */}
      <div className="grid grid-cols-4 border-b border-neutral-900 mt-2 text-center">
        <button
          onClick={() => setActiveSubTab('private')}
          className={`flex items-center justify-center gap-1.5 py-3 text-xs font-black border-b-2 transition-all ${
            activeSubTab === 'private'
              ? 'text-amber-400 border-amber-400 bg-amber-950/20'
              : 'text-neutral-500 border-transparent hover:text-neutral-300'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>الروابط السرية ({privateVideos.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('my')}
          className={`flex items-center justify-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'my'
              ? 'text-white border-rose-500'
              : 'text-neutral-500 border-transparent hover:text-neutral-300'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>العامة ({publicVideos.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('liked')}
          className={`flex items-center justify-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'liked'
              ? 'text-white border-rose-500'
              : 'text-neutral-500 border-transparent hover:text-neutral-300'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>أعجبني ({likedVideos.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('saved')}
          className={`flex items-center justify-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'saved'
              ? 'text-white border-rose-500'
              : 'text-neutral-500 border-transparent hover:text-neutral-300'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>المحفوظات ({savedVideos.length})</span>
        </button>
      </div>

      {/* Video Content Area */}
      <div className="py-4">
        {/* Dedicated Tab for Private Videos with Secret Links */}
        {activeSubTab === 'private' ? (
          privateVideos.length === 0 ? (
            <div className="py-12 px-4 rounded-3xl bg-neutral-900/60 border border-neutral-800 text-center max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <h4 className="text-base font-extrabold text-white">لا توجد مقاطع خاصة وسرية حتى الآن</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                أي فيديو تقوم بنشره كـ <strong>"رابط خاص وسري"</strong> سيظهر هنا فقط مع رابط فريد يمكنك إرساله لأصدقائك أو لمن تريد دون أن يظهر في الصفحة العامة للمنصة.
              </p>
              <button
                onClick={() => setActiveTab('upload')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-black font-black text-xs shadow-lg transition-transform active:scale-95"
              >
                + إنشاء ونشر أول مقطع خاص الآن
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>فيديوهاتك المحمية بروابط سرية (غير معروضة للعامة):</span>
                </span>
                <span className="font-mono font-bold text-amber-400">{privateVideos.length} فيديو</span>
              </div>

              {privateVideos.map(video => {
                const secretLink = `${window.location.origin}/?v=${video.id}`;
                const isCopied = copiedVideoId === video.id;

                return (
                  <div
                    key={video.id}
                    className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between shadow-lg"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div
                        onClick={() => handlePlayVideo(video)}
                        className="relative w-16 h-20 rounded-xl overflow-hidden bg-black shrink-0 cursor-pointer group"
                      >
                        <img
                          src={video.posterUrl || video.author.avatarUrl}
                          alt={video.caption}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>رابط سري</span>
                          </span>
                          <span className="text-[10px] text-neutral-500">{video.createdAt}</span>
                        </div>
                        <p className="text-xs font-bold text-white truncate max-w-xs">{video.caption}</p>
                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate max-w-xs">
                          {secretLink}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                      <button
                        onClick={e => handleCopyLink(video.id, e)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                        }`}
                        title="نسخ الرابط المباشر"
                      >
                        {isCopied ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            <span>تم النسخ!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-amber-400" />
                            <span>نسخ الرابط</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `شاهد مقطعي السري على Jo1: ${secretLink}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-md"
                        title="مشاركة عبر واتساب"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => handlePlayVideo(video)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-md"
                      >
                        مشاهدة
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : currentTabVideos.length === 0 ? (
          <div className="py-16 text-center text-neutral-500">
            <p className="text-sm font-bold text-neutral-400 mb-1">لا توجد فيديوهات في هذا القسم</p>
            <p className="text-xs">
              {activeSubTab === 'my'
                ? 'فيديوهاتك العامة تظهر هنا للجميع.'
                : 'تفاعل مع الفيديوهات لتظهر هنا.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {currentTabVideos.map(video => (
              <div
                key={video.id}
                onClick={() => handlePlayVideo(video)}
                className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-neutral-900 cursor-pointer shadow-md hover:scale-[1.02] transition-transform"
              >
                <img
                  src={video.posterUrl || video.author.avatarUrl}
                  alt={video.caption}
                  style={video.filterApplied ? { filter: video.filterApplied } : undefined}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-white">
                    <Play className="w-2.5 h-2.5 fill-white" />
                    {(video.stats.views / 1000).toFixed(0)}K
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LEVEL 52 BADGE INSPECTION MODAL */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm bg-neutral-900 border-2 border-amber-400/80 rounded-3xl p-6 shadow-[0_0_60px_rgba(245,158,11,0.5)] text-center">
            <button
              onClick={() => setShowBadgeModal(false)}
              className="absolute top-4 left-4 p-1.5 rounded-full text-neutral-400 hover:text-white bg-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Giant Badge Emblem */}
            <div className="w-28 h-28 mx-auto my-3 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-rose-500 to-cyan-400 flex items-center justify-center shadow-2xl relative">
              <div className="w-full h-full bg-black rounded-full flex flex-col items-center justify-center">
                <Crown className="w-8 h-8 text-amber-400 animate-bounce" />
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-cyan-300">
                  52
                </span>
              </div>
            </div>

            <h3 className="text-lg font-black text-white mt-2">
              وسام الداعم الإمبراطوري الأسطوري
            </h3>
            <p className="text-xs text-amber-300 font-bold mb-4">
              المستوى 52 - يتجاوز سقف تيك توك بمرتبتين استثنائيتين
            </p>

            <div className="space-y-2 text-right p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs">
              <div className="flex items-center gap-2 text-neutral-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>هزة شاشة واهتزاز كامل للبث عند إطلاق هدايا أثر</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-200">
                <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                <span>إطار ماسي متلألئ في جميع الدردشات والتعليقات</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-200">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>دخول ملكي احتفالي بصوت بوق إمبراطوري في البثوث</span>
              </div>
            </div>

            <button
              onClick={() => setShowBadgeModal(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-black text-xs shadow-lg active:scale-95"
            >
              فخور بهذا الوسام الأسطوري ✨
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-white">تعديل الملف الشخصي</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1">الاسم المعروض</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full bg-neutral-800 text-white text-xs rounded-xl px-3 py-2 border border-neutral-700 outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1">النبذة التعريفية (Bio)</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={2}
                  className="w-full bg-neutral-800 text-white text-xs rounded-xl px-3 py-2 border border-neutral-700 outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1">رابط الصورة الرمزية</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  className="w-full bg-neutral-800 text-white text-xs rounded-xl px-3 py-2 border border-neutral-700 outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                حفظ التعديلات
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Enterprise Verification Modal */}
      <VerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
      />
    </div>
  );
};
