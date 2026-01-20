-- Автоматическое подтверждение email при OTP регистрации
-- Это избавляет от необходимости подтверждать email вручную при первом входе

-- Функция для автоматического подтверждения email
create or replace function public.auto_confirm_user()
returns trigger as $$
begin
  -- Если пользователь создан через OTP и email не подтвержден
  -- автоматически подтверждаем его
  if new.email is not null and new.email_confirmed_at is null then
    new.email_confirmed_at := now();
    new.confirmed_at := now();
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Триггер срабатывает ПЕРЕД вставкой нового пользователя
create trigger on_auth_user_created_auto_confirm
  before insert on auth.users
  for each row
  execute procedure public.auto_confirm_user();

-- Комментарий для документации
comment on function public.auto_confirm_user is
  'Автоматически подтверждает email для новых пользователей при OTP входе';
