import { BottomNav } from '@/components/layout/bottom-nav'

export default function UploadPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-[#07080c] text-white">
      <header className="border-b border-white/10 px-4 py-4">
        <h1 className="text-lg font-bold">نشر</h1>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-6 text-center">
          <p className="text-lg font-semibold">اسحب الفيديو هنا</p>
          <p className="mt-2 text-sm text-gray-400">أو اختر من الجهاز</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <label className="mb-2 block text-sm text-gray-300">عنوان الفيديو</label>
          <input className="w-full rounded-xl border border-white/10 bg-[#101319] px-3 py-2 text-white outline-none" placeholder="اكتب عنوانًا" />
        </div>
        <button className="rounded-2xl bg-[#ffd75f] px-4 py-3 font-bold text-[#0b0d11]">نشر الآن</button>
      </div>
      <BottomNav />
    </main>
  )
}
