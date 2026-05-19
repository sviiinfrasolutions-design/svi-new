-- ============================================================
-- SVI Infra Solutions - Notifications Table Setup
-- Run this ENTIRE script in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Create notifications table
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('info', 'success', 'warning', 'error')),
  is_read boolean not null default false,
  action_url text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 2. Create indexes for performance
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_is_read on public.notifications(is_read);
create index idx_notifications_created_at on public.notifications(created_at desc);

-- 3. Enable Row Level Security
alter table public.notifications enable row level security;

-- 4. Drop existing policies (if any) to avoid conflicts
drop policy if exists "Admins can read all notifications" on public.notifications;
drop policy if exists "Users can read own notifications" on public.notifications;
drop policy if exists "Service role full access" on public.notifications;
drop policy if exists "Insert notifications" on public.notifications;

-- 5. Create RLS policies
create policy "Admins can read all notifications"
  on public.notifications for select
  using (public.is_admin());

create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Service role full access"
  on public.notifications for all
  using (auth.role() = 'service_role');

create policy "Insert notifications"
  on public.notifications for insert
  with check (true);

-- 6. Create auto-update trigger
drop trigger if exists notifications_updated_at on public.notifications;
create trigger notifications_updated_at
  before update on public.notifications
  for each row execute procedure public.handle_updated_at();

-- 7. Verify table creation
select '✅ Notifications table created successfully!' as status;
