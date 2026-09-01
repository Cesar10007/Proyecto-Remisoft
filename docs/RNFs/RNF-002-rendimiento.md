# RNF-002 — Rendimiento
**Tipo:** Requisito No Funcional de Rendimiento

## Requisitos Específicos
- **RNF-002.1** — El endpoint de login debe responder en menos de 500ms en condiciones normales (incluyendo verificación bcrypt).
- **RNF-002.2** — El pool de conexiones MariaDB debe tener mínimo 2 y máximo 10 conexiones concurrentes.
- **RNF-002.3** — El frontend (React + Vite) debe cargar el bundle inicial en menos de 3 segundos en una conexión de 10 Mbps.
- **RNF-002.4** — El módulo de predicción de IA integrado en el backend Express debe devolver predicciones de demanda en menos de 2 segundos por consulta.

## Método de medición y trazabilidad
- **Medición:** pruebas de carga (ej. Apache Bench o k6) sobre `/api/auth/login` y el endpoint de predicción de IA; monitoreo del pool de conexiones vía configuración de Prisma/mysql2.
- **Trazabilidad:** resultados de las pruebas de carga deben quedar documentados con fecha, entorno de prueba y valores obtenidos, comparables contra los umbrales definidos arriba.
