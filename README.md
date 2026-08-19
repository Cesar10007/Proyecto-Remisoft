# RemiSoft — Sistema Web Inteligente para Restaurantes

Sistema web para automatizar pedidos, inventario, facturación y domicilios del restaurante Familia Remi.

> **Estado actual:** Frontend y backend completamente conectados. Backend Express + Prisma, autenticación JWT, módulos administrativos y pruebas CRUD funcionando sobre datos reales de MariaDB. La carpeta activa del backend es `backend/` y Laravel ya no forma parte del arranque del entorno.

---

## Tabla de contenido

1. [Equipo de desarrollo](#equipo-de-desarrollo)
2. [Stack y arquitectura](#stack-y-arquitectura)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Levantar el entorno](#levantar-el-entorno)
5. [Variables de entorno](#variables-de-entorno)
6. [Correo y recuperación de contraseña](#correo-y-recuperación-de-contraseña)
7. [Autenticación y roles](#autenticación-y-roles)
8. [API externa — TheMealDB](#api-externa--themealdb)
9. [Comunicación padre-hijo en React](#comunicación-padre-hijo-en-react)
10. [Interfaces y CRUD implementados](#interfaces-y-crud-implementados)
11. [Endpoints del backend](#endpoints-del-backend)
12. [Flujo de trabajo Git](#flujo-de-trabajo-git)
13. [Diseño y UI](#diseño-y-ui)
14. [Notas técnicas importantes](#notas-técnicas-importantes)

---

## Equipo de desarrollo

| Nombre | Rol en el equipo | Rama principal |
|--------|------------------|----------------|
| César David Rueda Daza | Líder / Full Stack | `feat/testing` |
| Juan Felipe Bello Pérez | Frontend / IA | `feat/ia-modulo` |
| Kevin Duvan Bueno Melo | Tester / QA | `feat/testing` |

---

## Stack y arquitectura

| Capa | Tecnología | Puerto |
|------|------------|--------|
| Frontend | React 19 + Vite + TypeScript | 5173 |
| Backend | Node.js + Express | 3000 |
| Base de datos | MariaDB | 3306 |
| ORM y migraciones | Prisma | — |
| Entorno | GitHub Codespaces | — |
| Auth | JWT | — |
| Estado global | Redux Toolkit | — |
| API externa | No confirmada en el backend Express actual | — |

React no se comunica directamente con MariaDB. Todo pasa por la API REST de Express en el puerto 3000.

### Dependencias principales

#### Frontend

| Librería | Versión | Uso |
|----------|---------|-----|
| React | 19.x | Framework principal de UI |
| Vite | 6.x | Servidor de desarrollo y build |
| TypeScript | 5.x | Tipado estático |
| react-router-dom | 7.x | Rutas y navegación por rol |
| Axios | 1.x | Cliente HTTP para consumir la API |
| Redux Toolkit | 2.x | Estado global (token, rol, usuario) |
| react-redux | 9.x | Integración de Redux con React |

#### Backend

| Librería | Versión | Uso |
|----------|---------|-----|
| Node.js | — | Runtime del backend |
| Express | — | Framework backend y API REST |
| Prisma | — | ORM, cliente tipado y migraciones |
| mysql2 | — | Conexión auxiliar con MariaDB |
| jsonwebtoken | — | Emisión y validación de JWT |
| bcryptjs | — | Hash y verificación de contraseñas |
| Nodemailer | — | Recuperación de contraseña por correo |

### Base de datos

| Campo | Valor |
|-------|-------|
| Motor | MariaDB |
| Base de datos | `remisoft` |
| Usuario | `remisoft` |
| Contraseña | ver `backend/.env` |
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
│   ├── datos.sql             # Datos semilla para desarrollo
│   ├── vistas/               # Vistas SQL
│   └── procedimientos/       # Procedimientos almacenados
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

## API externa — TheMealDB

La integración con TheMealDB no forma parte del backend Express activo confirmado. Si se conserva alguna pantalla o llamada antigua, debe validarse antes de documentarla como funcionalidad vigente.

---

## Comunicación padre-hijo en React

### Padre → Hijo (Props)

La comunicación entre componentes se realiza mediante props y callbacks, según las necesidades de `App.tsx`, los componentes de layout y los dashboards.

### Hijo → Padre (Callbacks)

Los componentes hijos notifican eventos al padre mediante callbacks como cierre de modales, actualización de sesión y acciones de formularios.

---

## Interfaces y CRUD implementados

| # | Entidad | Dashboard | Crear | Editar | Activar/Desactivar | Datos reales BD |
|---|---------|-----------|-------|--------|--------------------|-----------------|
| 1 | Productos | Gerente | ✅ | ✅ | ✅ | ✅ |
| 2 | Usuarios | SuperAdmin | ✅ | ✅ | ✅ | ✅ |
| 3 | Clientes | SuperAdmin | ✅ | ✅ | ✅ | ✅ |
| 4 | Proveedores | Gerente | ✅ | ✅ | ✅ | ✅ |
| 5 | Ingredientes | Gerente | ✅ | ✅ | ✅ | ✅ |
| 6 | Cajas | Gerente | ✅ | ✅ | ✅ | ✅ |
| 7 | Pedidos | Mesero | ✅ | ✅ | ✅ | ✅ |
| 8 | Domicilios | Repartidor | ✅ | ✅ | ✅ | ✅ |

> El “eliminar” en las entidades principales utiliza desactivación o soft delete para preservar la integridad referencial de la base de datos.

### Vista SQL y Procedimiento Almacenado

El backend conserva el uso de vistas SQL y procedimientos almacenados de MariaDB cuando los módulos los requieren. Prisma gestiona el esquema principal mediante migraciones versionadas.

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

- El proyecto usa la tabla `usuario`, no la convención `users` de Laravel.
- `axios.ts` usa un interceptor para adjuntar el token JWT en cada request automáticamente.
- Las URLs del Codespace van en los `.env` locales, nunca en el código fuente.
- El soft delete o cambio de estado se utiliza cuando una entidad tiene relaciones que impiden su eliminación física.
- Prisma gestiona el esquema mediante `prisma migrate deploy` y el cliente mediante `prisma generate`.
- Redux y AuthContext coexisten por compatibilidad con los dashboards existentes.
- Los puertos activos son 3000 para Express, 5173 para Vite y 3306 para MariaDB.
- Laravel, Composer, `php artisan` y el puerto 8000 ya no forman parte del arranque activo.
