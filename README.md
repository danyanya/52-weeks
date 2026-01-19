# 52 Weeks

Минималистичное приложение для недельного планирования. Ключевая идея — свободный текстовый ввод как в Apple Notes, но со структурой 52 недель в году.

## Особенности

- 📅 Недельное планирование (52 недели в году)
- 🎯 Фокус недели + ежедневные задачи
- 🌐 **Мультиязычность (EN/RU)** - автоматическое определение языка
- 📱 **Полностью адаптивно** - отлично работает на iPhone и iPad
- 🔐 Email whitelist для ограничения доступа
- 💾 Автосохранение + offline-first
- 🔒 Cookie-based authentication с fallback для iOS
- 🚀 Docker + Nginx ready

## Технологии

- **Frontend**: React 18 + TypeScript + Vite
- **Стили**: Tailwind CSS
- **State**: Zustand
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **i18n**: Custom (EN/RU)

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка Supabase

Краткая версия:

1. Выполните SQL миграцию из `supabase/migrations/20240119_initial_schema.sql`
2. Настройте Email Authentication в Supabase Dashboard
3. Отключите "Confirm Email" для разработки
4. Добавьте `http://localhost:5173` в Redirect URLs

### 3. Переменные окружения

Создайте `.env` файл:

```bash
cp .env.example .env
```

Укажите ваши Supabase credentials в `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Опционально: ограничить доступ только определенным email (защита от злоупотреблений)
VITE_ALLOWED_EMAILS=your-email@example.com,friend@example.com
```

**Email Whitelist** (опционально): Для ограничения доступа только вам и вашим друзьям, укажите разрешенные email адреса. Оставьте пустым для открытого доступа.

### 4. Запуск проекта

```bash
npm run dev
```

Откройте [http://localhost:5173](http://localhost:5173)

## Production Deployment

### Vercel (рекомендуется)

Самый простой способ задеплоить приложение:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/52-weeks)

**Или через CLI:**

```bash
# Установите Vercel CLI
npm i -g vercel

# Деплой
vercel

# Production деплой
vercel --prod
```

**Переменные окружения в Vercel:**

Добавьте в настройках проекта (Settings → Environment Variables):

- `VITE_SUPABASE_URL` - URL вашего Supabase проекта
- `VITE_SUPABASE_ANON_KEY` - Anon key из Supabase
- `VITE_ALLOWED_EMAILS` (опционально) - Список разрешенных email через запятую

📖 **[Подробная инструкция по деплою на Vercel](VERCEL_DEPLOY.md)**

### Docker Deployment

Все файлы для Docker деплоя находятся в директории `deploy/`:

#### Быстрый старт (Docker)

```bash
# 1. Создайте .env файл
cp .env.example .env

# 2. Соберите и запустите
make build
make up

# 3. Проверьте статус
make status
```

#### Деплой с SSL (Let's Encrypt)

Добавьте в `.env` файл:

```env
DOMAIN=yourdomain.com
SSL_EMAIL=your-email@example.com
```

Затем запустите:

```bash
bash deploy/setup-ssl.sh
```

Или используйте аргументы напрямую:

```bash
bash deploy/setup-ssl.sh yourdomain.com your-email@example.com
```

#### Makefile команды

```bash
make help          # Показать все доступные команды
make build         # Собрать Docker образ
make up            # Запустить контейнеры
make down          # Остановить контейнеры
make logs          # Показать логи
make restart       # Перезапустить
make clean         # Удалить контейнеры и образы

# Production с SSL
make prod-up       # Запустить production
make prod-logs     # Логи production
make prod-down     # Остановить production
```

#### Структура deploy/

```text
deploy/
├── Dockerfile              # Multi-stage build
├── docker-compose.yml      # Basic HTTP deployment
├── docker-compose.prod.yml # Production with SSL
├── nginx.conf              # Nginx config
├── nginx-ssl.conf          # Nginx config with SSL
├── .dockerignore           # Docker ignore rules
├── setup-ssl.sh            # SSL setup script
├── install.sh              # Server installation script
└── Makefile                # Automation commands
```

#### Автоматическая установка на Ubuntu/Debian

```bash
# Установка Docker, Docker Compose и настройка firewall
sudo bash deploy/install.sh
```

## Troubleshooting

### Проблемы с входом на iOS (iPhone/iPad)

Если не можете войти на iOS в Chrome или Safari:

1. **Используйте Safari вместо Chrome** - лучшая совместимость
2. **Проверьте Settings → Safari:**
   - "Block All Cookies" должно быть **выключено**
3. **Очистите данные сайта:**
   - Settings → Safari → Advanced → Website Data → Remove All
4. **Попробуйте приватный режим** в Safari

Приложение автоматически использует localStorage на iOS для лучшей совместимости.

📖 **[Полное руководство по iOS →](IOS_TROUBLESHOOTING.md)**

### Magic Link возвращает на localhost

Нужно настроить Redirect URLs в Supabase Dashboard:

**Authentication → URL Configuration:**

- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/**`

📖 **[Настройка Supabase →](SUPABASE_SETUP.md)**

## Лицензия

MIT
