#!/bin/bash
set -e

echo "Configurando entorno RemiSoft..."

# Instalar php pgsql driver
apt-get update -y -qq
apt-get install -y php8.2-pgsql

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