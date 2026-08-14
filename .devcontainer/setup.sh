#!/bin/bash
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
apt-get update -y 2>/dev/null || true
apt-get install -y mariadb-server || true
docker-php-ext-install pdo_mysql || true

service mariadb start || true
sleep 3

mysql -u root -e "DROP DATABASE IF EXISTS remisoft;" || true
mysql -u root -e "CREATE DATABASE remisoft CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;" || true
mysql -u root -e "CREATE USER IF NOT EXISTS 'remisoft'@'localhost' IDENTIFIED BY 'remisoft123';" || true
mysql -u root -e "CREATE USER IF NOT EXISTS 'remisoft'@'127.0.0.1' IDENTIFIED BY 'remisoft123';" || true
mysql -u root -e "GRANT ALL PRIVILEGES ON remisoft.* TO 'remisoft'@'localhost';" || true
mysql -u root -e "GRANT ALL PRIVILEGES ON remisoft.* TO 'remisoft'@'127.0.0.1';" || true
mysql -u root -e "FLUSH PRIVILEGES;" || true

mysql --default-character-set=utf8mb4 -u root remisoft < "$PROJECT_DIR/database/DBFAMILIAREMI.sql"
mysql --default-character-set=utf8mb4 -u root remisoft < "$PROJECT_DIR/database/datos.sql"

for f in "$PROJECT_DIR"/database/vistas/*.sql; do
  [ -f "$f" ] && mysql --default-character-set=utf8mb4 -u root remisoft < "$f"
done

for f in "$PROJECT_DIR"/database/procedimientos/*.sql; do
  [ -f "$f" ] && mysql --default-character-set=utf8mb4 -u root remisoft < "$f"
done

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
composer install --no-interaction 2>/dev/null || true
php artisan key:generate --no-interaction 2>/dev/null || true
php artisan migrate --force --no-interaction 2>/dev/null || true

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
ENV

  cd "$PROJECT_DIR/backend-express"

  if command -v pnpm >/dev/null 2>&1; then
    pnpm install || true
    pnpm run prisma:generate || true
  else
    npm install || true
    npm run prisma:generate || true
  fi
else
  echo "AVISO: No se encontró backend-express/package.json — Express no fue instalado."
fi

# ── REACT ──
if [ -f "$PROJECT_DIR/frontend/package.json" ]; then
  echo "Instalando dependencias de React..."

  cd "$PROJECT_DIR/frontend"

  if command -v pnpm >/dev/null 2>&1; then
    pnpm install || true
  else
    npm install || true
  fi
else
  echo "AVISO: No se encontró frontend/package.json — React no fue instalado."
  echo "Corre manualmente: pnpm create vite@latest frontend -- --template react"
fi

# ── FRONTEND .env ──
# El frontend usa ruta relativa para que el proxy de Vite decida:
# /api/cajas, /api/ingredientes, /api/domicilios y /api/proveedores -> Express
# resto de /api -> Laravel.

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