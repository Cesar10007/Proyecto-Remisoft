// backend/src/utils/validation.js
export function parseId(id) {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function validateString(value, field, max, required = false) {
  if (required && (!value || value.trim() === '')) {
    return `El campo ${field} es requerido`;
  }
  if (value && typeof value !== 'string') {
    return `El campo ${field} debe ser texto`;
  }
  if (value && value.length > max) {
    return `El campo ${field} no puede superar ${max} caracteres`;
  }
  return null;
}

export function validateEmail(value) {
  if (!value) return null;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(value) ? null : 'El campo email debe ser un correo válido';
}