import prisma from '../config/prisma.js';
import { filtroRestaurante } from '../utils/restaurante.js';
import { parseId } from '../utils/validation.js';

// Se ejecuta DESPUÉS de autenticar y solo en las rutas de negocio. Un gerente
// no puede elegir su sede mediante query, cabeceras ni campos del formulario.
export async function contextoEstablecimiento(req, res, next) {
  try {
    if (req.user.rol === 'SUPERADMIN' && req.query.id_restaurante !== undefined) {
      const id = parseId(req.query.id_restaurante);
      if (!id || !await prisma.restaurante.findUnique({ where: { id_restaurante: id }, select: { id_restaurante: true } })) {
        return res.status(422).json({ message: 'Establecimiento no válido.' });
      }
      req.user = { ...req.user, id_restaurante: id };
    }
    req.sede = filtroRestaurante(req.user);
    if (!req.sede.id_restaurante && !['GET', 'HEAD'].includes(req.method)) {
      return res.status(422).json({ message: 'Selecciona un establecimiento con id_restaurante para esta operación.' });
    }
    next();
  } catch (err) { next(err); }
}
