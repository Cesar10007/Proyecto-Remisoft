#!/bin/bash

echo "Configurando entorno RemiSoft..."

# Iniciar PostgreSQL
sudo service postgresql start

# Crear usuario y base de datos
sudo -u postgres psql -c "DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'remisoft') THEN
    CREATE USER remisoft WITH PASSWORD 'remisoft123';
  END IF;
END \$\$;"

sudo -u postgres psql -c "SELECT 'CREATE DATABASE remisoft OWNER remisoft' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'remisoft')\gexec"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE remisoft TO remisoft;"

# Cargar la estructura de la BD desde el archivo SQL del repo
sudo -u postgres psql -d remisoft -f DBFAMILIAREMI.sql

echo "Base de datos lista."
echo ""
echo "Datos de conexion:"
echo "  Host:     localhost"
echo "  Puerto:   5432"
echo "  BD:       remisoft"
echo "  Usuario:  remisoft"
echo "  Clave:    remisoft123"
