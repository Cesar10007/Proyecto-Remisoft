// backend/src/utils/validation.js

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
  return regex.test(trimmed) ? null : `El campo ${field} debe ser un correo válido`;
}