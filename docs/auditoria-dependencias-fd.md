## Auditoría de dependencias — Frontend

## Fecha

2026-10-18

## Alcance

Auditoría de `frontend/` en la rama
`feat/fase-4-dependencias-trazabilidad`, vinculada a la issue #189.

## Comandos ejecutados

```bash
pnpm install
pnpm audit --audit-level=high
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

## Resultado inicial

La auditoría inicial reportó 32 vulnerabilidades:

- 19 altas
- 12 moderadas
- 1 baja

Las vulnerabilidades altas estaban asociadas principalmente a `axios`,
`react-router`, `vite`, `nanoid`, `js-yaml`, `brace-expansion` y
`source-map-js`.

## Mitigación aplicada

Se actualizaron dependencias directas:

- `axios`: `1.18.0` → `1.20.0`
- `react-router-dom`: `7.14.0` → `7.18.2`
- `vite`: `8.0.1` → `8.0.16`

Se agregaron overrides en `frontend/package.json` para dependencias
transitivas:

- `react-router`: `7.18.2`
- `nanoid`: `3.3.18`
- `js-yaml`: `4.3.2`
- `brace-expansion`: `1.1.20`
- `source-map-js`: `1.2.2`

## Resultado final

Después de aplicar las actualizaciones y overrides:

- Vulnerabilidades críticas: 0
- Vulnerabilidades altas: 0
- Vulnerabilidades moderadas: 1

`pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` finalizan sin
errores.

## Hallazgos de `depcheck`

`depcheck` reporta como posibles dependencias de desarrollo no usadas:

- `tailwindcss`
- `typescript`

**Decisión:** no se eliminan. `tailwindcss` se utiliza a través del
plugin `@tailwindcss/vite`, y `typescript` se utiliza mediante `tsc` y
el proceso de compilación de Vite. Se consideran falsos positivos del
análisis estático.

## Advertencia de build

Vite reporta que el bundle principal supera los 500 kB después de la
minificación. No es un error ni un bloqueante de seguridad; se puede
mejorar más adelante con code splitting mediante `import()` dinámico.