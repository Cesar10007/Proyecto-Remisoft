import { escritura } from './actividad.service.js';
import {
  bloquearIngredientes,
  calcularRequerimientos,
  verificarStockIngredientes,
} from './inventario.service.js';
import {
  ErrorSalon,
  CUENTA_ABIERTA,
  ESTADOS_EN_MESA,
  misPedidos,
  entero,
  texto,
  leerLineas,
  itemsFacturables,
  indicadorPago,
  consumoSellado,
  estadoSegunItems,
} from '../utils/salon.js';

export const transaccionSalon = (user, fn, area = 'MESEROS') => escritura(user, fn, { isolationLevel: 'ReadCommitted', area });
export const bloquearPedido = (tx, id, idRestaurante) =>
  tx.$queryRaw`SELECT id_pedido FROM pedido WHERE id_pedido = ${id} AND id_restaurante = ${idRestaurante} FOR UPDATE`;

// Compara con los movimientos reales, no con una receta histórica reconstruida. Al anular,
// se devuelve exactamente lo descontado, incluso si administración cambió la receta.
async function ajustarConsumo(tx, id, items, user, soloAdicion = false) {
  const requeridos = await calcularRequerimientos(tx, items, user.id_restaurante);
  const delta = new Map(requeridos.map((r) => [r.id_ingrediente, r.requerido]));
  if (!soloAdicion) {
    const previos = await tx.inventario_mov.findMany({ where: { id_restaurante: user.id_restaurante, origen_tipo: 'PEDIDO', origen_id: id } });
    for (const m of previos) {
      const signo = m.tipo_movimiento === 'SALIDA' ? -1 : m.tipo_movimiento === 'ENTRADA' ? 1 : 0;
      delta.set(m.id_ingrediente, (delta.get(m.id_ingrediente) ?? 0) + signo * Number(m.cantidad));
    }
  }
  const ajustes = Array.from(delta, ([id_ingrediente, n]) => ({
    id_ingrediente,
    requerido: Math.round(n * 1000) / 1000,
  })).filter((r) => r.requerido !== 0);
  if (!ajustes.length) return;
  // Distintas mesas pueden pedir el último plato a la vez. El bloqueo y READ COMMITTED
  // hacen que la segunda validación vea las salidas ya confirmadas por la primera.
  await bloquearIngredientes(
    tx,
    ajustes.map((r) => r.id_ingrediente),
    user.id_restaurante,
  );
  await verificarStockIngredientes(
    tx,
    ajustes.filter((r) => r.requerido > 0),
    user.id_restaurante,
  );
  await tx.inventario_mov.createMany({
    data: ajustes.map((r) => ({
      id_ingrediente: r.id_ingrediente,
      cantidad: Math.abs(r.requerido),
      tipo_movimiento: r.requerido > 0 ? 'SALIDA' : 'ENTRADA',
      id_usuario: user.id_usuario,
      id_restaurante: user.id_restaurante,
      origen_tipo: 'PEDIDO',
      origen_id: id,
      observaciones: `${r.requerido > 0 ? 'Consumo' : 'Devolución'} por comanda #${id}`,
    })),
  });
}

// Actualiza los detalles sin romper las referencias históricas de Factura_item. Precios
// de líneas existentes congelados; los nuevos siempre salen del catálogo del servidor.
async function escribirLineas(tx, id, lineas, anteriores, idRestaurante) {
  const catalogo = await tx.producto.findMany({
    where: { id_restaurante: idRestaurante, id_producto: { in: lineas.map((l) => l.id_producto) } },
  });
  const conservar = new Set();
  const nuevas = [];
  for (const linea of lineas) {
    const anterior = anteriores.find((d) => d.id_detalle === linea.id_detalle);
    if (linea.id_detalle !== null && anterior?.id_producto !== linea.id_producto)
      throw new ErrorSalon(409, 'Los platos del pedido cambiaron. Vuelve a abrir la comanda.');
    const producto = catalogo.find((p) => p.id_producto === linea.id_producto);
    if (
      (!anterior || linea.cantidad > anterior.Cantidad) &&
      (producto?.Estado !== 1 || producto.precio_venta == null)
    ) {
      throw new ErrorSalon(
        409,
        `${producto?.Nombre ?? 'El producto'} no está disponible. Retíralo o reduce su cantidad.`,
      );
    }
    if (anterior) {
      conservar.add(anterior.id_detalle);
      await tx.detalle_pedido.update({
        where: { id_detalle: anterior.id_detalle },
        data: { Cantidad: linea.cantidad, nota: linea.nota },
      });
    } else {
      nuevas.push({
        id_pedido: id,
        id_producto: producto.id_producto,
        Precio_unitario: producto.precio_venta,
        Cantidad: linea.cantidad,
        nota: linea.nota,
        estado_item: 'PENDIENTE',
      });
    }
  }
  const quitar = anteriores.filter((d) => !conservar.has(d.id_detalle)).map((d) => d.id_detalle);
  if (quitar.length)
    await tx.detalle_pedido.updateMany({
      where: { id_detalle: { in: quitar } },
      data: { estado_item: 'CANCELADO' },
    });
  if (nuevas.length) await tx.detalle_pedido.createMany({ data: nuevas });
}

