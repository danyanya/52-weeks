# 52 Weeks - Deployment Guide

Эта директория содержит все необходимое для развертывания приложения 52 Weeks в production.

## Содержание

- [Файлы](#файлы)
- [Быстрый старт](#быстрый-старт)
- [Деплой с SSL](#деплой-с-ssl)
- [Автоматическая установка сервера](#автоматическая-установка-сервера)
- [Makefile команды](#makefile-команды)

## Файлы

### Docker

- **`Dockerfile`** - Multi-stage build для production (Node builder + Nginx)
- **`docker-compose.yml`** - Базовый HTTP деплой (порт 80)
- **`docker-compose.prod.yml`** - Production деплой с SSL (Let's Encrypt + Nginx proxy)
- **`.dockerignore`** - Правила исключения файлов при сборке образа

### Nginx

- **`nginx.conf`** - Конфигурация Nginx для базового HTTP деплоя
- **`nginx-ssl.conf`** - Конфигурация Nginx с SSL/TLS + HTTP/2

### Scripts

- **`setup-ssl.sh`** - Автоматическая настройка SSL сертификата Let's Encrypt
- **`install.sh`** - Установка Docker и зависимостей на Ubuntu/Debian сервер
- **`Makefile`** - Команды для автоматизации (build, up, down, logs и т.д.)

## Быстрый старт

### Требования

- Docker 20.10+
- Docker Compose 2.0+
- Linux сервер (для production)

### 1. Подготовка

Из **корневой директории проекта**:

```bash
# Создайте .env файл
cp .env.example .env

# Отредактируйте .env и укажите Supabase credentials
nano .env
```

### 2. Локальный запуск (HTTP)

```bash
# Сборка образа
make build

# Запуск контейнеров
make up

# Проверка статуса
make status

# Просмотр логов
make logs
```

Приложение будет доступно на `http://localhost`

### 3. Остановка

```bash
# Остановить контейнеры
make down

# Полная очистка (удалить контейнеры, образы, volumes)
make clean
```

## Деплой с SSL

Для production деплоя с HTTPS и автоматическим SSL сертификатом от Let's Encrypt:

### Требования

- Доменное имя, указывающее на IP вашего сервера (DNS A record)
- Открытые порты 80 и 443 в firewall
- Email адрес для уведомлений Let's Encrypt

### Автоматическая настройка

#### Способ 1: Через .env файл (рекомендуется)

Добавьте в `.env` файл:

```env
DOMAIN=yourdomain.com
SSL_EMAIL=your-email@example.com
```

Затем запустите:

```bash
bash deploy/setup-ssl.sh
```

#### Способ 2: Через аргументы командной строки

```bash
bash deploy/setup-ssl.sh yourdomain.com your-email@example.com
```

Скрипт выполнит:
1. ✅ Обновит nginx-ssl.conf с вашим доменом
2. ✅ Создаст директории для сертификатов
3. ✅ Запустит временный веб-сервер
4. ✅ Получит SSL сертификат от Let's Encrypt
5. ✅ Перезапустит все сервисы с SSL

### После настройки

Ваш сайт будет доступен:
- `https://yourdomain.com` (основной)
- `https://www.yourdomain.com` (с www)
- HTTP автоматически редиректится на HTTPS

Сертификат автоматически обновляется каждые 12 часов.

### Управление production

```bash
# Логи
make prod-logs
# или: docker-compose -f deploy/docker-compose.prod.yml logs -f

# Перезапуск
docker-compose -f deploy/docker-compose.prod.yml restart

# Остановка
make prod-down
# или: docker-compose -f deploy/docker-compose.prod.yml down

# Обновление приложения
git pull origin main
docker-compose -f deploy/docker-compose.prod.yml build
docker-compose -f deploy/docker-compose.prod.yml up -d
```

## Автоматическая установка сервера

Для чистого Ubuntu/Debian сервера используйте скрипт автоматической установки:

```bash
# Установит Docker, Docker Compose, настроит firewall
sudo bash deploy/install.sh
```

Скрипт установит:
- ✅ Docker Engine
- ✅ Docker Compose
- ✅ UFW (firewall) с правилами для HTTP/HTTPS
- ✅ Создаст директорию `/opt/52-weeks`

После установки:

```bash
cd /opt/52-weeks
git clone <your-repo-url> .
cp .env.example .env
nano .env  # укажите Supabase credentials
make build
make up
```

## Makefile команды

### Основные

```bash
make help          # Показать все команды
make build         # Собрать Docker образ
make up            # Запустить контейнеры
make down          # Остановить контейнеры
make restart       # Перезапустить контейнеры
make logs          # Показать логи (follow)
make status        # Статус контейнеров
```

### Продвинутые

```bash
make rebuild       # Пересобрать без кэша
make clean         # Удалить контейнеры и образы
make deploy        # Полный деплой (build + up)
make update        # Git pull + rebuild + restart
make health        # Проверить health endpoint
```

### Production (SSL)

```bash
make prod-up       # Запустить production
make prod-down     # Остановить production
make prod-logs     # Логи production
make prod-deploy   # Полный production деплой
```

## Архитектура

### Базовый деплой (HTTP)

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ http://localhost:80
       ▼
┌─────────────┐
│   Nginx     │  (Container: 52-weeks-app)
│  + Static   │  - Serves React SPA
│   Assets    │  - Health checks
└─────────────┘
```

### Production деплой (SSL)

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ https://domain.com
       ▼
┌─────────────────────┐
│   Nginx Proxy       │  (Container: nginx-proxy)
│   + SSL/TLS         │  - Handles HTTPS
│   + Let's Encrypt   │  - Redirects HTTP→HTTPS
└──────┬──────────────┘
       │ http://web:80
       ▼
┌─────────────┐        ┌──────────────┐
│   App       │  ←───  │   Certbot    │
│   Nginx     │        │   Auto-renew │
│   + React   │        │   (12h)      │
└─────────────┘        └──────────────┘
```

## Переменные окружения

### Обязательные

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Опциональные

```env
# Email whitelist (разделенные запятой)
VITE_ALLOWED_EMAILS=email1@example.com,email2@example.com
```

## Troubleshooting

### SSL не работает

1. Проверьте DNS: `dig yourdomain.com`
2. Проверьте порты: `sudo ufw status`
3. Проверьте логи: `make prod-logs`
4. Проверьте Let's Encrypt rate limits (5 неудачных попыток в час)

### Порты заняты

```bash
# Проверить что использует порт 80/443
sudo lsof -i :80
sudo lsof -i :443

# Остановить конфликтующий сервис
sudo systemctl stop nginx  # если установлен системный nginx
```

### Контейнер не запускается

```bash
# Проверьте логи
docker logs 52-weeks-app

# Проверьте образ
docker images | grep 52-weeks

# Пересоберите без кэша
make rebuild
```

### Health check fails

```bash
# Проверьте внутри контейнера
docker exec -it 52-weeks-app sh
wget -O- http://localhost/

# Проверьте nginx конфиг
docker exec -it 52-weeks-app nginx -t
```

## Безопасность

### Рекомендации

1. ✅ Используйте SSL в production (скрипт `setup-ssl.sh`)
2. ✅ Настройте email whitelist в `.env`
3. ✅ Включите firewall (UFW): только 22, 80, 443
4. ✅ Регулярно обновляйте Docker образы
5. ✅ Используйте strong passwords для сервера
6. ✅ Настройте автоматические бэкапы Supabase

### Security Headers

Nginx конфиг включает:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: no-referrer
- Content-Security-Policy (базовый)

## Monitoring

### Проверка статуса

```bash
# Docker containers
make status

# Health endpoint
curl http://localhost/health
# или для production:
curl https://yourdomain.com/health

# Nginx logs
docker logs 52-weeks-app
# или:
make logs
```

### Uptime monitoring

Настройте внешний мониторинг:
- UptimeRobot (бесплатно)
- Pingdom
- Better Uptime
- StatusCake

URL для мониторинга: `https://yourdomain.com/health`

## Ресурсы

- **Main README**: [../README.md](../README.md)
- **Docker Documentation**: https://docs.docker.com/
- **Let's Encrypt**: https://letsencrypt.org/
- **Nginx Documentation**: https://nginx.org/en/docs/

## Поддержка

Если возникли проблемы:
1. Проверьте логи: `make logs`
2. Проверьте [Troubleshooting](#troubleshooting)
3. Создайте issue в GitHub
