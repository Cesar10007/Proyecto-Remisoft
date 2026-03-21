#!/bin/bash
echo "Configurando entorno RemiSoft..."

# Agregar repositorio sury y instalar driver pgsql
curl -sSLo /tmp/php.gpg https://packages.sury.org/php/apt.gpg
cp /tmp/php.gpg /usr/share/keyrings/php.gpg
echo "deb [signed-by=/usr/share/keyrings/php.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list
apt-get update -y 2>/dev/null || true
apt-get install -y postgresql postgresql-contrib php8.2-pgsql || true

# Iniciar PostgreSQL
pg_ctlcluster 13 main start || true
sleep 3

# Crear usuario y base de datos
psql -U postgres -c "DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'remisoft') THEN
    CREATE USER remisoft WITH PASSWORD 'remisoft123';
  END IF;
END \$\$;"

psql -U postgres -c "SELECT 'CREATE DATABASE remisoft OWNER remisoft' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'remisoft')\gexec"

psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE remisoft TO remisoft;"

psql -U postgres -d remisoft -f /workspaces/Proyecto-Remisoft/DBFAMILIAREMI.sql

echo "Base de datos lista."