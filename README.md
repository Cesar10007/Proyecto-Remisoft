# RemiSoft — Sistema Web Inteligente para Restaurantes

Sistema web para automatizar pedidos, inventario, facturación y domicilios del restaurante Familia Remi.

> **Estado actual:** El proyecto conserva Laravel durante la migración gradual y añade un backend Express con Prisma. El entorno de Codespaces crea el esquema desde migraciones de Prisma, carga datos semilla cuando la base está vacía y arranca Laravel, Express y React.

---

## Tabla de contenido

1. [Equipo de desarrollo](#equipo-de-desarrollo)
2. [Stack y arquitectura](#stack-y-arquitectura)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Levantar el entorno](#levantar-el-entorno)
5. [Base de datos y Prisma](#base-de-datos-y-prisma)
6. [Variables de entorno](#variables-de-entorno)
7. [Autenticación y roles](#autenticación-y-roles)
8. [Vista y procedimiento de Productos](#vista-y-procedimiento-de-productos)
9. [Endpoints](#endpoints)
10. [Flujo de trabajo Git](#flujo-de-trabajo-git)
11. [Notas técnicas](#notas-técnicas)

---

## Equipo de desarrollo

| Nombre | Rol en el equipo | Rama principal | Correo |
|---|---|---|---|
| César David Rueda Daza | Líder / Full Stack | `feat/migracion` | [ruedacesardavid@gmail.com](mailto:ruedacesardavid@gmail.com) |
| Juan Felipe Bello Pérez | Frontend / IA | `feat/ia-modulo` | [jfbellop@gmail.com](mailto:jfbellop@gmail.com) |
| Kevin Duvan Bueno Melo | Tester / QA | `feat/testing` | [kevinbueno081@gmail.com](mailto:kevinbueno081@gmail.com) |

---

## Stack y arquitectura

| Capa | Tecnología | Puerto |
|---|---|---:|
| Frontend | React 19 + Vite + TypeScript | 5173 |
| API temporal | PHP 8.2 + Laravel 11 | 8000 |
| API en migración | Node.js + Express + Prisma | 3000 |
| Base de datos | MariaDB | 3306 |
| Entorno | GitHub Codespaces | — |
| Autenticación Laravel | Sanctum | — |
| Autenticación Express | JWT, con compatibilidad de lectura para tokens Sanctum | — |
| Estado global | Redux Toolkit | — |
| API externa | TheMealDB | — |

React consume APIs HTTP; no se comunica directamente con MariaDB. Durante la migración, Laravel atiende los módulos aún no migrados y Express atiende los módulos movidos a Prisma.

---

## Estructura del proyecto

```text
Proyecto-Remisoft/
├── .devcontainer/
│   ├── devcontainer.json      # Imagen, puertos, extensiones y comandos de ciclo de vida
│   ├── setup.sh               # Configuración inicial del entorno
│   └── start.sh               # Arranque de MariaDB, migraciones y servicios
├── database/
│   ├── DBFAMILIAREMI.sql      # Esquema histórico de referencia
│   ├── datos.sql              # Datos semilla para desarrollo
│   ├── vistas/                # Vistas SQL
│   └── procedimientos/        # Procedimientos almacenados
├── backend/                   # Laravel
├── backend-express/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/        # Migraciones versionadas de Prisma
│   └── src/                   # Express, rutas, controladores y middleware
└── frontend/                  # React + Vite
```

---

## Levantar el entorno

### Crear un Codespace nuevo

`postCreateCommand` ejecuta `.devcontainer/setup.sh`. El script:

- Instala e inicia MariaDB.
- Crea la base `remisoft` y el usuario local `remisoft` si no existen.
- Genera los archivos `.env` locales requeridos por Laravel, Express y React.
- Instala dependencias de Laravel, Express/Prisma y React.
- Ejecuta `prisma migrate deploy` en `backend-express` para crear o actualizar el esquema mediante las migraciones versionadas.
- Ejecuta `prisma generate`.
- Importa `database/datos.sql` solo si la tabla `Producto` está vacía.
- Carga las vistas y los procedimientos SQL después de crear las tablas y los datos.

El setup no ejecuta `DROP DATABASE` ni usa `prisma migrate reset` automáticamente.

### Reabrir el Codespace

`postStartCommand` ejecuta `.devcontainer/start.sh`. El script:

1. Inicia MariaDB.
2. Ejecuta `prisma migrate deploy` para aplicar únicamente migraciones pendientes.
3. Genera Prisma Client.
4. Arranca Laravel en 8000, Express en 3000 y React en 5173.

Si necesitas iniciar servicios manualmente:

```bash
# Terminal 1 — Laravel
cd backend
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2 — Express + Prisma
cd backend-express
pnpm dev

# Terminal 3 — React
cd frontend
pnpm dev -- --host=0.0.0.0
```

Puertos del entorno:

| Servicio | Puerto |
|---|---:|
| Laravel | 8000 |
| Express | 3000 |
| MariaDB | 3306 |
| React/Vite | 5173 |

---

## Base de datos y Prisma

### Credenciales locales de desarrollo

| Campo | Valor |
|---|---|
| Motor | MariaDB |
| Base de datos | `remisoft` |
| Usuario | `remisoft` |
| Contraseña | `remisoft123` |
| Host | `127.0.0.1` |
| Puerto | 3306 |

Estas credenciales son únicamente para el entorno local de Codespaces; no deben usarse en producción.

### Migraciones

La fuente de verdad del esquema para Express es:

```text
backend-express/prisma/migrations/
```

Cuando se cambie `backend-express/prisma/schema.prisma`, crear y aplicar la migración durante desarrollo:

```bash
cd backend-express
pnpm exec prisma migrate dev --name descripcion-del-cambio
pnpm exec prisma generate
```

Después se deben versionar los archivos generados:

```bash
git add prisma/migrations
```

Para un entorno nuevo o al reabrir el Codespace se usa:

```bash
pnpm exec prisma migrate deploy
```

> **Importante:** `pnpm exec prisma migrate reset` borra la base de desarrollo y sus datos. No debe usarse como parte del arranque normal ni después de importar `database/datos.sql`.

### Datos semilla

`database/datos.sql` contiene datos de desarrollo y asume que las tablas ya existen. Por eso se importa solamente después de las migraciones de Prisma y únicamente si `Producto` no tiene registros.

No se debe importar `DBFAMILIAREMI.sql` como parte del arranque de Prisma: es un esquema histórico y podría desalinear la base respecto de `prisma/migrations`.

---

## Variables de entorno

Los archivos `.env` se generan localmente y no deben subirse con secretos reales.

### `backend-express/.env`

Variables relevantes:

```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
DATABASE_URL="mysql://remisoft:remisoft123@127.0.0.1:3306/remisoft"
JWT_SECRET=remisoft_dev_jwt_secret_cambiar_en_produccion
JWT_EXPIRES_IN=8h
```

### `backend/.env`

Laravel usa MariaDB mediante `DB_CONNECTION=mysql`, `DB_DATABASE=remisoft`, `DB_USERNAME=remisoft` y `DB_PASSWORD=remisoft123` en desarrollo.

### `frontend/.env`

```env
VITE_API_URL=/api
```

El frontend usa rutas relativas y el proxy de Vite dirige cada petición a la API correspondiente durante la migración.

---

## Autenticación y roles

### Roles

| id_rol | Nombre | Descripción |
|---:|---|---|
| 1 | `SUPERADMIN` | Acceso total al sistema |
| 2 | `GERENTE` | Administración del restaurante |
| 3 | `CAJERO` | Gestión de caja y pagos |
| 4 | `MESERO` | Toma y gestión de pedidos |
| 5 | `REPARTIDOR` | Entrega de pedidos a domicilio |
| 6 | `CLIENTE` | Usuario cliente del restaurante |

### Express

Express expone autenticación JWT en:

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Recibe `email` y `contrasena`; devuelve un JWT |
| GET | `/api/auth/me` | Devuelve el usuario autenticado |
| POST | `/api/auth/logout` | Informa el cierre de sesión en cliente JWT |

Las rutas protegidas requieren:

```http
Authorization: Bearer <token>
```

El middleware de Express valida JWT y puede reconocer el formato de tokens Sanctum para compatibilidad durante la migración. La integración del frontend con el login de Express debe probarse antes de declararla como flujo principal.

---

## Vista y procedimiento de Productos

El módulo de Productos conserva tres formas de listado:

| Fuente | Endpoint Express | Consulta real |
|---|---|---|
| Tabla mediante Prisma | `GET /api/productos` | `prisma.producto.findMany()` |
| Vista SQL | `GET /api/productos/vista` | `vista_listado_productos` |
| Procedimiento almacenado | `GET /api/productos/sp` | `sp_listar_productos()` |

La vista y el procedimiento devuelven `id_producto` junto con los demás campos (`Nombre`, `Descripcion`, `precio_venta`, `Categoria`, `Tiempo_preparacion`, `Estado`). Esto permite que el frontend pueda editar o activar/desactivar el registro seleccionado, sin ocultar el identificador técnico.

Las definiciones SQL se encuentran en:

```text
database/vistas/vista_listado_productos.sql
database/procedimientos/sp_listar_productos.sql
```

Para aplicarlas manualmente en una base local ya creada:

```bash
mysql -u remisoft -p remisoft < database/vistas/vista_listado_productos.sql
mysql -u remisoft -p remisoft < database/procedimientos/sp_listar_productos.sql
```

---

## Endpoints

### Salud

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/health` | Verifica que Express está disponible |

### Productos en Express

Todas requieren `Authorization: Bearer <token>`.

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/productos` | Lista productos mediante Prisma |
| GET | `/api/productos/vista` | Lista productos desde la vista SQL |
| GET | `/api/productos/sp` | Lista productos desde el procedimiento almacenado |
| GET | `/api/productos/:id` | Obtiene un producto |
| POST | `/api/productos` | Crea un producto |
| PUT | `/api/productos/:id` | Actualiza un producto |
| DELETE | `/api/productos/:id` | Alterna el estado del producto; no realiza borrado físico |

Ejemplo de verificación de Express:

```bash
curl -i http://localhost:3000/health
```

---

## Flujo de trabajo Git

```text
main     ← código estable y aprobado
develop  ← rama de integración
└── feat/migracion ← migraciones de Prisma y Express
```

Flujo recomendado:

```text
feat/migracion → commit → push → Pull Request a develop → merge → Pull Request a main
```

Convención de commits:

| Prefijo | Uso |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `refactor:` | Reorganización sin cambiar comportamiento |
| `chore:` | Configuración o mantenimiento |
| `docs:` | Documentación |
| `style:` | Formato o estilos sin cambiar lógica |

---

## Notas técnicas

- La tabla de negocio es `usuario`, no la convención `users` de Laravel.
- El soft delete de Productos usa `Estado` (`1`/`0`) para preservar integridad referencial.
- Las vistas y procedimientos se aplican después de las migraciones porque dependen de las tablas.
- No se debe guardar `.env` con secretos de producción en Git.
- Antes de integrar cambios, ejecutar `git status`, validar los servicios afectados y subir las migraciones de Prisma junto con el cambio de esquema.
