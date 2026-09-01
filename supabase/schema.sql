-- MoveBeat production schema. Run once in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text,
 avatar_path text,
 weight_kg numeric(5,2) check (weight_kg between 20 and 400),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.teams (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 1 and 80), photo_path text, created_at timestamptz not null default now()
);
create table if not exists public.team_members (
 id uuid primary key default gen_random_uuid(), team_id uuid not null references public.teams(id) on delete cascade,
 name text not null check (char_length(name) between 1 and 80), photo_path text, sort_order integer not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.timer_presets (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null, mode text not null check (mode in ('Games','Workout','HIIT','Boxing','Custom')),
 active_seconds integer not null check (active_seconds between 1 and 86400), rest_seconds integer not null default 0 check (rest_seconds between 0 and 86400),
 rounds integer not null default 1 check (rounds between 1 and 999), end_countdown_seconds integer not null default 10 check (end_countdown_seconds between 1 and 60),
 settings jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.activity_sessions (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 preset_id uuid references public.timer_presets(id) on delete set null, team_id uuid references public.teams(id) on delete set null,
 mode text not null, activity_name text, completed_rounds integer not null default 0, active_seconds integer not null default 0,
 estimated_calories numeric(8,2) not null default 0, completed boolean not null default false, started_at timestamptz not null default now(), ended_at timestamptz
);
create table if not exists public.user_settings (
 owner_id uuid primary key references auth.users(id) on delete cascade, theme text not null default 'dark', language text not null default 'en',
 music_volume numeric(4,3) not null default .8, voice_volume numeric(4,3) not null default 1, countdown_volume numeric(4,3) not null default 1,
 whistle_volume numeric(4,3) not null default .7, settings jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security; alter table public.teams enable row level security; alter table public.team_members enable row level security;
alter table public.timer_presets enable row level security; alter table public.activity_sessions enable row level security; alter table public.user_settings enable row level security;
create policy "profiles-own" on public.profiles for all using (auth.uid()=id) with check (auth.uid()=id);
create policy "teams-own" on public.teams for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create policy "members-via-team" on public.team_members for all using (exists(select 1 from public.teams t where t.id=team_id and t.owner_id=auth.uid())) with check (exists(select 1 from public.teams t where t.id=team_id and t.owner_id=auth.uid()));
create policy "presets-own" on public.timer_presets for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create policy "sessions-own" on public.activity_sessions for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create policy "settings-own" on public.user_settings for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$begin insert into public.profiles(id,display_name) values(new.id,coalesce(new.raw_user_meta_data->>'display_name',split_part(new.email,'@',1))) on conflict do nothing; return new; end;$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('avatars','avatars',true,5242880,array['image/jpeg','image/png','image/webp']),('team-images','team-images',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy "avatar-upload-own" on storage.objects for insert to authenticated with check (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "avatar-update-own" on storage.objects for update to authenticated using (bucket_id='avatars' and owner_id=auth.uid()::text);
create policy "avatar-delete-own" on storage.objects for delete to authenticated using (bucket_id='avatars' and owner_id=auth.uid()::text);
create policy "team-image-upload-own" on storage.objects for insert to authenticated with check (bucket_id='team-images' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "team-image-update-own" on storage.objects for update to authenticated using (bucket_id='team-images' and owner_id=auth.uid()::text);
create policy "team-image-delete-own" on storage.objects for delete to authenticated using (bucket_id='team-images' and owner_id=auth.uid()::text);
