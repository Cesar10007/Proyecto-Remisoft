# RemiSoft — Sistema Web Inteligente para Restaurantes

Sistema web para automatizar pedidos, inventario, facturación y domicilios del restaurante Familia Remi.

> **Estado actual:** Frontend y backend completamente conectados. Autenticación con Laravel Sanctum, 6 roles implementados, 8 interfaces con CRUD completo funcionando sobre datos reales de MariaDB. Dashboard de cliente con integración a API externa (TheMealDB).

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

| Nombre | Rol en el equipo | Rama principal | Correo | 
|--------|------------------|----------------|--------|
| César David Rueda Daza | Líder / Full Stack | `feat/testing` | ruedacesardavid@gmail.com |
| Juan Felipe Bello Pérez | Frontend / IA | `feat/ia-modulo` | jfbellop@gmail.com |
| Kevin Duvan Bueno Melo | Tester / QA | `feat/testing` | kevinbueno081@gmail.com |

---

## Stack y arquitectura

| Capa | Tecnología | Puerto |
|------|------------|--------|
| Frontend | React 19 + Vite + TypeScript | 5173 |
| Backend | PHP 8.2 + Laravel 11 | 8000 |
| Base de datos | MariaDB | 3306 |
| Entorno | GitHub Codespaces | — |
| Auth | Laravel Sanctum | — |
| Estado global | Redux Toolkit | — |
| API externa | TheMealDB | — |

React no se comunica directamente con MariaDB. Todo pasa por la API REST de Laravel en el puerto 8000.

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
| Laravel | 11.x | Framework backend y API REST |
| PHP | 8.2 | Lenguaje del backend |
| Laravel Sanctum | 4.x | Autenticación por token |

### Base de datos

| Campo | Valor |
|-------|-------|
| Motor | MariaDB |
| Base de datos | `remisoft` |
| Usuario | `remisoft` |
| Contraseña | remisoft123 |
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
│       │   ├── auth/         # Landing, Login, Register, ForgotPassword, ResetPassword
│       │   ├── superadmin/   # Dashboard SuperAdmin (CRUD Usuarios + Clientes)
│       │   ├── gerente/      # Dashboard Gerente (CRUD Productos + Ingredientes + Proveedores + Cajas)
│       │   ├── mesero/       # Dashboard Mesero (CRUD Pedidos)
│       │   ├── repartidor/   # Dashboard Repartidor (CRUD Domicilios)
│       │   └── cliente/      # Dashboard Cliente (Menú + TheMealDB API)
│       ├── components/
│       │   ├── common/       # Modal, PrivateRoute
│       │   └── layout/       # Navbar, Footer
│       ├── api/              # axios.ts — configuración con interceptor de token
│       ├── store/            # Redux store, authSlice
│       └── context/          # AuthContext — estado de sesión
└── backend/
    └── app/
        ├── Http/Controllers/ # AuthController, ProductoController, ClienteController,
        │                     # UsuarioController, ProveedorController, IngredienteController,
        │                     # CajaController, PedidoController, DomicilioController,
        │                     # PasswordResetController
        ├── Http/Requests/    # RegisterUsuarioRequest
        ├── Models/           # Usuario, Rol
        └── Notifications/    # ResetPasswordNotification
