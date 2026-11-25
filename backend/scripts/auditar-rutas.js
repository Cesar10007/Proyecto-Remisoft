// Auditoría estática de aislamiento por sede (sin BD, sin dependencias).
//
// Verifica que ninguna ruta montada en app.js quede sin:
 //   1. requireRole (salvo los puntos de entrada públicos: auth y password-reset),
//   2. contextoEstablecimiento (las rutas de negocio van DESPUÉS del middleware global),
//   3. filtro de sede en su controller (req.sede o equivalentes),
// y que no queden archivos huérfanos en src/routes/ ni modelos Prisma fantasma.
//
// Uso:  node scripts/auditar-rutas.js        (o: pnpm auditar:rutas)
// Sale con código 1 si encuentra una fuga potencial. Ver docs/aislamiento-sedes.md.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const RUTAS = join(RAIZ, 'src', 'routes');
const CTRLS = join(RAIZ, 'src', 'controllers');
const APP = join(RAIZ, 'src', 'app.js');
const ESQUEMA = join(RAIZ, 'prisma', 'schema.prisma');

// Puntos de entrada públicos: no llevan requireRole porque SON la autenticación.
const PUBLICAS = new Set(['auth.routes.js', 'passwordReset.routes.js']);
// Montadas ANTES del contextoEstablecimiento global por diseño (administración
// cross-sede o sistema). Su controller filtra con req.user en el código.
const ADMIN_ANTES = new Set([
  'sistema.routes.js',
  'solicitudRegistro.routes.js',
  'rol.routes.js',
  'usuarios.routes.js',
  'restaurantes.routes.js',
]);
// Controllers sin columna id_restaurante o de administración: se revisan a mano
// y se documenta el motivo en docs/aislamiento-sedes.md (tabla global vs sede).
const SIN_FILTRO_SEDE = new Map([
  ['auth.controller.js', 'punto de entrada: crea la sesión, no opera datos de sede'],
  ['passwordReset.controller.js', 'flujo público de recuperación por token'],
  ['rol.controller.js', 'catálogo global: la tabla rol no tiene id_restaurante'],
  ['usuarios.controller.js', 'administración: filtra por req.user.id_restaurante en el código'],
  ['restaurantes.controller.js', 'administración: lista sedes según el rol del actor'],
  ['solicitudRegistro.controller.js', 'flujo de aprobación: crea o asigna la sede en la transacción'],
]);

