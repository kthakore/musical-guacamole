create extension if not exists "uuid-ossp";
create extension if not exists "citext";
create extension if not exists "pgcrypto";

create table users (
    id uuid not null default uuid_generate_v4(),
-- using citext for email as email address is case insensitive
    email citext not null,
    password text not null check (length(password) < 512),
    created_at timestamptz not null default NOW(),
    updated_at timestamptz not null default NOW(),
    deleted_at timestamptz,
    CONSTRAINT users_pkey primary key (id)
);

create unique index on users ((lower(email)));

-- Secure hashing of password on insert using 
create or replace function
public.encrypt_pass() returns trigger
  language plpgsql
  as $$
begin
      -- If inserting a new passowrd that is not the same as old then 
      -- crypt it using a generated salt with a blowfish based algorithm
      -- https://goo.gl/taSlHj
      if tg_op = 'INSERT' or new.password <> old.password then
            new.password = crypt(new.password, gen_salt('bf'));
              end if;
              return new;
end
$$;

-- Creating a trigger to encrypt the password on change
create trigger encrypt_pass_on_change
  before insert or update on public.users
  for each row
      execute procedure public.encrypt_pass();



