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

    // La vista global no conserva la sede. En la consulta del mesero agrupamos
    // después de filtrar el pedido por restaurante (incluidos los pedidos históricos).
    const esMesero = req.user.rol === 'MESERO';
    const unirSede = Prisma.sql`JOIN pedido pe ON pe.id_pedido = f.id_pedido LEFT JOIN usuario u ON u.id_usuario = pe.id_mesero`;
    const sede = Prisma.sql`AND COALESCE(pe.id_restaurante, u.id_restaurante) <=> ${req.user.id_restaurante}`;
    const diaLocal = Prisma.sql`DATE(CONVERT_TZ(f.Fecha_emision, '+00:00', '-05:00'))`;
    const filasDia = esMesero ? await prisma.$queryRaw`
      SELECT DATE_FORMAT(${diaLocal}, '%Y-%m-%d') AS fecha, COUNT(*) AS total_pedidos,
             SUM(f.total + COALESCE(f.Descuento, 0)) AS ingresos_brutos, SUM(f.IVA) AS total_iva, SUM(f.Descuento) AS total_descuentos,
             SUM(f.Propina) AS total_propinas, SUM(f.total) AS ingresos_netos
      FROM Factura f ${unirSede} WHERE f.estado = 'PAGADA' ${sede}
        AND ${diaLocal} BETWEEN ${desde} AND ${hasta} GROUP BY fecha ORDER BY fecha DESC
    ` : await prisma.$queryRaw`
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
             SUM(fi.cantidad_facturada * COALESCE(fi.precio_unitario, dp.Precio_unitario)) AS ingresos
      FROM Factura_item fi
      JOIN Factura f ON f.id_factura = fi.id_factura
      JOIN Detalle_pedido dp ON dp.id_detalle = fi.id_detalle_pedido AND dp.id_pedido = f.id_pedido
      JOIN Producto p ON p.id_producto = dp.id_producto
      ${esMesero ? unirSede : Prisma.empty}
      WHERE f.estado = 'PAGADA' ${esMesero ? sede : Prisma.empty}
        AND ${diaLocal} BETWEEN ${desde} AND ${hasta}
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

/**
 * GET /api/reportes/pedidos-activos
 * Cuenta los pedidos que siguen en curso: todo estado distinto de
 * CERRADO o CANCELADO (ABIERTO, EN_PREPARACION, LISTO, etc.).
 */
export async function pedidosActivos(req, res, next) {
  try {
    const [fila] = await prisma.$queryRaw`SELECT COUNT(*) AS total FROM pedido WHERE estado NOT IN ('CERRADO', 'CANCELADO') OR estado IS NULL`;

    return res.status(200).json({
      success: true,
      data: { pedidos_activos: numero(fila?.total) },
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

const NOMBRES_MES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Suma (o resta) dias a una fecha YYYY-MM-DD sin pasar por la zona horaria local.
function sumarDias(fechaISO, dias) {
  const fecha = new Date(`${fechaISO}T12:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

function nombreDiaCorto(fechaISO) {
  return new Date(`${fechaISO}T12:00:00Z`)
    .toLocaleDateString('es-CO', { weekday: 'short', timeZone: 'UTC' })
    .replace('.', '')
    .slice(0, 3)
    .toUpperCase();
}

function fechaLarga(fechaISO) {
  return new Date(`${fechaISO}T12:00:00Z`).toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}

function mesLargo(fechaISO) {
  return MESES_LARGOS[Number(fechaISO.slice(5, 7)) - 1];
}

/**
 * GET /api/reportes/tendencia?periodo=dia|semana|mes|anio&ancla=YYYY-MM-DD
 * Serie de ingresos para la grafica del panel de gerente. Siempre limitada al
 * restaurante del usuario en sesion.
 *
 * `ancla` es cualquier fecha dentro del periodo que se quiere ver; si no llega,
 * se usa el dia de hoy en Bogota.
 *
 *  - dia:    solo el ancla (una barra)
 *  - semana: los 7 dias que terminan en el ancla
 *  - mes:    el mes del ancla (una barra por semana del mes: SEM 1..SEM 5)
 *  - anio:   el anio del ancla (una barra por mes)
 *
 * Cada punto trae: etiqueta (texto de la barra), secundaria (dato de apoyo bajo
 * la barra), detalle (texto completo para el tooltip) y el rango de fechas.
 */
