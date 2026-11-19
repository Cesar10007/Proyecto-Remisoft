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
  inventario: { data: [{ id_ingrediente: 1, nombre: 'Maíz', unidad_medida: 'kg', costo_unitario_ref: '18000.25', stock_minimo: 20, stock_actual: 19.6 }] },
  proveedores: [{ id_proveedor: 1, nombre: 'Molino', nombre_contacto: 'Ana', telefono: '', email: '', direccion: '', nit: '', tipo_proveedor: '', estado: 'ACTIVO' }],
  cajas: [], 'productos/vista': [], mesas: { data: [] }, facturas: { data: [] },
  solicitudes: { data: [] }, 'inventario/alertas/stock-bajo': { data: [] },
  'reportes/ventas-diarias': { data: { dias: [], productos_top: [], total: { ingresos_brutos: 0, total_pedidos: 0, total_propinas: 0 } } },
  'reportes/pedidos-activos': { data: { pedidos_activos: 0 } },
  'cobro/pendientes': [cuenta],
  turnos: { data: [{ id_turno: 1, id_caja: 1, estado: 'ABIERTA', fecha_apertura: cuenta.fecha_hora, caja: { nombre: 'Central' } }] },
  'cocina/comandas': [{ ...cuenta, items: [{ ...cuenta.items[0], estado: 'PENDIENTE' }] }],
  domicilios: [{ id_domicilio: 1, id_pedido: 12, id_repartidor: 8, direccion: 'Calle 1', estado: 'ASIGNADO' }],
  'domicilios/resumen': { data: { cola: [], top: [], actual: null, entregas_hoy: 0 } },
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
async function abrirPanel(page: Page, rol: 'SUPERADMIN' | 'GERENTE' | 'CAJERO' | 'REPARTIDOR') {
  await page.route('**/api/auth/login', route => route.fulfill({ json: { rol, token: 'fixture-visual', user: { id_usuario: 8, nombre: 'Prueba' } } }), { times: 1 })
  await entrar(page, 'visual@example.test', 'solo-prueba')
  await expect(page).toHaveURL(new RegExp(`/${rol.toLowerCase()}$`))
}
async function ir(page: Page, seccion: string) {
  if (await boton(page, 'Abrir menú').isVisible()) await boton(page, 'Abrir menú').click()
  await boton(page, seccion).click()
}

// Dos píxeles en sRGB: fondo (0) y texto (1). El navegador compone las capas,
// incluidas la transparencia del hover de fila y la opacidad de un control.
function contraste(elemento: Locator) {
  return elemento.evaluate(el => {
    const canvas = document.createElement('canvas')
    canvas.width = 2; canvas.height = 1
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = getComputedStyle(el).color
    ctx.fillRect(1, 0, 1, 1)
    for (let nodo: Element | null = el; nodo; nodo = nodo.parentElement) {
      const estilo = getComputedStyle(nodo)
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = estilo.backgroundColor
      ctx.fillRect(0, 0, 2, 1)
      ctx.globalCompositeOperation = 'destination-in'
      ctx.fillStyle = `rgb(0 0 0 / ${estilo.opacity})`
      ctx.fillRect(0, 0, 2, 1)
    }
    ctx.globalCompositeOperation = 'destination-over'
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, 2, 1)
    const rgb = ctx.getImageData(0, 0, 2, 1).data
    const luminancia = (offset: number) => [0.2126, 0.7152, 0.0722].reduce((suma, peso, i) => {
      const v = rgb[offset + i] / 255
      return suma + peso * (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    }, 0)
    const a = luminancia(0), b = luminancia(4)
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  })
}

