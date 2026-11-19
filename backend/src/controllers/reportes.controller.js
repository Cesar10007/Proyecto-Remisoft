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
fix/modulo-gerente
      JOIN Producto p ON p.id_producto = dp.id_producto
      ${esMesero ? unirSede : Prisma.empty}
      WHERE f.estado = 'PAGADA' ${esMesero ? sede : Prisma.empty}
        AND ${diaLocal} BETWEEN ${desde} AND ${hasta}
      GROUP BY p.id_producto, p.Nombre

      JOIN pedido pe ON pe.id_pedido = f.id_pedido
      LEFT JOIN Producto p ON p.id_producto = dp.id_producto AND p.id_restaurante = pe.id_restaurante
      JOIN vista_primer_cobro_factura c ON c.id_factura=f.id_factura
      WHERE c.fecha BETWEEN ${desde} AND ${hasta} ${sede}
      GROUP BY dp.id_producto, p.Nombre
develop
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
