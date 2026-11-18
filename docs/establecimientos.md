# Establecimientos: operación y despliegue

La clave del negocio es **`restaurante.id_restaurante`**. En **Superadmin → Gestión de Gerentes → Agregar gerente**, el nombre del establecimiento crea una sede nueva, no una copia de una sede existente. Gerente y sede se guardan en la misma transacción. Aprobar una solicitud de gerente también crea una sede propia; aprobar personal operativo lo incorpora a la sede del gerente que revisa la solicitud.

## Qué ve el gerente

- La API relee el usuario autenticado en la BD. No toma la sede que un gerente envíe en el formulario o en la URL. Sin sede asignada el personal no puede operar. Solo el superadmin puede hacer lecturas globales o elegir `?id_restaurante=N` en los módulos de negocio; sus escrituras operativas requieren una sede concreta.
- Catálogos, clientes, personal, proveedores, inventario, mesas, cajas, pedidos y análisis tienen propietario. Detalles, facturas, pagos y entregas heredan la sede del pedido; los movimientos de caja, la del turno. Los totales y rankings separan las sedes antes de sumar. Dos establecimientos pueden tener la misma «Mesa 1» sin compartir su ocupación.
- Un alta no crea productos, mesas, alertas, transacciones ni predicciones. El panel distingue una consulta fallida de una consulta sin registros. **IA Insights** consulta `GET /api/ia`; `POST /api/ia` permite guardar un resultado ya generado (`Tipo_prediccion`, `Resultado_generado` y opcional `Recomendaciones_generales`). Abrir la pantalla no genera análisis.

## Actualizar una instalación existente

Haz copia de seguridad y actualiza backend y frontend juntos. No ejecutes `datos.sql`, `prisma migrate reset` ni `docker compose down -v` sobre una BD con operación real.

- **Compose:** `docker compose up -d --build` conserva el volumen. El backend aplica las migraciones y reinstala **todas** las vistas y procedimientos de `database/`. Si la base ya tenía tablas antes de migrar, omite la demo, incluso si no hay usuarios o productos.
- **Sin Docker:** instala las dependencias de `backend`. Exporta `DATABASE_URL`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME` y `DB_PASSWORD`, apuntando a la **misma BD**. Desde la raíz, ejecuta:

  ```bash
  CARGAR_DEMO=0 bash backend/prisma/setup-prisma.sh
  ```

  Necesita `pnpm` y el cliente `mariadb`. Ejecuta `prisma migrate deploy` y `prisma generate`, y después reinstala `database/vistas/*.sql` y `database/procedimientos/*.sql`. **No basta con regenerar Prisma:** `sp_listar_productos` recibe la sede y `sp_cerrar_turno_caja` también la exige. Reinicia la API y sirve el frontend actualizado.

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
3. **Opcional, solo en una BD de demo desechable:** con frontend y API funcionando y Chromium instalado, `ESTABLECIMIENTO_E2E=1 pnpm --dir frontend exec playwright test e2e/establecimiento.spec.ts` usa el formulario de superadmin, inicia sesión como el nuevo gerente, recorre las secciones, guarda un producto y un ingrediente y comprueba que persisten y que la campana solo muestra alertas propias. Deja esos registros en la BD de prueba.
