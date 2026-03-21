#!/bin/bash
echo "Configurando entorno RemiSoft..."

# Instalar PostgreSQL
apt-get update -y 2>/dev/null || true
apt-get install -y postgresql postgresql-client || true

# Iniciar PostgreSQL
service postgresql start || true
sleep 3

# Crear usuario y base de datos
su -s /bin/bash postgres -c "psql -c \"DO \\\$\\\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'remisoft') THEN
    CREATE USER remisoft WITH PASSWORD 'remisoft123';
  END IF;
END \\\$\\\$;\""

su -s /bin/bash postgres -c "psql -c \"SELECT 'CREATE DATABASE remisoft OWNER remisoft' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'remisoft')\gexec\""

su -s /bin/bash postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE remisoft TO remisoft;\""

su -s /bin/bash postgres -c "psql -d remisoft -f /workspaces/Proyecto-Remisoft/DBFAMILIAREMI.sql"

# Instalar driver pgsql para PHP desde pecl
apt-get install -y libpq-dev php-dev || true
pecl install pdo_pgsql || true
echo "extension=pdo_pgsql.so" >> /usr/local/etc/php/conf.d/pdo_pgsql.ini

echo "Base de datos lista."
git config --global --add safe.directory /workspaces/Proyecto-Remisoft