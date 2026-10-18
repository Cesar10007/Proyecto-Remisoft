import prisma from '../config/prisma.js';

export async function index(req, res, next) {
  try {
    const domicilios = await prisma.domicilio.findMany({
      include: { pedido: { include: { Cliente: true } } },
    });

    const aplanado = domicilios.map((d) => ({
      id_domicilio: d.id_domicilio,
      id_pedido: d.id_pedido,
      direccion: d.direccion,
      coordenadas_gps: d.coordenadas_gps,
      estado: d.estado,
      Fecha_asignacion: d.Fecha_asignacion,
      fecha_entrega: d.fecha_entrega,
      id_repartidor: d.id_repartidor,
      estado_pedido: d.pedido?.estado ?? null,
      nombre_cliente: d.pedido?.Cliente?.Nombre ?? null,
    }));

    res.json(aplanado);
  } catch (err) {
    next(err);
  }
}

export async function crear(req, res, next) {
  try {
    const { id_pedido, direccion, estado, id_repartidor } = req.body;

    if (!id_pedido || !Number.isInteger(Number(id_pedido))) {
      return res.status(422).json({ message: 'El campo id_pedido es requerido y debe ser un número entero' });
    }
    if (!direccion || typeof direccion !== 'string' || direccion.length > 150) {
      return res.status(422).json({ message: 'El campo direccion es requerido (máx. 150 caracteres)' });
    }
    if (estado && (typeof estado !== 'string' || estado.length > 20)) {
      return res.status(422).json({ message: 'El campo estado no puede superar 20 caracteres' });
    }
    if (id_repartidor !== undefined && id_repartidor !== null && !Number.isInteger(Number(id_repartidor))) {
      return res.status(422).json({ message: 'El campo id_repartidor debe ser un número entero' });
    }

    await prisma.domicilio.create({
      data: {
        id_pedido: Number(id_pedido),
        direccion,
        estado: estado || 'ASIGNADO',
        id_repartidor: id_repartidor ? Number(id_repartidor) : null,
      },
    });

    res.status(201).json({ message: 'Domicilio creado' });
  } catch (err) {
    if (err.code === 'P2003') {
      return res.status(422).json({ message: 'El pedido o el repartidor indicado no existe' });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Ese pedido ya tiene un domicilio asignado' });
    }
    next(err);
  }
}

