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
  Crown,
  Heart,
  HelpCircle,
  Shuffle,
  Eye,
  CheckCircle2,
  Trophy,
  Zap,
  Globe
} from 'lucide-react';
import { Level52Badge } from './Level52Badge';

interface LiveSupporter {
  rank: number;
  name: string;
  avatar: string;
  score: string;
  level?: number;
}

export const LiveStreamView: React.FC = () => {
  const {
    setActiveTab,
    triggerGiftAnimation,
    wallet,
    depositCoins,
    currentUser,
  } = useApp();

  // Active view tab on mobile: 'exam' | 'chat' | 'leaderboards'
  const [mobileSubTab, setMobileSubTab] = useState<'exam' | 'chat' | 'leaderboards'>('exam');

  // Exam Question State (Image 4: "ما هي عاصمة فرنسا؟" -> باريس)
  const [question, setQuestion] = useState({
    id: 1,
    number: '001 / 500',
    title: 'ما هي عاصمة فرنسا؟',
    answer: 'باريس',
    letters: ['ب', 'ا', 'ر', 'ي', 'س'],
  });

  const [revealedIndices, setRevealedIndices] = useState<number[]>([0]); // 'ب' revealed initially
  const [solved, setSolved] = useState(false);
  const [coinsPool, setCoinsPool] = useState(1250);

  // Chat stream
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; user: string; text: string; isCorrect?: boolean; badge?: string }>
  >([
    { id: '1', user: 'Ahmed', text: 'باريس', isCorrect: true, badge: '👑' },
    { id: '2', user: 'Sara', text: 'فرنسا ❤️' },
    { id: '3', user: 'Zizo', text: 'باريس ياعم 🔥' },
    { id: '4', user: 'Lolo', text: '❤️❤️' },
    { id: '5', user: 'M7md', text: 'باريس صح' },
    { id: '6', user: 'Queen', text: 'صح Queen 👑' },
    { id: '7', user: 'Roro', text: 'باريس' },
    { id: '8', user: 'Nour', text: 'وهي فرنسا كمان 💖' },
    { id: '9', user: 'Fares', text: 'باريس 🔥' },
    { id: '10', user: 'Dodo', text: 'عندك 100 عملة؟' },
  ]);

  const [chatInput, setChatInput] = useState('');
  const [spotlightUser, setSpotlightUser] = useState({
    name: 'Ahmed',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    text: 'أجاب بشكل صحيح +200 🟡',
  });

  // Top Supporters from Image 4
  const topSupporters: LiveSupporter[] = [
    { rank: 1, name: 'Queen', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', score: '12.4K', level: 50 },
    { rank: 2, name: 'Ahmed', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', score: '8.7K', level: 48 },
    { rank: 3, name: 'Lolo', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', score: '6.3K', level: 45 },
    { rank: 4, name: 'Roro', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100', score: '5.1K', level: 42 },
    { rank: 5, name: 'M7md', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100', score: '4.8K', level: 40 },
  ];

  // Top Likers
  const topLikers = [
    { rank: 1, name: 'Sama', score: '78.2K' },
    { rank: 2, name: 'Zizo', score: '62.7K' },
    { rank: 3, name: 'Nour', score: '51.3K' },
    { rank: 4, name: 'ahmed_22', score: '43.9K' },
    { rank: 5, name: 'Layan', score: '38.6K' },
  ];

  // Hint: Reveal Letter (50 coins)
  const handleRevealLetter = () => {
    const unrevealed = [0, 1, 2, 3, 4].filter((idx) => !revealedIndices.includes(idx));
    if (unrevealed.length > 0) {
      const nextIdx = unrevealed[0];
      const updated = [...revealedIndices, nextIdx];
      setRevealedIndices(updated);
      setCoinsPool((c) => Math.max(0, c - 50));
      if (updated.length === 5) {
        setSolved(true);
      }
    }
  };

  // Hint: Ask a friend (100 coins)
  const handleAskFriend = () => {
    setRevealedIndices([0, 1, 2, 3, 4]);
    setSolved(true);
    setCoinsPool((c) => Math.max(0, c - 100));
  };

  // Submit Answer from Comments
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const text = chatInput.trim();
    const isCorrect = text.includes('باريس') || text.toLowerCase().includes('paris');

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        user: currentUser.displayName,
        text,
        isCorrect,
        badge: '👑',
      },
    ]);

    if (isCorrect) {
      setRevealedIndices([0, 1, 2, 3, 4]);
      setSolved(true);
      setSpotlightUser({
        name: currentUser.displayName,
        avatar: currentUser.avatarUrl,
        text: 'أجاب بشكل صحيح +200 🟡',
      });
      depositCoins(200, 1.0, 'مكافأة الفوز في مسابقة MR JOO LIVE EXAM');
    }

    setChatInput('');
  };

  return (
    <div className="relative w-full h-full bg-[#050714] text-white flex flex-col select-none overflow-hidden font-sans">
      {/* Top Header Bar (Matching Image 4: MR JOO LIVE EXAM) */}
      <header className="h-16 px-4 border-b border-cyan-900/40 bg-gradient-to-r from-[#090d24] via-[#0d143a] to-[#090d24] flex items-center justify-between shrink-0 shadow-lg">
        {/* Left Creator Info */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('feed')}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-400"
            />
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-[9px] font-black text-white flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              LIVE
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-black text-white tracking-wide">MR JOO</h2>
              <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[9px] font-black">
                ✓
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-neutral-400">
              <span className="text-amber-400 flex items-center gap-0.5">
                <Crown className="w-3 h-3 text-amber-400" /> مباشر الآن
              </span>
              <span>•</span>
              <span className="text-neutral-300">500 سؤال | لعبة تفاعلية</span>
            </div>
          </div>
        </div>

        {/* Center Title Logo Lockup */}
        <div className="hidden sm:flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-400 to-cyan-300">
              MR JOO LIVE EXAM
            </span>
            <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
          </div>
          <span className="text-[10px] text-neutral-400">جاوب .. أكسب .. كن الأفضل 👑</span>
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold">
            <Users className="w-3.5 h-3.5 text-rose-400" />
            <span>2.4K</span>
          </div>

          <Level52Badge size="sm" interactive={true} />
        </div>
      </header>

      {/* Mobile Sub-Navigation Tabs */}
      <div className="sm:hidden flex border-b border-neutral-800 bg-[#070b1a] shrink-0 text-xs font-bold">
        <button
          onClick={() => setMobileSubTab('exam')}
          className={`flex-1 py-2 text-center transition-colors ${
            mobileSubTab === 'exam'
              ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20'
              : 'text-neutral-400'
          }`}
        >
          السؤال الحالي (Exam)
        </button>
        <button
          onClick={() => setMobileSubTab('chat')}
          className={`flex-1 py-2 text-center transition-colors ${
            mobileSubTab === 'chat'
              ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20'
              : 'text-neutral-400'
          }`}
        >
          شات البث (Live Chat)
        </button>
        <button
          onClick={() => setMobileSubTab('leaderboards')}
          className={`flex-1 py-2 text-center transition-colors ${
            mobileSubTab === 'leaderboards'
              ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20'
              : 'text-neutral-400'
          }`}
        >
          الترتيب والداعمين
        </button>
      </div>

      {/* Main Grid Viewport (Matching Image 4) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: TOP SUPPORTERS & LIKERS (Desktop + Mobile Tab) */}
        <aside
          className={`w-full sm:w-64 border-l border-cyan-900/30 bg-[#070a1c] p-3 overflow-y-auto no-scrollbar space-y-4 shrink-0 ${
            mobileSubTab === 'leaderboards' ? 'block' : 'hidden sm:block'
          }`}
        >
          {/* Top Supporters */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-400">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Top Supporters</span>
            </div>
            <div className="space-y-1.5">
              {topSupporters.map((s) => (
                <div
                  key={s.rank}
                  className="flex items-center justify-between p-2 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-amber-400 w-4">{s.rank}</span>
                    <img src={s.avatar} alt={s.name} className="w-6 h-6 rounded-full object-cover" />
                    <span className="font-bold text-white truncate max-w-[80px]">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[11px] text-amber-300">
                    <Gift className="w-3 h-3 text-rose-400" />
                    <span>{s.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Likers */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-rose-400">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-500" />
              <span>Top Likers</span>
            </div>
            <div className="space-y-1.5">
              {topLikers.map((l) => (
                <div
                  key={l.rank}
                  className="flex items-center justify-between p-2 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-rose-400 w-4">{l.rank}</span>
                    <span className="font-bold text-white truncate max-w-[90px]">{l.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-rose-300">{l.score}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: INTERACTIVE QUESTION ARENA (Image 4) */}
        <main
          className={`flex-1 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto no-scrollbar bg-gradient-to-b from-[#060919] via-[#090d24] to-[#040612] ${
            mobileSubTab === 'exam' ? 'flex' : 'hidden sm:flex'
          }`}
        >
          {/* Question Card Box */}
          <div className="w-full max-w-lg mx-auto rounded-3xl bg-gradient-to-b from-[#0e1635] to-[#090d24] border-2 border-cyan-500/50 p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-center relative overflow-hidden">
            {/* Top Question Info */}
            <div className="flex items-center justify-between text-xs font-mono font-bold mb-4">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                السؤال الحالي ❓
              </span>
              <span className="text-neutral-400">{question.number}</span>
            </div>

            {/* Glowing Center Brain Icon */}
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-400/40 mx-auto mb-4 flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] animate-pulse">
              <Zap className="w-8 h-8" />
            </div>

            {/* Question Text */}
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-wide mb-6">
              {question.title}
            </h3>

            <p className="text-xs text-neutral-400 mb-4">
              اختر الإجابة الصحيحة من الحروف المخفية أو اكتبها في التعليقات
            </p>

            {/* Letter Slots Array: [ ب ] [ ا ] [ ر ] [ ي ] [ س ] */}
            <div className="flex items-center justify-center gap-2.5 mb-8">
              {question.letters.map((letter, idx) => {
                const isRevealed = revealedIndices.includes(idx);
                return (
                  <div
                    key={idx}
                    className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black transition-all duration-300 border-2 ${
                      isRevealed
                        ? 'bg-gradient-to-b from-cyan-500 to-blue-700 text-white border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.7)] scale-105'
                        : 'bg-[#0b1026] text-neutral-500 border-cyan-900/60'
                    }`}
                  >
                    {isRevealed ? letter : '_'}
                  </div>
                );
              })}
            </div>

            {/* Solved Banner */}
            {solved && (
              <div className="mb-6 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-sm font-bold flex items-center justify-center gap-2 animate-in zoom-in">
                <CheckCircle2 className="w-5 h-5" />
                <span>مبروك! تم حل السؤال بنجاح والإجابة هي (باريس) 🎉</span>
              </div>
            )}

            {/* Action Buttons Row (Image 4: مساعدة صديق | فتح حرف | إعادة المزيج) */}
            <div className="grid grid-cols-3 gap-2.5 text-xs font-bold">
              <button
                onClick={handleAskFriend}
                className="py-3 px-2 rounded-xl bg-purple-900/70 hover:bg-purple-800 border border-purple-500/50 text-purple-200 flex flex-col items-center gap-1 active:scale-95 transition-all"
              >
                <div className="flex items-center gap-1 font-mono text-amber-300">
                  <span>100</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                </div>
                <span>مساعدة صديق ❓</span>
              </button>

              <button
                onClick={handleRevealLetter}
                className="py-3 px-2 rounded-xl bg-blue-900/70 hover:bg-blue-800 border border-blue-500/50 text-blue-200 flex flex-col items-center gap-1 active:scale-95 transition-all"
              >
                <div className="flex items-center gap-1 font-mono text-amber-300">
                  <span>50</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                </div>
                <span>فتح حرف 👁️</span>
              </button>

              <button
                onClick={() => setRevealedIndices([0])}
                className="py-3 px-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 flex flex-col items-center gap-1 active:scale-95 transition-all"
              >
                <div className="flex items-center gap-1 font-mono text-amber-300">
                  <span>25</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                </div>
                <span>إعادة المزيج 🔄</span>
              </button>
            </div>

            <div className="mt-4 text-[11px] text-cyan-400 font-bold">
              الإجابة عن طريق التعليقات &gt;&gt;
            </div>
          </div>

          {/* Bottom Banner: Connected to TikTok LIVE (Image 4) */}
          <div className="w-full max-w-lg mx-auto mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#0c1333] to-[#070b1f] border border-cyan-500/40 flex items-center justify-between gap-3 shadow-lg">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">MR JOO CLOUD LIVE</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/40">
                  ✓ متصل
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 truncate">
                تفاعل لحظي • ألعاب تفاعلية • جوائز ومفاجآت
              </p>
            </div>

            <button
              onClick={() => {
                const targetGift = IMPACT_GIFTS_50[0];
                triggerGiftAnimation(targetGift);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-cyan-500 text-white font-black text-xs shadow-md shrink-0 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>ابدأ البث الآن</span>
            </button>
          </div>
        </main>

        {/* RIGHT COLUMN: LIVE CHAT & SPOTLIGHT (Image 4) */}
        <aside
          className={`w-full sm:w-72 border-r border-cyan-900/30 bg-[#070a1c] flex flex-col justify-between shrink-0 ${
            mobileSubTab === 'chat' ? 'flex' : 'hidden sm:flex'
          }`}
        >
          {/* Chat Header */}
          <div className="p-3 border-b border-neutral-800 flex items-center justify-between text-xs font-bold text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Live Chat</span>
            </span>
            <span className="text-neutral-400 font-mono text-[10px]">2.4K online</span>
          </div>

          {/* Chat Stream Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 no-scrollbar text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded-xl transition-all ${
                  msg.isCorrect
                    ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                    : 'bg-neutral-900/60 border border-neutral-800/80 text-white'
                }`}
              >
                <div className="flex items-center gap-1 font-bold text-[11px] mb-0.5">
                  <span className="text-cyan-400">{msg.user}</span>
                  {msg.badge && <span>{msg.badge}</span>}
                </div>
                <p className="text-neutral-200">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Spotlight Card (Image 4: Ahmed أجاب بشكل صحيح +200 🟡) */}
          <div className="p-3 border-t border-neutral-800 bg-[#090e24]">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-neutral-900 to-transparent border border-amber-400/40 flex items-center gap-2.5 mb-2">
              <div className="relative">
                <img
                  src={spotlightUser.avatar}
                  alt={spotlightUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400"
                />
                <Crown className="w-3 h-3 text-amber-400 absolute -top-1 -right-1" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{spotlightUser.name}</p>
                <span className="text-[10px] text-amber-300 font-bold block truncate">
                  {spotlightUser.text}
                </span>
              </div>
            </div>

            {/* Comment / Answer Input Box */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-1.5">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="اكتب الإجابة هنا..."
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
};
