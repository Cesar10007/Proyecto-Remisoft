**Resuelto y verificado en `main` — justificación de cierre.**

**Causa raíz:** `schema.prisma` declaraba `id_restaurante` en 7 tablas (`caja`, `inventario_mov`, `lote_ingrediente`, `orden_compra`, `pedido`, `proveedor`, `turno_caja`), pero solo `usuario` tenía la columna real en la BD (migración `add_restaurante`). Cualquier `findMany()` sin `select` explícito fallaba con **P2022** (columna inexistente), tumbando `GET /api/pedidos`, `/api/domicilios`, `/api/proveedores`, `/api/cajas` y `/api/turnos` para todos los roles, incluido SUPERADMIN.

**Corrección aplicada (ya en `main` vía PR #283):** la migración `backend/prisma/migrations/20260907014043_agregar_id_restaurante_pendientes/migration.sql` agrega a las 7 tablas la columna `id_restaurante INTEGER NULL`, el índice `idx_<tabla>_restaurante` y la FK `<tabla>_id_restaurante_fkey` → `restaurante(id_restaurante)` (ON DELETE/UPDATE RESTRICT). La migración posterior `20261118200000_aislamiento_restaurante` completa backfills (`pedido`, `turno_caja`) y las claves únicas compuestas con sede.

**Verificación:**
- `schema.prisma` y las migraciones concuerdan en las 7 tablas (columna + índice + FK presentes en ambos).
- Los endpoints afectados quedaron cubiertos por las pruebas automatizadas (`backend/tests`: pedidos, cajas, turnos, multisede, aislamiento — 39 casos en total).
- `pnpm auditar:rutas` confirma rol y filtro de sede en todas las rutas montadas.

**Nota residual (documentada, no bloqueante):** `orden_compra`, `lote_ingrediente` e `inventario_mov` aún no exponen rutas CRUD propias; ya tienen la columna lista para cuando se conecten. El estado actual del modelo quedó documentado en `docs/modelo-de-datos.md` (patrón multi-sede).

Cierro como **resuelto**; cualquier drift futuro lo detectan las pruebas de integración que consultan estas tablas sin `select` explícito.
