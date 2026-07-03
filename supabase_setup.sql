-- =======================================================
-- KITH SUPABASE DATABASE SETUP & SEED SCRIPT
-- Copy and run this script in the Supabase SQL Editor
-- =======================================================

-- Enable PGCrypto for password hashing in auth seeds
create extension if not exists pgcrypto;

-- 1. DROP EXISTING TABLES & TRIGGERS (If any, to start clean)
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_created_confirm on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.auto_confirm_user();
drop function if exists public.is_admin() cascade;

drop table if exists public.reports cascade;
drop table if exists public.notifications cascade;
drop table if exists public.messages cascade;
drop table if exists public.bookings cascade;
drop table if exists public.mentors cascade;
drop table if exists public.volunteer_registrations cascade;
drop table if exists public.saved_posts cascade;
drop table if exists public.posts cascade;
drop table if exists public.projects cascade;
drop table if exists public.profiles cascade;

-- 2. CREATE PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  role text check (role in ('individual', 'kith', 'admin')) default 'individual',
  avatar text,
  location text,
  bio text,
  skills text[] default '{}',
  interests text[] default '{}',
  languages text[] default '{}',
  availability text,
  categories text[] default '{}',
  impact_score integer default 50,
  volunteer_hours integer default 0,
  items_donated integer default 0,
  people_helped integer default 0,
  events_joined integer default 0,
  badges jsonb default '[]'::jsonb,
  achievements jsonb default '[]'::jsonb,
  verified boolean default false,
  joined_date timestamp with time zone default now()
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

-- 3. PROFILES TRIGGER FUNCTION
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, avatar, location, bio, verified, impact_score)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'individual'),
    coalesce(new.raw_user_meta_data->>'avatar', 'https://api.dicebear.com/7.x/adventurer/svg?seed=' || new.id::text),
    '',
    '',
    false,
    50
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger definition for profiling
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger function for auto-confirming email
create or replace function public.auto_confirm_user()
returns trigger as $$
begin
  new.email_confirmed_at = now();
  new.confirmed_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Trigger definition for auto-confirming email before insert
create trigger on_auth_user_created_confirm
  before insert on auth.users
  for each row execute procedure public.auto_confirm_user();

-- 4. CREATE OTHER KITH TABLES

-- Posts (Opportunities)
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('need_help', 'offer_help', 'donation', 'volunteer', 'event', 'job', 'emergency', 'blood')),
  category text not null,
  title text not null,
  description text not null,
  location text not null,
  photos text[] default '{}',
  urgency text not null check (urgency in ('low', 'medium', 'high', 'critical')) default 'medium',
  created_at timestamp with time zone default now(),
  details jsonb default '{}'::jsonb
);

alter table public.posts enable row level security;

-- Saved Posts (Bookmarks)
create table public.saved_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  unique(user_id, post_id)
);

alter table public.saved_posts enable row level security;

-- Volunteer Registrations
create table public.volunteer_registrations (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'registered' check (status in ('registered', 'completed', 'cancelled')),
  registered_at timestamp with time zone default now(),
  unique(post_id, user_id)
);

alter table public.volunteer_registrations enable row level security;

-- Mentors
create table public.mentors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  name text not null,
  avatar text,
  role text not null,
  bio text,
  skills text[] default '{}',
  languages text[] default '{}',
  availability text,
  rating numeric default 5.0,
  reviews_count integer default 0,
  experience text
);

alter table public.mentors enable row level security;

-- Mentor Bookings
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  mentor_id uuid references public.profiles(id) on delete cascade not null,
  mentee_id uuid references public.profiles(id) on delete cascade not null,
  topic text not null,
  date text not null,
  time text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  notes text
);

alter table public.bookings enable row level security;

-- Community Projects (Fundraisers)
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  organizer text not null,
  goal_amount numeric not null,
  current_amount numeric default 0,
  volunteers_goal integer not null,
  volunteers_joined integer default 0,
  donation_count integer default 0,
  status text not null default 'active' check (status in ('active', 'completed')),
  cover_photo text,
  timeline jsonb default '[]'::jsonb,
  updates jsonb default '[]'::jsonb
);

alter table public.projects enable row level security;

-- Chat Messages
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  timestamp timestamp with time zone default now(),
  status text not null default 'sent' check (status in ('sent', 'delivered', 'read')),
  type text not null default 'text' check (type in ('text', 'location', 'appointment')),
  metadata jsonb
);

alter table public.messages enable row level security;

