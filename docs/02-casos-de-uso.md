# Diagramas de casos de uso — RemiSoft

Actores del sistema (roles reales del repositorio, `backend/prisma/schema.prisma` → tabla `rol`):

| Actor | Descripción | Alcance |
|---|---|---|
| **Superadministrador** | Dueño de la cadena. Crea restaurantes y gerentes, ve todos los establecimientos. | Global |
| **Gerente** | Administra un establecimiento: personal, menú, inventario, proveedores, caja y reportes. | Su sede |
| **Cajero** | Cobra, factura, maneja caja y turnos. | Su sede |
| **Mesero** | Toma pedidos por mesa, consulta estado y cierra cuentas. | Su sede |
| **Cocinero** | Ve comandas y avanza el estado de cada ítem. | Cocina |
| **Repartidor** | Recibe domicilios asignados y reporta entregas. | Sus domicilios |
| **Cliente** | Pide a domicilio desde la web pública. | Sin sesión |
| *(Sistemas externos)* | SMTP (recuperación de contraseña), DIAN/CUFE *(no implementado)*, pasarela de pagos *(no implementada)*. | — |

Convenciones: `<<include>>` = obligatorio dentro del caso base; `<<extend>>` = opcional o condicional.

Los endpoints citados en la trazabilidad se verificaron uno por uno contra `backend/src/app.js` y
`backend/src/routes/` de la rama `develop` (29 grupos de rutas montados).

---

## 1. Contexto general (todos los actores)

```mermaid
flowchart LR
  classDef actor fill:#FDE68A,stroke:#B45309,stroke-width:2px,color:#3B2A07
  classDef uc fill:#E8F0FE,stroke:#1D4ED8,color:#0B1E4B
  classDef ext fill:#F3F4F6,stroke:#6B7280,stroke-dasharray:4 3,color:#374151

  SA[["👤 Superadministrador"]]:::actor
  GE[["👤 Gerente"]]:::actor
  CA[["👤 Cajero"]]:::actor
  ME[["👤 Mesero"]]:::actor
  CO[["👤 Cocinero"]]:::actor
  RE[["👤 Repartidor"]]:::actor
  CL[["👤 Cliente"]]:::actor
  DIAN[["🏛️ DIAN / CUFE"]]:::ext
  MAIL[["✉️ SMTP"]]:::ext

  U1(["Iniciar sesión"]):::uc
  U2(["Gestionar usuarios y roles"]):::uc
  U3(["Gestionar establecimientos y gerentes"]):::uc
  U4(["Tomar pedido por mesa"]):::uc
  U5(["Modificar pedido antes de preparación"]):::uc
  U6(["Ver estado de pedidos en tiempo real"]):::uc
  U7(["Cerrar cuenta y facturar"]):::uc
  U8(["Registrar pago"]):::uc
  U9(["Ver historial de facturas"]):::uc
  U10(["Preparar comanda y avanzar estados"]):::uc
  U11(["Gestionar inventario y stock mínimo"]):::uc
  U12(["Gestionar menú y disponibilidad"]):::uc
  U13(["Gestionar proveedores y compras"]):::uc
  U14(["Abrir y cerrar caja / turno"]):::uc
  U15(["Pedir a domicilio"]):::uc
  U16(["Asignar y entregar domicilios"]):::uc
  U17(["Ver reportes y analítica"]):::uc
  U18(["Recuperar contraseña"]):::uc
  U19(["Exportar finanzas a Excel"]):::uc
  U20(["Cumplir facturación electrónica DIAN"]):::uc

  SA --> U1
  SA --> U3
  SA --> U2
  GE --> U1
  GE --> U2
  GE --> U11
  GE --> U12
  GE --> U13
  GE --> U17
  GE --> U19
  CA --> U1
  CA --> U7
  CA --> U8
  CA --> U9
  CA --> U14
  ME --> U1
  ME --> U4
  ME --> U5
  ME --> U6
  ME --> U7
  CO --> U1
  CO --> U10
  CO --> U6
  RE --> U1
  RE --> U16
  CL --> U15
  U2 -.->|"include"| U1
  U4 -.->|"include"| U6
  U7 -.->|"include"| U8
  U18 -.->|"include"| MAIL
  U20 -.->|"include"| DIAN
```

---

## 2. Superadministrador

