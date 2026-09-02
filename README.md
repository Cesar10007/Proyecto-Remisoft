![Banner RemiSoft](./docs/banner-remisoft.png)

# RemiSoft — Sistema Web Inteligente para Restaurantes

![Estado](https://img.shields.io/badge/estado-migración%20activa-e67e22)
![Versión](https://img.shields.io/badge/versión-0.1.9-2f80ed)
![Licencia](https://img.shields.io/badge/licencia-proyecto%20académico-27ae60)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb)
![Backend](https://img.shields.io/badge/backend-Express%20%2B%20Prisma-6c5ce7)
![Base de datos](https://img.shields.io/badge/base%20de%20datos-MariaDB-c0392b)

---

Sistema web para automatizar pedidos, inventario, facturación y domicilios del restaurante Familia Remi.

> **Estado actual:** Frontend y backend completamente conectados. Backend Express + Prisma, autenticación JWT y módulos administrativos funcionando sobre datos de prueba de MariaDB. La carpeta activa del backend es `backend/`.

---

## Tabla de contenido

1. [Equipo de desarrollo](#equipo-de-desarrollo)
2. [Stack y arquitectura](#stack-y-arquitectura)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Levantar el entorno](#levantar-el-entorno)
5. [Variables de entorno](#variables-de-entorno)
6. [Correo y recuperación de contraseña](#correo-y-recuperación-de-contraseña)
7. [Autenticación y roles](#autenticación-y-roles)
8. [Modelo multi-restaurante](#modelo-multi-restaurante)
9. [Endpoints del backend](#endpoints-del-backend)
10. [Flujo de trabajo Git](#flujo-de-trabajo-git)
11. [Diseño y UI](#diseño-y-ui)
12. [Notas técnicas importantes](#notas-técnicas-importantes)

---

## Equipo de desarrollo

| Nombre | Rol en el equipo | Rama principal |
|--------|------------------|----------------|
| César David Rueda Daza | Líder / Full Stack | Ramas por funcionalidad o nueva implementación |
| Juan Felipe Bello Pérez | Frontend / IA | `feat/ia-modulo` |
| Kevin Duvan Bueno Melo | Tester / QA | `feat/testing` |

---

## Stack y arquitectura

| Capa | Tecnología | Puerto |
|------|------------|--------|
| Frontend | React 19.1.1 + Vite 7.0.6 + TypeScript 5.8.3 | 5173 |
| Backend | Node.js v20.19.4 + Express 5.1.0 | 3000 |
| Base de datos | MariaDB 11 | 3306 |
| ORM y migraciones | Prisma 7.9.1 | — |
| Entorno | GitHub Codespaces | — |
| Auth | JWT | — |
| Estado global | Redux Toolkit 2 | — |

React no se comunica directamente con MariaDB. Todo pasa por la API REST de Express en el puerto 3000.

### Dependencias principales

#### Frontend

| Librería | Versión | Uso |
|----------|---------|-----|
| React | 19.1.1 | Framework principal de UI |
| Vite | 7.0.6 | Servidor de desarrollo y build |
| TypeScript | 5.8.3 | Tipado estático |
| react-router-dom | 7.x | Rutas y navegación por rol |
| Axios | 1.x | Cliente HTTP para consumir la API |
| Redux Toolkit | 2.x | Estado global (token, rol, usuario) |
| react-redux | 9.x | Integración de Redux con React |

#### Backend

| Librería | Versión | Uso |
|----------|---------|-----|
| Node.js | v20.19.4 | Runtime del backend |
| Express | 5.1.0 | Framework backend y API REST |
| Prisma | 7.9.1 | ORM, cliente tipado y migraciones |
| ESLint | 9.39.5 | Linting del backend (`@eslint/js`, `globals`) |
| mysql2 | 3.x | Conexión auxiliar con MariaDB |
| jsonwebtoken | 9.x | Emisión y validación de JWT |
| bcryptjs | 2.x | Hash y verificación de contraseñas |
| Nodemailer | 7.x | Recuperación de contraseña por correo |

### Base de datos

| Campo | Valor |
|-------|-------|
| Motor | MariaDB 11 |
| Base de datos | `remisoft` |
| Usuario | `remisoft` |
| Contraseña | `remisoft123`|
| Puerto | 3306 |

---

## Estructura del proyecto

```bash
Proyecto-Remisoft/
├── .devcontainer/
│   ├── devcontainer.json     # Imagen, puertos y extensiones
│   ├── setup.sh              # Instalación inicial
│   └── start.sh              # Arranque automático de servicios
├── database/
│   ├── DBFAMILIAREMI.sql     # Estructura de la base de datos
│   ├── datos.sql              # Datos semilla para desarrollo
│   ├── vistas/                # Vistas SQL
│   └── procedimientos/        # Procedimientos almacenados
├── docs/
│   ├── HUs/                  # Historias de usuario
│   ├── RFs/                  # Requisitos funcionales
│   ├── RNFs/                 # Requisitos no funcionales
│   └── restricciones.md      # Restricciones y stack del proyecto
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── auth/         # Login, registro y recuperación
│       │   ├── superadmin/   # Dashboard SuperAdmin
│       │   ├── gerente/      # Dashboard Gerente
│       │   ├── mesero/       # Dashboard Mesero
│       │   └── repartidor/   # Dashboard Repartidor
│       ├── components/       # Componentes reutilizables y layout
│       ├── api/              # axios.ts y configuración de API
│       ├── store/            # Redux store y authSlice
│       └── context/          # AuthContext
└── backend/
    ├── prisma/
    │   ├── migrations/       # Migraciones versionadas
    │   └── schema.prisma     # Modelo de datos
    └── src/
        ├── config/           # Conexión a MariaDB
        ├── controllers/      # Controladores
        ├── middleware/       # Autenticación y validaciones
        ├── routes/           # Rutas Express
        └── server.js         # Montaje de la API
```

---

## Levantar el entorno

### Primera vez

Al crear el Codespace, `setup.sh` deja listo el entorno automáticamente:

- Instala MariaDB.
- Crea la base de datos `remisoft`.
- Ejecuta `prisma migrate deploy`.
- Ejecuta `prisma generate`.
- Carga datos, vistas y procedimientos cuando corresponde.
- Instala las dependencias del backend y frontend.
- Genera los archivos `.env` desde los ejemplos.
- No ejecuta Composer, `php artisan` ni Laravel.

### Cada vez que abres el Codespace

`start.sh` arranca los servicios automáticamente. Si no se levantan solos:

```bash
# Terminal 1 — Backend Express
pnpm --dir backend dev

# Terminal 2 — Frontend
pnpm --dir frontend dev
```

> **Importante:** Express escucha en el puerto 3000 y Vite en el 5173. El puerto 8000 ya no forma parte del entorno activo.

---

## Variables de entorno

Los archivos `.env` no están en el repositorio. `setup.sh` los genera automáticamente.

#### `backend/.env` — variables clave

| Variable | Descripción |
|----------|-------------|
| `DB_HOST` | Host de MariaDB |
| `DB_PORT` | Puerto de MariaDB |
| `DB_DATABASE` | Base de datos `remisoft` |
| `DB_USERNAME` | Usuario de MariaDB |
| `DB_PASSWORD` | Contraseña de MariaDB |
| `JWT_SECRET` | Secreto para firmar tokens JWT |
| `FRONTEND_URL` | URL del frontend para CORS |
| Variables SMTP | Configuración de correo |

#### `frontend/.env` — variables clave

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base del backend, normalmente `/api` |

---

## Correo y recuperación de contraseña

El proyecto usa Nodemailer/SMTP para enviar correos de recuperación en desarrollo.

### Endpoints

| Método | Endpoint | Descripción |
|----------|----------|-------------|
| `POST` | `/api/auth/forgot-password` | Envía enlace de recuperación al email |
| `POST` | `/api/auth/reset-password` | Restablece contraseña con token válido |

### Flujo

1. Usuario ingresa email en `/forgot-password`.
2. Express genera un token temporal.
3. Nodemailer envía el correo con el enlace.
4. El enlace apunta a `/reset-password?token=...&email=...`.
5. `ResetPassword` lee los parámetros y permite ingresar la nueva contraseña.

---

## Autenticación y roles

### Catálogo de roles

El rol `CLIENTE` (`id_rol = 6`) ya no es un usuario autenticable. La entidad `Cliente` se conserva para contacto, pedidos, domicilios y búsqueda por teléfono.

| id_rol | Nombre | Ruta frontend | Descripción |
|--------|--------|---------------|-------------|
| 1 | `SUPERADMIN` | `/superadmin` | Acceso total al sistema |
| 2 | `GERENTE` | `/gerente` | Administrador del restaurante |
| 3 | `CAJERO` | — | Gestión de caja y pagos |
| 4 | `MESERO` | `/mesero` | Toma y gestión de pedidos |
| 5 | `REPARTIDOR` | `/repartidor` | Entrega de pedidos a domicilio |

### Flujo de autenticación

1. Login → Express valida credenciales → devuelve `{ token, rol, user }`.
2. Frontend guarda token en `localStorage` y en Redux store.
3. `axios.ts` adjunta el token automáticamente en cada request mediante interceptor.
4. `PrivateRoute` valida el acceso antes de renderizar cada dashboard.
5. Logout elimina el token y finaliza la sesión.

---

## Modelo multi-restaurante

### Modelo restaurante

El sistema soporta múltiples sedes mediante el modelo `restaurante`:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_restaurante` | Int (PK) | Identificador único de la sede |
| `nombre` | String | Nombre del restaurante |
| `direccion` | String? | Dirección física |
| `telefono` | String? | Teléfono de contacto |
| `email` | String? | Correo de contacto |
| `activo` | Boolean | Si la sede está operativa |
| `fecha_creacion` | DateTime | Fecha de alta en el sistema |

### Relación usuario.id_restaurante

Cada usuario tiene un campo opcional `id_restaurante` (FK hacia `restaurante`) que determina a qué sede pertenece. Es nullable para permitir roles globales (como `SUPERADMIN`) que no están atados a una sede específica.

El JWT y las sesiones vía Sanctum incluyen `id_restaurante` en el payload del usuario autenticado (`middleware/auth.js`), disponible en `req.user.id_restaurante` para cualquier controlador que necesite filtrar por sede.

### Política jerárquica de acceso

- **SUPERADMIN**: acceso a todas las sedes, sin restricción de `id_restaurante`.
- **GERENTE, CAJERO, MESERO, REPARTIDOR**: operan dentro de la sede asignada en su `id_restaurante`.

> ⚠️ **Nota de estado:** al momento de esta documentación, el filtrado por `id_restaurante` está disponible en el payload de autenticación, pero su aplicación consistente en todos los controladores (para restringir consultas por sede) debe verificarse módulo por módulo antes de considerarse completa.

### Sedes de prueba

Los datos semilla (`database/datos.sql`) incluyen dos sedes para pruebas:

| id_restaurante | Nombre | Dirección |
|----------------|--------|-----------|
| 1 | Restaurante Principal | Calle 123 |
| 2 | Restaurante Norte | Carrera 45 #10-20 |

### Compatibilidad con Sanctum

El middleware de autenticación (`backend/src/middleware/auth.js`) soporta dos formatos de token en el mismo header `Authorization: Bearer <token>`:

- **JWT estándar**: verificado con `jsonwebtoken` y `JWT_SECRET`.
- **Token estilo Sanctum** (`id|token`): validado contra la tabla `personal_access_tokens`, permitiendo compatibilidad con tokens emitidos por versiones anteriores del sistema basadas en Laravel Sanctum.

### Migraciones y comandos de validación

```bash
# Generar el cliente de Prisma tras cambios en schema.prisma
cd backend
npx prisma generate

# Aplicar migraciones pendientes
npx prisma migrate deploy

# Ver el estado de las migraciones
npx prisma migrate status

# Validar el linting del backend
pnpm --dir backend run lint
```

---

## Endpoints del backend

Todas las rutas protegidas requieren `Authorization: Bearer <token>`.

### Autenticación públicas

| Método | Endpoint | Descripción |
|----------|----------|-------------|
| POST | `/api/auth/login` | Login con email y contraseña |
| POST | `/api/auth/forgot-password` | Envía correo de recuperación |
| POST | `/api/auth/reset-password` | Restablece contraseña con token |
| GET | `/api/auth/me` | Consulta la sesión autenticada |

### Protegidas

| Módulo | Endpoint base |
|---------|---------------|
| Usuarios | `/api/usuarios` |
| Productos | `/api/productos` |
| Clientes | `/api/clientes` |
| Proveedores | `/api/proveedores` |
| Ingredientes | `/api/ingredientes` |
| Cajas | `/api/cajas` |
| Pedidos | `/api/pedidos` |
| Domicilios | `/api/domicilios` |
| Compras | `/api/compras` |
| Inventario | `/api/inventario` |
| Facturas | `/api/facturas` |
| Configuración | `/api/configuracion` |

También existen rutas para categorías, detalles, gastos, turnos, permisos, notificaciones, estados, roles y tipos auxiliares.

---

## Flujo de trabajo Git

### Estructura de ramas

```text
main        ← código estable y aprobado
develop     ← rama de integración
└── feat/testing / feat/ia-modulo / docs/finalizar-migracion
```

### Flujo correcto

```text
rama de trabajo → commit → push → Pull Request a develop → merge → Pull Request a main
```

### Convención de commits

| Prefijo | Uso |
|---------|-----|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `refactor:` | Reorganización sin cambiar comportamiento |
| `chore:` | Configuración o mantenimiento |
| `docs:` | Documentación |
| `style:` | Formato / estilos sin cambiar lógica |

### Reglas del equipo

- Nunca hacer push directo a `main` o `develop`.
- Probar en la rama de trabajo antes de integrar.
- Hacer `pull` antes de tocar archivos.
- Revisar el diff antes del merge.

---

## Diseño y UI

### Paleta de colores (CSS variables globales)

| Token | Valor | Uso |
|-------|-------|-----|
| `--rojo` | `#D85A30` | Acciones primarias |
| `--rojo-light` | `#FAECE7` | Fondos de hover y badges |
| `--amarillo` | `#EF9F27` | Advertencias |
| `--verde` | `#1D9E75` | Confirmaciones |
| `--texto` | `#1A1A1A` | Tipografía principal |
| `--texto-muted` | `#5F5E5A` | Texto secundario |
| `--bg` | `#FDFAF7` | Fondo base |
| `--bg-card` | `#ffffff` | Fondo de tarjetas |
| `--borde` | `rgba(0,0,0,0.09)` | Bordes |

### Navegación por rol

| Rol | Ruta |
|-----|------|
| `SUPERADMIN` | `/superadmin` |
| `GERENTE` | `/gerente` |
| `MESERO` | `/mesero` |
| `REPARTIDOR` | `/repartidor` |
| Público | `/`, `/forgot-password`, `/reset-password` |

---

## Notas técnicas importantes

- El frontend se comunica con MariaDB únicamente a través de la API REST de Express.
- `backend/` es la ruta oficial del backend activo y contiene `src/`, `routes/`, `controllers/`, `middleware/` y `prisma/`.
- Prisma gestiona el esquema y las migraciones mediante `prisma migrate deploy`; `prisma generate` regenera el cliente de Prisma.
- JWT se utiliza para emitir y validar tokens de autenticación.
- `axios.ts` adjunta automáticamente el token JWT mediante un interceptor.
- Las URLs de Codespaces, contraseñas y secretos deben permanecer en los archivos `.env` locales.
- MariaDB usa datos ficticios de desarrollo; la contraseña documentada es `remisoft123`.
- Los puertos activos son 3000 para Express, 5173 para Vite y 3306 para MariaDB.
- `setup.sh` y `start.sh` automatizan la preparación y el arranque del entorno.