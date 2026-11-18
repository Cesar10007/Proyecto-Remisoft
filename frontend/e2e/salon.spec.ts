import { test, expect, type Page } from '@playwright/test'

// Los dos primeros recorridos usan datos reales y pueden registrar un consumo y una factura de demostración.
// Usar únicamente con la base de prueba sembrada; no se ejecuta por defecto.
test.skip(process.env.SALON_E2E !== '1', 'Requiere la demo con un turno abierto de Andrés.')

async function entrar(page: Page, email: string) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).first().click()
  await page.getByLabel('Correo electrónico').fill(email)
  await page.locator('#login-password').fill('123456')
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click()
}

test('desde una mesa libre hasta el comprobante del cajero en el celular del mesero', async ({
  page,
  browser,
}) => {
  await entrar(page, 'sofia.martinez@resto.com')
  await expect(page.getByRole('heading', { name: 'Sala de Comedor Principal' })).toBeVisible()
  const libre = page.getByRole('button', { name: /^Mesa \d+, Disponible\. Ver mesa$/ }).last()
  await expect(libre).toBeVisible()
  const mesa = (await libre.getAttribute('aria-label'))!.split(',')[0]
  const boton = (name: string) => page.getByRole('button', { name, exact: true })
  const detalle = page.getByRole('dialog')
  const ficha = page.getByRole('dialog', { name: mesa, exact: true })
  const disponible = boton(`${mesa}, Disponible. Ver mesa`)
  const mesaOcupada = boton(`${mesa}, Ocupada. Ver mesa`)
  // Ver y cerrar la ficha no abre un editor, no crea pedidos ni ocupa la mesa.
  await disponible.click()
  await expect(ficha.getByText('Sin pedidos abiertos.')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(disponible).toBeFocused()
  await disponible.click()
  await ficha.getByLabel('Comensales a sentar').fill('2')
  await boton('Ocupar mesa').click()
  await expect(ficha.getByText('Ocupada', { exact: true })).toBeVisible()
  await page.reload()
  await mesaOcupada.click()
  await expect(ficha.getByText('Sin pedidos abiertos.')).toBeVisible()
  await boton('Liberar mesa').click()
  await expect(ficha.getByText('Disponible', { exact: true })).toBeVisible()
  await ficha.getByLabel('Comensales a sentar').fill('3')
  await boton('Ocupar mesa').click()
  await boton('Tomar pedido').click()
  await expect(detalle.getByLabel('Mesa', { exact: true })).toBeDisabled()
  await expect(detalle.getByLabel('Comensales', { exact: true })).toHaveValue('3')
  await boton('Volver').click()
  await expect(ficha).toBeVisible()
  await boton('Tomar pedido').click()
  await expect(boton('Enviar a cocina')).toBeDisabled()
  await boton('Agregar Hamburguesa Clásica').click()
  await boton('Sumar Hamburguesa Clásica').click()
  await page.getByLabel('Indicaciones para Hamburguesa Clásica').fill('Sin cebolla')
  await boton('Enviar a cocina').click()
  await boton('Editar comanda').click()
  await boton('Restar Hamburguesa Clásica').click()
  await boton('Guardar cambios').click()
  await expect(detalle.getByText('1 × Hamburguesa Clásica')).toBeVisible()
  const pedido = (await detalle.innerText()).match(/Pedido #(\d+)/i)![1]
  await boton('Cerrar ventana').click()
  await page.reload()
  await expect(mesaOcupada).toBeVisible()

  // Cocina ya recibe las líneas guardadas. Solo el mesero marca la entrega en el salón.
  async function prepararYServir(plato: string) {
    await page.getByRole('link', { name: 'Cocina', exact: true }).click()
    const comanda = page
      .getByRole('article')
      .filter({ hasText: `Pedido #${pedido} ·` })
      .filter({ hasText: plato })
    await comanda.getByRole('button', { name: 'Empezar' }).click()
    await comanda.getByRole('button', { name: 'Marcar listo' }).click()
    await page.getByRole('link', { name: 'Volver al salón' }).click()
    await mesaOcupada.click()
    await expect(boton('Editar comanda')).toHaveCount(0)
    await boton('Marcar servido').click()
    await expect(boton('Enviar a caja')).toBeEnabled()
  }
  await prepararYServir('Hamburguesa Clásica')
  await boton('Añadir ronda').click()
  await boton('Agregar Limonada Natural').click()
  await boton('Enviar ronda').click()
  await expect(detalle.getByText('1 × Limonada Natural')).toBeVisible()
  await boton('Cerrar ventana').click()
  await prepararYServir('Limonada Natural')
  const total = await detalle
    .locator('dl')
    .getByText('Total', { exact: true })
    .locator('..')
    .locator('dd')
    .innerText()
  await boton('Enviar a caja').click()
  await boton('Confirmar').click()
  await expect(detalle.getByText('Cuenta en caja. La mesa sigue ocupada', { exact: false })).toBeVisible()
  await boton('Cerrar ventana').click()
  await expect(mesaOcupada).toContainText('En caja')
  await mesaOcupada.click()
  await expect(ficha.getByText('Ocupada', { exact: true })).toBeVisible()
  await expect(boton('Liberar mesa')).toHaveCount(0)

  const caja = await browser.newPage()
  try {
    await entrar(caja, 'andres.torres@resto.com')
    await caja.getByRole('button', { name: new RegExp(`Pedido #${pedido} ·`) }).click()
    await caja.getByRole('button', { name: /Tarjeta/i }).click()
    await caja.getByRole('button', { name: /Cerrar cuenta y facturar/ }).click()
    const comprobante = caja.locator('#comprobante h2')
    await expect(comprobante).toContainText('FAC-')
    const numero = (await comprobante.innerText()).replace(/^Factura /, '')
    // Se refresca la misma ficha: el pago cierra la cuenta, no el modal.
    await expect(ficha.getByText('Disponible', { exact: true })).toBeVisible({ timeout: 15_000 })
    await expect(ficha.getByText('Sin pedidos abiertos.')).toBeVisible()
    await boton('Cerrar ventana').click()
    await page.setViewportSize({ width: 390, height: 844 })
    await disponible.click()
    await expect(ficha.getByRole('button', { name: 'Ocupar mesa' })).toBeVisible()
    expect(await ficha.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)
    await boton('Cerrar ventana').click()
    await boton('Abrir menú').click()
    await boton('Facturas').click()
    await page.getByRole('button', { name: new RegExp(numero) }).click()
    await expect(detalle.getByText('1 × Hamburguesa Clásica')).toBeVisible()
    await expect(detalle.getByText('1 × Limonada Natural')).toBeVisible()
    await expect(detalle.getByText(total, { exact: true })).toBeVisible()
    await page.emulateMedia({ media: 'print' })
    await expect(detalle).toBeVisible()
    await expect(page.getByRole('main')).toBeHidden()
  } finally {
    await caja.close()
  }
})

test('tomar y cancelar un pedido pendiente desde la misma ficha en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await entrar(page, 'sofia.martinez@resto.com')
  const primera = page.getByRole('button', { name: /^Mesa \d+, Disponible\. Ver mesa$/ }).first()
  const mesa = (await primera.getAttribute('aria-label'))!.split(',')[0]
  await primera.click()
  const ficha = page.getByRole('dialog', { name: mesa, exact: true })
  await ficha.getByLabel('Comensales a sentar').fill('2')
  await ficha.getByRole('button', { name: 'Tomar pedido' }).click()
  const editor = page.getByRole('dialog', { name: 'Nuevo pedido' })
  await expect(editor.getByLabel('Comensales', { exact: true })).toHaveValue('2')
  await editor.getByRole('button', { name: 'Agregar Limonada Natural' }).click()
  await editor.getByRole('button', { name: 'Enviar a cocina' }).click()
  await expect(ficha.getByText('1 × Limonada Natural')).toBeVisible()
  await expect(ficha.getByText('Ocupada', { exact: true })).toBeVisible()
  await expect(ficha.getByRole('button', { name: 'Liberar mesa' })).toHaveCount(0)
  await ficha.getByRole('button', { name: 'Cancelar pedido' }).click()
  await ficha.getByRole('button', { name: 'Confirmar' }).click()
  await expect(ficha.getByText('Disponible', { exact: true })).toBeVisible()
  await expect(ficha.getByText('Sin pedidos abiertos.')).toBeVisible()
})

// Regresión de la pantalla de la captura: un caso histórico difícil de obtener
// desde el editor actual (dos pedidos, de distintos meseros, en una misma mesa).
test('toda la tarjeta abre una sola ficha con TODOS sus pedidos, sin escribir al consultar', async ({
  page,
}) => {
  const pedido = {
    id_pedido: 41,
    mesa: 1,
    estado: 'ENTREGADO',
    nombre_mesero: 'Valentina',
    notas: '',
    comensales: null,
    fecha_hora: null,
    items: [
      {
        id_detalle: 71,
        id_producto: 4,
        nombre: 'Pasta Carbonara',
        estado: 'ENTREGADO',
        cantidad: 2,
        precio_unitario: 24000,
        subtotal: 48000,
        nota: 'Sin queso',
      },
    ],
    subtotal: 48000,
    iva: 9120,
    total: 57120,
  }
  const segundo = {
    ...pedido,
    id_pedido: 42,
    nombre_mesero: 'Sofía',
    items: [
      {
        ...pedido.items[0],
        id_detalle: 72,
        nombre: 'Sopa del Día',
        precio_unitario: 9000,
        cantidad: 1,
        subtotal: 9000,
        estado: 'LISTO',
        nota: '',
      },
    ],
    subtotal: 9000,
    iva: 1710,
    total: 10710,
  }
  const mesa = {
    numero: 1,
    capacidad: 4,
    ocupada: true,
    mesero: 'Valentina',
    comensales: null,
    fecha_hora: null,
    atencion: null,
    cuentas: [pedido, segundo],
  }
  const otras = [
    { ...mesa, numero: 2, ocupada: false, mesero: null, cuentas: [] },
    {
      ...mesa,
      numero: 3,
      cuentas: [{ ...pedido, mesa: 3, id_pedido: 43, items: [], subtotal: 0, iva: 0, total: 0 }],
    },
  ]
  await page.route('**/api/salon', (r) =>
    r.fulfill({
      json: {
        mesas: [mesa, ...otras],
        pedidos: [{ ...segundo, version: 0, pago_registrado: false, id_cliente: null, cliente: '' }],
        sede: 'Comedor de prueba',
        tasa_iva: 0.19,
      },
    }),
  )
  const escrituras: string[] = []
  page.on('request', (r) => {
    if (r.method() !== 'GET' && /\/api\/(salon|pedidos|mesas|cocina)/.test(r.url()))
      escrituras.push(r.method() + ' ' + r.url())
  })
  await entrar(page, 'sofia.martinez@resto.com')
  await expect(page.getByRole('heading', { name: 'Mesas', exact: true })).toBeVisible()
  const tarjeta = (n: string, estado: string) =>
    page.getByRole('button', { name: `Mesa ${n}, ${estado}. Ver mesa`, exact: true })
  await tarjeta('01', 'Ocupada').getByText('•••').click()
  const ficha = page.getByRole('dialog', { name: 'Mesa 01', exact: true })
  await expect(ficha.getByText('Ocupada', { exact: true })).toBeVisible()
  await expect(ficha.getByRole('article')).toHaveCount(2)
  await expect(ficha.getByText('2 × Pasta Carbonara')).toBeVisible()
  await expect(ficha.getByText('1 × Sopa del Día')).toBeVisible()
  await expect(ficha.getByText('$67.830')).toBeVisible()
  await expect(ficha.getByRole('button', { name: 'Gestionar pedido #41' })).toHaveCount(0)
  await ficha.getByRole('button', { name: 'Gestionar pedido #42' }).click()
  await page.getByRole('button', { name: 'Volver a todos los pedidos de la mesa' }).click()
  await expect(ficha.getByRole('article')).toHaveCount(2)
  await page.keyboard.press('Escape')
  await tarjeta('02', 'Disponible').focus()
  await page.keyboard.press('Enter')
  const vacia = page.getByRole('dialog', { name: 'Mesa 02', exact: true })
  await expect(vacia.getByText('Disponible', { exact: true })).toBeVisible()
  await expect(vacia.getByText('Sin pedidos abiertos.')).toBeVisible()
  await expect(vacia.getByRole('article')).toHaveCount(0)
  await page.mouse.click(2, 2)
  await expect(vacia).toHaveCount(0)
  await tarjeta('03', 'Ocupada').click()
  await expect(page.getByRole('dialog').getByText('Este pedido aún no tiene artículos.')).toBeVisible()
  expect(escrituras).toEqual([])
})
