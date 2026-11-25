# Establecimientos: operación y despliegue

> Metodología de aislamiento, auditoría automática y plantilla para módulos
> nuevos: ver [aislamiento-sedes.md](aislamiento-sedes.md) y
> [plantilla-modulo-sede.md](plantilla-modulo-sede.md).

Un gerente puede tener **varias sedes permitidas** (`usuario_restaurante`) pero
opera en **una a la vez** (`usuario.id_restaurante`). El superadmin las asigna en
**Gestión de Gerentes → Sedes**; el gerente cambia de sede con el selector del
encabezado. Ver [aislamiento-sedes.md](aislamiento-sedes.md#gerente-multisede-una-sede-a-la-vez-varias-permitidas).

La clave del negocio es **`restaurante.id_restaurante`**. En **Superadmin → Gestión de Gerentes → Agregar gerente**, el nombre del establecimiento crea una sede nueva, no una copia de una sede existente. Gerente y sede se guardan en la misma transacción. Aprobar una solicitud de gerente también crea una sede propia; aprobar personal operativo lo incorpora a la sede del gerente que revisa la solicitud.

## Qué ve el gerente

- La API relee el usuario autenticado en la BD. No toma la sede que un gerente envíe en el formulario o en la URL. Sin sede asignada el personal no puede operar. Solo el superadmin puede hacer lecturas globales o elegir `?id_restaurante=N` en los módulos de negocio; sus escrituras operativas requieren una sede concreta.
- Catálogos, clientes, personal, proveedores, inventario, mesas, cajas, pedidos y análisis tienen propietario. Detalles, facturas, pagos y entregas heredan la sede del pedido; los movimientos de caja, la del turno. Los totales y rankings separan las sedes antes de sumar. Dos establecimientos pueden tener la misma «Mesa 1» sin compartir su ocupación.
- Un alta no crea productos, mesas, alertas, transacciones ni predicciones. El panel distingue una consulta fallida de una consulta sin registros. **IA Insights** consulta `GET /api/ia`; `POST /api/ia` permite guardar un resultado ya generado (`Tipo_prediccion`, `Resultado_generado` y opcional `Recomendaciones_generales`). Abrir la pantalla no genera análisis.

## Primera jornada desde el panel (sin datos precargados)

| Quién | Dónde | Qué ocurre |
| --- | --- | --- |
| Gerente | **Menú → Administrar mesas** (o **Mesas**) | Crea una mesa con número y capacidad. Para retirarla, pulsa **Eliminar** y confirma. Una mesa libre admite **Editar** (número y capacidad). Una mesa con personas sentadas, comanda abierta o cuenta en caja no se puede editar ni eliminar. Al guardar se vuelve a comprobar bajo el mismo bloqueo que usa el salón. Al retirar una mesa libre se conservan los pedidos y las facturas anteriores. |
| Gerente | **Personal** | Crea un usuario **MESERO** y otro **CAJERO**, cada uno con sus credenciales. Ambos quedan en este negocio; no hace falta elegir sede ni crear nuevos tipos de rol. |
| Gerente | **Inventario → Nuevo Ingrediente → Stock actual** | Selecciona la **unidad de medida** y escribe las existencias iniciales en esa unidad, o deja **0**. Al crear la ficha, un valor positivo queda como una sola entrada **Stock inicial** en **Historial → Inventario**. Para registrar entradas o salidas posteriores usa **Movimientos** en la ficha del ingrediente. Un ajuste de existencias no registra por sí solo una compra ni un pago. |
| Gerente | **Inventario → Editar → Stock actual** | Introduce el **total contado**, no la cantidad a sumar o restar. Admite cero y hasta tres decimales. Si cambias el saldo, indica el **Motivo del ajuste** y pulsa **Actualizar**. Por ejemplo, pasar de 19,6 a 20 kg deja una entrada de 0,4 kg en **Historial → Inventario**. **Stock mínimo** sigue siendo el umbral de alerta. |
| Gerente | **Menú → Nuevo Producto** y luego **Receta** en su fila | Indica cuánto se usa de cada ingrediente **por unidad** de producto, en la unidad del inventario. Ejemplo: 0,25 kg de masa por arepa. Un producto sin receta no genera consumo de ingredientes. |
| Gerente | **Flujo de Caja → Nueva Caja**, luego **Turnos → Abrir turno** | Selecciona la caja activa y el cajero de la sede. Registra el efectivo inicial; no es una venta. |
| Mesero | **Mesas → Tomar pedido → Enviar a cocina** | Confirmar la comanda descuenta su receta una vez. Si falta stock, no se abre la cuenta. En **Cocina** avanza la preparación; de vuelta en el salón marca el plato servido y envía la cuenta a caja. |
| Cajero | **Cobro → Cerrar cuenta y facturar** | Con su propio turno abierto, registra factura, pago y movimiento de caja. En efectivo, se registra el total de la venta, no el dinero recibido antes de dar cambio. Cobrar una comanda ya confirmada no vuelve a descontar inventario. |
| Gerente | **Finanzas**, **Historial → Inventario** y **Turnos → Cerrar turno** | Revisa el ingreso, las salidas por comanda y la diferencia contra el efectivo contado. Tarjeta y transferencia son ingresos, pero **no se suman al efectivo esperado**. El cierre no recalcula turnos históricos ya cerrados. |

Para integraciones: `POST /api/mesas` recibe `{ "numero": 1, "capacidad": 4 }`; `DELETE /api/mesas/1` opera por número **dentro de la sede de la sesión** (409 si está ocupada, 404 si no existe). `PUT /api/mesas/1` recibe `numero`, `capacidad`, y puede comprobar `id_mesa` y `capacidad_esperada` del formulario. `GET /api/productos/:id/receta` lista los ingredientes elegibles de la sede con su cantidad actual. `PUT` sobre esa misma ruta reemplaza la receta completa con `{ "ingredientes": [{ "id_ingrediente": 7, "cantidad": 0.25 }] }`; una lista vacía la quita. La API no permite asociar ingredientes de otra sede.

### Unidad de medida del ingrediente

En **Inventario → Nuevo Ingrediente**, elige la unidad en la que contarás las existencias y medirás el consumo en las recetas. El costo de referencia es en **COP por una de esas unidades**; el mínimo, el stock actual y las entradas y salidas usan esa misma medida.

| Grupo | Opciones del desplegable |
| --- | --- |
| Peso | Kilogramo (kg), gramo (g), libra (lb), onza (oz) |
| Volumen | Litro (L), mililitro (ml) |
| Conteo | Unidad (ud), pieza (pza) |
| Empaques | Caja, bulto, atado, manojo, bandeja |

**Ejemplo:** si compras dos bandejas de 30 huevos y la cocina usa huevos sueltos, elige **Pieza (pza)** y registra una entrada de **60 pza**. Una tortilla de dos huevos consume **2 pza**. Si controlas bandejas completas del mismo tamaño, elige **Bandeja** y registra **2 bandejas**, con el costo de **una bandeja**. RemiSoft no supone cuánto pesa un bulto ni cuántas piezas hay en una caja. [Ver el formulario con Bandeja seleccionada](imagenes/unidad-de-inventario.png).

En **Editar ingrediente** el desplegable sigue habilitado aunque haya movimientos o recetas. Si la ficha está sin usar, puedes corregir la unidad directamente y revisar los valores. Si ya tiene historial, confirma la equivalencia específica del ingrediente. Por ejemplo: **30 pza = 1 bandeja**. Un saldo de 60 pza pasa a mostrarse como 2 bandejas; un mínimo de 30 pza pasa a 1 bandeja y un costo de $500 por pieza pasa a $15.000 por bandeja. La entrada original sigue siendo **60 pza**. Volver a la unidad base usa la equivalencia 1:1. Para kg/g y L/ml se sugiere y valida la equivalencia métrica.

En la API, `unidad_base` es la medida histórica y `unidad_medida` la de trabajo en `GET /api/inventario`. Si `requiere_equivalencia` es verdadero, cambiar la medida en `PUT /api/ingredientes/:id` requiere `cantidad_base` y `factor_unidad`: **cantidad_base × unidad histórica = factor_unidad × unidad nueva**. Ambos son positivos; no se almacena un cociente redondeado. El costo, el mínimo y un eventual conteo enviados en ese mismo PUT corresponden a la unidad **al abrir** la ficha. Ficha, conversión y movimiento se confirman o revierten juntos. Un conteo, ajuste o receta envía `unidad_esperada`, `factor_esperado` y `base_esperada`; un formulario obsoleto recibe 409. Se rechazan cantidades que no se puedan representar en la unidad base sin perder precisión. Compras, lotes, movimientos y porciones ya guardados no cambian de significado. Editar otros campos no normaliza texto antiguo ni sustituye `NULL` por piezas.

**Existencias al crear:** `POST /api/ingredientes` acepta `stock_actual` de 0 a 9999999.999, con hasta tres decimales. Si se omite o vale cero, se crea el ingrediente sin movimientos. Si es positivo, la ficha y su primera entrada se guardan en una sola transacción. El 201 devuelve `id_ingrediente` y `stock_actual`. [Ver Nuevo Ingrediente con 19,6 kg iniciales](imagenes/nuevo-ingrediente-stock-inicial.png).

**Conteo al editar:** `PUT /api/ingredientes/:id` sigue aceptando la ficha sin existencias. Para conciliar stock, añade `stock_actual` (total deseado), `stock_esperado` (número que devolvió `GET /api/inventario` al abrir el editor) y `motivo` (de 5 a 1000 caracteres si cambia el total). La ficha y el ajuste se guardan juntos. Solo queda en el historial la diferencia, con la sede y el usuario autenticados; no se reescriben lotes ni movimientos anteriores. Si el saldo ya cambió, devuelve **409** sin aplicar ninguno de los cambios. Cierra el editor y vuelve a abrirlo para revisar el nuevo saldo. Un cambio de nombre o mínimo sin conteo no modifica las existencias. [Ver el editor con 19,6 kg de stock y un mínimo de 20 kg](imagenes/editar-stock-ingrediente.png).

## Historial, personal y caja

- **Historial** lee `GET /api/historial`, ordenado de más reciente a más antiguo, con 25 eventos por página y cursor `antes`. El filtro `grupo` admite `CAJA`, `MESEROS`, `INVENTARIO`, `COCINA`, `SISTEMA` y `OTROS`; `id_ingrediente` selecciona los asientos de un insumo. Ambos filtros se aplican en la sede **antes** de paginar. Cada escritura de negocio genera eventos en MariaDB con la sede de la fila o de su padre, la hora, la entidad, el registro y el autor de la operación. Las ediciones identifican los campos modificados y muestran valores operativos seleccionados; no se guardan correos, contraseñas, tokens ni cuerpos HTTP en la bitácora. Por ejemplo, editar un teléfono deja constancia del campo, no del número. Se registra también el cambio de contraseña y el inicio/cierre de sesión recibido por la API. Leer una pantalla no genera eventos.
- En **Historial → Inventario → Ingrediente**, cada asiento conserva el nombre y la unidad base, la cantidad, la nota, el origen, la fecha y el actor. Por ejemplo, [salida por pedido y entrada por compra de carne en la demo](imagenes/historial-ingrediente-por-sede.png). El modal **Inventario → Movimientos** permite registrar un ajuste y consultar el saldo; ni el modal ni `GET /api/inventario/:id` incluyen el libro.
- El contexto del autor se instala y se elimina en la misma transacción/conexión que la mutación. También las escrituras indirectas (pago, caja, cierre por procedimiento, salida por receta) quedan cubiertas. Un rollback no deja entradas de éxito. Al añadir una tabla de negocio hay que definir sus triggers y su origen de sede en la migración. Una importación directa sin contexto se distingue como **Sistema**. Se importan los movimientos históricos identificables con fecha y sede; **no se pueden recuperar las ediciones anteriores que nunca se registraron**.
- **Personal → Desactivar** impide el acceso sin quitar la fila. **Reactivar** restablece el acceso. **Eliminar** desactiva y oculta la ficha únicamente en la lista de quien lo pidió; otro gestor autorizado de la misma sede puede verla inactiva. Su ID, sus operaciones y su autoría histórica permanecen. Las bajas heredadas marcadas `ELIMINADO` sin solicitante conocido no se reasignan a un gestor por suposición.
- **Ingresos del día**, **Ventas de hoy** y el reporte de caja usan pagos `APROBADO` con monto y fecha, de facturas `EMITIDA` o `PAGADA`, según la **fecha del pago en Bogotá**, no la de emisión. El neto es lo cobrado; el bruto suma el descuento. Cada abono pertenece al día en que entró. Las facturas se cuentan una vez por rango, aunque tengan varios pagos; IVA, propinas, descuentos y unidades de producto se atribuyen una sola vez al primer día de cobro. El fondo inicial nunca es venta.
- **Flujo de Caja** abre en las cajas activas e indica si tienen turno en curso. **Ver movimientos** o **Consultar caja** muestra solo el libro y los arqueos de esa caja (también si está inactiva). Los endpoints `/turnos/movimientos` y `/turnos/arqueos` aceptan `id_caja`. Para desactivar una caja primero cierra su turno; puedes reactivarla en **Cajas inactivas**, sin perder sus movimientos. `PATCH /api/cajas/:id/estado` recibe `ACTIVA` o `INACTIVA`. Si una venta histórica no generó un movimiento de caja no se inventa uno. Las tarjetas cuentan como ingreso pero no como efectivo físico. [Captura del turno probado en Chromium](imagenes/gerente-libro-de-caja.png): $23.800 por transferencia, saldo registrado de $73.800 y efectivo esperado de $50.000.
- El panel recibe avisos autenticados de cambios de su sede después del commit; vuelve a consultar las mesas, el historial, las ventas y el stock. Hay refresco periódico de respaldo y al volver a la pestaña. Salón, inventario y campana calculan existencias por **entradas menos salidas**, con y sin lote. La alerta se activa con saldo menor o igual al mínimo y desaparece al superarlo.

## Cierre total y reapertura de una sede

1. En **Turnos activos**, registra el efectivo contado y cierra cada turno. Pasará al **Historial de turnos cerrados**. Esto no suspende la sede.
2. Pulsa **Hacer cierre total** en el menú lateral. La revisión muestra la cantidad y un folio de cada tipo de pendiente: pedidos sin finalizar (incluye cocina y cuentas en caja), mesas con atención abierta, domicilios sin terminar, turnos abiertos, facturas sin cobrar, pagos en proceso y cobros aprobados sin el asiento correspondiente por su importe en el turno correcto. No se ignoran pendientes por ser de otro día ni se inventan movimientos históricos para cuadrar.
3. Resuelve los pendientes y usa **Volver a revisar**. Sin pendientes, **Confirmar cierre total** vuelve a comprobarlos bajo bloqueo. Solo entonces aparece **«cierre de sistema exitoso»**. Las sesiones ya abiertas no permiten operar, pero no se eliminan. Los demás restaurantes siguen trabajando.
4. **Abrir sistema**, disponible para el gerente, reanuda la operación de su sede. Abrir el sistema no abre automáticamente ningún turno de caja. Ambos cambios quedan en **Historial → Sistema**.

La migración deja las sedes existentes abiertas. El estado y su versión se guardan en `restaurante`, independientes del atributo administrativo `activo`. `GET /api/sistema` devuelve el estado actual; el gerente consulta `/api/sistema/revision` y envía la `version_sistema` a `POST /api/sistema/cerrar` o `/api/sistema/abrir`. Devuelve **409** si cambió la versión o hay pendientes, **423** al intentar operar en una sede cerrada. Las escrituras de negocio comparten el bloqueo de su sede; cerrar/reabrir toma el bloqueo exclusivo y no depende de la caché de la interfaz ni de un único proceso de API. La autenticación y la recuperación de contraseña siguen disponibles.

Los módulos usan el historial del navegador: Atrás, Adelante y recargar conservan la sección. Las tablas muestran hasta 25 filas y mantienen los controles de página fuera del desplazamiento horizontal en móvil. Imprimir un comprobante no omite las líneas de las otras páginas.

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
4. Para probar la primera jornada completa **desde el navegador**, usa la misma instalación de prueba: `ESTABLECIMIENTO_E2E=1 pnpm --dir frontend exec playwright test e2e/jornada.spec.ts`. Solo el superadmin inicial es de la demo: se crea una sede vacía con su personal, mesa, ingrediente, receta, producto y caja desde el panel. La prueba abre tres sesiones, cobra por transferencia, revisa el inventario y las finanzas, cierra el turno y retira la mesa. También revisa pendientes, consulta otra caja, desactiva/reactiva la original y verifica el cierre y la reapertura con las tres sesiones. Deja sus registros en esa BD de prueba.

### Regresión visual de los paneles (sin base de datos)

Con Chromium instalado, ejecuta **una** de estas combinaciones desde la raíz (una terminal para el servidor y otra para las pruebas):

| Qué se está probando | Servidor | Regresión visual |
| --- | --- | --- |
| Archivos en desarrollo | `pnpm --dir frontend dev` | `pnpm --dir frontend exec playwright test e2e/consistencia-visual.spec.ts` |
| Compilación de producción del checkout | `pnpm --dir frontend run vista:rama` | `SALON_BASE_URL=http://127.0.0.1:4173 pnpm --dir frontend exec playwright test e2e/consistencia-visual.spec.ts` |

Las respuestas de API de esta prueba son locales: no registra proveedores ni emite facturas. Comprueba el resaltado de **Gerentes activos**, Inventario y Caja, el contraste mínimo de **4,5:1** en las acciones de Proveedores y Turnos (reposo, hover y foco), y que los controles de guardado sigan siendo legibles mientras están deshabilitados. En los formularios de catálogo mide la alineación de la cabecera y los márgenes de campos y botones a **1440 × 900** y **360 × 640**. En **Editar Ingrediente**, también verifica a **320 × 568** y con letra al **125 %** que el título y el cierre no se recorten al bajar a «Actualizar», y que un conflicto de stock conserve el conteo escrito. Las capturas de **Nuevo Ingrediente** y **Editar Ingrediente** comprueban que los títulos conservan **Syne**, servida por la aplicación. Con las fuentes externas bloqueadas, Chromium comprueba qué fuente dibuja cada parte de «Movimientos de Maíz 12»: **Syne** para las letras y **DM Sans** para las cifras. Los importes de **Ventas de hoy** mantienen sus números tabulares.

**Ayudas de los controles:** pasa el puntero por **Crear**, **Actualizar** o **Cancelar**, o llega con Tab. Cada ayuda explica la acción en español; leerla no guarda ni descarta el formulario. Escape oculta la ayuda sin mover el foco. [Ejemplo: Crear un ingrediente](imagenes/ayuda-crear-ingrediente.png).

Para añadir una ayuda, escribe una frase breve en `aria-description` en el campo, formulario o botón (nativo o compartido). Describe el efecto real y, si cambia entre alta y edición, adapta también la frase. No sustituyas la etiqueta del control ni el `aria-describedby` de sus errores.

**Comprobación manual:** abre **Gerente → Proveedores → + Nuevo Proveedor** en modo oscuro. El título y la × deben estar en la misma fila, los campos deben terminar a la altura del borde derecho de «Crear», y al bajar en móvil se deben poder pulsar «Cancelar» y «Crear» sin perder la cabecera. [Captura del compilado con la API de prueba](imagenes/nuevo-proveedor-oscuro.png). Para identificar qué interfaz sirve cada puerto, consulta la [guía de Codespaces](../README.md#cómo-saber-qué-interfaz-está-abierta-en-codespaces).

Al añadir formularios, deja que `Modal` controle el ancho, los márgenes y el desplazamiento; no añadas un ancho mínimo o un segundo relleno exterior al formulario. Usa `Button` para sus acciones: las variantes emparejan fondo y texto del tema, también en hover y al guardar. Las filas de datos de `tbody` heredan el resaltado del tema sin clases de color. Reserva `table-status-row` para las filas que solo muestran carga, vacío o error.
