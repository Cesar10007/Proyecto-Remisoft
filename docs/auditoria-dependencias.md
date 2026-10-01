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

## Estado de ESLint

La migración a TypeScript estricto se realiza por módulos. Durante la transición, `any` y expresiones heredadas se reportan como advertencias para no bloquear el build ni ocultar los archivos pendientes. Las advertencias deben resolverse módulo por módulo antes de cerrar la fase 4.

## Bitácora — 2026-09-30

- Frontend: typecheck y build correctos.
- ESLint: configuración TypeScript cargada; quedan advertencias heredadas en módulos de Gerente, Mesero, Repartidor, SuperAdmin y formularios de autenticación.
- Auditoría de dependencias: documentada en este archivo y pendiente de repetir después de cada cambio.
