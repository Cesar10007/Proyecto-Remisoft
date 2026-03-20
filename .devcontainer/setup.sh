#!/bin/bash

echo "Configurando entorno RemiSoft..."

# Instalar PostgreSQL
sudo apt-get update -y
sudo apt-get install -y postgresql postgresql-contrib

# Iniciar PostgreSQL
sudo service postgresql start
sleep 3

# Crear usuario y base de datos
sudo -u postgres psql -c "DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'remisoft') THEN
    CREATE USER remisoft WITH PASSWORD 'remisoft123';
  END IF;
END \$\$;"

sudo -u postgres psql -c "SELECT 'CREATE DATABASE remisoft OWNER remisoft' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'remisoft')\gexec"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE remisoft TO remisoft;"

# Cargar estructura de BD
sudo -u postgres psql -d remisoft -f DBFAMILIAREMI.sql

# Instalar dependencias de Laravel si existe composer.json en backend
if [ -f "backend/composer.json" ]; then
  cd backend && composer install && cd ..
fi

echo "Entorno listo."
echo "  Host: localhost | Puerto: 5432 | BD: remisoft | Usuario: remisoft | Clave: remisoft123"
