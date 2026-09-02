#!/bin/bash
set -euo pipefail

log() {
  printf '\n%s\n' "$1"
}

log "=== Iniciando backend RemiSoft (contenedor) ==="

log "[1/4] Aplicando migraciones de Prisma..."
pnpm exec prisma migrate deploy

log "[2/4] Generando cliente Prisma..."
pnpm exec prisma generate

log "[3/4] Verificando datos iniciales..."
PRODUCTOS=$(mariadb -N -s -h \
  "$DB_HOST" \
  -u "$DB_USERNAME" \
  -p"$DB_PASSWORD" \
    "$DB_DATABASE" \
    -e "SELECT COUNT(*) FROM Producto;" 2>/dev/null || echo "0")

if [ "$PRODUCTOS" = "0" ] && [ -f "/app/database/datos.sql" ]; then
  log "  -> Cargando datos.sql..."
  mariadb --default-character-set=utf8mb4 \
    -h "$DB_HOST" \
    -u "$DB_USERNAME" \
    -p"$DB_PASSWORD" \
    "$DB_DATABASE" < /app/database/datos.sql
else
  log "  -> La base ya contiene datos o no hay datos.sql. Omitiendo."
fi

log "[4/4] Cargando vistas y procedimientos..."
for f in /app/database/vistas/*.sql; do
  [ -f "$f" ] && mariadb --default-character-set=utf8mb4 \
    -h "$DB_HOST" \
    -u "$DB_USERNAME" \
    -p"$DB_PASSWORD" \
    "$DB_DATABASE" < "$f"
done

for f in /app/database/procedimientos/*.sql; do
  [ -f "$f" ] && mariadb --default-character-set=utf8mb4 \
    -h "$DB_HOST" \
    -u "$DB_USERNAME" \
    -p"$DB_PASSWORD" \
    "$DB_DATABASE" < "$f"
done

log "=== Setup completo. Arrancando servidor ==="
exec node src/server.js
