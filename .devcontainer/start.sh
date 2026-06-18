#!/bin/bash

# ── MATAR PROCESOS PREVIOS SI EXISTEN ──
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true

# ── MARIADB ──
service mariadb start
sleep 2

# ── LARAVEL ── (corre en segundo plano, puerto 8000)
cd /workspaces/Proyecto-Remisoft/backend
php artisan serve --host=0.0.0.0 --port=8000 > /tmp/laravel.log 2>&1 &
LARAVEL_PID=$!

# ── REACT ── (corre en segundo plano, puerto 5173)
cd /workspaces/Proyecto-Remisoft/frontend
npm run dev -- --host 0.0.0.0 > /tmp/react.log 2>&1 &
REACT_PID=$!


sleep 3

# ── PUERTOS PÚBLICOS ──
gh codespace ports visibility 8000:public 2>/dev/null || true
gh codespace ports visibility 5173:public 2>/dev/null || true

echo ""
echo "========================================="
echo "  RemiSoft — Entorno listo"
echo "========================================="
echo ""
echo "  React  →  http://localhost:5173"
echo "  Laravel →  http://localhost:8000"
echo ""
echo "  Logs en tiempo real:"
echo "    Laravel: tail -f /tmp/laravel.log"
echo "    React:   tail -f /tmp/react.log"
echo ""
echo "  Para detener los servicios:"
echo "    kill $LARAVEL_PID $REACT_PID"
echo "========================================="