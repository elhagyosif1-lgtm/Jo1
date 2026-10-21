import Link from 'next/link'

export function AuthMessage({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="glass w-full max-w-sm rounded-3xl p-8 text-center">
        <h1 className="text-gold-gradient text-2xl font-black">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
        <Link href={href} className="mt-6 inline-flex h-11 items-center rounded-xl bg-gold px-6 font-bold text-background">
          {cta}
        </Link>
      </div>
    </div>
  )
}
