# Sprint Planning y Planning Poker — RemiSoft

Este documento recoge cómo se planificó cada sprint y cómo se estimaron las historias. El Planning Poker
se jugó **antes** de cada Planning, con las 30 HUs del backlog repartidas en tres rondas de refinamiento
(S0, S3 y S5). Cada integrante vota en privado y revela a la vez; si las cartas no coinciden, el votante
extremo explica su razón y se repite la ronda.

## Equipo votante

| Integrante | Rol | Qué pesa al estimar |
|---|---|---|
| **CD** — César David Rueda Daza | Líder / Full Stack | Esquema, transacciones, seguridad, esfuerzo de integración |
| **JB** — Juan Felipe Bello Pérez | Frontend / IA | Pantallas, estados de UI, consumo de API |
| **KB** — Kevin Duvan Bueno Melo | Tester / QA | Escenarios de prueba, casos borde, datos de prueba |

## Escala y referencias (barajada antes de la primera ronda)

| Puntos | Referencia acordada por el equipo |
|---|---|
| 1 | Cambio de texto, estilo o etiqueta. Menos de medio día |
| 2 | Un campo nuevo en un formulario existente, sin reglas |
| 3 | CRUD simple sobre una tabla ya modelada |
| 5 | CRUD con reglas de negocio o un endpoint con permisos por rol |
| 8 | Varias tablas en una transacción, o flujo completo con UI + API + validaciones |
| 13 | *Spike*: depende de un tercero o hay incertidumbre técnica alta |
| ☕ | Pausa |

**Regla del equipo:** si una historia se va a 13 y no es una dependencia externa, se parte en dos antes de
entrar al sprint.

## Capacidad acordada

Con 3 integrantes y sprints de 4 semanas, el equipo fijó la capacidad inicial en **26 puntos** por sprint
(≈ 8-9 puntos por persona), ajustada después con la velocidad real:

| Sprint | Capacidad declarada | Comprometido | Motivo del ajuste |
|---|---|---|---|
| S1 | 24 | 23 | Primera vez con el stack completo |
| S2 | 26 | 24 | Semana de parciales |
| S3 | 30 | 34 | Se aceptó de más: había un spike de caja y turnos |
| S4 | 26 | 23 | Se aprendió del exceso de S3 |
| S5 | 26 | 26 | Ajustado a la velocidad real |
| S6 | 26 | 27 | Cierre de reportes y multi-sede |
| S7 | 13 | 13 | Sprint corto de 10 días |

---

## Ronda 1 de Poker — refinamiento de S0 (módulos de acceso, pedidos y facturación)

| HU | Historia | CD | JB | KB | Consenso | Justificación |
|---|---|---|---|---|---|---|
| HU-001 | Registrar usuarios | 5 | 5 | 3 | **5** | CRUD + reglas de contraseña + unicidad de correo |
| HU-002 | Asignar y modificar roles | 8 | 5 | 5 | **5** | Se baja a 5: el catálogo de roles ya existe en el modelo |
| HU-003 | Iniciar sesión | 5 | 3 | 5 | **5** | JWT + expiración + mensajes de error sin filtrar información |
| HU-004 | Desactivar / eliminar usuarios | 2 | 3 | 3 | **3** | Un endpoint de estado y su reflejo en la tabla |
| HU-005 | Recuperar contraseña | 8 | 5 | 5 | **5** | Token de un solo uso; el SMTP se prueba con Mailtrap |
| HU-006 | Registrar pedido por mesa | 13 | 8 | 8 | **8** | La transacción es lo caro; se descarta 13 porque no hay tercero |
| HU-007 | Modificar pedido antes de preparación | 5 | 5 | 3 | **5** | Validar estado `ABIERTO` y recalcular totales |
| HU-008 | Ver estado en tiempo real | 8 | 8 | 5 | **8** | Comandas de cocina + avisos + transiciones de estado |
| HU-009 | Cerrar cuenta y generar factura | 8 | 8 | 8 | **8** | Tres tablas en una transacción y cálculo de impuestos |
| HU-010 | Listado de pedidos activos | 3 | 3 | 3 | **3** | Consulta filtrada por sede, ya modelada |

**Nota de la ronda:** HU-002 arrancó en 8 por parte del líder (pensando en permisos finos). El QA mostró que
el catálogo de roles y la tabla puente ya existían, así que se estimó en 5; los permisos finos se tratarían
en el spike de multi-sede del S6.

---

## Ronda 2 de Poker — refinamiento de S3 (facturación, pagos, inventario, domicilios, menú)

