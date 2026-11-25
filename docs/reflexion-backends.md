# Reflexión comparativa de backends y deuda técnica priorizada — RemiSoft

> Cubre el criterio **14**: comparación de las cuatro variantes de backend manejadas en el
> proyecto y cierre con la deuda técnica **priorizada por impacto y esfuerzo**.
>
> La evidencia sale del propio repositorio `Cesar10007/Proyecto-Remisoft` (historial de git,
> `docker-compose.yml`, `backend/`, `database/`, `.github/workflows/`) y de la auditoría técnica
> interna. Junto a cada afirmación importante se indica **dónde se comprueba** con `git`.

---

## 1. Qué se compara y por qué

En el proyecto se trabajó con cuatro formas distintas de resolver la capa de backend:

| # | Variante | Lenguaje / runtime | Acceso a datos | Estado real en el repo |
|---|---|---|---|---|
| 1 | **Laravel 12 + Eloquent + Sanctum** | PHP 8.2 (php-fpm) | Eloquent sobre esquema creado a mano | Existió de mayo a agosto de 2026; eliminada en `24a0d6d` |
| 2 | **Express 4 + `mysql2` (SQL crudo)** | Node.js 20 | Pool de conexiones + SQL a mano | Existió del 11 al 21 de agosto de 2026; reemplazada por Prisma |
| 3 | **Express 4 + Sequelize** | Node.js 20 | ORM imperativo (modelos) | **No se usó**: 0 apariciones en todo el historial |
| 4 | **Express 4 + Prisma** | Node.js 20 | ORM declarativo con migraciones | Variante actual en `develop` |

Dos aclaraciones de honestidad metodológica:

- La variante **3 (Sequelize) no dejó rastro**: `git log -S"sequelize"` devuelve cero commits. Se
  incluye porque es el ORM de Node con el que se trabajó en el curso y es la comparación que explica
  por qué se eligió Prisma. En las tablas va marcada como **evaluada, no implementada**.
- Las variantes 1 y 2 **no son comparables en funcionalidad**: cuando existió Laravel el sistema tenía
  41 rutas y un rol operativo; hoy Express + Prisma sirve 106 endpoints montados con multi-sede,
  cocina, salón, cierre de caja y facturación por partes. Se compara **la tecnología**, no el tamaño
  del producto.

### 1.1 Línea de tiempo verificable

| Fecha | Hito | Commit / archivo |
|---|---|---|
| 2026-05-01 | Laravel 12 con PHPUnit y Sanctum; esquema cargado a mano | `backend/database/migrations/2026_05_01_203242_create_personal_access_tokens_table.php` |
| 2026-08-11 | Primer módulo migrado a Express con `mysql2` (Cajas) | `0485de3` |
| 2026-08-14 | Cajas, Ingredientes y Domicilios pasan a **Prisma ORM** | `9ec38f0` |
| 2026-08-18 | Se documenta formalmente la migración Express + Prisma | `58185a1` |
| 2026-08-19 | Se **elimina** el backend Laravel completo | `24a0d6d` *chore: remove legacy Laravel backend* |
| 2026-08-20 | Se migran los controladores restantes al cliente Prisma | `68b35cf` |
| 2026-08-21 | Se unifica `db.js` en Prisma: desaparece el pool de `mysql2` | `9b49972` |
| 2026-11-11 | 46 modelos, 17 migraciones, 61 casos de prueba | `develop` |

Las etapas 1 y 2 **coexistieron** casi dos semanas: el código Express vivía en `backend-express/`
mientras `backend/` seguía siendo Laravel. Esa convivencia prueba que la migración se hizo **por
módulos** y no con una reescritura big-bang; permitió comparar las dos implementaciones de un mismo
endpoint antes de apagar la vieja.

---

## 2. Comparación por dimensión

Escala de 1 a 5, donde 5 es lo más favorable **para este proyecto** (equipo de 3 personas, un
servidor, MariaDB, entrega académica con fecha fija).

