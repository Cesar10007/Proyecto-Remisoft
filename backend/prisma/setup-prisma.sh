#!/usr/bin/env bash
# Inicialización local. Exportar DB_* y DATABASE_URL para la MISMA base.
# A diferencia de migrate dev/reset, este script no genera ni borra migraciones.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
DATABASE_DIR="${REMISOFT_SQL_DIR:-../database}"
: "${DATABASE_URL:?Define la URL de migraciones}" "${DB_HOST:?}" "${DB_DATABASE:?}" "${DB_USERNAME:?}" "${DB_PASSWORD:?}"
# Tanto Docker como desarrollo pasan por esta misma decisión de carga.
CLIENTE=mariadb
if ! command -v mariadb >/dev/null; then CLIENTE=mysql; fi
SQL=("$CLIENTE" --default-character-set=utf8mb4 -h "$DB_HOST" -P "${DB_PORT:-3306}" -u "$DB_USERNAME" "$DB_DATABASE")
export MYSQL_PWD="$DB_PASSWORD"
TABLAS_PREVIAS=$("${SQL[@]}" -N -s -e 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE();')

pnpm exec prisma migrate deploy
pnpm exec prisma generate
if [[ "$TABLAS_PREVIAS" == 0 && "${CARGAR_DEMO:-1}" == 1 ]]; then
  echo 'Cargando la demostración en la base recién inicializada.'
  "${SQL[@]}" < "$DATABASE_DIR/datos.sql"
fi
for f in "$DATABASE_DIR"/vistas/*.sql "$DATABASE_DIR"/procedimientos/*.sql; do
  "${SQL[@]}" < "$f"
done
echo 'Base, vistas y procedimientos preparados.'
