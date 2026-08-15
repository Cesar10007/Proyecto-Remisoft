#!/bin/bash
set -e

echo "Configurando entorno RemiSoft..."

PROJECT_DIR="${PROJECT_DIR:-/workspaces/Proyecto-Remisoft}"

if [ -n "$CODESPACE_NAME" ]; then
  FRONTEND_ORIGIN="https://${CODESPACE_NAME}-5173.app.github.dev"
else
  FRONTEND_ORIGIN="http://localhost:5173"
fi

git config --global --add safe.directory "$PROJECT_DIR" 2>/dev/null || true
corepack enable 2>/dev/null || true

# ── MARIADB ──
apt-get update -y
apt-get install -y mariadb-server
docker-php-ext-install pdo_mysql || true

service mariadb start
sleep 3

# Crea la base y el usuario solamente si todavía no existen.
# No se elimina la base para no borrar datos al reconstruir o reejecutar setup.
mysql -u root -e "CREATE DATABASE IF NOT EXISTS remisoft CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
mysql -u root -e "CREATE USER IF NOT EXISTS 'remisoft'@'localhost' IDENTIFIED BY 'remisoft123';"
mysql -u root -e "CREATE USER IF NOT EXISTS 'remisoft'@'127.0.0.1' IDENTIFIED BY 'remisoft123';"

# Prisma necesita estos permisos para trabajar con migraciones y shadow database.
mysql -u root -e "GRANT ALL PRIVILEGES ON *.* TO 'remisoft'@'localhost' WITH GRANT OPTION;"
mysql -u root -e "GRANT ALL PRIVILEGES ON *.* TO 'remisoft'@'127.0.0.1' WITH GRANT OPTION;"
mysql -u root -e "FLUSH PRIVILEGES;"

# ── LARAVEL ──
if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
  cp "$PROJECT_DIR/backend/.env.example" "$PROJECT_DIR/backend/.env"

  sed -i 's/DB_CONNECTION=sqlite/DB_CONNECTION=mysql/' "$PROJECT_DIR/backend/.env"
  sed -i 's/# DB_HOST=127.0.0.1/DB_HOST=127.0.0.1/' "$PROJECT_DIR/backend/.env"
  sed -i 's/# DB_PORT=3306/DB_PORT=3306/' "$PROJECT_DIR/backend/.env"
  sed -i 's/# DB_DATABASE=laravel/DB_DATABASE=remisoft/' "$PROJECT_DIR/backend/.env"
  sed -i 's/# DB_USERNAME=root/DB_USERNAME=remisoft/' "$PROJECT_DIR/backend/.env"
  sed -i 's/# DB_PASSWORD=/DB_PASSWORD=remisoft123/' "$PROJECT_DIR/backend/.env"
  sed -i "s#^FRONTEND_URL=.*#FRONTEND_URL=${FRONTEND_ORIGIN}#" "$PROJECT_DIR/backend/.env"
fi

cd "$PROJECT_DIR/backend"
composer install --no-interaction || true
php artisan key:generate --no-interaction || true

# Laravel puede conservar sus propias migraciones en la misma base.
php artisan migrate --force --no-interaction || true

# ── EXPRESS + PRISMA ──
if [ -f "$PROJECT_DIR/backend-express/package.json" ]; then
  echo "Configurando Backend Express + Prisma..."

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

  # Importa datos únicamente cuando la base está recién creada/vacía.
  # datos.sql depende de que Prisma ya haya creado tablas como IA_PRODUCTO.
  PRODUCTOS=$(mysql -N -s -u root remisoft -e "SELECT COUNT(*) FROM Producto;" 2>/dev/null || echo "0")

  if [ "$PRODUCTOS" = "0" ] && [ -f "$PROJECT_DIR/database/datos.sql" ]; then
    echo "Cargando datos iniciales..."
    mysql --default-character-set=utf8mb4 -u root remisoft < "$PROJECT_DIR/database/datos.sql"
  else
    echo "La base ya contiene datos; no se vuelve a importar datos.sql."
  fi
else
  echo "AVISO: No se encontró backend-express/package.json."
fi

# ── VISTAS Y PROCEDIMIENTOS ──
# Se ejecutan después de las migraciones y de los datos porque dependen de las tablas.
for f in "$PROJECT_DIR"/database/vistas/*.sql; do
  [ -f "$f" ] && mysql --default-character-set=utf8mb4 -u root remisoft < "$f"
done

for f in "$PROJECT_DIR"/database/procedimientos/*.sql; do
  [ -f "$f" ] && mysql --default-character-set=utf8mb4 -u root remisoft < "$f"
done

# ── REACT ──
if [ -f "$PROJECT_DIR/frontend/package.json" ]; then
  echo "Instalando dependencias de React..."

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

echo "========================================="
echo "Entorno RemiSoft listo."
echo ""
echo "Terminal 1 — Laravel:"
echo "  cd backend && php artisan serve --host=0.0.0.0 --port=8000"
echo ""
echo "Terminal 2 — Express + Prisma:"
echo "  cd backend-express && pnpm dev"
echo ""
echo "Terminal 3 — React:"
echo "  cd frontend && pnpm dev -- --host 0.0.0.0"
echo "========================================="