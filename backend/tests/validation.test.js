import test from 'node:test'
import assert from 'node:assert/strict'
import { validateEmail } from '../src/utils/validation.js'

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
