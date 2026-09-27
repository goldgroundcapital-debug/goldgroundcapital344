-- GoldGround Capital — initial schema
-- Run this once in Supabase SQL Editor (Project → SQL Editor → New query).

-- 1. Profiles table mirroring auth.users.
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  full_name     text,
  phone         text,
  referral_code text unique,
  referred_by   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2. Auto-generate a referral code from the user id.
create or replace function public.generate_referral_code(user_id uuid)
returns text language plpgsql immutable as $$
begin
  return 'GG-' || upper(substr(replace(user_id::text, '-', ''), 1, 8));
end;
$$;

-- 3. On signup, copy metadata from auth.users.raw_user_meta_data into profiles.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, referral_code, referred_by)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    public.generate_referral_code(new.id),
    nullif(new.raw_user_meta_data ->> 'referred_by', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. updated_at trigger.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 5. Row-Level Security: each user can read & update only their own row.
alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
  on public.profiles for update using (auth.uid() = id);

-- Inserts come from the trigger (running as the function's definer), so no insert policy is needed.