async function comprobarAccion(control: Locator) {
  const page = control.page()
  await expect(control).toBeVisible()
  const nombre = (await control.getAttribute('aria-label') ?? await control.innerText()).trim()
  await page.mouse.move(0, 0)
  expect(await contraste(control), `${nombre}: reposo`).toBeGreaterThanOrEqual(4.5)
  await control.hover()
  expect(await contraste(control), `${nombre}: hover`).toBeGreaterThanOrEqual(4.5)
  await page.mouse.move(0, 0)
  await page.keyboard.press('Tab')
  await control.focus()
  expect(await control.evaluate(el => el.matches(':focus-visible')), `${nombre}: foco de teclado`).toBe(true)
  expect(await contraste(control), `${nombre}: foco`).toBeGreaterThanOrEqual(4.5)
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
    const cobrar = page.getByRole('button', { name: /Cerrar cuenta y facturar/ })
    await expect(cobrar).toBeDisabled()
    expect(await contraste(cobrar)).toBeGreaterThanOrEqual(4.5)
    await page.getByRole('button', { name: /Tarjeta/i }).click()
    await comprobarAccion(cobrar)
    await cobrar.click()
    await expect(page.getByRole('heading', { name: 'Factura FAC-12' })).toBeVisible()
    const comprobante = await comprobarFila('Arepa')
    await page.emulateMedia({ media: 'print' })
    await expect(comprobante).toBeVisible()
    await expect(comprobante).not.toHaveCSS('background-color', gris)
  })

  test(`las acciones de proveedores y de turnos son legibles en modo ${tema}`, async ({ page }) => {
    await abrirPanel(page, 'GERENTE')
    if (tema === 'oscuro') await boton(page, 'Modo oscuro').click()
    const script = await page.locator('script[type="module"][src^="/assets/"]').evaluateAll(tags => tags[0]?.getAttribute('src'))
    await expect(page.getByText(`Interfaz: ${script ? script.split('/').pop() : 'Vite (desarrollo)'}`, { exact: true })).toBeVisible()
    await comprobarAccion(boton(page, 'Cerrar Caja'))
    await ir(page, 'Proveedores')
    for (const nombre of ['+ Nuevo Proveedor', 'Editar', 'Desactivar']) await comprobarAccion(boton(page, nombre))
    await boton(page, '+ Nuevo Proveedor').click()
    for (const nombre of ['Cerrar ventana', 'Cancelar', 'Crear']) await comprobarAccion(boton(page, nombre))
    await boton(page, 'Cancelar').click()
    await ir(page, 'Turnos')
    await comprobarAccion(boton(page, 'Abrir turno'))
    await boton(page, 'Abrir turno').click()
    await comprobarAccion(boton(page, 'Cancelar'))
    await comprobarAccion(boton(page, 'Confirmar apertura'))
    await boton(page, 'Cancelar').click()
    await boton(page, 'Cerrar turno').click()
    await comprobarAccion(boton(page, 'Confirmar cierre'))
  })

  test(`se conserva el contraste en cocina y al editar un domicilio en modo ${tema}`, async ({ page }) => {
    await abrirPanel(page, 'GERENTE')
    if (tema === 'oscuro') await boton(page, 'Modo oscuro').click()
    await page.goto('/cocina')
    await comprobarAccion(boton(page, 'Empezar'))
    await abrirPanel(page, 'REPARTIDOR')
    await ir(page, 'Entregas')
    await comprobarAccion(page.getByRole('button', { name: /Nuevo Domicilio/ }))
    const editar = page.getByRole('button', { name: /Editar/ })
    await comprobarAccion(editar)
    await comprobarAccion(boton(page, 'Cancelar')) // Acción de la tarjeta, antes de abrir el diálogo.
    await editar.click()
    const dialogo = page.getByRole('dialog', { name: 'Editar Domicilio' })
    await comprobarAccion(dialogo.getByRole('button', { name: 'Cancelar' }))
    await comprobarAccion(dialogo.getByRole('button', { name: 'Actualizar' }))
  })
}