| HU | Historia | CD | JB | KB | Consenso | Justificación |
|---|---|---|---|---|---|---|
| HU-011 | Generar factura automáticamente | 8 | 5 | 5 | **5** | Se apoya en el servicio de cobro del S3 |
| HU-012 | Registrar método de pago | 8 | 13 | 8 | **8** | Cinco métodos + pagos mixtos + validación de sumas |
| HU-013 | Historial de facturas con filtros | 5 | 5 | 3 | **5** | Filtros por fecha, cliente y estado |
| HU-014 | Cumplimiento DIAN (CUFE) | 13 | 13 | 13 | **13** | Depende de la DIAN: no se compromete, se investiga |
| HU-015 | Descuento automático de inventario | 13 | 8 | 8 | **8** | Receta + movimiento + lote; el 13 era por miedo a los decimales |
| HU-016 | Registrar ingreso de stock | 5 | 5 | 5 | **5** | Entrada por lote y unidad de medida |
| HU-017 | Alertas de stock mínimo | 5 | 3 | 5 | **5** | Comparación stock vs mínimo y aviso en el panel |
| HU-018 | Historial de movimientos | 5 | 5 | 5 | **5** | Entradas, salidas y mermas con filtros |
| HU-019 | Pedido a domicilio desde la web | 8 | 8 | 8 | **8** | Cliente + pedido + domicilio en una transacción |
| HU-020 | Estado del domicilio | 3 | 5 | 5 | **5** | Consulta pública por id, con cuidado en no filtrar datos |
| HU-021 | Domicilios asignados al repartidor | 5 | 5 | 5 | **5** | Rol nuevo + lista filtrada |
| HU-022 | Panel de seguimiento de domicilios | 5 | 5 | 3 | **5** | Vista del gerente con estados |
| HU-023 | Agregar platos al menú | 5 | 5 | 3 | **5** | Producto + categoría + ingredientes de la receta |
| HU-024 | Modificar precio o descripción | 3 | 3 | 2 | **3** | Edición simple |
| HU-025 | Marcar plato no disponible | 3 | 3 | 3 | **3** | Bandera de disponibilidad y su efecto en pedidos |
| HU-026 | Ver menú por categorías | 3 | 5 | 3 | **3** | Lectura pública agrupada |

**Nota de la ronda:** HU-012 se discutió dos rondas. El líder veía 8 por los cinco métodos, el frontend votó
13 por la interfaz de pagos mixtos y el QA propuso 8 partiendo la interfaz en un paso de "dividir cuenta"
aparte. Se aceptó 8 y la división de cuenta se dejó como extensión posterior (se implementó en la migración
`20261125100000_division_cuenta`).

---

## Ronda 3 de Poker — refinamiento de S6/S7 (reportes e IA)

| HU | Historia | CD | JB | KB | Consenso | Justificación |
|---|---|---|---|---|---|---|
| HU-027 | Reporte diario de ventas | 8 | 8 | 5 | **8** | Agregaciones por fecha, producto y sede |
| HU-028 | Sugerencia de compras con IA | 13 | 8 | 8 | **8** | Se acota a "registrar y mostrar predicciones"; el modelo real queda fuera |
| HU-029 | Reporte de desempeño del personal | 5 | 5 | 5 | **5** | Requiere cruzar pedidos, tiempos y errores |
| HU-030 | Horarios de mayor demanda y zonas | 13 | 8 | 8 | **8** | Se resuelve parcialmente con `tendenciaVentas` |

**Nota de la ronda:** el equipo reconoció que las tres historias de IA (HU-028 a HU-030) no eran alcanzables
con el tiempo restante y que el módulo `/api/ia` hoy solo **registra** predicciones. Se dejaron en el backlog
con la etiqueta `deuda declarada` en lugar de marcarlas como hechas.

---

## Ejemplo de una sesión de Planning (S4, la más representativa)

**Fecha:** lunes 24 de agosto de 2026 · **Duración:** 55 min · **Asistentes:** CD, JB, KB.

1. **Revisión del objetivo** (5 min): "que el inventario se descuente solo y avise antes de que falte".
2. **Revisión de la velocidad** (5 min): sprint anterior aceptado = 34 pts (por el spike de caja); el equipo
   decide volver a la capacidad normal de 26 y no comprometer spikes.
3. **Selección de historias** (20 min): se toman HU-015, HU-016, HU-017 y HU-018 (23 pts). HU-014 (DIAN) queda
   fuera por dependencia externa.
4. **Desglose en tareas** (20 min):
   - modelo de receta y movimientos (CD) · endpoints `/api/inventario` (CD) · pantalla de ingredientes y stock
     (JB) · casos de prueba de decimales y conteo absoluto (KB).
5. **Compromiso** (5 min): 23 puntos. Criterio de aceptación de cada HU leído en voz alta.
6. **Riesgos:** "los decimales `DECIMAL(10,3)` pueden redondear mal" → el QA abre la prueba
   `unidades-inventario.integration.test.js` desde el día 1.

**Resultado real del S4:** 23/23 puntos aceptados, sin historias devueltas.
