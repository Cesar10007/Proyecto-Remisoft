import prisma from '../config/db.js';

/**
 * GET /api/facturas
 * Listar todas las facturas con sus pedidos relacionados
 */
export async function index(req, res, next) {
  try {
    const facturas = await prisma.Factura.findMany({
      orderBy: { id_factura: 'desc' },
      include: {
        pedidos: true // Relacin con pedidos
      }
    });

    res.status(200).json({
      success: true,
      data: facturas,
      count: facturas.length
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/facturas/:id
 * Obtener una factura por ID
 */
export async function show(req, res, next) {
  try {
    const { id } = req.params;

    const factura = await prisma.Factura.findUnique({
      where: { id_factura: parseInt(id) },
      include: {
        pedidos: true
      }
    });

    if (!factura) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada',
        code: 'NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: factura
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/facturas
 * Crear una nueva factura
 */
export async function store(req, res, next) {
  try {
    const { id_pedido, Fecha_emision } = req.body;

    // Validaciones básicas
    if (!id_pedido) {
      return res.status(400).json({
        success: false,
        message: 'El ID del pedido es requerido',
        code: 'MISSING_PEDIDO_ID'
      });
    }

    // Verificar que el pedido existe
    const pedido = await prisma.pedidos.findUnique({
      where: { id_pedido: parseInt(id_pedido) }
    });

    if (!pedido) {
      return res.status(400).json({
        success: false,
        message: 'El pedido especificado no existe',
        code: 'INVALID_PEDIDO_ID'
      });
    }

    // Verificar que el pedido no ya tenga factura
    const facturaExistente = await prisma.Factura.findUnique({
      where: { id_pedido: parseInt(id_pedido) }
    });

    if (facturaExistente) {
      return res.status(409).json({
        success: false,
        message: 'El pedido ya tiene una factura asociada',
        code: 'DUPLICATE_INVOICE'
      });
    }

    // Crear la factura
    const factura = await prisma.Factura.create({
      data: {
        id_pedido: parseInt(id_pedido),
        Fecha_emision: Fecha_emision ? new Date(Fecha_emision) : new Date()
      },
      include: {
        pedidos: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Factura creada exitosamente',
      data: factura
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/facturas/:id
 * Actualizar una factura existente
 */
export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { Fecha_emision } = req.body;

    // Verificar que la factura existe
    const facturaExistente = await prisma.Factura.findUnique({
      where: { id_factura: parseInt(id) }
    });

    if (!facturaExistente) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada',
        code: 'NOT_FOUND'
      });
    }

    // Actualizar
    const factura = await prisma.Factura.update({
      where: { id_factura: parseInt(id) },
      data: {
        Fecha_emision: Fecha_emision ? new Date(Fecha_emision) : undefined
      },
      include: {
        pedidos: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Factura actualizada exitosamente',
      data: factura
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/facturas/:id
 * Eliminar una factura (solo borrado lógico - el pedido sigue existiendo)
 */
export async function destroy(req, res, next) {
  try {
    const { id } = req.params;

    // Verificar que la factura existe
    const factura = await prisma.Factura.findUnique({
      where: { id_factura: parseInt(id) }
    });

    if (!factura) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada',
        code: 'NOT_FOUND'
      });
    }

    // Eliminar la factura
    await prisma.Factura.delete({
      where: { id_factura: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Factura eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
}
