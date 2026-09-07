import { pool } from './db.js';

const SCHEMA_SQL = `
create table if not exists accounts (
  id serial primary key,
  email text not null unique,
  password_hash text not null,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists solutions (
  id serial primary key,
  slug text not null unique,
  industry text not null,
  title text not null,
  summary text not null,
  detail text not null,
  output_kind text not null check (output_kind in ('heat','heat-and-power','hydrogen','electricity')),
  temperature_band text not null check (temperature_band in ('up to 250 C','250 to 550 C','550 to 750 C')),
  deployment text not null check (deployment in ('single-module','multi-module')),
  module_count integer not null
);

create table if not exists saved_solutions (
  id serial primary key,
  account_id integer references accounts(id) on delete cascade,
  save_token text,
  solution_id integer not null references solutions(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint saved_solutions_owner_ck check (
    (account_id is not null and save_token is null) or
    (account_id is null and save_token is not null)
  )
);
create unique index if not exists saved_solutions_account_uniq
  on saved_solutions (account_id, solution_id) where account_id is not null;
create unique index if not exists saved_solutions_token_uniq
  on saved_solutions (save_token, solution_id) where save_token is not null;

create table if not exists saved_searches (
  id serial primary key,
  account_id integer not null references accounts(id) on delete cascade,
  name text not null,
  query text,
  industry text,
  output_kind text,
  temperature_band text,
  deployment text,
  created_at timestamptz not null default now(),
  constraint saved_searches_account_name_uniq unique (account_id, name)
);

create table if not exists enquiries (
  id serial primary key,
  reference text not null unique,
  account_id integer references accounts(id) on delete set null,
  name text not null,
  email text not null,
  phone_country text,
  phone text,
  topic text not null check (topic in ('Technology','Solutions','Investor relations','Careers','Suppliers')),
  message text not null,
  status text not null default 'received' check (status in ('received','answered','closed')),
  created_at timestamptz not null default now()
);

create table if not exists access_requests (
  id serial primary key,
  reference text not null unique,
  account_id integer not null unique references accounts(id) on delete cascade,
  organisation text not null,
  role_title text not null,
  status text not null default 'pending' check (status in ('pending','approved','declined')),
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id serial primary key,
  slug text not null unique,
  title text not null,
  category text not null,
  published_at date not null
);

create table if not exists jobs (
  id serial primary key,
  slug text not null unique,
  title text not null,
  location text not null,
  team text not null,
  description text not null
);

create table if not exists applications (
  id serial primary key,
  account_id integer not null references accounts(id) on delete cascade,
  job_id integer not null references jobs(id) on delete cascade,
  name text not null,
  email text not null,
  note text not null,
  status text not null default 'received' check (status in ('received','reviewing','closed')),
  created_at timestamptz not null default now(),
  constraint applications_account_job_uniq unique (account_id, job_id)
);

create table if not exists stories (
  id serial primary key,
  slug text not null unique,
  title text not null,
  outlet text not null,
  published_at date not null,
  featured boolean not null default false,
  body text not null
);

create table if not exists team_members (
  id serial primary key,
  slug text not null unique,
  name text not null,
  role_title text not null,
  bio text not null,
  profile_url text not null,
  sort_order integer not null
);

create table if not exists offices (
  id serial primary key,
  city text not null,
  country text not null,
  role_label text not null,
  constraint offices_city_uniq unique (city)
);

create table if not exists faqs (
  id serial primary key,
  question text not null unique,
  answer text not null,
  category text not null
);

create table if not exists auth_tokens (
  token text primary key,
  account_id integer not null references accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists auth_tokens_account_idx on auth_tokens (account_id);
`;

export async function migrate() {
  // one advisory lock so concurrent container starts do not race
  const client = await pool.connect();
  try {
    await client.query('select pg_advisory_lock(918273645)');
    await client.query(SCHEMA_SQL);
  } finally {
    try {
      await client.query('select pg_advisory_unlock(918273645)');
    } catch {
      /* ignore */
    }
    client.release();
  }
}
