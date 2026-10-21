import { BottomNav } from '@/components/layout/bottom-nav'

export default function AuthLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] items-center justify-center bg-[#07080c] px-4 py-10 text-white">
      <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6">
        <p className="text-center text-xs uppercase tracking-[0.3em] text-[#ffd75f]">تسجيل الدخول</p>
        <h1 className="mt-3 text-center text-3xl font-black">اترك أثر</h1>
        <form className="mt-6 space-y-4">
          <input className="w-full rounded-xl border border-white/10 bg-[#101319] px-3 py-3 text-white placeholder:text-gray-500" placeholder="البريد الإلكتروني" />
          <input type="password" className="w-full rounded-xl border border-white/10 bg-[#101319] px-3 py-3 text-white placeholder:text-gray-500" placeholder="كلمة المرور" />
          <button className="w-full rounded-xl bg-[#ffd75f] px-3 py-3 font-bold text-[#0b0d11]">تسجيل الدخول</button>
        </form>
      </div>
      <BottomNav />
    </main>
  )
}
