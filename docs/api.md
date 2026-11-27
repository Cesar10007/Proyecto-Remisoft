# API de RemiSoft — Documentación por endpoint

Documentación completa de la API REST del backend (Express 5 + Prisma + MariaDB),
generada a partir del código real (`backend/src/routes`, `backend/src/controllers`).
Forma parte de la checklist de entrega (criterio 11 — API documentada).

---

## 1. Convenciones generales

| Aspecto | Detalle |
|---------|---------|
| URL base | `/api` (en Docker: nginx reenvía `/api/` a `backend:3000`) |
| Formato | JSON (`Content-Type: application/json`; límite 1 MB) |
| Autenticación | JWT — cabecera `Authorization: Bearer <token>` (expira en 8 h por defecto) |
| Roles | `SUPERADMIN`, `GERENTE`, `CAJERO`, `MESERO`, `REPARTIDOR`, `COCINERO` |
| Sede activa | La API opera **solo sobre la sede activa** del usuario (`id_restaurante`). `SUPERADMIN` puede elegir sede con `?id_restaurante=<id>` |
| Sistema cerrado | Si el establecimiento está cerrado, las escrituras responden `423` (lecturas siguen disponibles) |
| Rate limit | `/api/auth/login`, `/api/auth/send-reset-link` y `/api/auth/reset-password` tienen limitador de intentos (`authLimiter`) |

### 1.1 Errores comunes (todas las rutas)

| Código | Cuerpo | Cuándo ocurre |
|--------|--------|---------------|
| `401` | `{ "message": "No autenticado" }` | Token ausente, inválido o expirado |
| `403` | `{ "message": "No tienes permisos para realizar esta acción." }` | El rol del JWT no está permitido en la ruta |
| `422` | `{ "message": "..." }` o `{ "errors": { "campo": ["..."] } }` | Validación de entrada / sin sede seleccionada |
| `400` | `{ "success": false, "message": "No se puede completar la operación porque existen registros relacionados", "code": "FOREIGN_KEY_CONSTRAINT" }` | FK de Prisma (`P2003`) |
| `409` | `{ "success": false, "message": "Ya existe un registro con ese <campo>", "code": "DUPLICATE_ENTRY" }` | Único duplicado (`P2002`) |
| `409` | `{ "message": "Otra operación cambió la cuenta. Actualiza e inténtalo de nuevo." }` | Concurrencia optimista (`P2034`) |
| `409` | `{ "success": false, "message": "...", "code": "STOCK_INSUFICIENTE", "detalles": [...] }` | Stock insuficiente al crear/modificar pedidos |
| `423` | `{ "code": "SISTEMA_CERRADO", "message": "..." }` | Escritura con el sistema cerrado |
| `404` | `{ "success": false, "message": "Registro no encontrado", "code": "NOT_FOUND" }` | Entidad inexistente (`P2025`) |

> Nota: el backend usa dos envoltorios de error según el módulo: `{ message }` (mayoría de
> validaciones y errores de dominio) y `{ success, message, code }` (mapeo de errores Prisma y
> stock). Ambos conviven en el código actual y se indican por endpoint.

---

## 2. Índice de módulos

