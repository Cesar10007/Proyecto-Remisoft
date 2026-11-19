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
  inventario: { data: [{ id_ingrediente: 1, nombre: 'Maíz', unidad_medida: 'KG', unidad_bloqueada: true, costo_unitario_ref: '18000.25', stock_minimo: 20, stock_actual: 19.6 }] },
  proveedores: [{ id_proveedor: 1, nombre: 'Molino', nombre_contacto: 'Ana', telefono: '', email: '', direccion: '', nit: '', tipo_proveedor: '', estado: 'ACTIVO' }],
  sistema: { sistema_abierto: true, version_sistema: 0 },
  historial: { data: [], siguiente: null }, 'turnos/movimientos': { data: [], siguiente: null }, 'turnos/arqueos': { data: [] },
  cajas: [], 'productos/vista': [], mesas: { data: [] }, facturas: { data: [] },
  solicitudes: { data: [] }, 'inventario/alertas/stock-bajo': { data: [] },
  'reportes/ventas-diarias': { data: { dias: [], productos_top: [], total: { ingresos_netos: 0, ingresos_brutos: 0, total_pedidos: 0, total_propinas: 0 } } },
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
  if (await page.evaluate(() => matchMedia('(max-width: 767px)').matches)) await boton(page, 'Abrir menú').click()
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
    const vacia = page.getByRole('row').filter({ hasText: 'No hay cajas activas.' })
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
    await comprobarAccion(boton(page, 'Hacer cierre total'))
    await ir(page, 'Proveedores')
    for (const nombre of ['+ Nuevo Proveedor', 'Editar', 'Desactivar']) await comprobarAccion(boton(page, nombre))
    await boton(page, '+ Nuevo Proveedor').click()
    for (const nombre of ['Cerrar ventana', 'Cancelar', 'Crear']) await comprobarAccion(boton(page, nombre))
    await boton(page, 'Cancelar').click()
    await ir(page, 'Turnos')
    await comprobarAccion(boton(page, 'Abrir turno'))
    await boton(page, 'Abrir turno').hover(); await page.mouse.down()
    expect(await contraste(boton(page, 'Abrir turno')), 'botón de turno presionado').toBeGreaterThanOrEqual(4.5)
    await page.mouse.up()
    await expect(boton(page, 'Cancelar')).toHaveAttribute('aria-expanded', 'true')
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
  const stock = d.getByLabel('Stock actual (kg)', { exact: true })
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

test('el alta requiere elegir una unidad y muestra en qué se costea y cuenta el ingrediente', async ({ page }) => {
  await abrirPanel(page, 'GERENTE'); await ir(page, 'Inventario'); await boton(page, '+ Nuevo Ingrediente').click()
  const d = page.getByRole('dialog', { name: 'Nuevo Ingrediente' })
  const selector = d.getByRole('combobox', { name: 'Unidad de medida' })
  await expect(selector).toHaveValue('')
  await d.getByLabel('Nombre', { exact: true }).fill('Huevos')
  await d.getByLabel('Stock actual', { exact: true }).fill('30')
  await d.getByRole('button', { name: 'Crear' }).click()
  await expect(selector).toBeFocused()
  expect(await selector.evaluate((el: HTMLSelectElement) => el.validity.valueMissing)).toBe(true)
  const opciones = {
    Peso: ['Kilogramo (kg)', 'Gramo (g)', 'Libra (lb)', 'Onza (oz)'], Volumen: ['Litro (L)', 'Mililitro (ml)'],
    Conteo: ['Unidad (ud)', 'Pieza (pza)'], Empaques: ['Caja', 'Bulto', 'Atado', 'Manojo', 'Bandeja'],
  }
  for (const [grupo, nombres] of Object.entries(opciones)) {
    await expect(selector.locator(`optgroup[label="${grupo}"] option`)).toHaveText(nombres)
  }
  for (const [codigo, plural] of [['L', 'L'], ['manojo', 'manojos'], ['pza', 'pza']]) {
    await selector.selectOption(codigo)
    await expect(d.getByLabel(`Stock actual (${plural})`)).toHaveValue('30')
    await expect(d.getByLabel(`Stock mínimo (${plural})`)).toBeEditable()
    await expect(d.getByLabel(`Costo de referencia (COP por ${codigo})`)).toBeEditable()
  }
})

