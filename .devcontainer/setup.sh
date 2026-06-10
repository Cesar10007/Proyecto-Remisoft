#!/bin/bash
echo "Configurando entorno RemiSoft..."

git config --global --add safe.directory /workspaces/Proyecto-Remisoft

# ── MARIADB ──
apt-get update -y 2>/dev/null || true
apt-get install -y mariadb-server || true
docker-php-ext-install pdo_mysql || true

service mariadb start || true
sleep 3

mysql -u root -e "DROP DATABASE IF EXISTS remisoft;" || true
mysql -u root -e "CREATE DATABASE remisoft CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;" || true
mysql -u root -e "CREATE USER IF NOT EXISTS 'remisoft'@'localhost' IDENTIFIED BY 'remisoft123';" || true
mysql -u root -e "GRANT ALL PRIVILEGES ON remisoft.* TO 'remisoft'@'localhost';" || true
mysql -u root -e "FLUSH PRIVILEGES;" || true

mysql --default-character-set=utf8mb4 -u root remisoft < /workspaces/Proyecto-Remisoft/database/DBFAMILIAREMI.sql
mysql --default-character-set=utf8mb4 -u root remisoft < /workspaces/Proyecto-Remisoft/database/datos.sql

for f in /workspaces/Proyecto-Remisoft/database/vistas/*.sql; do
  [ -f "$f" ] && mysql --default-character-set=utf8mb4 -u root remisoft < "$f"
done

for f in /workspaces/Proyecto-Remisoft/database/procedimientos/*.sql; do
  [ -f "$f" ] && mysql --default-character-set=utf8mb4 -u root remisoft < "$f"
done

# ── LARAVEL ──
if [ ! -f /workspaces/Proyecto-Remisoft/backend/.env ]; then
  cp /workspaces/Proyecto-Remisoft/backend/.env.example /workspaces/Proyecto-Remisoft/backend/.env
  sed -i 's/DB_CONNECTION=sqlite/DB_CONNECTION=mysql/' /workspaces/Proyecto-Remisoft/backend/.env
  sed -i 's/# DB_HOST=127.0.0.1/DB_HOST=127.0.0.1/' /workspaces/Proyecto-Remisoft/backend/.env
  sed -i 's/# DB_PORT=3306/DB_PORT=3306/' /workspaces/Proyecto-Remisoft/backend/.env
  sed -i 's/# DB_DATABASE=laravel/DB_DATABASE=remisoft/' /workspaces/Proyecto-Remisoft/backend/.env
  sed -i 's/# DB_USERNAME=root/DB_USERNAME=remisoft/' /workspaces/Proyecto-Remisoft/backend/.env
  sed -i 's/# DB_PASSWORD=/DB_PASSWORD=remisoft123/' /workspaces/Proyecto-Remisoft/backend/.env

  if [ -n "$CODESPACE_NAME" ]; then
    echo "FRONTEND_URL=https://${CODESPACE_NAME}-5173.app.github.dev" >> /workspaces/Proyecto-Remisoft/backend/.env
  else
    echo "FRONTEND_URL=http://localhost:5173" >> /workspaces/Proyecto-Remisoft/backend/.env
  fi
fi

cd /workspaces/Proyecto-Remisoft/backend
composer install --no-interaction 2>/dev/null || true
php artisan key:generate --no-interaction 2>/dev/null || true
php artisan migrate --force --no-interaction 2>/dev/null || true

# ── REACT ──
if [ -f /workspaces/Proyecto-Remisoft/frontend/package.json ]; then
  echo "Instalando dependencias de React..."
  cd /workspaces/Proyecto-Remisoft/frontend
  npm install || true
else
  echo "AVISO: No se encontró frontend/package.json — React no fue instalado."
  echo "Corre manualmente: npm create vite@latest frontend -- --template react"
fi

# ── FRONTEND .env ──
if [ -n "$CODESPACE_NAME" ]; then
  echo "VITE_API_URL=https://${CODESPACE_NAME}-8000.app.github.dev/api" > /workspaces/Proyecto-Remisoft/frontend/.env
else
  echo "VITE_API_URL=http://localhost:8000/api" > /workspaces/Proyecto-Remisoft/frontend/.env
fi

echo "========================================="
echo "Entorno RemiSoft listo."
echo ""
echo "Terminal 1 — Laravel:"
echo "  cd backend && php artisan serve"
echo ""
echo "Terminal 2 — React:"
echo "  cd frontend && npm run dev"
echo "========================================="