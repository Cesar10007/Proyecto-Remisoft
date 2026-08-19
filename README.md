# Proyecto-Remisoft

Sistema web para automatizar pedidos, inventario, facturación y domicilios del restaurante Familia Remi.

## Estado actual

El backend activo es Express + Prisma con MariaDB. El frontend usa React + Vite y consume la API mediante `/api`. Laravel ya no forma parte del arranque del entorno activo.

El Codespace configura MariaDB, aplica las migraciones de Prisma, genera el cliente Prisma, carga la base inicial cuando corresponde y arranca Express junto con React/Vite.

## Tecnologías

- Frontend: React 19 + Vite 6.
- Backend: Node.js + Express.
- ORM: Prisma.
- Base de datos: MariaDB.
- Autenticación: JWT.
- Gestor de paquetes: pnpm.

## Estructura

```text
.devcontainer/   Configuración de Codespaces.
backend/         API Express, Prisma y migraciones.
frontend/        Aplicación React/Vite.
database/        Recursos auxiliares de base de datos.
docs/            Requisitos y restricciones del proyecto.
```

## Desarrollo local

```bash
pnpm install
pnpm --dir backend install
pnpm --dir frontend install

pnpm --dir backend exec prisma generate
pnpm --dir backend exec prisma migrate deploy

pnpm --dir backend dev
pnpm --dir frontend dev
```

La API queda disponible en el puerto `3000` y Vite en el puerto `5173`.

## Variables de entorno

Configura las variables de MariaDB, JWT, correo y frontend a partir de los archivos `.env.example` de `backend/` y `frontend/`. No subas archivos `.env` ni secretos al repositorio.

## Verificación

Antes de crear un Pull Request:

- Ejecuta lint y build del frontend.
- Ejecuta las pruebas del backend y pruebas CRUD con datos de prueba.
- Confirma que las migraciones de Prisma se apliquen correctamente.
- Verifica los flujos de autenticación y los módulos activos desde el navegador.
- Revisa el diff y no hagas push directo a `main` ni `develop`.
