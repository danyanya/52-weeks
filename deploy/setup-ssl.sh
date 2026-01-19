#!/bin/bash

# Скрипт настройки SSL сертификата Let's Encrypt
# Использование:
#   bash deploy/setup-ssl.sh yourdomain.com your-email@example.com
#   или
#   bash deploy/setup-ssl.sh  (использует DOMAIN и SSL_EMAIL из .env)
# ВАЖНО: Запускайте из корневой директории проекта

set -e

# Проверяем что мы в корне проекта
if [ ! -f "package.json" ] || [ ! -d "deploy" ]; then
    echo "Ошибка: Запустите скрипт из корневой директории проекта"
    echo "Использование: bash deploy/setup-ssl.sh [domain] [email]"
    exit 1
fi

# Загружаем переменные из .env если файл существует
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Получаем домен и email из аргументов или из .env
DOMAIN=${1:-$DOMAIN}
EMAIL=${2:-$SSL_EMAIL}

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Ошибка: Не указаны домен и email"
    echo ""
    echo "Использование (вариант 1 - аргументы):"
    echo "  bash deploy/setup-ssl.sh yourdomain.com your-email@example.com"
    echo ""
    echo "Использование (вариант 2 - из .env файла):"
    echo "  Добавьте в .env файл:"
    echo "    DOMAIN=yourdomain.com"
    echo "    SSL_EMAIL=your-email@example.com"
    echo "  Затем запустите:"
    echo "    bash deploy/setup-ssl.sh"
    echo ""
    exit 1
fi

echo "==================================="
echo "Настройка SSL для домена: $DOMAIN"
echo "Email: $EMAIL"
echo "==================================="

# Обновляем nginx-ssl.conf с правильным доменом
echo "1. Обновление конфигурации Nginx..."
sed -i.bak "s/yourdomain.com/$DOMAIN/g" deploy/nginx-ssl.conf
echo "   ✓ Конфигурация обновлена"

# Создаем директории для certbot
echo "2. Создание директорий для сертификатов..."
mkdir -p deploy/certbot/conf
mkdir -p deploy/certbot/www
echo "   ✓ Директории созданы"

# Временно запускаем только веб-сервер для получения сертификата
echo "3. Запуск временного веб-сервера..."
docker-compose -f deploy/docker-compose.prod.yml up -d web nginx-proxy
sleep 5
echo "   ✓ Веб-сервер запущен"

# Получаем SSL сертификат
echo "4. Получение SSL сертификата от Let's Encrypt..."
docker-compose -f deploy/docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

if [ $? -eq 0 ]; then
    echo "   ✓ SSL сертификат получен успешно"
else
    echo "   ✗ Ошибка получения сертификата"
    echo "   Проверьте что:"
    echo "   - Домен $DOMAIN указывает на IP этого сервера (DNS A record)"
    echo "   - Порты 80 и 443 открыты в firewall"
    exit 1
fi

# Перезапускаем все сервисы с SSL
echo "5. Перезапуск с SSL конфигурацией..."
docker-compose -f deploy/docker-compose.prod.yml down
docker-compose -f deploy/docker-compose.prod.yml up -d

echo ""
echo "==================================="
echo "✓ SSL настроен успешно!"
echo "==================================="
echo ""
echo "Ваш сайт доступен по адресу: https://$DOMAIN"
echo ""
echo "Сертификат будет автоматически обновляться каждые 12 часов"
echo ""
echo "Полезные команды:"
echo "  docker-compose -f deploy/docker-compose.prod.yml logs -f     # Логи"
echo "  docker-compose -f deploy/docker-compose.prod.yml restart     # Перезапуск"
echo "  docker-compose -f deploy/docker-compose.prod.yml down        # Остановка"
echo "  make -f deploy/Makefile prod-logs                            # Логи (через Makefile)"
echo "  make -f deploy/Makefile prod-down                            # Остановка (через Makefile)"
echo ""
