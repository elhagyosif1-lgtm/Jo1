'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

function authErrorMessage(error: unknown) {
  const { code, status } = (error ?? {}) as { code?: string; status?: number }
  if (code === 'email_not_confirmed') return 'يرجى تأكيد بريدك الإلكتروني أولاً — تحقّق من صندوق الوارد.'
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit' || status === 429)
    return 'محاولات كثيرة. انتظر قليلاً ثم أعد المحاولة.'
  if (code === 'weak_password') return 'كلمة المرور ضعيفة. استخدم 8 أحرف على الأقل.'
  if (code === 'email_address_invalid') return 'البريد الإلكتروني غير صالح.'
  if (code === 'invalid_credentials') return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
  return 'حدث خطأ غير متوقع. حاول مرة أخرى.'
}

const inputClass =
  'h-12 w-full rounded-xl border border-input bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none'

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter()
  const params = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    const supabase = createClient()
    setLoading(true)
    setError(null)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        const next = params.get('next')
        router.replace(next && next.startsWith('/') && !next.startsWith('//') ? next : '/')
        router.refresh()
      } else {
        const username = String(form.get('username') ?? '').trim().toLowerCase()
        const displayName = String(form.get('display_name') ?? '').trim()
        if (!/^[a-z0-9_]{3,24}$/.test(username)) {
          setError('اسم المستخدم: 3-24 حرفاً إنجليزياً أو أرقاماً أو _')
          return
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
            data: { username, display_name: displayName || username },
          },
        })
        if (error) throw error
        router.push('/auth/sign-up-success')
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError(authErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.12),transparent_60%)] p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-gold-gradient text-4xl font-black">اترك أثر</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === 'login' ? 'سجّل دخولك لتبدأ البث وإرسال الهدايا' : 'أنشئ حسابك واحصل على 1000 عملة ترحيبية'}
          </p>
        </div>
        <form onSubmit={onSubmit} className="glass flex flex-col gap-4 rounded-3xl p-6">
          {mode === 'signup' && (
            <>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                اسم المستخدم
                <input name="username" required dir="ltr" autoComplete="username" placeholder="atrk_star" className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                الاسم الظاهر
                <input name="display_name" maxLength={64} placeholder="نجم البث" className={inputClass} />
              </label>
            </>
          )}
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            البريد الإلكتروني
            <input name="email" type="email" required dir="ltr" autoComplete="email" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            كلمة المرور
            <input
              name="password"
              type="password"
              required
              minLength={8}
              dir="ltr"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className={inputClass}
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-hot">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="h-12 rounded-xl text-base font-bold">
            {loading ? 'جارٍ التحميل...' : mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? 'ليس لديك حساب؟ ' : 'لديك حساب؟ '}
            <Link href={mode === 'login' ? '/auth/sign-up' : '/auth/login'} className="font-bold text-gold underline-offset-4 hover:underline">
              {mode === 'login' ? 'أنشئ حساباً' : 'سجّل الدخول'}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
