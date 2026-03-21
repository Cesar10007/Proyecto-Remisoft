#!/bin/bash

echo "Configurando entorno RemiSoft..."

# Ignorar repositorio con firma inválida
apt-get update -y -qq -o Acquire::AllowInsecureRepositories=true -o Acquire::AllowDowngradeToInsecureRepositories=true 2>/dev/null || true

# Instalar PostgreSQL y driver PHP
apt-get install -y postgresql postgresql-contrib php8.2-pgsql || true

# Iniciar PostgreSQL
pg_ctlcluster 13 main start || true
sleep 3

# Crear usuario
psql -U postgres -c "DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'remisoft') THEN
    CREATE USER remisoft WITH PASSWORD 'remisoft123';
  END IF;
END \$\$;"

# Crear base de datos
psql -U postgres -c "SELECT 'CREATE DATABASE remisoft OWNER remisoft' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'remisoft')\gexec"

# Dar permisos
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE remisoft TO remisoft;"

# Cargar estructura de BD
psql -U postgres -d remisoft -f /workspaces/Proyecto-Remisoft/DBFAMILIAREMI.sql

echo "========================================="
echo "Base de datos lista."
echo "  Host:     localhost"
echo "  Puerto:   5432"
echo "  BD:       remisoft"
echo "  Usuario:  remisoft"
echo "  Clave:    remisoft123"
echo "========================================="