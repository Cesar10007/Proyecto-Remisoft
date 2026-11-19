# Establecimientos: operación y despliegue

La clave del negocio es **`restaurante.id_restaurante`**. En **Superadmin → Gestión de Gerentes → Agregar gerente**, el nombre del establecimiento crea una sede nueva, no una copia de una sede existente. Gerente y sede se guardan en la misma transacción. Aprobar una solicitud de gerente también crea una sede propia; aprobar personal operativo lo incorpora a la sede del gerente que revisa la solicitud.

## Qué ve el gerente

- La API relee el usuario autenticado en la BD. No toma la sede que un gerente envíe en el formulario o en la URL. Sin sede asignada el personal no puede operar. Solo el superadmin puede hacer lecturas globales o elegir `?id_restaurante=N` en los módulos de negocio; sus escrituras operativas requieren una sede concreta.
- Catálogos, clientes, personal, proveedores, inventario, mesas, cajas, pedidos y análisis tienen propietario. Detalles, facturas, pagos y entregas heredan la sede del pedido; los movimientos de caja, la del turno. Los totales y rankings separan las sedes antes de sumar. Dos establecimientos pueden tener la misma «Mesa 1» sin compartir su ocupación.
- Un alta no crea productos, mesas, alertas, transacciones ni predicciones. El panel distingue una consulta fallida de una consulta sin registros. **IA Insights** consulta `GET /api/ia`; `POST /api/ia` permite guardar un resultado ya generado (`Tipo_prediccion`, `Resultado_generado` y opcional `Recomendaciones_generales`). Abrir la pantalla no genera análisis.

## Primera jornada desde el panel (sin datos precargados)

| Quién | Dónde | Qué ocurre |
| --- | --- | --- |
| Gerente | **Menú → Administrar mesas** (o **Mesas**) | Crea una mesa con número y capacidad. Para retirarla, pulsa **Eliminar** y confirma. Una mesa con personas sentadas, comanda abierta o cuenta en caja no se puede eliminar. Al retirar una mesa libre se conservan los pedidos y las facturas anteriores. |
| Gerente | **Personal** | Crea un usuario **MESERO** y otro **CAJERO**, cada uno con sus credenciales. Ambos quedan en este negocio; no hace falta elegir sede ni crear nuevos tipos de rol. |
| Gerente | **Inventario → Nuevo Ingrediente → Stock actual** | Escribe las existencias iniciales o deja **0**. Al crear la ficha, un valor positivo queda como una sola entrada **Stock inicial** en **Movimientos**. Allí puedes registrar entradas y salidas posteriores con su motivo. Un ajuste de existencias no registra por sí solo una compra ni un pago. |
| Gerente | **Inventario → Editar → Stock actual** | Introduce el **total contado**, no la cantidad a sumar o restar. Admite cero y hasta tres decimales. Si cambias el saldo, indica el **Motivo del ajuste** y pulsa **Actualizar**. Por ejemplo, pasar de 19,6 a 20 kg deja una entrada de 0,4 kg en **Movimientos**. **Stock mínimo** sigue siendo el umbral de alerta. |
| Gerente | **Menú → Nuevo Producto** y luego **Receta** en su fila | Indica cuánto se usa de cada ingrediente **por unidad** de producto, en la unidad del inventario. Ejemplo: 0,25 kg de masa por arepa. Un producto sin receta no genera consumo de ingredientes. |
| Gerente | **Flujo de Caja → Nueva Caja**, luego **Turnos → Abrir turno** | Selecciona la caja activa y el cajero de la sede. Registra el efectivo inicial; no es una venta. |
| Mesero | **Mesas → Tomar pedido → Enviar a cocina** | Confirmar la comanda descuenta su receta una vez. Si falta stock, no se abre la cuenta. En **Cocina** avanza la preparación; de vuelta en el salón marca el plato servido y envía la cuenta a caja. |
| Cajero | **Cobro → Cerrar cuenta y facturar** | Con su propio turno abierto, registra factura, pago y movimiento de caja. En efectivo, se registra el total de la venta, no el dinero recibido antes de dar cambio. Cobrar una comanda ya confirmada no vuelve a descontar inventario. |
| Gerente | **Finanzas**, **Inventario → Movimientos** y **Turnos → Cerrar turno** | Revisa el ingreso, las salidas por comanda y la diferencia contra el efectivo contado. Tarjeta y transferencia son ingresos, pero **no se suman al efectivo esperado**. El cierre no recalcula turnos históricos ya cerrados. |

Para integraciones: `POST /api/mesas` recibe `{ "numero": 1, "capacidad": 4 }`; `DELETE /api/mesas/1` opera por número **dentro de la sede de la sesión** (409 si está ocupada, 404 si no existe). `GET /api/productos/:id/receta` lista los ingredientes elegibles de la sede con su cantidad actual. `PUT` sobre esa misma ruta reemplaza la receta completa con `{ "ingredientes": [{ "id_ingrediente": 7, "cantidad": 0.25 }] }`; una lista vacía la quita. La API no permite asociar ingredientes de otra sede.

