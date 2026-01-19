#!/bin/bash

# Скрипт установки 52 Weeks на Ubuntu/Debian сервер
# Использование: sudo bash install.sh

set -e

echo "==================================="
echo "52 Weeks - Установка на сервер"
echo "==================================="

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
  echo "Пожалуйста, запустите с sudo"
  exit 1
fi

echo "1. Обновление системы..."
apt-get update
apt-get upgrade -y

echo "2. Установка зависимостей..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw

echo "3. Установка Docker..."
if ! command -v docker &> /dev/null; then
    # Добавление официального GPG ключа Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

    # Настройка репозитория
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Установка Docker Engine
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io

    # Запуск Docker
    systemctl start docker
    systemctl enable docker

    echo "Docker установлен успешно"
else
    echo "Docker уже установлен"
fi

echo "4. Установка Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose установлен успешно"
else
    echo "Docker Compose уже установлен"
fi

echo "5. Настройка firewall..."
ufw --force enable
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

echo "6. Создание директории приложения..."
APP_DIR="/opt/52-weeks"
mkdir -p $APP_DIR
cd $APP_DIR

echo ""
echo "==================================="
echo "Установка завершена!"
echo "==================================="
echo ""
echo "Следующие шаги:"
echo "1. Клонируйте репозиторий в $APP_DIR"
echo "   git clone <repository-url> ."
echo ""
echo "2. Создайте .env файл:"
echo "   cp .env.example .env"
echo "   nano .env  # и укажите ваши Supabase credentials"
echo ""
echo "3. Запустите приложение:"
echo "   make build    # или: docker-compose -f deploy/docker-compose.yml build"
echo "   make up       # или: docker-compose -f deploy/docker-compose.yml up -d"
echo ""
echo "4. Проверьте статус:"
echo "   make status   # или: docker-compose -f deploy/docker-compose.yml ps"
echo ""
echo "5. Для production с SSL:"
echo "   bash deploy/setup-ssl.sh yourdomain.com your-email@example.com"
echo ""
echo "Приложение будет доступно на http://$(curl -s ifconfig.me)"
echo ""
