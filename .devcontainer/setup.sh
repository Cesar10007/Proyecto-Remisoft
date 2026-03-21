#!/bin/bash
echo "Configurando entorno RemiSoft..."

git config --global --add safe.directory /workspaces/Proyecto-Remisoft

# Instalar MariaDB
apt-get update -y 2>/dev/null || true
apt-get install -y mariadb-server || true

# Instalar driver pdo_mysql para PHP
docker-php-ext-install pdo_mysql || true

# Iniciar MariaDB
service mariadb start || true
sleep 3

# Crear usuario y base de datos
mysql -u root -e "CREATE DATABASE IF NOT EXISTS remisoft;" || true
mysql -u root -e "CREATE USER IF NOT EXISTS 'remisoft'@'localhost' IDENTIFIED BY 'remisoft123';" || true
mysql -u root -e "GRANT ALL PRIVILEGES ON remisoft.* TO 'remisoft'@'localhost';" || true
mysql -u root -e "FLUSH PRIVILEGES;" || true

# Cargar estructura de BD
mysql -u root remisoft < /workspaces/Proyecto-Remisoft/DBFAMILIAREMI.sql || true

# Cargar datos de prueba
mysql -u root remisoft < /workspaces/Proyecto-Remisoft/datos.sql || true

# Configurar .env de Laravel si no existe
if [ ! -f /workspaces/Proyecto-Remisoft/backend/.env ]; then
  cp /workspaces/Proyecto-Remisoft/backend/.env.example /workspaces/Proyecto-Remisoft/backend/.env
  sed -i 's/DB_CONNECTION=sqlite/DB_CONNECTION=mysql/' /workspaces/Proyecto-Remisoft/backend/.env
  sed -i 's/# DB_HOST=127.0.0.1/DB_HOST=127.0.0.1/' /workspaces/Proyecto-Remisoft/backend/.env
  sed -i 's/# DB_PORT=3306/DB_PORT=3306/' /workspaces/Proyecto-Remisoft/backend/.env
  sed -i 's/# DB_DATABASE=laravel/DB_DATABASE=remisoft/' /workspaces/Proyecto-Remisoft/backend/.env
  sed -i 's/# DB_USERNAME=root/DB_USERNAME=remisoft/' /workspaces/Proyecto-Remisoft/backend/.env
  sed -i 's/# DB_PASSWORD=/DB_PASSWORD=remisoft123/' /workspaces/Proyecto-Remisoft/backend/.env
fi

# Instalar dependencias de Laravel
cd /workspaces/Proyecto-Remisoft/backend
composer install --no-interaction 2>/dev/null || true
php artisan key:generate --no-interaction 2>/dev/null || true

echo "========================================="
echo "Entorno RemiSoft listo."
echo "Ejecuta: cd backend && php artisan serve"
echo "========================================="