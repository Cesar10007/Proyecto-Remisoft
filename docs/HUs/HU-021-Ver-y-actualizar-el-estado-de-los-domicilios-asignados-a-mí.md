# HU-021 Ver y actualizar el estado de los domicilios asignados a mí

| Campo | Valor |
|---|---|
| ID | HU-021 |
| Título | Ver y actualizar el estado de los domicilios asignados a mí |
| Módulo | Gestión de Pedidos a Domicilio |
| Prioridad | Alta |
| Estado | Prototipo visual |
| RF asociados | RF005 |

---

## Historia

**Como** Repartidor. **Necesito** ver y actualizar el estado de los domicilios asignados a mí. **Con el objetivo de** para informar al cliente y al restaurante sobre el progreso de la entrega.

## Criterio de aceptación 001
  - **Dado que** El repartidor ve sus domicilios asignados con dirección y datos del cliente.
  - **cuando** Puede cambiar el estado: En camino → Entregado.
  - **entonces** Puede registrar observaciones o incidencias.
## Criterio de aceptación 002
  - **Dado que** el repartidor consulta sus domicilios.
  - **cuando** los visualiza.
  - **entonces** ve dirección y datos del cliente de cada uno.
## Criterio de aceptación 003
  - **Dado que** el repartidor tiene un domicilio "En camino".
  - **cuando** lo marca como completado.
  - **entonces** el sistema cambia el estado a "Entregado".
## Criterio de aceptación 004
  - **Dado que** el repartidor atiende un domicilio.
  - **cuando** ocurre una incidencia.
  - **entonces** puede registrar observaciones asociadas.
## Criterio de aceptación 005
  - **Dado que** se crea un domicilio con un pedido o repartidor inexistente.
  - **cuando** se intenta guardar el registro.
  - **entonces** el sistema responde error 422 sin crear el domicilio.
