import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StreamSettings4K } from '../types';
import {
  Radio,
  Mic,
  MicOff,
  Volume2,
  Tv,
  Users,
  Sparkles,
  Sliders,
  Settings,
  Flame,
  Swords,
  Layers,
  Monitor,
  Video,
  Copy,
  Check,
  Download,
  Server,
  Zap,
  ShieldCheck,
  Cpu,
  X
} from 'lucide-react';

export const LiveStudioOBS: React.FC = () => {
  const { setActiveTab } = useApp();

  const [activeScene, setActiveScene] = useState<'cam' | 'screen' | 'pk' | 'pip'>('cam');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [micVolume, setMicVolume] = useState(85);
  const [bgmVolume, setBgmVolume] = useState(40);
  const [showObsModal, setShowObsModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // 4K and Advanced OBS Stream Settings
  const [streamSettings, setStreamSettings] = useState<StreamSettings4K>({
    resolution: '4K_UHD',
    fps: 60,
    videoBitrateKbps: 24000, // 24 Mbps for 4K60
    audioBitrateKbps: 320,
    encoder: 'NVENC_AV1',
    rtmpServer: 'rtmp://live.jo1.tv/app',
    streamKey: 'jo1_live_sk_4k_01090718514_master_key',
    latencyMode: 'ultra_low',
  });

  const [uptimeSeconds, setUptimeSeconds] = useState(128450); // e.g. 35+ hours continuous uptime
  const [goalProgress] = useState(38400);
  const goalTarget = 50000;
  const [pkScoreMy] = useState(1480);
  const [pkScoreRival] = useState(1220);

  const formatUptime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    return `${hours} ساعة و ${minutes} دقيقة بث متواصل`;
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(streamSettings.rtmpServer);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(streamSettings.streamKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleExportObsConfig = () => {
    const obsProfile = {
      name: 'Jo1 4K Ultra Live Studio Profile',
      settings: {
        stream: {
          server: streamSettings.rtmpServer,
          key: streamSettings.streamKey,
          service: 'Custom RTMP',
        },
        video: {
          base_resolution: streamSettings.resolution === '4K_UHD' ? '3840x2160' : '1920x1080',
          output_resolution: streamSettings.resolution === '4K_UHD' ? '3840x2160' : '1920x1080',
          fps: streamSettings.fps,
        },
        output: {
          mode: 'Advanced',
          bitrate: streamSettings.videoBitrateKbps,
          audio_bitrate: streamSettings.audioBitrateKbps,
          encoder: streamSettings.encoder,
          rate_control: 'CBR',
          keyframe_interval: 2,
        },
      },
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(obsProfile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jo1_obs_studio_4k_config.json';
    a.click();
  };

  const playSfx = (type: string) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
    } catch {}
  };

  return (
    <div className="w-full h-full bg-neutral-950 text-white flex flex-col pt-safe pb-24 overflow-hidden select-none">
      {/* Top OBS Bar with 4K indicator and Settings Button */}
      <div className="px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-black shadow-lg">
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-300" />
            <span>OBS 4K ULTRA HD @ 60FPS</span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs font-mono text-neutral-400">
            <span>
              BITRATE: <b className="text-amber-400 font-bold">{streamSettings.videoBitrateKbps} kbps</b>
            </span>
            <span>
              CODEC: <b className="text-cyan-400 font-bold">{streamSettings.encoder}</b>
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> <span>ثبات دائم 24/7</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* OBS Direct Setup Button */}
          <button
            onClick={() => setShowObsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-amber-300 border border-amber-400/30 active:scale-95 transition-all shadow-md"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>إعدادات ربط OBS</span>
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Studio Work Area */}
      <div className="flex-1 p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-y-auto no-scrollbar">
        {/* Left/Center Video Canvas Monitor (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {/* Main Program Video Monitor */}
          <div className="relative aspect-video max-h-[460px] w-full bg-black rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl flex items-center justify-center">
            {activeScene === 'cam' && (
              <video
                src="https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-fashion-model-in-the-city-43285-large.mp4"
                playsInline
                loop
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            )}

            {activeScene === 'screen' && (
              <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-neutral-900 to-black p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-bold text-white">شاشة العرض المباشرة 4K - Jo1 Screen Deck</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-xs font-mono font-bold">
                    3840x2160 @ 60FPS
                  </span>
                </div>
                <div className="py-8 text-center">
                  <Sparkles className="w-12 h-12 text-rose-500 mx-auto mb-2 animate-bounce" />
                  <h3 className="text-xl font-black text-white">بث شاشة ومحتوى بجودة 4K حقيقية</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    متصل بمحطة السيرفر ذات النطاق العريض ومقاومة الانقطاع
                  </p>
                </div>
              </div>
            )}

            {activeScene === 'pk' && (
              <div className="w-full h-full grid grid-cols-2 bg-black relative">
                <div className="relative h-full border-r border-rose-500/50">
                  <video
                    src="https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-fashion-model-in-the-city-43285-large.mp4"
                    playsInline
                    loop
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/60 text-xs font-bold text-rose-400 border border-rose-500/30">
                    أنت: {pkScoreMy} نقطة
                  </div>
                </div>

                <div className="relative h-full">
                  <video
                    src="https://assets.mixkit.co/videos/preview/mixkit-girl-walking-through-the-streets-of-a-city-at-night-43284-large.mp4"
                    playsInline
                    loop
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 text-xs font-bold text-cyan-400 border border-cyan-500/30">
                    المنافس: {pkScoreRival} نقطة
                  </div>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-rose-600 to-cyan-500 text-white font-black flex items-center justify-center text-sm shadow-[0_0_25px_rgba(244,63,94,0.8)] border-2 border-white animate-pulse">
                    VS
                  </div>
                </div>

                <div className="absolute bottom-3 inset-x-4 z-20 h-3 rounded-full bg-neutral-900 border border-white/20 overflow-hidden flex">
                  <div
                    className="h-full bg-rose-600 transition-all duration-300"
                    style={{ width: `${(pkScoreMy / (pkScoreMy + pkScoreRival)) * 100}%` }}
                  />
                  <div
                    className="h-full bg-cyan-500 transition-all duration-300"
                    style={{ width: `${(pkScoreRival / (pkScoreMy + pkScoreRival)) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {activeScene === 'pip' && (
              <div className="relative w-full h-full bg-neutral-900">
                <video
                  src="https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-surfer-catching-a-wave-43405-large.mp4"
                  playsInline
                  loop
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 right-4 w-44 h-32 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-2xl">
                  <video
                    src="https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-fashion-model-in-the-city-43285-large.mp4"
                    playsInline
                    loop
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* 24/7 Stability & Uptime Tag */}
            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-emerald-400/40 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{formatUptime(uptimeSeconds)}</span>
            </div>
          </div>

          {/* Scene Switcher Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setActiveScene('cam')}
              className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                activeScene === 'cam'
                  ? 'bg-rose-950/60 border-rose-500 text-rose-400 shadow-md'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>كاميرا 4K الرئيسية</span>
            </button>

            <button
              onClick={() => setActiveScene('screen')}
              className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                activeScene === 'screen'
                  ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-md'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>مشاركة الشاشة</span>
            </button>

            <button
              onClick={() => setActiveScene('pk')}
              className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                activeScene === 'pk'
                  ? 'bg-amber-950/60 border-amber-400 text-amber-300 shadow-md'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>تحدي PK ثنائي</span>
            </button>

            <button
              onClick={() => setActiveScene('pip')}
              className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                activeScene === 'pip'
                  ? 'bg-purple-950/60 border-purple-400 text-purple-300 shadow-md'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>صورة داخل صورة</span>
            </button>
          </div>
        </div>

        {/* Right OBS Control Deck (Audio Mixer & Bitrate Monitor) */}
        <div className="space-y-4">
          {/* Server Uptime & Strength Card */}
          <div className="p-4 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>حالة خادم البث الفائق</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black">
                نشط 100%
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              سيرفر مخصص متصل بشبكات CDN العالمية لدعم البث المستمر لأيام دون انقطاع، مع تحويل أرباح هدايا اللايف بنسبة 70% تلقائياً.
            </p>
          </div>

          {/* Audio Mixer */}
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-rose-500" />
              <span>مكسر الصوت المباشر (Audio Mixer)</span>
            </h4>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-neutral-300">
                  <Mic className="w-3.5 h-3.5 text-rose-400" />
                  <span>الميكروفون (Mic)</span>
                </span>
                <span className="font-mono text-neutral-400">{isMicMuted ? 'مكتوم' : `${micVolume}%`}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={`p-1.5 rounded-lg text-xs ${
                    isMicMuted ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  disabled={isMicMuted}
                  value={micVolume}
                  onChange={e => setMicVolume(Number(e.target.value))}
                  className="flex-1 accent-rose-500"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-neutral-300">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>صوت الموسيقى</span>
                </span>
                <span className="font-mono text-neutral-400">{bgmVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={bgmVolume}
                onChange={e => setBgmVolume(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: OBS 4K ADVANCED SETTINGS & DIRECT LINK */}
      {showObsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base text-white">إعدادات ربط برنامج OBS Studio بجودة 4K</h3>
              </div>
              <button
                onClick={() => setShowObsModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 py-3">
              {/* RTMP Server URL */}
              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1">
                  رابط خادم البث (RTMP Server URL)
                </label>
                <div className="flex items-center gap-2 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
                  <input
                    type="text"
                    readOnly
                    value={streamSettings.rtmpServer}
                    className="flex-1 bg-transparent text-xs text-white font-mono outline-none"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Stream Key */}
              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1">
                  مفتاح البث المباشر (Stream Key)
                </label>
                <div className="flex items-center gap-2 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
                  <input
                    type="password"
                    readOnly
                    value={streamSettings.streamKey}
                    className="flex-1 bg-transparent text-xs text-white font-mono outline-none"
                  />
                  <button
                    onClick={handleCopyKey}
                    className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Resolution & Bitrate */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-400 block mb-1">دقة البث</label>
                  <select
                    value={streamSettings.resolution}
                    onChange={e => {
                      const res = e.target.value as any;
                      setStreamSettings({
                        ...streamSettings,
                        resolution: res,
                        videoBitrateKbps: res === '4K_UHD' ? 24000 : res === '2K_QHD' ? 14000 : 8000,
                      });
                    }}
                    className="w-full bg-neutral-800 text-xs font-bold text-white px-3 py-2 rounded-xl border border-neutral-700 outline-none"
                  >
                    <option value="4K_UHD">4K Ultra HD (3840x2160)</option>
                    <option value="2K_QHD">2K QHD (2560x1440)</option>
                    <option value="1080p_FHD">1080p FHD (1920x1080)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-400 block mb-1">المعالج الموصى به</label>
                  <select
                    value={streamSettings.encoder}
                    onChange={e => setStreamSettings({ ...streamSettings, encoder: e.target.value as any })}
                    className="w-full bg-neutral-800 text-xs font-bold text-white px-3 py-2 rounded-xl border border-neutral-700 outline-none"
                  >
                    <option value="NVENC_AV1">NVIDIA NVENC AV1 (أعلى جودة 4K)</option>
                    <option value="NVENC_HEVC">NVIDIA NVENC H.265 (HEVC)</option>
                    <option value="NVENC_H264">NVIDIA NVENC H.264</option>
                    <option value="X264_CPU">x264 CPU Software</option>
                  </select>
                </div>
              </div>

              {/* Custom Bitrate Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400 font-bold">معدل البت المخصص (Custom Bitrate)</span>
                  <span className="font-mono text-amber-400 font-bold">{streamSettings.videoBitrateKbps} kbps</span>
                </div>
                <input
                  type="range"
                  min="4500"
                  max="35000"
                  step="500"
                  value={streamSettings.videoBitrateKbps}
                  onChange={e => setStreamSettings({ ...streamSettings, videoBitrateKbps: Number(e.target.value) })}
                  className="w-full accent-amber-400"
                />
              </div>

              {/* 1-Click Export OBS Profile */}
              <button
                onClick={handleExportObsConfig}
                className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-bold flex items-center justify-center gap-2 border border-neutral-700 shadow-md active:scale-95 transition-all"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>تحميل ملف تهيئة OBS التلقائي (.json) بنقرة واحدة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
