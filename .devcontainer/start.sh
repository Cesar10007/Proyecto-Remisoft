#!/bin/bash
set -e

PROJECT_DIR="${PROJECT_DIR:-/workspaces/Proyecto-Remisoft}"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

corepack enable 2>/dev/null || true
corepack prepare pnpm@10.15.0 --activate

fuser -k 3000/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true

service mariadb start
sleep 2

if [ -f "$BACKEND_DIR/package.json" ]; then
  cd "$BACKEND_DIR"
  corepack pnpm exec prisma migrate deploy
  corepack pnpm exec prisma generate
fi

cd "$BACKEND_DIR"
PORT=3000 HOST=0.0.0.0 corepack pnpm dev > /tmp/express.log 2>&1 &
EXPRESS_PID=$!

cd "$FRONTEND_DIR"
corepack pnpm dev -- --host=0.0.0.0 > /tmp/react.log 2>&1 &
REACT_PID=$!

sleep 3

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