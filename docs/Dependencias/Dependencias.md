# Dependencias del proyecto

> Fuente: `backend/package.json`, `frontend/package.json` y sus `pnpm-lock.yaml` en `main` (idéntico a `develop`).
> Gestor de paquetes: **pnpm 10.15.0** · Runtime: **Node.js 20.19.4**.
> Las versiones están fijadas (`save-exact=true` en `.npmrc`) para que las instalaciones sean reproducibles.

## 1. Backend (`backend/`)

### Dependencias de producción

| Paquete | Versión | Para qué se usa |
|---------|---------|-----------------|
| express | 4.22.2 | Framework de la API REST |
| @prisma/client | 7.9.1 | Cliente tipado de Prisma |
| @prisma/adapter-mariadb | 7.9.1 | Adaptador para conectar Prisma con MariaDB |
| @prisma/client-runtime-utils | 7.9.1 | Utilidades de runtime del cliente Prisma |
| jsonwebtoken | 9.0.3 | Emisión y validación de tokens JWT |
| bcryptjs | 2.4.3 | Hash de contraseñas |
| cors | 2.8.6 | Control de orígenes (CORS) |
| helmet | 8.3.0 | Cabeceras HTTP de seguridad |
| express-rate-limit | 8.6.2 | Límite de intentos en login y recuperación de contraseña |
| dotenv | 16.6.1 | Carga de variables de entorno desde `.env` |
| nodemailer | 9.0.5 (efectivo 10.0.6) | Envío de correos (recuperación de contraseña) |

### Dependencias de desarrollo

| Paquete | Versión | Para qué se usa |
|---------|---------|-----------------|
| prisma | 7.9.1 | CLI: `generate` y `migrate deploy` |
| eslint | 9.39.5 | Linting |
| @eslint/js | 9.39.5 | Reglas base de ESLint |
| globals | 17.9.0 | Variables globales para ESLint |

### Overrides de seguridad (dependencias transitivas)

Fuerzan versiones parchadas de paquetes que no se instalan de forma directa:

| Paquete | Versión forzada |
|---------|-----------------|
| proxy-addr | 2.0.8 |
| deepmerge-ts | 8.0.0 |
| mariadb | 3.4.7 |
| mysql2 | 3.22.0 |
| fast-uri | 3.1.7 |
| js-yaml | 4.3.2 |
| brace-expansion | 1.1.20 |
| nodemailer | 10.0.6 |

> `mysql2` y `mariadb` **no son dependencias directas**: llegan de forma transitiva (por ejemplo, vía el adaptador de Prisma).

### Scripts

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `node --watch src/server.js` | Servidor con recarga |
| `start` | `node src/server.js` | Servidor de producción |
| `prisma:generate` | `prisma generate` | Genera el cliente Prisma |
| `prisma:migrate` | `prisma migrate deploy` | Aplica migraciones |
| `lint` | `eslint .` | Linting |
| `test` | `node --test` | Pruebas con el runner nativo de Node |

## 2. Frontend (`frontend/`)

### Dependencias de producción

| Paquete | Versión | Para qué se usa |
|---------|---------|-----------------|
| react | 19.2.4 | Librería de UI |
| react-dom | 19.2.4 | Renderizado en el navegador |
| react-router-dom | 7.18.2 | Rutas y navegación por rol |
| @reduxjs/toolkit | 2.12.0 | Estado global (sesión, rol, usuario) |
| react-redux | 9.3.0 | Integración de Redux con React |
| axios | 1.20.0 | Cliente HTTP con interceptor del token |

### Dependencias de desarrollo