async function comprobarFormulario(dialogo: Locator) {
  await expect(dialogo).toBeVisible()
  const cabecera = dialogo.locator('header')
  await expect(cabecera.getByRole('heading')).toBeVisible()
  await expect(cabecera.getByRole('button', { name: 'Cerrar ventana' })).toBeVisible()
  const medidas = await dialogo.evaluate(el => {
    const panel = el.getBoundingClientRect()
    const campos = Array.from(el.querySelectorAll('input, select, textarea'), campo => campo.getBoundingClientRect())
    const titulo = el.querySelector('header h2')!.getBoundingClientRect()
    const cerrar = el.querySelector('header button')!.getBoundingClientRect()
    const acciones = Array.from(el.querySelectorAll('form button'), b => b.getBoundingClientRect())
    const accion = el.querySelector('button[type="submit"]')!.getBoundingClientRect()
    return {
      x: panel.left, y: panel.top, derecha: innerWidth - panel.right, abajo: innerHeight - panel.bottom,
      desborda: el.scrollWidth > el.clientWidth,
      campos: campos.map(c => [c.left - panel.left, panel.right - c.right]),
      accionesDentro: acciones.every(b => b.left >= campos[0].left - 1 && b.right <= campos[0].right + 1),
      botonesAlineados: Math.abs(accion.right - campos[0].right) <= 1,
      tituloYCierreEnLinea: titulo.right <= cerrar.left && Math.abs((titulo.top + titulo.bottom - cerrar.top - cerrar.bottom) / 2) <= 1,
      cabeceraAlineada: Math.abs(titulo.left - campos[0].left) <= 1 && Math.abs(cerrar.right - campos[0].right) <= 1,
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
  expect(medidas.tituloYCierreEnLinea).toBe(true)
  expect(medidas.cabeceraAlineada).toBe(true)
  expect(medidas.accionesDentro).toBe(true)
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
      if (titulo === 'Nuevo Ingrediente') {
        // Tiene que poder escribirse desde que se abre el alta, sin nombre ni datos previos.
        await expect(dialogo.getByLabel('Nombre', { exact: true })).toHaveValue('')
        const stock = dialogo.getByRole('spinbutton', { name: 'Stock actual', exact: true })
        await expect(stock).toBeVisible()
        await expect(stock).toBeEditable()
        await expect(stock).toHaveValue('0')
        if (viewport.width === 1440) await expect(stock).toBeInViewport({ ratio: 1 })
        await stock.fill('3.125')
        await expect(dialogo.getByLabel('Stock mínimo')).toHaveValue('0')
      }
      const cancelar = dialogo.getByRole('button', { name: 'Cancelar' })
      await cancelar.scrollIntoViewIfNeeded()
      await expect(cancelar).toBeInViewport({ ratio: 1 })
      await expect(dialogo.getByRole('button', { name: 'Crear' })).toBeInViewport({ ratio: 1 })
      await expect(dialogo.getByRole('button', { name: 'Cerrar ventana' })).toBeInViewport({ ratio: 1 })
      await expect(dialogo.getByRole('heading', { name: titulo })).toBeInViewport({ ratio: 1 })
      expect(await contraste(cancelar)).toBeGreaterThanOrEqual(4.5)
      if (titulo === 'Nuevo Proveedor' && viewport.width === 360) expect(await dialogo.locator('.app-modal__body').evaluate(el => el.scrollTop)).toBeGreaterThan(0)
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

test('editar un ingrediente en móvil con letra grande no recorta la cabecera y conserva el conteo en conflicto', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await abrirPanel(page, 'GERENTE')
  await expect(page).toHaveTitle('RemiSoft')
  await boton(page, 'Modo oscuro').click()
  await ir(page, 'Inventario')
  const editar = page.getByRole('row').filter({ hasText: 'Maíz' }).getByRole('button', { name: 'Editar' })
  await editar.click()
  await page.addStyleTag({ content: 'html { font-size: 125%; }' })
  const d = page.getByRole('dialog', { name: 'Editar Ingrediente' })
  const stock = d.getByLabel('Stock actual', { exact: true })
  await expect(stock).toHaveValue('19.6')
  await expect(d.getByLabel('Stock mínimo')).toHaveValue('20')
  await expect(d.getByLabel('Motivo del ajuste')).toHaveCount(0)
  await stock.fill('0')
  await d.getByLabel('Motivo del ajuste').fill('Recuento físico')
  await comprobarFormulario(d)
  const encabezado = d.locator('header')
  const antes = await encabezado.boundingBox()
  const guardar = d.getByRole('button', { name: 'Actualizar' })
  await guardar.scrollIntoViewIfNeeded()
  await expect(guardar).toBeInViewport({ ratio: 1 })
  await expect(encabezado).toBeInViewport({ ratio: 1 })
  expect(await encabezado.boundingBox()).toEqual(antes)
  // Comprobar las líneas del texto, no solo que exista el h2 en el DOM.
  expect(await encabezado.evaluate(el => {
    const r = document.createRange()
    r.selectNodeContents(el.querySelector('h2')!)
    const cabecera = el.getBoundingClientRect(), x = el.querySelector('button')!.getBoundingClientRect()
    const lineas = Array.from(r.getClientRects())
    return lineas.length <= 2 && lineas.every(linea => linea.top > cabecera.top && linea.bottom < cabecera.bottom && linea.left >= cabecera.left && linea.right < x.left)
  })).toBe(true)
  await page.route('**/api/ingredientes/1', route => route.fulfill({ status: 409, json: { message: 'El stock cambió. Revisa el conteo.' } }))
  const enviado = page.waitForRequest(req => req.method() === 'PUT' && req.url().endsWith('/api/ingredientes/1'))
  await guardar.click()
  expect((await enviado).postDataJSON()).toMatchObject({ stock_actual: 0, stock_esperado: 19.6, motivo: 'Recuento físico', stock_minimo: '20' })
  await expect(d.getByRole('alert')).toContainText('El stock cambió')
  await expect(stock).toHaveValue('0')
  await expect(d.getByLabel('Motivo del ajuste')).toHaveValue('Recuento físico')
  await d.getByRole('button', { name: 'Cancelar' }).click()
  await expect(editar).toBeFocused()
})

test('la g de Nuevo Ingrediente y Editar Ingrediente conserva el trazo inferior', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await abrirPanel(page, 'GERENTE')
  await boton(page, 'Modo oscuro').click()
  await ir(page, 'Inventario')
  await expect(page.getByRole('heading', { name: 'Gestión de Ingredientes' })).toHaveCSS('font-family', /DM Sans Local/)
  for (const [accion, titulo] of [['+ Nuevo Ingrediente', 'Nuevo Ingrediente'], ['Editar', 'Editar Ingrediente']]) {
    await boton(page, accion).click()
    const d = page.getByRole('dialog', { name: titulo })
    // Comparar la tinta real: la caja del h2 también cabía con la g de cola plana.
    await expect(d.getByRole('heading')).toHaveScreenshot(`titulo-${titulo.split(' ')[0].toLowerCase()}-ingrediente.png`, { scale: 'css' })
    await d.getByRole('button', { name: 'Cancelar' }).click()
  }
})

test('un alta con stock en una API anterior avisa sin invitar a crear la ficha otra vez', async ({ page }) => {
  await abrirPanel(page, 'GERENTE')
  await ir(page, 'Inventario')
  await boton(page, '+ Nuevo Ingrediente').click()
  const nuevo = page.getByRole('dialog', { name: 'Nuevo Ingrediente' })
  await nuevo.getByLabel('Nombre', { exact: true }).fill('Fríjol')
  await nuevo.getByLabel('Stock mínimo').fill('3')
  await nuevo.getByLabel('Stock actual').fill('5.125')
  await page.route('**/api/ingredientes', route => route.fulfill({ status: 201, json: { message: 'Ingrediente creado' } }))
  const peticion = page.waitForRequest(req => req.method() === 'POST' && req.url().endsWith('/api/ingredientes'))
  await nuevo.getByRole('button', { name: 'Crear' }).click()
  expect((await peticion).postDataJSON()).toMatchObject({ nombre: 'Fríjol', stock_actual: 5.125, stock_minimo: '3' })
  await expect(nuevo).toHaveCount(0)
  await expect(page.getByRole('alert')).toContainText('no confirmó el stock inicial')
})

test('editar solo la ficha no envía un conteo y una API antigua no se confunde con un stock guardado', async ({ page }) => {
  await abrirPanel(page, 'GERENTE')
  await ir(page, 'Inventario')
  const editar = page.getByRole('row').filter({ hasText: 'Maíz' }).getByRole('button', { name: 'Editar' })
  await page.route('**/api/ingredientes/1', route => route.fulfill({ json: { message: 'Ingrediente actualizado' } }))
  await editar.click()
  const d = page.getByRole('dialog', { name: 'Editar Ingrediente' })
  await d.getByLabel('Descripción').fill('De la finca')
  const peticion = page.waitForRequest(req => req.method() === 'PUT' && req.url().endsWith('/api/ingredientes/1'))
  await d.getByRole('button', { name: 'Actualizar' }).click()
  expect((await peticion).postDataJSON()).not.toHaveProperty('stock_actual')
  await expect(d).toHaveCount(0)
  await editar.click()
  await d.getByLabel('Stock actual').fill('22.125')
  await d.getByLabel('Motivo del ajuste').fill('Recuento físico')
  await d.getByRole('button', { name: 'Actualizar' }).click()
  await expect(d.getByRole('alert')).toContainText('La API no confirmó el stock')
  await expect(d.getByLabel('Stock actual')).toHaveValue('22.125')
})

for (const tema of ['claro', 'oscuro']) {
  test(`el proveedor conserva sus datos y las acciones siguen siendo legibles mientras se guarda (${tema})`, async ({ page }) => {
    await abrirPanel(page, 'GERENTE')
    if (tema === 'oscuro') await boton(page, 'Modo oscuro').click()
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
      for (const nombre of ['Guardando...', 'Cerrar ventana', 'Cancelar']) {
        const deshabilitado = dialogo.getByRole('button', { name: nombre, exact: true })
        await expect(deshabilitado).toBeDisabled()
        expect(await contraste(deshabilitado), nombre).toBeGreaterThanOrEqual(4.5)
      }
      await page.keyboard.press('Escape')
      await page.mouse.click(2, 2)
      await expect(dialogo).toBeVisible()
    } finally { responder() }
    await expect(dialogo.getByRole('alert')).toContainText('El proveedor ya existe')
    await expect(dialogo.getByLabel('Nombre', { exact: true })).toHaveValue('Molino')
    await page.mouse.click(2, 2)
    await expect(abrir).toBeFocused()
  })
}
