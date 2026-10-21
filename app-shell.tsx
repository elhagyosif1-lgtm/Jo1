import { BottomNav } from '@/components/bottom-nav'
import { cn } from '@/lib/utils'

export function AppShell({
  children,
  nav = true,
  className,
}: {
  children: React.ReactNode
  nav?: boolean
  className?: string
}) {
  return (
    <div className="flex h-dvh w-full justify-center bg-black">
      <div className="relative flex h-full w-full max-w-[480px] flex-col overflow-hidden bg-background md:border-x md:border-border">
        <main className={cn('relative min-h-0 flex-1', className)}>{children}</main>
        {nav && <BottomNav />}
      </div>
    </div>
  )
}

export function PageHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <header className="flex items-center justify-between px-4 pt-safe pb-3">
      <h1 className="text-xl font-black">{title}</h1>
      {action}
    </header>
  )
}
