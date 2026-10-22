import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Copy, Check, Download, MessageCircle, Send, Share2 } from 'lucide-react';

export const ShareModal: React.FC = () => {
  const { activeShareModalVideo, setActiveShareModalVideo, t } = useApp();
  const [copied, setCopied] = useState(false);

  if (!activeShareModalVideo) return null;

  const currentUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTo = (platform: string) => {
    const text = encodeURIComponent(`${activeShareModalVideo.caption} - شاهد على Jo1!`);
    const url = encodeURIComponent(currentUrl);

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = activeShareModalVideo.videoUrl;
    a.download = `jo1-video-${activeShareModalVideo.id}.mp4`;
    a.target = '_blank';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="absolute inset-0"
        onClick={() => setActiveShareModalVideo(null)}
      />

      <div className="relative z-10 w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl select-none animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-rose-500" />
            <h3 className="font-extrabold text-white text-base">{t('share')}</h3>
          </div>
          <button
            onClick={() => setActiveShareModalVideo(null)}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Destinations Grid */}
        <div className="grid grid-cols-4 gap-3 mb-5 text-center">
          <button
            onClick={() => handleShareTo('whatsapp')}
            className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-neutral-800 active:scale-95 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium text-neutral-300">واتساب</span>
          </button>

          <button
            onClick={() => handleShareTo('telegram')}
            className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-neutral-800 active:scale-95 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md">
              <Send className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium text-neutral-300">تيليجرام</span>
          </button>

          <button
            onClick={() => handleShareTo('twitter')}
            className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-neutral-800 active:scale-95 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-neutral-800 text-white flex items-center justify-center border border-neutral-700 shadow-md">
              <span className="text-base font-black">𝕏</span>
            </div>
            <span className="text-[11px] font-medium text-neutral-300">إكس (تويتر)</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-neutral-800 active:scale-95 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-neutral-700 text-white flex items-center justify-center shadow-md">
              <Download className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium text-neutral-300">تحميل</span>
          </button>
        </div>

        {/* Copy Link Input Bar */}
        <div className="flex items-center gap-2 p-1.5 bg-neutral-950 border border-neutral-800 rounded-xl">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="flex-1 bg-transparent text-xs text-neutral-400 px-3 outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>تم النسخ!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t('copyLink')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
