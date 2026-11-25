# _legacy — código en cuarentena (no montar)

Estos 18 pares ruta + controller **no están montados en `app.js`** y no deben
montarse copiándolos tal cual. Son andamios generados antes del aislamiento por
sede: ninguna ruta tiene `requireRole`, ningún controller filtra por
`req.sede`, y 17 de 18 usan modelos Prisma que **no existen** en
`prisma/schema.prisma` (`prisma.gasto`, `prisma.compra`, `prisma.configuracion`,
`prisma.detalle_factura`, `prisma.producto_ingrediente`, …). Montarlos así
rompe en runtime o expone los datos de todas las sedes a cualquier usuario
autenticado.

| Archivo | Estado real |
| --- | --- |
| `flujoCaja.*` | Superado: el flujo de caja vive en `turnos.controller.js` (`/api/turnos/movimientos`, `/gastos`, `/arqueos`) y `reportes.controller.js`. |
| `proveedorIngrediente.*` | El modelo `proveedor_ingrediente` sí existe, pero el controller no filtra por sede. |
| Los otros 16 | Modelos fantasma: no hay tabla ni modelo Prisma. Hay que crearlos primero. |

## Cómo resucitar un módulo (p. ej. Finanzas / Gastos)

1. Crea la tabla y el modelo en `prisma/schema.prisma` con `id_restaurante`
   (ver `docs/plantilla-modulo-sede.md`).
2. Escribe el controller **nuevo** con el patrón actual: `...req.sede` en cada
   consulta, `404` ante ID de otra sede, referencias validadas con
   `findFirst({ where: { id, ...req.sede } })`. No reutilices el de `_legacy`.
3. Escribe la ruta con `requireRole(...)` y móntala en `app.js` **después** de
   `app.use(contextoEstablecimiento)`.
4. Corre `pnpm auditar:rutas`: debe seguir en verde.
5. Añade la prueba de aislamiento en `tests/aislamiento-sedes.integration.test.js`.

El script `scripts/auditar-rutas.js` falla si aparece un archivo nuevo en
`src/routes/` sin montar, así que la cuarentena se mantiene sola.
