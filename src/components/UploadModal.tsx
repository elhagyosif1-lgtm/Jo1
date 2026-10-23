import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { TRENDING_SOUNDS, FILTER_PRESETS } from '../data/initialVideos';
import { Sound, FilterPreset, VideoCategory } from '../types';
import {
  UploadCloud,
  Camera,
  Video,
  Music,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Sliders,
  Hash,
  Globe,
  SlidersHorizontal,
  Palette,
  Layers,
  Wand2,
  Lock,
  Copy,
  Send,
  ExternalLink
} from 'lucide-react';
import { VideoItem } from '../types';

export const UploadModal: React.FC = () => {
  const {
    publishVideo,
    setActiveTab,
    setCurrentVideoIndex,
    selectedSoundForUpload,
    t,
  } = useApp();

  const [videoSourceType, setVideoSourceType] = useState<'upload' | 'camera' | 'sample'>('upload');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<VideoCategory>('tech');
  const [selectedSound, setSelectedSound] = useState<Sound>(
    selectedSoundForUpload || TRENDING_SOUNDS[0]
  );
  const [selectedFilter, setSelectedFilter] = useState<FilterPreset>(FILTER_PRESETS[0]);
  const [filterIntensity, setFilterIntensity] = useState<number>(100);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [showAdvancedTuning, setShowAdvancedTuning] = useState(false);

  // Default to public so published videos appear in the feed
  const [privacy, setPrivacy] = useState<'private_link' | 'only_me' | 'public'>('public');
  const [allowComments, setAllowComments] = useState(true);
  const [allowShares, setAllowShares] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [justPublishedVideo, setJustPublishedVideo] = useState<VideoItem | null>(null);
  const [linkCopiedToast, setLinkCopiedToast] = useState(false);

  // Live Camera states
  const [isRecording, setIsRecording] = useState(false);
  const videoStreamRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const categoriesList: { id: VideoCategory; label: string; icon: string }[] = [
    { id: 'tech', label: 'تكنولوجيا وذكاء اصطناعي', icon: '💻' },
    { id: 'education', label: 'تعليم ومعرفة', icon: '🧠' },
    { id: 'comedy', label: 'ضحك وكوميديا', icon: '😂' },
    { id: 'animals', label: 'حيوانات وطبيعة', icon: '🐾' },
    { id: 'sports', label: 'رياضة ومغامرات', icon: '🏄‍♂️' },
    { id: 'art', label: 'فن وإبداع', icon: '🎨' },
    { id: 'news', label: 'أخبار وحقائق', icon: '📰' },
    { id: 'drama', label: 'دراما وقصص', icon: '🎭' },
  ];

  const sampleVideos = [
    {
      title: 'أضواء المدينة وسحر النيون 🌃',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-walking-through-the-streets-of-a-city-at-night-43284-large.mp4',
      poster: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
      cat: 'art' as VideoCategory,
    },
    {
      title: 'شروق الشمس وتحدي ركوب الأمواج 🌊',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-surfer-catching-a-wave-43405-large.mp4',
      poster: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&auto=format&fit=crop&q=80',
      cat: 'sports' as VideoCategory,
    },
    {
      title: 'حقول الطبيعة والزهور الصفراء 🌻',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-in-a-field-of-yellow-flowers-43519-large.mp4',
      poster: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&auto=format&fit=crop&q=80',
      cat: 'animals' as VideoCategory,
    },
    {
      title: 'أسرار الهواتف والمستقبل الرقمي 📱',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-glowing-smartphone-in-the-dark-43292-large.mp4',
      poster: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
      cat: 'tech' as VideoCategory,
    },
  ];

  const suggestedTags = ['#Jo1', '#ترند_اليوم', '#مرشحات_سينمائية', '#تيك_توك', '#إبداع', '#ضحك', '#تكنولوجيا'];

  // Combined live CSS filter string
  const computedCssFilter = `${selectedFilter.cssFilter !== 'none' ? selectedFilter.cssFilter : ''} brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      if (!caption) {
        setCaption(`فيديو حصري على Jo1 ✨ ${file.name.replace(/\.[^/.]+$/, '')}`);
      }
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true,
      });
      if (videoStreamRef.current) {
        videoStreamRef.current.srcObject = stream;
        videoStreamRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      alert('تعذر فتح الكاميرا. يمكنك اختيار فيديو من جهازك أو استخدام أحد الفيديوهات الجاهزة!');
    }
  };

  const stopCameraRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handlePublish = () => {
    if (!videoUrl) return;

    setIsPublishing(true);
    const extractedHashtags = caption.match(/#[^\s#]+/g) || ['#Jo1', '#رابط_خاص'];

    setTimeout(() => {
      const createdVideo = publishVideo({
        videoUrl,
        caption: caption.trim() || 'فيديو حصري مع مرشحات سينمائية على Jo1 ✨🎬',
        hashtags: extractedHashtags,
        category,
        music: selectedSound,
        filterApplied: computedCssFilter,
        privacy,
      });

      setIsPublishing(false);
      setPublishedSuccess(true);
      setJustPublishedVideo(createdVideo);
    }, 700);
  };

  const handleAddTag = (tag: string) => {
    if (!caption.includes(tag)) {
      setCaption(prev => (prev ? `${prev} ${tag}` : tag));
    }
  };

  return (
    <div className="w-full h-full bg-neutral-950 text-white overflow-y-auto no-scrollbar flex flex-col pt-safe pb-28">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-md px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <button
          onClick={() => setActiveTab('feed')}
          className="flex items-center gap-1 text-sm font-semibold text-neutral-400 hover:text-white"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة</span>
        </button>
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-rose-500" />
          <span>ستوديو النشر والمرشحات الذكية</span>
        </h2>
        <div className="w-12" />
      </div>

      <div className="max-w-2xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Source Mode Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
          <button
            onClick={() => setVideoSourceType('upload')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              videoSourceType === 'upload'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>رفع ملف</span>
          </button>

          <button
            onClick={() => {
              setVideoSourceType('camera');
              startCamera();
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              videoSourceType === 'camera'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>تصوير كاميرا</span>
          </button>

          <button
            onClick={() => setVideoSourceType('sample')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              videoSourceType === 'sample'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>فيديو تجريبي</span>
          </button>
        </div>

        {/* Video Preview with LIVE Filter Applied */}
        <div className="relative aspect-[9/16] max-h-[440px] mx-auto w-full max-w-[280px] bg-neutral-900 rounded-2xl overflow-hidden border-2 border-neutral-700 flex flex-col items-center justify-center shadow-2xl">
          {videoUrl ? (
            <div className="relative w-full h-full group">
              <video
                src={videoUrl}
                playsInline
                loop
                autoPlay
                style={{ filter: computedCssFilter }}
                className="w-full h-full object-cover transition-all duration-200"
              />

              {/* Active Filter Badge */}
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-white/10 flex items-center gap-1">
                <Palette className="w-3 h-3 text-rose-400" />
                <span>{selectedFilter.nameAr}</span>
              </div>

              <button
                onClick={() => setVideoUrl('')}
                className="absolute top-3 left-3 p-2 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors shadow-lg"
                title="تغيير الفيديو"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          ) : videoSourceType === 'camera' ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
              <video
                ref={videoStreamRef}
                playsInline
                muted
                style={{ filter: computedCssFilter }}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 inset-x-0 flex items-center justify-center">
                {!isRecording ? (
                  <button
                    onClick={startCamera}
                    className="w-14 h-14 rounded-full border-4 border-white flex items-center justify-center bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all"
                  >
                    <div className="w-5 h-5 rounded-full bg-white" />
                  </button>
                ) : (
                  <button
                    onClick={stopCameraRecording}
                    className="w-14 h-14 rounded-full border-4 border-white flex items-center justify-center bg-red-600 animate-pulse active:scale-95"
                  >
                    <div className="w-5 h-5 rounded bg-white" />
                  </button>
                )}
              </div>
            </div>
          ) : videoSourceType === 'sample' ? (
            <div className="w-full h-full p-3 flex flex-col justify-center gap-2 overflow-y-auto no-scrollbar">
              <p className="text-xs font-bold text-center text-neutral-400 mb-1">
                اختر نموذج فيديو لتجربة المرشحات والنشر:
              </p>
              {sampleVideos.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setVideoUrl(sample.url);
                    setCaption(sample.title);
                    setCategory(sample.cat);
                  }}
                  className="flex items-center gap-2 p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-left border border-neutral-700 active:scale-98 transition-all"
                >
                  <img
                    src={sample.poster}
                    alt={sample.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{sample.title}</p>
                    <span className="text-[10px] text-rose-400">تطبيق ونشر ◀</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 text-center cursor-pointer flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-rose-500 mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">حدد فيديو من جهازك</h4>
              <p className="text-xs text-neutral-400 mb-3">MP4, WebM أو MOV حتى 100MB</p>
              <span className="px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white border border-neutral-700">
                تصفح الملفات
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* --- FILTERS & VISUAL EFFECTS STRIP --- */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-rose-500" />
              <h4 className="text-xs font-bold text-white">المرشحات والتأثيرات السينمائية (Filters)</h4>
            </div>
            <button
              onClick={() => setShowAdvancedTuning(!showAdvancedTuning)}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showAdvancedTuning ? 'إخفاء المعايرة' : 'معايرة دقيقة'}</span>
            </button>
          </div>

          {/* Filter Presets Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {FILTER_PRESETS.map(preset => {
              const isActive = selectedFilter.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedFilter(preset)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl shrink-0 min-w-[70px] border transition-all ${
                    isActive
                      ? 'bg-rose-950/60 border-rose-500 text-white shadow-lg'
                      : 'bg-neutral-800/80 border-neutral-700/60 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{preset.badge}</span>
                  <span className="text-[10px] font-bold whitespace-nowrap">{preset.nameAr}</span>
                </button>
              );
            })}
          </div>

          {/* Advanced Sliders (Brightness, Contrast, Saturation) */}
          {showAdvancedTuning && (
            <div className="pt-3 border-t border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span>السطوع (Brightness)</span>
                <span className="font-mono">{brightness}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="140"
                value={brightness}
                onChange={e => setBrightness(Number(e.target.value))}
                className="w-full accent-rose-500"
              />

              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span>التباين (Contrast)</span>
                <span className="font-mono">{contrast}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="150"
                value={contrast}
                onChange={e => setContrast(Number(e.target.value))}
                className="w-full accent-rose-500"
              />

              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span>تشبع الألوان (Saturation)</span>
                <span className="font-mono">{saturation}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="200"
                value={saturation}
                onChange={e => setSaturation(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
          )}
        </div>

        {/* Video Category Selector for Algorithm */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>تصنيف الفيديو (لتوجيه الخوارزمية للمشاهدين المهتمين)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categoriesList.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-bold border transition-all ${
                  category === cat.id
                    ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="truncate">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Caption & Hashtags */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
            <span>وصف الفيديو والوسوم</span>
            <span className="text-[10px] text-neutral-500">{caption.length}/150</span>
          </label>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            maxLength={150}
            rows={3}
            placeholder={t('captionPlaceholder')}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm text-white placeholder-neutral-500 outline-none focus:ring-1 focus:ring-rose-500 transition-all resize-none"
          />

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-neutral-500 flex items-center gap-1">
              <Hash className="w-3 h-3" /> وسوم مقترحة:
            </span>
            {suggestedTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="px-2 py-0.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-[11px] font-semibold text-neutral-300 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Sound Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
            <Music className="w-4 h-4 text-rose-500" />
            <span>الصوت الموسيقي المرفق</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TRENDING_SOUNDS.map(sound => (
              <div
                key={sound.id}
                onClick={() => setSelectedSound(sound)}
                className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  selectedSound.id === sound.id
                    ? 'bg-rose-950/40 border-rose-500'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <img
                  src={sound.coverUrl}
                  alt={sound.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{sound.title}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{sound.author}</p>
                </div>
                {selectedSound.id === sound.id && (
                  <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & Permissions */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>خصوصية الفيديو والنشر</span>
            </span>
            <select
              value={privacy}
              onChange={e => setPrivacy(e.target.value as any)}
              className="bg-neutral-800 text-xs font-bold text-amber-300 px-3 py-2 rounded-lg border border-neutral-700 outline-none"
            >
              <option value="private_link">🔒 رابط خاص وسري (موصى به - لا يظهر إلا لمن ترسل له الرابط)</option>
              <option value="only_me">👁️ سري لي وحدي فقط</option>
              <option value="public">🌐 عام (الجميع)</option>
            </select>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-200">
            🔒 <strong className="font-bold">نظام الخصوصية المشدد:</strong> عند اختيار الرابط الخاص، لن يظهر الفيديو في الصفحة الرئيسية لأي مستخدم، بل يتم توليد رابط سري مشفر للمشاهدة فقط لمن يحمله.
          </div>

          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-300">السماح بالتعليقات</span>
            <input
              type="checkbox"
              checked={allowComments}
              onChange={e => setAllowComments(e.target.checked)}
              className="accent-rose-600 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-300">السماح بالمشاركة وإعادة النشر</span>
            <input
              type="checkbox"
              checked={allowShares}
              onChange={e => setAllowShares(e.target.checked)}
              className="accent-rose-600 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>

        {/* Publish Video Button */}
        <button
          onClick={handlePublish}
          disabled={!videoUrl || isPublishing}
          className={`w-full py-4 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-2xl transition-all duration-300 active:scale-98 ${
            !videoUrl
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-950/50'
          }`}
        >
          {isPublishing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>جاري تشفير وتوليد الرابط السري والنشر...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>نشر الفيديو وتوليد الرابط السري 🔒</span>
            </>
          )}
        </button>
      </div>

      {/* Secret Direct Link Share Dialog (Celebratory Post-Publish Modal) */}
      {justPublishedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-neutral-900 border-2 border-amber-500/70 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-black text-lg text-white">تم النشر برابط سري خاص بنجاح! 🔒</h3>
                <p className="text-xs text-amber-300/90 font-medium">
                  الفيديو مشفر وغير معروض في الصفحة الرئيسية، ومتاح فقط لمن ترسل له هذا الرابط:
                </p>
              </div>
            </div>

            {/* Direct Secret Link Display Box */}
            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2">
              <span className="text-[11px] font-bold text-neutral-400 block">رابط الفيديو السري المباشر:</span>
              <div className="flex items-center gap-2 bg-neutral-900 px-3 py-2.5 rounded-xl border border-neutral-700">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/?v=${justPublishedVideo.id}`}
                  className="bg-transparent text-xs text-emerald-400 font-mono font-bold flex-1 outline-none select-all truncate"
                />
                <button
                  type="button"
                  onClick={() => {
                    const secretUrl = `${window.location.origin}/?v=${justPublishedVideo.id}`;
                    navigator.clipboard?.writeText(secretUrl);
                    setLinkCopiedToast(true);
                    setTimeout(() => setLinkCopiedToast(false), 2500);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shrink-0 shadow-md"
                >
                  {linkCopiedToast ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الرابط</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Instant Share Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `شاهد مقطعي السري الحصري على Jo1: ${window.location.origin}/?v=${justPublishedVideo.id}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>إرسال عبر واتساب</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(
                  `${window.location.origin}/?v=${justPublishedVideo.id}`
                )}&text=${encodeURIComponent('مقطع سري خاص على Jo1')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
                <span>إرسال عبر تيليجرام</span>
              </a>
            </div>

            {/* Navigation Options */}
            <div className="pt-2 border-t border-neutral-800 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setJustPublishedVideo(null);
                  setVideoUrl('');
                  setCaption('');
                  setCurrentVideoIndex(0);
                  setActiveTab('feed');
                }}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition-colors"
              >
                مشاهدة الفيديو بالرابط السري الآن ▶️
              </button>

              <button
                type="button"
                onClick={() => {
                  setJustPublishedVideo(null);
                  setActiveTab('profile');
                }}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-amber-300 transition-colors"
              >
                عرض في قائمتي الخاصة 👤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
