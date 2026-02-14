# Supabase setup for StageSync (free)

StageSync uses **Supabase** so that **chat**, **calendar**, **character/profile edits**, **Set The Stage**, **directors notes**, and **script** all sync in real time across every student’s device. One project backs everything. The free tier is enough for a class (no credit card required).

## 1. Create a Supabase account and project

1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. Click **New project**.
3. Pick an organization (or create one), name the project (e.g. `StageSync`), set a database password and region, then click **Create new project**. Wait until the project is ready.

## 2. Create the database tables (chat + everything else)

1. In the Supabase dashboard, open **SQL Editor**.
2. Click **New query** and run this **entire** block (chat + shared app data):

```sql
-- Chat messages (Group + Shout to Directors)
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('group', 'directors')),
  cast_member text not null,
  text text not null,
  timestamp bigint not null,
  created_at timestamptz default now()
);

alter table public.chat_messages enable row level security;
create policy "Allow all for chat_messages"
  on public.chat_messages for all using (true) with check (true);
alter publication supabase_realtime add table public.chat_messages;

-- Shared store for calendar, set, characters, directors notes, script, etc.
create table if not exists public.app_data (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

alter table public.app_data enable row level security;
create policy "Allow all for app_data"
  on public.app_data for all using (true) with check (true);
alter publication supabase_realtime add table public.app_data;
```

3. Click **Run**. You should see “Success”.

## 3. Get your project URL and anon key

1. In the dashboard, go to **Project Settings** (gear icon) → **API**.
2. Copy:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon public** key (under “Project API keys”)

## 4. Add the keys to StageSync

1. Open **`js/supabase-config.js`** in this project.
2. Replace the empty strings with your values:

```javascript
window.StageSyncSupabase = {
  url: 'https://YOUR_PROJECT_REF.supabase.co',
  anonKey: 'your-anon-key-here'
};
```

3. Save the file.

**Important:** If you push this project to a **public** repo, do **not** commit real keys. Use a separate file (e.g. `supabase-config.local.js`) and add it to `.gitignore`, or use environment variables when you deploy.

## 5. Deploy and test

- Serve the site (e.g. run `./start-server.sh` or open via your host).
- **Chat:** Open Chat on two devices; messages should appear on both in real time.
- **Calendar / Set The Stage / Script / Directors notes / Character pages:** Edits on one device should show up on others (refresh or, where supported, live).

If `js/supabase-config.js` has no URL or anon key, the app falls back to **localStorage** (data stays on one device only).
