# RNF-003 — Mantenibilidad
**Tipo:** Requisito No Funcional de Mantenibilidad

## Requisitos Específicos
- **RNF-003.1** — La cobertura de tests debe ser mínimo 80% en la lógica de negocio crítica (controladores y servicios del backend Express).
- **RNF-003.2** — El código debe pasar linter (ESLint en frontend y backend) sin errores antes de cada commit.
- **RNF-003.3** — Los tipos deben ser explícitos donde el lenguaje lo permita (TypeScript en frontend) — evitar `any`/tipado implícito sin justificación documentada.
- **RNF-003.4** — Cada archivo/módulo relevante debe tener cabecera de documentación (¿Qué? ¿Para qué? ¿Impacto?).

## Método de medición y trazabilidad
- **Medición:** reporte de cobertura de tests (ej. Jest/Vitest) + salida de `pnpm --dir backend run lint` y `pnpm --dir frontend run lint` sin errores.
- **Trazabilidad:** reportes de cobertura y linting deben generarse en cada Pull Request (CI) y quedar accesibles como artefacto o log del pipeline.
