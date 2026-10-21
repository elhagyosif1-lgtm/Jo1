import { BottomNav } from '@/components/layout/bottom-nav'
import { FeedCard } from '@/components/feed/feed-card'

const videos = [
  {
    id: '1',
    user: 'سارة',
    handle: '@sara',
    title: 'رواية يومية من تقنيتنا',
    description: 'تجربة صغيرة لتجربة Live + short video في منصة عربية',
    duration: '00:18',
    views: '42.8K',
    likes: '8.5K',
  },
  {
    id: '2',
    user: 'محمود',
    handle: '@mahmoud',
    title: 'بث مباشر من الاستوديو',
    description: 'محادثات مباشرة، هدايا، ومشاهدة فورية للمحتوى.',
    duration: '00:26',
    views: '93.1K',
    likes: '15K',
  },
  {
    id: '3',
    user: 'ليلى',
    handle: '@leila',
    title: 'أفكار للإنتاج اليومي',
    description: 'محتوى قصير يساعدك على بناء جمهور عربي مستقر.',
    duration: '00:14',
    views: '28.4K',
    likes: '5.2K',
  },
]

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-[#07080c] text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-4">
        <div>
          <p className="text-xs text-gray-400">منصة اجتماعية</p>
          <h1 className="text-2xl font-black text-[#ffd75f]">اترك أثر</h1>
        </div>
        <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white">
          بحث
        </button>
      </header>

      <div className="flex-1 space-y-4 px-3 py-4">
        {videos.map((video) => (
          <FeedCard key={video.id} {...video} />
        ))}
      </div>

      <BottomNav />
    </main>
  )
}
