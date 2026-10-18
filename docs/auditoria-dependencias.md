# Auditoría de dependencias — Backend

## Fecha

2026-10-18

## Alcance

Auditoría inicial de `backend/` en la rama
`feat/fase-4-dependencias-trazabilidad`, vinculada a la issue #189
(Fase 4 — Dependencias y trazabilidad).

## Comandos ejecutados

```bash
pnpm install
pnpm audit --audit-level=high
pnpm lint
pnpm test
```

## Resultado inicial

La auditoría inicial reportó 34 vulnerabilidades:

- 1 crítica
- 16 altas
- 17 moderadas

Las vulnerabilidades críticas y altas provenían principalmente de
dependencias transitivas de `express`, `prisma`, `@prisma/adapter-mariadb`
y `eslint`.

## Mitigación aplicada

Se agregaron overrides en `backend/package.json` para forzar versiones
parchadas en dependencias transitivas:

- `proxy-addr`: `2.0.8`
- `deepmerge-ts`: `8.0.0`
- `mariadb`: `3.4.7`
- `mysql2`: `3.22.0`
- `fast-uri`: `3.1.7`
- `js-yaml`: `4.3.2`
- `brace-expansion`: `1.1.20`
- `nodemailer`: `10.0.6`

Además, se actualizó la dependencia directa `nodemailer` de `9.0.5`
a `10.0.6`.

## Resultado final

Después de aplicar los overrides:

- Vulnerabilidades críticas: 0
- Vulnerabilidades altas: 0
- Vulnerabilidades moderadas: 11

`pnpm lint` finaliza sin errores y `pnpm test` reporta 4 pruebas
aprobadas y 0 fallidas.

## Hallazgos de `depcheck`

`depcheck` reporta como posibles dependencias no usadas:

- `@prisma/client`
- `@prisma/client-runtime-utils`

**Decisión:** no se eliminan. Prisma genera e importa código de cliente
dinámicamente, por lo que estas dependencias pueden no aparecer en un
análisis estático de imports. Se consideran posibles falsos positivos.

## Vulnerabilidades moderadas restantes

Quedan 11 vulnerabilidades de severidad moderada. No bloquean la
Fase 4 porque el criterio definido en la issue #189 es no tener
vulnerabilidades altas o críticas sin resolver.

Estas se revisarán nuevamente antes de la entrega final para determinar
si pueden corregirse mediante actualizaciones de Prisma, Express o sus
dependencias transitivas.