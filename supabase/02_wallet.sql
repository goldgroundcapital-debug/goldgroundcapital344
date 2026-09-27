-- GoldGround Capital — wallet + transactions ledger
-- Run in Supabase SQL Editor after 01_schema.sql.

-- 1. Wallets — one per user, source of truth for balance.
create table if not exists public.wallets (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  balance    numeric(18,2) not null default 0,
  locked     numeric(18,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Transactions — append-only ledger of every money movement.
create table if not exists public.transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  kind         text not null check (kind in (
                 'deposit', 'withdrawal', 'fee', 'yield', 'referral',
                 'principal_lock', 'principal_release'
               )),
  amount       numeric(18,2) not null,
  status       text not null check (status in ('pending', 'confirmed', 'failed', 'cancelled')) default 'pending',
  reference    text unique,
  meta         jsonb,
  created_at   timestamptz not null default now(),
  confirmed_at timestamptz
);

create index if not exists transactions_user_created on public.transactions (user_id, created_at desc);
create index if not exists transactions_status       on public.transactions (status);

-- 3. updated_at trigger on wallets.
drop trigger if exists wallets_updated_at on public.wallets;
create trigger wallets_updated_at
  before update on public.wallets
  for each row execute function public.set_updated_at();

-- 4. Auto-create wallet on signup.
create or replace function public.handle_new_user_wallet()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.wallets (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_wallet on auth.users;
create trigger on_auth_user_created_wallet
  after insert on auth.users
  for each row execute function public.handle_new_user_wallet();

-- 5. Backfill wallets for any existing users.
insert into public.wallets (user_id)
  select id from auth.users
  on conflict (user_id) do nothing;

-- 6. RLS — users can read their own wallet + transactions. Writes go through service role.
alter table public.wallets      enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "wallets owner select" on public.wallets;
create policy "wallets owner select"
  on public.wallets for select using (auth.uid() = user_id);

drop policy if exists "txns owner select" on public.transactions;
create policy "txns owner select"
  on public.transactions for select using (auth.uid() = user_id);
