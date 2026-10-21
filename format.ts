export function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}

export function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return 'الآن'
  if (s < 3600) return `منذ ${Math.floor(s / 60)} د`
  if (s < 86400) return `منذ ${Math.floor(s / 3600)} س`
  return `منذ ${Math.floor(s / 86400)} يوم`
}

export const LEAGUE_NAMES = [
  'برونز ٣', 'برونز ٢', 'برونز ١',
  'فضة ٣', 'فضة ٢', 'فضة ١',
  'ذهب ٣', 'ذهب ٢', 'ذهب ١',
  'بلاتين ٣', 'بلاتين ٢', 'بلاتين ١',
  'ماس ٣', 'ماس ٢', 'ماس ١',
  'نخبة', 'أسطورة', 'إمبراطور',
]

export function leagueName(tier: number) {
  return LEAGUE_NAMES[Math.min(18, Math.max(1, tier)) - 1]
}

const RPC_ERRORS: Record<string, string> = {
  not_authenticated: 'يجب تسجيل الدخول أولاً',
  invalid_quantity: 'الكمية غير صالحة',
  insufficient_coins: 'رصيد العملات غير كافٍ',
  stream_not_live: 'البث انتهى',
  cannot_gift_self: 'لا يمكنك إرسال هدية لنفسك',
  gift_not_found: 'الهدية غير موجودة',
  banned: 'حسابك موقوف',
  email_not_confirmed: 'أكّد بريدك الإلكتروني أولاً',
  already_claimed: 'تم استلام المكافأة مسبقاً',
  invalid_amount: 'الحد الأدنى للسحب 1000 ماسة',
  insufficient_diamonds: 'رصيد الماس غير كافٍ',
  too_many_pending: 'لديك طلبات سحب معلّقة كثيرة',
  invalid_title: 'عنوان البث غير صالح',
}

export function rpcErrorMessage(message?: string | null) {
  if (!message) return 'حدث خطأ غير متوقع'
  const key = Object.keys(RPC_ERRORS).find((k) => message.includes(k))
  return key ? RPC_ERRORS[key] : 'حدث خطأ غير متوقع'
}

export function videoPublicUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos/${path}`
}
