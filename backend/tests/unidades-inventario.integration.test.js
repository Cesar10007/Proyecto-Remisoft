import test from 'node:test';
import assert from 'node:assert/strict';
import db from '../src/config/prisma.js';
import { escenarioEstablecimiento } from './fixtures/establecimiento.js';

test('unidad base del ingrediente: catálogo, edición y cantidades históricas',
  { skip: process.env.ESTABLECIMIENTO_DB_TEST !== '1' }, async t => {
    const { altaGerente, api } = await escenarioEstablecimiento(t);
    const { token, id_restaurante } = await altaGerente('Unidades');
    const crear = (unidad_medida, status = 201) => api(token, '/ingredientes', 'POST', { nombre: 'Insumo', unidad_medida }, status);
    const editar = (id, cambios, status = 200) => api(token, `/ingredientes/${id}`, 'PUT', { nombre: 'Insumo', ...cambios }, status);
    const leer = async id => (await api(token, `/inventario/${id}`)).data;
    const mover = (id_ingrediente, unidad_esperada, tipo = 'ENTRADA', status = 201) => api(token, '/inventario/ajuste', 'POST', {
      id_ingrediente, tipo, cantidad: 3, motivo: 'Conteo de prueba', unidad_esperada,
    }, status);

    await t.test('el alta exige una opción; formatos de peso, volumen, conteo y empaque persisten', async () => {
      for (const invalida of [undefined, null, '', ' ', 'costal nuevo', 1]) await crear(invalida, 422);
      for (const codigo of ['kg', 'g', 'lb', 'oz', 'L', 'ml', 'ud', 'pza', 'caja', 'bulto', 'atado', 'manojo', 'bandeja']) {
        const { id_ingrediente } = await crear(codigo);
        const fila = await leer(id_ingrediente);
        assert.equal(fila.unidad_medida, codigo);
        assert.equal(fila.unidad_bloqueada, false);
      }
      assert.equal((await api(token, '/inventario')).count, 13);
    });

    await t.test('una ficha sin uso permite corregir la unidad; con historial no se reclasifica sin equivalencia', async () => {
      const { id_ingrediente: id } = await crear('KG');
      assert.equal((await leer(id)).unidad_medida, 'kg');
      await editar(id, { unidad_medida: 'sin catálogo' }, 422);
      await editar(id, { unidad_esperada: 'kg', unidad_medida: 'bulto' });
      await mover(id, 'kg', 'ENTRADA', 409); // el otro formulario se abrió antes del cambio
      await editar(id, { unidad_esperada: 'kg', stock_actual: 2, stock_esperado: 0, motivo: 'Antes del cambio' }, 409);
      assert.equal((await leer(id)).movimientos, 0);
      await mover(id, 'bulto');
      await mover(id, 'bulto', 'SALIDA');
      const antes = await leer(id);
      assert.equal(antes.stock_actual, 0);
      assert.equal(antes.unidad_bloqueada, true);
      await editar(id, { unidad_medida: 'kg', nombre: 'No cambiar', stock_actual: 10, stock_esperado: 0, motivo: 'Otro conteo' }, 409);
      assert.deepEqual(await leer(id), antes);
    });

    await t.test('una receta sin movimientos ya requiere equivalencia; no se guarda una cantidad en otra medida', async () => {
      const { id_ingrediente: id } = await crear('ud');
      await api(token, '/productos', 'POST', { Nombre: 'Tortilla', precio_venta: 5000 }, 201);
      const [{ id_producto }] = await api(token, '/productos');
      const receta = `/productos/${id_producto}/receta`;
      const porcion = unidad_esperada => ({ ingredientes: [{ id_ingrediente: id, cantidad: 2, unidad_esperada }] });
      await editar(id, { unidad_medida: 'pza' });
      await api(token, receta, 'PUT', porcion('ud'), 409);
      await api(token, receta, 'PUT', porcion('pza'));
      const antes = await leer(id);
      assert.equal(antes.movimientos, 0);
      assert.equal(antes.unidad_bloqueada, true);
      await editar(id, { unidad_medida: 'bandeja' }, 409);
      const renglon = (await api(token, receta)).data.find(r => r.id_ingrediente === id);
      assert.deepEqual([renglon.unidad_medida, renglon.cantidad], ['pza', 2]);
    });

    await t.test('60 piezas = 2 bandejas: cambiar unidad, editar receta, descontar, volver y conservar el historial', async () => {
      const { id_ingrediente: id } = await api(token, '/ingredientes', 'POST', { nombre:'Huevos', unidad_medida:'pza', stock_actual:60, stock_minimo:30, costo_unitario_ref:500 },201);
      const [{ id_producto }] = await api(token,'/productos');
      const ruta = `/productos/${id_producto}/receta`;
      await api(token,ruta,'PUT',{ ingredientes:[{ id_ingrediente:id,cantidad:2,unidad_esperada:'pza' }] });
      const antes = await leer(id);
      await editar(id,{ unidad_esperada:'pza',unidad_medida:'bandeja',cantidad_base:30,factor_unidad:1 });
      const ficha = await leer(id), esperada = { unidad_esperada:'bandeja',factor_esperado:1,base_esperada:30 };
      assert.deepEqual([ficha.unidad_base,ficha.unidad_medida,ficha.stock_actual,ficha.stock_minimo,Number(ficha.costo_unitario_ref)],['pza','bandeja',2,1,15000]);
      assert.deepEqual(ficha.historial_movimientos,antes.historial_movimientos);
      assert.equal((await api(token,ruta)).data.find(x=>x.id_ingrediente===id).cantidad,0.066666667);
      await api(token,ruta,'PUT',{ ingredientes:[{ id_ingrediente:id,cantidad:0.1,...esperada }] });
      const receta = await db.receta.findFirstOrThrow({where:{id_producto,id_ingrediente:id}});
      assert.deepEqual([Number(receta.Cantidad_necesaria),receta.Unidad],[3,'pza']);
      await mover(id,'pza','SALIDA',409); // Formulario abierto antes de la conversión.
      await api(token,'/inventario/ajuste','POST',{ id_ingrediente:id, tipo:'SALIDA',cantidad:1,motivo:'Una bandeja',...esperada },201);
      const alerta = (await api(token,'/inventario/alertas/stock-bajo')).data.find(x=>x.id_ingrediente===id);
      assert.deepEqual([alerta.stock_actual, alerta.stock_minimo, alerta.unidad_medida],[1,1,'bandeja']);
      await editar(id,{ ...esperada, unidad_medida:'pza',cantidad_base:1,factor_unidad:1 });
      assert.deepEqual((await leer(id)).historial_movimientos.map(m=>[m.tipo_movimiento,Number(m.cantidad)]),[['SALIDA',30],['ENTRADA',60]]);
      assert.equal((await leer(id)).stock_actual,30);
    });

    await t.test('editar otra propiedad conserva literalmente las unidades anteriores, incluso NULL', async () => {
      for (const unidad_medida of ['UNIDAD', 'Botella', null]) {
        const { id_ingrediente: id } = await db.ingrediente.create({ data: { id_restaurante, nombre: 'Anterior', unidad_medida } });
        await mover(id, unidad_medida);
        await editar(id, { nombre: 'Renombrado' }); // PUT antiguo sin unidad
        await editar(id, { nombre: 'Conservado', unidad_medida, unidad_esperada: unidad_medida });
        await editar(id, { unidad_medida: 'caja' }, 409);
        const fila = await leer(id);
        assert.deepEqual([fila.unidad_medida, fila.stock_actual, fila.nombre], [unidad_medida, 3, 'Conservado']);
      }
    });
  });
