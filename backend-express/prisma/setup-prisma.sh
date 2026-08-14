#!/bin/bash
# Setup de base de datos con Prisma Migrate + vistas/stored procedures
# 
# Este script reemplaza al setup.sh anterior para usar Prisma como capa principal
# de gestión del schema, manteniendo SQL crudo solo para vistas y stored procedures
# (que Prisma no gestiona).
#
# Requisitos:
# - Tener .env configurado con DATABASE_URL
# - Prisma CLI instalado: pnpm install -g prisma
# - Conexin a MariaDB/MySQL disponible

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DATABASE_DIR="$(dirname "$PROJECT_DIR")/database"

echo "=== Setup de base de datos con Prisma ==="
echo "Directorio del proyecto: $PROJECT_DIR"
echo "Directorio de scripts SQL: $DATABASE_DIR"
echo ""

# 1. Generar migracin inicial desde el schema (si no existe)
echo "[1/4] Verificando migraciones de Prisma..."
if [ ! -d "$SCRIPT_DIR/migrations" ]; then
  echo "  -> No hay migraciones. Generando migracin inicial..."
  cd "$PROJECT_DIR"
  prisma migrate dev --name init
else
  echo "  -> Migraciones ya existen. Skipping."
fi

# 2. Aplicar migraciones pendientes
echo ""
echo "[2/4] Aplicando migraciones de Prisma..."
cd "$PROJECT_DIR"
prisma migrate deploy

# 3. Cargar vistas y stored procedures (SQL crudo)
echo ""
echo "[3/4] Cargando vistas y stored procedures desde SQL..."
if [ -d "$DATABASE_DIR/vistas" ]; then
  for f in "$DATABASE_DIR"/vistas/*.sql; do
    if [ -f "$f" ]; then
      echo "  -> Ejecutando: $f"
      mysql --default-character-set=utf8mb4 -h "${DB_HOST:-127.0.0.1}" -u "${DB_USER:-root}" -p"${DB_PASSWORD:-}" remisoft < "$f"
    fi
  done
else
  echo "  -> Directorio de vistas no encontrado. Skipping."
fi

# 4. Cargar datos iniciales (opcional)
echo ""
echo "[4/4] Cargando datos iniciales (si existen)..."
if [ -f "$DATABASE_DIR/datos.sql" ]; then
  echo "  -> Ejecutando: $DATABASE_DIR/datos.sql"
  mysql --default-character-set=utf8mb4 -h "${DB_HOST:-127.0.0.1}" -u "${DB_USER:-root}" -p"${DB_PASSWORD:-}" remisoft < "$DATABASE_DIR/datos.sql"
else
  echo "  -> datos.sql no encontrado. Skipping."
fi

echo ""
echo "=== Setup completado ==="
echo ""
echo "NOTAS IMPORTANTES:"
echo "- Prisma gestiona las tablas (34 modelos en schema.prisma)"
echo "- Las vistas y stored procedures se cargan desde SQL crudo"
echo "- Para regenerar el schema desde la BD: prisma db pull"
echo "- Para crear nuevas migraciones: prisma migrate dev --name <nombre>"
echo ""
