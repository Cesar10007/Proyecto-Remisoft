import { randomUUID } from 'node:crypto'
import { expect, type Page } from '@playwright/test'

export async function entrar(page: Page, email: string, clave: string) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).first().click()
  await page.getByLabel('Correo electrónico').fill(email)
  await page.locator('#login-password').fill(clave)
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click()
}

// Arranca con el superadmin de la BD de prueba; el resto se da de alta desde la interfaz.
export async function iniciarSedeNueva(page: Page) {
  const id = randomUUID().slice(0, 8)
  const email = `gerente-${id}@example.test`
  const clave = `Nueva!9${id}`
  const boton = (name: string) => page.getByRole('button', { name, exact: true })
  await entrar(page, 'carlos.ramirez@resto.com', '123456')
  await boton('Gestión de Gerentes').click()
  await page.getByRole('button', { name: /Agregar gerente/ }).click()
  const alta = page.getByRole('dialog', { name: 'Agregar gerente' })
  await alta.getByLabel('Nombre *', { exact: true }).fill('Gerente de prueba')
  await alta.getByLabel('Correo electrónico *').fill(email)
  await alta.getByLabel('Nombre Establecimiento *').fill(`Sede ${id}`)
  await alta.getByLabel('Contraseña *', { exact: true }).fill(clave)
  await alta.getByRole('button', { name: 'Crear gerente' }).click()
  await expect(page.getByText(email, { exact: true })).toBeVisible()
  await boton('Cerrar sesión').click()
  await entrar(page, email, clave)
  await expect(page.getByText(`Establecimiento: Sede ${id}`)).toBeVisible()
  return { id, clave }
}
