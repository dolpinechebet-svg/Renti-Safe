create extension if not exists pgcrypto;

create type request_status as enum ('pending', 'assigned', 'in_progress', 'report_ready', 'cancelled');
create type package_kind as enum ('in_town', 'video_call');
create type flag_status as enum ('pending_review', 'published', 'disputed', 'removed');

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  phone text not null,
  town text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.admin_users (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'RentiSafe Admin'
);

create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_phone text not null,
  landlord_phone text not null,
  listing_link text,
  location_text text,
  town text not null,
  package_type package_kind not null,
  fee_amount integer not null check (fee_amount in (500, 800)),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  status request_status not null default 'pending',
  assigned_agent_id uuid references public.agents(id) on delete set null,
  tracking_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz not null default now(),
  check (listing_link is not null or location_text is not null)
);

create table public.verification_reports (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.verification_requests(id) on delete cascade,
  house_exists boolean not null,
  is_vacant boolean not null,
  caretaker_id_match boolean not null,
  kplc_match boolean not null,
  water_bill_match boolean not null,
  duplicate_listing boolean not null,
  notes text not null default '',
  video_url text,
  photo_urls text[] not null default '{}',
  verdict text not null check (verdict in ('GREEN', 'RED')),
  risk_score integer not null check (risk_score between 0 and 100),
  created_at timestamptz not null default now()
);

create table public.scam_flags (
  id uuid primary key default gen_random_uuid(),
  landlord_phone text not null,
  reason text not null,
  linked_request_id uuid references public.verification_requests(id) on delete set null,
  evidence_urls text[] not null default '{}',
  status flag_status not null default 'pending_review',
  flagged_at timestamptz not null default now()
);

create table public.scam_disputes (
  id uuid primary key default gen_random_uuid(),
  flag_id uuid not null references public.scam_flags(id) on delete cascade,
  submitter_name text not null,
  submitter_phone text not null,
  message text not null,
  evidence_url text,
  status text not null default 'pending_review',
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.verification_requests(id) on delete cascade,
  channel text not null check (channel in ('whatsapp', 'system')),
  message text not null,
  created_at timestamptz not null default now()
);

create table public.chat_logs (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  role text not null check (role in ('user', 'assistant')),
  message text not null,
  created_at timestamptz not null default now()
);

create table public.rental_listings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  town text not null,
  area text not null,
  campus text,
  property_type text not null,
  bedrooms integer not null check (bedrooms between 0 and 10),
  rent_amount integer not null check (rent_amount > 0),
  deposit_amount integer not null check (deposit_amount >= 0),
  amenities text[] not null default '{}',
  contact_phone text not null,
  status text not null default 'available' check (status in ('available', 'let')),
  created_at timestamptz not null default now()
);

create table public.rental_inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.rental_listings(id) on delete restrict,
  name text not null,
  phone text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index requests_town_status_idx on public.verification_requests(town, status);
create index requests_tracking_idx on public.verification_requests(tracking_token);
create index flags_status_phone_idx on public.scam_flags(status, landlord_phone);
create index rental_listings_search_idx on public.rental_listings(status, town, area, rent_amount);

alter table public.agents enable row level security;
alter table public.admin_users enable row level security;
alter table public.verification_requests enable row level security;
alter table public.verification_reports enable row level security;
alter table public.scam_flags enable row level security;
alter table public.scam_disputes enable row level security;
alter table public.notifications enable row level security;
alter table public.chat_logs enable row level security;
alter table public.rental_listings enable row level security;
alter table public.rental_inquiries enable row level security;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where auth_user_id = auth.uid())
$$;
create or replace function public.agent_town() returns text language sql stable security definer set search_path = public as $$
  select town from public.agents where auth_user_id = auth.uid() and active = true limit 1
$$;

create policy "Agents read own profile" on public.agents for select to authenticated
  using (auth_user_id = auth.uid() or public.is_admin());
create policy "Admins manage agents" on public.agents for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Admins read admin users" on public.admin_users for select to authenticated using (public.is_admin());
create policy "Agent and admin town requests" on public.verification_requests for select to authenticated
  using (public.is_admin() or town = public.agent_town());
create policy "Admin manages requests" on public.verification_requests for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Public tracks requests with token via server only" on public.verification_requests for select to anon using (false);
create policy "Assigned town reports" on public.verification_reports for select to authenticated
  using (public.is_admin() or exists (
    select 1 from public.verification_requests r where r.id = request_id and r.town = public.agent_town()
  ));
create policy "Agents submit reports in town" on public.verification_reports for insert to authenticated
  with check (exists (select 1 from public.verification_requests r where r.id = request_id and r.town = public.agent_town()));
create policy "Admins manage reports" on public.verification_reports for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage scam flags" on public.scam_flags for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create or replace view public.published_scam_flags as
  select id,
    case
      when length(regexp_replace(landlord_phone, '\D', '', 'g')) >= 7
      then left(regexp_replace(landlord_phone, '\D', '', 'g'), 4) || ' XXX ' || right(regexp_replace(landlord_phone, '\D', '', 'g'), 3)
      else '••• XXX •••'
    end as masked_phone,
    reason, flagged_at
  from public.scam_flags where status = 'published';
grant select on public.published_scam_flags to anon, authenticated;
create policy "Public submits disputes" on public.scam_disputes for insert to anon, authenticated with check (true);
create policy "Admins review disputes" on public.scam_disputes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "Admins read notifications" on public.notifications for select to authenticated using (public.is_admin());
create policy "Server writes notifications" on public.notifications for insert to service_role with check (true);
create policy "Server manages chat logs" on public.chat_logs for all to service_role using (true) with check (true);
create policy "Public reads available rental listings" on public.rental_listings for select to anon, authenticated using (status = 'available' or public.is_admin());
create policy "Admins manage rental listings" on public.rental_listings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins read rental inquiries" on public.rental_inquiries for select to authenticated using (public.is_admin());
create policy "Server records rental inquiries" on public.rental_inquiries for insert to service_role with check (true);

create or replace function public.get_request_for_tracking(token text)
returns setof public.verification_requests
language sql stable security definer set search_path = public as $$
  select * from public.verification_requests where tracking_token = token limit 1
$$;
revoke all on function public.get_request_for_tracking(text) from public;
grant execute on function public.get_request_for_tracking(text) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('verification-media', 'verification-media', false, 52428800, array['image/jpeg','image/png','image/webp','video/mp4','video/quicktime'])
on conflict (id) do nothing;
create policy "Authenticated agent media uploads" on storage.objects for insert to authenticated
  with check (bucket_id = 'verification-media');
create policy "Private media is admin accessible" on storage.objects for select to authenticated
  using (bucket_id = 'verification-media' and public.is_admin());
