import { expect, test, type Locator, type Page } from '@playwright/test'
import { entrar } from './helpers/sede'

// Estas pruebas ejercitan los paneles reales, con respuestas locales: ni la
// presencia de filas ni la impresión de un comprobante dependen de la BD demo.
const cuenta = {
  id_pedido: 12, mesa: 1, items: [{ id_detalle: 1, nombre: 'Arepa', cantidad: 1, precio_unitario: 5000, subtotal: 5000 }],
  fecha_hora: '2026-11-18T12:00:00Z', subtotal: 5000, descuento: 0, propina: 0, iva: 950, total: 5950,
}
const lecturas: Record<string, unknown> = {
  usuarios: [{ id_usuario: 8, id_rol: 2, activo: 1, nombre: 'Lina', email: 'lina@example.test' }],
  inventario: { data: [{ id_ingrediente: 1, nombre: 'Maíz', unidad_medida: 'kg', stock_minimo: 1, stock_actual: 5 }] },
  proveedores: [{ id_proveedor: 1, nombre: 'Molino', nombre_contacto: 'Ana', telefono: '', email: '', direccion: '', nit: '', tipo_proveedor: '', estado: 'ACTIVO' }],
  cajas: [], 'productos/vista': [], mesas: { data: [] }, facturas: { data: [] },
  solicitudes: { data: [] }, 'inventario/alertas/stock-bajo': { data: [] },
  'reportes/ventas-diarias': { data: { dias: [], productos_top: [], total: { ingresos_brutos: 0, total_pedidos: 0, total_propinas: 0 } } },
  'reportes/pedidos-activos': { data: { pedidos_activos: 0 } },
  'cobro/pendientes': [cuenta],
}

