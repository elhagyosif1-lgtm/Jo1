import React, { useState } from 'react';
import { Crown, Sparkles, Flame, Shield, X, Award, Zap, Volume2 } from 'lucide-react';
import { ENIGMA_52_CREST } from '../assets/mrJooAssets';

interface Level52BadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
  interactive?: boolean;
  className?: string;
}

export const Level52Badge: React.FC<Level52BadgeProps> = ({
  size = 'md',
  showTitle = false,
  interactive = true,
  className = '',
}) => {
  const [showModal, setShowModal] = useState(false);

  // Play epic supporter fanfare
  const playImperialFanfare = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;

        // Brass majestic chords (Eb Major triad: Eb4, G4, Bb4, Eb5)
        const notes = [311.13, 392.0, 466.16, 622.25];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + 2.3);
        });
      }
    } catch {}
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    playImperialFanfare();
    setShowModal(true);
  };

  const dimensions = {
    sm: 'h-5 px-1.5 text-[9px] gap-0.5',
    md: 'h-7 px-2.5 text-xs gap-1.5',
    lg: 'h-10 px-4 text-sm gap-2',
  }[size];

  return (
    <>
      <div
        onClick={handleClick}
        className={`relative inline-flex items-center rounded-full font-black select-none transition-all duration-300 ${
          interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
        } ${dimensions} ${className}`}
        style={{
          background: 'linear-gradient(135deg, #0b1120 0%, #171d2d 50%, #060913 100%)',
          border: '1px solid rgba(255, 215, 0, 0.6)',
          boxShadow:
            '0 0 15px rgba(0, 212, 255, 0.4), 0 0 25px rgba(255, 26, 53, 0.35), inset 0 0 8px rgba(255, 215, 0, 0.25)',
        }}
        title="ENIGMA Level 52 — أعلى رتبة داعم إمبراطوري أسطوري"
      >
        {/* Left Blue Plasma Aura */}
        <span className="absolute -left-1 w-2 h-2 rounded-full bg-cyan-400 blur-[2px] animate-pulse" />

        {/* 3D Golden Imperial Crown */}
        <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-400 shrink-0 drop-shadow-[0_0_6px_rgba(255,193,7,0.9)]" />

        {/* Text 'ENIGMA' for larger sizes */}
        {size !== 'sm' && (
          <span className="tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 font-extrabold text-[10px]">
            ENIGMA
          </span>
        )}

        {/* Level 52 Number with Dual Tone */}
        <div className="flex items-center">
          <span className="text-amber-300 font-black">5</span>
          <span className="text-rose-500 font-black">2</span>
        </div>

        {/* Right Red Plasma Aura */}
        <span className="absolute -right-1 w-2 h-2 rounded-full bg-rose-500 blur-[2px] animate-pulse" />

        {showTitle && (
          <span className="text-[10px] text-amber-200 font-bold pr-1 border-r border-amber-400/40 mr-1">
            الإمبراطور الأسطوري
          </span>
        )}
      </div>

      {/* ENIGMA 1 / Level 52 Historic Imperial Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#0e1322] via-[#090c17] to-[#04060b] border-2 border-amber-400/70 p-6 shadow-[0_0_80px_rgba(255,193,7,0.35)] overflow-hidden text-center"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official ENIGMA 1 Crest Image */}
            <div className="relative w-40 h-40 mx-auto mb-4 rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-[0_0_35px_rgba(0,212,255,0.4)]">
              <img
                src={ENIGMA_52_CREST}
                alt="ENIGMA 1 Level 52"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 via-amber-500/20 to-rose-500/20 border border-amber-400/60 mb-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-amber-300">
                ENIGMA 1 — LEVELED BEYOND TIKTOK 50
              </span>
            </div>

            <h3 className="text-xl font-black text-white mb-2">
              رتبة الداعم الإمبراطوري الأسطوري (Level 52)
            </h3>

            <p className="text-xs text-neutral-300 leading-relaxed mb-5">
              هذه الرتبة هي الرتبة السيادية العليا في تاريخ منصات البث المباشر العالمية، تم تصميمها خصيصاً لتتفوق على ليفيل 50 في تيك توك، وتمنح صاحبها هيبة بصرية وصوتية كاملة مع طوق بلازما مزدوج ودرع ذهبي ثلاثي الأبعاد مع كل رسالة وهدية.
            </p>

            <div className="grid grid-cols-2 gap-3 text-right text-xs mb-5">
              <div className="p-3 rounded-2xl bg-neutral-900/90 border border-cyan-500/30">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>طوق البلازما الأزرق</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  صوت تردد صاعق وأثر بصري ساطع مع كل تعليق في البث المباشر.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-900/90 border border-rose-500/30">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>طوق البلازما القرمزي</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  إشعار فوري يعلو بثوث المشاهير عند إرسال الهدايا الإمبراطورية.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-cyan-500 text-white font-extrabold text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              إغلاق الرتبة السيادية
            </button>
          </div>
        </div>
      )}
    </>
  );
};
