# Backend Express (migración en progreso)

Este backend reemplaza progresivamente a `backend/` (Laravel). Mientras dure
la migración, ambos backends conviven: el frontend usa un proxy en Vite
(`/api/cajas/*` → Express, todo lo demás → Laravel).

## Alcance actual
- Cajas (CRUD completo — index, crear, actualizar, eliminar)
- Todo lo demás sigue en `backend/`

## Autenticación
No reimplementa login. Valida el mismo token de Laravel Sanctum leyendo
directamente la tabla `personal_access_tokens` (compartimos la misma BD
MariaDB que Laravel). Ver `src/middleware/auth.js`.