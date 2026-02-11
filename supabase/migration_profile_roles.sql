-- Allow multi-role access (e.g. pro + partner) on a single auth user
alter table if exists profiles
  add column if not exists roles text[];

-- Backfill roles from existing single role
update profiles
set roles = array[role]
where roles is null and role is not null;
