import { BottomNav } from '@/components/layout/bottom-nav'

export default function FeedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-[#07080c] text-white">
      <header className="border-b border-white/10 px-4 py-4">
        <h1 className="text-lg font-bold">التغذية</h1>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-gray-300">ملصقات وتوصيات جديدة للمحتوى العربي.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-gray-300">تابع أفضل المبدعين الآن.</p>
        </div>
      </div>
      <BottomNav />
    </main>
  )
}