**Existencias al crear:** `POST /api/ingredientes` acepta `stock_actual` de 0 a 9999999.999, con hasta tres decimales. Si se omite o vale cero, se crea el ingrediente sin movimientos. Si es positivo, la ficha y su primera entrada se guardan en una sola transacción. El 201 devuelve `id_ingrediente` y `stock_actual`. [Ver Nuevo Ingrediente con 19,6 kg iniciales](imagenes/nuevo-ingrediente-stock-inicial.png).

**Conteo al editar:** `PUT /api/ingredientes/:id` sigue aceptando la ficha sin existencias. Para conciliar stock, añade `stock_actual` (total deseado), `stock_esperado` (número que devolvió `GET /api/inventario` al abrir el editor) y `motivo` (de 5 a 1000 caracteres si cambia el total). La ficha y el ajuste se guardan juntos. Solo queda en el historial la diferencia, con la sede y el usuario autenticados; no se reescriben lotes ni movimientos anteriores. Si el saldo ya cambió, devuelve **409** sin aplicar ninguno de los cambios. Cierra el editor y vuelve a abrirlo para revisar el nuevo saldo. Un cambio de nombre o mínimo sin conteo no modifica las existencias. [Ver el editor con 19,6 kg de stock y un mínimo de 20 kg](imagenes/editar-stock-ingrediente.png).

## Actualizar una instalación existente

Haz copia de seguridad y actualiza backend y frontend juntos. No ejecutes `datos.sql`, `prisma migrate reset` ni `docker compose down -v` sobre una BD con operación real.

