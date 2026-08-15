#!/bin/bash
set -e

PROJECT_DIR="${PROJECT_DIR:-/workspaces/Proyecto-Remisoft}"
corepack enable 2>/dev/null || true

# ── DETENER PROCESOS PREVIOS ──
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true

# ── MARIADB ──
service mariadb start
sleep 2

# ── PRISMA ──
# Aplica solamente las migraciones pendientes.
# Nunca usar "prisma migrate reset" aquí: borraría los datos.
if [ -f "$PROJECT_DIR/backend-express/package.json" ]; then
  cd "$PROJECT_DIR/backend-express"

  if command -v pnpm >/dev/null 2>&1; then
    pnpm exec prisma migrate deploy
    pnpm exec prisma generate
  else
    npx prisma migrate deploy
    npx prisma generate
  fi
fi

# ── LARAVEL ──
cd "$PROJECT_DIR/backend"
php artisan serve --host=0.0.0.0 --port=8000 > /tmp/laravel.log 2>&1 &
LARAVEL_PID=$!

# ── EXPRESS + PRISMA ──
cd "$PROJECT_DIR/backend-express"

if command -v pnpm >/dev/null 2>&1; then
  PORT=3000 HOST=0.0.0.0 pnpm dev > /tmp/express.log 2>&1 &
else
  PORT=3000 HOST=0.0.0.0 npm run dev > /tmp/express.log 2>&1 &
fi

EXPRESS_PID=$!

# ── REACT ──
cd "$PROJECT_DIR/frontend"

if command -v pnpm >/dev/null 2>&1; then
  pnpm dev -- --host=0.0.0.0 > /tmp/react.log 2>&1 &
else
  npm run dev -- --host=0.0.0.0 > /tmp/react.log 2>&1 &
fi

REACT_PID=$!

sleep 3

# ── PUERTOS PÚBLICOS ──
gh codespace ports visibility 8000:public -c "$CODESPACE_NAME" 2>/dev/null || true
gh codespace ports visibility 3000:public -c "$CODESPACE_NAME" 2>/dev/null || true
gh codespace ports visibility 5173:public -c "$CODESPACE_NAME" 2>/dev/null || true

echo ""
echo "========================================="
echo "  RemiSoft — Entorno listo"
echo "========================================="
echo ""
echo "  React   → http://localhost:5173"
echo "  Express → http://localhost:3000"
echo "  Laravel → http://localhost:8000"
echo ""
echo "  Logs:"
echo "    Laravel: tail -f /tmp/laravel.log"
echo "    Express: tail -f /tmp/express.log"
echo "    React:   tail -f /tmp/react.log"
echo ""
echo "  Para detener los servicios:"
echo "    kill $LARAVEL_PID $EXPRESS_PID $REACT_PID"
echo "========================================="