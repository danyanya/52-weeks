-- Включаем UUID
create extension if not exists "uuid-ossp";

-- Профили пользователей (расширение auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  week_start_day smallint default 1, -- 1=Пн, 0=Вс
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Недели
create table weeks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  year smallint not null,
  week_number smallint not null, -- 1-52
  focus_text text default '',
  retro_notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(user_id, year, week_number)
);

-- Дни (контент — просто текст)
create table days (
  id uuid default uuid_generate_v4() primary key,
  week_id uuid references weeks(id) on delete cascade not null,
  day_index smallint not null, -- 0=Пн, 1=Вт, ..., 6=Вс
  content text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(week_id, day_index)
);

-- Индексы
create index weeks_user_year_idx on weeks(user_id, year);
create index days_week_idx on days(week_id);

-- Row Level Security
alter table profiles enable row level security;
alter table weeks enable row level security;
alter table days enable row level security;

-- Политики: пользователь видит только свои данные
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can view own weeks"
  on weeks for select using (auth.uid() = user_id);

create policy "Users can insert own weeks"
  on weeks for insert with check (auth.uid() = user_id);

create policy "Users can update own weeks"
  on weeks for update using (auth.uid() = user_id);

create policy "Users can delete own weeks"
  on weeks for delete using (auth.uid() = user_id);

create policy "Users can view own days"
  on days for select using (
    week_id in (select id from weeks where user_id = auth.uid())
  );

create policy "Users can insert own days"
  on days for insert with check (
    week_id in (select id from weeks where user_id = auth.uid())
  );

create policy "Users can update own days"
  on days for update using (
    week_id in (select id from weeks where user_id = auth.uid())
  );

create policy "Users can delete own days"
  on days for delete using (
    week_id in (select id from weeks where user_id = auth.uid())
  );

-- Триггер для создания профиля при регистрации
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Триггер для обновления updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger weeks_updated_at before update on weeks
  for each row execute procedure update_updated_at();

create trigger days_updated_at before update on days
  for each row execute procedure update_updated_at();
