import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { filtroRestaurante } from '../src/utils/restaurante.js';
import { auditar } from '../scripts/auditar-rutas.js';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

// El guardrail corre sin BD ni dependencias: si una ruta nueva se monta sin
// requireRole o sin filtro de sede, este test (y pnpm auditar:rutas) falla.
test('auditoría de rutas: todo lo montado tiene rol y filtro de sede', () => {
  const { errores, montadas } = auditar();
  assert.ok(montadas >= 20, `se esperaban 20+ rutas montadas, hay ${montadas}`);
  assert.deepEqual(errores, []);
});

test('auditoría de rutas: el CLI sale con código 0', () => {
  execFileSync(process.execPath, [join(RAIZ, 'scripts', 'auditar-rutas.js')], {
    stdio: 'pipe',
  });
});

test('auditoría de rutas: detecta un archivo huérfano en src/routes/', () => {
  const huerfana = join(RAIZ, 'src', 'routes', '__prueba-huerfana.routes.js');
  assert.equal(existsSync(huerfana), false);
  try {
    writeFileSync(huerfana, "import { Router } from 'express';\nexport default Router();\n");
    const { errores } = auditar();
    assert.ok(
      errores.some((e) => e.includes('__prueba-huerfana.routes.js')),
      `debió detectar la huérfana: ${JSON.stringify(errores)}`,
    );
  } finally {
    rmSync(huerfana, { force: true });
  }
  assert.deepEqual(auditar().errores, []);
});

// La sede sale del usuario releído en BD (auth.js), nunca del cliente:
// filtroRestaurante solo mira id_restaurante y rol, e ignora cualquier otro
// campo que un gerente intente colar (query, body, cabeceras).
test('la sede no la elige el cliente: campos extra no cambian el filtro', () => {
  const gerente = { rol: 'GERENTE', id_restaurante: 5 };
  assert.deepEqual(filtroRestaurante(gerente), { id_restaurante: 5 });
  assert.deepEqual(
    filtroRestaurante({ ...gerente, id_restaurante_query: 2, sede: 2 }),
    { id_restaurante: 5 },
  );
  assert.deepEqual(filtroRestaurante({ rol: 'SUPERADMIN', id_restaurante: null }), {});
  assert.throws(() => filtroRestaurante({ rol: 'GERENTE', id_restaurante: null }), {
    status: 403,
  });
  assert.throws(() => filtroRestaurante({ rol: 'MESERO', id_restaurante: undefined }), {
    status: 403,
  });
});
