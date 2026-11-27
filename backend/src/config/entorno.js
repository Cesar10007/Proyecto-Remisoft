// Validación del entorno en el arranque.
//
// Motivo: el repositorio tenía secretos por defecto (JWT_SECRET y las contraseñas
// de MariaDB), de modo que una instalación nueva firmaba tokens con un valor
// público. Ahora el compose no tiene valores por defecto y, además, el backend
// se niega a arrancar sin un secreto real.
//
// Se valida al arrancar (server.js), no al importar el módulo, para que las
// pruebas que importan app.js no dependan de variables de entorno.

const LARGO_MINIMO_SECRETO = 32

// Valores que han aparecido en el repositorio, en la documentación o en ejemplos.
const SECRETOS_DE_EJEMPLO = [
  'remisoft_jwt_secret',
  'cambiar_por_secreto_largo_y_aleatorio',
  'changeme',
  'cambiame',
  'secret',
  'jwt_secret',
]

function esVacio(valor) {
  return !valor || String(valor).trim() === ''
}

/**
 * Revisa las variables de entorno y devuelve los errores que impiden arrancar
 * y los avisos que conviene mostrar sin bloquear.
 *
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {{ errores: string[], avisos: string[] }}
 */
export function revisarEntorno(env = process.env) {
  const errores = []
  const avisos = []

  const secreto = esVacio(env.JWT_SECRET) ? '' : String(env.JWT_SECRET).trim()

  if (secreto === '') {
    errores.push('JWT_SECRET no está definido.')
  } else if (SECRETOS_DE_EJEMPLO.includes(secreto.toLowerCase())) {
    errores.push(
      'JWT_SECRET sigue usando un valor de ejemplo que está publicado en el repositorio.',
    )
  } else if (secreto.length < LARGO_MINIMO_SECRETO) {
    errores.push(
      `JWT_SECRET tiene ${secreto.length} caracteres; el mínimo es ${LARGO_MINIMO_SECRETO}.`,
    )
  }

  if (esVacio(env.DB_PASSWORD)) {
    avisos.push('DB_PASSWORD no está definida: sin base de datos el backend no operará.');
  }

  if (String(env.CARGAR_DEMO) === '1') {
    avisos.push(
      'CARGAR_DEMO=1: si la base está vacía se cargarán usuarios demo cuya contraseña es pública. Usa 0 fuera de práctica.',
    )
  }

  return { errores, avisos }
}

/**
 * Lanza un error con el detalle completo si el entorno no es seguro.
 * Los avisos se imprimen pero no bloquean el arranque.
 *
 * @param {NodeJS.ProcessEnv} [env]
 */
export function exigirEntorno(env = process.env) {
  const { errores, avisos } = revisarEntorno(env)

  for (const aviso of avisos) {
    console.warn(`[entorno] aviso: ${aviso}`)
  }

  if (errores.length > 0) {
    const detalle = errores.map((error) => `  - ${error}`).join('\n')
    const error = new Error(`Configuración de entorno no válida:\n${detalle}`)
    error.codigo = 'ENTORNO_INVALIDO'
    throw error
  }
}