```

---

## Levantar el entorno

### Primera vez

Al crear el Codespace, `setup.sh` deja listo el entorno automáticamente:

- Instala MariaDB
- Crea la base de datos `remisoft`
- Carga `DBFAMILIAREMI.sql`, `datos.sql`, vistas y procedimientos
- Genera el `.env` de Laravel con las credenciales de DB y la URL del Codespace
- Corre `composer install`, `php artisan key:generate` y `php artisan migrate`
- Corre `npm install` en el frontend
- Genera `frontend/.env` con la URL del backend (`VITE_API_URL`)

### Cada vez que abres el Codespace

`start.sh` arranca los servicios automáticamente. Si no se levantan solos:

```bash
# Terminal 1 — Backend
cd backend && php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2 — Frontend
cd frontend && npm run dev
```

> **Importante:** Los puertos 8000 y 5173 deben estar en **Public** en la pestaña Ports de Codespaces. Se resetean a Private al reabrir el workspace.

---

## Variables de entorno

Los archivos `.env` no están en el repositorio. `setup.sh` los genera automáticamente.

#### `backend/.env` — variables clave

| Variable | Descripción |
|----------|-------------|
| `DB_CONNECTION` | `mysql` |
| `DB_DATABASE` | `remisoft` |
| `DB_USERNAME` | `remisoft` |
| `FRONTEND_URL` | URL del frontend en Codespaces (usada en `cors.php`) |
| `MAIL_MAILER` | `smtp` |
| `MAIL_HOST` | Host SMTP de Mailtrap |
| `MAIL_PORT` | `2525` |

#### `frontend/.env` — variables clave

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base del backend, ej: `https://<codespace>-8000.app.github.dev/api` |

---

## Correo y recuperación de contraseña

El proyecto usa **Mailtrap** para interceptar correos en desarrollo.

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/forgot-password` | Envía enlace de recuperación al email |
| `POST` | `/api/reset-password` | Restablece contraseña con token válido |

### Flujo

1. Usuario ingresa email en `/forgot-password`
2. Laravel envía correo con enlace que contiene `token` y `email`
3. El enlace apunta a `/reset-password?token=...&email=...`
4. `ResetPassword.tsx` lee los params y permite ingresar nueva contraseña

---

## Autenticación y roles

### Catálogo de roles

| id_rol | Nombre | Ruta frontend | Descripción |
|--------|--------|---------------|-------------|
| 1 | `SUPERADMIN` | `/superadmin` | Acceso total al sistema |
| 2 | `GERENTE` | `/gerente` | Administrador del restaurante |
| 3 | `CAJERO` | — | Gestión de caja y pagos |
| 4 | `MESERO` | `/mesero` | Toma y gestión de pedidos |
| 5 | `REPARTIDOR` | `/repartidor` | Entrega de pedidos a domicilio |
| 6 | `CLIENTE` | `/cliente` | Usuario cliente del restaurante |

### Usuarios de prueba

Todos tienen contraseña: `123456`

| Email | Rol |
|-------|-----|
| `carlos.ramirez@resto.com` | SUPERADMIN |
| `laura.gomez@resto.com` | GERENTE |
| `andres.torres@resto.com` | CAJERO |
| `sofia.martinez@resto.com` | MESERO |
| `juan.lopez@resto.com` | REPARTIDOR |
| `cliente@resto.com` | CLIENTE |

### Registro público

El endpoint `/api/register` asigna automáticamente `id_rol = 6` (CLIENTE). No es posible registrarse con otro rol desde el formulario público.

### Flujo de autenticación

1. Login → Laravel valida credenciales → devuelve `{ token, rol, user }`
2. Frontend guarda token en `localStorage` y en Redux store
3. `axios.ts` adjunta el token automáticamente en cada request via interceptor
4. `PrivateRoute` valida rol antes de renderizar cada dashboard
5. Logout revoca el token en Sanctum

---

## API externa — TheMealDB

**Endpoint usado:** `https://www.themealdb.com/api/json/v1/1/random.php`

**Integración:** Dashboard del Cliente (`/cliente`). Se realizan 3 llamadas en paralelo con `Promise.all` para mostrar 3 platos aleatorios del mundo en la sección "Sugerencias del día".

**Propósito de negocio:** Inspiración culinaria para el cliente mientras visualiza el menú del restaurante.

No requiere API key. Los datos incluyen nombre del plato, imagen, categoría y país de origen.

---

## Comunicación padre-hijo en React

### Padre → Hijo (Props)

**Dónde:** `App.tsx` → `Navbar.tsx` y `Landing.tsx`

```tsx
// App.tsx (padre) pasa callbacks como props
<Navbar onLogin={() => setModal('login')} onRegister={() => setModal('registro')} />
<Landing onRegister={() => setModal('registro')} />
```

`Navbar` y `Landing` reciben estas funciones y las invocan cuando el usuario hace clic en los botones de Login/Registro, lo que abre el modal en `App.tsx`.