### 2.1 Resumen en una tabla

| Dimensión | 1. Laravel + Eloquent | 2. Express + SQL crudo | 3. Express + Sequelize | 4. Express + Prisma |
|---|---|---|---|---|
| Curva de aprendizaje | 3 | 5 | 3 | 4 |
| Tipado / contratos | 3 | 1 | 2 | 4 |
| ORM y migraciones | 2 | 2 | 3 | 5 |
| Autenticación | 4 | 3 | 2 | 5 |
| Validación de entrada | 5 | 2 | 2 | 3 |
| Despliegue y operación | 2 | 4 | 4 | 4 |
| Pruebas automatizadas | 2 | 1 | 3 | 4 |
| Rendimiento y control del SQL | 3 | 5 | 3 | 4 |
| **Promedio** | **3,0** | **2,9** | **2,8** | **4,1** |

### 2.2 Curva de aprendizaje

- **Laravel** es la más guiada (`artisan make:*` genera controlador, modelo y migración). El coste no
  es aprender Laravel, es aprender **PHP 8.2 + Composer + artisan + php-fpm** viniendo de JavaScript.
  En el proyecto eso obligaba a mantener dos entornos: `docs/restricciones.md` acaba declarando que
  *"El puerto 8000, Composer, `php artisan` y el arranque de Laravel no forman parte del entorno
  activo"*.
- **Express + SQL crudo** es el arranque más rápido: `mysql.createPool` y una sentencia por endpoint,
  sin abstracciones. Cualquiera del equipo entiende un controlador en dos minutos; el problema llega
  cuando el sistema crece.
- **Sequelize** exige aprender un DSL de modelos (`sequelize.define`, `belongsTo`/`hasMany`, `include`)
  escrito a mano y **no verificado contra la base**.
- **Prisma** pide un paso más al principio (`schema.prisma`, `migrate`, `generate`), pero es único y
  deja el resto del trabajo sobre un cliente con autocompletado.

Gana el SQL crudo por velocidad de arranque y Prisma por velocidad de mantenimiento sostenido.
Laravel habría ganado con un equipo con base en PHP.

### 2.3 Tipado y contratos

- Laravel: PHP dinámico, con `FormRequest` (`backend/app/Http/Requests/RegisterUsuarioRequest.php`) y
  reglas en cadena; el tipado **se comprueba en ejecución**. `composer.json` no incluía PHPStan ni
  Psalm, solo Pint (formato) y PHPUnit.
- Express + SQL crudo: cero contratos. El "tipo" de una fila es lo que devuelva el driver; una columna
  mal escrita falla en ejecución y `mysql2` a veces devuelve `undefined` en vez de lanzar.
- Sequelize sobre JavaScript: igual; con TypeScript mejora, pero la interfaz del modelo se escribe a
  mano y hay que confiar en que coincida con la tabla.
- Prisma: **el tipo se deriva del esquema**. `prisma generate` produce el cliente con los 46 modelos y
  sus relaciones, así que una columna inexistente la detecta el editor y ESLint antes de ejecutar. Como
  el backend sigue en JavaScript (ESLint 9, sin `tsc`), ese tipado se aprovecha en autocompletado y
  revisión, **no** en un `--noEmit`. Es una mejora real pero incompleta (deuda D-16).

### 2.4 ORM y migraciones

La dimensión más objetiva, porque se mide con archivos:

| Dato | Laravel | Express + SQL crudo | Express + Prisma |
|---|---|---|---|
| Migraciones del **dominio** | 0 | 0 | **17** |
| Migraciones del framework | 4 (`users`, `cache`, `jobs`, `personal_access_tokens`) | — | — |
| Modelos / entidades descritas | 3 (`Rol`, `User`, `Usuario`) | 0 | **46** |
| Cómo se creó el esquema | `database/legacy/DBFAMILIAREMI.sql` a mano | el mismo `.sql` a mano | `prisma migrate deploy` |
| Reproducibilidad | Manual | Manual | Un comando |