async function cabecera(tx, body, capacidad, idRestaurante) {
  const id_cliente = body.id_cliente == null ? null : entero(body.id_cliente, 'El cliente');
  if (id_cliente && !(await tx.cliente.findUnique({ where: { id_cliente, id_restaurante: idRestaurante }, select: { id_cliente: true } })))
    throw new ErrorSalon(422, 'El cliente seleccionado ya no existe.');
  return {
    comensales: entero(body.comensales, 'El número de comensales', capacidad ?? 99),
    notas: texto(body.notas, 500, 'Notas de cocina'),
    id_cliente,
  };
}

// Abrir una cuenta y cambiar la ocupación bloquean la misma mesa de la sede.
export async function mesaDisponible(tx, numero, pedido, { excepto, idAtencion = null } = {}) {
  const sede = pedido.id_restaurante;
  const [mesa] = await tx.$queryRaw`SELECT id_mesa, capacidad FROM mesa WHERE numero = ${numero} AND id_restaurante = ${sede} FOR UPDATE`;
  if (!mesa) throw new ErrorSalon(404, 'La mesa no existe en este establecimiento.');
  if (
    await tx.pedido.findFirst({
      where: {
        id_restaurante: sede,
        ...CUENTA_ABIERTA,
        Mesa_num: numero,
        ...(excepto == null ? {} : { id_pedido: { not: excepto } }),
      },
      select: { id_pedido: true },
    })
  ) {
    throw new ErrorSalon(409, 'La mesa tiene una cuenta abierta. No se puede cambiar su ocupación.');
  }
  const atencion = await tx.mesa_atencion.findFirst({ where: { numero, id_restaurante: sede } });
  if (
    (atencion?.id_atencion ?? null) !== idAtencion ||
    (atencion && atencion.id_mesero !== pedido.id_mesero)
  ) {
    throw new ErrorSalon(
      409,
      'La ocupación de la mesa cambió o la atiende otro mesero. Revisa la ficha de la mesa.',
    );
  }
  return { ...mesa, id_restaurante: sede, atencion };
}

export function cambiarEstadoMesa(user, numero, body) {
  const ocupar = body?.estado === 'OCUPADA';
  if (!ocupar && body?.estado !== 'DISPONIBLE') throw new ErrorSalon(422, 'Selecciona Disponible u Ocupada.');
  const idAtencion = ocupar ? null : entero(body.id_atencion, 'La atención de la mesa');
  const responsable = { id_restaurante: user.id_restaurante, id_mesero: user.id_usuario };
  return transaccionSalon(user, async (tx) => {
    const mesa = await mesaDisponible(tx, numero, responsable, { idAtencion });
    if (ocupar) {
      const comensales = entero(body.comensales, 'El número de comensales', mesa.capacidad ?? 99);
      const { id_atencion } = await tx.mesa_atencion.create({
        data: { numero, id_mesero: user.id_usuario, id_restaurante: mesa.id_restaurante, comensales },
      });
      return { numero, estado: 'OCUPADA', id_atencion };
    }
    await tx.mesa_atencion.delete({ where: { id_atencion: idAtencion } });
    return { numero, estado: 'DISPONIBLE' };
  });
}