```mermaid
flowchart LR
  classDef actor fill:#FDE68A,stroke:#B45309,stroke-width:2px
  classDef uc fill:#E8F0FE,stroke:#1D4ED8
  SA[["👤 Superadministrador"]]:::actor
  A(["Iniciar sesión"]):::uc
  B(["Crear establecimiento"]):::uc
  C(["Crear y asignar gerente"]):::uc
  D(["Aprobar solicitud de registro"]):::uc
  E(["Consultar historial de actividad"]):::uc
  F(["Ver consolidado de todas las sedes"]):::uc
  SA --> A
  SA --> B
  SA --> C
  SA --> D
  SA --> E
  SA --> F
  B -.->|"extend"| C
  A -.->|"include"| E
```

---

## 3. Gerente

```mermaid
flowchart LR
  classDef actor fill:#FDE68A,stroke:#B45309,stroke-width:2px
  classDef uc fill:#E8F0FE,stroke:#1D4ED8
  GE[["👤 Gerente"]]:::actor
  A(["Iniciar sesión"]):::uc
  B(["Registrar, editar y desactivar personal"]):::uc
  C(["Asignar y modificar roles"]):::uc
  D(["Gestionar ingredientes y unidades"]):::uc
  E(["Registrar entrada de stock"]):::uc
  F(["Ver alertas de stock mínimo"]):::uc
  G(["Ver historial de movimientos de inventario"]):::uc
  H(["Gestionar platos y categorías"]):::uc
  I(["Marcar plato no disponible"]):::uc
  J(["Gestionar proveedores y órdenes de compra"]):::uc
  K(["Ver ventas del día y del mes"]):::uc
  L(["Ver gastos y utilidad"]):::uc
  M(["Exportar finanzas a Excel"]):::uc
  N(["Supervisar pedidos activos"]):::uc

  GE --> A
  GE --> B
  GE --> C
  GE --> D
  GE --> E
  GE --> F
  GE --> G
  GE --> H
  GE --> I
  GE --> J
  GE --> K
  GE --> L
  GE --> M
  GE --> N
  B -.->|"extend"| C
  E -.->|"extend"| F
  D -.->|"include"| G
  L -.->|"extend"| M
```

---

## 4. Cajero

```mermaid
flowchart LR
  classDef actor fill:#FDE68A,stroke:#B45309,stroke-width:2px
  classDef uc fill:#E8F0FE,stroke:#1D4ED8
  CA[["👤 Cajero"]]:::actor
  A(["Iniciar sesión"]):::uc
  B(["Abrir turno de caja"]):::uc
  C(["Registrar gasto de caja"]):::uc
  D(["Cobrar cuenta de mesa"]):::uc
  E(["Dividir cuenta y pagos mixtos"]):::uc
  F(["Registrar método de pago"]):::uc
  G(["Generar factura"]):::uc
  H(["Consultar historial de facturas"]):::uc
  I(["Hacer arqueo y cerrar turno"]):::uc

  CA --> A
  CA --> B
  CA --> C
  CA --> D
  CA --> E
  CA --> F
  CA --> G
  CA --> H
  CA --> I
  D -.->|"include"| F
  F -.->|"include"| G
  E -.->|"extend"| D
  I -.->|"include"| B
```

---

## 5. Mesero y Cocinero

```mermaid
flowchart LR
  classDef actor fill:#FDE68A,stroke:#B45309,stroke-width:2px
  classDef uc fill:#E8F0FE,stroke:#1D4ED8
  ME[["👤 Mesero"]]:::actor
  CO[["👤 Cocinero"]]:::actor
  A(["Iniciar sesión"]):::uc
  B(["Registrar pedido por mesa"]):::uc
  C(["Agregar platos y cantidades"]):::uc
  D(["Modificar pedido antes de preparación"]):::uc
  E(["Ver estado de pedidos en tiempo real"]):::uc
  F(["Solicitar precuenta y cerrar"]):::uc
  G(["Ver comandas pendientes"]):::uc
  H(["Avanzar estado del ítem (PENDIENTE→PREPARANDO→LISTO)"]):::uc
  I(["Consultar historial de comandas"]):::uc

  ME --> A
  ME --> B
  ME --> C
  ME --> D
  ME --> E
  ME --> F
  CO --> A
  CO --> G
  CO --> H
  CO --> I
  B -.->|"include"| C
  D -.->|"extend"| B
  H -.->|"include"| E
```

