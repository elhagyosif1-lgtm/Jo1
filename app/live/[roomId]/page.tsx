import { BottomNav } from '@/components/layout/bottom-nav'

export default function LivePage({ params }: { params: { roomId: string } }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-[#07080c] text-white">
      <header className="border-b border-white/10 px-4 py-4">
        <h1 className="text-lg font-bold">البث المباشر</h1>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="rounded-3xl bg-gradient-to-br from-[#ffcf5a] via-[#ff7c6e] to-[#4cb3ff] p-[1px]">
          <div className="rounded-3xl bg-[#090b11] p-4">
            <p className="text-sm text-gray-300">غرفة البث</p>
            <h2 className="mt-2 text-2xl font-black text-white">{params.roomId}</h2>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-gray-300">المتصلون الآن: 2,842</p>
          <p className="mt-2 text-sm text-gray-400">الرسائل المباشرة، الهدايا، والمشاهدات المتحركة قيد التشغيل.</p>
        </div>
      </div>
      <BottomNav />
    </main>
  )
}
