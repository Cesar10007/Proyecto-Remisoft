import { test, expect, type Locator } from '@playwright/test'
import { iniciarSedeNueva } from './helpers/sede'

test.skip(process.env.ESTABLECIMIENTO_E2E !== '1', 'Solo para una base desechable con el superadmin de demostración.')

// Ambas altas hacen POST a la API real. Para reintentar solo se modifica el correo.
async function comprobarYCorregirCorreo(form: Locator) {
  const correo = form.locator('input[type=email]')
  const nuevo = await correo.inputValue()
  await correo.fill('CARLOS.RAMIREZ@RESTO.COM')
  await form.locator('button[type=submit]').click()
  const aviso = form.getByRole('alert')
  await expect(aviso).toHaveText('Correo inválido, verifique que esté bien escrito o ingrese otro.')
  await expect(aviso).toBeInViewport({ ratio: 1 })
  await correo.fill(nuevo)
  await expect(aviso).toHaveCount(0)
}

test('altas de gerente y personal: se puede corregir el correo y la sede empieza sin datos ajenos', async ({ page }) => {
  const boton = (name: string) => page.getByRole('button', { name, exact: true })
  const errores: string[] = []
  page.on('pageerror', e => errores.push(e.message))
  const { id, clave } = await iniciarSedeNueva(page, comprobarYCorregirCorreo)
  await expect(page.getByText(/Sin ventas registradas hoy/)).toBeVisible()
  await expect(page.getByText(/Sin alertas de stock/)).toBeVisible()
  await expect(page.getByText('Sin productos', { exact: true })).toBeVisible()
  await boton('Notificaciones').click()
  await expect(page.getByRole('dialog', { name: 'Alertas de inventario' })).toContainText('No hay ingredientes')
  await page.keyboard.press('Escape')
  await boton('Procedimiento').click()
  await expect(page.getByText('Sin productos', { exact: true })).toBeVisible()

  for (const [seccion, mensaje] of [
    ['Inventario', 'No hay ingredientes disponibles'], ['Pedidos', 'No hay pedidos en curso.'],
    ['Finanzas', 'No hay transacciones recientes'], ['Mesas', 'No hay mesas registradas para este establecimiento.'],
    ['IA Insights', 'No hay análisis de IA registrados para este establecimiento.'], ['Historial', 'No hay actividad registrada.'],
    ['Flujo de Caja', 'No hay cajas disponibles'], ['Turnos', 'No hay turnos registrados.'],
    ['Proveedores', 'No hay proveedores disponibles'], ['Personal', 'No hay personal registrado'],
  ]) {
    await boton(seccion).click()
    await expect(page.getByText(mensaje, { exact: true })).toBeVisible()
  }
  await boton('Menú').click()
  await boton('+ Nuevo Producto').click()
  await page.getByPlaceholder('Nombre *', { exact: true }).fill(`Producto ${id}`)
  await page.getByPlaceholder('Precio *').fill('12000')
  await boton('Crear').click()
  await expect(page.getByText(`Producto ${id}`, { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText(`Producto ${id}`, { exact: true })).toBeVisible()
  await expect(page.getByText('Hamburguesa Clásica', { exact: true })).toHaveCount(0)

  await boton('Inventario').click()
  await boton('+ Nuevo Ingrediente').click()
  await page.getByLabel('Nombre', { exact: true }).fill(`Ingrediente ${id}`)
  await boton('Crear').click()
  await expect(page.getByText(`Ingrediente ${id}`, { exact: true })).toBeVisible()
  await boton('Notificaciones').click()
  const campana = page.getByRole('dialog', { name: 'Alertas de inventario' })
  await expect(campana).toContainText(`Ingrediente ${id}`)
  await expect(campana).not.toContainText('Pechuga de Pollo')
  await page.keyboard.press('Escape')

  // Una lectura fallida no equivale a una sede sin registros.
  await page.route('**/api/ia', route => route.fulfill({ status: 503, json: { message: 'No disponible' } }))
  await boton('IA Insights').click()
  await expect(page.getByRole('alert')).toContainText('No se pudieron cargar los análisis')
  await expect(page.getByText(/No hay análisis de IA/)).toHaveCount(0)
  await page.unroute('**/api/ia')
  await boton('Reintentar').click()
  await expect(page.getByText(/No hay análisis de IA/)).toBeVisible()
  await boton('Personal').click()
  const form = page.locator('form').filter({ has: boton('Crear Personal') })
  const email = `mesero-${id}@example.test`
  await form.getByLabel('Nombre', { exact: true }).fill('Juan')
  await form.getByLabel('Apellido').fill('Rojas')
  await form.getByLabel('Email').fill(email)
  await form.getByLabel('Rol').selectOption({ label: 'MESERO' })
  await form.getByLabel('Contraseña', { exact: true }).fill(clave)
  await comprobarYCorregirCorreo(form)
  await boton('Crear Personal').click()
  await expect(page.getByRole('row').filter({ hasText: email })).toContainText('Juan Rojas')
  expect(errores).toEqual([])
})