---

## 6. Repartidor y Cliente

```mermaid
flowchart LR
  classDef actor fill:#FDE68A,stroke:#B45309,stroke-width:2px
  classDef uc fill:#E8F0FE,stroke:#1D4ED8
  RE[["👤 Repartidor"]]:::actor
  CL[["👤 Cliente"]]:::actor
  A(["Iniciar sesión"]):::uc
  B(["Pedir a domicilio desde la web"]):::uc
  C(["Registrar datos de entrega"]):::uc
  D(["Ver estado de mi pedido"]):::uc
  E(["Ver domicilios asignados"]):::uc
  F(["Marcar domicilio como entregado"]):::uc
  G(["Consultar mis entregas del día"]):::uc

  CL --> B
  CL --> D
  RE --> A
  RE --> E
  RE --> F
  RE --> G
  B -.->|"include"| C
  D -.->|"extend"| B
  F -.->|"include"| E
```

---

## 7. Trazabilidad caso de uso → historia de usuario → RF

| Caso de uso | HU | RF | Estado en el código |
|---|---|---|---|
| Iniciar sesión | HU-003 | RF-001 | `POST /api/auth/login`, `middleware/auth.js` |
| Gestionar usuarios y roles | HU-001, HU-002, HU-004 | RF-001 | `/api/usuarios`, `/api/roles`, `middleware/requireRole.js` |
| Recuperar contraseña | HU-005 | RF-001 | `/api/auth/send-reset-link`, `/api/auth/reset-password` + SMTP |
| Tomar pedido por mesa | HU-006 | RF-002 | `POST /api/salon/pedidos`, `PATCH /api/salon/mesas/:numero/estado`, `/api/mesas` |
| Modificar pedido antes de preparación | HU-007 | RF-002 | `PUT /api/salon/pedidos/:id` (solo si el pedido está `ABIERTO`) |
| Ver estado en tiempo real | HU-008, HU-010 | RF-002 | `GET /api/salon` (tablero), `GET /api/cocina/comandas`, campanita del header |
| Preparar comanda y avanzar estados | HU-008 | RF-002 | `GET /api/cocina/comandas`, `PATCH /api/cocina/items/:id/avanzar`, `GET /api/cocina/historial` |
| Cerrar cuenta y facturar | HU-009, HU-011 | RF-002, RF-003 | `GET /api/cobro/pendientes`, `POST /api/cobro/cerrar-cuenta`, `/api/facturas` |
| Registrar método de pago | HU-012 | RF-003 | `POST /api/cobro/cerrar-cuenta` (efectivo, tarjeta, PSE, NEQUI, DAVIPLATA, mixto) |
| Historial de facturas | HU-013 | RF-003 | `/api/facturas` |
| Cumplir DIAN/CUFE | HU-014 | RF-003 | **No implementado** (sin CUFE en el servicio de facturación) |
| Inventario, stock y alertas | HU-015 a HU-018 | RF-004 | `GET /api/inventario`, `GET /api/inventario/alertas/stock-bajo`, `POST /api/inventario/ajuste` |
| Menú y disponibilidad | HU-023 a HU-026 | RF-006 | `/api/productos`, `/api/categorias` |
| Domicilios | HU-019 a HU-022 | RF-005 | `POST /api/domicilios`, `PUT /api/domicilios/:id`, `GET /api/domicilios/resumen`, rol REPARTIDOR |
| Reportes y analítica | HU-027, HU-029 | RF-007 | `GET /api/reportes` (ventas diarias, pedidos activos, gastos del mes, tendencia) |
| Sugerencias con IA | HU-028, HU-030 | RF-007 | `/api/ia` (`GET` y `POST`) — solo **registra** predicciones; no genera sugerencias |
| Caja y turnos | — (soporte de HU-009) | RF-003 | `/api/cajas`, `/api/turnos` (apertura, cierre, arqueo, gastos) |
| Dividir cuenta y pagos mixtos | — (extiende HU-009) | RF-003 | `POST /api/cobro/dividir-cuenta`, `POST /api/cobro/partes/:idParte/pagar` |
| Exportar finanzas a Excel | — (soporte de HU-027) | RF-007 | `frontend/src/utils/excel.ts` + botón en Gerente → Finanzas |