El hallazgo importante: **Laravel tenía Eloquent pero no migraciones del negocio**. Las 24 tablas
(`rol`, `usuario`, `Cliente`, `pedido`, `Factura`, …) se creaban ejecutando el volcado SQL a mano; las 4
migraciones de Laravel solo cubrían tablas del framework. Se pagaba el coste de un ORM sin su
principal beneficio. La carpeta lo reconoce hoy: `database/legacy/README.md` dice que el `.sql` *"se
conserva solo como referencia histórica del diseño original"*.

Con Prisma el hueco se cerró: 17 migraciones versionadas, entre ellas `20261118201000_roles_base`, que
inserta los roles con `WHERE NOT EXISTS` para poder reaplicarse sin romper nada — es la migración que
permitió correr la integración en CI sin sembrar la base a mano.

Sigue viva, en cambio, la deuda de **nomenclatura** heredada del esquema manual: conviven `usuario`,
`pedido`, `Factura`, `Cliente` y `Detalle_pedido`. Un esquema generado desde cero no tendría ese
problema; uno adoptado a posteriori sí, y la salida razonable no es renombrar 46 modelos sino unificar
solo en migraciones nuevas (deuda D-13).

### 2.5 Autenticación y autorización

| Aspecto | Laravel + Sanctum | Express + SQL crudo | Express + Prisma (actual) |
|---|---|---|---|
| Mecanismo | Token opaco en `personal_access_tokens` | JWT con `jsonwebtoken` | JWT HS256 (`jsonwebtoken` 9.0.3) |
| Hash de contraseñas | `Hash::check` (bcrypt de PHP) | bcryptjs | bcryptjs, coste 12 |
| Límite de intentos | `throttle:auth`: 10 / 15 min por IP | Solo donde se acordara | `express-rate-limit`, 10 / 15 min en 3 rutas de auth |
| Roles | `Usuario::with('rol')` | Comprobación manual por endpoint | `requireRole(...)` en **allowlist del 100 % de los routers montados** |
| Aislamiento multi-sede | No existía (un restaurante) | No existía | `filtroRestaurante` que **lanza 403** sin sede |
| Revocación de sesión | Sí: se borra la fila del token | No | **No**: el JWT vive hasta 24 h (deuda M4) |

Dos lecturas:

1. **Sanctum era mejor en revocación**: un token en base de datos muere al borrarlo. El JWT actual no se
   puede invalidar; la auditoría lo registra como M4 y el remedio barato es una columna
   `token_version` que el middleware compare en cada petición.
2. **La autorización es hoy muy superior**: con el allowlist, un rol nuevo nace con 403 en los 103
   endpoints restantes. Eso no lo daba Laravel ni el SQL crudo por sí solos; es arquitectura, no
   framework. **Conclusión incómoda y honesta:** el framework influye menos de lo que parece en la
   seguridad; influyen los patrones que el equipo aplica de forma sistemática.

### 2.6 Validación de entrada

Laravel gana sin discusión: `'email' => 'required|email'` en una línea, `FormRequest` para lo complejo,
respuesta 422 uniforme. Sequelize no valida en el controlador: sus validadores de modelo corren al
guardar, llegan tarde y mezclan negocio con persistencia. Prisma **no valida** —comprueba tipos y
restricciones de base— y el proyecto lo compensa con `backend/src/utils/validation.js` y validaciones
explícitas: funciona, pero es más verboso. El SQL crudo delega en `IF` manuales y en MariaDB. Es la
razón por la que un equipo con mucha lógica de formularios elegiría Laravel: **~60 % menos código de
validación** para el mismo resultado.

### 2.7 Despliegue y operación

| Aspecto | Laravel | Express (las tres variantes) |
|---|---|---|
| Procesos a levantar | php-fpm + nginx + artisan (+ colas) | Un proceso `node` |
| Dependencias | Composer | pnpm 10.15.0 con `pnpm-lock.yaml` |
| Imagen Docker | Extensión `pdo_mysql` y permisos de `storage/` | `node:20.19.4-bookworm-slim`, multi-stage (`backend/Dockerfile`) |
| Orquestación | Fuera del compose original | `docker-compose.yml`: `db` con healthcheck de MariaDB, `backend`, `frontend` |

