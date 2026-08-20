import prisma from '../config/prisma.js';

/**
 * GET /api/flujo-caja
 * Listar todos los movimientos de caja
 */
export async function index(req, res, next) {
  try {
    const { id_turno, fecha_desde, fecha_hasta } = req.query;

    const where = {};

    // Filtros opcionales
    if (id_turno) {
      where.id_turno = parseInt(id_turno);
    }

    if (fecha_desde || fecha_hasta) {
      where.fecha = {};
      if (fecha_desde) where.fecha.gte = new Date(fecha_desde);
      if (fecha_hasta) where.fecha.lte = new Date(fecha_hasta);
    }

    const movimientos = await prisma.flujo_caja.findMany({
      where,
      orderBy: { fecha: 'desc' },
      include: {
        turnos: true // Relacin con turnos
      }
    });

    res.status(200).json({
      success: true,
      data: movimientos,
      count: movimientos.length
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/flujo-caja/:id
 * Obtener un movimiento por ID
 */
export async function show(req, res, next) {
  try {
    const { id } = req.params;

    const movimiento = await prisma.flujo_caja.findUnique({
      where: { id_flujo: parseInt(id) },
      include: {
        turnos: true
      }
    });

    if (!movimiento) {
      return res.status(404).json({
        success: false,
        message: 'Movimiento de caja no encontrado',
        code: 'NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: movimiento
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/flujo-caja
 * Crear un nuevo movimiento de caja
 */
export async function store(req, res, next) {
  try {
    const { id_turno, fecha, monto, tipo, descripcion } = req.body;

    // Validaciones
    if (!id_turno) {
      return res.status(400).json({
        success: false,
        message: 'El ID del turno es requerido',
        code: 'MISSING_TURNO_ID'
      });
    }

    if (!tipo || !['ingreso', 'egreso'].includes(tipo.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'El tipo debe ser "ingreso" o "egreso"',
        code: 'INVALID_TIPO'
      });
    }

    // Verificar que el turno existe
    const turno = await prisma.turnos.findUnique({
      where: { id_turno: parseInt(id_turno) }
    });

    if (!turno) {
      return res.status(400).json({
        success: false,
        message: 'El turno especificado no existe',
        code: 'INVALID_TURNO_ID'
      });
    }

    // Crear movimiento
    const movimiento = await prisma.flujo_caja.create({
      data: {
        id_turno: parseInt(id_turno),
        fecha: fecha ? new Date(fecha) : new Date(),
        monto: monto ? parseFloat(monto) : 0,
        tipo: tipo.toLowerCase(),
        descripcion: descripcion || null
      },
      include: {
        turnos: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Movimiento de caja creado exitosamente',
      data: movimiento
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/flujo-caja/:id
 * Actualizar un movimiento de caja
 */
export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { fecha, monto, tipo, descripcion } = req.body;

    // Verificar que existe
    const movimientoExistente = await prisma.flujo_caja.findUnique({
      where: { id_flujo: parseInt(id) }
    });

    if (!movimientoExistente) {
      return res.status(404).json({
        success: false,
        message: 'Movimiento de caja no encontrado',
        code: 'NOT_FOUND'
      });
    }

    // Actualizar
    const movimiento = await prisma.flujo_caja.update({
      where: { id_flujo: parseInt(id) },
      data: {
        fecha: fecha ? new Date(fecha) : undefined,
        monto: monto ? parseFloat(monto) : undefined,
        tipo: tipo ? tipo.toLowerCase() : undefined,
        descripcion: descripcion !== undefined ? descripcion : undefined
      },
      include: {
        turnos: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Movimiento de caja actualizado exitosamente',
      data: movimiento
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/flujo-caja/:id
 * Eliminar un movimiento de caja
 */
export async function destroy(req, res, next) {
  try {
    const { id } = req.params;

    // Verificar que existe
    const movimiento = await prisma.flujo_caja.findUnique({
      where: { id_flujo: parseInt(id) }
    });

    if (!movimiento) {
      return res.status(404).json({
        success: false,
        message: 'Movimiento de caja no encontrado',
        code: 'NOT_FOUND'
      });
    }

    // Eliminar
    await prisma.flujo_caja.delete({
      where: { id_flujo: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Movimiento de caja eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
}
