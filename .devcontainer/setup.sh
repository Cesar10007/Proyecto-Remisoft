#!/bin/bash
set -e

PROJECT_DIR="${PROJECT_DIR:-/workspaces/Proyecto-Remisoft}"

log() {
  printf '\n%s\n' "$1"
}

log "Configurando entorno RemiSoft..."

if [ -n "${CODESPACE_NAME:-}" ]; then
  FRONTEND_ORIGIN="https://${CODESPACE_NAME}-5173.app.github.dev"
else
  FRONTEND_ORIGIN="http://localhost:5173"
fi

git config --global --add safe.directory "$PROJECT_DIR" 2>/dev/null || true
corepack enable 2>/dev/null || true

# ── MARIADB ──
# Elimina repositorios Yarn antiguos que pueden bloquear apt por una clave GPG faltante.
rm -f /etc/apt/sources.list.d/yarn.list
rm -f /etc/apt/sources.list.d/yarn.list.save
rm -f /etc/apt/sources.list.d/yarn.list.distUpgrade

apt-get update -y
apt-get install -y mariadb-server

service mariadb start
sleep 3

mysql -u root -e "CREATE DATABASE IF NOT EXISTS remisoft CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
mysql -u root -e "CREATE USER IF NOT EXISTS 'remisoft'@'localhost' IDENTIFIED BY 'remisoft123';"
mysql -u root -e "CREATE USER IF NOT EXISTS 'remisoft'@'127.0.0.1' IDENTIFIED BY 'remisoft123';"
mysql -u root -e "GRANT ALL PRIVILEGES ON *.* TO 'remisoft'@'localhost' WITH GRANT OPTION;"
mysql -u root -e "GRANT ALL PRIVILEGES ON *.* TO 'remisoft'@'127.0.0.1' WITH GRANT OPTION;"
mysql -u root -e "FLUSH PRIVILEGES;"

# ── EXPRESS + PRISMA ──
if [ -f "$PROJECT_DIR/backend-express/package.json" ]; then
  log "Configurando Backend Express + Prisma..."

  cat > "$PROJECT_DIR/backend-express/.env" <<ENV
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

  cd "$PROJECT_DIR/backend-express"

  if command -v pnpm >/dev/null 2>&1; then
    pnpm install
    pnpm exec prisma migrate deploy
    pnpm exec prisma generate
  else
    npm install
    npx prisma migrate deploy
    npx prisma generate
  fi

  PRODUCTOS=$(mysql -N -s -u root remisoft -e "SELECT COUNT(*) FROM Producto;" 2>/dev/null || echo "0")

  if [ "$PRODUCTOS" = "0" ] && [ -f "$PROJECT_DIR/database/datos.sql" ]; then
    log "Cargando datos iniciales..."
    mysql --default-character-set=utf8mb4 -u root remisoft < "$PROJECT_DIR/database/datos.sql"
  else
    echo "La base ya contiene datos; no se vuelve a importar datos.sql."
  fi
else
  echo "AVISO: No se encontró backend-express/package.json."
fi

# ── VISTAS Y PROCEDIMIENTOS ──
for f in "$PROJECT_DIR"/database/vistas/*.sql; do
  [ -f "$f" ] && mysql --default-character-set=utf8mb4 -u root remisoft < "$f"
done

for f in "$PROJECT_DIR"/database/procedimientos/*.sql; do
  [ -f "$f" ] && mysql --default-character-set=utf8mb4 -u root remisoft < "$f"
done

# ── REACT ──
if [ -f "$PROJECT_DIR/frontend/package.json" ]; then
  log "Instalando dependencias de React..."
  cd "$PROJECT_DIR/frontend"

  if command -v pnpm >/dev/null 2>&1; then
    pnpm install
  else
    npm install
  fi
else
  echo "AVISO: No se encontró frontend/package.json."
fi

# ── FRONTEND .env ──
cat > "$PROJECT_DIR/frontend/.env" <<ENV
VITE_API_URL=/api
ENV

cat <<'EOF'

=========================================
Entorno RemiSoft listo.

Terminal 1 — Express + Prisma:
  cd backend-express && pnpm dev

Terminal 2 — React:
  cd frontend && pnpm dev -- --host 0.0.0.0
=========================================
EOF