test.beforeEach(async ({ page }) => {
  await page.route(url => url.pathname.startsWith('/api/'), route => {
    const ruta = new URL(route.request().url()).pathname.replace(/^\/api\//, '')
    if (route.request().method() === 'GET' && ruta in lecturas) return route.fulfill({ json: lecturas[ruta] })
    if (ruta === 'cobro/cerrar-cuenta') return route.fulfill({ json: { factura: {
      ...cuenta, consecutivo: 'FAC-12', metodo: 'TARJETA', fecha_emision: cuenta.fecha_hora,
    } } })
    return route.fulfill({ status: 404, json: { message: 'Ruta no prevista en la prueba' } })
  })
})

const boton = (page: Page, name: string) => page.getByRole('button', { name, exact: true })
async function abrirPanel(page: Page, rol: 'SUPERADMIN' | 'GERENTE' | 'CAJERO') {
  await page.route('**/api/auth/login', route => route.fulfill({ json: { rol, token: 'fixture-visual', user: { nombre: 'Prueba' } } }), { times: 1 })
  await entrar(page, 'visual@example.test', 'solo-prueba')
  await expect(page).toHaveURL(new RegExp(`/${rol.toLowerCase()}$`))
}
async function ir(page: Page, seccion: string) {
  if (await boton(page, 'Abrir menú').isVisible()) await boton(page, 'Abrir menú').click()
  await boton(page, seccion).click()
}

// Contraste del texto sobre el fondo realmente pintado (el gris de hover es translúcido).
function contraste(elemento: Locator) {
  return elemento.evaluate(el => {
    const rgba = (css: string) => css.match(/[\d.]+/g)!.map(Number)
    const fondos: number[][] = []
    for (let nodo: Element | null = el; nodo; nodo = nodo.parentElement) fondos.unshift(rgba(getComputedStyle(nodo).backgroundColor))
    const fondo = fondos.reduce((base, [r, g, b, a = 1]) => [r, g, b].map((c, i) => c * a + base[i] * (1 - a)), [255, 255, 255])
    const luminancia = ([r, g, b]: number[]) => [r, g, b].reduce((s, c, i) => {
      const v = c / 255
      return s + [0.2126, 0.7152, 0.0722][i] * (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    }, 0)
    const a = luminancia(fondo), b = luminancia(rgba(getComputedStyle(el).color))
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  })
}

for (const [tema, gris] of [['claro', 'rgba(240, 237, 237, 0.5)'], ['oscuro', 'rgba(36, 32, 30, 0.5)']]) {
  test(`las filas usan el resaltado de Gerentes activos en modo ${tema}`, async ({ page }) => {
    async function comprobarFila(texto: string) {
      const fila = page.getByRole('row').filter({ hasText: texto })
      const celda = fila.getByRole('cell').first()
      const cabecera = page.getByRole('columnheader').first()
      await cabecera.hover()
      await expect(fila).not.toHaveCSS('background-color', gris)
      const colorTexto = await celda.evaluate(el => getComputedStyle(el).color)
      await celda.hover()
      await expect(fila).toHaveCSS('background-color', gris)
      await expect(celda).toHaveCSS('color', colorTexto)
      expect(await contraste(celda)).toBeGreaterThanOrEqual(4.5)
      return fila
    }
    await abrirPanel(page, 'SUPERADMIN')
    if (tema === 'oscuro') await boton(page, 'Modo oscuro').click()
    await comprobarFila('Lina') // La referencia es el dashboard, no Gestión de Gerentes.
    await abrirPanel(page, 'GERENTE')
    await ir(page, 'Inventario')
    const ingrediente = await comprobarFila('Maíz')
    const editar = ingrediente.getByRole('button', { name: 'Editar' })
    expect(await contraste(editar)).toBeGreaterThanOrEqual(4.5)
    await editar.hover()
    await expect(ingrediente).toHaveCSS('background-color', gris)
    expect(await contraste(editar)).toBeGreaterThanOrEqual(4.5)
    await ir(page, 'Flujo de Caja')
    const vacia = page.getByRole('row').filter({ hasText: 'No hay cajas disponibles' })
    await vacia.hover()
    await expect(vacia).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')

    await abrirPanel(page, 'CAJERO')
    await comprobarFila('Arepa')
    await page.getByRole('button', { name: /Tarjeta/i }).click()
    await page.getByRole('button', { name: /Cerrar cuenta y facturar/ }).click()
    await expect(page.getByRole('heading', { name: 'Factura FAC-12' })).toBeVisible()
    const comprobante = await comprobarFila('Arepa')
    await page.emulateMedia({ media: 'print' })
    await expect(comprobante).toBeVisible()
    await expect(comprobante).not.toHaveCSS('background-color', gris)
  })
}

async function comprobarFormulario(dialogo: Locator) {
  await expect(dialogo).toBeVisible()
  const medidas = await dialogo.evaluate(el => {
    const panel = el.getBoundingClientRect()
    const campos = Array.from(el.querySelectorAll('input, select, textarea'), campo => campo.getBoundingClientRect())
    const accion = el.querySelector('button[type="submit"]')!.getBoundingClientRect()
    return {
      x: panel.left, y: panel.top, derecha: innerWidth - panel.right, abajo: innerHeight - panel.bottom,
      desborda: el.scrollWidth > el.clientWidth,
      campos: campos.map(c => [c.left - panel.left, panel.right - c.right]),
      botonesAlineados: Math.abs(accion.right - campos[0].right) <= 1,
    }
  })
  expect(Math.min(medidas.x, medidas.y)).toBeGreaterThan(0)
  expect(Math.abs(medidas.x - medidas.derecha)).toBeLessThanOrEqual(1)
  expect(Math.abs(medidas.y - medidas.abajo)).toBeLessThanOrEqual(1)
  expect(medidas.desborda).toBe(false)
  for (const [izquierda, derecha] of medidas.campos) {
    expect(izquierda).toBeGreaterThan(0)
    expect(Math.abs(izquierda - derecha)).toBeLessThanOrEqual(1)
  }
  expect(medidas.botonesAlineados).toBe(true)
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 640 }]) {
  test(`los formularios de catálogo quedan centrados a ${viewport.width} × ${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await abrirPanel(page, 'GERENTE')
    if (viewport.width === 360) await boton(page, 'Modo oscuro').click()
    for (const [seccion, titulo] of [['Menú', 'Nuevo Producto'], ['Inventario', 'Nuevo Ingrediente'], ['Flujo de Caja', 'Nueva Caja'], ['Proveedores', 'Nuevo Proveedor']]) {
      await ir(page, seccion)
      const abrir = boton(page, `+ ${titulo}`)
      await abrir.click()
      const dialogo = page.getByRole('dialog', { name: titulo })
      await comprobarFormulario(dialogo)
      const cancelar = dialogo.getByRole('button', { name: 'Cancelar' })
      await cancelar.scrollIntoViewIfNeeded()
      await expect(cancelar).toBeInViewport({ ratio: 1 })
      await expect(dialogo.getByRole('heading', { name: titulo })).toBeInViewport()
      expect(await contraste(cancelar)).toBeGreaterThanOrEqual(4.5)
      if (titulo === 'Nuevo Proveedor' && viewport.width === 360) expect(await dialogo.evaluate(el => el.scrollTop)).toBeGreaterThan(0)
      await cancelar.click()
      await expect(abrir).toBeFocused()
    }
    const editar = page.getByRole('row').filter({ hasText: 'Molino' }).getByRole('button', { name: 'Editar' })
    await editar.click()
    const dialogo = page.getByRole('dialog', { name: 'Editar Proveedor' })
    await comprobarFormulario(dialogo)
    await expect(dialogo.getByLabel('Nombre', { exact: true })).toHaveValue('Molino')
    await page.keyboard.press('Escape')
    await expect(editar).toBeFocused()
  })
}

test('al guardar un proveedor, ni Escape ni el fondo descartan el formulario', async ({ page }) => {
  await abrirPanel(page, 'GERENTE')
  await ir(page, 'Proveedores')
  const abrir = boton(page, '+ Nuevo Proveedor')
  await abrir.click()
  const dialogo = page.getByRole('dialog', { name: 'Nuevo Proveedor' })
  await dialogo.getByLabel('Nombre', { exact: true }).fill('Molino')
  const peticion = page.waitForRequest(req => req.method() === 'POST' && req.url().endsWith('/api/proveedores'))
  let responder!: () => void
  const espera = new Promise<void>(resolve => { responder = resolve })
  await page.route('**/api/proveedores', async route => {
    await espera
    await route.fulfill({ status: 409, json: { message: 'El proveedor ya existe' } })
  }, { times: 1 })
  try {
    await boton(page, 'Crear').click()
    await peticion
    await expect(dialogo.getByRole('button', { name: 'Guardando...' })).toBeDisabled()
    await expect(boton(page, 'Cerrar ventana')).toBeDisabled()
    await expect(boton(page, 'Cancelar')).toBeDisabled()
    await page.keyboard.press('Escape')
    await page.mouse.click(2, 2)
    await expect(dialogo).toBeVisible()
  } finally { responder() }
  await expect(dialogo.getByRole('alert')).toContainText('El proveedor ya existe')
  await expect(dialogo.getByLabel('Nombre', { exact: true })).toHaveValue('Molino')
  await page.mouse.click(2, 2)
  await expect(abrir).toBeFocused()
})
