import prisma from '../config/prisma.js'

export async function listarRestaurantes(req, res, next) {
  try {
    const restaurantes = await prisma.restaurante.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        nombre: 'asc',
      },
      select: {
        id_restaurante: true,
        nombre: true,
        direccion: true,
        telefono: true,
        email: true,
        activo: true,
      },
    })

    return res.json({
      success: true,
      data: restaurantes,
    })
  } catch (err) {
    next(err)
  }
}