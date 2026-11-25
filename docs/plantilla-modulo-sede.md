# Plantilla: módulo nuevo con aislamiento por sede

Checklist para Finanzas, Gastos o cualquier módulo nuevo. Si un paso no se
puede cumplir, el módulo no se monta.

## 1. Modelo (Prisma)

```prisma
model gasto {
  id_gasto       Int          @id @default(autoincrement())
  id_restaurante Int?
  restaurante    restaurante? @relation(fields: [id_restaurante], references: [id_restaurante], onDelete: Restrict, onUpdate: Restrict)
  descripcion    String?      @db.VarChar(120)
  monto         Decimal?     @db.Decimal(10, 2)
  fecha         DateTime?    @default(now()) @db.DateTime(0)

  @@index([id_restaurante], map: "idx_gasto_restaurante")
}
```

Añade el lado inverso en `restaurante`: `gastos gasto[]`.

## 2. Ruta (con rol, sin excepciones)

```js
import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import * as gastos from '../controllers/gastos.controller.js';

const router = Router();
const lectura = requireRole('SUPERADMIN', 'GERENTE');
const escritura = requireRole('SUPERADMIN', 'GERENTE');

router.get('/', lectura, gastos.index);
router.get('/:id', lectura, gastos.show);
router.post('/', escritura, gastos.store);
router.put('/:id', escritura, gastos.update);
router.delete('/:id', escritura, gastos.destroy);

export default router;
```

Móntala en `app.js` **después** de `app.use(contextoEstablecimiento)`:

```js
app.use('/api/gastos', gastosRoutes)
```

## 3. Controller (patrón sede)

```js
import prisma from '../config/prisma.js';
import { ErrorSalon } from '../utils/salon.js';

export async function index(req, res, next) {
  try {
    const data = await prisma.gasto.findMany({
      where: req.sede, // lista: solo la sede del actor
      orderBy: { fecha: 'desc' },
    });
    res.json({ success: true, data, count: data.length });
  } catch (err) { next(err); }
}

export async function show(req, res, next) {
  try {
    const item = await prisma.gasto.findFirst({
      where: { id_gasto: Number(req.params.id), ...req.sede }, // ID ajeno -> 404
    });
    if (!item) throw new ErrorSalon(404, 'Gasto no encontrado.');
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
}

export async function store(req, res, next) {
  try {
    // La sede sale de req.sede, NUNCA de req.body.
    const item = await prisma.gasto.create({
      data: { ...req.sede, descripcion: req.body.descripcion, monto: req.body.monto },
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
}
```

Reglas:

- `req.sede` es siempre **una** sede: la activa. Un gerente multisede no cambia
  nada aquí; su membresía solo decide a qué sede puede cambiar.

- Listas: `where: req.sede`. Por ID: `findFirst({ where: { id, ...req.sede } })`
  y **404** si no existe (nunca 403: no confirmar que el recurso existe).
- Creación: `data: { ...req.sede, ...campos }`. Ignorar `id_restaurante` del body.
- Referencias a otros registros (p. ej. `id_proveedor`): validar con
  `findFirst({ where: { id, ...req.sede } })`; si es de otra sede → **422**.
- Hijas sin columna propia: filtrar por el padre (`where: { padre: req.sede }`).
- No usar `findUnique` por ID solo: no admite el filtro de sede.

## 4. Verificación obligatoria

```bash
pnpm --dir backend auditar:rutas   # debe seguir en verde
```

Y añadir a `tests/aislamiento-sedes.integration.test.js` (o su equivalente):
lista vacía para la otra sede, `GET /:id` ajeno → 404, `?id_restaurante` y
body ignorados, referencia cruzada → 422.

## Errores típicos (los de `_legacy/`)

- Ruta sin `requireRole` → cualquier autenticado entra.
- `findUnique({ where: { id } })` sin sede → fuga entre sedes.
- `data: req.body` → el cliente elige la sede.
- Modelo Prisma que no existe en `schema.prisma` → rompe en runtime.
