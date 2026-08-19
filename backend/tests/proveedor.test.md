# 9 Casos de Prueba - Módulo Proveedor

**Endpoint base:** `GET/POST/PUT/DELETE /api/proveedores`  
**AutenticaciÓ¡n requerida:** SÓ¡ (token JWT en header `Authorization: Bearer <token>`)

---

## Caso 1: Lectura de todos los proveedores

**MÉ¡todo:** `GET /api/proveedores`  
**Headers:** `Authorization: Bearer <token>`  
**Body:** (ninguno)  
**Resultado esperado:** `200 OK` con array de proveedores (puede estar vacÓ¡o)

```bash
curl -X GET http://localhost:3000/api/proveedores \
  -H "Authorization: Bearer <token>"
```

---

## Caso 2: Lectura de un proveedor por ID

**MÉ¡todo:** `GET /api/proveedores/:id`  
**Headers:** `Authorization: Bearer <token>`  
**Body:** (ninguno)  
**Resultado esperado:** `200 OK` con objeto del proveedor

```bash
curl -X GET http://localhost:3000/api/proveedores/1 \
  -H "Authorization: Bearer <token>"
```

---

## Caso 3: CreaciÓ¡n vlida de proveedor

**MÉ¡todo:** `POST /api/proveedores`  
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`  
**Body:**
```json
{
  "nombre": "Proveedor Test",
  "telefono": "123456789",
  "email": "test@proveedor.com",
  "direccion": "Calle 123"
}
```
**Resultado esperado:** `201 Created` con el proveedor creado (incluyendo `id_proveedor`)

```bash
curl -X POST http://localhost:3000/api/proveedores \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Proveedor Test","telefono":"123456789","email":"test@proveedor.com","direccion":"Calle 123"}'
```

---

## Caso 4: CreaciÓ¡n con FK invlida (ej: ingrediente que no existe)

**MÉ¡todo:** `POST /api/proveedores`  
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`  
**Body:** (datos con referencia a ingrediente inexistente, si aplica)  
**Resultado esperado:** `400 Bad Request` con error de FK (P2003)

*Nota: Si el endpoint de proveedores no acepta FK directamente en el create, este caso se prueba al crear un registro en `proveedor_ingrediente` con `id_proveedor` o `id_ingrediente` inexistente.*

---

## Caso 5: ActualizaciÓ¡n de proveedor existente

**MÉ¡todo:** `PUT /api/proveedores/:id`  
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`  
**Body:**
```json
{
  "nombre": "Proveedor Actualizado",
  "telefono": "987654321"
}
```
**Resultado esperado:** `200 OK` con el proveedor actualizado

```bash
curl -X PUT http://localhost:3000/api/proveedores/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Proveedor Actualizado","telefono":"987654321"}'
```

---

## Caso 6: ActualizaciÓ¡n de registro inexistente

**MÉ¡todo:** `PUT /api/proveedores/:id`  
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`  
**Body:** `{"nombre": "Test"}`  
**Resultado esperado:** `404 Not Found` (error P2025 de Prisma)

```bash
curl -X PUT http://localhost:3000/api/proveedores/99999 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test"}'
```

---

## Caso 7: EliminaciÓ¡n de proveedor sin dependencias

**MÉ¡todo:** `DELETE /api/proveedores/:id`  
**Headers:** `Authorization: Bearer <token>`  
**Body:** (ninguno)  
**Resultado esperado:** `200 OK` o `204 No Content`

```bash
curl -X DELETE http://localhost:3000/api/proveedores/1 \
  -H "Authorization: Bearer <token>"
```

---

## Caso 8: EliminaciÓ¡n de registro inexistente

**MÉ¡todo:** `DELETE /api/proveedores/:id`  
**Headers:** `Authorization: Bearer <token>`  
**Body:** (ninguno)  
**Resultado esperado:** `404 Not Found` (error P2025)

```bash
curl -X DELETE http://localhost:3000/api/proveedores/99999 \
  -H "Authorization: Bearer <token>"
```

---

## Caso 9: EliminaciÓ¡n con dependencias en `proveedor_ingrediente`

**MÉ¡todo:** `DELETE /api/proveedores/:id`  
**Headers:** `Authorization: Bearer <token>`  
**Body:** (ninguno)  
**Pre-condiciÓ¡n:** El proveedor debe tener registros en la tabla intermedia `proveedor_ingrediente`  
**Resultado esperado:** `400 Bad Request` con error de FK (P2003) - "No se puede eliminar: hay registros relacionados"

```bash
curl -X DELETE http://localhost:3000/api/proveedores/<id-con-dependencias> \
  -H "Authorization: Bearer <token>"
```

---

## Resumen de cÓ¡digos de error esperados

| Caso | DescripciÓ¡n | CÓ【digo HTTP | Error Prisma |
|------|-------------|--------------|--------------|
| 1-2 | Lectura exitosa | 200 | - |
| 3 | CreaciÓ¡n exitosa | 201 | - |
| 4 | FK invlida | 400 | P2003 |
| 5 | ActualizaciÓ¡n exitosa | 200 | - |
| 6 | Actualizar inexistente | 404 | P2025 |
| 7 | EliminaciÓ¡n exitosa | 200/204 | - |
| 8 | Eliminar inexistente | 404 | P2025 |
| 9 | Eliminar con dependencias | 400 | P2003 |

---

## Notas

- Todos los endpoints requieren autenticaciÓ¡n JWT (ver `auth.controller.js` para obtener token con login)
- Los errores de Prisma se manejan centralizadamente en `middleware/errorHandler.js`
- Para pruebas automatizadas futuras: se puede usar Jest + Supertest
