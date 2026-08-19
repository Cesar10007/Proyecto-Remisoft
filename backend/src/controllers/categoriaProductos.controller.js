import prisma from '../config/db.js';

function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isNaN(id) ? null : id;
}

export async function index(req, res, next) {
  try {
    const categorias = await prisma.categoria_productos.findMany({
      orderBy: {
        id_categoria: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      data: categorias,
      count: categorias.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function show(req, res, next) {
  try {
    const idCategoria = parseId(req.params.id);

    if (idCategoria === null) {
      return res.status(400).json({
        success: false,
        message: 'ID de categoría inválido',
        code: 'INVALID_ID',
      });
    }

    const categoria = await prisma.categoria_productos.findUnique({
      where: {
        id_categoria: idCategoria,
      },
    });

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'No encontrada',
        code: 'NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: categoria,
    });
  } catch (error) {
    next(error);
  }
}

export async function store(req, res) {
  return res.status(501).json({
    success: false,
    message:
      'Las categorías se obtienen desde la tabla categoria_productos y no tienen CRUD independiente',
    code: 'CATEGORY_CRUD_NOT_SUPPORTED',
  });
}

export async function update(req, res) {
  return res.status(501).json({
    success: false,
    message:
      'Las categorías se obtienen desde la tabla categoria_productos y no tienen CRUD independiente',
    code: 'CATEGORY_CRUD_NOT_SUPPORTED',
  });
}

export async function destroy(req, res) {
  return res.status(501).json({
    success: false,
    message:
      'Las categorías se obtienen desde la tabla categoria_productos y no tienen CRUD independiente',
    code: 'CATEGORY_CRUD_NOT_SUPPORTED',
  });
}