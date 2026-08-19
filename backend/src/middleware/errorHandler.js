/**
 * Middleware centralizado de manejo de errores para Express.
 * Captura errores de Prisma (P2002, P2003, P2025) y errores genricos,
 * respondiendo con estructura consistente: { success: false, message: string, code?: string }
 */

export default function errorHandler(err, req, res, next) {
  console.error('[ErrorHandler]', err);

  // Error de Prisma: registro duplicado (P2002)
  if (err.code === 'P2002') {
    const field = err.meta?.target ? err.meta.target.join(', ') : 'campo';
    return res.status(409).json({
      success: false,
      message: `Ya existe un registro con ese ${field}`,
      code: 'DUPLICATE_ENTRY'
    });
  }

  // Error de Prisma: FK invlida / registro relacionado (P2003)
  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'No se puede eliminar/actualizar: hay registros relacionados',
      code: 'FOREIGN_KEY_CONSTRAINT'
    });
  }

  // Error de Prisma: registro no encontrado (P2025)
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro no encontrado',
      code: 'NOT_FOUND'
    });
  }

  // Error genrico: si ya tiene status, usarlo; si no, 500
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    code: err.code || 'INTERNAL_ERROR'
  });

  next();
}
