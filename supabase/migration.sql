-- ============================================================
-- SVI Infra Solutions — Supabase Database Setup
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- 2. Create profiles table (only if it doesn't already exist)
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text not null,
  phone        text,
  property_interest text,
  notes        text,
  role         text not null default 'client' check (role in ('admin', 'client')),
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 3. Auto-update updated_at on every row change
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Drop trigger if it exists before creating to avoid duplicate errors
drop trigger if exists profiles_updated_at on public.profiles;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- 4. Row Level Security (RLS) — enable it
alter table public.profiles enable row level security;

-- Drop existing policies first to avoid duplicates when re-running
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Service role full access" on public.profiles;

-- Policy: users can read their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Policy: admins can read ALL profiles
-- To avoid infinite recursion in public.profiles, we use a security definer helper function
create or replace function public.is_admin()
returns boolean security definer language plpgsql as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

create policy "Admins can read all profiles"
  on public.profiles for select
  using (
    public.is_admin()
  );


-- Policy: only service role (backend) can insert / update / delete
-- (The createUser API endpoint runs with the service role key, bypassing RLS)
create policy "Service role full access"
  on public.profiles for all
  using (auth.role() = 'service_role');

-- Clean up existing corrupted user (safely cascades to profiles/identities)
DELETE FROM auth.users WHERE email = 'admin@sviinfra.com';

-- Enable pgcrypto extension to allow password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert the default admin user into auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  phone_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'd7b7e8d6-6cbe-4b96-9812-32b0f4ef54ea',
  'authenticated',
  'authenticated',
  'admin@sviinfra.com',
  crypt('AdminPass123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  now(),
  now(),
  null,
  null,
  '',
  '',
  '',
  '',
  ''
);

-- Create the identity so GoTrue knows how to log them in
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'd7b7e8d6-6cbe-4b96-9812-32b0f4ef54ea',
  'd7b7e8d6-6cbe-4b96-9812-32b0f4ef54ea',
  '{"sub": "d7b7e8d6-6cbe-4b96-9812-32b0f4ef54ea", "email": "admin@sviinfra.com"}'::jsonb,
  'email',
  'd7b7e8d6-6cbe-4b96-9812-32b0f4ef54ea',
  now(),
  now(),
  now()
);

-- Associate the default admin user with an admin profile
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('d7b7e8d6-6cbe-4b96-9812-32b0f4ef54ea', 'admin@sviinfra.com', 'System Admin', 'admin')
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', full_name = 'System Admin';

