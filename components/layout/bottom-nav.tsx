'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Radio, Plus, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/feed', label: 'التغذية', icon: Radio },
  { href: '/upload', label: 'نشر', icon: Plus, primary: true },
  { href: '/live/room-demo', label: 'لايف', icon: MessageCircle },
  { href: '/auth/login', label: 'حسابي', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center justify-around border-t border-white/10 bg-[#07080c] px-2 pb-4 pt-2">
      {items.map(({ href, label, icon: Icon, primary }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)

        if (primary) {
          return (
            <Link key={href} href={href} className="flex h-11 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#ffd75f] to-[#ff7c6e] text-[#0b0d11] shadow-lg shadow-yellow-500/20">
              <Icon className="h-5 w-5" />
            </Link>
          )
        }

        return (
          <Link key={href} href={href} className={cn('flex min-w-[64px] flex-col items-center gap-1 text-[11px]', active ? 'text-[#ffd75f]' : 'text-gray-500')}>
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
