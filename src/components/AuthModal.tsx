import React, { useEffect, useState } from 'react';
import { LogIn, LogOut, UserRound, X } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  getCurrentSession,
  getProfile,
  onAuthStateChange,
  signInWithPassword,
  signOut,
  signUpWithPassword,
} from '../services/supabaseService';
import { useApp } from '../context/AppContext';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'حدث خطأ غير متوقع. حاول مرة أخرى.';
}

export const AuthModal: React.FC = () => {
  const { currentUser, updateCurrentUser, language, setExactCoinsBalance } = useApp();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [session, setSession] = useState<Session | null>(null);

  const applySession = async (nextSession: Session | null) => {
    setSession(nextSession);
    if (!nextSession?.user) return;
    try {
      const profile = await getProfile(nextSession.user.id);
      const metadata = nextSession.user.user_metadata ?? {};
      updateCurrentUser({
        id: nextSession.user.id,
        username: profile?.username || String(metadata.username || nextSession.user.email?.split('@')[0] || 'user'),
        displayName: profile?.display_name || String(metadata.display_name || nextSession.user.email?.split('@')[0] || 'مستخدم Jo1'),
        supporterLevel: profile?.level ?? 1,
        isVerified: false,
        bio: profile?.is_banned ? 'الحساب موقوف' : 'عضو في منصة Jo1',
      });
      const walletRecord = await getWallet(nextSession.user.id);
      if (walletRecord && typeof walletRecord.coins === 'number') {
        setExactCoinsBalance(walletRecord.coins);
      }
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let mounted = true;
    getCurrentSession()
      .then((initial) => { if (mounted) void applySession(initial); })
      .catch((e) => { if (mounted) setError(errorMessage(e)); });
    const { data } = onAuthStateChange((_event, nextSession) => {
      if (mounted) void applySession(nextSession);
    });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (mode === 'signin') {
        await signInWithPassword(email, password);
        setNotice('تم تسجيل الدخول بنجاح.');
        setOpen(false);
      } else {
        const result = await signUpWithPassword(email, password, username, displayName);
        if (result.session) {
          setNotice('تم إنشاء الحساب بنجاح.');
          setOpen(false);
        } else {
          setNotice('تم إنشاء الحساب. افتح بريدك الإلكتروني لتأكيده ثم سجّل الدخول.');
          setMode('signin');
        }
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);
    setError('');
    try {
      await signOut();
      setSession(null);
      setNotice('تم تسجيل الخروج.');
      updateCurrentUser({
        id: 'guest',
        username: 'guest',
        displayName: 'زائر Jo1',
        supporterLevel: 1,
        isVerified: false,
        bio: 'زائر في منصة Jo1',
      });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const ar = language === 'ar';
  return (
    <>
      <button
        onClick={() => { setOpen(true); setError(''); setNotice(''); }}
        className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-2.5 py-1.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/10"
        aria-label={session ? (ar ? 'الحساب' : 'Account') : (ar ? 'تسجيل الدخول' : 'Sign in')}
      >
        <UserRound className="h-3.5 w-3.5" />
        <span>{session ? (ar ? 'حسابي' : 'Account') : (ar ? 'دخول' : 'Sign in')}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-md rounded-3xl border border-neutral-700 bg-neutral-950 p-6 text-white shadow-2xl">
            <button onClick={() => setOpen(false)} className="absolute right-4 top-4 rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-600/20 text-rose-400"><UserRound className="h-5 w-5" /></div>
              <div>
                <h2 className="text-xl font-black">{session ? (ar ? 'حسابك' : 'Your account') : (mode === 'signin' ? (ar ? 'تسجيل الدخول' : 'Sign in') : (ar ? 'إنشاء حساب' : 'Create account'))}</h2>
                <p className="mt-1 text-xs text-neutral-400">{ar ? 'حسابك متصل بقاعدة بيانات Jo1' : 'Your account connects to Jo1 database'}</p>
              </div>
            </div>

            {!isSupabaseConfigured ? (
              <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
                {ar ? 'الاتصال غير مُعدّ بعد. أضف VITE_SUPABASE_URL و VITE_SUPABASE_PUBLISHABLE_KEY إلى متغيرات البيئة في الاستضافة.' : 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your hosting environment.'}
              </p>
            ) : session ? (
              <div className="space-y-4">
                <p className="text-sm text-neutral-300">{session.user.email}</p>
                <p className="text-sm text-neutral-400">@{currentUser.username}</p>
                <button disabled={busy} onClick={() => void handleSignOut()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-800 px-4 py-3 font-bold hover:bg-neutral-700 disabled:opacity-50">
                  <LogOut className="h-4 w-4" />{busy ? (ar ? 'جارٍ التنفيذ…' : 'Working…') : (ar ? 'تسجيل الخروج' : 'Sign out')}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                {mode === 'signup' && (
                  <>
                    <input value={username} onChange={e => setUsername(e.target.value)} required minLength={3} maxLength={24} pattern="[A-Za-z0-9_]+" placeholder={ar ? 'اسم المستخدم (إنجليزي)' : 'Username'} className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-rose-500" />
                    <input value={displayName} onChange={e => setDisplayName(e.target.value)} required minLength={1} maxLength={40} placeholder={ar ? 'الاسم الظاهر' : 'Display name'} className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-rose-500" />
                  </>
                )}
                <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder={ar ? 'البريد الإلكتروني' : 'Email'} className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-rose-500" />
                <input type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder={ar ? 'كلمة المرور (8 أحرف على الأقل)' : 'Password (8+ characters)'} className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-rose-500" />
                {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
                {notice && <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</p>}
                <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 font-extrabold hover:bg-rose-500 disabled:opacity-50">
                  <LogIn className="h-4 w-4" />{busy ? (ar ? 'جارٍ التنفيذ…' : 'Working…') : mode === 'signin' ? (ar ? 'دخول' : 'Sign in') : (ar ? 'إنشاء الحساب' : 'Create account')}
                </button>
                <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setNotice(''); }} className="w-full py-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                  {mode === 'signin' ? (ar ? 'ليس لديك حساب؟ أنشئ حسابًا' : "Don't have an account? Sign up") : (ar ? 'لديك حساب بالفعل؟ سجّل الدخول' : 'Already have an account? Sign in')}
                </button>
              </form>
            )}
            {error && !session && !isSupabaseConfigured && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
};
