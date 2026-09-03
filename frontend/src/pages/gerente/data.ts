export const menuItems = [
  { icon: 'restaurant_menu', label: 'Menú' }, { icon: 'inventory_2', label: 'Inventario' },
  { icon: 'payments', label: 'Finanzas' }, { icon: 'add_shopping_cart', label: 'Pedidos' },
  { icon: 'groups', label: 'Mesas' }, { icon: 'auto_awesome', label: 'IA Insights' },
  { icon: 'local_shipping', label: 'Proveedores' }, { icon: 'receipt_long', label: 'Historial' },
  { icon: 'account_balance', label: 'Flujo de Caja' }, { icon: 'schedule', label: 'Turnos' },
  { icon: 'group', label: 'Personal' },
]

export const metricas = [
  { icon: 'monetization_on', label: 'Ingresos del día', valor: '$4.250.000', badge: '+12.5%', badgeColor: 'verde' },
  { icon: 'account_balance_wallet', label: 'Flujo de caja', valor: '$28.140.500', badge: 'Estable', badgeColor: 'muted' },
  { icon: 'shopping_bag', label: 'Pedidos activos', valor: '42', badge: '8 pendientes', badgeColor: 'rojo' },
]

export const inventario = [
  { nombre: 'Carnes & Proteínas', porcentaje: 82, color: 'verde' }, { nombre: 'Vegetales Frescos', porcentaje: 45, color: 'amarillo' }, { nombre: 'Bebidas & Licores', porcentaje: 12, color: 'rojo' },
]

export const movimientos = [
  { icon: 'shopping_cart', titulo: 'Mesa 03 - Pago recibido', sub: 'Hace 14 min • Visa ***4212', monto: '+$84.500', positivo: true },
  { icon: 'local_shipping', titulo: 'Proveedor: La Huerta S.A.', sub: 'Hace 1 hora • Orden #9822', monto: '-$210.000', positivo: false },
  { icon: 'shopping_cart', titulo: 'Mesa 12 - Pago recibido', sub: 'Hace 3 horas • Efectivo', monto: '+$126.000', positivo: true },
  { icon: 'settings_backup_restore', titulo: 'Reembolso mesa 01', sub: 'Hace 5 horas • Cancelación', monto: '-$15.200', positivo: false },
]

export const mesas = [
  { id: 'T-01', ocupada: false }, { id: 'T-02', ocupada: true }, { id: 'T-03', ocupada: true }, { id: 'T-04', ocupada: false },
  { id: 'T-05', ocupada: false }, { id: 'T-06', ocupada: true }, { id: 'T-07', ocupada: false }, { id: 'T-08', ocupada: false },
  { id: 'T-09', ocupada: true }, { id: 'T-10', ocupada: false }, { id: 'T-11', ocupada: false }, { id: 'T-12', ocupada: false },
]

export const barras = [
  { dia: 'LUN', alto: 40 }, { dia: 'MAR', alto: 60 }, { dia: 'MIE', alto: 80 }, { dia: 'JUE', alto: 75 },
  { dia: 'VIE', alto: 95 }, { dia: 'SAB', alto: 85 }, { dia: 'DOM', alto: 70 },
]

export const finanzasStats = [
  { icon: 'trending_up', label: 'Ingresos del mes', valor: '$84.250.000', badge: '+8.2%', badgeColor: 'verde' },
  { icon: 'trending_down', label: 'Gastos del mes', valor: '$32.180.000', badge: '+3.1%', badgeColor: 'rojo' },
  { icon: 'account_balance_wallet', label: 'Utilidad neta', valor: '$52.070.000', badge: '61.8%', badgeColor: 'muted' },
]

export const transacciones = [
  { fecha: '18 Ago', concepto: 'Ventas del día', categoria: 'Ingreso', monto: '$4.250.000', positivo: true }, { fecha: '17 Ago', concepto: 'Pago proveedor La Huerta S.A.', categoria: 'Gasto', monto: '$1.210.000', positivo: false },
  { fecha: '17 Ago', concepto: 'Ventas del día', categoria: 'Ingreso', monto: '$3.980.000', positivo: true }, { fecha: '16 Ago', concepto: 'Nómina quincenal', categoria: 'Gasto', monto: '$8.500.000', positivo: false }, { fecha: '15 Ago', concepto: 'Ventas del día', categoria: 'Ingreso', monto: '$4.560.000', positivo: true },
]

export const pedidosActivosMock = [
  { id: '#1042', mesa: 'Mesa 3', items: 'Combo corriente ×2', estado: 'Preparando', tiempo: '5 min' }, { id: '#1043', mesa: 'Mesa 7', items: 'Hamburguesa BBQ', estado: 'Listo', tiempo: '12 min' },
  { id: '#1044', mesa: 'Domicilio', items: 'Cra 5 #22, en camino', estado: 'En camino', tiempo: '18 min' }, { id: '#1045', mesa: 'Mesa 1', items: 'Desayuno ejecutivo ×3', estado: 'Preparando', tiempo: '3 min' }, { id: '#1046', mesa: 'Mesa 9', items: 'Ensalada César', estado: 'Entregado', tiempo: '25 min' },
]

export const iaInsights = [
  { icon: 'trending_up', titulo: 'Demanda proyectada al alza', detalle: 'Se espera un incremento del 15% en pedidos este viernes basado en patrones históricos.', tono: 'verde' }, { icon: 'inventory_2', titulo: 'Alerta de inventario', detalle: 'Las papas fritas alcanzarán el stock mínimo en 2 días al ritmo de consumo actual.', tono: 'amarillo' },
  { icon: 'schedule', titulo: 'Optimización de turnos', detalle: 'Considera agregar un mesero adicional en el turno de la tarde de fin de semana.', tono: 'muted' }, { icon: 'local_offer', titulo: 'Oportunidad de promoción', detalle: 'El combo de hamburguesas tiene baja rotación los martes, considera una oferta.', tono: 'rojo' },
]

export const historialEventos = [
  { fecha: '18 Ago, 14:32', usuario: 'Laura Gómez', accion: 'Actualizó el producto "Pizza Margarita"' }, { fecha: '18 Ago, 11:05', usuario: 'Carlos Ruiz', accion: 'Creó un nuevo proveedor: "Distribuidora Andina"' },
  { fecha: '17 Ago, 19:47', usuario: 'Laura Gómez', accion: 'Cerró la caja principal con un total de $2.840.000' }, { fecha: '17 Ago, 09:12', usuario: 'Sistema', accion: 'Se generó el reporte semanal de ventas' }, { fecha: '16 Ago, 16:20', usuario: 'Carlos Ruiz', accion: 'Desactivó el ingrediente "Salsa BBQ especial"' },
]

export const turnosMock = [
  { empleado: 'Sofía Ramírez', rol: 'Mesero', turno: '7:00 AM - 3:00 PM', estado: 'Activo' }, { empleado: 'Juan Torres', rol: 'Repartidor', turno: '11:00 AM - 7:00 PM', estado: 'Activo' },
  { empleado: 'Ana Martínez', rol: 'Cajero', turno: '3:00 PM - 11:00 PM', estado: 'Pendiente' }, { empleado: 'Diego López', rol: 'Mesero', turno: '3:00 PM - 11:00 PM', estado: 'Pendiente' },
]