export async function tendenciaVentas(req, res, next) {
  try {
    const periodo = String(req.query.periodo ?? 'semana');

    if (!['dia', 'semana', 'mes', 'anio'].includes(periodo)) {
      return res.status(400).json({
        success: false,
        message: 'El periodo debe ser dia, semana, mes o anio.',
      });
    }

    const hoy = fechaHoyBogota();
    const anclaPedida = String(req.query.ancla ?? '');
    const ancla = esFechaValida(anclaPedida) ? anclaPedida : hoy;

    const anioAncla = Number(ancla.slice(0, 4));
    const mesAncla = Number(ancla.slice(5, 7));
    const inicioMesAncla = `${ancla.slice(0, 8)}01`;
    const ultimoDiaDelMes = new Date(Date.UTC(anioAncla, mesAncla, 0)).getUTCDate();

    let desde = ancla;
    let hasta = ancla;
    let titulo = '';
    let esPeriodoActual = true;
    const puntos = [];

    if (periodo === 'dia') {
      desde = ancla;
      hasta = ancla;
      esPeriodoActual = ancla === hoy;
      puntos.push({
        etiqueta: nombreDiaCorto(ancla),
        secundaria: String(Number(ancla.slice(8, 10))),
        detalle: capitalizar(fechaLarga(ancla)),
        ingresos: 0,
        facturas: 0,
        desde: ancla,
        hasta: ancla,
      });
      titulo = capitalizar(fechaLarga(ancla));
    } else if (periodo === 'semana') {
      desde = sumarDias(ancla, -6);
      esPeriodoActual = desde <= hoy && hoy <= ancla;

      for (let i = 6; i >= 0; i -= 1) {
        const fecha = sumarDias(ancla, -i);
        puntos.push({
          etiqueta: nombreDiaCorto(fecha),
          secundaria: String(Number(fecha.slice(8, 10))),
          detalle: capitalizar(fechaLarga(fecha)),
          desde: fecha,
          hasta: fecha,
          ingresos: 0,
          facturas: 0,
        });
      }

      const diaInicio = Number(desde.slice(8, 10));
      const diaFin = Number(ancla.slice(8, 10));
      const mesInicio = mesLargo(desde);
      const mesFin = mesLargo(ancla);
      const anioFin = ancla.slice(0, 4);
      titulo = mesInicio === mesFin
        ? `${diaInicio} al ${diaFin} de ${mesFin} de ${anioFin}`
        : `${diaInicio} de ${mesInicio} al ${diaFin} de ${mesFin} de ${anioFin}`;
    } else if (periodo === 'mes') {
      esPeriodoActual = ancla.slice(0, 7) === hoy.slice(0, 7);
      desde = inicioMesAncla;
      hasta = esPeriodoActual
        ? hoy
        : `${ancla.slice(0, 8)}${String(ultimoDiaDelMes).padStart(2, '0')}`;

      const ultimoDiaVisible = esPeriodoActual ? Number(hoy.slice(8, 10)) : ultimoDiaDelMes;
      let diaInicio = 1;
      let numeroSemana = 1;

      while (diaInicio <= ultimoDiaVisible) {
        const diaFin = Math.min(diaInicio + 6, ultimoDiaVisible);
        const prefijo = inicioMesAncla.slice(0, 8);
        const fechaInicio = `${prefijo}${String(diaInicio).padStart(2, '0')}`;
        const fechaFin = `${prefijo}${String(diaFin).padStart(2, '0')}`;
        puntos.push({
          etiqueta: `SEM ${numeroSemana}`,
          secundaria: `${diaInicio}-${diaFin}`,
          detalle: `Semana ${numeroSemana} del mes: del ${diaInicio} al ${diaFin} de ${MESES_LARGOS[mesAncla - 1]}`,
          ingresos: 0,
          facturas: 0,
          desde: fechaInicio,
          hasta: fechaFin,
        });
        diaInicio = diaFin + 1;
        numeroSemana += 1;
      }

      titulo = `${capitalizar(MESES_LARGOS[mesAncla - 1])} de ${anioAncla}`;
    } else {
      esPeriodoActual = anioAncla === Number(hoy.slice(0, 4));
      desde = `${anioAncla}-01-01`;
      hasta = esPeriodoActual ? hoy : `${anioAncla}-12-31`;

      const ultimoMesVisible = esPeriodoActual ? Number(hoy.slice(5, 7)) : 12;

      for (let m = 1; m <= ultimoMesVisible; m += 1) {
        const mm = String(m).padStart(2, '0');
        const ultimoDia = new Date(Date.UTC(anioAncla, m, 0)).getUTCDate();
        puntos.push({
          etiqueta: NOMBRES_MES[m - 1],
          secundaria: String(anioAncla),
          detalle: `${capitalizar(MESES_LARGOS[m - 1])} de ${anioAncla}`,
          ingresos: 0,
          facturas: 0,
          desde: `${anioAncla}-${mm}-01`,
          hasta: `${anioAncla}-${mm}-${String(ultimoDia).padStart(2, '0')}`,
        });
      }

      titulo = `Año ${anioAncla}`;
    }

    const filas = await prisma.$queryRaw`
      SELECT DATE_FORMAT(DATE(CONVERT_TZ(f.Fecha_emision, '+00:00', '-05:00')), '%Y-%m-%d') AS fecha,
             SUM(f.total + COALESCE(f.Descuento, 0)) AS ingresos,
             COUNT(*) AS facturas
      FROM Factura f
      JOIN pedido pe ON pe.id_pedido = f.id_pedido
      LEFT JOIN usuario u ON u.id_usuario = pe.id_mesero
      WHERE f.estado = 'PAGADA'
        AND COALESCE(pe.id_restaurante, u.id_restaurante) <=> ${req.user.id_restaurante}
        AND DATE(CONVERT_TZ(f.Fecha_emision, '+00:00', '-05:00')) BETWEEN ${desde} AND ${hasta}
      GROUP BY fecha
      ORDER BY fecha
    `;

    const porDia = new Map(
      filas.map((fila) => [fila.fecha, { ingresos: numero(fila.ingresos), facturas: numero(fila.facturas) }]),
    );

    for (const punto of puntos) {
      for (const [fecha, valores] of porDia) {
        if (fecha >= punto.desde && fecha <= punto.hasta) {
          punto.ingresos += valores.ingresos;
          punto.facturas += valores.facturas;
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: { periodo, ancla, titulo, desde, hasta, es_periodo_actual: esPeriodoActual, puntos },
    });
  } catch (error) {
    next(error);
  }
}
