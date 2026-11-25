import { consumoFacturado, esBorrador } from '../utils/facturacion.js';
import { guardarConsumo, lineasDeFactura, origenDeFactura } from '../services/facturacion.service.js';
import { formatCuenta, conPago, itemsFacturables, round2, deSede, ESTADOS_EN_MESA, ErrorSalon } from '../utils/salon.js';
import { bloquearPedido, transaccionSalon } from '../services/salon.service.js';
import prisma from '../config/prisma.js';
import { verificarStockSuficiente, registrarSalidasPorConsumo } from '../services/inventario.service.js';

// Flujo de cobro del tablero Cajero (RF-003 · HU-009, HU-011, HU-012).
// Al cerrar una cuenta se crea o confirma su factura, se registra el pago
// y el pedido pasa a CERRADO en una sola transacción.

// Estados de pedido que siguen abiertos para la operación (salón y cocina).
const ESTADOS_COBRABLES = ESTADOS_EN_MESA;
// Las facturas borrador y emitidas sin pago se reutilizan al cerrar la cuenta.
const ESTADOS_FACTURA_REUTILIZABLE = ['EMITIDA', 'ANULADA'];
const METODOS_PAGO = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'];
const MAX_CENTAVOS = 9999999999;

function parseId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

// GET /api/cobro/pendientes
// La vista y la transacción de pago usan la misma fuente del importe. Si hay borrador,
// mandan sus renglones y ajustes guardados, no la suma sin descuento de la comanda.
function cuentaParaCobro(pedido) {
  const cuenta = formatCuenta(pedido);
  const f = pedido.Factura;
  if (!esBorrador(f)) return { ...cuenta, descuento: 0, propina: 0, version_factura: null };
  const items = consumoFacturado(f, pedido.id_restaurante).map((i) => ({ ...i, subtotal: round2(i.cantidad * i.precio_unitario) }));
  return {
    ...cuenta,
    items,
    subtotal: round2(items.reduce((s, i) => s + i.subtotal, 0)),
    iva: Number(f.IVA),
    total: Number(f.total),
    descuento: Number(f.Descuento),
    propina: Number(f.Propina),
    receptor: f.receptor,
    consecutivo: f.consecutivo,
    version_factura: f.version_edicion,
  };
}

function leerCentavos(value, campo) {
  if (!['string', 'number'].includes(typeof value) || !/^\d+(\.\d{1,2})?$/.test(String(value))) {
    throw new ErrorSalon(422, `${campo}: usa un importe no negativo con máximo dos decimales.`);
  }
  const centavos = Math.round(Number(value) * 100);
  if (!Number.isSafeInteger(centavos) || centavos > MAX_CENTAVOS) {
    throw new ErrorSalon(422, `${campo} excede el importe máximo.`);
  }
  return centavos;
}

function leerPagos(body, total) {
  const lineas = Array.isArray(body?.pagos)
    ? body.pagos
    : [{ metodo: body?.metodo, monto: total, monto_recibido: body?.monto_recibido, referencia: body?.referencia }];
  if (!lineas.length || lineas.length > 10) {
    throw new ErrorSalon(422, 'Indica entre uno y diez pagos.');
  }

  const pagos = lineas.map((linea) => {
    if (!linea || typeof linea !== 'object' || Array.isArray(linea)) {
      throw new ErrorSalon(422, 'Cada pago debe incluir un método y un importe.');
    }
    const metodo = typeof linea.metodo === 'string' ? linea.metodo.trim().toUpperCase() : '';
    if (!METODOS_PAGO.includes(metodo)) {
      throw new ErrorSalon(422, 'Selecciona EFECTIVO, TARJETA o TRANSFERENCIA para cada pago.');
    }
    const montoCentavos = leerCentavos(linea.monto, 'Importe del pago');
    if (montoCentavos <= 0) throw new ErrorSalon(422, 'Cada pago debe ser mayor que cero.');
    const referencia = linea.referencia == null ? null : String(linea.referencia).trim().slice(0, 80) || null;
    let recibido = null;
    let cambio = 0;
    if (metodo === 'EFECTIVO') {
      recibido = leerCentavos(linea.monto_recibido, 'Monto recibido');
      if (recibido < montoCentavos) {
        throw new ErrorSalon(422, 'El monto recibido en efectivo no puede ser menor al importe asignado.');
      }
      cambio = recibido - montoCentavos;
    } else if (linea.monto_recibido !== undefined && linea.monto_recibido !== null) {
      throw new ErrorSalon(422, 'El monto recibido solo aplica para pagos en efectivo.');
    }
    return {
      metodo,
      monto: montoCentavos / 100,
      montoCentavos,
      referencia,
      monto_recibido: recibido === null ? null : recibido / 100,
      cambio: cambio / 100,
    };
  });

  if (pagos.reduce((sum, pago) => sum + pago.montoCentavos, 0) !== leerCentavos(total, 'Total de la cuenta')) {
    throw new ErrorSalon(422, 'La suma de los métodos de pago debe ser igual al total de la cuenta.');
  }
  return pagos;
}

