# HU-019 Realizar un pedido a domicilio desde la plataforma web

| Campo | Valor |
|---|---|
| ID | HU-019 |
| Título | Realizar un pedido a domicilio desde la plataforma web |
| Módulo | Gestión de Pedidos a Domicilio |
| Prioridad | Alta |
| Estado | Prototipo visual |
| RF asociados | RF005 |

---

## Historia

**Como** Cliente. **Necesito** realizar un pedido a domicilio desde la plataforma web. **Con el objetivo de** para pedir desde casa sin necesidad de llamar al restaurante.

## Criterio de aceptación 001
  - **Dado que** El cliente selecciona productos, ingresa dirección y elige método de pago.
  - **cuando** El pedido queda registrado con estado 'Pendiente'.
  - **entonces** El cliente recibe confirmación del pedido.
## Criterio de aceptación 002
  - **Dado que** el cliente selecciona productos, ingresa dirección y elige método de pago.
  - **cuando** confirma el pedido.
  - **entonces** el sistema lo valida antes de registrarlo.
## Criterio de aceptación 003
  - **Dado que** un pedido a domicilio es registrado.
  - **cuando** se guarda.
  - **entonces** queda con estado "Pendiente".
## Criterio de aceptación 004
  - **Dado que** un pedido fue registrado exitosamente.
  - **cuando** se completa.
  - **entonces** el cliente recibe una confirmación del pedido.
## Criterio de aceptación 005
  - **Dado que** el cliente no ingresa una dirección válida.
  - **cuando** intenta enviar el pedido.
  - **entonces** el sistema no permite continuar.
