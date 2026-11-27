# Product Backlog — RemiSoft

**Producto:** Sistema Web Inteligente para la Gestión Integral de Cadenas de Restaurantes.
**Equipo:** César David Rueda Daza (Líder / Full Stack) · Juan Felipe Bello Pérez (Frontend / IA) · Kevin Duvan Bueno Melo (Tester / QA).
**Fuente de las HUs:** `docs/HUs/HU-001 … HU-030` (30 historias, agrupadas por RF en `docs/RFs`).
**Escala de estimación:** Fibonacci (1, 2, 3, 5, 8, 13). `13` se reserva para *spikes* con dependencia externa.

## Cómo leer el estado

- **Estado HU:** el que figura en el documento de la historia (`Implementada`, `Prototipo visual`, `No iniciado`).
- **Estado verificado:** lo que existe hoy en el repositorio (rutas montadas en `backend/src/app.js`,
  controladores y pruebas). Es la fuente para calcular la velocidad real.

## Backlog priorizado

| ID | Historia | Módulo | Prioridad | RF | Pts | MoSCoW | Sprint | Estado HU | Estado verificado |
|---|---|---|---|---|---|---|---|---|---|
| HU-001 | Registrar nuevos usuarios | Usuarios | Alta | RF-001 | 5 | Must | S1 | Implementada | ✅ `/api/usuarios` |
| HU-002 | Asignar y modificar roles | Usuarios | Alta | RF-001 | 5 | Must | S1 | Implementada | ✅ `/api/roles` + `requireRole` |
| HU-003 | Iniciar sesión | Autenticación | Alta | RF-001 | 5 | Must | S1 | Implementada | ✅ `/api/auth/login` + JWT |
| HU-004 | Desactivar / eliminar usuarios | Usuarios | Media | RF-001 | 3 | Should | S1 | Implementada | ✅ `PATCH /api/usuarios/:id/estado` |
| HU-005 | Recuperar contraseña | Autenticación | Media | RF-001 | 5 | Should | S1 | Implementada | ✅ `/api/auth/send-reset-link` + SMTP |
| HU-006 | Registrar pedido por mesa | Pedidos | Alta | RF-002 | 8 | Must | S2 | Implementada | ✅ `/api/pedidos` |
| HU-007 | Modificar pedido antes de preparación | Pedidos | Alta | RF-002 | 5 | Must | S2 | Implementado | ✅ validación `estado = ABIERTO` |
| HU-008 | Ver estado de pedidos en tiempo real | Pedidos | Alta | RF-002 | 8 | Must | S2 | Implementado | ✅ `/api/cocina/comandas` + campanita |
| HU-009 | Cerrar cuenta y generar factura | Facturación | Alta | RF-002 | 8 | Must | S3 | Implementada | ✅ `/api/cobro` |
| HU-010 | Listado de pedidos activos | Pedidos | Media | RF-002 | 3 | Should | S2 | Implementada | ✅ `/api/salon`, `/api/pedidos` |
| HU-011 | Generar factura automáticamente | Facturación | Alta | RF-003 | 5 | Must | S3 | No Implementada | ✅ `facturacion.service.js` |
| HU-012 | Registrar método de pago | Facturación | Alta | RF-003 | 8 | Must | S3 | No Implementada | ✅ efectivo, tarjeta, PSE, NEQUI, DAVIPLATA, mixto |
| HU-013 | Historial de facturas con filtros | Facturación | Alta | RF-003 | 5 | Should | S3 | No Implementada | ✅ `/api/facturas` |
| HU-014 | Cumplimiento DIAN (CUFE) | Facturación | Alta | RF-003 | 13 | Could | **Backlog** | Implementada (documento) | ❌ sin CUFE ni integración DIAN |
| HU-015 | Descuento automático de inventario | Inventario | Media | RF-004 | 8 | Must | S4 | No Implementada | ✅ movimiento `SALIDA` por receta |
| HU-016 | Registrar ingreso de stock | Inventario | Media | RF-004 | 5 | Must | S4 | Prototipo visual | ✅ `/api/inventario` |
| HU-017 | Alertas de stock mínimo | Inventario | Media | RF-004 | 5 | Should | S4 | Prototipo visual | ✅ alertas en panel del gerente |
| HU-018 | Historial de movimientos de inventario | Inventario | Media | RF-004 | 5 | Should | S4 | Prototipo visual | ✅ `inventario_mov` |
| HU-019 | Pedido a domicilio desde la web | Domicilios | Alta | RF-005 | 8 | Must | S5 | Prototipo visual | ✅ `/api/domicilios` |
| HU-020 | Estado del domicilio en tiempo real | Domicilios | Alta | RF-005 | 5 | Must | S5 | Prototipo visual | ✅ consulta por id |
| HU-021 | Ver y actualizar domicilios asignados | Domicilios | Alta | RF-005 | 5 | Must | S5 | Prototipo visual | ✅ rol REPARTIDOR |
| HU-022 | Panel de seguimiento de domicilios | Domicilios | Media | RF-005 | 5 | Should | S5 | Prototipo visual | ✅ panel del gerente |
| HU-023 | Agregar platos al menú | Menú | Media | RF-006 | 5 | Should | S6 | Prototipo visual | ✅ `/api/productos` |
| HU-024 | Modificar precio o descripción | Menú | Media | RF-006 | 3 | Should | S6 | Prototipo visual | ✅ |
| HU-025 | Marcar plato no disponible | Menú | Media | RF-006 | 3 | Should | S6 | Prototipo visual | ✅ |
| HU-026 | Ver menú por categorías | Menú | Media | RF-006 | 3 | Should | S5 | Prototipo visual | ✅ `/api/categorias` |
| HU-027 | Reporte diario de ventas | Reportes | Alta | RF-007 | 8 | Should | S6 | No iniciado | ✅ `reportes.controller` (ventas diarias, tendencia) |
| HU-028 | Sugerencia de compras con IA | IA | Alta | RF-007 | 8 | Could | **Backlog** | No iniciado | 🟡 `/api/ia` solo **registra** predicciones |
| HU-029 | Reporte de desempeño del personal | Reportes | Media | RF-007 | 5 | Could | **Backlog** | No iniciado | ❌ no existe endpoint |
| HU-030 | Horarios de mayor demanda y zonas | IA | Media | RF-007 | 8 | Could | **Backlog** | No iniciado | 🟡 parcial (`tendenciaVentas`) |