async function registrarPagos(tx, { factura, pedido, pagos, idUsuario, idTurno, saldoInicial, idParte = null }) {
  let saldo = saldoInicial;
  const registrados = [];
  for (const linea of pagos) {
    const pago = await tx.pago.create({
      data: {
        id_factura: factura.id_factura,
        id_usuario_cajero: idUsuario,
        metodo: linea.metodo,
        monto: linea.monto,
        monto_recibido: linea.monto_recibido,
        cambio: linea.cambio,
        referencia: linea.referencia,
        estado: 'APROBADO',
        id_turno: idTurno,
        id_parte: idParte,
      },
    });
    saldo = round2(saldo + linea.monto);
    await tx.flujo_caja.create({
      data: {
        id_turno: idTurno,
        concepto: `Cobro ${factura.consecutivo} (mesa ${pedido.Mesa_num ?? 'N/A'})`,
        ingresos: linea.monto,
        egresos: 0,
        saldo,
        metodo: linea.metodo,
        referencia: linea.referencia,
        id_pago: pago.id_pago,
      },
    });
    registrados.push({ ...linea, id_pago: pago.id_pago });
  }
  return registrados;
}

function divisionPublica(division) {
  if (!division) return null;
  return {
    id_division: division.id_division,
    modo: division.modo,
    partes: division.partes.map((parte) => {
      const pagos = parte.pagos.filter((p) => p.estado === 'APROBADO');
      const pagado = round2(pagos.reduce((suma, p) => suma + Number(p.monto ?? 0), 0));
      return {
        id_parte: parte.id_parte,
        numero: parte.numero,
        total: Number(parte.total),
        pagado,
        pagada: pagado >= Number(parte.total),
        items: parte.items.map((item) => ({
          id_detalle: item.id_detalle,
          cantidad: item.cantidad,
          nombre: item.detalle.Producto?.Nombre ?? `Producto ${item.detalle.id_producto}`,
          precio_unitario: Number(item.detalle.Precio_unitario ?? 0),
        })),
        pagos: pagos.map((p) => ({
          id_pago: p.id_pago,
          metodo: p.metodo,
          monto: Number(p.monto),
          monto_recibido: p.monto_recibido == null ? null : Number(p.monto_recibido),
          cambio: Number(p.cambio ?? 0),
          referencia: p.referencia,
        })),
      };
    }),
  };
}

function repartirCentavos(total, pesos) {
  const pesoTotal = pesos.reduce((suma, peso) => suma + BigInt(peso), 0n);
  if (pesoTotal <= 0n) throw new ErrorSalon(422, 'No hay productos con importe para dividir.');
  const distribucion = pesos.map((peso, indice) => {
    const numerador = BigInt(total) * BigInt(peso);
    return { indice, importe: numerador / pesoTotal, residuo: numerador % pesoTotal };
  });
  let restante = BigInt(total) - distribucion.reduce((suma, parte) => suma + parte.importe, 0n);
  distribucion.sort((a, b) => (a.residuo === b.residuo ? a.indice - b.indice : a.residuo > b.residuo ? -1 : 1));
  for (let i = 0; restante > 0n; i = (i + 1) % distribucion.length) {
    distribucion[i].importe += 1n;
    restante -= 1n;
  }
  return distribucion.sort((a, b) => a.indice - b.indice).map((parte) => Number(parte.importe));
}