const PATRON_SEDE =
  /req\.sede|alcanceMesero|alcanceFacturacion|deSede\(|filtroRestaurante|relacionDeSede|misPedidos|id_restaurante/;

function leer(ruta) {
  return readFileSync(ruta, 'utf8');
}

function modelosEsquema() {
  // Prisma expone el modelo con la primera letra en minúscula (Cliente -> cliente).
  return new Set(
    [...leer(ESQUEMA).matchAll(/^model\s+(\w+)/gm)].map((m) => m[1].toLowerCase()),
  );
}

export function auditar() {
  const errores = [];
  const avisos = [];
  const app = leer(APP);
  const lineas = app.split('\n');

  // 1. Qué rutas están montadas y en qué orden respecto al contexto global.
  const importadas = new Map(); // archivo -> nombre variable
  for (const m of app.matchAll(/import\s+(\w+)(?:\s*,\s*\{[^}]*\})?\s+from\s+'\.\/routes\/([\w.]+)'/g)) {
    importadas.set(m[2], m[1]);
  }
  const indiceContexto = lineas.findIndex((l) =>
    /app\.use\(contextoEstablecimiento\)/.test(l),
  );
  if (indiceContexto === -1) {
    errores.push('app.js: no se encontró el middleware global contextoEstablecimiento');
  }

  const montadas = []; // { archivo, rutaApi, antesDelContexto }
  for (let i = 0; i < lineas.length; i++) {
    const m = lineas[i].match(/app\.use\('(\/api\/[^']*)',\s*(\w+)/);
    if (!m) continue;
    const variable = m[2];
    const archivo = [...importadas.entries()].find(([, v]) => v === variable)?.[0];
    if (!archivo) continue;
    montadas.push({
      archivo,
      rutaApi: m[1],
      antesDelContexto: indiceContexto !== -1 && i < indiceContexto,
    });
  }

  // 2. Huérfanos: archivos en src/routes/ que app.js no importa.
  const enDisco = readdirSync(RUTAS).filter((f) => f.endsWith('.routes.js'));
  for (const f of enDisco) {
    if (!importadas.has(f)) {
      errores.push(
        `huérfana: src/routes/${f} no está montada en app.js. Muévela a src/_legacy/ o móntala con requireRole + sede.`,
      );
    }
  }

  const modelos = modelosEsquema();
  const filas = [];

  for (const { archivo, rutaApi, antesDelContexto } of montadas) {
    const rutaArchivo = join(RUTAS, archivo);
    const codigoRuta = leer(rutaArchivo);

    // 3. requireRole en cada ruta montada (salvo públicas).
    const tieneRol = /requireRole/.test(codigoRuta);
    if (!tieneRol && !PUBLICAS.has(archivo)) {
      errores.push(`${rutaApi} (${archivo}): sin requireRole. Toda ruta montada exige rol.`);
    }

    // 4. Las rutas de negocio van después del contextoEstablecimiento global.
    if (antesDelContexto && !ADMIN_ANTES.has(archivo) && !PUBLICAS.has(archivo)) {
      errores.push(
        `${rutaApi} (${archivo}): montada ANTES de contextoEstablecimiento sin estar en la lista de administración.`,
      );
    }
    if (!antesDelContexto && ADMIN_ANTES.has(archivo) && archivo !== 'sistema.routes.js') {
      avisos.push(
        `${rutaApi} (${archivo}): administración montada después del contexto global; revisar si es intencional.`,
      );
    }

    // 5. Filtro de sede en controllers (o en la propia ruta si es inline).
    const ctrls = [...codigoRuta.matchAll(/from\s+'\.\.\/controllers\/([\w.]+)'/g)].map(
      (m) => m[1],
    );
    const fuentes = ctrls.length
      ? ctrls.map((c) => ({ nombre: c, codigo: existsSync(join(CTRLS, c)) ? leer(join(CTRLS, c)) : '' }))
      : [{ nombre: archivo, codigo: codigoRuta }]; // ruta inline (sistema, historial)

    for (const { nombre, codigo } of fuentes) {
      if (SIN_FILTRO_SEDE.has(nombre)) {
        filas.push({ rutaApi, archivo: nombre, sede: `exenta: ${SIN_FILTRO_SEDE.get(nombre)}` });
        continue;
      }
      if (!PATRON_SEDE.test(codigo)) {
        errores.push(
          `${rutaApi} (${nombre}): sin filtro de sede (req.sede / alcance* / deSede). Añade ...req.sede o documenta la exención en este script.`,
        );
      }
      // 6. Modelos Prisma fantasma: prisma.<x> que no existe en el esquema.
      // Se ignoran las líneas de import (../config/prisma.js) y se compara en minúscula.
      const sinImports = codigo
        .split('\n')
        .filter((l) => !/^\s*import\b/.test(l))
        .join('\n');
      for (const m of sinImports.matchAll(/prisma\.([A-Za-z_]+)/g)) {
        if (!modelos.has(m[1].toLowerCase())) {
          errores.push(
            `${rutaApi} (${nombre}): usa prisma.${m[1]}, modelo que no existe en schema.prisma.`,
          );
        }
      }
      filas.push({ rutaApi, archivo: nombre, sede: PATRON_SEDE.test(codigo) ? 'ok' : 'FALTA' });
    }
  }

  return { errores, avisos, filas, montadas: montadas.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { errores, avisos, filas, montadas } = auditar();
  console.log(`\nAuditoría de rutas montadas: ${montadas} rutas en app.js\n`);
  for (const f of filas) {
    console.log(`  ${f.rutaApi.padEnd(22)} ${basename(f.archivo).padEnd(34)} ${f.sede}`);
  }
  for (const a of avisos) console.log(`\nAVISO: ${a}`);
  if (errores.length) {
    console.log(`\nFALLO (${errores.length}):`);
    for (const e of errores) console.log(`  - ${e}`);
    process.exit(1);
  }
  console.log('\nOK: todas las rutas montadas tienen rol y filtro de sede.');
}