Que el proyecto entero se levante con **un solo `docker compose up`** y que la CI haga
`docker compose config` y `build` de las tres imágenes es, en la práctica, el argumento que decidió la
migración: un lenguaje, un runtime, un pipeline.

### 2.8 Pruebas automatizadas

| Variante | Infraestructura | Casos reales escritos |
|---|---|---|
| Laravel | PHPUnit 11.5.50 + `phpunit.xml` | **0**: solo `tests/Unit/ExampleTest.php` y `tests/Feature/ExampleTest.php` |
| Express + SQL crudo | Ninguna | **0** |
| Sequelize (evaluada) | `node:test` o Jest | — (no implementada) |
| Express + Prisma | `node --test` nativo, sin dependencias | **61 casos / 49 subcasos** en 21 archivos: 7 unitarias, 10 de integración, 4 specs E2E |

Y el detalle que más pesa: `backend/tests/*` se salta por defecto
(`{ skip: process.env.ESTABLECIMIENTO_DB_TEST !== '1' }`) y exige que `DB_DATABASE` termine en `_test`.
Eso permitió montar MariaDB como `services` en GitHub Actions y pasar de **28 casos que corrían** a
**61 con integración real**. Ninguna otra variante llegó a integración continua de verdad.

### 2.9 Rendimiento y control del SQL

Conviene ser explícito: **no se hicieron benchmarks**. Comparar milisegundos entre PHP y Node en una
laptop no habría sido evidencia seria. Lo que se compara son los mecanismos:

- **Eloquent**: `Usuario::with('rol')` resuelve el *eager loading* en dos consultas (buena solución al
  N+1), pero el SQL lo construye el ORM y ajustarlo exige `DB::raw`.
- **SQL crudo**: control total y pool de 10 conexiones (`connectionLimit: 10`); el coste es escribir,
  parametrizar y probar cada consulta a mano.
- **Sequelize**: el `include` se degrada con asociaciones anidadas y `findAndCountAll` con `include` es
  un clásico de N+1 silencioso.
- **Prisma**: resuelve relaciones por lotes y permite bajar a SQL crudo **sin salir del cliente ni
  perder el pooling**. El proyecto mantiene **22 consultas crudas parametrizadas** (18 `$queryRaw`, 4
  `$executeRaw`) para no pelear con el ORM donde el SQL es la respuesta correcta: 6 vistas
  (`vista_listado_productos`, `vista_resumen_ventas_diarias`, `vista_inventario_bajo_minimo`,
  `vista_pedidos_activos`, `vista_productos_mas_vendidos`, `vista_domicilios_pendientes`) y 5
  procedimientos (`sp_cerrar_turno_caja`, `sp_crear_pedido`, `sp_agregar_item_pedido`,
  `sp_listar_productos`, `sp_registrar_movimiento_inventario`), invocados como
  `prisma.$executeRaw\`CALL sp_cerrar_turno_caja(${idTurno}, ${efectivoReal}, ${notasCierre})\``.

La conclusión de siempre: **el cuello de botella no es el ORM, es el acceso sin índice**.

---

## 3. Lo que costó cada transición

El reporte de ejecución clasifica 27 defectos por sprint. Leídos con la pregunta "¿de qué backend viene
esto?", aparecen patrones claros:

