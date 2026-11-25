# Aislamiento por sede: metodología elegida e integrada

## La metodología: contexto de sede + guardarraíles estructurales

La sede **no la elige el cliente**: `auth.js` relee el usuario en la BD en cada
request y `contextoEstablecimiento` fija `req.sede` a partir de
`usuario.id_restaurante`. Solo SUPERADMIN puede cambiarla con
`?id_restaurante=N`. Cada controller filtra con `...req.sede`; las tablas hijas
(`Detalle_pedido`, `Factura`, `domicilio`, `Receta`) heredan la sede del padre.
Un ID de otra sede responde **404**, no 403, para no confirmar que existe.

Sobre ese runtime (que ya funcionaba) se integraron tres guardarraíles:

| Capa | Qué hace | Dónde |
| --- | --- | --- |
| Cuarentena | Los 18 pares ruta+controller sin montar (sin `requireRole`, sin sede, 17 con modelos Prisma inexistentes) se movieron a `backend/src/_legacy/`. Ya no se pueden montar por copia. | `src/_legacy/README.md` |
| Auditoría estática | `pnpm auditar:rutas` falla si una ruta montada no tiene `requireRole`, si un controller no filtra por sede, si aparece un huérfano en `src/routes/` o si se usa un modelo Prisma fantasma. Corre sin BD. | `backend/scripts/auditar-rutas.js` |
| Pruebas | Unitarias sin BD (auditoría + `filtroRestaurante`), integración con dos sedes reales (matriz 404 / 422 / inyección por query y body) y script `curl` para demo manual. | `backend/tests/aislamiento-*.test.js`, `backend/scripts/prueba-aislamiento.sh` |

## Por qué esta y no otra

- **Prisma `$extends` con sede automática**: más robusto a largo plazo, pero
  obliga a reescribir ~40 controllers, rompe las consultas crudas
  (`$queryRaw`, vistas y procedimientos de `database/`) y los filtros por
  relación (`{ pedido: alcance }`). Riesgo alto, beneficio diferido.
- **FKs compuestas `(id, id_restaurante)`**: impiden mezclar sedes en BD, pero
  exigen migrar cada tabla hija y resolver las filas históricas con `NULL`.
  Es la fase 3 del plan de abajo, no el paso 1.
- **RLS (Row Level Security)**: MariaDB no lo ofrece como PostgreSQL; no es
  una opción real aquí.
- **La elegida** conserva lo que ya funciona, elimina el único camino realista
  de fuga (montar un andamio sin sede) y deja evidencia automática. Es la
  mejor relación seguridad/riesgo para el plazo de la sustentación.

## Qué es global y qué es por sede (decisión documentada)

| Global (sin `id_restaurante`) | Por sede (con `id_restaurante`) |
| --- | --- |
| `rol` (catálogo del sistema, solo SUPERADMIN) | `Producto`, `Ingrediente`, `categoria_productos`, `Cliente`, `proveedor`, `caja`, `turno_caja`, `pedido`, `mesa`, `orden_compra`, `inventario_mov`, `lote_ingrediente`, `IA`, `usuario` |
| — | `unidad_medida` no es tabla: es columna de `Ingrediente`, hereda su sede |

## Gerente multisede: una sede **a la vez**, varias **permitidas**

`usuario.id_restaurante` sigue siendo la sede **activa** y la única que filtra
las consultas. La tabla `usuario_restaurante` guarda a qué sedes puede
**entrar** ese usuario. La diferencia es todo:

| Concepto | Dónde vive | Quién lo cambia |
| --- | --- | --- |
| Sedes permitidas | `usuario_restaurante` | SUPERADMIN (`PUT /api/usuarios/:id/sedes`) |
| Sede activa | `usuario.id_restaurante` | El propio usuario (`PATCH /api/usuarios/me/sede`) |

Reglas que no se negocian:

1. **Un multisede no ve dos sedes a la vez.** `filtroRestaurante` sigue
   devolviendo `{ id_restaurante: activa }`. Pertenecer a A y B nunca produce
   `IN (A, B)`: si así fuera, un reporte sumaría ventas de dos sedes y el
   aislamiento se perdería por la puerta de atrás.
