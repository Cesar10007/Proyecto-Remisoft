import test from 'node:test';
import assert from 'node:assert/strict';
import db from '../src/config/prisma.js';
import { escenarioEstablecimiento } from './fixtures/establecimiento.js';

const message = 'Correo inválido, verifique que esté bien escrito o ingrese otro.';

test('privacidad del correo en altas, ediciones y solicitudes',
  { skip: process.env.ESTABLECIMIENTO_DB_TEST !== '1' }, async (t) => {
    const { api, llamar, altaGerente, adminToken, contrasena, tag } = await escenarioEstablecimiento(t);
    const emailAdmin = (await api(adminToken, '/auth/me')).user.email;
    const ocupado = `  ${emailAdmin.toUpperCase()}  `;
    const nombre = `Sede-${tag.slice(0, 8)}`;
    const gerente = { id_rol: 2, nombre, nombre_establecimiento: nombre, contrasena };
    const ruta = '/usuarios';

    // Ni el estado HTTP ni el cuerpo (p. ej., un código de duplicado) identifican la causa.
    for (const email of ['sin-arroba', ocupado]) {
      assert.deepEqual(await api(adminToken, ruta, 'POST', { ...gerente, email }, 422), { message });
    }
    assert.equal(await db.restaurante.count({ where: { nombre } }), 0);
    const sede = await altaGerente(nombre);

    await t.test('personal: el índice global también protege dos altas simultáneas', async () => {
      const personal = { nombre: 'Cajera', id_rol: 3, contrasena };
      assert.deepEqual(await api(sede.token, ruta, 'POST', { ...personal, email: ocupado }, 422), { message });
      const email = `caja-${tag}@example.test`;
      const crear = () => llamar(sede.token, ruta, 'POST', { ...personal, email });
      const respuestas = await Promise.all([crear(), crear()]);
      assert.deepEqual(respuestas.map(r => r.status).sort(), [201, 422]);
      assert.deepEqual(respuestas.find(r => r.status === 422).result, { message });
      const { id_usuario } = respuestas.find(r => r.status === 201).result.data;
      const ficha = `${ruta}/${id_usuario}`;
      const editar = { id_rol: 3, nombre: 'Cajera' };
      assert.deepEqual(await api(sede.token, ficha, 'PUT', { ...editar, email: ocupado }, 422), { message });
      assert.equal((await api(sede.token, ficha)).email, email);
      await api(sede.token, ficha, 'PUT', { ...editar, email }); // conservar el correo propio sigue siendo válido
      await api(sede.token, `${ficha}/estado`, 'PATCH');
      assert.deepEqual(await api(sede.token, ruta, 'POST', { ...personal, email }, 422), { message });
    });

    await t.test('clientes: un conflicto dentro de la sede no revela otra ficha', async () => {
      const cliente = { Nombre: 'Cliente', Email: emailAdmin }; // Las cuentas y los clientes son entidades distintas.
      await api(sede.token, '/clientes', 'POST', cliente, 201);
      for (const Email of ['sin-arroba', ocupado]) {
        assert.deepEqual(await api(sede.token, '/clientes', 'POST', { ...cliente, Email }, 422), { message });
      }
      const otro = { Nombre: 'Segundo', Email: `cli-${tag}@example.test` };
      await api(sede.token, '/clientes', 'POST', otro, 201);
      const { id_cliente } = (await api(sede.token, '/clientes')).find(c => c.Email === otro.Email);
      const ficha = `/clientes/${id_cliente}`;
      assert.deepEqual(await api(sede.token, ficha, 'PUT', cliente, 422), { message });
      assert.equal((await api(sede.token, ficha)).Email, otro.Email);
      await api(sede.token, ficha, 'PUT', otro);
    });

    await t.test('solicitar y aprobar: misma respuesta para formato, cuenta o solicitud previa', async () => {
      const nombre_establecimiento = `Solicitud-${tag}`;
      const solicitud = { nombre: 'Nueva', apellido: 'Gerente', id_rol_solicitado: 2, nombre_establecimiento, contrasena };
      const solicitar = (email, status) => api(null, '/auth/solicitud-registro', 'POST', { ...solicitud, email }, status);
      const invalida = { success: false, message, errors: { email: [message] } };
      assert.deepEqual(await solicitar('sin-arroba', 422), invalida);
      assert.deepEqual(await solicitar(ocupado, 422), invalida);
      assert.equal(await db.solicitud_registro.count({ where: { email: emailAdmin } }), 0);
      const email = `sol-${tag}@example.test`;
      const { data: { id_solicitud } } = await solicitar(email, 201);
      assert.deepEqual(await solicitar(email.toUpperCase(), 422), invalida);
      // Entre la solicitud y la revisión, otra alta obtuvo ese correo.
      await api(sede.token, ruta, 'POST', { nombre: 'Mesero', id_rol: 4, email, contrasena }, 201);
      assert.deepEqual(await api(adminToken, `/solicitudes/${id_solicitud}/aprobar`, 'PATCH', undefined, 422), invalida);
      assert.equal((await db.solicitud_registro.findUnique({ where: { id_solicitud } })).estado, 'PENDIENTE');
      assert.equal(await db.restaurante.count({ where: { nombre: nombre_establecimiento } }), 0);
    });
  });
