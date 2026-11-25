// Exportacion a .xlsx sin dependencias: el archivo es un ZIP (sin compresion)
// con el minimo de OOXML que Excel, LibreOffice y Google Sheets abren sin avisos.

export type ValorCelda = string | number | null | undefined

export interface Hoja {
  nombre: string
  filas: ValorCelda[][]
  /** Ancho de cada columna, en caracteres. */
  anchos?: number[]
  /** Indices (base 0) de las filas que se muestran en negrita. */
  negrita?: number[]
}

// ---------------------------------------------------------------- CRC32 / ZIP

const TABLA_CRC = (() => {
  const tabla = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    tabla[i] = c >>> 0
  }
  return tabla
})()

function crc32(datos: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < datos.length; i++) c = TABLA_CRC[(c ^ datos[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function unir(partes: Uint8Array[]): Uint8Array {
  const total = partes.reduce((n, p) => n + p.length, 0)
  const salida = new Uint8Array(total)
  let pos = 0
  for (const parte of partes) {
    salida.set(parte, pos)
    pos += parte.length
  }
  return salida
}

function crearZip(archivos: { nombre: string; datos: Uint8Array }[]): Uint8Array {
  const codificador = new TextEncoder()
  const locales: Uint8Array[] = []
  const centrales: Uint8Array[] = []
  let desplazamiento = 0

  for (const archivo of archivos) {
    const nombre = codificador.encode(archivo.nombre)
    const crc = crc32(archivo.datos)
    const tamano = archivo.datos.length

    const local = new Uint8Array(30 + nombre.length)
    const vistaLocal = new DataView(local.buffer)
    vistaLocal.setUint32(0, 0x04034b50, true)
    vistaLocal.setUint16(4, 20, true)
    vistaLocal.setUint16(6, 0x0800, true)
    vistaLocal.setUint16(8, 0, true)
    vistaLocal.setUint16(10, 0, true)
    vistaLocal.setUint16(12, 0x21, true)
    vistaLocal.setUint32(14, crc, true)
    vistaLocal.setUint32(18, tamano, true)
    vistaLocal.setUint32(22, tamano, true)
    vistaLocal.setUint16(26, nombre.length, true)
    vistaLocal.setUint16(28, 0, true)
    local.set(nombre, 30)

    const central = new Uint8Array(46 + nombre.length)
    const vistaCentral = new DataView(central.buffer)
    vistaCentral.setUint32(0, 0x02014b50, true)
    vistaCentral.setUint16(4, 20, true)
    vistaCentral.setUint16(6, 20, true)
    vistaCentral.setUint16(8, 0x0800, true)
    vistaCentral.setUint16(10, 0, true)
    vistaCentral.setUint16(12, 0, true)
    vistaCentral.setUint16(14, 0x21, true)
    vistaCentral.setUint32(16, crc, true)
    vistaCentral.setUint32(20, tamano, true)
    vistaCentral.setUint32(24, tamano, true)
    vistaCentral.setUint16(28, nombre.length, true)
    vistaCentral.setUint32(42, desplazamiento, true)
    central.set(nombre, 46)

    locales.push(local, archivo.datos)
    centrales.push(central)
    desplazamiento += local.length + tamano
  }

  const tamanoCentral = centrales.reduce((n, c) => n + c.length, 0)
  const fin = new Uint8Array(22)
  const vistaFin = new DataView(fin.buffer)
  vistaFin.setUint32(0, 0x06054b50, true)
  vistaFin.setUint16(8, archivos.length, true)
  vistaFin.setUint16(10, archivos.length, true)
  vistaFin.setUint32(12, tamanoCentral, true)
  vistaFin.setUint32(16, desplazamiento, true)

  return unir([...locales, ...centrales, fin])
}

// ------------------------------------------------------------------------ XML

const REEMPLAZOS: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

const escapar = (texto: string) => texto.replace(/[&<>"']/g, (c) => REEMPLAZOS[c] ?? c)

function letraColumna(indice: number): string {
  let letra = ''
  let n = indice
  while (n >= 0) {
    letra = String.fromCharCode(65 + (n % 26)) + letra
    n = Math.floor(n / 26) - 1
  }
  return letra
}

const CABECERA = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'

function estilosXml(): string {
  return (
    CABECERA +
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;$&quot; #,##0"/></numFmts>' +
    '<fonts count="2">' +
    '<font><sz val="11"/><name val="Calibri"/></font>' +
    '<font><b/><sz val="11"/><name val="Calibri"/></font>' +
    '</fonts>' +
    '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
    '<borders count="1"><border/></borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="4">' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
    '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
    '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
    '<xf numFmtId="164" fontId="1" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"/>' +
    '</cellXfs>' +
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
    '</styleSheet>'
  )
}

function hojaXml(hoja: Hoja): string {
  const negrita = new Set(hoja.negrita ?? [])
  const filas: string[] = []

  hoja.filas.forEach((celdas, indiceFila) => {
    const numeroFila = indiceFila + 1
    const esNegrita = negrita.has(indiceFila)
    const partes: string[] = []

    celdas.forEach((valor, indiceColumna) => {
      if (valor === null || valor === undefined || valor === '') return
      const ref = `${letraColumna(indiceColumna)}${numeroFila}`
      if (typeof valor === 'number' && Number.isFinite(valor)) {
        const estilo = esNegrita ? 3 : 2
        partes.push(`<c r="${ref}" s="${estilo}"><v>${valor}</v></c>`)
      } else {
        const estilo = esNegrita ? 1 : 0
        partes.push(
          `<c r="${ref}" t="inlineStr" s="${estilo}"><is><t xml:space="preserve">${escapar(String(valor))}</t></is></c>`,
        )
      }
    })

    filas.push(partes.length === 0 ? `<row r="${numeroFila}"/>` : `<row r="${numeroFila}">${partes.join('')}</row>`)
  })

  const columnas = hoja.anchos?.length
    ? '<cols>' +
      hoja.anchos
        .map((ancho, i) => `<col min="${i + 1}" max="${i + 1}" width="${ancho}" customWidth="1"/>`)
        .join('') +
      '</cols>'
    : ''

  return (
    CABECERA +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    columnas +
    `<sheetData>${filas.join('')}</sheetData>` +
    '</worksheet>'
  )
}

function libroXml(hojas: Hoja[]): string {
  const lista = hojas
    .map((hoja, i) => `<sheet name="${escapar(hoja.nombre)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`)
    .join('')
  return (
    CABECERA +
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    `<sheets>${lista}</sheets>` +
    '</workbook>'
  )
}

function relsLibroXml(hojas: Hoja[]): string {
  const relaciones = hojas
    .map(
      (_, i) =>
        `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`,
    )
    .join('')
  return (
    CABECERA +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    relaciones +
    `<Relationship Id="rId${hojas.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
    '</Relationships>'
  )
}

function tiposXml(hojas: Hoja[]): string {
  const hojasXml = hojas
    .map(
      (_, i) =>
        `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
    )
    .join('')
  return (
    CABECERA +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
    hojasXml +
    '</Types>'
  )
}

// ---------------------------------------------------------------- API publica

/** Construye el contenido binario de un libro .xlsx con una o varias hojas. */
export function crearLibroXlsx(hojas: Hoja[]): Uint8Array {
  const codificador = new TextEncoder()
  const archivos = [
    { nombre: '[Content_Types].xml', datos: codificador.encode(tiposXml(hojas)) },
    {
      nombre: '_rels/.rels',
      datos: codificador.encode(
        CABECERA +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
          '</Relationships>',
      ),
    },
    { nombre: 'xl/workbook.xml', datos: codificador.encode(libroXml(hojas)) },
    { nombre: 'xl/_rels/workbook.xml.rels', datos: codificador.encode(relsLibroXml(hojas)) },
    { nombre: 'xl/styles.xml', datos: codificador.encode(estilosXml()) },
    ...hojas.map((hoja, i) => ({
      nombre: `xl/worksheets/sheet${i + 1}.xml`,
      datos: codificador.encode(hojaXml(hoja)),
    })),
  ]

  return crearZip(archivos)
}

// Copia el binario a un ArrayBuffer propio: Blob no acepta un Uint8Array generico.
function aArrayBuffer(datos: Uint8Array): ArrayBuffer {
  const copia = new ArrayBuffer(datos.byteLength)
  new Uint8Array(copia).set(datos)
  return copia
}

/** Genera el libro y lo descarga con el nombre indicado. */
export function descargarExcel(nombreArchivo: string, hojas: Hoja[]): void {
  const partes: BlobPart[] = [aArrayBuffer(crearLibroXlsx(hojas))]
  const blob = new Blob(partes, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}