test('editar conserva el texto anterior y una unidad no definida sin sustituirlos por piezas', async ({ page }) => {
  await page.route('**/api/inventario', route => route.fulfill({ json: { data: [
    { id_ingrediente: 2, nombre: 'Salsa', unidad_medida: 'Botella', unidad_bloqueada: true, stock_actual: 2 },
    { id_ingrediente: 3, nombre: 'Hierbas', unidad_medida: null, unidad_bloqueada: false, stock_actual: 0 },
  ] } }))
  await abrirPanel(page, 'GERENTE'); await ir(page, 'Inventario')
  for (const [id, nombre, original] of [[2, 'Salsa', 'Botella'], [3, 'Hierbas', null]] as const) {
    await page.getByRole('row').filter({ hasText: nombre }).getByRole('button', { name: 'Editar' }).click()
    const d = page.getByRole('dialog', { name: 'Editar Ingrediente' })
    const selector = d.getByLabel('Unidad de medida')
    await expect(selector).toHaveValue(original ?? '')
    await expect(selector.locator('option:checked')).toHaveText(original ? 'Botella (unidad anterior)' : 'Sin unidad (registro anterior)')
    await expect(selector).toBeEnabled()
    await d.getByLabel('Descripción').fill('Otra descripción')
    await page.route(`**/api/ingredientes/${id}`, route => route.fulfill({ json: { message: 'Actualizado' } }))
    const peticion = page.waitForRequest(req => req.method() === 'PUT' && req.url().endsWith(`/api/ingredientes/${id}`))
    await d.getByRole('button', { name: 'Actualizar' }).click()
    expect((await peticion).postDataJSON()).toMatchObject({ unidad_medida: original, unidad_esperada: original })
    await expect(d).toHaveCount(0)
  }
})