- **Compose:** `docker compose up -d --build` conserva el volumen. El backend aplica las migraciones y reinstala **todas** las vistas y procedimientos de `database/`. Si la base ya tenía tablas antes de migrar, omite la demo, incluso si no hay usuarios o productos.
- **Sin Docker:** instala las dependencias de `backend`. Exporta `DATABASE_URL`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME` y `DB_PASSWORD`, apuntando a la **misma BD**. Desde la raíz, ejecuta:

  ```bash
  CARGAR_DEMO=0 bash backend/prisma/setup-prisma.sh
  ```

  Necesita `pnpm` y el cliente `mariadb`. Ejecuta `prisma migrate deploy` y `prisma generate`, y después reinstala `database/vistas/*.sql` y `database/procedimientos/*.sql`. **No basta con regenerar Prisma:** `sp_listar_productos` recibe la sede y `sp_cerrar_turno_caja` también la exige y usa la vista `vista_arqueo_turno`. Reinicia la API y sirve el frontend actualizado.

**Históricos:** la migración conserva las filas. Para pedidos antiguos sin sede materializa la asociación del mesero y para turnos la del responsable cuando se puede determinar. El plano conserva los números de mesa con uso identificado en esa sede, no las doce mesas de ejemplo en cada negocio. Los catálogos anteriormente globales y demás registros sin atribución no se reparten por nombre, por ID más bajo ni entre las altas nuevas. Revisa, por ejemplo:

```sql
SELECT id_producto, Nombre FROM Producto WHERE id_restaurante IS NULL;
SELECT id_ingrediente, nombre FROM Ingrediente WHERE id_restaurante IS NULL;
SELECT id_usuario, nombre FROM usuario WHERE id_restaurante IS NULL AND id_rol <> 1;
```

Antes de reactivar el uso de un catálogo histórico, identifica al propietario con información verificada y revisa también sus categorías, recetas, lotes, movimientos y demás referencias. Si dos negocios usaban realmente el mismo catálogo, crea entradas propias en lugar de compartir el mismo ID. No reasignes en bloque los `NULL` a la primera sede. Las facturas históricas de un pedido atribuido se conservan como tales.

## Primera instalación sin ejemplos

Define `CARGAR_DEMO=0` en `.env` antes del primer `docker compose up -d --build` (o usa el script local de arriba). Se instalan los roles, **no** se crean restaurantes ni usuarios de ejemplo. Para crear el primer superadmin en esa base inicializada, desde Bash:

```bash
read -rp 'Correo del primer superadmin: ' ADMIN_EMAIL
read -rsp 'Contraseña (mínimo 12 caracteres): ' CLAVE; echo
printf '%s' "$CLAVE" | docker compose exec -T -e ADMIN_EMAIL="$ADMIN_EMAIL" backend node scripts/crear-superadmin.js
unset CLAVE
```

Sin Compose, ejecuta `printf '%s' "$CLAVE" | (cd backend && ADMIN_EMAIL="$ADMIN_EMAIL" node scripts/crear-superadmin.js)` con las variables de conexión ya configuradas. Este comando local no reemplaza cuentas existentes. Con la demo habilitada (`CARGAR_DEMO=1`, predeterminado de desarrollo) solo se importa `datos.sql` en una base **sin tablas antes de migrar**. La actividad de prueba está asignada a «Restaurante Principal». Nunca se vuelve a sembrar como parte del alta de un gerente.

## Reproducir la comprobación

1. Prepara una BD exclusiva con nombre terminado en `_test`, siguiendo la instalación sin ejemplos. Configura las variables del backend y un `JWT_SECRET` de prueba.
2. `SALON_DB_TEST=1 ESTABLECIMIENTO_DB_TEST=1 pnpm --dir backend test` prueba las dos vías de alta, dos restaurantes con actividad diferente, lecturas, escrituras y referencias cruzadas, reportes, salón/cobro y el listado por vista y por procedimiento (cero, una y varias filas).
   En `jornada.integration.test.js` se crean por HTTP ambos gerentes y el personal, se inician sesiones reales y se comparan mesas homónimas, receta, historial de stock, pedidos, pagos, saldo, arqueo y ventas. Una venta de $23.800 en efectivo y otra de $11.900 con tarjeta suman $35.700 de ingresos; con un fondo inicial de $50.000, el efectivo esperado es $73.800. Ningún cobro duplica el consumo de la comanda. `conteo-inventario.integration.test.js` comprueba el alta con 19,6 kg, la entrada única (o ninguna con cero), el ajuste posterior a 20 kg, el conteo en cero, el historial por sede y el rechazo de un conteo concurrente sin sobrescribir la ficha.
3. **Opcional, solo en una BD de demo desechable:** con frontend y API funcionando y Chromium instalado, `ESTABLECIMIENTO_E2E=1 pnpm --dir frontend exec playwright test e2e/establecimiento.spec.ts` usa el formulario de superadmin, inicia sesión como el nuevo gerente, recorre las secciones, guarda un producto y un ingrediente y comprueba que persisten y que la campana solo muestra alertas propias. Deja esos registros en la BD de prueba.
4. Para probar la primera jornada completa **desde el navegador**, usa la misma instalación de prueba: `ESTABLECIMIENTO_E2E=1 pnpm --dir frontend exec playwright test e2e/jornada.spec.ts`. Solo el superadmin inicial es de la demo: se crea una sede vacía con su personal, mesa, ingrediente, receta, producto y caja desde el panel. La prueba abre tres sesiones, cobra por transferencia, revisa el inventario y las finanzas, cierra el turno y retira la mesa. También deja sus registros en esa BD de prueba.

### Regresión visual de los paneles (sin base de datos)

Con Chromium instalado, ejecuta **una** de estas combinaciones desde la raíz (una terminal para el servidor y otra para las pruebas):

| Qué se está probando | Servidor | Regresión visual |
| --- | --- | --- |
| Archivos en desarrollo | `pnpm --dir frontend dev` | `pnpm --dir frontend exec playwright test e2e/consistencia-visual.spec.ts` |
| Compilación de producción del checkout | `pnpm --dir frontend run vista:rama` | `SALON_BASE_URL=http://127.0.0.1:4173 pnpm --dir frontend exec playwright test e2e/consistencia-visual.spec.ts` |

Las respuestas de API de esta prueba son locales: no registra proveedores ni emite facturas. Comprueba el resaltado de **Gerentes activos**, Inventario y Caja, el contraste mínimo de **4,5:1** en las acciones de Proveedores y Turnos (reposo, hover y foco), y que los controles de guardado sigan siendo legibles mientras están deshabilitados. En los formularios de catálogo mide la alineación de la cabecera y los márgenes de campos y botones a **1440 × 900** y **360 × 640**. En **Editar Ingrediente**, también verifica a **320 × 568** y con letra al **125 %** que el título y el cierre no se recorten al bajar a «Actualizar», y que un conflicto de stock conserve el conteo escrito. Los títulos de **Nuevo Ingrediente** y **Editar Ingrediente** se comparan con capturas de referencia renderizadas con la fuente local, para detectar también cambios en el trazo inferior de la «g».

**Comprobación manual:** abre **Gerente → Proveedores → + Nuevo Proveedor** en modo oscuro. El título y la × deben estar en la misma fila, los campos deben terminar a la altura del borde derecho de «Crear», y al bajar en móvil se deben poder pulsar «Cancelar» y «Crear» sin perder la cabecera. [Captura del compilado con la API de prueba](imagenes/nuevo-proveedor-oscuro.png). Para identificar qué interfaz sirve cada puerto, consulta la [guía de Codespaces](../README.md#cómo-saber-qué-interfaz-está-abierta-en-codespaces).

Al añadir formularios, deja que `Modal` controle el ancho, los márgenes y el desplazamiento; no añadas un ancho mínimo o un segundo relleno exterior al formulario. Usa `Button` para sus acciones: las variantes emparejan fondo y texto del tema, también en hover y al guardar. Las filas de datos de `tbody` heredan el resaltado del tema sin clases de color. Reserva `table-status-row` para las filas que solo muestran carga, vacío o error.
