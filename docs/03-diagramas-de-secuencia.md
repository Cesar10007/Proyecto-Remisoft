# Diagramas de secuencia — RemiSoft

Flujos tomados del código real: rutas montadas en `backend/src/app.js`, controladores en
`backend/src/controllers/`, middlewares en `backend/src/middleware/`. Todos los endpoints van precedidos
por `/api` y pasan por `authMiddleware` (excepto login, registro y recuperación de contraseña).

Endpoints verificados uno por uno contra `backend/src/app.js` y `backend/src/routes/*.routes.js` de la
rama `develop`.

Middlewares que aparecen:
- `authMiddleware` — verifica el JWT y deja el usuario en `req.usuario`.
- `requireRole(...)` — autoriza por rol (403 si no corresponde).
- `filtroRestaurante` — inyecta el `id_restaurante` del usuario; falla cerrado (403) si el usuario no tiene sede.
- `errorHandler` — traduce excepciones a respuestas JSON uniformes.

---

## 1. Inicio de sesión y autorización por rol

```mermaid
sequenceDiagram
  autonumber
  actor U as Usuario
  participant F as Frontend (React)
  participant A as API Express
  participant R as Rutas /auth
  participant C as auth.controller
  participant P as Prisma
  participant DB as MariaDB

  U->>F: correo + contraseña
  F->>A: POST /api/auth/login
  A->>R: router público (sin authMiddleware)
  R->>C: login(req.body)
  C->>P: usuario.findUnique({ email })
  P->>DB: SELECT usuario + rol + restaurante
  DB-->>P: fila
  P-->>C: usuario
  alt credenciales inválidas
    C-->>F: 401 { mensaje: "Credenciales inválidas" }
  else usuario inactivo
    C-->>F: 403 { mensaje: "Usuario inactivo" }
  else sin establecimiento asignado
    C-->>F: 403 (filtroRestaurante falla cerrado)
  else correcto
    C->>C: bcrypt.compare(contraseña, hash)
    C->>C: firmar JWT (JWT_SECRET, JWT_EXPIRES_IN=1d)
    C-->>F: 200 { token, usuario: { rol, id_restaurante } }
    F->>F: guarda token en Redux + localStorage
    F-->>U: redirige según rol (/gerente, /mesero, /cajero, /cocina, /repartidor, /superadmin)
  end
```

---

## 2. Tomar un pedido por mesa

```mermaid
sequenceDiagram
  autonumber
  actor M as Mesero
  participant F as Frontend (Mesero)
  participant MW as authMiddleware + filtrarSede
  participant C as pedidos.controller
  participant P as Prisma
  participant DB as MariaDB

  M->>F: elige mesa y agrega platos
  F->>MW: POST /api/salon/pedidos { mesa, tipo, items[] }
  MW->>MW: valida JWT y rol (MESERO/CAJERO/GERENTE)
  MW->>C: request autorizada (id_restaurante en req)
  C->>C: valida mesa libre, platos existentes y cantidades enteras
  alt datos inválidos
    C-->>F: 400 { mensaje }
  else mesa ocupada
    C-->>F: 409 { mensaje: "La mesa ya tiene un pedido abierto" }
  else válido
    C->>P: $transaction[ crear pedido (ABIERTO) + detalle_pedido[] + mesa_atencion ]
    P->>DB: INSERT ...
    DB-->>P: ok
    P-->>C: pedido creado
    C-->>F: 201 { id_pedido, estado: "ABIERTO" }
    F-->>M: pedido visible en el salón
  end
```

---

## 3. Comanda de cocina y avance de estados

```mermaid
sequenceDiagram
  autonumber
  actor M as Mesero
  actor K as Cocinero
  participant F1 as Frontend Mesero
  participant F2 as Frontend Cocina
  participant API as API Express
  participant CK as cocina.controller
  participant P as Prisma
  participant DB as MariaDB

  M->>F1: envía pedido a preparación
  F1->>API: POST /api/salon/pedidos/:id/rondas { items[] }
  API->>CK: pedido abierto con renglones nuevos
  CK->>P: update pedido + detalle_pedido
  P->>DB: UPDATE ...
  DB-->>P: ok
  API-->>F1: 200 { estado }

  K->>F2: abre /cocina
  F2->>API: GET /api/cocina/comandas
  API->>CK: comandas pendientes (PENDIENTE/PREPARANDO)
  CK->>P: findMany con filtro de sede
  P-->>CK: comandas
  CK-->>F2: 200 [ comandas ]

  K->>F2: marca ítem como LISTO
  F2->>API: PATCH /api/cocina/items/:id/avanzar
  API->>CK: PENDIENTE → PREPARANDO → LISTO → ENTREGADO
  CK->>P: update detalle_pedido
  P->>DB: UPDATE
  CK-->>F2: 200 { estado: "LISTO" }
  Note over API,F1: el mesero recibe el aviso en la campanita (Header)<br/>y el pedido solo queda ENTREGADO al servir el último plato
```

---

## 4. Cerrar cuenta y facturar con pagos mixtos

