# Sprints — RemiSoft

**Marco:** Scrum con sprints de 4 semanas (el último, de cierre, duró 10 días).
**Periodo total del proyecto:** 12 de marzo de 2026 → 25 de noviembre de 2026.
**Regla de trabajo:** cada sprint termina en una rama `feat/*` o `check/*`, se revisa en un Pull Request
con la plantilla del repositorio y se fusiona a `develop`. `main` solo recibe `develop` mediante PR
(lo valida el workflow `branch-flow.yml`).

> **Nota de honestidad documental:** estas fichas se reconstruyeron a partir del historial real del
> repositorio (725 commits, 233 fusiones de PR, fechas de issues y de CI) y del estado verificado de cada
> historia. Las fechas de las ceremonias son las de las revisiones que quedaron registradas en los PR.

## Resumen

| Sprint | Fechas | Objetivo | Comprometido | Aceptado |
|---|---|---|---|---|
| **S0** | 12 mar – 31 may | Definir alcance, arquitectura y modelo de datos | — | — |
| **S1** | 1 jun – 28 jun | Acceso, usuarios y roles | 23 | 23 |
| **S2** | 29 jun – 26 jul | Salón: pedidos por mesa y comandas | 24 | 24 |
| **S3** | 27 jul – 23 ago | Facturación, pagos y caja | 34 | 34 |
| **S4** | 24 ago – 20 sep | Inventario y stock | 23 | 23 |
| **S5** | 21 sep – 18 oct | Domicilios y menú | 26 | 26 |
| **S6** | 19 oct – 15 nov | Reportes, multi-sede y roles finos | 27 | 27 |
| **S7** | 16 nov – 25 nov | IA y exportación (cierre) | 13 | 5 |
| | | **Total** | **170** | **162** |

---

## S0 — Inicio, alcance y arquitectura
**Fechas:** 12 mar – 31 may (12 semanas, trabajo de definición en paralelo a clases)
**Objetivo:** dejar el proyecto listo para construir sin retrabajos.
**Entregables aceptados:**
- 7 requerimientos funcionales (`docs/RFs/`) y 5 no funcionales (`docs/RNFs/`).
- 30 historias de usuario con criterios de aceptación en Gherkin (`docs/HUs/`).
- Modelo de datos en Prisma (42 tablas) y `database/legacy/DBFAMILIAREMI.sql` como modelo físico heredado.
- Esqueleto con Docker Compose (MariaDB + Express + React servido por nginx), `.env.example`, `init.sh`,
  7 vistas y 5 procedimientos almacenados.
- Repositorio con `develop`/`main`, plantillas de issue y de PR, `CODEOWNERS` y CI base.

**Riesgo materializado:** el esquema arrastraba tablas de la etapa anterior (Laravel). Se asumió y se
documentó en `database/legacy/README.md`.

---

## S1 — Acceso, usuarios y roles
**Fechas:** 1 jun – 28 jun · **Rama:** `feat/usuarios-y-acceso`
**Objetivo:** que cualquier persona del restaurante pueda entrar y solo vea lo que le corresponde.
**Historias:** HU-001 (5), HU-002 (5), HU-003 (5), HU-004 (3), HU-005 (5) → **23 pts**
**Entregado:** JWT con expiración, hash con bcrypt, `authMiddleware`, `requireRole`, CRUD de usuarios,
recuperación de contraseña por SMTP con token de un solo uso, pantalla de login con ojo de contraseña
y registro de establecimiento.
**Aceptado:** 23/23. **Impedimentos:** el SMTP en desarrollo requería Mailtrap; se documentó en `.env.example`.

---

## S2 — Salón: pedidos por mesa y comandas
**Fechas:** 29 jun – 26 jul · **Rama:** `feat/pedidos-salon`
**Objetivo:** tomar un pedido en mesa y que cocina lo vea sin papeles.
**Historias:** HU-006 (8), HU-007 (5), HU-008 (8), HU-010 (3) → **24 pts**
**Entregado:** creación de pedido con `$transaction` (pedido + renglones + ocupación de mesa), validación
de que solo se modifica mientras el pedido está `ABIERTO`, panel de pedidos activos, vista de cocina con
comandas y avance `PENDIENTE → PREPARANDO → LISTO → ENTREGADO`, campanita de notificaciones en el header.
**Aceptado:** 24/24. **Impedimento:** la primera versión enviaba al mesero a `/cocina` al hacer clic en el
aviso; se corrigió (el mesero solo informa, el cocinero navega).

---

## S3 — Facturación, pagos y caja
**Fechas:** 27 jul – 23 ago · **Rama:** `feat/facturacion-y-caja`
**Objetivo:** cerrar la cuenta sin descuadres.
**Historias:** HU-009 (8), HU-011 (5), HU-012 (8), HU-013 (5) → 26 pts
**Spike de soporte:** caja y turnos (8 pts) → `/api/cajas`, `/api/turnos` con apertura, gastos, arqueo y cierre.
**Total:** **34 pts**
**Entregado:** precuenta, descuento antes de IVA, propina no gravada, centavos exactos, pagos mixtos y
división de cuenta, factura con `factura_item`, historial de facturas, libro de caja y cierre de turno con arqueo.
**Aceptado:** 34/34. **Riesgo aceptado:** HU-014 (CUFE/DIAN) se sacó del sprint: depende de un tercero
y no se puede resolver con código propio.

