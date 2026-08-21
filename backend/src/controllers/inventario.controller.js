import prisma from '../config/prisma.js';

/**
 * GET /api/inventario
 * Listar todo el inventario con ingredientes relacionados
 */
export async function index(req, res, next) {
  try {
    const { id_ingrediente, stock_minimo } = req.query;

    const where = {};

    if (id_ingrediente) {
      where.id_ingrediente = parseInt(id_ingrediente);
    }

    // Filtrar por stock bajo (opcional)
    if (stock_minimo === 'true') {
      const inventario = await prisma.inventario.findMany({
        where,
        include: {
          ingredientes: true
        }
      });
      
      // Filtrar manualmente los que tienen stock bajo
      const stockBajo = inventario.filter(item => 
        item.stock_actual <= (item.stock_minimo || 0)
      );

      return res.status(200).json({
        success: true,
        data: stockBajo,
        count: stockBajo.length,
        message: 'Mostrando items con stock bajo'
      });
    }

    const inventario = await prisma.inventario.findMany({
      where,
      include: {
        ingredientes: true
      }
    });

    res.status(200).json({
      success: true,
      data: inventario,
      count: inventario.length
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/inventario/:id
 * Obtener un item de inventario por ID
 */
export async function show(req, res, next) {
  try {
    const { id } = req.params;

    const item = await prisma.inventario.findUnique({
      where: { id_inventario: parseInt(id) },
      include: {
        ingredientes: true
      }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item de inventario no encontrado',
        code: 'NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/inventario
 * Crear un nuevo item de inventario
 */
export async function store(req, res, next) {
  try {
    const { id_ingrediente, stock_actual, stock_minimo, stock_maximo, ubicacion } = req.body;

    // Validaciones
    if (!id_ingrediente) {
      return res.status(400).json({
        success: false,
        message: 'El ID del ingrediente es requerido',
        code: 'MISSING_INGREDIENTE_ID'
      });
    }

    // Verificar que el ingrediente existe
    const ingrediente = await prisma.ingredientes.findUnique({
      where: { id_ingrediente: parseInt(id_ingrediente) }
    });

    if (!ingrediente) {
      return res.status(400).json({
        success: false,
        message: 'El ingrediente especificado no existe',
        code: 'INVALID_INGREDIENTE_ID'
      });
    }

    // Verificar que no ya existe inventario para este ingrediente
    const inventarioExistente = await prisma.inventario.findUnique({
      where: { id_ingrediente: parseInt(id_ingrediente) }
    });

    if (inventarioExistente) {
      return res.status(409).json({
        success: false,
        message: 'El ingrediente ya tiene un registro de inventario',
        code: 'DUPLICATE_INVENTORY'
      });
    }

    // Crear inventario
    const inventario = await prisma.inventario.create({
      data: {
        id_ingrediente: parseInt(id_ingrediente),
        stock_actual: stock_actual ? parseFloat(stock_actual) : 0,
        stock_minimo: stock_minimo ? parseFloat(stock_minimo) : 0,
        stock_maximo: stock_maximo ? parseFloat(stock_maximo) : null,
        ubicacion: ubicacion || null
      },
      include: {
        ingredientes: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Item de inventario creado exitosamente',
      data: inventario
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/inventario/:id
 * Actualizar un item de inventario
 */
export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { stock_actual, stock_minimo, stock_maximo, ubicacion } = req.body;

    // Verificar que existe
    const inventarioExistente = await prisma.inventario.findUnique({
      where: { id_inventario: parseInt(id) }
    });

    if (!inventarioExistente) {
      return res.status(404).json({
        success: false,
        message: 'Item de inventario no encontrado',
        code: 'NOT_FOUND'
      });
    }

    // Actualizar
    const inventario = await prisma.inventario.update({
      where: { id_inventario: parseInt(id) },
      data: {
        stock_actual: stock_actual !== undefined ? parseFloat(stock_actual) : undefined,
        stock_minimo: stock_minimo !== undefined ? parseFloat(stock_minimo) : undefined,
        stock_maximo: stock_maximo !== undefined ? parseFloat(stock_maximo) : undefined,
        ubicacion: ubicacion !== undefined ? ubicacion : undefined
      },
      include: {
        ingredientes: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Inventario actualizado exitosamente',
      data: inventario
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/inventario/:id
 * Eliminar un item de inventario
 */
export async function destroy(req, res, next) {
  try {
    const { id } = req.params;

    // Verificar que existe
    const inventario = await prisma.inventario.findUnique({
      where: { id_inventario: parseInt(id) }
    });

    if (!inventario) {
      return res.status(404).json({
        success: false,
        message: 'Item de inventario no encontrado',
        code: 'NOT_FOUND'
      });
    }

    // Eliminar
    await prisma.inventario.delete({
      where: { id_inventario: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Item de inventario eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/inventario/:id/ajustar
 * Ajustar stock (positivo o negativo) con razón
 */
export async function ajustarStock(req, res, next) {
  try {
    const { id } = req.params;
    const { cantidad, razon, tipo_ajuste } = req.body;

    // Validaciones
    if (!cantidad || typeof cantidad !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'La cantidad es requerida y debe ser un número',
        code: 'MISSING_CANTIDAD'
      });
    }

    if (!tipo_ajuste || !['entrada', 'salida', 'ajuste', 'merma'].includes(tipo_ajuste)) {
      return res.status(400).json({
        success: false,
        message: 'El tipo de ajuste debe ser: entrada, salida, ajuste o merma',
        code: 'INVALID_TIPO_AJUSTE'
      });
    }

    // Verificar que existe
    const inventario = await prisma.inventario.findUnique({
      where: { id_inventario: parseInt(id) },
      include: { ingredientes: true }
    });

    if (!inventario) {
      return res.status(404).json({
        success: false,
        message: 'Item de inventario no encontrado',
        code: 'NOT_FOUND'
      });
    }

    // Calcular nuevo stock
    const stockActual = inventario.stock_actual || 0;
    const nuevoStock = tipo_ajuste === 'salida' || tipo_ajuste === 'merma' 
      ? stockActual - Math.abs(cantidad) 
      : stockActual + Math.abs(cantidad);

    // Validar que no quede negativo
    if (nuevoStock < 0) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Actual: ${stockActual}, Requerido: ${Math.abs(cantidad)}`,
        code: 'INSUFFICIENT_STOCK'
      });
    }

    // Actualizar stock
    const inventarioActualizado = await prisma.inventario.update({
      where: { id_inventario: parseInt(id) },
      data: { stock_actual: nuevoStock },
      include: { ingredientes: true }
    });

    // TODO: Crear registro en ajuste_inventario para auditora
    // await prisma.ajuste_inventario.create({ ... })

    res.status(200).json({
      success: true,
      message: `Stock ajustado: ${stockActual} → ${nuevoStock}`,
      data: {
        inventario: inventarioActualizado,
        ajuste: {
          cantidad,
          tipo: tipo_ajuste,
          razon: razon || null,
          stock_anterior: stockActual,
          stock_nuevo: nuevoStock
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/inventario/alertas/stock-bajo
 * Obtener alertas de stock bajo
 */
export async function stockBajo(req, res, next) {
  try {
    const inventario = await prisma.inventario.findMany({
      where: {
        stock_actual: {
          lte: prisma.inventario.fields.stock_minimo
        }
      },
      include: {
        ingredientes: true
      },
      orderBy: {
        stock_actual: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      data: inventario,
      count: inventario.length,
      message: `${inventario.length} items con stock bajo`
    });
  } catch (error) {
    next(error);
  }
}