| Origen | Defectos | Ejemplo real |
|---|---|---|
| Herencia del esquema manual (etapa Laravel/SQL) | 6 | *drift* de `id_restaurante` en 7 tablas que tumbaba `/api/pedidos`, `/api/domicilios`, `/api/proveedores`, `/api/cajas` y `/api/turnos` (issue #248, error `P2022`) |
| Fricción de la migración Express ↔ Prisma | 5 | imports de Prisma sin generar, `db.js` duplicado entre pool y Prisma, `pnpm-lock.yaml` desincronizado |
| Entorno y dependencias | 11 (42 %) | `vite.config.js`, arranque Docker, Mailtrap, pnpm 10.15.0 |
| Lógica nueva (cocina, salón, cierre) | 5 | JSX duplicado en el panel de Gerente, `factura.routes.js` sin montar |

Dos lecciones con nombre propio:

1. **La deuda más cara fue el esquema manual**, no Prisma: obligó a diseñar la base sin migraciones y
   Prisma solo hizo visible el drift. Un `migrate deploy` contra una base con drift falla de inmediato;
   contra el `.sql` a mano, el drift era invisible hasta que una consulta reventaba.
2. **Migrar por módulos funcionó.** El sistema nunca estuvo caído por la convivencia Laravel/Express:
   cada módulo se movió, se comparó con el endpoint viejo y se apagó el viejo. El coste fue duplicar
   código un tiempo, no duplicar incidentes.

---

## 4. Veredicto: por qué Express + Prisma

Cinco razones, en orden de peso real:

1. **Un solo lenguaje en todo el stack.** El frontend ya era React + TypeScript; con Express el equipo
   deja de cambiar de modelo mental al cruzar el `fetch`, y la CI compila, prueba y hace *build* de
   backend y frontend con el mismo Node 20.19.4.
2. **Migraciones versionadas de verdad.** 17 migraciones y 46 modelos contra 0 y 3 de Laravel. Es el
   criterio que mejor mide la madurez de un backend: `prisma migrate deploy` reproduce el esquema desde
   cero, y eso es lo que permite que la CI tenga una base limpia en cada ejecución.
3. **Cliente tipado sin reescribir en TypeScript.** El backend sigue en JavaScript, pero el cliente
   generado llega con forma: autocompletado y menos errores de nomenclatura en un esquema heredado con
   `Factura` y `Cliente` en mayúsculas.
4. **Pruebas sin dependencias.** `node --test` es nativo: 61 casos sin Jest, sin Vitest, sin
   configuración. Con PHPUnit la barrera era baja, pero **nadie escribió una sola prueba** en tres
   meses de etapa Laravel.
5. **Escape hatch al SQL.** Las 6 vistas y 5 procedimientos se siguen usando desde Prisma. La decisión
   nunca fue "ORM sí o no", sino "ORM para el CRUD, SQL para reportes y cierre de caja".

**Qué se paga a cambio**, para que esto no sea propaganda:

- Validación más verbosa que Laravel: sin `FormRequest`, cada controlador repite comprobaciones.
- Revocación de sesión peor que Sanctum: el JWT es stateless y hoy no se puede invalidar.
- Sin `enums` en el esquema (0 de 46 modelos): estados como `PENDIENTE → PREPARANDO → LISTO →
  ENTREGADO` viven en constantes de aplicación, así que un `UPDATE` manual puede dejar un valor
  inválido.
- Dos capas de acceso a datos que mantener (ORM + 22 consultas crudas) y, con ellas, dos formas de
  equivocarse.

**Cuándo reconsiderar:** con más de 6 desarrolladores en módulos paralelos, el paso natural no es
volver a PHP sino **NestJS** (misma plataforma, con inyección de dependencias y estructura impuesta);
si el cliente exigiera hosting PHP compartido, Laravel volvería a ser la respuesta. Hoy no se da
ninguna de las dos.

---

## 5. Deuda técnica priorizada

### 5.1 Cómo se prioriza

- **Impacto (I):** 5 = bloquea el despliegue o expone datos; 3 = degrada seguridad o calidad sin
  bloquear; 1 = molestia de mantenimiento.
- **Esfuerzo (E):** horas de una persona, prueba del cambio incluida.
- **Prioridad = I / E.** P0 = antes de exponer el sistema; P1 = siguiente iteración; P2 = deuda
  asumida, se paga al tocar ese módulo.

### 5.2 Tabla maestra

| ID | Hallazgo | I | E (h) | I/E | Prioridad | Criterio de cierre |
|---|---|---|---|---|---|---|
| A1 | `JWT_SECRET` y `DB_ROOT_PASSWORD` con valor por defecto en `docker-compose.yml` | 5 | 0,25 | 20,0 | **P0** | El compose falla si faltan (`${JWT_SECRET:?...}`) y `.env.example` explica cómo generarlos |
| A2 | `CARGAR_DEMO` por defecto `1`: 8 usuarios con clave `123456` | 4 | 0,1 | 40,0 | **P0** | `CARGAR_DEMO=0` por defecto; los demo exigen variable explícita |
| D1 | `.env.example` usa `MAILTRAP_USER/PASS/FROM` y el compose lee `MAILTRAP_USERNAME/PASSWORD/FROM` | 3 | 0,2 | 15,0 | **P0** | Nombres alineados; el correo deja de ignorarse en silencio |
| B2 | MariaDB (`3306`) y API (`3000`) publicados en `0.0.0.0` | 3 | 0,2 | 15,0 | **P0** | Publicados solo en `127.0.0.1` fuera de Docker |
| A3 | Solo 3 rutas tienen límite de velocidad | 3 | 0,5 | 6,0 | **P1** | Limiter global suave (300 / 15 min) + el estricto actual en auth |
| M6 | `pnpm audit --audit-level=high` con `continue-on-error: true` | 3 | 0,25 | 12,0 | **P1** | Una vulnerabilidad alta rompe el PR |
| M2 | La SPA se sirve sin CSP, `X-Frame-Options`, `nosniff` ni `Referrer-Policy` | 3 | 1 | 3,0 | **P1** | Cabeceras en la `location /` de `frontend/nginx.conf` |
| M3 | Token de recuperación guardado en claro | 3 | 1 | 3,0 | **P1** | Se persiste `sha256(token)` y el endpoint compara el hash |
| M4 | No hay revocación de sesión: el token vive hasta 24 h | 4 | 4 | 1,0 | **P1** | `token_version` en `usuario` + comparación en `auth.middleware` |
| M1 | El JWT vive en `localStorage` | 3 | 6 | 0,5 | **P2** | Cookie `httpOnly` + `SameSite=Strict` **o** CSP estricta que lo haga inviable |
| M5 | 18 routers sin montar (~100 endpoints muertos) | 2 | 3 | 0,7 | **P2** | Movidos a `src/legacy/` con README, o eliminados en un commit etiquetado |
| M7 | `trust proxy` fijo en 1 | 2 | 0,25 | 8,0 | **P2** | Por variable de entorno, con 1 como opción de Docker |
| B1 | Listados sin paginación (clientes y catálogos) | 2 | 4 | 0,5 | **P2** | `take`/`skip` con tope de 100 y total en la respuesta |
| B3 | `bloquearSistemaCerrado` aplicado dos veces | 1 | 1 | 1,0 | **P2** | Un solo punto de aplicación, documentado |
| B4 | Nomenclatura mixta en Prisma (`Factura` vs `pedido`) | 2 | 8 | 0,25 | **P2** | Solo en migraciones nuevas; convención escrita en `docs/` |
| B5 | `bcryptjs` (JS puro) con coste 12 | 1 | 2 | 0,5 | **P2** | Solo si el login se vuelve cuello de botella: binding nativo |
| D-16 | El backend sigue en JavaScript: el tipado de Prisma no se comprueba en CI | 2 | 16 | 0,1 | **P2** | `checkJs` o migración progresiva a TypeScript, módulo a módulo |
| D-17 | 22 consultas crudas sobre vistas y procedimientos sin pruebas de contrato | 2 | 3 | 0,7 | **P2** | Una prueba por vista/SP que falle si cambia la forma del resultado |
| D-18 | Estados de negocio fuera de la base (0 `enums` en 46 modelos) | 2 | 5 | 0,4 | **P2** | `enum` en Prisma o `CHECK` en la base para los 4 estados operativos |

### 5.3 Lectura de la matriz

- **"Hazlo ya" (I ≥ 4, E ≤ 1 h):** A1, A2, D1 y M6. Cuatro cambios que suman **menos de una hora** y
  retiran el riesgo de tokens forjables, usuarios demo públicos y una auditoría que no bloquea nada. Es
  justo lo que pedía el criterio 4.
- **"Planifícalo" (I ≥ 3, E > 1 h):** A3, M2, M3 y M4, media jornada entre los cuatro. M4 es el de
  mayor impacto real: hoy desactivar a un empleado no le cierra la sesión.
- **"Asúmelo y documéntalo" (I ≤ 2, E > 3 h):** M1, B1, B4 y D-16, con dueño y sin bloquear la
  entrega. **Una deuda documentada con criterio de cierre es deuda gestionada; una deuda silenciosa se
  descubre en la sustentación.**
- **Lo que no es deuda:** las 22 consultas crudas y los 18 routers sin montar no son "código malo", son
  decisiones con coste. La deuda aparece cuando nadie sabe por qué están ahí; con M5 y D-17 cerrados,
  dejan de serlo.

### 5.4 Orden de ejecución recomendado

1. **Hoy (1 h):** A1, A2, D1, M6 y B2. Todo configuración, cero riesgo de romper lógica.
2. **Siguiente PR (medio día):** A3 + M2 + M3.
3. **Antes de exponer el sistema fuera de la laptop:** M4, con migración y prueba de integración que
   verifique que el token de un usuario desactivado devuelve 401.
4. **Cuando se toque cada módulo:** M5 con reportes, B1 con clientes, B4 solo en migraciones nuevas.

---

## 6. Conclusión

De las cuatro variantes, la que mejor encaja con un equipo de tres personas, un servidor y una entrega
con fecha fija es la que está puesta: **Express + Prisma**. No porque sea el mejor ORM del mercado
—Sequelize tiene más años y Eloquent más comodidad—, sino porque encaja con tres hechos del proyecto:
el frontend ya era TypeScript, la base era heredada y necesitaba migraciones versionadas, y las pruebas
tenían que correr en CI sin infraestructura adicional.

La comparación deja una conclusión que vale más que el veredicto: **lo que hizo bueno al backend fue el
proceso, no la herramienta.** El aislamiento por sede que falla cerrado, el `requireRole` en allowlist,
las migraciones idempotentes con `WHERE NOT EXISTS` y las pruebas que se saltan sin base de datos son
decisiones que se habrían podido tomar igual en Laravel. La migración aportó el entorno y las
migraciones; la disciplina la puso el equipo.

Y la deuda pendiente es corta y está medida: **cuatro cambios de menos de una hora** separan al sistema
de dejar de tener secretos por defecto, y **media jornada más** lo deja con revocación de sesión,
cabeceras de seguridad y auditoría de dependencias que bloquea. Eso es lo que hace que este backend se
pueda defender, más allá de que funcione.

---

## Apéndice — Reproducir la evidencia

```bash
git log --all --oneline -- backend/artisan                       # etapa Laravel y su eliminación
git show 24a0d6d^:backend/composer.json                          # laravel/framework ^12.0, sanctum ^4.0
git show 24a0d6d^:backend/routes/api.php | grep -c "Route::"     # 41 rutas
git ls-tree -r --name-only 24a0d6d^ -- backend/tests             # 2 pruebas de ejemplo
git show 0485de3:backend-express/src/config/db.js                # mysql.createPool, connectionLimit 10
git log --all -S"sequelize" --oneline                            # vacío: Sequelize nunca se usó
ls backend/prisma/migrations | wc -l                             # 17
grep -c "^model " backend/prisma/schema.prisma                   # 46
grep -rn "queryRaw\|executeRaw" backend/src --include=*.js | wc -l   # 22
```
