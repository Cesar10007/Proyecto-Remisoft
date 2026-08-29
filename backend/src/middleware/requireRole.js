function normalizarRol(rol) {
  return typeof rol === 'string' ? rol.trim().toUpperCase() : '';
}

export function requireRole(...rolesPermitidos) {
  const roles = new Set(rolesPermitidos.map(normalizarRol).filter(Boolean));

  if (roles.size === 0) {
    throw new Error('');
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'No autenticado',
      });
    }

    const rolUsuario = normalizarRol(req.user.rol);

    if (!roles.has(rolUsuario)) {
      return res.status(403).json({
        message: 'No tienes permisos para realizar esta acción.',
      });
    }

    next();
  };
}