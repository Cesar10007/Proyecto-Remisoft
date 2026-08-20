import prisma from '../config/prisma.js';

export async function index(req, res, next) {
  try {
    const items = await prisma.rol.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function store(req, res, next) {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nombre requerido',
        code: 'MISSING_NAME',
      });
    }

    const item = await prisma.rol.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Creado',
      data: item,
    });
  } catch (error) {
    next(error);
  }
}

export async function show(req, res, next) {
  try {
    const { id } = req.params;
    const idRol = Number.parseInt(id, 10);

    if (Number.isNaN(idRol)) {
      return res.status(400).json({
        success: false,
        message: 'ID de rol inválido',
        code: 'INVALID_ID',
      });
    }

    const item = await prisma.rol.findUnique({
      where: {
        id_rol: idRol,
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'No encontrado',
        code: 'NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const idRol = Number.parseInt(id, 10);
    const { nombre, descripcion } = req.body;

    if (Number.isNaN(idRol)) {
      return res.status(400).json({
        success: false,
        message: 'ID de rol inválido',
        code: 'INVALID_ID',
      });
    }

    const data = {};

    if (nombre !== undefined) {
      if (!nombre || !nombre.trim()) {
        return res.status(400).json({
          success: false,
          message: 'El nombre no puede estar vacío',
          code: 'INVALID_NAME',
        });
      }

      data.nombre = nombre.trim();
    }

    if (descripcion !== undefined) {
      data.descripcion = descripcion || null;
    }

    const item = await prisma.rol.update({
      where: {
        id_rol: idRol,
      },
      data,
    });

    res.status(200).json({
      success: true,
      message: 'Actualizado',
      data: item,
    });
  } catch (error) {
    next(error);
  }
}

export async function destroy(req, res, next) {
  try {
    const { id } = req.params;
    const idRol = Number.parseInt(id, 10);

    if (Number.isNaN(idRol)) {
      return res.status(400).json({
        success: false,
        message: 'ID de rol inválido',
        code: 'INVALID_ID',
      });
    }

    await prisma.rol.delete({
      where: {
        id_rol: idRol,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Eliminado',
    });
  } catch (error) {
    next(error);
  }
}