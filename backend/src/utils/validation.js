// El mismo mensaje público se usa para el formato y para los conflictos de correo.
export const CORREO_INVALIDO = 'Correo inválido, verifique que esté bien escrito o ingrese otro.';

// Si el adaptador solo informa el modelo, estas tablas no tienen otra clave de negocio.
// En Cliente, el índice del correo incluye también la sede.
const indicePorModelo = {
  usuario: 'email',
  cliente: 'cliente_sede_email_key',
  solicitud_registro: 'solicitud_registro_email_unique',
  users: 'users_email_unique',
};
const clavesCorreo = new Set(Object.values(indicePorModelo));

export function esConflictoCorreo(err) {
  if (err?.code !== 'P2002') return false;
  // Prisma puede identificar los campos; el adaptador MariaDB devuelve el índice.
  const constraint = err.meta?.driverAdapterError?.cause?.constraint;
  const claves = [err.meta?.target, constraint?.fields, constraint?.index]
    .flat().filter(clave => typeof clave === 'string' && clave);
  if (!claves.length) return Object.hasOwn(indicePorModelo, err.meta?.modelName?.toLowerCase());
  return claves.some(clave => clavesCorreo.has(clave.toLowerCase().split('.').at(-1)));
}

export function parseId(id) {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function validateString(value, field, max, required = false) {
  const isString = typeof value === 'string';
  const trimmed = isString ? value.trim() : value;

  if (required && (trimmed === undefined || trimmed === null || trimmed === '')) {
    return `El campo ${field} es requerido`;
  }
  if (value !== undefined && value !== null && !isString) {
    return `El campo ${field} debe ser texto`;
  }
  if (isString && trimmed.length > max) {
    return `El campo ${field} no puede superar ${max} caracteres`;
  }
  return null;
}

export function validateEmail(
  value,
  { required = false, maxLength = 100, field = 'email' } = {},
) {
  const isString = typeof value === 'string';
  const trimmed = isString ? value.trim() : value;

  if (required && (trimmed === undefined || trimmed === null || trimmed === '')) {
    return `El campo ${field} es requerido`;
  }
  if (trimmed === undefined || trimmed === null || trimmed === '') {
    return null;
  }
  if (!isString) {
    return `El campo ${field} debe ser texto`;
  }
  if (trimmed.length > maxLength) {
    return `El campo ${field} no puede superar ${maxLength} caracteres`;
  }
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(trimmed) ? null : CORREO_INVALIDO;
}

// Receta.Cantidad_necesaria e inventario_mov.cantidad son DECIMAL(10,3).
export function cantidadInventarioValida(valor, { permitirCero = false } = {}) {
  return ['number', 'string'].includes(typeof valor) && /^\d{1,7}(?:\.\d{1,3})?$/.test(String(valor)) && (permitirCero || Number(valor) > 0);
}
