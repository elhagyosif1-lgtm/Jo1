-- Safe finance schema for Jo1
-- Run this in Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null,
  level integer not null default 0,
  is_banned boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  coins bigint not null default 0 check (coins >= 0),
  diamonds bigint not null default 0 check (diamonds >= 0),
  total_sent bigint not null default 0,
  total_received bigint not null default 0,
  phone text,
  updated_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  id integer primary key check (id = 1),
  coins_per_egp numeric not null default 10,
  diamonds_per_egp numeric not null default 10,
  min_withdraw_diamonds integer not null default 100,
  vodafone_number text not null default '01090718514',
  maintenance boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_egp integer not null check (amount_egp > 0),
  coins integer not null check (coins >= 0),
  vf_number text not null,
  tx_ref text not null unique,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  diamonds integer not null check (diamonds > 0),
  amount_egp integer not null check (amount_egp >= 0),
  vf_number text not null,
  status text not null default 'pending' check (status in ('pending','paid','rejected')),
  note text,
  created_at timestamptz not null default now()
);

create or replace function public.ensure_wallet_for_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.wallets (user_id, coins, diamonds, phone)
  values (p_user_id, 0, 0, null)
  on conflict (user_id) do nothing;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, level, is_banned, created_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', 'User'),
    0,
    false,
    now()
  )
  on conflict (id) do nothing;

  insert into public.wallets (user_id, coins, diamonds, total_sent, total_received, phone, updated_at)
  values (new.id, 0, 0, 0, 0, null, now())
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.request_deposit(
  p_amount_egp integer,
  p_vf_number text,
  p_tx_ref text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_coins bigint;
  v_pending_count integer;
  v_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_amount_egp is null or p_amount_egp <= 0 then
    raise exception 'BAD_AMOUNT';
  end if;

  if p_vf_number is null or length(regexp_replace(p_vf_number, '[^0-9]', '', 'g')) < 11 then
    raise exception 'BAD_VF_NUMBER';
  end if;

  if p_tx_ref is null or length(trim(p_tx_ref)) < 4 then
    raise exception 'BAD_TX_REFERENCE';
  end if;

  select count(*) into v_pending_count
  from public.deposits
  where user_id = v_user_id and status = 'pending';

  if v_pending_count >= 3 then
    raise exception 'TOO_MANY_PENDING';
  end if;

  perform public.ensure_wallet_for_user(v_user_id);

  select floor(p_amount_egp / coalesce((select coins_per_egp from public.app_settings where id = 1), 10))
  into v_coins;

  insert into public.deposits (user_id, amount_egp, coins, vf_number, tx_ref, status)
  values (v_user_id, p_amount_egp, coalesce(v_coins, 0), p_vf_number, p_tx_ref, 'pending')
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.request_withdrawal(
  p_diamonds integer,
  p_vf_number text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_wallet public.wallets%rowtype;
  v_row public.app_settings%rowtype;
  v_amount_egp integer;
  v_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_diamonds is null or p_diamonds <= 0 then
    raise exception 'BAD_AMOUNT';
  end if;

  if p_vf_number is null or length(regexp_replace(p_vf_number, '[^0-9]', '', 'g')) < 11 then
    raise exception 'BAD_VF_NUMBER';
  end if;

  select * into v_wallet from public.wallets where user_id = v_user_id;
  if v_wallet is null then
    perform public.ensure_wallet_for_user(v_user_id);
    select * into v_wallet from public.wallets where user_id = v_user_id;
  end if;

  if p_diamonds > v_wallet.diamonds then
    raise exception 'INSUFFICIENT_DIAMONDS';
  end if;

  select * into v_row from public.app_settings where id = 1;
  if v_row.diamonds_per_egp is null or v_row.diamonds_per_egp <= 0 then
    raise exception 'INVALID_EXCHANGE_RATE';
  end if;

  if p_diamonds < coalesce(v_row.min_withdraw_diamonds, 100) then
    raise exception 'BELOW_MINIMUM';
  end if;

  v_amount_egp := round((p_diamonds / v_row.diamonds_per_egp)::numeric);

  insert into public.withdrawals (user_id, diamonds, amount_egp, vf_number, status)
  values (v_user_id, p_diamonds, v_amount_egp, p_vf_number, 'pending')
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.update_wallet_after_deposit_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    update public.wallets
    set
      coins = coins + new.coins,
      total_received = total_received + new.coins,
      updated_at = now()
    where user_id = new.user_id;
  end if;

  return new;
end;
$$;

create or replace function public.update_wallet_after_withdrawal_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'paid' and old.status is distinct from 'paid' then
    update public.wallets
    set
      diamonds = diamonds - new.diamonds,
      total_sent = total_sent + new.diamonds,
      updated_at = now()
    where user_id = new.user_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_update_wallet_after_deposit_approval on public.deposits;
create trigger trg_update_wallet_after_deposit_approval
after update on public.deposits
for each row
execute function public.update_wallet_after_deposit_approval();

drop trigger if exists trg_update_wallet_after_withdrawal_payment on public.withdrawals;
create trigger trg_update_wallet_after_withdrawal_payment
after update on public.withdrawals
for each row
execute function public.update_wallet_after_withdrawal_payment();

insert into public.app_settings (id, coins_per_egp, diamonds_per_egp, min_withdraw_diamonds, vodafone_number, maintenance)
values (1, 10, 10, 100, '01090718514', false)
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.deposits enable row level security;
alter table public.withdrawals enable row level security;
alter table public.app_settings enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
for select using (auth.uid() = id);

create policy "Wallets are viewable by owner" on public.wallets
for select using (auth.uid() = user_id);

create policy "Deposits are viewable by owner" on public.deposits
for select using (auth.uid() = user_id);

create policy "Withdrawals are viewable by owner" on public.withdrawals
for select using (auth.uid() = user_id);

create policy "App settings visible to all authenticated users" on public.app_settings
for select using (auth.role() = 'authenticated');

create policy "Users can insert their own deposit requests" on public.deposits
for insert with check (auth.uid() = user_id);

create policy "Users can insert their own withdrawal requests" on public.withdrawals
for insert with check (auth.uid() = user_id);

create policy "Users can update only their own wallet phone" on public.wallets
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can create profile entries" on public.profiles
for insert with check (auth.uid() = id);

create policy "Users can update only their own profile" on public.profiles
for update using (auth.uid() = id)
with check (auth.uid() = id);
