import { CUENTA_ABIERTA, formatCuenta, mesasDeSede, round2 } from './salon.js';

// Tanto el tablero como la ficha leen el mismo servicio actual, nunca el historial
// del número de mesa ni los pedidos de otra sede. Leer un plato no autoriza editarlo.
export const pedidosDelComedor = (user) => ({
  Mesa_num: { not: null },
  AND: [user.rol === 'SUPERADMIN' ? {} : mesasDeSede(user.id_restaurante), CUENTA_ABIERTA],
});
export const datosDelConsumo = {
  usuario: { select: { nombre: true, apellido: true } },
  Detalle_pedido: { include: { Producto: { select: { Nombre: true } } }, orderBy: { id_detalle: 'asc' } },
};
export const atencionesDelComedor = (user) => ({
  atenciones: {
    where: user.rol === 'SUPERADMIN' ? undefined : { id_restaurante: user.id_restaurante ?? null },
    select: {
      id_atencion: true,
      id_mesero: true,
      desde: true,
      comensales: true,
      mesero: { select: { nombre: true, apellido: true } },
    },
  },
});

export function consumoPublico(pedido) {
  return { ...formatCuenta(pedido), comensales: pedido.comensales ?? null, notas: pedido.notas ?? '' };
}

export function presentarMesas(catalogo, consumos, user) {
  const porNumero = new Map();
  for (const p of consumos) {
    if (!porNumero.has(p.mesa)) porNumero.set(p.mesa, []);
    porNumero.get(p.mesa).push(p);
  }
  return catalogo.map(({ numero, capacidad, atenciones }) => {
    const cuentas = porNumero.get(numero) ?? [];
    const p = cuentas[0];
    const a = p ? null : atenciones?.[0];
    const ocupada = Boolean(p || a);
    return {
      numero,
      capacidad,
      ocupada,
      estado: ocupada ? 'occupied' : 'available',
      // Se conserva el contrato de las tarjetas originales: total de artículos sin IVA.
      pedidos: cuentas.length,
      id_pedido: p?.id_pedido ?? null,
      articulos: cuentas.reduce((n, c) => n + c.items.reduce((s, i) => s + i.cantidad, 0), 0),
      total: round2(cuentas.reduce((n, c) => n + c.subtotal, 0)),
      mesero: p?.nombre_mesero || (a ? [a.mesero.nombre, a.mesero.apellido].filter(Boolean).join(' ') : null),
      fecha_hora: p?.fecha_hora ?? a?.desde ?? null,
      comensales: cuentas.length > 1 ? null : (p?.comensales ?? a?.comensales ?? null),
      atencion:
        a && a.id_mesero === user.id_usuario
          ? { id_atencion: a.id_atencion, desde: a.desde, comensales: a.comensales }
          : null,
      // Proyección de lectura para el equipo del salón. Sin cliente, pagos, factura ni versión de edición.
      cuentas,
    };
  });
}
