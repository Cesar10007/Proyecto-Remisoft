# Inventario inicial de fase 4

## Rama

`refactor/fase-04`

## Componentes a auditar

| Componente | Archivos de control | Validación |
|---|---|---|
| Frontend | `frontend/package.json`, `frontend/pnpm-lock.yaml` | install frozen, audit, lint, build |
| Backend | `backend/package.json`, `backend/pnpm-lock.yaml`, `backend/pnpm-workspace.yaml` | install frozen, audit, lint, tests |
| TypeScript frontend | `frontend/tsconfig.json` | `tsc --noEmit` |
| ESLint frontend | `frontend/eslint.config.js` | análisis de `.ts` y `.tsx` |
| ESLint backend | `backend/eslint.config.js` | análisis de fuentes del backend |

## Procedimiento local

Ejecutar desde la raíz, sin copiar secretos ni modificar lockfiles manualmente:

```bash
cd backend
pnpm install --frozen-lockfile
pnpm audit --audit-level=high
pnpm dlx depcheck
pnpm lint
pnpm test
cd ../frontend
pnpm install --frozen-lockfile
pnpm audit --audit-level=high
pnpm dlx depcheck
pnpm lint
pnpm build
```

## Registro de resultados

| Proyecto | Auditoría | Dependencias no usadas | Lint | Tests/build | Acción |
|---|---|---|---|---|---|
| Backend | Pendiente de ejecutar | Pendiente de ejecutar | Pendiente de ejecutar | Pendiente de ejecutar | Registrar salida real |
| Frontend | Pendiente de ejecutar | Pendiente de ejecutar | Pendiente de ejecutar | Pendiente de ejecutar | Registrar salida real |

## Reglas de actualización

- Fijar primero dependencias directas que actualmente usen rangos `^` o `~`.
- Regenerar el lockfile con el gestor de paquetes, nunca editándolo a mano.
- Revisar compatibilidad de Prisma, React, Vite y plugins antes de actualizar.
- Separar cambios de backend y frontend en commits diferentes.
- No marcar una vulnerabilidad como resuelta sin repetir la auditoría.

## Resultado esperado

El informe final debe incluir paquete, severidad, versión instalada, versión corregida disponible, ruta transitiva, impacto, mitigación y referencia a una issue cuando no sea posible actualizar sin riesgo.