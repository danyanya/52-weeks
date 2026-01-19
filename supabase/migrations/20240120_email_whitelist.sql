-- Email Whitelist для дополнительной защиты на уровне базы данных
-- Эта таблица будет хранить список разрешенных email адресов

-- Создаем таблицу для whitelist email
CREATE TABLE IF NOT EXISTS public.allowed_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Включаем RLS
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

-- Политика: все могут читать список разрешенных email (нужно для проверки)
CREATE POLICY "Anyone can read allowed emails"
  ON public.allowed_emails
  FOR SELECT
  USING (true);

-- Функция для проверки находится ли email в whitelist
-- Если таблица пустая - доступ открыт для всех
CREATE OR REPLACE FUNCTION public.is_email_allowed(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_count int;
BEGIN
  -- Получаем общее количество email в whitelist
  SELECT COUNT(*) INTO total_count FROM public.allowed_emails;

  -- Если whitelist пустой - доступ открыт для всех
  IF total_count = 0 THEN
    RETURN true;
  END IF;

  -- Проверяем есть ли email в whitelist
  RETURN EXISTS (
    SELECT 1 FROM public.allowed_emails
    WHERE LOWER(email) = LOWER(user_email)
  );
END;
$$;

-- Обновляем RLS политики для основных таблиц

-- Политика для profiles: доступ только если email в whitelist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id
    AND public.is_email_allowed(auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id
    AND public.is_email_allowed(auth.jwt()->>'email')
  );

-- Политика для weeks: доступ только если email в whitelist
DROP POLICY IF EXISTS "Users can view own weeks" ON public.weeks;
CREATE POLICY "Users can view own weeks"
  ON public.weeks
  FOR SELECT
  USING (
    auth.uid() = user_id
    AND public.is_email_allowed(auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Users can create own weeks" ON public.weeks;
CREATE POLICY "Users can create own weeks"
  ON public.weeks
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_email_allowed(auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Users can update own weeks" ON public.weeks;
CREATE POLICY "Users can update own weeks"
  ON public.weeks
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND public.is_email_allowed(auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Users can delete own weeks" ON public.weeks;
CREATE POLICY "Users can delete own weeks"
  ON public.weeks
  FOR DELETE
  USING (
    auth.uid() = user_id
    AND public.is_email_allowed(auth.jwt()->>'email')
  );

-- Политика для days: доступ только если email в whitelist
DROP POLICY IF EXISTS "Users can view days of their weeks" ON public.days;
CREATE POLICY "Users can view days of their weeks"
  ON public.days
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.weeks
      WHERE weeks.id = days.week_id
        AND weeks.user_id = auth.uid()
    )
    AND public.is_email_allowed(auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Users can create days for their weeks" ON public.days;
CREATE POLICY "Users can create days for their weeks"
  ON public.days
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.weeks
      WHERE weeks.id = days.week_id
        AND weeks.user_id = auth.uid()
    )
    AND public.is_email_allowed(auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Users can update days of their weeks" ON public.days;
CREATE POLICY "Users can update days of their weeks"
  ON public.days
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.weeks
      WHERE weeks.id = days.week_id
        AND weeks.user_id = auth.uid()
    )
    AND public.is_email_allowed(auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Users can delete days of their weeks" ON public.days;
CREATE POLICY "Users can delete days of their weeks"
  ON public.days
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.weeks
      WHERE weeks.id = days.week_id
        AND weeks.user_id = auth.uid()
    )
    AND public.is_email_allowed(auth.jwt()->>'email')
  );

-- Функция для добавления email в whitelist (для удобства)
CREATE OR REPLACE FUNCTION public.add_allowed_email(email_to_add text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.allowed_emails (email, created_by)
  VALUES (LOWER(email_to_add), auth.uid())
  ON CONFLICT (email) DO NOTHING;
END;
$$;

-- Комментарии для документации
COMMENT ON TABLE public.allowed_emails IS 'Список разрешенных email адресов для доступа к приложению';
COMMENT ON FUNCTION public.is_email_allowed IS 'Проверяет находится ли email в whitelist. Если whitelist пустой - доступ открыт для всех';
COMMENT ON FUNCTION public.add_allowed_email IS 'Добавляет email в whitelist';
