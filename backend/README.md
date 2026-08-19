# Backend Express + Prisma

API del proyecto RemiSoft, construida con Express, Prisma y MariaDB.

## Requisitos

- Node.js compatible con el proyecto.
- pnpm.
- MariaDB accesible y configurada mediante `.env`.

## Instalación

Desde la raíz del repositorio:

```bash
pnpm --dir backend install
pnpm --dir backend exec prisma generate
pnpm --dir backend exec prisma migrate deploy
```

## Ejecución

```bash
pnpm --dir backend dev
```

El servidor escucha en `http://localhost:3000`.

## Configuración

Copia `.env.example` como `.env` y completa las variables de MariaDB, JWT y correo. No versiones el archivo `.env`.

## Validación

Prueba `/health`, autenticación y los módulos activos con datos controlados antes de abrir un Pull Request.
