-- ============================================================
-- DropshipTroopers 2.0 — Database Schema
-- Run this in Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- PROFILES  (extends Supabase auth.users, adds role for admin gating)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'customer' check (role in ('customer','owner')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- PRODUCTS
-- ------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  price_cents integer not null,          -- what the customer pays
  cost_cents integer not null,           -- supplier cost
  margin_cents integer generated always as (price_cents - cost_cents) stored,
  supplier text not null,                -- 'CJDropshipping' | 'Zendrop' | 'Spocket' | 'manual'
  supplier_sku text,
  trending_score integer not null default 0,  -- higher = more "hot" today
  is_active boolean not null default true,
  stock integer not null default 999,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_trending_idx on public.products (trending_score desc);
create index if not exists products_active_idx on public.products (is_active);

-- ------------------------------------------------------------
-- CART ITEMS  (server-synced cart; localStorage is the offline mirror)
-- ------------------------------------------------------------
create table if not exists public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ------------------------------------------------------------
-- ORDERS + ORDER ITEMS
-- ------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  customer_email text not null,
  stripe_session_id text unique,
  stripe_payment_intent text,
  status text not null default 'pending' check (status in ('pending','paid','fulfilled','cancelled','refunded')),
  total_cents integer not null,
  tracking_number text,
  tracking_email_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,   -- snapshot in case product changes later
  unit_price_cents integer not null,
  quantity integer not null
);

create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- profiles: users can read their own profile
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);

-- products: public read for active products; only service role writes
create policy "public read active products" on public.products
  for select using (is_active = true);

-- cart_items: users manage only their own cart
create policy "manage own cart" on public.cart_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- orders: users read only their own orders
create policy "read own orders" on public.orders
  for select using (auth.uid() = user_id);

-- order_items: readable if the parent order belongs to the user
create policy "read own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- Admin (owner) override: owners can read everything.
-- Uses the profiles.role column set manually — see README "Make yourself the owner".
create policy "owner reads all orders" on public.orders
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner')
  );

create policy "owner reads all order items" on public.order_items
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner')
  );

create policy "owner reads all products" on public.products
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner')
  );

-- Note: inserts/updates to products & orders happen via the service_role key
-- from server-side API routes only (checkout + webhook), never from the browser.
