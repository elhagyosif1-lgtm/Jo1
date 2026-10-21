export function LiveStreamCard({ roomName, viewers }: { roomName: string; viewers: number }) {
  return (
    <div className="rounded-3xl border border-[#ffd75f]/40 bg-gradient-to-r from-[#ffd75f]/10 to-[#4cb3ff]/10 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-[#ffd75f]">بث مباشر</p>
      <h3 className="mt-2 text-xl font-black text-white">{roomName}</h3>
      <p className="mt-2 text-sm text-gray-300">المشاهدون الآن: {viewers}</p>
    </div>
  )
}
