import prisma from '../config/prisma.js';
import { parseId } from '../utils/validation.js';

// GET /api/categorias
export async function index(req, res, next) {
  try {
    const categorias = await prisma.categoria_productos.findMany({
      where: req.sede,
      orderBy: { nombre: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: categorias,
      count: categorias.length,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/categorias/:id
export async function show(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        success: false,
        message: 'El id de la categoría debe ser un número entero válido.',
        code: 'INVALID_ID',
      });
    }

    const categoria = await prisma.categoria_productos.findUnique({
      where: { id_categoria: id, ...req.sede },
    });

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada.',
        code: 'NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      data: categoria,
    });
  } catch (err) {
    next(err);
  }
}
