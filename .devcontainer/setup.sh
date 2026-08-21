#!/bin/bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/workspaces/Proyecto-Remisoft}"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

log() {
  printf '\n%s\n' "$1"
}

fail() {
  printf '\nERROR: %s\n' "$1" >&2
  exit 1
}

log "Configurando entorno RemiSoft..."

[ -d "$PROJECT_DIR" ] || fail "No existe PROJECT_DIR: $PROJECT_DIR"
[ -f "$BACKEND_DIR/package.json" ] || fail "No se encontró backend/package.json"
[ -f "$BACKEND_DIR/pnpm-lock.yaml" ] || fail "No se encontró backend/pnpm-lock.yaml"
[ -f "$FRONTEND_DIR/package.json" ] || fail "No se encontró frontend/package.json"
[ -f "$FRONTEND_DIR/pnpm-lock.yaml" ] || fail "No se encontró frontend/pnpm-lock.yaml"

if [ -n "${CODESPACE_NAME:-}" ]; then
  FRONTEND_ORIGIN="https://${CODESPACE_NAME}-5173.app.github.dev"
else
  FRONTEND_ORIGIN="http://localhost:5173"
fi

git config --global --add safe.directory "$PROJECT_DIR" 2>/dev/null || true
corepack enable 2>/dev/null || true

cd "$BACKEND_DIR"
corepack install
corepack pnpm --version | grep -q '^10\.15\.0$' || fail "Se esperaba pnpm 10.15.0"
cd "$PROJECT_DIR"

if ! command -v mariadb >/dev/null 2>&1; then
  log "Instalando MariaDB..."
  rm -f /etc/apt/sources.list.d/yarn.list
  rm -f /etc/apt/sources.list.d/yarn.list.save
  rm -f /etc/apt/sources.list.d/yarn.list.distUpgrade
  apt-get update -y
  apt-get install -y mariadb-server
fi

service mariadb start
sleep 3

mysql -u root -e "CREATE DATABASE IF NOT EXISTS remisoft CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
mysql -u root -e "CREATE USER IF NOT EXISTS 'remisoft'@'localhost' IDENTIFIED BY 'remisoft123';"
mysql -u root -e "CREATE USER IF NOT EXISTS 'remisoft'@'127.0.0.1' IDENTIFIED BY 'remisoft123';"
mysql -u root -e "GRANT ALL PRIVILEGES ON remisoft.* TO 'remisoft'@'localhost';"
mysql -u root -e "GRANT ALL PRIVILEGES ON remisoft.* TO 'remisoft'@'127.0.0.1';"
mysql -u root -e "FLUSH PRIVILEGES;"

log "Configurando Backend Express + Prisma..."
cat > "$BACKEND_DIR/.env" <<ENV
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
FRONTEND_URL=${FRONTEND_ORIGIN}
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=remisoft
DB_USERNAME=remisoft
DB_PASSWORD=remisoft123
DATABASE_URL="mysql://remisoft:remisoft123@127.0.0.1:3306/remisoft"
JWT_SECRET=remisoft_dev_jwt_secret_cambiar_en_produccion
JWT_EXPIRES_IN=8h
ENV

cd "$BACKEND_DIR"
corepack pnpm install --frozen-lockfile
corepack pnpm exec prisma migrate deploy
corepack pnpm exec prisma generate

PRODUCTOS=$(mysql -N -s -u root remisoft -e "SELECT COUNT(*) FROM Producto;" 2>/dev/null || echo "0")
if [ "$PRODUCTOS" = "0" ] && [ -f "$PROJECT_DIR/database/datos.sql" ]; then
  log "Cargando datos iniciales..."
  mysql --default-character-set=utf8mb4 -u root remisoft < "$PROJECT_DIR/database/datos.sql"
else
  echo "La base ya contiene datos; no se vuelve a importar datos.sql."
fi

for f in "$PROJECT_DIR"/database/vistas/*.sql; do
  [ -f "$f" ] && mysql --default-character-set=utf8mb4 -u root remisoft < "$f"
done

for f in "$PROJECT_DIR"/database/procedimientos/*.sql; do
  [ -f "$f" ] && mysql --default-character-set=utf8mb4 -u root remisoft < "$f"
done

log "Instalando dependencias de React..."
cd "$FRONTEND_DIR"
corepack pnpm install --frozen-lockfile

cat > "$FRONTEND_DIR/.env" <<ENV
VITE_API_URL=/api
ENV

cat <<'EOF'

=========================================
Entorno RemiSoft listo.

Terminal 1 — Express + Prisma:
  cd backend && pnpm dev

Terminal 2 — React:
  cd frontend && pnpm dev -- --host 0.0.0.0
=========================================
EOF