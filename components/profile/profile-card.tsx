export function ProfileCard({ name, handle, bio, followers }: { name: string; handle: string; bio: string; followers: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-white">{name}</p>
          <p className="text-sm text-gray-400">{handle}</p>
        </div>
        <button className="rounded-full bg-[#ffd75f] px-3 py-1.5 text-xs font-bold text-[#0b0d11]">متابعة</button>
      </div>
      <p className="mt-3 text-sm text-gray-300">{bio}</p>
      <p className="mt-3 text-xs text-gray-400">{followers} متابع</p>
    </div>
  )
}
