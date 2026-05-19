# Notification System Setup Guide

## Overview
A complete real-time notification system has been implemented for the SVI Admin Portal with database integration.

## Features Implemented

### 1. Database Schema
- **Notifications Table**: Stores all notifications with metadata
  - Fields: id, user_id, title, message, type (info/success/warning/error), is_read, action_url, metadata, created_at
  - Indexes on user_id, is_read, and created_at for performance
  - Row Level Security (RLS) policies for admin access

### 2. Components
- **NotificationDropdown** (`src/components/admin/NotificationDropdown.tsx`): 
  - Real-time updates using Supabase subscriptions
  - Mark as read/unread functionality
  - Delete notifications
  - Unread count badge
  - Responsive dropdown UI

### 3. API Endpoints
- **GET /api/admin/notifications**: Fetch notifications with filtering
- **POST /api/admin/notifications**: Create new notifications
- **PATCH /api/admin/notifications/:id**: Mark as read
- **DELETE /api/admin/notifications/:id**: Delete notification

### 4. Utility Functions
- **createNotification()**: Create single notification
- **createNotificationForAllAdmins()**: Broadcast to all admins
- **NotificationHelper**: Pre-built notification types
  - userRegistered()
  - documentCreated()
  - userDeleted()
  - settingsUpdated()
  - systemError()

### 5. Integration Points
- User creation triggers notification
- User deletion triggers notification
- Real-time updates when new notifications arrive

## Setup Instructions

### Step 1: Run Database Migration

You need to run the SQL migration in your Supabase Dashboard:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy the notifications table section from `supabase/migration.sql` (lines 200-251)
3. Execute the SQL

Or copy this SQL directly:

```sql
-- Notifications Table
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

create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_is_read on public.notifications(is_read);
create index idx_notifications_created_at on public.notifications(created_at desc);

alter table public.notifications enable row level security;

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

create trigger notifications_updated_at
  before update on public.notifications
  for each row execute procedure public.handle_updated_at();
```

### Step 2: Seed Sample Notifications

After running the migration, seed sample notifications:

```bash
npx tsx src/lib/supabase/seed-notifications.ts
```

### Step 3: Test the System

1. Login to the admin portal at `/admin`
2. Click the bell icon in the top-right header
3. You should see the seeded notifications
4. Try creating a new user - you'll get a real-time notification
5. Try deleting a user - you'll get another notification

## Usage Examples

### Creating Notifications Programmatically

```typescript
import { NotificationHelper } from '@/src/lib/supabase/notifications';

// When a user registers
await NotificationHelper.userRegistered('John Doe', userId);

// When a document is created
await NotificationHelper.documentCreated('allotment_letter', 'Jane Smith', userId);

// Custom notification
import { createNotificationForAllAdmins } from '@/src/lib/supabase/notifications';

await createNotificationForAllAdmins({
  title: 'System Update',
  message: 'New features have been deployed.',
  type: 'info',
});
```

### Fetching Notifications via API

```typescript
// Get all notifications
const response = await fetch('/api/admin/notifications', {
  headers: { Authorization: `Bearer ${token}` }
});
const { notifications, unreadCount } = await response.json();

// Get only unread notifications
const response = await fetch('/api/admin/notifications?unreadOnly=true', {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Real-Time Updates

The notification system uses Supabase Realtime subscriptions to push updates instantly:

```typescript
// In NotificationDropdown component
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
  }, () => {
    fetchNotifications(); // Refresh on new notification
  })
  .subscribe();
```

## File Structure

```
src/
├── components/admin/
│   ├── NotificationDropdown.tsx    # Main notification UI component
│   └── AdminHeader.tsx              # Updated with notification bell
├── lib/supabase/
│   ├── notifications.ts             # Utility functions & helpers
│   └── seed-notifications.ts        # Sample data seeder
app/
├── api/admin/
│   └── notifications/
│       └── route.ts                 # API endpoints
└── admin/
    └── layout.tsx                   # Passes userId to header
supabase/
└── migration.sql                    # Database schema (updated)
```

## Troubleshooting

### Notifications table not found
- Ensure you've run the migration SQL in Supabase Dashboard
- Check that the table exists: `SELECT * FROM public.notifications LIMIT 1;`

### No notifications appearing
- Verify the admin user ID matches in the database
- Check browser console for errors
- Ensure RLS policies are correctly set

### Real-time updates not working
- Check Supabase Realtime is enabled for the notifications table
- Verify the subscription is active in browser DevTools Network tab

### Permission errors
- Confirm the user has 'admin' role in profiles table
- Check RLS policies allow the operations

## Next Steps

To extend the notification system:

1. Add more integration points (document generation, settings changes, etc.)
2. Implement email notifications for critical alerts
3. Add notification preferences/settings page
4. Implement notification categories/filters
5. Add push notifications for mobile devices
