# Historias de Usuario - Remisoft

Sistema Web Inteligente para Restaurante Familia Remi.

> **Dentro del Documento: ** Este documento recoge las historias de usuario (HU) del proyecto, agrupadas por requisito funcional (RF) de origen; Roles que se ocupan en estas HUs.

---

## Tabla de contenido

1. [RF001-Usuarios y autenticación](#usuarios-y-autentificación)
2. [RF002-Pedidos en salón](#pedidos-en-salón)
3. [RF003-Facturación](#facturación)
4. [RF004-Inventario](#)
5. [RF005-Domicilios](#)
6. [RF006-Menú/Carta](#)
7. [RF007-Reportes e IA](#)

---

## RF001-Usuarios y autenticación

### HU-001 Registrar nuevos usuarios
- Rol: Administrador.
- Necesito: registrar nuevos usuarios (meseros, cajeros, repartidores).
- Con el objetivo de: que el personal pueda acceder al sistema con credenciales propias.
- Prioridad: Alta.
- Criterios de aceptación: 
  - El administrador puede ingresar nombre, email, teléfono, clave y rol.
  - El sistema valida que el email no esté duplicado.
  - El usuario queda activo en el sistema.

### HU-002 Asignar y modificar roles
- Rol: Administrador
- Necesito: asignar y modificar roles y permisos a los usuarios
- Con el objetivo de: garantizar que cada persona solo acceda a las funciones de su cargo
- Prioridad: Alta
- Criterios de aceptación:
  - Se pueden asignar roles: Administrador, Mesero, Cajero, Repartidor, Cliente.
  - Un usuario solo ve los módulos de su rol.
  - El cambio de rol se refleja de inmediato.

### HU-003 Iniciar sesión
- Rol: Usuario del sistema
- Necesito: iniciar sesión con email y contraseña
- Con el objetivo de: acceder de forma segura a las funciones de mi rol
- Prioridad: Alta
- Criterios de aceptación: 
  -El sistema valida credenciales antes de permitir acceso.
  -Si son incorrectas, muestra mensaje de error.
  -La sesión expira tras inactividad definida.

### HU-004 Desactivar/eliminar usuarios
- Rol: Administrador
- Necesito: desactivar o eliminar usuarios que ya no laboran
- Con el objetivo de: mantener el sistema seguro y sin accesos no autorizados
- Prioridad: Media
- Criterios de aceptacion:
  - El administrador puede desactivar un usuario.
  - El usuario desactivado no puede iniciar sesión.
  - El historial del usuario se conserva.

### HU-005 Recuperar contraseña
- Rol: Usuario del sistema
- Necesito: recuperar mi contraseña olvidada
- Con el objetivo de: volver a acceder al sistema sin depender del administrador
- Prioridad: Media
- Criterios de aceptación:
  - El sistema envía un enlace o código de recuperación al email registrado.
  - El enlace expira en 30 minutos.
  - El usuario puede establecer una nueva contraseña.

## RF002-Pedidos en salón

### HU-006 Registrar pedido por mesa
- Rol: Mesero
- Necesito: Registrar un pedido asignándolo a una mesa especifica
- Con el objetivo de: que la cocina reciba la orden correctamente y sin errores
- Prioridad: Alta
- Criterios de aceptación:
  - El mesero selecciona la mesa y agrega productos al pedido.
  - El pedido se envía automáticamente a cocina.
  - La mesa queda marcada como ocupada.

### HU-007 Modificar pedido antes de preparación
- Rol: Mesero
- Necesito: modificar un pedido antes de que sea preparado
- Con el objetivo de: Corregir errores del cliente sin cancelar el pedido completo
- Prioridad: Alta
- Criterios de aceptación:
  - El mesero puede agregar o quitar productos mientras el estado sea "pendiente".
  - La cocina recibe la actualización en tiempo real.
  - El sistema registra el cambio con fecha y hora.

### HU-008 Ver estado de pedidos en tiempo real 
- Rol: Mesero 
- Necesito: ver el estado de los pedidos de mis mesas en tiempo real
- Con el objetivo de: informar al cliente y coordinar el servicio eficientemente
- Prioridad: Alta
- Criterios de aceptación:
  - El mesero ve: Pendiente, En preparación, Listo, Entregado.
  - El estado se actualiza sin necesidad de recargar la página.
  - Solo se muestran mesas asignadas al mesero.

### HU-009 Cerrar cuenta y generar factura
- Rol: Cajero/Administrador
- Necesito: cerrar una cuenta de mesa y generar la factura correspondiente
- Con el objetivo de: cobrar al cliente de forma rápida y precisa al finalizar el servicio
- Prioridad: Alta
- Criterios de aceptación:
  - Al cerrar la cuenta se genera la factura automáticamente.
  - La factura incluye productos, precios, subtotal, IVA y total.
  - La mesa queda libre en el sistema.

### HU-010 Listado de pedidos activos
- Rol: Administrador. 
- Necesito: ver un listado de todos los pedidos en el salón.
- Con el objetivo de: supervisar la operación en tiempo real y detectar demoras.
- Prioridad: Media.
- Criterios de aceptación:
  - El panel muestra todos los pedidos activos agrupados por mesa.
  - Se indica el tiempo transcurrido desde que se tomó el pedido.
  - El administrador puede filtrar por estado.

## RF003-Facturación

### HU-011 Generar factura automáticamente
- Rol: Cajero
- Necesito: que el sistema genere la factura automáticamente al cerrar un pedido
- Con el objetivo de: evitar errores manuales y agilizar el proceso de cobro
- Prioridad: Alta
- Criterios de aceptación:
  -  La factura incluye: detalle de productos, precio unitario, IVA, descuentos y total.
  -  Se genera en formato digital (PDF) y puede imprimirse.
  -  La factura queda registrada en el historial de ventas.

### HU-012 Registrar método de pago
- Rol: Cajero
- Necesito: registrar el método de pago (efectivo, tarjeta, transferencia) en la factura
- Con el objetivo de: llevar trazabilidad de los ingresos según su forma de pago
- Prioridad: Alta
- Criterios de aceptación:
  - El cajero selecciona el método de pago al emitir la factura.
  - El sistema registra el método junto a la factura.
  - Si es efectivo, calcula el cambio automáticamente.

### HU-013 Historial de facturas con filtros
- Rol: Administrador
- Necesito: consultar el historial de facturas emitidas con filtros de fecha y monto
- Con el objetivo de: hacer seguimiento contable y auditorías internas
- Prioridad: Alta
- Criterios de aceptación:
  - El administrador puede filtrar por rango de fechas, mesero, mesa o estado.
  - Se puede exportar el historial.
  - Cada factura muestra su estado: pagada, anulada.

### HU-014 Cumplimiento normativa DIAN(CUFE)
- Rol: Administrador
- Necesito: que las facturas cumplan la normativa DIAN con CUFE
- Con el objetivo de: garantizar el cumplimiento legal de facturación electrónica en Colombia
- Prioridad: Alta
- Criterios de aceptacion:
  - Cada factura generada incluye el CUFE según resolución 000042 de 2020.
  - La factura se almacena en formato XML.
  - Los valores se muestran en COP con el formato correcto.

