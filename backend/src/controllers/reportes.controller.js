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
 * Resumen diario de ventas (facturas PAGADA) y top de productos del rango.
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

    const filasDia = await prisma.$queryRaw`
      SELECT DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha, total_pedidos, ingresos_brutos, total_iva,
             total_descuentos, total_propinas, ingresos_netos
      FROM vista_resumen_ventas_diarias
      WHERE fecha BETWEEN ${desde} AND ${hasta}
      ORDER BY fecha DESC
    `;

    const topProductos = await prisma.$queryRaw`
      SELECT p.id_producto,
             p.Nombre AS producto,
             SUM(fi.cantidad_facturada) AS unidades,
             SUM(fi.cantidad_facturada * dp.Precio_unitario) AS ingresos
      FROM Factura_item fi
      JOIN Factura f ON f.id_factura = fi.id_factura
      JOIN Detalle_pedido dp ON dp.id_detalle = fi.id_detalle_pedido
      JOIN Producto p ON p.id_producto = dp.id_producto
      WHERE f.estado = 'PAGADA'
        AND DATE(f.Fecha_emision) BETWEEN ${desde} AND ${hasta}
      GROUP BY p.id_producto, p.Nombre
      ORDER BY unidades DESC, ingresos DESC
      LIMIT 5
    `;

    const dias = filasDia.map((fila) => ({
      fecha: fila.fecha,
      total_pedidos: numero(fila.total_pedidos),
      ingresos_brutos: numero(fila.ingresos_brutos),
      total_iva: numero(fila.total_iva),
      total_descuentos: numero(fila.total_descuentos),
      total_propinas: numero(fila.total_propinas),
      ingresos_netos: numero(fila.ingresos_netos),
    }));

    const total = dias.reduce(
      (acc, dia) => ({
        total_pedidos: acc.total_pedidos + dia.total_pedidos,
        ingresos_brutos: acc.ingresos_brutos + dia.ingresos_brutos,
        total_iva: acc.total_iva + dia.total_iva,
        total_descuentos: acc.total_descuentos + dia.total_descuentos,
        total_propinas: acc.total_propinas + dia.total_propinas,
        ingresos_netos: acc.ingresos_netos + dia.ingresos_netos,
      }),
      {
        total_pedidos: 0,
        ingresos_brutos: 0,
        total_iva: 0,
        total_descuentos: 0,
        total_propinas: 0,
        ingresos_netos: 0,
      },
    );

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
