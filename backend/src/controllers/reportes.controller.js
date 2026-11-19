import { CUENTA_ABIERTA } from '../utils/salon.js';
import { Prisma } from '../generated/prisma/client.js';
import prisma from '../config/prisma.js';

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function fechaHoyBogota() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function esFechaValida(valor) {
  if (!FORMATO_FECHA.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
}

function numero(valor) {
  return Number(valor ?? 0);
}

/**
 * GET /api/reportes/ventas-diarias?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
 * Resumen diario de cobros aprobados y top de productos del rango.
 * Sin parámetros usa el día actual en America/Bogota.
 */
export async function ventasDiarias(req, res, next) {
  try {
    const hoy = fechaHoyBogota();
    const desde = req.query.desde ?? hoy;
    const hasta = req.query.hasta ?? desde;

    if (!esFechaValida(desde) || !esFechaValida(hasta)) {
      return res.status(400).json({
        success: false,
        message: 'Las fechas deben tener formato YYYY-MM-DD válido.',
      });
    }

    if (desde > hasta) {
      return res.status(400).json({
        success: false,
        message: 'La fecha "desde" no puede ser posterior a "hasta".',
      });
    }

    const idSede = req.sede.id_restaurante ?? null;
    const sede = idSede === null ? Prisma.empty : Prisma.sql`AND pe.id_restaurante = ${idSede}`;
    const [filasDia, topProductos, [conteo]] = await prisma.$transaction([prisma.$queryRaw`
      SELECT DATE_FORMAT(v.fecha, '%Y-%m-%d') AS fecha, SUM(v.total_pedidos) AS total_pedidos,
             SUM(v.ingresos_brutos) AS ingresos_brutos, SUM(v.total_iva) AS total_iva,
             SUM(v.total_descuentos) AS total_descuentos, SUM(v.total_propinas) AS total_propinas,
             SUM(v.ingresos_netos) AS ingresos_netos
      FROM vista_resumen_ventas_diarias v
      WHERE v.fecha BETWEEN ${desde} AND ${hasta} AND (${idSede} IS NULL OR v.id_restaurante = ${idSede})
      GROUP BY v.fecha ORDER BY v.fecha DESC
    `, prisma.$queryRaw`
      SELECT dp.id_producto,
             COALESCE(p.Nombre, MAX(fi.nombre_producto), CONCAT('Producto #', dp.id_producto)) AS producto,
             SUM(fi.cantidad_facturada) AS unidades,
             SUM(fi.cantidad_facturada * COALESCE(fi.precio_unitario, dp.Precio_unitario)) AS ingresos
      FROM Factura_item fi
      JOIN Factura f ON f.id_factura = fi.id_factura
      JOIN Detalle_pedido dp ON dp.id_detalle = fi.id_detalle_pedido AND dp.id_pedido = f.id_pedido
      JOIN pedido pe ON pe.id_pedido = f.id_pedido
      LEFT JOIN Producto p ON p.id_producto = dp.id_producto AND p.id_restaurante = pe.id_restaurante
      JOIN vista_primer_cobro_factura c ON c.id_factura=f.id_factura
      WHERE c.fecha BETWEEN ${desde} AND ${hasta} ${sede}
      GROUP BY dp.id_producto, p.Nombre
      ORDER BY unidades DESC, ingresos DESC
      LIMIT 5
    `, prisma.$queryRaw`
      SELECT COUNT(DISTINCT c.id_factura) AS facturas FROM vista_cobros_factura_dia c
      JOIN Factura f USING(id_factura) JOIN pedido pe USING(id_pedido)
      WHERE c.fecha BETWEEN ${desde} AND ${hasta} ${sede}
    `], { isolationLevel: 'RepeatableRead' });

    const dias = filasDia.map((fila) => ({
      fecha: fila.fecha,
      total_pedidos: numero(fila.total_pedidos),
      ingresos_brutos: numero(fila.ingresos_brutos),
      total_iva: numero(fila.total_iva),
      total_descuentos: numero(fila.total_descuentos),
      total_propinas: numero(fila.total_propinas),
      ingresos_netos: numero(fila.ingresos_netos),
    }));

    // Los pagos parciales no duplican una factura en el rango. Sumar los importes en centavos.
    const total = { total_pedidos: numero(conteo.facturas) };
    for (const clave of ['ingresos_brutos','total_iva','total_descuentos','total_propinas','ingresos_netos']) {
      total[clave] = dias.reduce((centavos, dia) => centavos + Math.round(dia[clave] * 100), 0) / 100;
    }

    return res.status(200).json({
      success: true,
      data: {
        desde,
        hasta,
        dias,
        total,
        productos_top: topProductos.map((p) => ({
          id_producto: p.id_producto,
          producto: p.producto,
          unidades: numero(p.unidades),
          ingresos: numero(p.ingresos),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reportes/pedidos-activos
 * Cuenta los pedidos que siguen en curso: todo estado distinto de
 * CERRADO o CANCELADO (ABIERTO, EN_PREPARACION, LISTO, etc.).
 */
export async function pedidosActivos(req, res, next) {
  try {
    const total = await prisma.pedido.count({ where: { ...req.sede, ...CUENTA_ABIERTA } });

    return res.status(200).json({
      success: true,
      data: { pedidos_activos: total },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reportes/gastos-del-mes
 * Gastos del mes en curso (hora de Bogota): cantidad recibida x precio unitario
 * de las ordenes de compra del mes. Las ordenes canceladas no cuentan.
 */
export async function gastosDelMes(req, res, next) {
  try {
    const [anio, mes] = fechaHoyBogota().split('-').map(Number);
    // 00:00 en Bogota (UTC-5) del primer dia del mes y del mes siguiente.
    const desde = new Date(Date.UTC(anio, mes - 1, 1, 5));
    const hasta = new Date(Date.UTC(anio, mes, 1, 5));

    const ordenes = await prisma.orden_compra.findMany({
      where: {
        ...req.sede,
        fecha_orden: { gte: desde, lt: hasta },
        OR: [{ estado: null }, { estado: { not: 'CANCELADA' } }],
      },
      select: {
        detalle_orden_compra: { select: { cantidad_recibida: true, precio_unitario: true } },
      },
    });

    let gastos = 0;
    for (const orden of ordenes) {
      for (const d of orden.detalle_orden_compra) {
        gastos += Number(d.cantidad_recibida ?? 0) * Number(d.precio_unitario ?? 0);
      }
    }

    return res.status(200).json({
      success: true,
      data: { gastos_mes: Math.round(gastos), ordenes: ordenes.length },
    });
  } catch (error) {
    next(error);
  }
}