async function saldoTurno(tx, turno) {
  const [libro] = await tx.$queryRaw`SELECT ingresos, egresos FROM vista_arqueo_turno
    WHERE id_turno=${turno.id_turno} AND id_restaurante=${turno.id_restaurante}`;
  return Number(turno.efectivo_inicial ?? 0) + Number(libro?.ingresos ?? 0) - Number(libro?.egresos ?? 0);
}

async function turnoAbierto(tx, idUsuario, idRestaurante) {
  const [turno] = await tx.$queryRaw`SELECT t.id_turno, t.id_restaurante, t.efectivo_inicial FROM turno_caja t
    JOIN caja c ON c.id_caja=t.id_caja AND c.id_restaurante=t.id_restaurante AND c.estado='ACTIVA'
    WHERE t.id_usuario_cajero = ${idUsuario} AND t.id_restaurante = ${idRestaurante}
      AND t.estado = 'ABIERTA' ORDER BY t.id_turno DESC LIMIT 1 FOR UPDATE`;
  return turno;
}

export async function pendientes(req, res, next) {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: {
        estado: { in: ESTADOS_COBRABLES },
        AND: [deSede(req.user), { OR: [{ version_salon: null }, { estado: 'POR_COBRAR' }] }],
        OR: [
          { Factura: { is: null } },
          {
            Factura: {
              is: {
                OR: [
                  { estado: { in: ESTADOS_FACTURA_REUTILIZABLE }, pago: { none: { estado: 'APROBADO' } } },
                  { estado: 'PENDIENTE', tasa_iva: { not: null }, total: { not: null } },
                ],
              },
            },
          },
        ],
      },
      include: {
        Detalle_pedido: { include: { Producto: true } },
        Factura: { include: { Factura_item: lineasDeFactura } },
        Division_cuenta: {
          include: {
            partes: {
              orderBy: { numero: 'asc' },
              include: {
                items: { include: { detalle: { include: { Producto: true } } } },
                pagos: { where: { estado: 'APROBADO' }, orderBy: { id_pago: 'asc' } },
              },
            },
          },
        },
        usuario: { where: req.sede, select: { nombre: true, apellido: true, id_restaurante: true } },
      },
      orderBy: { Fecha_hora: 'asc' },
    });

    const cuentas = pedidos.map((pedido) => ({
      ...cuentaParaCobro(pedido),
      division: divisionPublica(pedido.Division_cuenta),
    })).filter((cuenta) => cuenta.items.length > 0);

    res.json(cuentas);
  } catch (err) {
    next(err);
  }
}

