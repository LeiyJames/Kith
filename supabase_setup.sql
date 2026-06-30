-- =======================================================
-- KITH SUPABASE DATABASE SETUP & SEED SCRIPT
-- Copy and run this script in the Supabase SQL Editor
-- =======================================================

-- Enable PGCrypto for password hashing in auth seeds
create extension if not exists pgcrypto;

-- 1. DROP EXISTING TABLES & TRIGGERS (If any, to start clean)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.is_admin();

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
  role text check (role in ('user', 'organization', 'admin')) default 'user',
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
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    coalesce(new.raw_user_meta_data->>'avatar', 'https://api.dicebear.com/7.x/adventurer/svg?seed=' || new.id::text),
    'Downtown District',
    'Just joined Kith! Excited to help out.',
    false,
    50
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger definition
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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
create policy "Allow public read access to profiles" on public.profiles for select using (true);
create policy "Allow users to update their own profiles" on public.profiles for update using (auth.uid() = id);

-- Posts Policies
create policy "Allow public read access to posts" on public.posts for select using (true);
create policy "Allow authenticated users to create posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "Allow users to update/delete their own posts" on public.posts for all using (auth.uid() = user_id);

-- Saved Posts Policies
create policy "Allow users to manage bookmarks" on public.saved_posts for all using (auth.uid() = user_id);

-- Volunteer Registrations Policies
create policy "Allow reading registrations" on public.volunteer_registrations for select using (true);
create policy "Allow users to manage own registrations" on public.volunteer_registrations for all using (auth.uid() = user_id);

-- Mentors Policies
create policy "Allow public read access to mentors" on public.mentors for select using (true);
create policy "Allow mentors to manage own profile" on public.mentors for all using (auth.uid() = user_id);

-- Bookings Policies
create policy "Allow users to view own bookings" on public.bookings for select using (auth.uid() = mentor_id or auth.uid() = mentee_id);
create policy "Allow users to insert bookings" on public.bookings for insert with check (auth.uid() = mentee_id);
create policy "Allow users to edit own bookings" on public.bookings for update using (auth.uid() = mentor_id or auth.uid() = mentee_id);

-- Projects Policies
create policy "Allow public read access to projects" on public.projects for select using (true);
create policy "Allow authenticated users to create/update projects" on public.projects for all using (auth.uid() is not null);

-- Messages Policies
create policy "Allow users to view own chats" on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Allow users to send messages" on public.messages for insert with check (auth.uid() = sender_id);

-- Notifications Policies
create policy "Allow users to view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Allow users to update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- Reports Policies
create policy "Allow admins to view reports" on public.reports for select using (public.is_admin());
create policy "Allow users to submit reports" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "Allow admins to update reports" on public.reports for update using (public.is_admin());


-- =======================================================
-- 6. SEED MOCK DATA
-- =======================================================

