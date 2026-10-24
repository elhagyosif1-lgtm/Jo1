import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { requireSupabase, isSupabaseConfigured } from '../lib/supabase';

export interface ProfileRecord {
  id: string;
  username: string;
  display_name: string;
  level: number;
  is_banned: boolean;
  created_at: string;
}

export interface WalletRecord {
  user_id: string;
  coins: number;
  diamonds: number;
  total_sent: number;
  total_received: number;
  updated_at: string;
  phone?: string;
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  if (!isSupabaseConfigured) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return requireSupabase().auth.onAuthStateChange(callback);
}

export async function getCurrentSession(): Promise<Session | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await requireSupabase().auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signInWithPassword(email: string, password: string): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) throw new Error('Email and password are required.');

  const { data, error } = await requireSupabase().auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });
  if (error) throw error;
  if (!data.user) throw new Error('Supabase did not return an authenticated user.');
  return data.user;
}

export async function signUpWithPassword(
  email: string,
  password: string,
  username: string,
  displayName: string,
): Promise<{ user: User | null; session: Session | null }> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim();
  const normalizedDisplayName = displayName.trim();

  if (!normalizedEmail || !password) throw new Error('Email and password are required.');
  if (password.length < 8) throw new Error('Password must contain at least 8 characters.');
  if (!/^[a-zA-Z0-9_]{3,24}$/.test(normalizedUsername)) {
    throw new Error('Username must be 3–24 characters and contain only letters, numbers, or underscores.');
  }
  if (normalizedDisplayName.length < 1 || normalizedDisplayName.length > 40) {
    throw new Error('Display name must contain 1–40 characters.');
  }

  const { data, error } = await requireSupabase().auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        username: normalizedUsername,
        display_name: normalizedDisplayName,
      },
    },
  });
  if (error) throw error;
  return { user: data.user, session: data.session };
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}

export async function getProfile(userId: string): Promise<ProfileRecord | null> {
  if (!userId) throw new Error('A user ID is required.');
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await requireSupabase()
      .from('profiles')
      .select('id, username, display_name, level, is_banned, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as ProfileRecord | null;
  } catch (err) {
    console.warn('[Supabase] Failed to fetch profile:', err);
    return null;
  }
}

export async function getWallet(userId: string): Promise<WalletRecord | null> {
  if (!userId) throw new Error('A user ID is required.');
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await requireSupabase()
      .from('wallets')
      .select('user_id, coins, diamonds, total_sent, total_received, updated_at, phone')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as WalletRecord | null;
  } catch (err) {
    console.warn('[Supabase] Failed to fetch wallet:', err);
    return null;
  }
}

export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  profileTableAccessible: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured) {
    return { connected: false, profileTableAccessible: false, error: 'Supabase credentials not configured' };
  }
  try {
    const { error } = await requireSupabase().from('profiles').select('id').limit(1);
    if (error) {
      return { connected: false, profileTableAccessible: false, error: error.message };
    }
    return { connected: true, profileTableAccessible: true };
  } catch (err: any) {
    return { connected: false, profileTableAccessible: false, error: err?.message || 'Connection failed' };
  }
}

export interface AppSettingsRecord {
  coins_per_egp: number;
  diamonds_per_egp: number;
  min_withdraw_diamonds: number;
  vodafone_number: string;
  maintenance: boolean;
}

export interface DepositRequestRecord {
  id: string;
  amount_egp: number;
  coins: number;
  vf_number: string;
  tx_ref: string;
  status: 'pending' | 'approved' | 'rejected';
  note: string | null;
  created_at: string;
}

export interface WithdrawalRequestRecord {
  id: string;
  diamonds: number;
  amount_egp: number | string;
  vf_number: string;
  status: 'pending' | 'paid' | 'rejected';
  note: string | null;
  created_at: string;
}

export async function getAppSettings(): Promise<AppSettingsRecord | null> {
  const { data, error } = await requireSupabase()
    .from('app_settings')
    .select('coins_per_egp, diamonds_per_egp, min_withdraw_diamonds, vodafone_number, maintenance')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  return data as AppSettingsRecord | null;
}

export async function listMyRequests(): Promise<{
  deposits: DepositRequestRecord[];
  withdrawals: WithdrawalRequestRecord[];
}> {
  const client = requireSupabase();
  const [deposits, withdrawals] = await Promise.all([
    client
      .from('deposits')
      .select('id, amount_egp, coins, vf_number, tx_ref, status, note, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
    client
      .from('withdrawals')
      .select('id, diamonds, amount_egp, vf_number, status, note, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  if (deposits.error) throw deposits.error;
  if (withdrawals.error) throw withdrawals.error;
  return {
    deposits: (deposits.data ?? []) as DepositRequestRecord[],
    withdrawals: (withdrawals.data ?? []) as WithdrawalRequestRecord[],
  };
}

export async function requestDeposit(amountEgp: number, vfNumber: string, txRef: string): Promise<string> {
  const { data, error } = await requireSupabase().rpc('request_deposit', {
    p_amount_egp: Math.round(amountEgp),
    p_vf_number: vfNumber.trim(),
    p_tx_ref: txRef.trim(),
  });
  if (error) throw error;
  return data as string;
}

export async function requestWithdrawal(diamonds: number, vfNumber: string): Promise<string> {
  const { data, error } = await requireSupabase().rpc('request_withdrawal', {
    p_diamonds: Math.round(diamonds),
    p_vf_number: vfNumber.trim(),
  });
  if (error) throw error;
  return data as string;
}

const FINANCE_ERRORS: Record<string, string> = {
  AUTH_REQUIRED: 'سجّل الدخول أولاً لإتمام العملية.',
  BAD_AMOUNT: 'المبلغ غير صالح.',
  BAD_VF_NUMBER: 'رقم فودافون كاش غير صالح.',
  BAD_PAYOUT_NUMBER: 'رقم المحفظة المستلمة غير صالح.',
  BAD_TX_REFERENCE: 'اكتب رقم عملية فودافون كاش الذي وصلك في رسالة التأكيد.',
  TOO_MANY_PENDING: 'عندك 3 طلبات إيداع قيد المراجعة بالفعل، انتظر مراجعتها أولاً.',
  BELOW_MINIMUM: 'المبلغ أقل من الحد الأدنى للسحب.',
  INSUFFICIENT_DIAMONDS: 'رصيد الألماس لا يكفي لهذا السحب.',
  INVALID_EXCHANGE_RATE: 'إعدادات المنصة غير مكتملة، تواصل مع الدعم.',
  INVALID_WITHDRAWAL_SETTINGS: 'إعدادات المنصة غير مكتملة، تواصل مع الدعم.',
};

export function financeErrorMessage(err: unknown): string {
  const message =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err);

  for (const [code, text] of Object.entries(FINANCE_ERRORS)) {
    if (message.includes(code)) return text;
  }
  if (message.includes('duplicate key')) return 'رقم العملية ده متسجّل قبل كده.';
  return 'تعذّر إتمام العملية. حاول مرة تانية.';
}

export async function sendGiftRpc(params: {
  senderId: string;
  recipientId: string;
  giftId: string;
  costCoins: number;
}): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: true };
  try {
    const { error } = await requireSupabase().rpc('send_gift', {
      p_sender_id: params.senderId,
      p_recipient_id: params.recipientId,
      p_gift_id: params.giftId,
      p_cost_coins: params.costCoins,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to execute send_gift' };
  }
}
