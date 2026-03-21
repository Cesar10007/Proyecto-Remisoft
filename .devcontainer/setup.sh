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

echo "Base de datos lista."