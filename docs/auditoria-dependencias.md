# Auditoría de dependencias

## Objetivo

Detectar vulnerabilidades conocidas, dependencias no utilizadas y cambios de versión reproducibles en RemiSoft.

## Procedimiento

Ejecutar desde cada proyecto:

```bash
pnpm install --frozen-lockfile
pnpm audit --audit-level=high
pnpm dlx depcheck
```

Después de cada actualización:

```bash
pnpm install --frozen-lockfile
pnpm audit --audit-level=high
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

No usar `pnpm audit --fix` sin revisar el diff y validar compatibilidad.

## Bitácora — 2026-09-30

### Backend

- `pnpm install --frozen-lockfile`: correcto.
- `pnpm audit --audit-level=high`: 29 vulnerabilidades; 13 altas y 16 moderadas.
- Principales rutas: `deepmerge-ts` vía Prisma, `mariadb` vía `@prisma/adapter-mariadb`, `mysql2` vía Prisma, `fast-uri` vía Prisma dev, `js-yaml` y `brace-expansion` vía ESLint, `nodemailer` directo.
- `pnpm dlx depcheck`: reportó `@prisma/client` y `@prisma/client-runtime-utils`; revisar antes de eliminar porque Prisma puede usarlos de forma indirecta o generada.

### Frontend

- `pnpm install --frozen-lockfile`: correcto y sin cambios en el lockfile.
- `pnpm audit --audit-level=high`: 17 vulnerabilidades; 11 altas y 6 moderadas.
- Principales rutas: `nanoid` vía Vite/PostCSS, `js-yaml` y `brace-expansion` vía ESLint, `axios` directo.
- `pnpm dlx depcheck`: reportó `tailwindcss` y `typescript`; revisar configuración, imports y scripts antes de eliminar.
- `pnpm lint`: correcto.
- `pnpm exec tsc --noEmit`: correcto después de restaurar los tipos de Gerente y aceptar payloads de creación sin IDs.
- `pnpm build`: correcto con Vite; 124 módulos transformados.

## Política de actualización

- Separar cambios backend y frontend.
- Regenerar lockfiles con pnpm, nunca editarlos manualmente.
- Preferir versiones parche/minor compatibles.
- Revisar cambios mayores de Prisma, Axios, Vite y ESLint antes de aplicarlos.
- Repetir auditoría, lint, TypeScript, tests y build después de cada grupo de cambios.
- Registrar la vulnerabilidad, ruta, versión vulnerable, versión corregida, impacto y validación.

## Estado

La auditoría está reproducida y documentada. Las vulnerabilidades siguen pendientes de corrección; no se deben marcar como resueltas hasta repetir `pnpm audit` y comprobar que no queden hallazgos altos o críticos.