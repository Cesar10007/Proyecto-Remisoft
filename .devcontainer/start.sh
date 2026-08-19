#!/bin/bash
set -e

PROJECT_DIR="${PROJECT_DIR:-/workspaces/Proyecto-Remisoft}"
corepack enable 2>/dev/null || true

# ── DETENER PROCESOS PREVIOS ──
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true

# ── MARIADB ──
service mariadb start
sleep 2

# ── PRISMA ──
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
if [ -n "${CODESPACE_NAME:-}" ]; then
  gh codespace ports visibility 3000:public -c "$CODESPACE_NAME" 2>/dev/null || true
  gh codespace ports visibility 5173:public -c "$CODESPACE_NAME" 2>/dev/null || true
fi

echo ""
echo "========================================="
echo "  RemiSoft — Entorno listo"
echo "========================================="
echo ""
echo "  React   → http://localhost:5173"
echo "  Express → http://localhost:3000"
echo ""
echo "  Logs:"
echo "    Express: tail -f /tmp/express.log"
echo "    React:   tail -f /tmp/react.log"
echo ""
echo "  Para detener los servicios:"
echo "    kill $EXPRESS_PID $REACT_PID"
echo "========================================="