---

## S4 — Inventario y stock
**Fechas:** 24 ago – 20 sep · **Rama:** `feat/inventario`
**Objetivo:** que el inventario se descuente solo y avise antes de quedarse sin insumos.
**Historias:** HU-015 (8), HU-016 (5), HU-017 (5), HU-018 (5) → **23 pts**
**Entregado:** receta producto→ingrediente, movimiento `SALIDA` automático al preparar, entrada de stock por
lote, alerta de stock mínimo en el panel del gerente, historial de movimientos con entradas, salidas y mermas,
unidades de medida y conteo absoluto con validaciones (probadas en `unidades-inventario.integration.test.js`).
**Aceptado:** 23/23. **Impedimento:** cantidades `DECIMAL(10,3)` provocaban redondeos; se validó con pruebas.

---

## S5 — Domicilios y menú
**Fechas:** 21 sep – 18 oct · **Rama:** `feat/domicilios-y-menu`
**Objetivo:** abrir el segundo canal de venta (domicilio) sin romper el salón.
**Historias:** HU-019 (8), HU-020 (5), HU-021 (5), HU-022 (5), HU-026 (3) → **26 pts**
**Entregado:** pedido a domicilio desde la web, seguimiento del estado, rol REPARTIDOR con su lista de
entregas, panel de domicilios activos para el gerente, menú público por categorías.
**Aceptado:** 26/26.

---

## S6 — Reportes, multi-sede y roles finos
**Fechas:** 19 oct – 15 nov · **Rama:** `feat/reportes-multisede`
**Objetivo:** que un gerente no vea datos de otra sede y que el dueño vea el consolidado.
**Historias:** HU-023 (5), HU-024 (3), HU-025 (3), HU-027 (8) → 19 pts
**Spike de soporte:** multi-sede, roles y auditoría (8 pts) → `middleware/establecimiento.js`,
`requireRole` aplicado endpoint por endpoint, tabla de historial de actividad.
**Total:** **27 pts**
**Entregado:** reporte de ventas del día, gastos del mes, utilidad, tendencia de ventas, alertas de inventario
en el panel, edición de platos y disponibilidad, aislamiento estricto por `id_restaurante` (fila cerrada por
defecto: sin sede → 403) y auditoría de cambios con actor.
**Aceptado:** 27/27. **Defecto grande corregido:** drift de esquema con `id_restaurante` faltante en 7 tablas
(issue #248) que tumbaba pedidos, domicilios, proveedores, cajas y turnos.

---

## S7 — IA y exportación (sprint de cierre)
**Fechas:** 16 nov – 25 nov (10 días) · **Rama:** `feat/ia-y-exportacion`
**Objetivo:** cerrar con las sugerencias inteligentes y la salida a Excel de finanzas.
**Comprometido:** HU-028 (8) + exportación a Excel (5) → **13 pts**
**Entregado:** exportación real a `.xlsx` de las finanzas del mes (sin dependencias nuevas, validada con
`tsc`, `eslint`, `vite build` y apertura del archivo), landing y footer enfocados a cadenas de restaurantes,
corrección del aviso de la campanita por rol y cuenta demo de cocina.
**No aceptado:** HU-028 quedó a medias — `/api/ia` solo **registra** predicciones, no genera la sugerencia de
compra. Se devolvió al backlog junto con HU-029 y HU-030.
**Aceptado:** 5/13.

---

## Ceremonias (cadencia del equipo)

| Ceremonia | Cuándo | Duración | Resultado |
|---|---|---|---|
| Sprint Planning | Primer lunes del sprint | 60 min | Sprint Backlog con puntos comprometidos (`03-planning-y-poker.md`) |
| Daily asíncrono | Cada día hábil | 10 min | Bloqueos reportados; si toca a otro integrante, se abre issue |
| Refinamiento | Miércoles de la semana 2 | 45 min | HUs listas (Definition of Ready) y re-estimadas |
| Sprint Review | Último viernes | 45 min | Demo en Docker + validación de los criterios de aceptación |
| Retrospectiva | Después del Review | 30 min | Acciones con responsable (`05-retrospectiva-y-feedback.md`) |

## Reglas de trabajo acordadas

1. Ningún cambio llega a `develop` sin PR y sin CI en verde.
2. Una rama = un tema; si aparece otro tema, se abre otra rama.
3. `main` solo se actualiza desde `develop` (verificado por `branch-flow.yml`).
4. Los secretos nunca se commitean; lo que cambia configuración se refleja en `.env.example`.
5. Si una historia depende de un tercero (DIAN, pasarela de pagos), no se compromete en el sprint.
