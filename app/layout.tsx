import { Cairo, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  weight: ['300', '500', '700', '900'],
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '600', '800'],
})

export const metadata = {
  title: 'اترك أثر | بث مباشر وفيديوهات قصيرة',
  description: 'منصة عربية للمنشورات المباشرة والفيديوهات القصيرة والهدايا التفاعلية.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  )
}
