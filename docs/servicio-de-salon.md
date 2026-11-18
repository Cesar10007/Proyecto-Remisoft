# Servicio de salón · Mesero

## Prueba desde el navegador

Si usas Docker, desde la raíz de la rama que vas a probar ejecuta `docker compose up -d --build` y abre el frontend en `http://localhost` (en Codespaces, abre el puerto **80**). Entra como **Mesero** y selecciona **Mesas** en el menú lateral; las tarjetas están en **Sala de Comedor Principal**, no en **Caja**.

En una **base de demostración** con `database/datos.sql`, inicia sesión como `sofia.martinez@resto.com` (mesera). En una segunda sesión privada puedes entrar como `andres.torres@resto.com` (cajero de la misma sede). La contraseña de esos usuarios de prueba es `123456`; no uses esos usuarios en producción.

1. En **Sala de Comedor Principal**, pulsa cualquier parte de la tarjeta numerada (incluidos los tres puntos), o enfócala con Tab y pulsa Enter. Se abre la **ficha de esa mesa**: estado, capacidad, mesero, comensales y pedidos abiertos. Al abrirla se actualiza la lectura; consultarla o cerrarla **no cambia el estado**. En una mesa de tu sede se ven **todos sus pedidos abiertos a la vez**, con cantidades, platos, estados e importes, aunque la atienda otro mesero. Las acciones de gestión y los datos del cliente son solo del responsable. El botón ×, Escape o un clic en el fondo cierran la ventana.
2. En una mesa disponible, indica los comensales. **Ocupar mesa** guarda la ocupación sin crear un pedido ni consumir stock. Puedes cerrar la ficha y volver después para **Tomar pedido** o **Liberar mesa** si todavía no hay consumo. Si ya vas a tomar la comanda, pulsa **Tomar pedido** directamente: se ocupará al confirmarla.
3. En la carta, selecciona el cliente si corresponde y agrega platos, cantidades e indicaciones. **Enviar a cocina** valida los productos y el stock, guarda la comanda y te devuelve a la ficha de la misma mesa. Si falla, no cambia la ocupación previa. Allí ves los platos, sus estados y el total; si hay varios pedidos puedes entrar en **Gestionar pedido** para operar sobre uno propio. Mientras un pedido siga pendiente puedes editarlo o cancelarlo. No se puede liberar manualmente una mesa con cuenta abierta.
4. En **Tablero de cocina**, pulsa **Empezar** y **Marcar listo**. Vuelve al salón y pulsa **Marcar servido** en el plato listo. El pase de cocina y los pedidos se actualizan cada 8 segundos con la pestaña visible, y después de cada operación. No hace falta reiniciar sesión ni recargar la página.
5. Si el cliente pide algo más, **Añadir ronda** agrega platos pendientes a la misma cuenta, sin modificar las preparaciones anteriores. Al servir el último plato, revisa o imprime la **Precuenta** y confirma **Enviar a caja**. Esta acción **no registra un pago ni libera la mesa**.
6. En `/cajero`, selecciona la cuenta solicitada, el método de pago y, para efectivo, el monto recibido. **Cerrar cuenta y facturar** requiere un turno abierto del cajero. Se registran factura, renglones, pago y movimiento de caja en una transacción. La mesa vuelve a aparecer libre en el salón. En **Facturas** el mesero puede buscar, consultar e imprimir el comprobante; no emitir totales manuales ni anularlo.

**Registrar Venta** (o **Nuevo pedido** desde *Pedidos*) también permite elegir una mesa disponible o una que ya ocupaste sin pedido. El estado de la mesa es **Disponible/Ocupada**: *Pendiente*, *Listo* o *En caja* describen el pedido, no la mesa.

**Caja** en el panel del mesero es de consulta: cuentas enviadas a cobro, turnos abiertos, aperturas, cierres, arqueos, gastos y ventas de la sede. El selector de turno identifica qué caja se está consultando. Si no hay turno, un gerente puede abrirlo desde **Turnos** en su panel.

## Instalación sobre una base existente

Con las variables del backend configuradas, aplica las migraciones aditivas y regenera el cliente antes de iniciar la nueva versión. No borres la base ni vuelvas a importar `datos.sql` en una instalación con consumos reales.

```sh
pnpm --dir backend exec prisma migrate deploy
pnpm --dir backend exec prisma generate
```