-- Seed users in Auth
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values 
  ('00000000-0000-0000-0000-000000000001', 'elena@kith.org', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Elena Chen"}'),
  ('00000000-0000-0000-0000-000000000002', 'contact@greenwoodparks.org', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Greenwood Park Alliance", "role":"organization"}'),
  ('00000000-0000-0000-0000-000000000003', 'info@cityfoodbank.org', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"City Harvest Food Bank", "role":"organization"}'),
  ('00000000-0000-0000-0000-000000000004', 'lucas@kith.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Lucas Vance", "role":"admin"}')
on conflict (id) do nothing;

-- Update User Profiles with detailed attributes
update public.profiles 
set 
  avatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  location = 'Downtown District',
  bio = 'Software engineer who loves teaching high school students mathematics and web technologies. Excited to build strong bonds!',
  skills = '{"Programming", "Math", "Web Dev", "Tutoring"}',
  interests = '{"Volunteer", "Mentorship"}',
  languages = '{"English", "Mandarin"}',
  availability = 'Saturdays 2:00 PM - 6:00 PM',
  categories = '{"Mentorship"}',
  impact_score = 320,
  volunteer_hours = 24,
  items_donated = 3,
  people_helped = 12,
  events_joined = 4,
  badges = '[{"id": "b1", "name": "Helper", "icon": "❤️", "description": "Helped 10 neighbors"}, {"id": "b2", "name": "Brainy", "icon": "🎓", "description": "Completed 5 mentorship sessions"}]'::jsonb
where id = '00000000-0000-0000-0000-000000000001';

update public.profiles 
set 
  role = 'organization',
  avatar = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150',
  location = 'West City Center',
  bio = 'Dedicated to preserving city green spaces, planting native species, and community-led gardening initiatives.',
  skills = '{"Gardening", "Landscaping", "Event Management"}',
  interests = '{"Volunteer", "Environment", "Community Projects"}',
  languages = '{"English", "Spanish"}',
  availability = 'All days, by schedule',
  categories = '{"Volunteer", "Community Events"}',
  impact_score = 1840,
  people_helped = 450,
  verified = true
where id = '00000000-0000-0000-0000-000000000002';

update public.profiles 
set 
  role = 'organization',
  avatar = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150',
  location = 'East Side Industrial Park',
  bio = 'Gathering surplus food and delivering it to shelters and families in need. Zero waste, zero hunger.',
  skills = '{"Logistics", "Food Safety", "Volunteering Coordination"}',
  interests = '{"Donations", "Emergency Response", "Volunteer"}',
  languages = '{"English", "Spanish", "Vietnamese"}',
  availability = 'Monday-Friday 8am - 6pm',
  categories = '{"Donations", "Volunteer", "Emergency Response"}',
  impact_score = 3500,
  people_helped = 2800,
  verified = true
where id = '00000000-0000-0000-0000-000000000003';

update public.profiles 
set 
  role = 'admin',
  avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  location = 'Main Office',
  bio = 'Kith administrator ensuring safe, positive, and productive interactions across our local communities.',
  skills = '{"Moderation", "Community Support"}',
  interests = '{"Community Events"}',
  languages = '{"English"}',
  availability = 'Always online',
  impact_score = 999,
  volunteer_hours = 120,
  items_donated = 50,
  people_helped = 200,
  events_joined = 15,
  badges = '[{"id": "ba", "name": "Staff", "icon": "🔑", "description": "Kith Admin Staff"}]'::jsonb
where id = '00000000-0000-0000-0000-000000000004';


-- Seed Opportunities (Posts)
insert into public.posts (id, user_id, type, category, title, description, location, photos, urgency, created_at, details)
values 
  (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000003',
    'volunteer',
    'Food Distribution',
    'Food Sorting and Packing Volunteers Needed',
    'Join us at the warehouse to sort fresh vegetables, pack non-perishable boxes, and load distribution trucks for local shelters. Friendly environment, snacks provided!',
    'East Side Industrial Depot',
    '{"https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600"}',
    'high',
    now() - interval '2 hours',
    '{"date": "2026-07-01", "time": "9:00 AM - 1:00 PM", "slotsTotal": 15, "slotsFilled": 9, "difficulty": "Moderate", "hoursRequired": 4, "skillsNeeded": ["Teamwork", "Lifting"]}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000001',
    'need_help',
    'Education',
    'Math Tutor Needed for High School Student',
    'Looking for a patient volunteer who can tutor my son in Algebra and trigonometry once a week. We can meet at the public library.',
    'West Side Public Library',
    '{}',
    'medium',
    now() - interval '1 day',
    '{"date": "Ongoing", "time": "Flexible (1-2 hours/week)", "topic": "High School Algebra"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000013',
    '00000000-0000-0000-0000-000000000001',
    'donation',
    'Electronics',
    'Slightly Used Coding Laptop (ThinkPad)',
    'Giving away a fully functional Lenovo ThinkPad. Dual core, 8GB RAM, fresh Linux install. Perfect for a student learning coding or web design.',
    'Downtown Public Library',
    '{"https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600"}',
    'medium',
    now() - interval '3 days',
    '{"condition": "Good / Used", "logistics": "Dropoff / Pickup at Library"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-000000000003',
    'emergency',
    'Emergency Response',
    'Emergency Flood Relief Food Supply Distribution',
    'URGENT: Following the flash flood in Sector 5, we are establishing a temporary food and water distribution depot. We urgently need 5 volunteers to help hand out emergency meal packages and bottled water packets to displaced residents.',
    'Sector 5 Community Center Parking Lot',
    '{"https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600"}',
    'critical',
    now() - interval '10 minutes',
    '{"date": "2026-06-30", "time": "Immediate / Ongoing", "slotsTotal": 10, "slotsFilled": 2, "difficulty": "Moderate", "hoursRequired": 6, "skillsNeeded": ["Emergency Response", "Heavy Lifting"]}'::jsonb
  )
on conflict (id) do nothing;


-- Seed Mentors
insert into public.mentors (id, user_id, name, avatar, role, bio, skills, languages, availability, rating, reviews_count, experience)
values 
  (
    '00000000-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-000000000001',
    'Elena Chen',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'Software Engineer & Math Enthusiast',
    'Offering free mentorship in Intro to Programming (Python/JS/TS), High School Math, Algebra, and SAT Math Prep.',
    '{"Programming", "Math", "Web Dev", "SAT Prep"}',
    '{"English", "Mandarin"}',
    'Saturdays 2:00 PM - 6:00 PM',
    4.9,
    14,
    '3 years volunteering as tutor, Software Engineer at TechCorp'
  ),
  (
    '00000000-0000-0000-0000-000000000022',
    '00000000-0000-0000-0000-000000000004',
    'Lucas Vance',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'Career Advisor & Nonprofit Coach',
    'Happy to review resumes, practice job interviews, and consult on careers in NGO management, marketing, or tech administration.',
    '{"Career Advice", "Resume Review", "Business", "Public Speaking"}',
    '{"English"}',
    'Wednesdays 6:00 PM - 8:00 PM',
    4.8,
    8,
    '8 years career consulting, Executive Director at City Linkages'
  )
on conflict (id) do nothing;


-- Seed Projects
insert into public.projects (id, title, description, organizer, goal_amount, current_amount, volunteers_goal, volunteers_joined, donation_count, status, cover_photo, timeline, updates)
values 
  (
    '00000000-0000-0000-0000-000000000031',
    'Community Garden Revitalization',
    'We are transforming an abandoned 2000 sq ft plot in East City into a vibrant community garden. The project will yield fresh, free vegetables for local residents and provide a learning lab for children. Funds will buy tools, compost, and seeds; volunteer events will handle the building and planting.',
    'Greenwood Park Alliance',
    2500,
    1850,
    30,
    18,
    24,
    'active',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800',
    '[{"id": "t1", "date": "2026-06-01", "title": "Plot Clean-up", "desc": "Cleared trash and old weeds"}, {"id": "t2", "date": "2026-06-15", "title": "Soil Testing & Prep", "desc": "Tested soil and delivered 10 tons of compost"}, {"id": "t3", "date": "2026-07-04", "title": "Fencing & Raised Beds", "desc": "Next volunteer event to build beds"}]'::jsonb,
    '[{"id": "u1", "date": "2026-06-16", "content": "We successfully raised $1800! Big thank you to everyone. The compost has arrived and soil testing reports show high-quality organic levels.", "author": "Greenwood Alliance Coordinator"}]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000032',
    'Little Free Library Network',
    'Building and installing 5 book-sharing boxes across low-income neighborhood playgrounds. Books will be sourced from community donations. Our goal is to make reading material easily accessible for kids of all ages.',
    'Downtown Community Alliance',
    800,
    820,
    10,
    11,
    19,
    'completed',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800',
    '[{"id": "t1", "date": "2026-05-10", "title": "Design Approval", "desc": "Finalized architectural details"}, {"id": "t2", "date": "2026-06-05", "title": "Building Phase", "desc": "Volunteers built 5 robust libraries"}, {"id": "t3", "date": "2026-06-25", "title": "Installation Done", "desc": "All libraries fixed in target parks!"}]'::jsonb,
    '[{"id": "u1", "date": "2026-06-26", "content": "All libraries are set up and fully stocked with children''s and YA books. Thank you to the volunteers who spent their weekend drilling and painting!", "author": "Downtown Coordinator"}]'::jsonb
  )
on conflict (id) do nothing;


-- Seed Notifications for Elena
insert into public.notifications (id, user_id, title, content, type, timestamp, read)
values 
  (
    '00000000-0000-0000-0000-000000000041',
    '00000000-0000-0000-0000-000000000001',
    'Volunteer Slot Confirmed',
    'You have been registered for "Food Sorting and Packing Volunteers Needed" tomorrow at 9:00 AM.',
    'volunteer',
    now() - interval '2 hours',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000042',
    '00000000-0000-0000-0000-000000000001',
    'New Donation Request Nearby',
    'Downtown Community School is seeking donations of children''s storybooks in your area.',
    'donation',
    now() - interval '18 hours',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000043',
    '00000000-0000-0000-0000-000000000001',
    'Welcome to Kith!',
    'Thank you for joining our community! Complete your onboarding details to receive custom recommendations.',
    'system',
    now() - interval '3 days',
    true
  )
on conflict (id) do nothing;

-- Seed Messages
insert into public.messages (id, sender_id, receiver_id, content, timestamp, status, type)
values 
  (
    '00000000-0000-0000-0000-000000000051',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Hi Elena! Thanks for registering to volunteer. Just a quick reminder to wear closed-toe shoes at the warehouse tomorrow.',
    now() - interval '3 hours',
    'read',
    'text'
  ),
  (
    '00000000-0000-0000-0000-000000000052',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'Hi! Thank you for letting me know. I will make sure to wear sneakers. See you tomorrow!',
    now() - interval '2 hours',
    'read',
    'text'
  )
on conflict (id) do nothing;
