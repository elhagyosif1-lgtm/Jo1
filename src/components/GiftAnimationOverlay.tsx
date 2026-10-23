import React, { useEffect, useRef } from 'react';
import { GiftItem } from '../types';
import { Sparkles, Crown, Flame, Gem, X } from 'lucide-react';

interface GiftAnimationOverlayProps {
  gift: GiftItem | null;
  senderName: string;
  senderLevel?: number;
  onAnimationEnd: () => void;
}

export const GiftAnimationOverlay: React.FC<GiftAnimationOverlayProps> = ({
  gift,
  senderName,
  senderLevel = 52,
  onAnimationEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Play realistic synthesized sound effect for the gift
  useEffect(() => {
    if (!gift) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        const now = ctx.currentTime;

        if (gift.animationType === 'lion_king' || gift.animationType === 'tiger') {
          // Low-frequency roaring rumble + brass fanfare
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(110, now);
          osc1.frequency.exponentialRampToValueAtTime(55, now + 1.2);
          gain1.gain.setValueAtTime(0.3, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start(now);
          osc1.stop(now + 1.5);
        } else if (gift.animationType === 'big_bang' || gift.animationType === 'supernova') {
          // Cosmic sweep blast
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(80, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.6);
          osc.frequency.exponentialRampToValueAtTime(110, now + 2.0);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 2.2);
        }

        // Royal Fanfare chord
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + 2.6);
        });
      }
    } catch {}

    const timer = setTimeout(() => {
      onAnimationEnd();
    }, 4500);

    return () => clearTimeout(timer);
  }, [gift, onAnimationEnd]);

  // Particle canvas animation with realistic lighting
  useEffect(() => {
    if (!gift || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;
      shape: 'star' | 'circle' | 'diamond' | 'spark';
    }

    const particles: Particle[] = [];
    const colors =
      gift.animationType === 'universe'
        ? ['#A855F7', '#38BDF8', '#EC4899', '#FBBF24', '#FFFFFF']
        : gift.animationType === 'lion_king'
        ? ['#F59E0B', '#FBBF24', '#D97706', '#FFFFFF']
        : gift.animationType === 'phoenix'
        ? ['#EF4444', '#F97316', '#FBBF24', '#FFE4E6']
        : ['#F59E0B', '#10B981', '#06B6D4', '#F43F5E', '#FFFFFF'];

    for (let i = 0; i < 220; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 10 + 4;
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 8 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.015 + 0.006,
        shape: Math.random() > 0.4 ? 'star' : 'spark',
      });
    }

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color;

          ctx.beginPath();
          if (p.shape === 'star') {
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          } else {
            ctx.rect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
          }
          ctx.fill();
          ctx.restore();
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [gift]);

  if (!gift) return null;

  return (
    <div className="fixed inset-0 z-[999] pointer-events-none flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-300">
      {/* Dismiss button */}
      <button
        onClick={onAnimationEnd}
        className="pointer-events-auto absolute top-5 right-5 z-20 p-2.5 rounded-full bg-black/70 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 shadow-2xl transition-all"
        title="إغلاق التأثير"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Dynamic Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Screen flash / shockwave */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/25 via-rose-950/20 to-black/70 animate-pulse pointer-events-none" />

      {/* Top Banner Announcement */}
      <div className="relative z-10 mb-6 max-w-md mx-4 px-6 py-3 rounded-2xl bg-black/90 backdrop-blur-2xl border border-amber-400/70 shadow-[0_0_50px_rgba(245,158,11,0.6)] flex items-center gap-3 animate-bounce">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-cyan-400 p-0.5 flex items-center justify-center shrink-0 shadow-lg">
          <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
            <span className="text-xs font-black text-amber-400">{senderLevel}</span>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-black text-amber-300 truncate">
              الداعم {senderName}
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-[9px] font-black text-white">
              LVL {senderLevel}
            </span>
          </div>
          <p className="text-[11px] font-bold text-white/90 truncate">
            أطلق مجسم: {gift.nameAr}
          </p>
        </div>
      </div>

      {/* Center 3D Realistic Holographic Model Showcase */}
      <div className="relative z-10 flex flex-col items-center scale-100 sm:scale-120 transition-transform animate-in zoom-in-75 duration-500">
        {/* Orbital Energy Rings */}
        <div className="absolute -inset-10 rounded-full border-4 border-amber-400/40 animate-spin-slow" />
        <div className="absolute -inset-16 rounded-full border-2 border-cyan-400/30" />
        <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-amber-500/30 via-rose-600/30 to-purple-600/30 blur-3xl animate-pulse" />

        {/* 3D Realistic Model Box */}
        <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-tr from-black via-neutral-900 to-amber-950/90 border-2 border-amber-400 p-4 shadow-[0_0_90px_rgba(245,158,11,0.9)] flex flex-col items-center justify-center">
          {/* Main Visual Asset / 3D Icon */}
          <span className="text-7xl sm:text-8xl drop-shadow-[0_0_35px_rgba(255,255,255,0.9)] animate-bounce select-none">
            {gift.emoji}
          </span>

          <div className="absolute -bottom-3 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-black text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
            <Flame className="w-3 h-3 text-red-950 fill-red-950" />
            <span>
              {gift.animationType === 'lion_king'
                ? 'الأسد الملكي 1:1'
                : gift.animationType === 'universe'
                ? 'اليونيفيرس 1:1'
                : 'مجسم واقعي أسطوري'}
            </span>
          </div>
        </div>

        {/* Title & Valuation */}
        <div className="mt-6 text-center max-w-sm px-4">
          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-cyan-300 drop-shadow-xl">
            {gift.nameAr}
          </h3>
          <p className="text-xs text-amber-100 font-bold mt-1 line-clamp-2 drop-shadow-md">
            {gift.descriptionAr}
          </p>

          <div className="inline-flex items-center gap-2.5 mt-2.5 px-4 py-1.5 rounded-full bg-black/80 border border-amber-400/50 shadow-lg text-xs font-black tabular-nums">
            <span className="text-amber-300 flex items-center gap-1">
              <Gem className="w-3.5 h-3.5 text-amber-400" />
              <span>{gift.costCoins.toLocaleString()} عملة</span>
            </span>
            <span className="text-neutral-500">|</span>
            <span className="text-emerald-400">
              ${(gift.costCoins * 0.005).toFixed(2)} USD
            </span>
            <span className="text-neutral-500">|</span>
            <span className="text-cyan-300 text-[10px]">
              المذيع: ${(gift.costCoins * 0.005 * 0.7).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
