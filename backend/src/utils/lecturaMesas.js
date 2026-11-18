import { relacionDeSede } from './restaurante.js';
import { CUENTA_ABIERTA, formatCuenta, deSede, round2 } from './salon.js';

// Tanto el tablero como la ficha leen el mismo servicio actual, nunca el historial
// del número de mesa ni los pedidos de otra sede. Leer un plato no autoriza editarlo.
export const pedidosDelComedor = (user) => ({
  Mesa_num: { not: null },
  ...deSede(user),
  ...CUENTA_ABIERTA,
});
export const datosDelConsumo = {
  usuario: { select: { nombre: true, apellido: true, id_restaurante: true } },
  Detalle_pedido: { include: { Producto: { select: { Nombre: true, id_restaurante: true } } }, orderBy: { id_detalle: 'asc' } },
};
export const atencionesDelComedor = (user) => ({
  atenciones: {
    where: deSede(user),
    select: {
      id_atencion: true,
      id_mesero: true,
      desde: true,
      comensales: true,
      mesero: { select: { nombre: true, apellido: true, id_restaurante: true } },
    },
  },
});

export function consumoPublico(pedido) {
  return { ...formatCuenta(pedido), id_restaurante: pedido.id_restaurante, comensales: pedido.comensales ?? null, notas: pedido.notas ?? '' };
}

export function presentarMesas(catalogo, consumos, user) {
  const porNumero = new Map();
  for (const p of consumos) {
    const clave = `${p.id_restaurante}:${p.mesa}`;
    if (!porNumero.has(clave)) porNumero.set(clave, []);
    porNumero.get(clave).push(p);
  }
  return catalogo.map(({ numero, id_restaurante, capacidad, atenciones }) => {
    const cuentas = porNumero.get(`${id_restaurante}:${numero}`) ?? [];
    const p = cuentas[0];
    const a = p ? null : atenciones?.[0];
    const ocupada = Boolean(p || a);
    const mesero = relacionDeSede(a?.mesero, id_restaurante);
    return {
      numero,
      id_restaurante,
      capacidad,
      ocupada,
      estado: ocupada ? 'occupied' : 'available',
      // Se conserva el contrato de las tarjetas originales: total de artículos sin IVA.
      pedidos: cuentas.length,
      id_pedido: p?.id_pedido ?? null,
      articulos: cuentas.reduce((n, c) => n + c.items.reduce((s, i) => s + i.cantidad, 0), 0),
      total: round2(cuentas.reduce((n, c) => n + c.subtotal, 0)),
      mesero: p?.nombre_mesero || (mesero ? [mesero.nombre, mesero.apellido].filter(Boolean).join(' ') : null),
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
