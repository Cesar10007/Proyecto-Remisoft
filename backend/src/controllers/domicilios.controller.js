import prisma from '../config/db.js';

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