export function abrirMesa(user, body) {
  const numero = entero(body?.mesa, 'La mesa');
  const lineas = leerLineas(body.items);
  const idAtencion = body.id_atencion == null ? null : entero(body.id_atencion, 'La atención de la mesa');
  return transaccionSalon(user, async (tx) => {
    const mesa = await mesaDisponible(
      tx,
      numero,
      {
        id_restaurante: user.id_restaurante,
        id_mesero: user.id_usuario,
      },
      { idAtencion },
    );
    const datos = await cabecera(tx, body, mesa.capacidad, user.id_restaurante);
    const p = await tx.pedido.create({
      data: {
        ...datos,
        id_mesero: user.id_usuario,
        id_restaurante: user.id_restaurante,
        Tipo_pedido: 'MESA',
        Mesa_num: numero,
        estado: 'ABIERTO',
        version_salon: 1,
      },
    });
    await escribirLineas(tx, p.id_pedido, lineas, [], user.id_restaurante);
    await ajustarConsumo(tx, p.id_pedido, lineas, user);
    // Ahora el pedido mantiene la mesa ocupada hasta cancelar/cobrar. Un rollback
    // por falta de stock conserva también la atención previa, sin crear una cuenta vacía.
    if (mesa.atencion) await tx.mesa_atencion.delete({ where: { id_atencion: mesa.atencion.id_atencion } });
    return p.id_pedido;
  });
}

export function cambiarComanda(user, id, body, accion) {
  return transaccionSalon(user, async (tx) => {
    await bloquearPedido(tx, id, user.id_restaurante);
    const p = await tx.pedido.findFirst({
      where: { id_pedido: id, ...misPedidos(user) },
      include: { Detalle_pedido: true, Factura: indicadorPago },
    });
    if (!p) throw new ErrorSalon(404, 'No se encontró la cuenta entre tus mesas.');
    const estado = p.estado ?? 'ABIERTO';
    if (!ESTADOS_EN_MESA.includes(estado) || p.estado === 'POR_COBRAR' || consumoSellado(p.Factura))
      throw new ErrorSalon(409, 'La cuenta ya no admite cambios.');
    const version = p.version_salon ?? 0;
    if (body?.version !== version)
      throw new ErrorSalon(
        409,
        'La comanda cambió en otro dispositivo. Ciérrala y revisa la versión actual.',
      );
    const items = itemsFacturables(p.Detalle_pedido);
    const editable =
      estado === 'ABIERTO' && items.every((d) => (d.estado_item ?? 'PENDIENTE') === 'PENDIENTE');
    if (['editar', 'cancelar'].includes(accion) && !editable)
      throw new ErrorSalon(
        409,
        'Cocina ya empezó la preparación. No se puede editar ni cancelar esta comanda.',
      );

    const data = { version_salon: version + 1 };
    if (accion === 'cancelar') {
      await ajustarConsumo(tx, id, [], user);
      await tx.detalle_pedido.updateMany({ where: { id_pedido: id }, data: { estado_item: 'CANCELADO' } });
      data.estado = 'CANCELADO';
    } else if (accion === 'cuenta') {
      if (!items.length || items.some((d) => d.estado_item !== 'ENTREGADO'))
        throw new ErrorSalon(409, 'Entrega todos los platos antes de enviar la cuenta a caja.');
      if (p.version_salon === null)
        await ajustarConsumo(
          tx,
          id,
          items.map((d) => ({ id_producto: d.id_producto, cantidad: d.Cantidad })),
          user,
        );
      data.estado = 'POR_COBRAR';
    } else {
      const lineas = leerLineas(body.items);
      if (accion === 'editar') {
        const mesa = await tx.mesa.findFirst({ where: { numero: p.Mesa_num, id_restaurante: user.id_restaurante } });
        Object.assign(data, await cabecera(tx, body, mesa?.capacidad, user.id_restaurante));
        await escribirLineas(tx, id, lineas, items, user.id_restaurante);
        await ajustarConsumo(tx, id, lineas, user);
      } else {
        // Una ronda agrega renglones pendientes; jamás reabre los ya preparados.
        await escribirLineas(tx, id, lineas, [], user.id_restaurante);
        const gestionado = p.version_salon !== null;
        const consumo = gestionado
          ? lineas
          : [...lineas, ...items.map((d) => ({ id_producto: d.id_producto, cantidad: d.Cantidad }))];
        await ajustarConsumo(tx, id, consumo, user, gestionado);
        data.estado = estadoSegunItems([...items.map((d) => d.estado_item), 'PENDIENTE']);
      }
    }
    await tx.pedido.update({ where: { id_pedido: id }, data });
    return id;
  });
}
