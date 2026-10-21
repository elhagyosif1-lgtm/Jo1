'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Radio, Plus, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/live', label: 'مباشر', icon: Radio },
  { href: '/upload', label: 'نشر', icon: Plus, primary: true },
  { href: '/inbox', label: 'الرسائل', icon: MessageCircle },
  { href: '/me', label: 'حسابي', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="التنقل الرئيسي" className="glass z-40 flex items-center justify-around rounded-none border-x-0 border-b-0 px-2 pt-2 pb-safe">
      {items.map(({ href, label, icon: Icon, primary }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
        if (primary) {
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className="flex h-9 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-glow via-white to-hot text-background shadow-[0_0_16px_rgba(255,215,0,0.25)]"
            >
              <Icon className="size-5" strokeWidth={3} />
            </Link>
          )
        }
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-w-14 flex-col items-center gap-0.5 text-[11px] font-medium transition-colors',
              active ? 'text-gold' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