### Hijo → Padre (Callbacks)

**Dónde:** `Login.tsx` y `Register.tsx` → `App.tsx`

```tsx
// Login.tsx (hijo) llama al callback del padre para cerrar el modal
<Login onClose={() => setModal(null)} />

// Dentro de Login.tsx
onClose?.()  // notifica al padre que cierre el modal
```

**Dónde también:** `Modal.tsx` → cualquier dashboard

```tsx
// Modal recibe onClose del padre y lo ejecuta al hacer clic fuera
<Modal isOpen={modalAbierto} onClose={cerrarModal}>
```

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

> El "eliminar" en todas las entidades es un **soft delete** (cambio de estado) para preservar la integridad referencial de la base de datos. Un producto con pedidos asociados no puede borrarse físicamente sin romper `Detalle_pedido`.

### Vista SQL y Procedimiento Almacenado

El dashboard de Gerente implementa un **selector de fuente de datos** para productos:

- **Vista SQL** (`vista_listado_productos`) — consulta directa optimizada
- **Procedimiento Almacenado** (`sp_listar_productos`) — encapsulamiento de lógica en BD

Esto cumple el requisito académico de demostrar dos mecanismos distintos de consulta en MariaDB.

---

## Endpoints del backend

Todas las rutas protegidas requieren `Authorization: Bearer <token>`.

### Autenticación (públicas)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/login` | Login con email y contraseña |
| POST | `/api/register` | Registro (asigna rol CLIENTE automáticamente) |
| POST | `/api/forgot-password` | Envía correo de recuperación |
| POST | `/api/reset-password` | Restablece contraseña |

### Protegidas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/logout` | Revoca token |
| GET | `/api/productos/vista` | Productos desde Vista SQL |
| GET | `/api/productos/sp` | Productos desde Procedimiento Almacenado |
| POST/PUT/DELETE | `/api/productos/{id}` | CRUD Productos |
| GET/POST/PUT/DELETE | `/api/clientes/{id?}` | CRUD Clientes |
| GET/POST/PUT/DELETE | `/api/usuarios/{id?}` | CRUD Usuarios |
| GET/POST/PUT/DELETE | `/api/proveedores/{id?}` | CRUD Proveedores |
| GET/POST/PUT/DELETE | `/api/ingredientes/{id?}` | CRUD Ingredientes |
| GET/POST/PUT/DELETE | `/api/cajas/{id?}` | CRUD Cajas |
| GET/POST/PUT/DELETE | `/api/pedidos/{id?}` | CRUD Pedidos |
| GET/POST/PUT/DELETE | `/api/domicilios/{id?}` | CRUD Domicilios |

---

## Flujo de trabajo Git

### Estructura de ramas

```text
main        ← código estable y aprobado
develop     ← rama de integración
└── feat/testing   ← rama activa de desarrollo
```

### Flujo correcto

```text
feat/testing → commit → push → Pull Request a develop → merge → Pull Request a main
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

- Nunca hacer push directo a `main` o `develop`
- Probar en la rama de trabajo antes de integrar
- Hacer `pull` antes de tocar archivos

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
| `CLIENTE` | `/cliente` |
| Público | `/`, `/forgot-password`, `/reset-password` |

---

## Notas técnicas importantes

- El proyecto usa tabla `usuario`, no la convención `users` de Laravel. El modelo `Usuario` tiene configuración explícita de tabla primaria y `public $timestamps = false`.
- `axios.ts` usa interceptor para adjuntar el token de Sanctum en cada request automáticamente.
- Las URLs del Codespace van en los `.env` locales, nunca en el código fuente.
- El soft delete en Productos usa el campo `Estado` (1/0) en lugar de DELETE físico para preservar integridad referencial con `Detalle_pedido`, `Receta` e `IA_PRODUCTO`.
- Redux y AuthContext coexisten por compatibilidad: Redux maneja el estado global, AuthContext provee el contexto a los dashboards existentes.
- Los puertos 8000 y 5173 deben marcarse como Public en Codespaces cada vez que se reabre el workspace.
