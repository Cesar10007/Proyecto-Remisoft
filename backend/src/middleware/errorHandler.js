export default function errorHandler(err, req, res, next) {
  console.error('[ErrorHandler]', err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.code === 'P2002') {
    const field = err.meta?.target ? err.meta.target.join(', ') : 'campo';

    return res.status(409).json({
      success: false,
      message: `Ya existe un registro con ese ${field}`,
      code: 'DUPLICATE_ENTRY',
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'No se puede completar la operación porque existen registros relacionados',
      code: 'FOREIGN_KEY_CONSTRAINT',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro no encontrado',
      code: 'NOT_FOUND',
    });
  }

  const status = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  return res.status(status).json({
    success: false,
    message: isProduction
      ? 'Error interno del servidor'
      : err.message || 'Error interno del servidor',
    code: isProduction ? 'INTERNAL_ERROR' : err.code || 'INTERNAL_ERROR',
  });
}