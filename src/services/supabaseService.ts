import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { requireSupabase } from '../lib/supabase';

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
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  return requireSupabase().auth.onAuthStateChange(callback);
}

export async function getCurrentSession(): Promise<Session | null> {
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
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}

export async function getProfile(userId: string): Promise<ProfileRecord | null> {
  if (!userId) throw new Error('A user ID is required.');

  const { data, error } = await requireSupabase()
    .from('profiles')
    .select('id, username, display_name, level, is_banned, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as ProfileRecord | null;
}

export async function getWallet(userId: string): Promise<WalletRecord | null> {
  if (!userId) throw new Error('A user ID is required.');

  const { data, error } = await requireSupabase()
    .from('wallets')
    .select('user_id, coins, diamonds, total_sent, total_received, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as WalletRecord | null;
}

/**
 * Read-only smoke test. It verifies the Data API, table visibility, and RLS behavior
 * without inserting, updating, or deleting production data.
 */
export async function checkSupabaseConnection(): Promise<{ connected: true; profileTableAccessible: true }> {
  const { error } = await requireSupabase().from('profiles').select('id').limit(1);
  if (error) throw error;
  return { connected: true, profileTableAccessible: true };
}
