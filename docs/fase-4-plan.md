# Fase 4 — Dependencias y trazabilidad

## Objetivo

Pinear dependencias, auditar vulnerabilidades, mejorar la validación estática de TypeScript y dejar trazabilidad entre requisitos, historias de usuario, issues y pruebas.

## Alcance de esta rama

- Revisar y fijar versiones declaradas en frontend y backend.
- Ejecutar `pnpm audit --audit-level=high` y registrar los resultados.
- Ejecutar `pnpm dlx depcheck` y documentar falsos positivos o dependencias no utilizadas.
- Configurar ESLint para `.ts` y `.tsx` con reglas TypeScript.
- Revisar `strict: true` y los tipos de `AuthContext` y `PrivateRoute`.
- Preparar la matriz de trazabilidad RF/HU → issue → archivo → endpoint/componente → prueba.

## Orden de trabajo

1. Inventariar dependencias y configuración actual.
2. Registrar vulnerabilidades reproducibles antes de actualizar paquetes.
3. Aplicar actualizaciones compatibles, una familia de dependencias por commit.
4. Configurar ESLint y TypeScript sin ocultar errores existentes.
5. Crear la matriz de trazabilidad de las historias pendientes.
6. Ejecutar instalación congelada, auditoría, lint, tests y build.

## Reglas

- No actualizar dependencias mayores sin justificarlo.
- No eliminar una dependencia solo porque `depcheck` la marque sin uso; verificar imports dinámicos y configuración.
- No incluir secretos ni archivos `.env`.
- Cada cambio debe conservar una validación reproducible.
- Los hallazgos que no puedan resolverse sin riesgo deben quedar documentados con paquete, severidad, ruta, versión afectada, mitigación y issue de seguimiento.

## Criterios de aceptación

- [ ] Las versiones directas relevantes están fijadas.
- [ ] Existe un informe de auditoría reproducible.
- [ ] ESLint analiza `.ts` y `.tsx` con configuración TypeScript.
- [ ] TypeScript usa `strict: true` donde el proyecto lo permita.
- [ ] Existe una matriz RF/HU trazable.
- [ ] CI local reproducible: install frozen, audit, lint, tests y build.