En Docker Compose se ejecuta `database/init.sh` al iniciar el backend. `version_salon = NULL` conserva el flujo de cobro anterior para pedidos históricos. Una comanda nueva descuenta ingredientes al confirmarse; las ediciones compensan el consumo con movimientos `PEDIDO` en el kardex de ingredientes compartido del sistema, y caja **no vuelve a descontarlo**. Si una cuenta histórica figura abierta pero ya registra un pago aprobado, no se puede cobrar dos veces: se indica al mesero que consulte el cierre con caja. El catálogo de números de mesa se comparte; la ocupación se calcula por sede a partir de una atención sin pedido (`mesa_atencion`) o de al menos una cuenta abierta. La primera comanda sustituye la atención en la misma transacción, sin modificar las mesas ni los pedidos históricos. Para pedidos antiguos sin `id_restaurante` se usa la sede del mesero asociado.

## Contrato de salón (sesión MESERO)

| Método | Ruta bajo `/api/salon` | Uso |
|---|---|---|
| GET | `/` | Mesas de la sede con sus `cuentas` de consulta, más `pedidos` propios gestionables |
| GET | `/carta` | Productos activos con precio y clientes seleccionables |
| PATCH | `/mesas/:numero/estado` | Ocupar: `{"estado":"OCUPADA","comensales":2}`; liberar solo sin pedido: `{"estado":"DISPONIBLE","id_atencion":…}` |
| POST | `/pedidos` | Abrir `mesa` con `comensales`, `items`, `id_cliente?` y `notas?`. Para una mesa ya ocupada sin pedido, incluir su `id_atencion` |
| PUT | `/pedidos/:id` | Reemplazar los renglones pendientes y las indicaciones; conserva el precio de renglones existentes |
| POST | `/pedidos/:id/rondas` | Agregar `items` nuevos, sin editar renglones anteriores |
| DELETE | `/pedidos/:id` | Cancelar una comanda pendiente |
| POST | `/pedidos/:id/cuenta` | Pasar una cuenta con todos los platos entregados a `POR_COBRAR` |

`GET /api/mesas` también entrega `data[].cuentas` para el dashboard de tarjetas. El estado y el detalle corresponden a la misma lectura: una mesa con un pedido sin artículos sigue ocupada, y los pedidos cerrados o cancelados no forman parte del consumo actual.

El tablero devuelve `mesas[].atencion` (identificador, comensales y hora) solo al mesero que ocupó la mesa y hasta el primer pedido. El identificador impide que una ficha desactualizada libere o use la atención de otro grupo.

Cada ítem lleva `id_producto`, `cantidad` y `nota?`; al editar un renglón existente también `id_detalle`. Las mutaciones sobre un pedido existente llevan su `version` en el cuerpo JSON, incluido DELETE. Una versión obsoleta, mesa ocupada, falta de stock o transición incompatible no aplica cambios. El avance de cada plato se comparte con `PATCH /api/cocina/items/:id/avanzar` y el pago con `POST /api/cobro/cerrar-cuenta`. Los importes de la precuenta y caja usan la misma tasa `IVA_TASA` (por defecto 0.19).

## Verificación automatizada

`pnpm --dir backend test` ejecuta las reglas unitarias. Para la prueba HTTP de integración, configura una **base de pruebas migrada** con un nombre terminado en `_test`, `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` y `JWT_SECRET`. No se necesitan los datos de demostración.

```sh
# DATABASE_URL y DB_DATABASE deben apuntar a la base de pruebas.
pnpm --dir backend exec prisma migrate deploy
SALON_DB_TEST=1 pnpm --dir backend test
pnpm --dir frontend exec tsc --noEmit
pnpm --dir frontend build
```

La integración cubre ocupación/liberación sin pedido, concurrencia y fichas obsoletas, aislamiento entre sedes/meseros, mesas históricas con varios pedidos, apertura simultánea, última unidad de inventario, rollback por falta de stock, edición obsoleta, permisos, cancelación, ronda adicional, entrega, cobro con turno, factura consultable y liberación de la mesa. Esta prueba con MariaDB es optativa (`SALON_DB_TEST=1`); el workflow predeterminado no levanta una base de pruebas.

**Regresión de la interfaz:** con frontend y API ya levantados contra una base **desechable con los usuarios y productos de demostración**, ejecuta:

```sh
pnpm --dir frontend exec playwright install chromium
SALON_E2E=1 pnpm --dir frontend test:e2e:salon
```

Playwright usa dos sesiones reales (mesero y cajero). Las pruebas abren la ficha, ocupan y liberan antes del consumo, **crean y cobran un pedido** y comprueban que la misma ficha vuelve a Disponible al pagar. También verifican la factura y la cancelación de otro pedido pendiente en móvil. Un caso de interfaz con datos controlados verifica los tres puntos, el teclado y varios pedidos de diferentes meseros en una misma ficha, sin escrituras al consultarla. El destino por defecto es `http://127.0.0.1:5173`; se puede cambiar con `SALON_BASE_URL`.