export async function actualizar(req, res, next) {
  try {
    const { id } = req.params;
    const { direccion, estado, id_repartidor } = req.body;

    if (!direccion || typeof direccion !== 'string' || direccion.length > 150) {
      return res.status(422).json({ message: 'El campo direccion es requerido (máx. 150 caracteres)' });
    }
    if (estado && (typeof estado !== 'string' || estado.length > 20)) {
      return res.status(422).json({ message: 'El campo estado no puede superar 20 caracteres' });
    }
    if (id_repartidor !== undefined && id_repartidor !== null && !Number.isInteger(Number(id_repartidor))) {
      return res.status(422).json({ message: 'El campo id_repartidor debe ser un número entero' });
    }

    await prisma.domicilio.update({
      where: { id_domicilio: Number(id) },
      data: {
        direccion,
        estado: estado ?? null,
        id_repartidor: id_repartidor ? Number(id_repartidor) : null,
      },
    });

    res.json({ message: 'Domicilio actualizado' });
  } catch (err) {
    if (err.code === 'P2003') {
      return res.status(422).json({ message: 'El repartidor indicado no existe' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Domicilio no encontrado' });
    }
    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.domicilio.update({
      where: { id_domicilio: Number(id) },
      data: { estado: 'CANCELADO' },
    });
    res.json({ message: 'Domicilio cancelado' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Domicilio no encontrado' });
    }
    next(err);
  }
}

// Inicio del día de hoy en America/Bogota (UTC-5, sin horario de verano).
function inicioDeHoyBogota() {
  const hoy = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
  const [y, m, d] = hoy.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 5));
}

const ESTADOS_COLA = ['ASIGNADO', 'EN_CAMINO'];

// Resumen de la pantalla del repartidor, todo desde la base de datos:
// - ganancias_hoy: suma de facturas de mis domicilios ENTREGADO hoy
// - entregas_hoy: cantidad de mis domicilios ENTREGADO hoy
// - cola: mis domicilios ASIGNADO o EN_CAMINO
// - actual: primer domicilio de la cola, con items y total
// - top: repartidores del restaurante con más entregas hoy
export async function resumenRepartidor(req, res, next) {
  try {
    const idUsuario = req.user.id_usuario;
    const idRestaurante = req.user.id_restaurante ?? null;
    const inicioHoy = inicioDeHoyBogota();

    const misDomicilios = await prisma.domicilio.findMany({
      where: { id_repartidor: idUsuario },
      include: {
        pedido: {
          include: {
            Cliente: true,
            Factura: true,
            Detalle_pedido: { include: { Producto: true } },
          },
        },
      },
      orderBy: { Fecha_asignacion: 'asc' },
    });

    const entregadosHoy = misDomicilios.filter(
      (d) => d.estado === 'ENTREGADO' && d.fecha_entrega && new Date(d.fecha_entrega) >= inicioHoy,
    );
    const gananciasHoy = entregadosHoy.reduce((suma, d) => suma + Number(d.pedido?.Factura?.total ?? 0), 0);

    const colaRaw = misDomicilios.filter((d) => ESTADOS_COLA.includes(d.estado));
    const cola = colaRaw.map((d) => ({
      id_domicilio: d.id_domicilio,
      id_pedido: d.id_pedido,
      estado: d.estado,
      direccion: d.direccion,
      cliente: [d.pedido?.Cliente?.Nombre, d.pedido?.Cliente?.Apellido].filter(Boolean).join(' ') || null,
      items: d.pedido?.Detalle_pedido?.length ?? 0,
    }));

    let actual = null;
    if (colaRaw.length > 0) {
      const d = colaRaw[0];
      const items = (d.pedido?.Detalle_pedido ?? []).map((it) => {
        const precio = Number(it.Precio_unitario ?? 0);
        const cantidad = it.Cantidad ?? 0;
        return {
          nombre: it.Producto?.Nombre ?? 'Producto',
          cantidad,
          subtotal: precio * cantidad,
        };
      });
      const totalItems = items.reduce((suma, it) => suma + it.subtotal, 0);
      actual = {
        id_domicilio: d.id_domicilio,
        id_pedido: d.id_pedido,
        cliente: cola[0].cliente,
        telefono: d.pedido?.Cliente?.Telefono ?? null,
        direccion: d.direccion,
        items,
        total: d.pedido?.Factura?.total != null ? Number(d.pedido.Factura.total) : totalItems,
      };
    }

    const entregasRestaurante = await prisma.domicilio.findMany({
      where: {
        estado: 'ENTREGADO',
        fecha_entrega: { gte: inicioHoy },
        id_repartidor: { not: null },
        ...(idRestaurante ? { pedido: { id_restaurante: idRestaurante } } : {}),
      },
      select: { id_repartidor: true, usuario: { select: { nombre: true, apellido: true } } },
    });
    const conteo = new Map();
    for (const e of entregasRestaurante) {
      const previo = conteo.get(e.id_repartidor);
      if (previo) previo.entregas += 1;
      else {
        const nombre = [e.usuario?.nombre, e.usuario?.apellido].filter(Boolean).join(' ') || 'Repartidor';
        conteo.set(e.id_repartidor, { id_usuario: e.id_repartidor, nombre, entregas: 1 });
      }
    }
    const top = [...conteo.values()].sort((a, b) => b.entregas - a.entregas).slice(0, 5);

    res.json({
      success: true,
      data: {
        ganancias_hoy: Math.round(gananciasHoy),
        entregas_hoy: entregadosHoy.length,
        cola,
        actual,
        top,
      },
    });
  } catch (err) {
    next(err);
  }
}