| Módulo | Prefijo | Roles (resumen) |
|--------|---------|-----------------|
| [Autenticación](#3-autenticación) | `/api/auth` | público + autenticados |
| [Sistema](#4-sistema) | `/api/sistema` | todos / GERENTE |
| [Solicitudes de registro](#5-solicitudes-de-registro) | `/api/solicitudes` | SUPERADMIN, GERENTE |
| [Roles](#6-roles) | `/api/roles` | SUPERADMIN |
| [Usuarios](#7-usuarios) | `/api/usuarios` | SUPERADMIN, GERENTE |
| [Restaurantes](#8-restaurantes) | `/api/restaurantes` | SUPERADMIN, GERENTE |
| [Categorías](#9-categorías-de-productos) | `/api/categorias` | SUPERADMIN, GERENTE, CAJERO, MESERO |
| [Clientes](#10-clientes) | `/api/clientes` | lectura amplia / escritura GERENTE |
| [Productos](#11-productos) | `/api/productos` | lectura CAJERO+ / escritura GERENTE |
| [Ingredientes](#12-ingredientes) | `/api/ingredientes` | SUPERADMIN, GERENTE |
| [Inventario](#13-inventario) | `/api/inventario` | SUPERADMIN, GERENTE (ajustes) |
| [Pedidos](#14-pedidos) | `/api/pedidos` | SUPERADMIN, GERENTE, CAJERO, MESERO |
| [Detalle de pedido](#15-detalle-de-pedido) | `/api/detalle-pedido` | SUPERADMIN, GERENTE, CAJERO, MESERO |
| [Salón](#16-servicio-de-salón) | `/api/salon` | MESERO |
| [Cocina](#17-cocina) | `/api/cocina` | SUPERADMIN, GERENTE, MESERO, COCINERO |
| [Cobro](#18-cobro) | `/api/cobro` | SUPERADMIN, GERENTE, CAJERO |
| [Facturas](#19-facturas) | `/api/facturas` | SUPERADMIN, GERENTE, CAJERO, MESERO |
| [Cajas](#20-cajas) | `/api/cajas` | SUPERADMIN, GERENTE, CAJERO |
| [Turnos de caja](#21-turnos-de-caja) | `/api/turnos` | SUPERADMIN, GERENTE, CAJERO |
| [Domicilios](#22-domicilios) | `/api/domicilios` | SUPERADMIN, GERENTE, CAJERO, REPARTIDOR |
| [Proveedores](#23-proveedores) | `/api/proveedores` | SUPERADMIN, GERENTE |
| [Reportes](#24-reportes) | `/api/reportes` | SUPERADMIN, GERENTE (+ MESERO en ventas) |
| [IA](#25-analítica-ia) | `/api/ia` | SUPERADMIN, GERENTE |
| [Historial](#26-historial-de-actividad) | `/api/historial` | SUPERADMIN, GERENTE |
| [Mesas](#27-mesas) | `/api/mesas` | SUPERADMIN, GERENTE (gestión) |

---

## 3. Autenticación

### `POST /api/auth/login` — público (rate limit)

**Petición**
```json
{ "email": "gerente@remi.local", "contrasena": "secreta123" }
```

**Respuesta `200`**
```json
{
  "token": "<jwt>",
  "token_type": "Bearer",
  "auth_provider": "jwt",
  "rol": "GERENTE",
  "user": { "id_usuario": 1, "email": "gerente@remi.local", "...": "..." }
}
```

**Errores:** `422` `{ errors: { email: ["El campo email es requerido."] } }` (ídem `contrasena`);
`401` `"Credenciales inválidas."`; `403` `"Usuario inactivo."`;
`403` `"Tu usuario no tiene un establecimiento asignado."`.

### `POST /api/auth/solicitud-registro` — público

Solicitud de alta de personal (queda `PENDIENTE` hasta que un SUPERADMIN/GERENTE la revise).

**Petición**
```json
{
  "nombre": "Ana", "apellido": "Gómez", "email": "ana@remi.local",
  "telefono": "3001234567", "contrasena": "minimo8carac",
  "id_rol_solicitado": 4, "id_restaurante": 1
}
```

**Respuesta:** `201` con la solicitud creada.
**Errores:** `422` `{ errors: { campo: ["..."] } }` (nombre/apellido requeridos, email inválido o
duplicado, contraseña < 8 caracteres).

### `GET /api/auth/me` — autenticado
**Respuesta `200`:** `{ "user": { ...datos del JWT... } }`

### `POST /api/auth/logout` — autenticado
**Respuesta `200`:** `{ "message": "Sesión cerrada. Elimina el token JWT del cliente." }`
(El JWT es stateless: el cliente debe descartarlo.)

### `POST /api/auth/send-reset-link` — público (rate limit)
**Petición:** `{ "email": "usuario@remi.local" }`
**Respuesta:** `200`. Envía enlace con token temporal por SMTP (Mailtrap en desarrollo).
**Errores:** `422` email inválido.

### `POST /api/auth/reset-password` — público (rate limit)
**Petición:** `{ "token": "<token del correo>", "email": "usuario@remi.local", "password": "nuevaClave" }`
**Respuesta:** `200`.
**Errores:** `422` token inválido/expirado o contraseña débil.

---

## 4. Sistema

> Rutas protegidas por JWT. Requieren sede activa (`422` "Selecciona un establecimiento." si falta).

| Método y ruta | Roles | Descripción |
|---------------|-------|-------------|
| `GET /api/sistema` | todos | Estado: `{ sistema_abierto, version_sistema }` (sin caché) |
| `GET /api/sistema/revision` | GERENTE | Pendientes de cierre antes de apagar el sistema |
| `POST /api/sistema/cerrar` | GERENTE | Cierra el sistema (bloquea escrituras) |
| `POST /api/sistema/abrir` | GERENTE | Reabre el sistema |

**Errores:** `423` `{ code: "SISTEMA_CERRADO" }` en escrituras de otros módulos cuando está cerrado;
`409` con pendientes de cierre si no se puede cerrar.

---

## 5. Solicitudes de registro

Roles: `SUPERADMIN`, `GERENTE`.

| Método y ruta | Descripción |
|---------------|-------------|
| `GET /api/solicitudes` | Lista solicitudes (`?estado=PENDIENTE|APROBADA|RECHAZADA`) |
| `GET /api/solicitudes/historial` | Historial de revisiones |
| `PATCH /api/solicitudes/:id/aprobar` | Aprueba y crea el usuario (acepta `nombre_establecimiento` para crear sede) |
| `PATCH /api/solicitudes/:id/rechazar` | Rechaza con `motivo_rechazo` |

**Errores:** `404` solicitud inexistente; `409` si ya fue revisada.

---

## 6. Roles

Roles: `SUPERADMIN`. CRUD completo:

| Método y ruta | Cuerpo |
|---------------|--------|
| `GET /api/roles` | — |
| `GET /api/roles/:id` | — |
| `POST /api/roles` | `{ nombre, descripcion }` |
| `PUT /api/roles/:id` | `{ nombre?, descripcion? }` |
| `DELETE /api/roles/:id` | — |

**Errores:** `409 DUPLICATE_ENTRY` si el nombre ya existe; `400 FOREIGN_KEY_CONSTRAINT` si tiene usuarios.

---

## 7. Usuarios

Roles: `SUPERADMIN`, `GERENTE` (todo el módulo).

| Método y ruta | Descripción |
|---------------|-------------|
| `GET /api/usuarios/mis-sedes` | Sedes habilitadas para el usuario autenticado (gerente multisede) |
| `PATCH /api/usuarios/me/sede` | Cambia la sede activa: `{ "id_restaurante": 2 }` (solo entre las propias) |
| `GET /api/usuarios` | Listado (filtra personal oculto) |
| `GET /api/usuarios/:id` | Ficha |
| `POST /api/usuarios` | Alta |
| `PUT /api/usuarios/:id` | Edición |
| `PATCH /api/usuarios/:id/estado` | `{ "activo": true|false }` |
| `DELETE /api/usuarios/:id` | Ocultamiento lógico (queda en `personal_oculto`) |
| `GET /api/usuarios/:id/sedes` | Membresías del usuario |
| `PUT /api/usuarios/:id/sedes` | `{ "sedes": [1, 2] }` (solo SUPERADMIN asigna/retira) |

**Cuerpo de alta/edición**
```json
{
  "identificacion": "CC123", "nombre": "Ana", "apellido": "Gómez",
  "email": "ana@remi.local", "telefono": "3001234567",
  "id_rol": 4, "contrasena": "minimo8carac",
  "id_restaurante": 1, "nombre_establecimiento": "Sede Norte"
}
```
`contrasena` es requerida en alta y opcional en edición. `nombre_establecimiento` crea un
establecimiento nuevo (flujo de gerente).

**Errores:** `422` `{ message: "El campo ..." }` (validación por campo); `422` correo duplicado
(`"Correo inválido, ingrese otro."`); `403` si un GERENTE intenta editar roles superiores o sedes ajenas.

---

## 8. Restaurantes

Roles: `SUPERADMIN`, `GERENTE`.

| Método y ruta | Descripción |
|---------------|-------------|
| `GET /api/restaurantes` | Lista de establecimientos/sedes |

---

## 9. Categorías de productos

Roles: `SUPERADMIN`, `GERENTE`, `CAJERO`, `MESERO`.

| Método y ruta | Descripción |
|---------------|-------------|
| `GET /api/categorias` | Listado de la sede |
| `GET /api/categorias/:id` | Detalle |

---

## 10. Clientes

| Método y ruta | Roles |
|---------------|-------|
| `GET /api/clientes` | SUPERADMIN, GERENTE, CAJERO, MESERO, REPARTIDOR |
| `GET /api/clientes/buscar?telefono=300...` | ídem (búsqueda por teléfono) |
| `GET /api/clientes/:id` | ídem |
| `POST /api/clientes` | SUPERADMIN, GERENTE, CAJERO, MESERO |
| `PUT /api/clientes/:id` | SUPERADMIN, GERENTE |
| `DELETE /api/clientes/:id` | SUPERADMIN, GERENTE |

**Cuerpo (crear/editar)**
```json
{
  "Nombre": "Carlos", "Apellido": "Pérez", "Email": "carlos@mail.com",
  "Telefono": "3001234567", "Direccion": "Cra 1 # 2-3",
  "coordenadas_gps": "4.6,-74.1", "tipo_documento": "CC", "Num_documento": "1020..."
}
```
`Nombre` y `Email` son requeridos (máx. 50 y 60 caracteres).

**Errores:** `422` `{ errors: { Email: ["..."] } }`; `409 DUPLICATE_ENTRY` por email repetido en la sede
(`cliente_sede_email_key`).

---

## 11. Productos

| Método y ruta | Roles | Descripción |
|---------------|-------|-------------|
| `GET /api/productos/vista` | SUPERADMIN, GERENTE, CAJERO, MESERO | Listado desde la **vista SQL** `vista_listado_productos` |
| `GET /api/productos/sp` | ídem | Listado vía **procedimiento almacenado** `sp_listar_productos` |
| `GET /api/productos` | ídem | Listado (categoría, estado, sede) |
| `GET /api/productos/:id` | ídem | Detalle |
| `GET /api/productos/:id/receta` | SUPERADMIN, GERENTE | Ingredientes del producto |
| `PUT /api/productos/:id/receta` | SUPERADMIN, GERENTE | Guarda receta: `[{ id_ingrediente, cantidad, unidad }]` |
| `POST /api/productos` | SUPERADMIN, GERENTE | Alta |
| `PUT /api/productos/:id` | SUPERADMIN, GERENTE | Edición (precio, descripción, disponibilidad) |
| `DELETE /api/productos/:id` | SUPERADMIN, GERENTE | Baja lógica |

**Cuerpo (crear/editar):** `{ "Nombre", "Descripcion", "precio_venta", "id_categoria", "Tiempo_preparacion", "Estado" }`.

**Errores:** `422` por campos inválidos; `409` si tiene pedidos asociados al intentar borrar.

---

## 12. Ingredientes

Roles: `SUPERADMIN`, `GERENTE` (todo el módulo).

| Método y ruta | Descripción |
|---------------|-------------|
| `GET /api/ingredientes` | Listado con stock por sede |
| `POST /api/ingredientes` | Alta con stock inicial |
| `PUT /api/ingredientes/:id` | Edición + conciliación de conteo opcional |
| `DELETE /api/ingredientes/:id` | Baja (ocultamiento con motivo) |

**Cuerpo (alta)**
```json
{
  "nombre": "Arroz", "descripcion": "Arroz blanco",
  "unidad_medida": "g", "unidad_presentacion": "kg", "cantidad_base": 1000, "factor_unidad": 1,
  "costo_unitario_ref": 3500, "stock_minimo": 5000, "stock_actual": 20000
}
```

**Cuerpo (edición)** — además de los campos editables, permite **conciliar el conteo físico**:
```json
{ "nombre": "Arroz", "costo_unitario_ref": 3800, "stock_minimo": 4000,
  "stock_actual": 19500, "stock_esperado": 20000, "motivo": "Merma por humedad en bodega" }
```
Si `stock_actual ≠ stock_esperado`, `motivo` es obligatorio (5–1000 caracteres) y se registra el
movimiento de ajuste correspondiente.

**Errores:** `422` con mensaje por campo (`nombre` requerido, máx. 50; costos numéricos; stock
0–9999999.999 con 3 decimales; motivo del ajuste requerido); `404` `"Ingrediente no encontrado"`.

---

## 13. Inventario

| Método y ruta | Roles | Descripción |
|---------------|-------|-------------|
| `GET /api/inventario` | SUPERADMIN, GERENTE | Libro de movimientos (`?id_ingrediente=`, filtros de fecha) |
| `GET /api/inventario/alertas/stock-bajo` | ídem | Ingredientes bajo stock mínimo (`?stock_minimo=true`) |
| `GET /api/inventario/:id` | ídem | Historial de un ingrediente |
| `POST /api/inventario/ajuste` | SUPERADMIN, GERENTE | Ajuste manual (entrada/salida/merma) |

**Cuerpo del ajuste**
```json
{ "id_ingrediente": 3, "tipo": "SALIDA", "cantidad": 500, "motivo": "Merma por vencimiento" }
```

**Errores:** `422` por cantidad/tipo inválidos; `409 STOCK_INSUFICIENTE` si la salida excede el stock
(con `detalles` por ingrediente).

---

## 14. Pedidos

| Método y ruta | Roles |
|---------------|-------|
| `GET /api/pedidos` | SUPERADMIN, GERENTE, CAJERO, MESERO |
| `GET /api/pedidos/:id` | ídem |
| `POST /api/pedidos` | SUPERADMIN, GERENTE, MESERO |
| `PUT /api/pedidos/:id` | SUPERADMIN, GERENTE, CAJERO, MESERO |
| `DELETE /api/pedidos/:id` | SUPERADMIN, GERENTE, MESERO (cancelar) |

**Cuerpo (crear/editar)**
```json
{
  "id_cliente": 5, "id_mesero": 2, "Tipo_pedido": "MESA",
  "Mesa_num": 4, "estado": "ABIERTO", "notas": "Sin cebolla",
  "items": [ { "id_producto": 10, "cantidad": 2, "nota": "bien cocido" } ]
}
```
- `Tipo_pedido`: `MESA` | `DOMICILIO` | `LLEVAR`. Para `DOMICILIO`/`LLEVAR` no se exige mesa
  (se acepta `mesa` como alias de `Mesa_num`).
- Los ítems descuentan inventario de forma atómica según las recetas.

**Respuesta `201`:** `{ "message": "Pedido creado", "id_pedido": 42 }`

**Errores:** `422` `{ message: <error de validación> }`; `404` `"Pedido no encontrado"`;
`409` `"Usa el flujo de salón para modificar esta cuenta."` (cuentas de salón);
`409 STOCK_INSUFICIENTE` con `detalles` de insumos faltantes.

---

## 15. Detalle de pedido

| Método y ruta | Roles | Descripción |
|---------------|-------|-------------|
| `GET /api/detalle-pedido` | SUPERADMIN, GERENTE, CAJERO, MESERO | Ítems (`?id_pedido=42`) |
| `GET /api/detalle-pedido/:id` | ídem | Un ítem |
| `POST /api/detalle-pedido` | SUPERADMIN, GERENTE, MESERO | Agrega ítem: `{ id_pedido, id_producto, cantidad }` |
| `PUT /api/detalle-pedido/:id` | ídem | Modifica cantidad |
| `DELETE /api/detalle-pedido/:id` | ídem | Quita ítem |

**Errores:** `422` por cantidades inválidas; `409` si el ítem ya está en preparación.

---

## 16. Servicio de salón

Roles: `MESERO` (todo el módulo). Errores propios del dominio (`ErrorSalon`) con `{ message }`.

| Método y ruta | Descripción |
|---------------|-------------|
| `GET /api/salon` | Tablero de mesas con estado y cuentas abiertas |
| `GET /api/salon/carta` | Menú disponible para tomar comanda |
| `PATCH /api/salon/mesas/:numero/estado` | Cambia ocupación de la mesa |
| `POST /api/salon/pedidos` | **Abrir comanda** en una mesa |
| `PUT /api/salon/pedidos/:id` | **Editar** comanda (solo con todo en `PENDIENTE`) |
| `DELETE /api/salon/pedidos/:id` | **Cancelar** comanda |
| `POST /api/salon/pedidos/:id/rondas` | Agrega una **ronda** de platos |
| `POST /api/salon/pedidos/:id/cuenta` | Envía la **precuenta** a caja |

**Cuerpo (abrir)**
```json
{ "mesa": 4, "comensales": 2, "id_cliente": 5, "id_atencion": 7,
  "items": [ { "id_producto": 10, "cantidad": 2 } ] }
```

**Errores frecuentes:** `404` `"No se encontró la cuenta entre tus mesas."`;
`409` `"La cuenta ya no admite cambios."`, `"Cocina ya empezó la preparación..."`,
`"Los platos del pedido cambiaron. Vuelve a abrir la comanda."`,
`"La mesa tiene una cuenta abierta..."`; `409 STOCK_INSUFICIENTE` al abrir.

---

## 17. Cocina

| Método y ruta | Roles | Descripción |
|---------------|-------|-------------|
| `GET /api/cocina/comandas` | SUPERADMIN, GERENTE, MESERO, COCINERO | Cola de comandas agrupada por pedido |
| `GET /api/cocina/historial` | ídem | Ítems terminados (`?limite=60`, máx. 200) |
| `PATCH /api/cocina/items/:id/avanzar` | ídem | Avanza el ítem: `{ "estado_item": "EN_PREPARACION" \| "LISTO" }` |

**Errores:** `422` si el estado solicitado no corresponde al siguiente paso del ciclo
`PENDIENTE → EN_PREPARACION → LISTO`.

---

## 18. Cobro

Roles: `SUPERADMIN`, `GERENTE`, `CAJERO`. Errores `ErrorSalon` con `{ message }` y `423` si el sistema está cerrado.

| Método y ruta | Descripción |
|---------------|-------------|
| `GET /api/cobro/pendientes` | Cuentas en caja esperando cobro |
| `POST /api/cobro/cerrar-cuenta` | Cobra y liquida la cuenta completa |
| `POST /api/cobro/dividir-cuenta` | Divide la cuenta (por partes o por ítems) |
| `DELETE /api/cobro/dividir-cuenta/:idPedido` | Elimina la división (vuelve a cuenta única) |
| `POST /api/cobro/partes/:idParte/pagar` | Paga una parte de la cuenta dividida |

**Cuerpo (cerrar-cuenta / pagar parte)**
```json
{
  "id_pedido": 42, "version_factura": 3,
  "pagos": [
    { "metodo": "EFECTIVO", "monto": 20000, "monto_recibido": 50000 },
    { "metodo": "TARJETA", "monto": 30000, "referencia": "AP-9988" }
  ]
}
```
También se acepta forma simple: `{ metodo, monto_recibido, referencia }` (un solo pago por el total).
Métodos válidos: `EFECTIVO`, `TARJETA`, `TRANSFERENCIA` (u otros del catálogo `METODOS_PAGO`);
en efectivo `monto_recibido ≥ monto` y se devuelve `cambio`.

**Cuerpo (dividir-cuenta)**
```json
{ "id_pedido": 42, "modo": "PARTES", "numero_partes": 3 }
```
o por ítems: `{ "id_pedido": 42, "modo": "ITEMS", "partes": [ { "items": [ {"id_detalle": 7, "cantidad": 1} ] }, ... ] }` (2–12 partes).

**Errores:** `422` `"Cada pago debe ser mayor que cero."`, `"El monto recibido no alcanza..."`;
`409` `"Otra operación cambió la cuenta..."` si `version_factura` no coincide (concurrencia optimista).

---

## 19. Facturas

| Método y ruta | Roles |
|---------------|-------|
| `GET /api/facturas` | SUPERADMIN, GERENTE, CAJERO, MESERO (el MESERO solo ve las suyas) |
| `GET /api/facturas/:id` | ídem |
| `POST /api/facturas` | ídem |
| `PUT /api/facturas/:id` | ídem |
| `DELETE /api/facturas/:id` | SUPERADMIN, GERENTE |

**Cuerpo (generar)**
```json
{ "id_pedido": 42, "receptor": "Carlos Pérez", "descuento": 2000, "propina": 5000 }
```
Campos editables permitidos: `receptor`, `descuento`, `propina` (cualquier otro campo se rechaza `422`).

**Cuerpo (editar)**
```json
{ "version_edicion": 3, "receptor": "Empresa XYZ", "descuento": 0 }
```

**Respuesta:** la factura con `consecutivo`, `CUFE`, `IVA`, `total` y `estado`.
**Errores:** `422` campos no permitidos o valores inválidos; `409` si `version_edicion` no coincide;
`404` `"Pedido no encontrado"`.

---

## 20. Cajas

| Método y ruta | Roles | Descripción |
|---------------|-------|-------------|
| `GET /api/cajas` | SUPERADMIN, GERENTE, CAJERO | Listado con turno activo (`?estado=ACTIVA`) |
| `POST /api/cajas` | SUPERADMIN, GERENTE | `{ "nombre": "Caja 1", "estado": "ACTIVA" }` |
| `PUT /api/cajas/:id` | SUPERADMIN, GERENTE, CAJERO | `{ "nombre"?, "estado"? }` |
| `PATCH /api/cajas/:id/estado` | SUPERADMIN, GERENTE | `{ "estado": "INACTIVA" }` |
| `DELETE /api/cajas/:id` | SUPERADMIN, GERENTE | Equivale a poner `INACTIVA` |

**Errores:** `422` nombre/estado inválidos; `400 FOREIGN_KEY_CONSTRAINT` si tiene turnos.

---

## 21. Turnos de caja

| Método y ruta | Roles | Descripción |
|---------------|-------|-------------|
| `GET /api/turnos` | SUPERADMIN, GERENTE, CAJERO | Turnos (`?id_caja=`) |
| `GET /api/turnos/aperturas` | + MESERO | Historial de aperturas |
| `GET /api/turnos/gastos` | + MESERO | Egresos por turno |
| `GET /api/turnos/arqueos` | + MESERO | Arqueos de cierre |
| `GET /api/turnos/movimientos` | SUPERADMIN, GERENTE, CAJERO | Flujo de caja paginado por cursor (`?antes=<id_flujo>`) → `{ data, siguiente }` |
| `GET /api/turnos/:id` | ídem | Detalle |
| `POST /api/turnos` | ídem | Apertura |
| `POST /api/turnos/:id/cerrar` | ídem | Cierre con arqueo |
| `PUT /api/turnos/:id` | ídem | Edición |
| `DELETE /api/turnos/:id` | SUPERADMIN, GERENTE | Elimina turno sin movimientos |

**Cuerpo (apertura)**
```json
{ "id_caja": 1, "id_usuario_cajero": 3, "fecha_apertura": "2026-11-25T08:00:00",
  "efectivo_inicial": 100000, "notas": "Turno mañana" }
```

**Cuerpo (cierre):** `{ "efectivo_real": 250000, "notas": "Diferencia por propinas" }`
→ el sistema calcula `efectivo_esperado` y `diferencia`.

**Errores:** `400` `{ code: "MISSING_CAJA" }` / `"MISSING_CAJERO"`; `409` turno ya cerrado o caja con turno abierto.

---

## 22. Domicilios

| Método y ruta | Roles | Descripción |
|---------------|-------|-------------|
| `GET /api/domicilios/resumen` | SUPERADMIN, GERENTE, CAJERO, REPARTIDOR | Resumen del repartidor autenticado |
| `GET /api/domicilios` | ídem | Listado (estado, repartidor, sede) |
| `POST /api/domicilios` | SUPERADMIN, GERENTE | Alta |
| `PUT /api/domicilios/:id` | SUPERADMIN, GERENTE, REPARTIDOR | Edición / cambio de estado |
| `DELETE /api/domicilios/:id` | SUPERADMIN, GERENTE | Elimina el domicilio |

**Cuerpo**
```json
{ "id_pedido": 42, "direccion": "Cra 10 # 20-30", "estado": "ASIGNADO", "id_repartidor": 6 }
```

**Errores:** `422` campos inválidos; `409` si el pedido ya tiene domicilio.

---

## 23. Proveedores

Roles: `SUPERADMIN`, `GERENTE` (todo el módulo).

| Método y ruta | Descripción |
|---------------|-------------|
| `GET /api/proveedores` | Listado |
| `GET /api/proveedores/:id` | Detalle (contacto, ingredientes que suministra) |
| `POST /api/proveedores` | Alta |
| `PUT /api/proveedores/:id` | Edición |
| `DELETE /api/proveedores/:id` | Baja lógica (`estado: "INACTIVO"`) |

**Cuerpo:** `{ "nombre", "nombre_contacto", "telefono", "email", "direccion", "nit", "tipo_proveedor", "estado" }`.

**Errores:** `422`; `409` si tiene órdenes de compra asociadas.

---

## 24. Reportes

| Método y ruta | Roles | Parámetros | Descripción |
|---------------|-------|------------|-------------|
| `GET /api/reportes/ventas-diarias` | SUPERADMIN, GERENTE, MESERO | `?desde=&hasta=` | Ventas por fecha de pago (productos más vendidos, ingresos) |
| `GET /api/reportes/pedidos-activos` | SUPERADMIN, GERENTE | — | Pedidos abiertos en curso |
| `GET /api/reportes/gastos-del-mes` | SUPERADMIN, GERENTE | — | Egresos del mes por caja |
| `GET /api/reportes/tendencia` | SUPERADMIN, GERENTE | `?periodo=semana\|mes&ancla=<fecha>` | Tendencia de ventas para analítica/IA |

**Respuesta:** objetos con series y totales; `422` ante fechas/periodos inválidos.

---

## 25. Analítica (IA)

Roles: `SUPERADMIN`, `GERENTE`.

| Método y ruta | Descripción |
|---------------|-------------|
| `GET /api/ia` | Predicciones generadas (demanda, recomendaciones) |
| `POST /api/ia` | Registra un análisis |

**Cuerpo:** `{ "Tipo_prediccion": "DEMANDA", "Resultado_generado": "...", "Recomendaciones_generales": "..." }`.

---

## 26. Historial de actividad

Roles: `SUPERADMIN`, `GERENTE`.

| Método y ruta | Descripción |
|---------------|-------------|
| `GET /api/historial` | Bitácora `actividad_sede` (cursor por `id_evento`) |
| `GET /api/historial/cambios` | **Long-poll** (`?version=`): responde cuando hay actividad nueva |

---

## 27. Mesas

| Método y ruta | Roles | Descripción |
|---------------|-------|-------------|
| `GET /api/mesas` | SUPERADMIN, GERENTE | Listado de mesas de la sede |
| `POST /api/mesas` | SUPERADMIN, GERENTE | `{ "numero": 12, "capacidad": 4 }` |
| `PUT /api/mesas/:numero` | ídem | `{ "numero"?, "capacidad"?, "id_mesa"?, "capacidad_esperada"? }` (los `*_esperado` protegen contra escrituras concurrentes) |
| `DELETE /api/mesas/:numero` | ídem | Elimina la mesa |

**Errores:** `422` número/capacidad inválidos; `409` conflicto de concurrencia si `id_mesa` o
`capacidad_esperada` no coinciden con el estado actual.

---

## 28. Evidencia de la documentación

- Toda la lista de rutas proviene de `backend/src/routes/*.js` (122 rutas montadas, auditadas por
  `backend/scripts/prueba-aislamiento.sh`: cada ruta tiene rol y filtro de sede).
- Los cuerpos y respuestas provienen de los controllers/services correspondientes
  (`validarPedido`, `validarCliente`, `validarUsuario`, `leerPagos`, `abrirMesa`, etc.).
- Los errores globales provienen de `backend/src/middleware/errorHandler.js`.
