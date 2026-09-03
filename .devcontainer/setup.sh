#!/usr/bin/env bash
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

# Verificar que el usuario tiene sudo disponible
if ! command -v sudo >/dev/null 2>&1; then
  fail "sudo no está disponible. Este script requiere un usuario con sudo configurado."
fi

# Verificaciones de directorios y archivos
[ -d "$PROJECT_DIR" ] || fail "No existe PROJECT_DIR: $PROJECT_DIR"
[ -f "$BACKEND_DIR/package.json" ] || fail "No se encontró backend/package.json"
[ -f "$BACKEND_DIR/pnpm-lock.yaml" ] || fail "No se encontró backend/pnpm-lock.yaml"
[ -f "$FRONTEND_DIR/package.json" ] || fail "No se encontró frontend/package.json"
[ -f "$FRONTEND_DIR/pnpm-lock.yaml" ] || fail "No se encontró frontend/pnpm-lock.yaml"

# Validar package.json del backend
node -e "
const p = require('$BACKEND_DIR/package.json');
if (!p.dependencies || !p.dependencies.express) {
  console.error('backend/package.json no declara express. No continúo: el manifiesto está vacío o corrupto.');
  process.exit(1);
}
if (p.packageManager !== 'pnpm@10.15.0') {
  console.error('Se esperaba packageManager pnpm@10.15.0, hay:', p.packageManager);
  process.exit(1);
}
"

# Determinar FRONTEND_ORIGIN según el entorno
if [ -n "${CODESPACE_NAME:-}" ]; then
  FRONTEND_ORIGIN="https://${CODESPACE_NAME}-5173.app.github.dev"
else
  FRONTEND_ORIGIN="http://localhost:5173"
fi

# Configurar Git y Corepack
git config --global --add safe.directory "$PROJECT_DIR" 2>/dev/null || true
corepack enable 2>/dev/null || true
corepack prepare pnpm@10.15.0 --activate

# Instalar dependencias del backend
cd "$BACKEND_DIR"
corepack install
corepack pnpm --version | grep -q '^10\.15\.0$' || fail "Se esperaba pnpm 10.15.0"
cd "$PROJECT_DIR"

# Verificar que el cliente mariadb está disponible
if ! command -v mariadb >/dev/null 2>&1; then
  fail "El cliente 'mariadb' no está disponible. Instálalo con: sudo apt-get install -y mariadb-client"
fi

log "Esperando que el servicio 'db' de Docker Compose esté disponible..."

# Configurar variables de conexión (defaults para Compose expuesto en 127.0.0.1:3306)
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_ROOT_PASSWORD="${DB_ROOT_PASSWORD:-remisoft_root}"

# Esperar hasta que el servicio db responda (máximo 30 segundos)
for i in {1..60}; do
  if mariadb -h "$DB_HOST" -P "$DB_PORT" -u root -p"$DB_ROOT_PASSWORD" -e "SELECT 1;" &>/dev/null; then
    log "Conexión a MariaDB exitosa en $DB_HOST:$DB_PORT"
    break
  fi
  if [ $i -eq 60 ]; then
    fail "No se pudo conectar a MariaDB en $DB_HOST:$DB_PORT después de 60 intentos. Verifica que el servicio 'db' de Compose esté corriendo (docker compose up -d db) y que el puerto 3306 esté expuesto."
  fi
  log "Intento $i: esperando servicio db..."
  sleep 1
done

# Crear base de datos y usuario
log "Configurando base de datos 'remisoft'..."
mariadb -h "$DB_HOST" -P "$DB_PORT" -u root -p"$DB_ROOT_PASSWORD" -e "CREATE USER IF NOT EXISTS 'remisoft'@'%' IDENTIFIED BY 'remisoft_pass';"
mariadb -h "$DB_HOST" -P "$DB_PORT" -u root -p"$DB_ROOT_PASSWORD" -e "GRANT ALL PRIVILEGES ON remisoft.* TO 'remisoft'@'%';"
mariadb -h "$DB_HOST" -P "$DB_PORT" -u root -p"$DB_ROOT_PASSWORD" -e "FLUSH PRIVILEGES;"

log "Configurando Backend Express + Prisma..."

# Crear .env del backend apuntando al servicio 'db' expuesto en 127.0.0.1
cat > "$BACKEND_DIR/.env" <<ENV
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
FRONTEND_URL=${FRONTEND_ORIGIN}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_DATABASE=remisoft
DB_USERNAME=remisoft
DB_PASSWORD=remisoft_pass
DATABASE_URL="mysql://remisoft:remisoft_pass@${DB_HOST}:${DB_PORT}/remisoft"
JWT_SECRET=remisoft_dev_jwt_secret_cambiar_en_produccion
JWT_EXPIRES_IN=8h
MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=587
MAILTRAP_USER=
MAILTRAP_PASS=
MAIL_FROM=noreply@remisoft.local
ENV

log "⚠️  MAILTRAP_USER y MAILTRAP_PASS quedaron vacíos en backend/.env — complétalos manualmente si vas a probar recuperación de contraseña."

# Instalar dependencias y generar Prisma
cd "$BACKEND_DIR"
CI=true corepack pnpm install --frozen-lockfile
corepack pnpm rebuild @prisma/engines prisma || true
corepack pnpm exec prisma generate
corepack pnpm exec prisma migrate deploy

# Cargar datos iniciales si la tabla Producto está vacía
PRODUCTOS=$(mariadb -h "$DB_HOST" -P "$DB_PORT" -u root -p"$DB_ROOT_PASSWORD" -N -s remisoft -e "SELECT COUNT(*) FROM Producto;" 2>/dev/null || echo "0")
if [ "$PRODUCTOS" = "0" ] && [ -f "$PROJECT_DIR/database/datos.sql" ]; then
  log "Cargando datos iniciales..."
  mariadb -h "$DB_HOST" -P "$DB_PORT" -u root -p"$DB_ROOT_PASSWORD" --default-character-set=utf8mb4 remisoft < "$PROJECT_DIR/database/datos.sql"
else
  echo "La base ya contiene datos; no se vuelve a importar datos.sql."
fi

# Cargar vistas
for f in "$PROJECT_DIR"/database/vistas/*.sql; do
  [ -f "$f" ] && mariadb -h "$DB_HOST" -P "$DB_PORT" -u root -p"$DB_ROOT_PASSWORD" --default-character-set=utf8mb4 remisoft < "$f"
done

# Cargar procedimientos
for f in "$PROJECT_DIR"/database/procedimientos/*.sql; do
  [ -f "$f" ] && mariadb -h "$DB_HOST" -P "$DB_PORT" -u root -p"$DB_ROOT_PASSWORD" --default-character-set=utf8mb4 remisoft < "$f"
done

log "Instalando dependencias de React..."
cd "$FRONTEND_DIR"
CI=true corepack pnpm install --frozen-lockfile

# Crear .env del frontend
cat > "$FRONTEND_DIR/.env" <<ENV
VITE_API_URL=/api
ENV

cat <<'EOF'

=========================================
Entorno RemiSoft listo.
El servicio 'db' de Docker Compose debe estar corriendo.
Inícialo con: docker compose up -d db.
=========================================
EOF