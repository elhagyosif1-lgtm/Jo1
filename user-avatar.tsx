import { cn } from '@/lib/utils'

type Props = {
  name: string
  src?: string | null
  size?: number
  ring?: 'gold' | 'glow' | 'hot' | 'none'
  className?: string
}

const ringClass = {
  gold: 'ring-2 ring-gold ring-offset-2 ring-offset-background',
  glow: 'ring-2 ring-glow ring-offset-2 ring-offset-background',
  hot: 'ring-2 ring-hot ring-offset-2 ring-offset-background',
  none: '',
}

export function UserAvatar({ name, src, size = 40, ring = 'none', className }: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gold/80 to-hot/70 font-bold text-background',
        ringClass[ring],
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src || "/placeholder.svg"} alt="" className="size-full object-cover" />
      ) : (
        <span aria-hidden>{initial}</span>
      )}
      <span className="sr-only">{name}</span>
    </span>
  )
}
