![Banner RemiSoft](./docs/banner-remisoft.webp)

# RemiSoft — Sistema Web Inteligente para Restaurantes

![Estado](https://img.shields.io/badge/estado-migración%20activa-e67e22)
![Versión](https://img.shields.io/badge/versión-0.1.9-2f80ed)
![Licencia](https://img.shields.io/badge/licencia-proyecto%20académico-27ae60)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb)
![Backend](https://img.shields.io/badge/backend-Express%20%2B%20Prisma-6c5ce7)
![Base de datos](https://img.shields.io/badge/base%20de%20datos-MariaDB-c0392b)
![Docker](https://img.shields.io/badge/entorno-Docker%20Compose-2496ED)

---

Sistema web para automatizar pedidos, inventario, facturación y domicilios del restaurante Familia Remi.

> **Estado actual:** el stack se ejecuta con Docker Compose mediante tres servicios: MariaDB, backend Express + Prisma y frontend React compilado y servido por nginx. La autenticación JWT y los módulos administrativos funcionan sobre datos de desarrollo inicializados automáticamente.

> **Alcance:** el proyecto es académico y se encuentra en migración/refactorización. Algunas reglas de autorización, flujos funcionales y filtros multi-restaurante todavía requieren verificación módulo por módulo.

---

## Tabla de contenido

1. [Equipo de desarrollo](#equipo-de-desarrollo)
2. [Stack y arquitectura](#stack-y-arquitectura)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Levantar con Docker](#levantar-con-docker)
5. [Desarrollo local sin Docker](#desarrollo-local-sin-docker)
6. [Variables de entorno](#variables-de-entorno)
7. [Integración continua](#integración-continua)
8. [Correo y recuperación de contraseña](#correo-y-recuperación-de-contraseña)
9. [Autenticación y roles](#autenticación-y-roles)
10. [Modelo multi-restaurante](#modelo-multi-restaurante)
11. [Documentación del proyecto](#documentación-del-proyecto)
12. [Endpoints del backend](#endpoints-del-backend)
13. [Flujo de trabajo Git](#flujo-de-trabajo-git)
14. [Diseño y UI](#diseño-y-ui)
15. [Notas técnicas y pendientes](#notas-técnicas-y-pendientes)

---

## Equipo de desarrollo

| Nombre | Rol en el equipo | Rama principal |
|--------|------------------|----------------|
| César David Rueda Daza | Líder / Full Stack | Ramas por funcionalidad o nueva implementación |
| Juan Felipe Bello Pérez | Frontend / IA | `feat/ia-modulo` |
| Kevin Duvan Bueno Melo | Tester / QA | `feat/testing` |

---

## Stack y arquitectura

| Capa | Tecnología | Puerto publicado | Puerto interno |
|------|------------|------------------|----------------|
| Frontend producción | React 19.2.4 + Vite 8.0.16 + TypeScript 6.0.3 + nginx | 80 | 80 |
| Frontend desarrollo | Vite dev server | 5173 | 5173 |
| Backend | Node.js v20.19.4 + Express 4.22.2 | 3000 | 3000 |
| Base de datos | MariaDB 11.4.4 | Solo 127.0.0.1 (loopback) | 3306 |
| ORM y migraciones | Prisma 7.9.1 | — | — |
| Orquestación | Docker Compose | — | — |
| Entorno recomendado | GitHub Codespaces | — | — |
| Auth | JWT | — | — |
| Estado global | Redux Toolkit 2 | — | — |

En el modo Docker, nginx es la entrada pública del frontend. El navegador consume la API mediante rutas relativas como `/api/auth/login`; nginx reenvía esas rutas al servicio interno `backend:3000`.

React no se comunica directamente con MariaDB. Todas las operaciones pasan por la API REST de Express.

### Dependencias principales

#### Frontend

| Librería | Versión | Uso |
|----------|---------|-----|
| React | 19.2.4 | Framework principal de UI |
| Vite | 8.0.16 | Servidor de desarrollo y build |
| TypeScript | 6.0.3 | Tipado estático |
| react-router-dom | 7.x | Rutas y navegación por rol |
| Axios | 1.x | Cliente HTTP para consumir la API |
| Redux Toolkit | 2.x | Estado global |
| react-redux | 9.x | Integración de Redux con React |

#### Backend

| Librería | Versión | Uso |
|----------|---------|-----|
| Node.js | v20.19.4 | Runtime del backend |
| Express | 4.22.2 | Framework backend y API REST |
| Prisma | 7.9.1 | ORM, cliente tipado y migraciones |
| @prisma/adapter-mariadb | 7.9.1 | Controlador de MariaDB que usa Prisma |
| jsonwebtoken | 9.x | Emisión y validación de JWT |
| bcryptjs | 2.x | Hash y verificación de contraseñas |
| Nodemailer | 9.0.5 | Recuperación de contraseña por correo |

### Base de datos

| Campo | Valor |
|-------|-------|
| Motor | MariaDB 11.4.4 |
| Base de datos | `remisoft` |
| Usuario por defecto | `remisoft` |
| Contraseña por defecto en Compose | `remisoft_pass` |
| Puerto interno | 3306 |

Los valores por defecto son únicamente para desarrollo. En un despliegue real deben reemplazarse mediante secretos o variables seguras.

---

## Estructura del proyecto

```text
Proyecto-Remisoft/
├── .devcontainer/
│   ├── devcontainer.json
│   ├── setup.sh
│   └── start.sh
├── .github/
│   └── workflows/
│       └── ci.yml
├── database/
│   ├── datos.sql
│   ├── init.sh
│   ├── legacy/
│   ├── vistas/
│   └── procedimientos/
├── docs/
│   ├── HUs/
│   ├── RFs/
│   ├── RNFs/
│   └── restricciones.md
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── api/
│       ├── store/
│       └── context/
├── backend/
│   ├── Dockerfile
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── prisma.config.ts
│   ├── src/
│   │   ├── app.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── server.js
│   └── tests/
│       └── health.test.js
├── docker-compose.yml
└── README.md
```

---

## Levantar con Docker

### Requisitos

- Docker Engine o Docker Desktop.
- Docker Compose v2.
- Git.
- En GitHub Codespaces, Docker habilitado en el entorno.

### Arranque normal

El repositorio **no trae secretos por defecto**: el compose se detiene si falta alguno. Primero crea el archivo de entorno:

```bash
cp .env.example .env
```

Genera el secreto del JWT (PowerShell, 64 caracteres hexadecimales):

```powershell
$secreto = -join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
$contenido = Get-Content .env -Raw
$contenido -replace '^JWT_SECRET=.*', "JWT_SECRET=$secreto" | Set-Content .env -NoNewline
```

Edita `.env` y completa también `DB_ROOT_PASSWORD` y `DB_PASSWORD`. Después, desde la raíz del repositorio:

```bash
docker compose up -d --build
```

Si falta una de las tres variables, `docker compose` no arranca y muestra el mensaje `Define JWT_SECRET en .env...`. Es intencional: un secreto publicado en el repositorio permite forjar tokens con cualquier rol. El backend repite la comprobación al iniciar y se detiene si el secreto tiene menos de 32 caracteres o sigue siendo un valor de ejemplo.

Comprobar servicios:

```bash
docker compose ps
```

Estado esperado:

```text
db       Up (healthy)
backend  Up
frontend Up
```

Abrir frontend:

- Localmente: `http://localhost`.
- En Codespaces: abrir el puerto 80 desde la pestaña **Ports** de VS Code.

### Cómo saber qué interfaz está abierta en Codespaces

`git log -1` identifica el commit del directorio, no el JavaScript de la pestaña. **Después de actualizar la rama**, usa el puerto correspondiente:

- **80 (Docker Compose).** Si Compose ya está en marcha, desde la raíz ejecuta `docker compose up -d --build --no-deps frontend`. Vuelve a abrir el **80** desde **Puertos**. Esto reconstruye solo la interfaz: no reinicia el backend ni borra datos.
- **4173 (compilación independiente).** Con la API ya funcionando en el 3000, ejecuta `pnpm --dir frontend run vista:rama` desde la raíz. Si faltan dependencias, usa antes `pnpm --dir frontend install --frozen-lockfile`. Deja la terminal abierta y elige **Puertos → 4173 → Abrir en el navegador**. Si no aparece, reenvía el 4173 como puerto privado. Inicia sesión en ese origen. El comando compila los archivos del directorio actual, no reemplaza lo servido en el 80 y no toca la BD.
- **5173 (desarrollo).** `pnpm --dir frontend dev` sirve el código del directorio donde se inició Vite, con recarga en caliente. Tanto desarrollo como la vista del 4173 fallan si su puerto está ocupado en vez de saltar silenciosamente a otro.

Para usar el **desplegable de unidades** y **Stock actual** en **Inventario → Nuevo Ingrediente** o **Editar**, actualiza **también la API**: con Compose ejecuta `docker compose up -d --build backend frontend` desde la raíz; si usas Vite, reinicia el backend con el código actualizado. Esta versión añade la equivalencia por ingrediente, el historial por sede y la ocultación individual. El arranque del backend aplica las migraciones y reinstala las vistas sin borrar el volumen. [Cómo elegir entre peso, volumen, piezas y empaques](docs/establecimientos.md#unidad-de-medida-del-ingrediente).

**Comprueba la pestaña:** despliega el menú lateral del gerente y mira **Interfaz:** debajo de **Cerrar sesión**. En 5173 dirá `Vite (desarrollo)`. En 4173 debe decir el mismo `index-….js` que acaba de imprimir la terminal en `dist/assets/`; en el 80 compáralo con el `src` del `<script type="module">` de `docker compose exec -T frontend cat /usr/share/nginx/html/index.html`. [Aspecto esperado de Nuevo Proveedor en modo oscuro](docs/imagenes/nuevo-proveedor-oscuro.png).

**Si «Nuevo Ingrediente» termina en «Stock mínimo»:** [así se ve el formulario vacío con «Stock actual»](docs/imagenes/nuevo-ingrediente-vacio.png). No hace falta escribir el nombre ni entrar en Editar. El alta con stock se incorporó en `d627665` del [PR #270](https://github.com/Cesar10007/Proyecto-Remisoft/pull/270).

**Correo en Personal y Agregar gerente:** [así se ve el aviso bajo el campo en modo oscuro](docs/imagenes/personal-correo-invalido.png). Debe decir solo «Correo inválido, ingrese otro.» Si el aviso de correo aparece por encima de la tabla de personal, la pestaña está ejecutando una interfaz anterior. Actualiza tanto el frontend como el backend para que también la respuesta HTTP use el mensaje breve.

**Actualizar la instalación Compose:** reconstruir contenedores no descarga la rama del PR. Para probarla en una instalación Compose ya en marcha, ejecuta estos pasos en la **misma carpeta** con la que la iniciaste. Si Git informa cambios locales incompatibles, detente; no los descartes.

```bash
git fetch origin
git switch arena/8509438c-proyecto-remisoft
git pull --ff-only origin arena/8509438c-proyecto-remisoft
docker compose up -d --build --no-deps --force-recreate backend frontend
docker compose port frontend 80
```

Abre de nuevo el puerto publicado (en Codespaces, desde **Puertos**). Esto recrea la API y la interfaz, no la base ni sus volúmenes. Si **Interfaz** no coincide con el script del contenedor, comprueba el puerto y recarga la pestaña con **Ctrl + Shift + R**; no uses `docker compose down -v`.

### Logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

Para detener servicios sin borrar datos:

```bash
docker compose down
```

### Instalación limpia

Para comprobar que el proyecto puede inicializarse desde cero:

```bash
docker compose down -v
docker compose up --build
```

> `-v` elimina el volumen `db_data` y borra los datos persistentes de MariaDB. Úsalo solo cuando quieras probar una instalación limpia.

Durante el arranque del backend, `database/init.sh` ejecuta migraciones, genera el cliente Prisma, solo importa `datos.sql` y los datos de Norte si la base no tenía tablas antes de migrar y `CARGAR_DEMO=1`, y reinstala vistas y procedimientos. En una instalación real usa `CARGAR_DEMO=0` y [crea el primer superadmin sin ejemplos](docs/establecimientos.md#primera-instalación-sin-ejemplos).

### Validaciones rápidas

```bash
curl -i http://localhost:3000/health
curl -I http://localhost
curl -i http://localhost/api/health
```

Sin token, algunas rutas protegidas responderán `401 Unauthorized`. Esto indica que el backend recibió la petición y aplicó autenticación; no es un fallo del proxy.

### Prueba de login

```bash
curl -i -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carlos.ramirez@resto.com","contrasena":"123456"}'
```

Las credenciales son datos de desarrollo. No deben reutilizarse en producción.

---

## Desarrollo local sin Docker

Para ejecutar Vite directamente:

```bash
pnpm --dir frontend dev
```

El frontend estará en `http://localhost:5173` y usará `VITE_API_URL=/api`. El proxy de Vite apunta por defecto a `http://localhost:3000`.

Para ejecutar el backend directamente:

```bash
pnpm --dir backend dev
```

Si el backend necesita MariaDB local, debes tener disponibles las variables de `backend/.env` y una instancia compatible de MariaDB.

---

## Variables de entorno

Los archivos `.env` reales no deben subirse al repositorio. Usa los archivos `.env.example` como referencia.

### Backend

Todas viven en el `.env` de la raíz y están documentadas en `.env.example`.

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `DB_ROOT_PASSWORD` | Sí | Contraseña de root del contenedor de MariaDB. El compose no la inventa. |
| `DB_PASSWORD` | Sí | Contraseña del usuario `remisoft` de MariaDB. |
| `DB_HOST` | Sí | Host de MariaDB; en Compose es `db`. |
| `DB_PORT` | No | Puerto de MariaDB, por defecto `3306`. |
| `DB_DATABASE` | No | Base de datos `remisoft`. |
| `DB_USERNAME` | No | Usuario de MariaDB, `remisoft`. |
| `DATABASE_URL` | Sí | URL que usa Prisma (incluye la contraseña). |
| `JWT_SECRET` | Sí | Firma de los JWT. **Mínimo 32 caracteres**: el backend no arranca sin él. |
| `JWT_EXPIRES_IN` | No | Vida del token; por defecto `8h`. |
| `CARGAR_DEMO` | No | `1` carga los usuarios demo (clave `123456`). Por defecto `0`. |
| `FRONTEND_URL` | No | Origen permitido por CORS. |
| `MAILTRAP_HOST`, `MAILTRAP_PORT`, `MAILTRAP_USERNAME`, `MAILTRAP_PASSWORD`, `MAILTRAP_FROM` | No | Correo saliente. Los nombres coinciden con el compose y con el backend. |

### Frontend

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base de la API; en Docker producción es `/api` |
| `VITE_PROXY_TARGET` | Target del proxy de Vite en desarrollo; por defecto `http://localhost:3000` |
| `VITE_PORT` | Puerto opcional del servidor de desarrollo de Vite; por defecto `5173` |

Las variables `VITE_*` se incorporan al bundle durante `pnpm build`; cambiar una variable después de construir la imagen no modifica el JavaScript ya compilado.

---

## Integración continua
> La auditoría de dependencias se ejecuta en CI con severidad alta. Actualmente no bloquea el resto del pipeline porque existen vulnerabilidades transitivas provenientes de Prisma (`deepmerge-ts`, `mariadb` y `mysql2`). La corrección de estas dependencias queda como una tarea independiente y debe hacerse con pruebas de compatibilidad.

El proyecto utiliza GitHub Actions mediante el workflow `.github/workflows/ci.yml`.

El pipeline se ejecuta cuando:

- Se crea o actualiza un pull request hacia `develop` o `main`.
- Se hace push a `develop` o `main`.

Las validaciones ejecutadas son:

- Instalación reproducible de dependencias con `pnpm install --frozen-lockfile`.
- Auditoría de dependencias backend y frontend, reportada sin bloquear temporalmente el resto del pipeline.
- Lint del backend.
- Tests automatizados del backend con `node --test`.
- Migraciones `prisma migrate deploy` contra una MariaDB 11.4.4 levantada como `services` del job, con `ESTABLECIMIENTO_DB_TEST=1` y `SALON_DB_TEST=1` para que las pruebas de integración no se salten.
- Lint del frontend.
- Build de producción del frontend.
- Validación de la configuración de Docker Compose.
- Construcción de las imágenes Docker.

### Ejecutar las validaciones localmente

Desde la raíz del proyecto:

```bash
pnpm --dir backend run test
pnpm --dir backend run lint
pnpm --dir frontend run lint
pnpm --dir frontend run build
docker compose config
docker compose build
```

El test actual verifica que `GET /health` responda con:

```json
{
  "status": "RemiSoft Express online"
}
```

### Estado de cobertura

El backend tiene **21 archivos de prueba con 61 casos** (49 de ellos con subcasos), ejecutados con el runner nativo `node --test`:

| Nivel | Archivos | Casos | Necesita base de datos |
|-------|----------|-------|------------------------|
| Unitarias | 7 | 28 | No |
| Integración | 10 | 11 (49 subcasos) | Sí |
| End-to-end (Playwright) | 4 specs | 22 | Sí, con frontend servido |

Las pruebas de integración se saltan solas salvo que se cumplan dos condiciones: `ESTABLECIMIENTO_DB_TEST=1` (o `SALON_DB_TEST=1` en salón) y que `DB_DATABASE` termine en `_test`. Así el mismo comando funciona en una máquina sin base y en el pipeline, donde el job levanta MariaDB como servicio y aplica las migraciones. Los módulos cubiertos son aislamiento por sede (14 subcasos), panel de gerente (6), conteo y unidades de inventario (5 + 5), salón (4), cierre total (4), correo (3) y jornada (3).

Detalle completo del plan, del inventario de casos y de los resultados por nivel: [informe de pruebas](docs/informe-pruebas.md) y [reporte de ejecución](docs/04-reporte-ejecucion-pruebas.md).

---

## Correo y recuperación de contraseña

El proyecto usa Nodemailer/SMTP para enviar correos de recuperación en desarrollo.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/forgot-password` | Envía enlace de recuperación |
| `POST` | `/api/auth/reset-password` | Restablece contraseña con token válido |

Flujo:

1. El usuario ingresa su email.
2. Express genera un token temporal.
3. Nodemailer envía el correo.
4. El enlace apunta a la ruta de recuperación del frontend.
5. El usuario registra la nueva contraseña.

Las credenciales SMTP deben permanecer únicamente en archivos `.env` locales o en secretos del entorno.

---

## Autenticación y roles

Todas las rutas protegidas requieren:

```text
Authorization: Bearer <token>
```

### Catálogo de roles

El rol `CLIENTE` ya no es un usuario autenticable. La entidad `Cliente` se conserva para contacto, pedidos, domicilios y búsqueda por teléfono.

| id_rol | Nombre | Ruta frontend | Descripción |
|--------|--------|---------------|-------------|
| 1 | `SUPERADMIN` | `/superadmin` | Acceso total esperado |
| 2 | `GERENTE` | `/gerente` | Administración del restaurante |
| 3 | `CAJERO` | `/cajero` | Gestión de caja y pagos |
| 4 | `MESERO` | `/mesero` | Toma y gestión de pedidos |
| 5 | `REPARTIDOR` | `/repartidor` | Entrega de pedidos |

> El acceso efectivo por endpoint debe validarse con la matriz rol-permiso. No se debe asumir que la existencia de una ruta frontend equivale a autorización backend completa.

### Servicio de salón

En `/mesero`, cada tarjeta numerada abre la ficha de esa mesa con su estado y sus pedidos. El mesero puede ocuparla antes del primer pedido, tomar comandas, servir platos por ronda y enviar la precuenta a caja. Una mesa sin pedido se puede liberar desde su ficha; si hay consumo, sigue ocupada hasta que se cobre o se cancele válidamente el último pedido. Desde **Facturas**, el mesero puede generar una factura pendiente para una cuenta en caja y ajustar el receptor, descuento y propina. Al pagar, queda de solo lectura en el historial de MariaDB. [Guía de operación, API y pruebas](docs/servicio-de-salon.md).

### Flujo de autenticación

1. Login: Express valida credenciales y devuelve token, rol y usuario.
2. El frontend guarda el token en Redux/localStorage.
3. `axios.ts` adjunta el token mediante interceptor.
4. `PrivateRoute` controla el acceso visual a dashboards.
5. El backend valida el token y, cuando está configurado, el rol requerido.
6. Logout elimina la sesión local.

---

## Modelo multi-restaurante

La clave existente es **`id_restaurante`**. Crear un gerente desde Superadmin (o aprobar su solicitud) crea un establecimiento propio y vacío. El personal opera en la sede que la API obtiene del usuario en la BD. Productos, existencias, mesas, IA, ventas y demás actividad del panel no se comparten entre negocios. Un gerente sin ventas o sin análisis ve ese estado, no datos de ejemplo.

La carga de demostración incluye dos sedes con actividad distinta: Laura opera `Restaurante Principal` (`id_restaurante=1`) y Sebastián opera `Restaurante Norte` (`id_restaurante=2`). Sus mesas, menú, inventario, clientes, caja y pedidos son independientes; esta carga no se aplica a restaurantes creados posteriormente ni a instalaciones reales configuradas con `CARGAR_DEMO=0`.

Si la base de desarrollo de Codespaces ya estaba inicializada, carga solo el ejemplo faltante de Norte desde la raíz del repositorio. El script es idempotente y no borra los datos actuales:

```bash
docker compose exec -T db sh -c 'mariadb -u "$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE"' < database/demo/seed_restaurante_norte.sql
```

[Cierre total, revisión de pendientes y reapertura por sede](docs/establecimientos.md#cierre-total-y-reapertura-de-una-sede).

[Historial del gerente, baja de personal, ventas por fecha de pago y libro de caja](docs/establecimientos.md#historial-personal-y-caja).

[Guía de establecimientos: actualizar sin borrar datos, tratar históricos sin sede y probar el aislamiento](docs/establecimientos.md).

El middleware de autenticación soporta JWT estándar y tokens estilo Sanctum heredados, cuando corresponda.

### Comandos Prisma

```bash
pnpm --dir backend exec prisma generate
pnpm --dir backend exec prisma migrate deploy
pnpm --dir backend exec prisma migrate status
```

En Docker, estos comandos se ejecutan desde `database/init.sh` durante el arranque del backend.

---

## Documentación del proyecto

Documentación técnica elaborada a partir del código real del sistema:

| Documento | Contenido |
|-----------|-----------|
| [Modelo de datos](docs/modelo-de-datos.md) | MER (diagramas Entidad-Relación por dominios) y Modelo Relacional (MR) completo del esquema MariaDB |
| [Diagrama de clases](docs/diagrama-clases.md) | UML de clases: capas del backend (routers, middlewares, controllers, services, errores de dominio) y componentes del frontend |
| [Diagrama de arquitectura](docs/diagrama-arquitectura.md) | Arquitectura de despliegue (Docker Compose + nginx), capas lógicas y flujo de una petición autenticada |
| [API por endpoint](docs/api.md) | Los 122 endpoints de la API con peticiones, respuestas y errores |

---

## Endpoints del backend

Todas las rutas protegidas requieren `Authorization: Bearer <token>`.
Referencia **completa por endpoint** (peticiones, respuestas y errores): [docs/api.md](docs/api.md).

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login con email y contraseña |
| `POST` | `/api/auth/forgot-password` | Solicita recuperación |
| `POST` | `/api/auth/reset-password` | Restablece contraseña |
| `GET` | `/api/auth/me` | Consulta sesión autenticada |

### Módulos principales

| Módulo | Endpoint base |
|--------|---------------|
| Usuarios | `/api/usuarios` |
| Productos | `/api/productos` |
| Clientes | `/api/clientes` |
| Proveedores | `/api/proveedores` |
| Ingredientes | `/api/ingredientes` |
| Cajas | `/api/cajas` |
| Pedidos | `/api/pedidos` |
| Servicio de mesero | `/api/salon` |
| Comandas de cocina | `/api/cocina` |
| Cierre de cuenta | `/api/cobro` |
| Domicilios | `/api/domicilios` |
| Compras | `/api/compras` |
| Inventario | `/api/inventario` |
| Facturas | `/api/facturas` |
| Configuración | `/api/configuracion` |

También existen endpoints para categorías, detalles, gastos, turnos, permisos, notificaciones, estados, roles y tipos auxiliares. La lista completa debe mantenerse sincronizada con `backend/src/server.js` y `backend/src/routes/`.

---

## Flujo de trabajo Git

```text
main       ← código estable
 ↑
develop    ← integración
 ↑
feat/* / fix/* / docs/*
```

Flujo correcto:

```text
rama de trabajo → commit → push → PR a develop → merge → PR de develop a main
```

Convención de commits:

| Prefijo | Uso |
|---------|-----|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `refactor:` | Reorganización sin cambiar comportamiento |
| `chore:` | Configuración o mantenimiento |
| `docs:` | Documentación |
| `style:` | Formato o estilos |

Reglas:

- No hacer push directo a `main` o `develop`.
- Actualizar la rama base antes de crear una rama de trabajo.
- Verificar comandos reales antes de afirmar que algo funciona.
- Revisar `git diff` antes del commit y del merge.
- No subir `.env`, tokens, contraseñas ni credenciales SMTP.

---

## Diseño y UI

### Paleta de colores

| Token | Valor | Uso |
|-------|-------|-----|
| `--rojo` | `#D85A30` | Acciones primarias |
| `--rojo-light` | `#FAECE7` | Fondos de hover y badges |
| `--amarillo` | `#EF9F27` | Advertencias |
| `--verde` | `#1D9E75` | Confirmaciones |
| `--texto` | `#1A1A1A` | Tipografía principal |
| `--texto-muted` | `#5F5E5A` | Texto secundario |
| `--bg` | `#FDFAF7` | Fondo base |
| `--bg-card` | `#ffffff` | Tarjetas |
| `--borde` | `rgba(0,0,0,0.09)` | Bordes |

### Navegación por rol

| Rol | Ruta |
|-----|------|
| `SUPERADMIN` | `/superadmin` |
| `GERENTE` | `/gerente` |
| `MESERO` | `/mesero` (también puede abrir `/cocina`) |
| `CAJERO` | `/cajero` |
| `REPARTIDOR` | `/repartidor` |
| Público | `/`, `/forgot-password`, `/reset-password` |

---

## Notas técnicas y pendientes

### Hecho y validado

- Docker Compose ejecuta MariaDB, backend y frontend.
- El frontend se compila en una etapa Node y se sirve con nginx.
- nginx resuelve rutas de React Router mediante fallback a `index.html`.
- nginx reenvía `/api/` al servicio interno `backend:3000`.
- Prisma se genera dentro del build del backend y se copia al runtime.
- `database/init.sh` se ejecuta antes de iniciar Express.
- `DATABASE_URL` está disponible para Prisma CLI dentro de Compose.
- Una instalación limpia puede crear la base, ejecutar migraciones y cargar datos, vistas y procedimientos.
- El endpoint `/health` tiene una prueba automatizada ejecutada por Node Test Runner.
- El backend valida el entorno al arrancar y se niega a iniciar con un `JWT_SECRET` ausente, corto o de ejemplo.
- El compose no publica MariaDB ni la API fuera de `127.0.0.1` y exige las tres variables sensibles.
- El lint de backend y frontend pasa correctamente.
- El build de producción del frontend pasa correctamente.
- La configuración de Docker Compose es válida.
- Las imágenes Docker de backend y frontend se construyen correctamente.

### Pendientes reales

- Formalizar la matriz rol → permiso en un documento (hoy está aplicada en código con `requireRole`).
- Consumir `vista_pedidos_activos` mediante `/api/pedidos/activos`.
- Revisar los procedimientos y vistas SQL todavía no utilizados (22 consultas crudas, 6 vistas y 5 procedimientos).
- Fijar CVEs y dependencias con rangos abiertos: el audit de severidad alta está en `continue-on-error`, así que hoy informa pero no bloquea.
- Revocación de sesión: el JWT sigue siendo válido hasta que expira (columna `token_version` pendiente).
- Cabeceras de seguridad en la SPA (`frontend/nginx.conf`) y `sha256` del token de recuperación.
- Mover los 18 routers sin montar a `src/legacy/` o eliminarlos en un commit etiquetado.
- Separar configuración Docker de desarrollo y producción si el despliegue real lo requiere.

### Limitaciones de producción

La configuración actual es adecuada para reproducibilidad académica y validación del stack. Para producción real todavía faltaría, como mínimo:

- TLS/HTTPS delante de nginx.
- Backups y política de persistencia de MariaDB.
- Observabilidad y logs centralizados.
- Healthchecks explícitos para backend y frontend (hoy solo la base tiene healthcheck).
- Rotación de secretos y gestor de secretos (hoy viven en el `.env` del host).

---

## Licencia

Proyecto académico desarrollado para la gestión del restaurante Familia Remi.