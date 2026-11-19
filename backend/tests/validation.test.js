import test from 'node:test'
import assert from 'node:assert/strict'
import { cantidadInventarioValida, esConflictoCorreo, validateEmail } from '../src/utils/validation.js'

test('validateEmail exige un valor cuando el campo es obligatorio', () => {
  assert.equal(validateEmail(undefined, { required: true }), 'El campo email es requerido')
})

test('validateEmail valida usando el máximo de caracteres del campo', () => {
  const email = `${'a'.repeat(55)}@b.co`

  assert.equal(validateEmail(email, { required: true, maxLength: 60, field: 'Email' }), null)
  assert.equal(
    validateEmail(`${'a'.repeat(56)}@b.co`, { required: true, maxLength: 60, field: 'Email' }),
    'El campo Email no puede superar 60 caracteres',
  )
})

test('validateEmail normaliza espacios externos al validar', () => {
  assert.equal(validateEmail('  usuario@ejemplo.com  ', { required: true }), null)
})

test('solo una clave única de correo se trata como correo inválido', () => {
  const prisma = target => ({ code: 'P2002', meta: { target } })
  const mariadb = index => ({ code: 'P2002', meta: { driverAdapterError: { cause: { constraint: { index } } } } })
  assert.equal(esConflictoCorreo(prisma(['id_restaurante', 'Email'])), true)
  assert.equal(esConflictoCorreo(prisma('usuario.email')), true)
  assert.equal(esConflictoCorreo(mariadb('solicitud_registro_email_unique')), true)
  assert.equal(esConflictoCorreo({ code: 'P2002', meta: { modelName: 'Cliente' } }), true)
  assert.equal(esConflictoCorreo({ code: 'P2002', meta: { modelName: 'mesa' } }), false)
  assert.equal(esConflictoCorreo(prisma(['id_restaurante', 'numero'])), false)
  assert.equal(esConflictoCorreo(mariadb('PRIMARY')), false)
  assert.equal(esConflictoCorreo({ code: 'P2003', meta: { target: ['email'] } }), false)
})

test('receta y ajustes aceptan únicamente cantidades positivas representables en DECIMAL(10,3)', () => {
  for (const n of [0.001, '0.001', 1.001, '9999999.999']) assert.equal(cantidadInventarioValida(n), true)
  for (const n of [0, -1, 0.0001, 10000000, '', null, NaN, true, [1]]) assert.equal(cantidadInventarioValida(n), false)
})

test('el conteo absoluto acepta cero sin permitir movimientos nulos ni redondear cantidades inválidas', () => {
  for (const valor of [0, '0', '0.000', '19.6', '19.625']) assert.equal(cantidadInventarioValida(valor, { permitirCero: true }), true)
  for (const valor of ['', ' ', null, false, -1, '0.0001', '10000000']) assert.equal(cantidadInventarioValida(valor, { permitirCero: true }), false)
  assert.equal(cantidadInventarioValida('0.000'), false)
})