2. **La sede activa siempre es una membresía.** Hay triggers `miembro_sede_ai`
   y `miembro_sede_au` que la insertan si falta, así que ni una aprobación de
   solicitud ni un `INSERT` por SQL pueden dejar la sede activa huérfana.
3. **El cliente no elige la sede.** Ni query (`?id_restaurante=`) ni body. Solo
   el endpoint de cambio, y solo entre las sedes propias: una sede ajena
   responde **404** (no 403) para no confirmar que existe.
4. **Cambiar de sede es explícito, no implícito.** Se persiste en la base; por
   eso `req.user.id_restaurante` coincide con lo que ven los triggers
   (`act_usuario_traslado`), el historial (`actividad_sede`) y el cierre de
   caja. Una sede por query habría dejado esos tres sistemas desalineados.
5. **Cambiar de sede funciona con la sede cerrada.** El endpoint usa
   `permiteSedeCerrada`: salir de una sede cerrada hacia una abierta es
   justamente lo que necesita el gerente.
6. **Asignar y retirar sedes se audita** (`act_usuario_restaurante_i/d` →
   `Personal · Establecimiento asignado/retirado`), con el actor real.
7. **Retirar la sede activa no deja al usuario a la deriva:** la sede activa
   pasa a la primera del conjunto nuevo.

Qué **no** cambia: un gerente de una sola sede se comporta exactamente igual
que antes (el alta de gerente crea su sede y su membresía en la misma
transacción) y la interfaz no le muestra ningún selector.

Para habilitar a un gerente en una segunda sede:

```bash
# 1. SUPERADMIN: asignar sedes (reemplaza el conjunto)
curl -X PUT "$API/usuarios/$ID_GERENTE/sedes" \
  -H "Authorization: Bearer $TOKEN_ADMIN" -H 'Content-Type: application/json' \
  -d '{"sedes":[1,2]}'

# 2. El gerente cambia su sede activa
curl -X PATCH "$API/usuarios/me/sede" \
  -H "Authorization: Bearer $TOKEN_GERENTE" -H 'Content-Type: application/json' \
  -d '{"id_restaurante":2}'
```

En la interfaz: **Superadmin → Gestión de Gerentes → Sedes** y, del lado del
gerente, el selector del encabezado (aparece solo si tiene más de una).

## `id_restaurante` nullable: plan por fases (no migración inmediata)

Solo `actividad_sede` es `NOT NULL`; el resto admite `NULL` por los catálogos
históricamente globales. Una fila `NULL` es invisible para gerentes. Plan:

1. **Ahora**: auditar con `backend/scripts/auditar-huerfanos.sql` y atribuir
   cada fila con información verificada (nunca `UPDATE` masivo a la primera sede).
2. **Fase 2**: `NOT NULL` en tablas operativas nuevas (pedido, caja, turno).
3. **Fase 3** (post-sustentación): FKs compuestas en hijas.

## Cómo demostrarlo (sustentación)

1. `pnpm --dir backend auditar:rutas` → verde, sin BD.
2. `pnpm --dir backend test` → incluye `aislamiento-rutas.test.js` (sin BD) y,
   con `ESTABLECIMIENTO_DB_TEST=1`, `aislamiento-sedes.integration.test.js`:
   gerente B recibe 404 en cada `/:id` de A, `?id_restaurante` y el body se
   ignoran, las referencias cruzadas dan 422.
   El segundo caso del mismo archivo cubre el multisede: sin membresía una sede
   ajena da 404, con membresía el gerente ve solo la sede activa, la query no
   cambia la sede, y retirar la sede activa lo devuelve a una válida.
3. `bash backend/scripts/prueba-aislamiento.sh` → demo manual con `curl`.

## Para módulos nuevos (Finanzas, Flujo de Caja…)

Seguir `docs/plantilla-modulo-sede.md`. El flujo de caja real ya vive en
`/api/turnos/movimientos`, `/gastos` y `/arqueos`; el andamio `flujoCaja.*` de
`_legacy/` está superado y no debe resucitarse.