-- Notifications
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  type text not null check (type in ('system', 'volunteer', 'donation', 'message', 'alert')),
  timestamp timestamp with time zone default now(),
  read boolean default false
);

alter table public.notifications enable row level security;

-- Moderation Reports
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  reported_id uuid not null,
  reported_name text not null,
  type text not null check (type in ('post', 'user', 'message')),
  reason text not null,
  content_snippet text,
  timestamp timestamp with time zone default now(),
  status text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed'))
);

alter table public.reports enable row level security;


-- =======================================================
-- 5. ROW-LEVEL SECURITY (RLS) POLICIES
-- =======================================================

-- Helper admin function
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Profiles Policies
drop policy if exists "Allow public read access to profiles" on public.profiles;
create policy "Allow public read access to profiles" on public.profiles for select using (true);
drop policy if exists "Allow users to update their own profiles" on public.profiles;
create policy "Allow users to update their own profiles" on public.profiles for update using (auth.uid() = id);
drop policy if exists "Allow users to insert their own profile" on public.profiles;
create policy "Allow users to insert their own profile" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "Allow users to delete their own profile" on public.profiles;
create policy "Allow users to delete their own profile" on public.profiles for delete using (auth.uid() = id);

-- Posts Policies
drop policy if exists "Allow public read access to posts" on public.posts;
create policy "Allow public read access to posts" on public.posts for select using (true);
drop policy if exists "Allow authenticated users to create posts" on public.posts;
create policy "Allow authenticated users to create posts" on public.posts for insert with check (auth.uid() = user_id);
drop policy if exists "Allow users to update/delete their own posts" on public.posts;
create policy "Allow users to update/delete their own posts" on public.posts for all using (auth.uid() = user_id);

-- Saved Posts Policies
drop policy if exists "Allow users to manage bookmarks" on public.saved_posts;
create policy "Allow users to manage bookmarks" on public.saved_posts for all using (auth.uid() = user_id);

-- Volunteer Registrations Policies
drop policy if exists "Allow reading registrations" on public.volunteer_registrations;
create policy "Allow reading registrations" on public.volunteer_registrations for select using (true);
drop policy if exists "Allow users to manage own registrations" on public.volunteer_registrations;
create policy "Allow users to manage own registrations" on public.volunteer_registrations for all using (auth.uid() = user_id);

-- Mentors Policies
drop policy if exists "Allow public read access to mentors" on public.mentors;
create policy "Allow public read access to mentors" on public.mentors for select using (true);
drop policy if exists "Allow mentors to manage own profile" on public.mentors;
create policy "Allow mentors to manage own profile" on public.mentors for all using (auth.uid() = user_id);

-- Bookings Policies
drop policy if exists "Allow users to view own bookings" on public.bookings;
create policy "Allow users to view own bookings" on public.bookings for select using (auth.uid() = mentor_id or auth.uid() = mentee_id);
drop policy if exists "Allow users to insert bookings" on public.bookings;
create policy "Allow users to insert bookings" on public.bookings for insert with check (auth.uid() = mentee_id);
drop policy if exists "Allow users to edit own bookings" on public.bookings;
create policy "Allow users to edit own bookings" on public.bookings for update using (auth.uid() = mentor_id or auth.uid() = mentee_id);

-- Projects Policies
drop policy if exists "Allow public read access to projects" on public.projects;
create policy "Allow public read access to projects" on public.projects for select using (true);
drop policy if exists "Allow authenticated users to create/update projects" on public.projects;
create policy "Allow authenticated users to create/update projects" on public.projects for all using (auth.uid() is not null);

-- Messages Policies
drop policy if exists "Allow users to view own chats" on public.messages;
create policy "Allow users to view own chats" on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
drop policy if exists "Allow users to send messages" on public.messages;
create policy "Allow users to send messages" on public.messages for insert with check (auth.uid() = sender_id);

-- Notifications Policies
drop policy if exists "Allow users to view own notifications" on public.notifications;
create policy "Allow users to view own notifications" on public.notifications for select using (auth.uid() = user_id);
drop policy if exists "Allow users to update own notifications" on public.notifications;
create policy "Allow users to update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- Reports Policies
drop policy if exists "Allow admins to view reports" on public.reports;
create policy "Allow admins to view reports" on public.reports for select using (public.is_admin());
drop policy if exists "Allow users to submit reports" on public.reports;
create policy "Allow users to submit reports" on public.reports for insert with check (auth.uid() = reporter_id);
drop policy if exists "Allow admins to update reports" on public.reports;
create policy "Allow admins to update reports" on public.reports for update using (public.is_admin());





