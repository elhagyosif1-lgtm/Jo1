import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VideoItem, Creator, GiftItem, VideoCategory } from '../types';
import { IMPACT_GIFTS_50 } from '../data/giftsData';
import {
  LayoutDashboard,
  Film,
  Users,
  Gift,
  DollarSign,
  Server,
  Settings,
  Plus,
  Trash2,
  Edit,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  Phone,
  ShieldCheck,
  Crown,
  Search,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const AdminBackstageModal: React.FC = () => {
  const {
    videos,
    wallet,
    currentUser,
    updateCurrentUser,
    setActiveTab,
    publishVideo,
  } = useApp();

  const [activeBackstageTab, setActiveBackstageTab] = useState<
    'overview' | 'videos' | 'creators' | 'gifts' | 'vodafone' | 'server'
  >('overview');

  const [localVideos, setLocalVideos] = useState<VideoItem[]>(videos);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddVideoForm, setShowAddVideoForm] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoCaption, setNewVideoCaption] = useState('');
  const [newVideoCategory, setNewVideoCategory] = useState<VideoCategory>('tech');

  // Backup Export: Allows user to save full data file to their machine
  const handleExportFullBackup = () => {
    const backupData = {
      platform: 'Jo1 Short Video Platform',
      version: '2.5.0-Enterprise-4K',
      exportedAt: new Date().toISOString(),
      ownerAccount: {
        username: currentUser.username,
        displayName: currentUser.displayName,
        supporterLevel: currentUser.supporterLevel,
        vodafoneCashNumber: '01090718514',
      },
      walletSummary: {
        coinsBalance: wallet.coinsBalance,
        fiatBalanceUsd: wallet.fiatBalance,
        linkedIban: wallet.linkedIban,
        transactionsCount: wallet.transactions.length,
        transactions: wallet.transactions,
      },
      videosDatabase: localVideos,
      giftsCatalog: IMPACT_GIFTS_50,
      systemArchitecture: {
        streamingCodec: 'NVENC_AV1 / 4K UHD 60FPS',
        creatorProfitShare: '70%',
        platformProfitShare: '30%',
        coinsExchangeRate: '1000 Coins = $5 USD',
      },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jo1_complete_platform_backup_${Date.now()}.json`;
    a.click();
  };

  const handleDeleteVideo = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الفيديو نهائياً من المنصة؟')) {
      setLocalVideos(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleAddNewVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoUrl.trim()) return;

    const published = publishVideo({
      videoUrl: newVideoUrl.trim(),
      caption: newVideoCaption.trim() || 'فيديو مضاف من لوحة تحكم الباك ستيدج ✨',
      hashtags: ['#Jo1', '#حصري', '#الباك_ستيدج'],
      category: newVideoCategory,
      music: {
        id: 'sound-admin',
        title: 'Original Sound - Jo1 Studio',
        author: 'Jo1 Admin',
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
      },
    });

    setLocalVideos(prev => [published, ...prev]);
    setNewVideoUrl('');
    setNewVideoCaption('');
    setShowAddVideoForm(false);
  };

  const filteredVideoList = localVideos.filter(v =>
    v.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.author.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full bg-neutral-950 text-white flex flex-col pt-safe pb-24 overflow-hidden select-none">
      {/* Top Backstage Computer-Grade Header */}
      <div className="px-5 py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-rose-600 to-amber-500 p-0.5 shadow-lg">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
              <span className="font-black text-xs text-white">OS</span>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <span>لوحة التحكم الرئيسية للمنصة (الباك ستيدج - Jo1 Backstage)</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-[10px] font-mono font-bold">
                ROOT ADMIN
              </span>
            </h2>
            <p className="text-[10px] text-neutral-400">
              تحكم كامل ومباشر في السيرفرات، الفيديوهات، فودافون كاش، والأرباح
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Download Complete Backup Button */}
          <button
            onClick={handleExportFullBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black text-xs font-black shadow-lg active:scale-95 transition-all"
            title="تحميل نسخة كاملة لملف المنصة وقواعد البيانات لجهازك"
          >
            <Download className="w-4 h-4" />
            <span>تصدير نسخة كاملة للحفظ (Backup JSON)</span>
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Work Area: Side Nav Tabs + Main Content */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 overflow-hidden">
        {/* Left Side Menu (Desktop grade) */}
        <div className="bg-neutral-950 border-l border-neutral-900 p-3 space-y-1 overflow-y-auto no-scrollbar">
          <button
            onClick={() => setActiveBackstageTab('overview')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeBackstageTab === 'overview'
                ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>نظرة عامة والأرباح</span>
          </button>

          <button
            onClick={() => setActiveBackstageTab('videos')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeBackstageTab === 'videos'
                ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>إدارة وتعديل الفيديوهات</span>
          </button>

          <button
            onClick={() => setActiveBackstageTab('creators')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeBackstageTab === 'creators'
                ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>المستخدمين وصناع المحتوى</span>
          </button>

          <button
            onClick={() => setActiveBackstageTab('gifts')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeBackstageTab === 'gifts'
                ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>كتالوج الـ 50 هدية والأسعار</span>
          </button>

          <button
            onClick={() => setActiveBackstageTab('vodafone')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeBackstageTab === 'vodafone'
                ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Phone className="w-4 h-4 text-rose-500" />
            <span>أرباح فودافون كاش مصر</span>
          </button>

          <button
            onClick={() => setActiveBackstageTab('server')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeBackstageTab === 'server'
                ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Server className="w-4 h-4 text-cyan-400" />
            <span>سيرفرات 4K واستقرار البث</span>
          </button>
        </div>

        {/* Right Main Panel (4 Cols) */}
        <div className="col-span-4 bg-black p-4 sm:p-6 overflow-y-auto no-scrollbar space-y-6">
          {/* TAB 1: OVERVIEW & FINANCIAL KPI */}
          {activeBackstageTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block font-bold">إجمالي أرباح المنصة الصافية</span>
                  <h3 className="text-2xl font-black text-emerald-400 tabular-nums mt-1">
                    ${(wallet.coinsBalance * 0.005 * 0.3).toFixed(2)}
                  </h3>
                  <span className="text-[10px] text-emerald-500">30% حصتك الصافية</span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block font-bold">رصيد العملات المتداول</span>
                  <h3 className="text-2xl font-black text-amber-400 tabular-nums mt-1">
                    {wallet.coinsBalance.toLocaleString()}
                  </h3>
                  <span className="text-[10px] text-neutral-500">1,000 عملة = $5</span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block font-bold">فيديوهات المنصة النشطة</span>
                  <h3 className="text-2xl font-black text-cyan-400 tabular-nums mt-1">
                    {localVideos.length} فيديو
                  </h3>
                  <span className="text-[10px] text-cyan-500">تدفق لا ينتهي مستمر</span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block font-bold">محفظة فودافون كاش المعتمدة</span>
                  <h3 className="text-sm font-mono font-black text-rose-400 tabular-nums mt-2">
                    01090718514
                  </h3>
                  <span className="text-[10px] text-emerald-400">نشطة ومربوطة بنجاح</span>
                </div>
              </div>

              {/* Profit Formula Highlights */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-rose-950/40 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>دراسة الأرباح الثابتة والعادلة (70% للمذيع - 30% للمنصة)</span>
                  </h4>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black">
                    ميزة حصرية تنافس تيك توك
                  </span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  في تيك توك يحصل المبدع على أقل من 50% مع اقتطاعات معقدة. في Jo1 يحصل المبدع على 70% صافي، بينما تحصل المنصة على 30% صافي تحوّل مباشرة إلى فودافون كاش دون أي إزعاج للمبدعين أو تكاليف إضافية!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: VIDEOS MANAGER (CRUD) */}
          {activeBackstageTab === 'videos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="ابحث في الفيديوهات أو صناع المحتوى..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <button
                  onClick={() => setShowAddVideoForm(!showAddVideoForm)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة فيديو جديد</span>
                </button>
              </div>

              {/* Add Video Form Drawer */}
              {showAddVideoForm && (
                <form
                  onSubmit={handleAddNewVideo}
                  className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3"
                >
                  <h4 className="text-xs font-bold text-white">إضافة فيديو للبث المباشر والصفحة الرئيسية</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={newVideoUrl}
                      onChange={e => setNewVideoUrl(e.target.value)}
                      placeholder="رابط ملف الفيديو (MP4 / WebM)..."
                      className="bg-neutral-800 text-xs text-white px-3 py-2 rounded-xl border border-neutral-700 outline-none"
                    />
                    <select
                      value={newVideoCategory}
                      onChange={e => setNewVideoCategory(e.target.value as any)}
                      className="bg-neutral-800 text-xs text-white px-3 py-2 rounded-xl border border-neutral-700 outline-none"
                    >
                      <option value="tech">تكنولوجيا</option>
                      <option value="education">تعليم</option>
                      <option value="comedy">ضحك وكوميديا</option>
                      <option value="animals">حيوانات</option>
                      <option value="sports">رياضة</option>
                      <option value="art">فن</option>
                      <option value="news">أخبار</option>
                      <option value="drama">دراما</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={newVideoCaption}
                    onChange={e => setNewVideoCaption(e.target.value)}
                    placeholder="وصف الفيديو والهاشتاغات..."
                    className="w-full bg-neutral-800 text-xs text-white px-3 py-2 rounded-xl border border-neutral-700 outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddVideoForm(false)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-neutral-400 hover:text-white"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                    >
                      حفظ ونشر فوراً
                    </button>
                  </div>
                </form>
              )}

              {/* Videos Table */}
              <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-900">
                <table className="w-full text-right text-xs">
                  <thead className="bg-neutral-950 text-neutral-400 font-bold border-b border-neutral-800">
                    <tr>
                      <th className="p-3">الفيديو</th>
                      <th className="p-3">الصانع</th>
                      <th className="p-3">التصنيف</th>
                      <th className="p-3">المشاهدات</th>
                      <th className="p-3">الإعجابات</th>
                      <th className="p-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {filteredVideoList.map(v => (
                      <tr key={v.id} className="hover:bg-neutral-850/50 transition-colors">
                        <td className="p-3 flex items-center gap-2">
                          <img
                            src={v.posterUrl || v.author.avatarUrl}
                            alt=""
                            className="w-8 h-12 object-cover rounded-md"
                          />
                          <span className="font-bold text-white line-clamp-1 max-w-xs">{v.caption}</span>
                        </td>
                        <td className="p-3 font-semibold text-neutral-300">@{v.author.username}</td>
                        <td className="p-3 text-cyan-400 font-bold">{v.category}</td>
                        <td className="p-3 font-mono text-neutral-300 tabular-nums">
                          {v.stats.views.toLocaleString()}
                        </td>
                        <td className="p-3 font-mono text-rose-400 tabular-nums">
                          {v.stats.likes.toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteVideo(v.id)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950 hover:text-rose-300 transition-colors"
                            title="حذف الفيديو"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CREATORS & USERS */}
          {activeBackstageTab === 'creators' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">إدارة كبار الداعمين والمبدعين</h4>
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatarUrl}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{currentUser.displayName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-600 text-[10px] font-black text-white">
                        LEVEL 52 SUPPORTER
                      </span>
                    </h4>
                    <p className="text-xs text-neutral-400">@{currentUser.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      updateCurrentUser({ supporterLevel: 52 });
                      alert('تم تثبيت مستوى الداعم الأسطوري 52 بنجاح!');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-black text-xs font-bold"
                  >
                    تثبيت المستوى 52
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 50 GIFTS PRICING */}
          {activeBackstageTab === 'gifts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">كتالوج الـ 50 هدية والأسعار المقننة</h4>
                  <p className="text-xs text-neutral-400">
                    الأسعار من 1,000 إلى 20,000 عملة (1,000 عملة = $5 دولار) - نسبة المذيع 70%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {IMPACT_GIFTS_50.slice(0, 15).map(g => (
                  <div
                    key={g.id}
                    className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{g.emoji}</span>
                      <div>
                        <p className="font-bold text-white truncate max-w-[140px]">{g.nameAr}</p>
                        <span className="text-[10px] text-amber-300 font-mono">
                          {g.costCoins.toLocaleString()} عملة (${g.costCoins * 0.005})
                        </span>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold text-[10px]">
                      مذيع: ${(g.costCoins * 0.005 * 0.7).toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: VODAFONE CASH PAYOUTS */}
          {activeBackstageTab === 'vodafone' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-neutral-900 border border-rose-500/30 space-y-3">
                <div className="flex items-center gap-2 text-rose-500 font-black text-sm">
                  <Phone className="w-5 h-5" />
                  <span>محفظة فودافون كاش المعتمدة لتحويل الأرباح</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl font-mono text-sm">
                  <span className="text-neutral-400">الرقم الشخصي للحساب:</span>
                  <span className="text-rose-400 font-bold text-base">01090718514</span>
                  <span className="text-emerald-400 text-xs font-sans font-bold">✓ مخفي ومحمي عن العام</span>
                </div>
                <p className="text-xs text-neutral-400">
                  جميع عمليات السحب التلقائية والأرباح الصافية (30%) يتم تحويلها دورياً إلى هذا الرقم دون أي تأخير أو عمولات وسيطة.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: SERVER 4K ENDURANCE */}
          {activeBackstageTab === 'server' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
                  <span className="text-neutral-400 block mb-1">دقة البث القصوى</span>
                  <p className="text-base font-black text-cyan-400">4K Ultra HD (2160p60)</p>
                </div>
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
                  <span className="text-neutral-400 block mb-1">استقرار السيرفر</span>
                  <p className="text-base font-black text-emerald-400">99.99% Uptime (أيام متواصلة)</p>
                </div>
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
                  <span className="text-neutral-400 block mb-1">معدل البت الأعلى</span>
                  <p className="text-base font-black text-amber-400">Up to 35,000 kbps CBR</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