```mermaid
sequenceDiagram
  autonumber
  actor C as Cajero
  participant F as Frontend (Cajero)
  participant API as API Express
  participant CO as cobro.controller
  participant FA as facturacion.service
  participant P as Prisma
  participant DB as MariaDB

  C->>F: abre la cuenta de la mesa
  F->>API: GET /api/cobro/pendientes
  API->>CO: calcula renglones activos
  CO->>P: detalle_pedido + producto
  CO-->>F: 200 { subtotal, iva, propina, total }
  F-->>C: precuenta en pantalla

  C->>F: divide la cuenta / elige metodos de pago
  F->>API: POST /api/cobro/dividir-cuenta { id_pedido, partes[] }
  API-->>F: 201 { partes[] }
  F->>API: POST /api/cobro/partes/:idParte/pagar { metodo, monto }
  API->>CO: registra el pago de la parte
  F->>API: POST /api/cobro/cerrar-cuenta { id_pedido, propina, descuento }
  API->>CO: valida suma de pagos >= total y montos positivos
  alt pagos incompletos o montos inválidos
    CO-->>F: 400 { mensaje }
  else válido
    CO->>FA: generarFactura(pedido, pagos)
    FA->>FA: descuento antes de IVA, propina no gravada, centavos
    FA->>P: $transaction[ factura + factura_item + pago[] + pedido(CERRADO) ]
    P->>DB: INSERT/UPDATE
    DB-->>P: ok
    FA-->>CO: factura creada
    CO-->>F: 201 { id_factura, total, numero }
    F-->>C: factura lista para imprimir o enviar
  end
```

---

## 5. Descuento automático de inventario y alerta de stock mínimo

```mermaid
sequenceDiagram
  autonumber
  participant API as API Express
  participant PK as pedidos.controller
  participant INV as inventario
  participant P as Prisma
  participant DB as MariaDB
  actor G as Gerente

  API->>PK: la cocina avanza el item a PREPARANDO
  PK->>P: receta del producto (ingrediente, cantidad)
  P-->>PK: ingredientes requeridos
  PK->>INV: descontar stock por sede
  INV->>P: $transaction[ inventario_mov(SALIDA) + lote_ingrediente ]
  P->>DB: UPDATE stock
  DB-->>P: ok
  INV->>P: consulta stock vs stock_minimo
  alt stock por debajo del mínimo
    INV->>P: crear alerta de inventario
    G->>API: GET /api/inventario/alertas/stock-bajo
    API-->>G: 200 { alertas: [ ingrediente, stock, minimo ] }
  else stock suficiente
    INV-->>PK: sin alerta
  end
```

---

## 6. Pedido a domicilio y asignación al repartidor

```mermaid
sequenceDiagram
  autonumber
  actor CL as Cliente
  actor RE as Repartidor
  participant F as Web pública
  participant API as API Express
  participant D as domicilios.controller
  participant P as Prisma
  participant DB as MariaDB

  CL->>F: elige platos y datos de entrega
  F->>API: POST /api/domicilios { cliente, direccion, telefono, items[] }
  API->>D: valida campos obligatorios y zona
  D->>P: $transaction[ cliente + pedido + domicilio(PENDIENTE) ]
  P->>DB: INSERT
  D-->>F: 201 { id_domicilio, estado: "PENDIENTE" }
  F-->>CL: número de pedido

  CL->>API: GET /api/domicilios (consulta de su pedido)
  API-->>CL: 200 { estado: ASIGNADO | EN_CAMINO | ENTREGADO }

  RE->>API: GET /api/domicilios/resumen (rol REPARTIDOR)
  API->>D: filtra por repartidor y sede
  D-->>RE: [ domicilios asignados ]
  RE->>API: PUT /api/domicilios/:id { estado: "ENTREGADO" }
  API->>D: valida transicion permitida
  D->>P: UPDATE domicilio + pedido
  P->>DB: UPDATE
  D-->>RE: 200 { estado: "ENTREGADO" }
```

---

## 7. Recuperación de contraseña (SMTP)

```mermaid
sequenceDiagram
  autonumber
  actor U as Usuario
  participant F as Frontend
  participant API as API Express
  participant PR as passwordReset.controller
  participant P as Prisma
  participant SMTP as Servidor SMTP

  U->>F: "olvidé mi contraseña"
  F->>API: POST /api/auth/send-reset-link { email }
  API->>PR: genera token de un solo uso
  PR->>P: password_reset_tokens.create
  PR->>SMTP: envía correo con enlace firmado
  alt el correo no existe
    PR-->>F: 200 (misma respuesta, no revela si existe la cuenta)
  else enviado
    PR-->>F: 200 { mensaje: "Revisa tu correo" }
  end
  U->>F: abre el enlace y define la nueva clave
  F->>API: POST /api/auth/reset-password { token, contrasena }
  API->>PR: valida token vigente y reglas de contraseña
  PR->>P: usuario.update(hash) + token usado
  PR-->>F: 200 { mensaje }
```

Reglas de contraseña aplicadas (`usuarios.controller.js`): mínimo 8 caracteres, con minúscula,
mayúscula, dígito y carácter especial.

---

## 8. Exportar las finanzas del mes a Excel (frontend, sin backend)

```mermaid
sequenceDiagram
  autonumber
  actor G as Gerente
  participant FS as FinanzasSection (React)
  participant EX as utils/excel.ts
  participant NAV as Navegador

  G->>FS: clic en "Descargar Excel"
  FS->>FS: arma filas con stats[] y transacciones[] en pantalla
  FS->>EX: descargarExcel("finanzas-AAAA-MM-DD.xlsx", [hoja])
  EX->>EX: crea ZIP + OOXML (hojas, estilos, montos como números)
  EX->>NAV: Blob + <a download> + URL.createObjectURL
  NAV-->>G: descarga finanzas-AAAA-MM-DD.xlsx
  Note over EX,NAV: sin peticiones al backend y sin dependencias nuevas<br/>(el archivo abre en Excel, LibreOffice y Google Sheets)
```
