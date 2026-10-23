import React, { useEffect, useRef } from 'react';
import { GiftItem } from '../types';
import { Sparkles, Crown, Flame, Gem, X, Zap, Shield, Orbit } from 'lucide-react';

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

  // Synthesize custom spatial acoustic sound for each gift
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

        const anim = gift.animationType;

        if (anim === 'golden_lion' || anim === 'lion_king' || anim === 'golden_trex') {
          // Deep rumbling roar + brass resonance
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(130, now);
          osc1.frequency.exponentialRampToValueAtTime(45, now + 1.4);
          gain1.gain.setValueAtTime(0.35, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start(now);
          osc1.stop(now + 1.8);
        } else if (anim === 'neon_tiger' || anim === 'tiger') {
          // Cyber lightning strike + tiger growl
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.8);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.2);
        } else if (anim === 'cosmic_whale') {
          // Oceanic deep sub-bass whale song & aquatic resonance
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(120, now);
          osc.frequency.exponentialRampToValueAtTime(320, now + 1.0);
          osc.frequency.exponentialRampToValueAtTime(90, now + 2.5);
          gain.gain.setValueAtTime(0.28, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 2.8);
        } else if (anim === 'golden_eagle' || anim === 'falcon') {
          // Imperial Brass Victory Chords
          [392.0, 523.25, 659.25, 783.99].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.09);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.09 + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.09);
            osc.stop(now + 2.3);
          });
        } else {
          // Enigma Cosmic Warp Synthesizer
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(90, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.7);
          osc.frequency.exponentialRampToValueAtTime(140, now + 2.4);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 2.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 2.6);
        }

        // Royal Chord Finish
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + 2.9);
        });
      }
    } catch {}

    const timer = setTimeout(() => {
      onAnimationEnd();
    }, 4800);

    return () => clearTimeout(timer);
  }, [gift, onAnimationEnd]);

  // Full-Screen Holographic AR Particle Canvas Engine
  useEffect(() => {
    if (!gift || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;
      type: 'dust' | 'spark' | 'star' | 'beam';
    }

    const particles: Particle[] = [];
    const anim = gift.animationType;

    // Palette per gift from Image 1
    let palette = ['#F59E0B', '#FBBF24', '#D97706', '#FFFFFF'];
    if (anim === 'neon_tiger') palette = ['#00D4FF', '#38BDF8', '#0284C7', '#E0F2FE', '#FFFFFF'];
    else if (anim === 'cosmic_whale') palette = ['#0284C7', '#0EA5E9', '#38BDF8', '#818CF8', '#FFFFFF'];
    else if (anim === 'golden_giraffe' || anim === 'golden_eagle') palette = ['#FCD34D', '#F59E0B', '#B45309', '#FEF3C7', '#FFFFFF'];
    else if (anim === 'enigma_galaxy' || anim === 'universe') palette = ['#A855F7', '#EC4899', '#06B6D4', '#FBBF24', '#FFFFFF'];
    else if (anim === 'golden_trex' || anim === 'golden_triceratops') palette = ['#EAB308', '#CA8A04', '#F97316', '#FEF08A', '#FFFFFF'];

    for (let i = 0; i < 240; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 11 + 3;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 7 + 2,
        color: palette[Math.floor(Math.random() * palette.length)],
        alpha: 1,
        decay: Math.random() * 0.014 + 0.007,
        type: Math.random() > 0.5 ? 'star' : 'spark',
      });
    }

    let frame = 0;
    let animationId: number;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw 3D Hologram Projection Rings in Center
      const ringRadius = 140 + Math.sin(frame * 0.08) * 15;
      ctx.save();
      ctx.translate(cx, cy);

      // Rotating Outer Laser Ring
      ctx.rotate(frame * 0.02);
      ctx.strokeStyle = palette[0];
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 18;
      ctx.shadowColor = palette[0];
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Counter-rotating Inner Hexagon Ring
      ctx.rotate(-frame * 0.04);
      ctx.strokeStyle = palette[1];
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      for (let s = 0; s < 6; s++) {
        const hAngle = (s * Math.PI) / 3;
        const hx = Math.cos(hAngle) * (ringRadius * 0.75);
        const hy = Math.sin(hAngle) * (ringRadius * 0.75);
        if (s === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.restore();

      // 2. Render Burst Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
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
    <div className="fixed inset-0 z-[999] pointer-events-none flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-300 select-none">
      {/* Dismiss Button */}
      <button
        onClick={onAnimationEnd}
        className="pointer-events-auto absolute top-5 right-5 z-30 p-2.5 rounded-full bg-black/75 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 shadow-2xl transition-all"
        title="إغلاق العرض"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Radial Ambient Backdrop Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/80 pointer-events-none" />

      {/* Top Banner Announcement Pill */}
      <div className="relative z-20 mb-8 max-w-md mx-4 px-5 py-3 rounded-2xl bg-black/90 backdrop-blur-2xl border-2 border-amber-400/80 shadow-[0_0_50px_rgba(245,158,11,0.6)] flex items-center gap-3 animate-bounce">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-cyan-400 p-0.5 flex items-center justify-center shrink-0 shadow-lg">
          <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
            <span className="text-xs font-black text-amber-300">52</span>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-sm font-black text-white truncate">{senderName}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-rose-600 text-[9px] font-black text-white shrink-0">
              ENIGMA 52
            </span>
          </div>
          <p className="text-[11px] text-amber-300 font-extrabold truncate">
            أرسل هدية سيادية: {gift.nameAr}
          </p>
        </div>
      </div>

      {/* Main Holographic 3D Creature / Artifact Display Center */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Hologram Light Cone Background */}
        <div className="absolute -inset-16 rounded-full bg-gradient-to-tr from-amber-500/25 via-cyan-500/20 to-rose-600/25 blur-3xl animate-pulse" />

        {/* 3D Emote Visual Centerpiece */}
        <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full flex items-center justify-center border-4 border-amber-400/80 bg-black/60 backdrop-blur-md shadow-[0_0_80px_rgba(245,158,11,0.8)] animate-in zoom-in-50 duration-500">
          {/* Animated Glowing Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/60 animate-spin" style={{ animationDuration: '8s' }} />

          {/* Emoji / Symbol scale */}
          <span className="text-7xl md:text-8xl select-none filter drop-shadow-[0_0_30px_rgba(255,255,255,0.9)] animate-bounce">
            {gift.emoji}
          </span>
        </div>

        {/* Gift Title & Value Banner */}
        <div className="mt-6 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
            {gift.nameAr}
          </h2>
          <div className="inline-flex items-center gap-2 mt-2 px-4 py-1 rounded-full bg-neutral-900/90 border border-amber-400/60 shadow-lg">
            <Gem className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-black text-amber-300">
              {gift.costCoins.toLocaleString()} عملة (${(gift.costCoins * 0.005).toFixed(2)} USD)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
