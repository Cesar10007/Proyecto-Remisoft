# HU-022 Ver un panel de seguimiento de todos los domicilios activos

| Campo | Valor |
|---|---|
| ID | HU-022 |
| Título | Ver un panel de seguimiento de todos los domicilios activos |
| Módulo | Gestión de Pedidos a Domicilio |
| Prioridad | Media |
| Estado | Prototipo visual |
| RF asociados | RF005 |

---

## Historia

**Como** Administrador. **Necesito** ver un panel de seguimiento de todos los domicilios activos. **Con el objetivo de** para supervisar las entregas y garantizar tiempos de servicio adecuados.

## Criterio de aceptación 001
  - **Dado que** El panel muestra todos los domicilios activos con estado y repartidor asignado.
  - **cuando** Se indica el tiempo transcurrido desde que se tomó el pedido.
  - **entonces** El administrador puede reasignar un domicilio a otro repartidor.
## Criterio de aceptación 002
  - **Dado que** el administrador abre el panel.
  - **cuando** lo consulta.
  - **entonces** ve todos los domicilios activos con su estado y repartidor asignado.
## Criterio de aceptación 003
  - **Dado que** un domicilio está activo.
  - **cuando** se muestra en el panel.
  - **entonces** se indica el tiempo transcurrido desde que se tomó el pedido.
## Criterio de aceptación 004
  - **Dado que** el administrador necesita reasignar una entrega.
  - **cuando** selecciona otro repartidor.
  - **entonces** el sistema actualiza la asignación del domicilio.
## Criterio de aceptación 005
  - **Dado que** no hay domicilios activos.
  - **cuando** se consulta el panel.
  - **entonces** el sistema muestra un estado vacío claro.