test('un alta con stock en una API anterior avisa sin invitar a crear la ficha otra vez', async ({ page }) => {
  await abrirPanel(page, 'GERENTE')
  await ir(page, 'Inventario')
  await boton(page, '+ Nuevo Ingrediente').click()
  const nuevo = page.getByRole('dialog', { name: 'Nuevo Ingrediente' })
  await nuevo.getByLabel('Nombre', { exact: true }).fill('Fríjol')
  await nuevo.getByLabel('Unidad de medida').selectOption('kg')
  await nuevo.getByLabel('Stock mínimo').fill('3')
  await nuevo.getByLabel('Stock actual').fill('5.125')
  await page.route('**/api/ingredientes', route => route.fulfill({ status: 201, json: { message: 'Ingrediente creado' } }))
  const peticion = page.waitForRequest(req => req.method() === 'POST' && req.url().endsWith('/api/ingredientes'))
  await nuevo.getByRole('button', { name: 'Crear' }).click()
  expect((await peticion).postDataJSON()).toMatchObject({ nombre: 'Fríjol', unidad_medida: 'kg', stock_actual: 5.125, stock_minimo: '3' })
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
  const enviado = (await peticion).postDataJSON()
  expect(enviado).toMatchObject({ unidad_medida: 'KG', unidad_esperada: 'KG' })
  expect(enviado).not.toHaveProperty('stock_actual')
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

// El texto antiguo venía del POST (no del HTML). Comprobar también despliegues mixtos.
for (const rol of ['GERENTE', 'SUPERADMIN'] as const) {
  test(`el correo rechazado tiene un único aviso rojo sin revelar el mensaje de una API anterior (${rol})`, async ({ page }) => {
    await abrirPanel(page, rol)
    const esPersonal = rol === 'GERENTE'
    if (esPersonal) await boton(page, 'Modo oscuro').click()
    await ir(page, esPersonal ? 'Personal' : 'Gestión de Gerentes')
    if (!esPersonal) {
      await page.getByRole('button', { name: /Agregar gerente/ }).click()
      await page.setViewportSize({ width: 390, height: 700 })
    }
    const guardar = boton(page, esPersonal ? 'Crear Personal' : 'Crear gerente')
    const form = page.locator('form').filter({ has: guardar })
    await form.getByLabel(esPersonal ? 'Nombre' : 'Nombre *', { exact: true }).fill('Lina')
    await form.getByLabel('Apellido').fill('López')
    if (esPersonal) await form.getByLabel('Rol').selectOption('4')
    else await form.getByLabel('Nombre Establecimiento *').fill('Sede de prueba')
    await form.getByLabel(esPersonal ? 'Contraseña' : 'Contraseña *', { exact: true }).fill('Prueba!2026')

    let envios = 0
    const anterior = 'El email del usuario ya está registrado.'
    const otroError = 'La contraseña debe incluir al menos un número'
    await page.route('**/api/usuarios', route => {
      if (route.request().method() !== 'POST') return route.fallback()
      return route.fulfill(++envios === 1 ? { status: 409, json: { message: anterior } } : { status: 422, json: { message: otroError } })
    })
    const correo = form.locator('input[type=email]'), aviso = form.getByRole('alert')
    const esperado = 'Correo inválido, ingrese otro.'
    await correo.fill('sin-arroba'); await guardar.click()
    await expect(aviso).toHaveText(esperado)
    expect(envios).toBe(0)
    await correo.fill('empleado@example.test'); await guardar.click()
    await expect(aviso).toHaveText(esperado)
    expect(envios).toBe(1)
    await expect(page.getByText(anterior, { exact: true })).toHaveCount(0)
    await expect(correo).toBeFocused()
    await expect(correo).toHaveAccessibleDescription(esperado)
    await expect(aviso).toBeInViewport({ ratio: 1 })
    await expect(aviso).toHaveCSS('background-color', esPersonal ? 'rgb(168, 24, 50)' : 'rgb(180, 22, 48)')
    expect(await contraste(aviso)).toBeGreaterThanOrEqual(4.5)
    await form.getByLabel('Apellido').fill('Pérez')
    await expect(aviso).toHaveText(esperado)
    await correo.fill('otro@example.test')
    await expect(aviso).toHaveCount(0)
    await expect(correo).toHaveAttribute('aria-invalid', 'false')
    await guardar.click()
    await expect(aviso).toHaveText(otroError) // No encubrir errores ajenos al correo.
  })
}

test('aprobar una solicitud protege el correo sin convertir todos los conflictos en errores de correo', async ({ page }) => {
  await abrirPanel(page, 'SUPERADMIN')
  await page.route('**/api/solicitudes', route => route.fulfill({ json: { data: [{
    id_solicitud: 1, nombre: 'Lina', apellido: 'López', email: 'lina@example.test', id_rol_solicitado: 2,
  }] } }))
  await ir(page, 'Solicitudes')
  page.on('dialog', dialog => dialog.accept())
  const neutro = 'Correo inválido, ingrese otro.'
  for (const [respuesta, esperado] of [
    [{ message: 'El email de la solicitud ya pertenece a un usuario.' }, neutro],
    [{ code: 'DUPLICATE_ENTRY', message: 'Ya existe un registro con ese campo' }, neutro],
    [{ code: 'DUPLICATE_ENTRY', message: 'Ya existe un registro con ese folio' }, 'Ya existe un registro con ese folio'],
    [{ message: 'La solicitud ya fue revisada.' }, 'La solicitud ya fue revisada.'],
  ] as const) {
    await page.route('**/api/solicitudes/1/aprobar', route => route.fulfill({ status: 409, json: respuesta }), { times: 1 })
    await boton(page, 'Aprobar').click()
    await expect(page.getByRole('alert')).toHaveText(esperado)
  }
})

test('en móvil se recorren 51 registros sin desbordar la página; Atrás y Adelante recuperan el módulo', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 })
  const filas = Array.from({ length: 51 }, (_,i) => ({ id_ingrediente: i + 1, nombre: `Insumo ${i + 1}`, unidad_medida:'kg', stock_actual: i }))
  await page.route('**/api/inventario', r => r.fulfill({ json: { data: filas } }))
  await abrirPanel(page, 'GERENTE'); await ir(page,'Inventario')
  const tabla = page.getByRole('table', { name:'Gestión de Ingredientes' })
  const recorrer = async () => {
    await expect(tabla.locator('tbody tr')).toHaveCount(25)
    await boton(page,'Siguiente').click(); await expect(tabla.locator('tbody tr')).toHaveCount(25)
    await expect(tabla.locator('tbody tr').first()).toContainText('Insumo 26')
    await boton(page,'Siguiente').click(); await expect(tabla.locator('tbody tr')).toHaveCount(1)
    await expect(tabla.locator('tbody tr')).toContainText('Insumo 51')
    await expect(boton(page,'Siguiente')).toBeDisabled(); await boton(page,'Anterior').click()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await recorrer(); await ir(page,'Historial'); await page.goBack(); await expect(tabla).toBeVisible()
  await page.goBack(); await expect(page.getByRole('heading',{name:'Ventas de hoy'})).toBeVisible()
  const cifra = page.getByText('Total cobrado',{exact:true}).locator('..').locator('p').last()
  await expect(cifra).toHaveCSS('font-family', /DM Sans Local/)
  await page.goForward(); await page.reload(); await expect(tabla).toBeVisible()
  await page.route('**/api/usuarios',r=>r.fulfill({json:filas.map(i=>({ id_usuario:i.id_ingrediente, id_rol:2, activo:1, nombre:i.nombre, email:`${i.id_ingrediente}@example.test` }))}))
  await abrirPanel(page,'SUPERADMIN'); await expect(page.locator('.sa-table tbody tr')).toHaveCount(25)
  await boton(page,'Siguiente').click(); await expect(page.locator('.sa-table tbody tr').first()).toContainText('Insumo 26')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('caja pagina la cuenta y el comprobante, pero imprime todas las líneas', async ({ page }) => {
  const items = Array.from({ length: 26 }, (_,i)=>({ ...cuenta.items[0], id_detalle:i+1, nombre:`Línea ${i+1}` }))
  await page.route('**/api/cobro/pendientes',r=>r.fulfill({json:[{ ...cuenta, items }] }))
  await page.route('**/api/cobro/cerrar-cuenta',r=>r.fulfill({json:{ factura:{...cuenta,items,consecutivo:'FAC-26',metodo:'TARJETA',fecha_emision:cuenta.fecha_hora} }}))
  await abrirPanel(page,'CAJERO'); await page.setViewportSize({ width:360,height:780 })
  const tabla = page.getByRole('table',{name:'Detalle de productos'})
  await expect(tabla.locator('tbody tr')).toHaveCount(25); await boton(page,'Siguiente').click()
  await expect(tabla.locator('tbody tr')).toContainText('Línea 26')
  await ir(page,'Menú'); await page.goBack(); await expect(tabla).toBeVisible()
  await page.getByRole('button',{name:/Tarjeta/i}).click(); await page.getByRole('button',{name:/Cerrar cuenta y facturar/}).click()
  await expect(page.getByRole('heading',{name:'Factura FAC-26'})).toBeVisible()
  await expect(tabla.locator('tbody tr')).toHaveCount(25); await boton(page,'Siguiente').click()
  await expect(tabla.locator('tbody tr')).toHaveCount(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint'))); await expect(tabla.locator('tbody tr')).toHaveCount(26)
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint'))); await expect(tabla.locator('tbody tr')).toHaveCount(1)
})