| Paquete | Versión | Para qué se usa |
|---------|---------|-----------------|
| vite | 8.0.16 | Servidor de desarrollo y build |
| @vitejs/plugin-react | 6.0.1 | Soporte de React en Vite |
| tailwindcss | 4.3.3 | Framework de estilos |
| @tailwindcss/vite | 4.3.3 | Plugin de Tailwind para Vite |
| typescript | 6.0.3 | Tipado estático |
| typescript-eslint | 8.46.4 | Reglas de ESLint para TypeScript |
| @typescript-eslint/eslint-plugin | 8.46.4 | Plugin de reglas TS |
| @typescript-eslint/parser | 8.46.4 | Parser TS para ESLint |
| eslint | 9.39.4 | Linting |
| @eslint/js | 9.39.4 | Reglas base de ESLint |
| eslint-plugin-react-hooks | 7.0.1 | Reglas de hooks |
| eslint-plugin-react-refresh | 0.5.2 | Reglas de React Fast Refresh |
| globals | 17.4.0 | Variables globales para ESLint |
| @types/react | 19.2.14 | Tipos de React |
| @types/react-dom | 19.2.3 | Tipos de React DOM |
| @types/node | 25.9.3 | Tipos de Node |

### Overrides de seguridad

| Paquete | Versión forzada |
|---------|-----------------|
| react-router | 7.18.2 |
| nanoid | 3.3.18 |
| js-yaml | 4.3.2 |
| brace-expansion | 1.1.20 |
| source-map-js | 1.2.2 |

### Scripts

| Script | Descripción |
|--------|-------------|
| `dev` | Servidor Vite en el puerto 5173, con proxy `/api` → backend |
| `build` | Build de producción |
| `lint` | Linting |
| `preview` | Vista previa del build |

## 3. Infraestructura

| Componente | Versión | Dónde se define |
|------------|---------|-----------------|
| MariaDB | 11.4.4 | `docker-compose.yml` |
| Node.js (imágenes) | 20.19.4 (bookworm-slim) | `backend/Dockerfile`, `frontend/Dockerfile` |
| nginx | 1.27-alpine | `frontend/Dockerfile` |
| pnpm | 10.15.0 | Dockerfiles, CI y `packageManager` |
| mariadb-client | del repositorio de Debian | Imagen del backend, para `database/init.sh` |

## 4. Integración continua (`.github/workflows/ci.yml`)

Se ejecuta en cada Pull Request y push hacia `develop` y `main`:

1. Instalación con `--frozen-lockfile` (backend y frontend).
2. `pnpm audit --audit-level=high` (no bloquea el pipeline: `continue-on-error`).
3. Generación del cliente Prisma.
4. Lint y pruebas del backend.
5. Lint y build del frontend.
6. `docker compose config` y `docker compose build`.

## 5. Auditoría de seguridad (18/10/2026, issue #189)

| | Backend | Frontend |
|---|---------|----------|
| Vulnerabilidades iniciales | 34 (1 crítica, 16 altas, 17 moderadas) | 32 (19 altas, 12 moderadas, 1 baja) |
| Críticas / altas finales | 0 / 0 | 0 / 0 |
| Moderadas finales | 11 | 1 |

- **Falsos positivos de `depcheck`** (no se eliminan): `@prisma/client`, `@prisma/client-runtime-utils` (backend); `tailwindcss`, `typescript` (frontend).
- **Pendiente:** revisar las vulnerabilidades moderadas antes de la entrega final.
- **Aviso de build:** el bundle principal del frontend supera los 500 kB; se puede mejorar con code splitting (`import()` dinámico).

Detalle completo en `docs/auditoria-dependencias.md` y `docs/auditoria-dependencias-fd.md`.

## 6. Cómo instalar y verificar

```bash
# Backend
cd backend
pnpm install --frozen-lockfile
pnpm run prisma:generate
pnpm run lint
pnpm run test

# Frontend
cd ../frontend
pnpm install --frozen-lockfile
pnpm run lint
pnpm run build

# Auditoría
pnpm audit --audit-level=high
```

## 7. Cómo actualizar una dependencia

1. Crear una rama `chore/*` desde `develop`.
2. Cambiar la versión exacta en `package.json`.
3. Ejecutar `pnpm install` y confirmar que el `pnpm-lock.yaml` se actualiza.
4. Correr lint, pruebas, build y auditoría.
5. Abrir Pull Request hacia `develop`.
