/**
 * Basic feed card block for the short-video app.
 */
export function FeedCard({
  user,
  handle,
  title,
  description,
  duration,
  views,
  likes,
}: {
  user: string
  handle: string
  title: string
  description: string
  duration: string
  views: string
  likes: string
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d1118] shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="font-bold text-white">{user}</p>
          <p className="text-xs text-gray-400">{handle}</p>
        </div>
        <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-gray-300">{duration}</span>
      </div>
      <div className="h-56 bg-gradient-to-br from-[#ffd75f] via-[#ff8d7b] to-[#3c8cff] p-4">
        <div className="flex h-full items-end justify-between rounded-2xl border border-white/20 bg-black/10 p-3 backdrop-blur-sm">
          <div>
            <p className="text-lg font-black text-white">{title}</p>
            <p className="mt-1 text-sm text-white/80">{description}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-xs text-gray-300">
        <span>{views} مشاهدة</span>
        <span>{likes} إعجاب</span>
      </div>
    </article>
  )
}