## Totales

| Concepto | Puntos |
|---|---|
| Total de las 30 HUs | **175** |
| · Prioridad Must | 88 |
| · Prioridad Should | 54 |
| · Prioridad Could | 33 |
| HUs comprometidas y aceptadas (26 de 30) | **141** |
| Deuda declarada (HU-014, HU-028, HU-029, HU-030) | 34 |
| Spikes de soporte (caja y turnos, multi-sede y auditoría, exportación a Excel) | **21** |
| **Total comprometido y aceptado en los sprints S1-S7** | **162** (141 + 21) |

Los *spikes de soporte* no son historias del documento pero consumieron capacidad real del equipo:
- **Caja y turnos (8 pts, S3):** `/api/cajas`, `/api/turnos` — apertura, cierre, arqueo, gastos. Sostiene HU-009.
- **Multi-sede, roles y auditoría (8 pts, S6):** `middleware/establecimiento.js`, `requireRole`, tabla de historial
  de actividad y aislamiento por restaurante. Sostiene RF-001 y todo el modelo multi-sede.
- **Exportación a Excel en Finanzas (5 pts, S7):** `frontend/src/utils/excel.ts` + botón en la pantalla de finanzas.

## Definition of Ready (antes de entrar a un sprint)

1. Historia con criterios de aceptación en formato Dado/Cuando/Entonces.
2. RF asociado identificado y prototipo de pantalla si aplica.
3. Dependencias técnicas conocidas (tablas, endpoints, rol que la usa).
4. Estimada por el equipo (Planning Poker) sin discusión pendiente.

## Definition of Done (para darla por aceptada)

1. Endpoint o pantalla funcionando en Docker (`docker compose up`), no solo en local.
2. Permisos por rol verificados (`requireRole`) y filtro por establecimiento aplicado.
3. Mensajes de error claros y estados válidos (sin 500 genéricos).
4. Prueba automatizada o validación reproducible anexada al PR.
5. Lint, build y `docker compose config` en verde en CI.
6. Documentación o `.env.example` actualizados si cambió la configuración.
