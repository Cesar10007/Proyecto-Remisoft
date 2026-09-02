# RNF-001 — Seguridad
**Tipo:** Requisito No Funcional de Seguridad

## Descripción
El sistema debe cumplir con los controles de seguridad definidos en el OWASP Top 10 2021.

## Requisitos Específicos
- **RNF-001.1** — Las contraseñas deben hashearse con `bcrypt` (factor de costo mínimo 12) antes de persistirse (vía `bcryptjs` en Node.js).
- **RNF-001.2** — Los tokens JWT deben firmarse con secretos de mínimo 32 caracteres aleatorios (`JWT_SECRET`), definidos en `.env` y nunca versionados.
- **RNF-001.3** — Los endpoints de autenticación (`/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`) deben tener rate limiting (máx. 10 req/15 min por IP) vía middleware Express (`express-rate-limit`).
- **RNF-001.4** — La API debe usar HTTPS en producción (TLS 1.2+).
- **RNF-001.5** — Las cabeceras HTTP de seguridad deben configurarse (CSP, HSTS, X-Frame-Options) en el backend Express mediante middleware tipo `helmet`.
- **RNF-001.6** — El CORS debe configurar orígenes explícitos (middleware `cors` en Express) — nunca `origin: "*"` en producción.
- **RNF-001.7** — Toda consulta a la BD debe usar Prisma Client — no SQL crudo con interpolación de strings.
- **RNF-001.8** — Los siguientes eventos de seguridad deben registrarse en el log de auditoría con formato JSON estructurado (OWASP A09 — Security Logging and Monitoring Failures):
  - `LOGIN_SUCCESS` — login exitoso (con `id_usuario` e IP)
  - `LOGIN_FAILED` — login fallido (con motivo, sin email completo)
  - `PASSWORD_CHANGED` — cambio de contraseña exitoso (con `id_usuario`)
  - `PASSWORD_RESET_REQUESTED` — solicitud de recuperación de contraseña
  - `RATE_LIMIT_HIT` — límite de velocidad alcanzado (con endpoint e IP)
  - `INVENTARIO_AJUSTE_MANUAL` — ajuste manual de inventario fuera del flujo automático (con `id_usuario` y motivo)

## Método de medición y trazabilidad
- **Medición:** revisión de código (middleware `helmet`, `cors`, `express-rate-limit` presentes en `server.js`) + auditoría de logs generados en cada evento listado.
- **Trazabilidad:** cada evento de seguridad debe poder rastrearse hasta un `id_usuario` e IP en el log de auditoría; verificable mediante consulta directa a la tabla/archivo de logs.