// POST /api/cobro/cerrar-cuenta
// Para un borrador, version_factura debe ser la revisión vista por caja en /pendientes.
export async function cerrarCuenta(req, res, next) {
  try {
    const idPedido = parseId(req.body?.id_pedido);
    if (!idPedido) throw new ErrorSalon(422, 'id_pedido debe ser un entero válido.');

    const idUsuario = req.user.id_usuario;
    const resultado = await transaccionSalon(req.user, async (tx) => {
      const turno = await turnoAbierto(tx, idUsuario, req.sede.id_restaurante);
      if (!turno) return { status: 409, message: 'Debes tener un turno de caja abierto para cobrar.' };
      await bloquearPedido(tx, idPedido, req.sede.id_restaurante);
      const pedido = await tx.pedido.findFirst({
        where: { id_pedido: idPedido, ...deSede(req.user) },
        include: {
          ...origenDeFactura,
          Division_cuenta: { select: { id_division: true } },
          Factura: {
            include: {
              Factura_item: lineasDeFactura,
              pago: { where: { estado: 'APROBADO' }, select: { estado: true }, take: 1 },
            },
          },
        },
      });

      if (!pedido) {
        return { status: 404, message: 'Pedido no encontrado.' };
      }

      if (pedido.Division_cuenta) {
        return { status: 409, message: 'Esta cuenta está dividida. Cobra cada parte por separado.' };
      }
      const facturaExistente = pedido.Factura;
      if (conPago(facturaExistente))
        return { status: 409, message: 'El pedido ya tiene una factura pagada.' };
      const conBorrador = esBorrador(facturaExistente);
      if (
        facturaExistente &&
        !conBorrador &&
        !ESTADOS_FACTURA_REUTILIZABLE.includes(facturaExistente.estado)
      ) {
        return { status: 409, message: 'Esta factura no se puede cobrar. Revisa su estado y sus importes.' };
      }

      if (
        !ESTADOS_COBRABLES.includes(pedido.estado) ||
        (pedido.version_salon !== null && pedido.estado !== 'POR_COBRAR')
      ) {
        return {
          status: 409,
          message: `El pedido está en estado ${pedido.estado} y no se puede cobrar.`,
        };
      }

      const cuenta = cuentaParaCobro(pedido);
      if ((req.body.version_factura ?? null) !== cuenta.version_factura)
        return {
          status: 409,
          message: 'La factura cambió. Actualiza y confirma el importe antes de cobrar.',
        };
      const detalles = itemsFacturables(pedido.Detalle_pedido);
      if (cuenta.items.length === 0 || detalles.length === 0) {
        return {
          status: 422,
          message: 'No se puede cerrar una cuenta sin productos consumidos.',
        };
      }

      // Regla de negocio: no se cobra si no hay stock suficiente de los
      // ingredientes que consume la receta (réplica de la validación de
      // sp_registrar_movimiento_inventario).
      // Las cuentas confirmadas por salón ya registraron su consumo.
      const { requerimientos } =
        pedido.version_salon !== null
          ? { requerimientos: [] }
          : await verificarStockSuficiente(
              tx,
              detalles.map((d) => ({
                id_producto: d.id_producto,
                cantidad: Number(d.Cantidad ?? 0),
              })),
              req.sede.id_restaurante,
            );

      const pagos = leerPagos(req.body, cuenta.total);

      const factura = conBorrador
        ? await tx.factura.update({
            where: { id_factura: facturaExistente.id_factura },
            data: { estado: 'PAGADA', Fecha_emision: new Date() },
          })
        : await guardarConsumo(tx, pedido, {}, 'PAGADA', facturaExistente);
      const consecutivo = factura.consecutivo;
      const registrados = await registrarPagos(tx, {
        factura,
        pedido,
        pagos,
        idUsuario,
        idTurno: turno.id_turno,
        saldoInicial: await saldoTurno(tx, turno),
      });

      await tx.pedido.update({
        where: { id_pedido: idPedido },
        data: { estado: 'CERRADO' },
      });

      // Descuento de inventario por consumo (una sola vez por cobro).
      await registrarSalidasPorConsumo(tx, requerimientos, {
        id_usuario: idUsuario,
        ...req.sede,
        origen_tipo: 'VENTA',
        origen_id: factura.id_factura,
      });

      const metodos = [...new Set(registrados.map((p) => p.metodo))];
      return {
        status: 201,
        data: {
          id_factura: factura.id_factura,
          consecutivo,
          id_pedido: idPedido,
          mesa: pedido.Mesa_num,
          subtotal: cuenta.subtotal,
          iva: cuenta.iva,
          total: cuenta.total,
          metodo: metodos.length === 1 ? metodos[0] : 'MIXTO',
          monto_recibido: round2(registrados.reduce((suma, p) => suma + (p.monto_recibido ?? 0), 0)),
          cambio: round2(registrados.reduce((suma, p) => suma + p.cambio, 0)),
          pagos: registrados,
          items: cuenta.items,
          receptor: factura.receptor,
          descuento: cuenta.descuento,
          propina: cuenta.propina,
          fecha_emision: factura.Fecha_emision,
        },
      };
    }, 'CAJA');

    if (resultado.status !== 201) {
      return res.status(resultado.status).json({ message: resultado.message });
    }

    return res.status(201).json({
      message: 'Cuenta cerrada y factura pagada.',
      factura: resultado.data,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/cobro/dividir-cuenta
// Crea una factura detallada para el pedido y recibos cobrables por cada parte.
export async function dividirCuenta(req, res, next) {
  try {
    const idPedido = parseId(req.body?.id_pedido);
    if (!idPedido) throw new ErrorSalon(422, 'id_pedido debe ser un entero válido.');
    const modo = typeof req.body?.modo === 'string' ? req.body.modo.trim().toUpperCase() : '';
    if (!['IGUAL', 'PRODUCTOS'].includes(modo)) throw new ErrorSalon(422, 'El modo debe ser IGUAL o PRODUCTOS.');

    const division = await transaccionSalon(req.user, async (tx) => {
      await bloquearPedido(tx, idPedido, req.sede.id_restaurante);
      const pedido = await tx.pedido.findFirst({
        where: { id_pedido: idPedido, ...deSede(req.user) },
        include: {
          ...origenDeFactura,
          Division_cuenta: { select: { id_division: true } },
          Factura: {
            include: {
              Factura_item: lineasDeFactura,
              pago: { where: { estado: 'APROBADO' }, select: { id_pago: true }, take: 1 },
            },
          },
        },
      });
      if (!pedido) throw new ErrorSalon(404, 'Pedido no encontrado.');
      if (pedido.Division_cuenta) throw new ErrorSalon(409, 'El pedido ya tiene una división activa.');
      if (
        !ESTADOS_COBRABLES.includes(pedido.estado) ||
        (pedido.version_salon !== null && pedido.estado !== 'POR_COBRAR')
      ) {
        throw new ErrorSalon(409, `El pedido está en estado ${pedido.estado} y no se puede dividir.`);
      }

      const cuentaVista = cuentaParaCobro(pedido);
      if ((req.body.version_factura ?? null) !== cuentaVista.version_factura) {
        throw new ErrorSalon(409, 'La factura cambió. Actualiza la cuenta antes de dividirla.');
      }
      if (conPago(pedido.Factura)) throw new ErrorSalon(409, 'La cuenta ya tiene pagos registrados.');

      const detalles = itemsFacturables(pedido.Detalle_pedido);
      if (!detalles.length) throw new ErrorSalon(422, 'No se puede dividir una cuenta sin productos consumidos.');
      if (pedido.version_salon === null) {
        await verificarStockSuficiente(
          tx,
          detalles.map((d) => ({ id_producto: d.id_producto, cantidad: Number(d.Cantidad ?? 0) })),
          req.sede.id_restaurante,
        );
      }

      const facturaPendiente = esBorrador(pedido.Factura)
        ? pedido.Factura
        : await guardarConsumo(tx, pedido, {}, 'PENDIENTE', pedido.Factura);
      const facturaCompleta = await tx.factura.findUnique({
        where: { id_factura: facturaPendiente.id_factura },
        include: { Factura_item: lineasDeFactura },
      });
      const cuenta = cuentaParaCobro({ ...pedido, Factura: facturaCompleta });
      const lineas = cuenta.items;
      let grupos;

      if (modo === 'IGUAL') {
        const cantidad = req.body.numero_partes;
        if (!Number.isInteger(cantidad) || cantidad < 2 || cantidad > 12) {
          throw new ErrorSalon(422, 'Indica entre 2 y 12 partes iguales.');
        }
        grupos = Array.from({ length: cantidad }, () => ({ items: [] }));
        const importes = repartirCentavos(leerCentavos(cuenta.total, 'Total de la cuenta'), Array(cantidad).fill(1));
        if (importes.some((importe) => importe <= 0)) {
          throw new ErrorSalon(422, 'El total debe alcanzar para cubrir todas las partes.');
        }
        grupos = grupos.map((grupo, indice) => ({ ...grupo, totalCentavos: importes[indice] }));
      } else {
        if (!Array.isArray(req.body.partes) || req.body.partes.length < 2 || req.body.partes.length > 12) {
          throw new ErrorSalon(422, 'Indica entre 2 y 12 partes para distribuir los productos.');
        }
        const porId = new Map(lineas.map((linea) => [linea.id_detalle, linea]));
        const cantidades = new Map();
        grupos = req.body.partes.map((parte) => {
          if (!Array.isArray(parte?.items) || !parte.items.length) {
            throw new ErrorSalon(422, 'Cada parte debe tener al menos un producto.');
          }
          const items = parte.items.map((item) => {
            const id = parseId(item?.id_detalle);
            const cantidad = item?.cantidad;
            const linea = porId.get(id);
            if (!linea || !Number.isInteger(cantidad) || cantidad < 1) {
              throw new ErrorSalon(422, 'Hay un producto o cantidad inválida en la distribución.');
            }
            const acumulada = (cantidades.get(id) ?? 0) + cantidad;
            if (acumulada > linea.cantidad) {
              throw new ErrorSalon(422, 'La distribución supera la cantidad pedida de un producto.');
            }
            cantidades.set(id, acumulada);
            return { id_detalle: id, cantidad };
          });
          const peso = items.reduce((suma, item) => {
            const linea = porId.get(item.id_detalle);
            return suma + item.cantidad * Math.round(linea.precio_unitario * 100);
          }, 0);
          return { items, peso };
        });
        if (lineas.some((linea) => cantidades.get(linea.id_detalle) !== linea.cantidad)) {
          throw new ErrorSalon(422, 'Asigna la cantidad completa de cada producto a una parte.');
        }
        const importes = repartirCentavos(
          leerCentavos(cuenta.total, 'Total de la cuenta'),
          grupos.map((grupo) => grupo.peso),
        );
        if (importes.some((importe) => importe <= 0)) {
          throw new ErrorSalon(422, 'Cada parte debe tener un importe mayor que cero.');
        }
        grupos = grupos.map((grupo, indice) => ({ ...grupo, totalCentavos: importes[indice] }));
      }

      const nuevaDivision = await tx.division_cuenta.create({
        data: { id_pedido: idPedido, modo },
      });
      for (const [indice, grupo] of grupos.entries()) {
        const parte = await tx.parte_cuenta.create({
          data: {
            id_division: nuevaDivision.id_division,
            numero: indice + 1,
            total: grupo.totalCentavos / 100,
          },
        });
        if (grupo.items.length) {
          await tx.detalle_parte_cuenta.createMany({
            data: grupo.items.map((item) => ({ id_parte: parte.id_parte, ...item })),
          });
        }
      }
      return tx.division_cuenta.findUnique({
        where: { id_division: nuevaDivision.id_division },
        include: {
          partes: {
            orderBy: { numero: 'asc' },
            include: {
              items: { include: { detalle: { include: { Producto: true } } } },
              pagos: { where: { estado: 'APROBADO' } },
            },
          },
        },
      });
    }, 'CAJA');
    res.status(201).json({ division: divisionPublica(division) });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/cobro/dividir-cuenta/:idPedido
// Solo se puede deshacer antes de recibir pagos de cualquiera de sus partes.
export async function eliminarDivision(req, res, next) {
  try {
    const idPedido = parseId(req.params.idPedido);
    if (!idPedido) throw new ErrorSalon(422, 'El pedido debe ser un entero válido.');
    await transaccionSalon(req.user, async (tx) => {
      await bloquearPedido(tx, idPedido, req.sede.id_restaurante);
      const pedido = await tx.pedido.findFirst({
        where: { id_pedido: idPedido, ...deSede(req.user) },
        select: {
          Division_cuenta: {
            select: {
              id_division: true,
              partes: {
                select: { pagos: { where: { estado: 'APROBADO' }, select: { id_pago: true } } },
              },
            },
          },
        },
      });
      if (!pedido?.Division_cuenta) throw new ErrorSalon(404, 'No hay una división activa para este pedido.');
      if (pedido.Division_cuenta.partes.some((parte) => parte.pagos.length)) {
        throw new ErrorSalon(409, 'No se puede deshacer la división después de registrar un pago.');
      }
      const idDivision = pedido.Division_cuenta.id_division;
      await tx.detalle_parte_cuenta.deleteMany({ where: { parte: { id_division: idDivision } } });
      await tx.parte_cuenta.deleteMany({ where: { id_division: idDivision } });
      await tx.division_cuenta.delete({ where: { id_division: idDivision } });
    }, 'CAJA');
    res.json({ message: 'División cancelada.' });
  } catch (err) {
    next(err);
  }
}

// POST /api/cobro/partes/:idParte/pagar
export async function pagarParte(req, res, next) {
  try {
    const idParte = parseId(req.params.idParte);
    if (!idParte) throw new ErrorSalon(422, 'La parte debe ser un entero válido.');
    const idUsuario = req.user.id_usuario;
    const recibo = await transaccionSalon(req.user, async (tx) => {
      const referenciaPedido = await tx.parte_cuenta.findFirst({
        where: { id_parte: idParte, division: { pedido: deSede(req.user) } },
        select: { division: { select: { id_pedido: true } } },
      });
      if (!referenciaPedido) throw new ErrorSalon(404, 'Parte de cuenta no encontrada.');
      const turno = await turnoAbierto(tx, idUsuario, req.sede.id_restaurante);
      if (!turno) throw new ErrorSalon(409, 'Debes tener un turno de caja abierto para cobrar.');
      const idPedido = referenciaPedido.division.id_pedido;
      await bloquearPedido(tx, idPedido, req.sede.id_restaurante);
      const pedido = await tx.pedido.findFirst({
        where: { id_pedido: idPedido, ...deSede(req.user) },
        include: {
          ...origenDeFactura,
          Factura: {
            include: {
              Factura_item: lineasDeFactura,
              pago: { where: { estado: 'APROBADO' }, select: { estado: true }, take: 1 },
            },
          },
          Division_cuenta: {
            include: {
              partes: {
                orderBy: { numero: 'asc' },
                include: {
                  items: { include: { detalle: { include: { Producto: true } } } },
                  pagos: { where: { estado: 'APROBADO' } },
                },
              },
            },
          },
        },
      });
      if (!pedido?.Division_cuenta || !pedido.Factura || !esBorrador(pedido.Factura)) {
        throw new ErrorSalon(409, 'La factura dividida cambió. Actualiza las cuentas pendientes.');
      }
      if (pedido.estado !== 'POR_COBRAR') throw new ErrorSalon(409, 'El pedido ya no está pendiente de cobro.');
      if ((req.body?.version_factura ?? null) !== pedido.Factura.version_edicion) {
        throw new ErrorSalon(409, 'La factura cambió. Actualiza antes de cobrar esta parte.');
      }
      const parte = pedido.Division_cuenta.partes.find((p) => p.id_parte === idParte);
      if (!parte) throw new ErrorSalon(404, 'Parte de cuenta no encontrada.');
      if (parte.pagos.length) throw new ErrorSalon(409, 'Esta parte ya tiene un pago registrado.');
      const pagos = leerPagos(req.body, Number(parte.total));
      const saldoInicial = await saldoTurno(tx, turno);
      const registrados = await registrarPagos(tx, {
        factura: pedido.Factura,
        pedido,
        pagos,
        idUsuario,
        idTurno: turno.id_turno,
        saldoInicial,
        idParte,
      });
      const todasPagadas = pedido.Division_cuenta.partes.every((p) =>
        p.id_parte === idParte || p.pagos.reduce((suma, pago) => suma + Number(pago.monto ?? 0), 0) >= Number(p.total),
      );
      let facturaFinal = pedido.Factura;
      if (todasPagadas) {
        const detalles = itemsFacturables(pedido.Detalle_pedido);
        const { requerimientos } =
          pedido.version_salon !== null
            ? { requerimientos: [] }
            : await verificarStockSuficiente(
                tx,
                detalles.map((d) => ({ id_producto: d.id_producto, cantidad: Number(d.Cantidad ?? 0) })),
                req.sede.id_restaurante,
              );
        facturaFinal = await tx.factura.update({
          where: { id_factura: pedido.Factura.id_factura },
          data: { estado: 'PAGADA', Fecha_emision: new Date() },
        });
        await tx.pedido.update({ where: { id_pedido: idPedido }, data: { estado: 'CERRADO' } });
        await registrarSalidasPorConsumo(tx, requerimientos, {
          id_usuario: idUsuario,
          ...req.sede,
          origen_tipo: 'VENTA',
          origen_id: facturaFinal.id_factura,
        });
      }
      const metodos = [...new Set(registrados.map((p) => p.metodo))];
      return {
        id_factura: pedido.Factura.id_factura,
        consecutivo: pedido.Factura.consecutivo,
        id_pedido: idPedido,
        mesa: pedido.Mesa_num,
        modo: pedido.Division_cuenta.modo,
        parte: { id_parte: idParte, numero: parte.numero, total: Number(parte.total), items: divisionPublica(pedido.Division_cuenta).partes.find((p) => p.id_parte === idParte).items },
        pagos: registrados,
        monto_recibido: round2(registrados.reduce((suma, p) => suma + (p.monto_recibido ?? 0), 0)),
        cambio: round2(registrados.reduce((suma, p) => suma + p.cambio, 0)),
        total_factura: Number(pedido.Factura.total),
        factura_pagada: todasPagadas,
        fecha_emision: facturaFinal.Fecha_emision,
      };
    }, 'CAJA');
    res.status(201).json({ message: 'Pago de la parte registrado.', recibo });
  } catch (err) {
    next(err);
  }
}
