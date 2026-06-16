# RemiSoft — Sistema Web Inteligente para Restaurantes

Sistema web para automatizar pedidos, inventario, facturación y domicilios del restaurante Familia Remi.

> **Estado actual:** La autenticación está completamente conectada al backend real con Laravel Sanctum. Login, registro, logout y recuperación de contraseña funcionan sobre la API. Varias vistas del frontend siguen siendo prototipos visuales mientras se implementa la lógica completa.

***

## Tabla de contenido

1. [Equipo de desarrollo](#equipo-de-desarrollo)
2. [Stack y arquitectura](#stack-y-arquitectura)
   - [Dependencias principales](#dependencias-principales)
   - [Base de datos](#base-de-datos)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Levantar el entorno](#levantar-el-entorno)
   - [Primera vez](#primera-vez)
   - [Cada vez que abres el Codespace](#cada-vez-que-abres-el-codespace)
   - [Configuración del entorno](#configuración-del-entorno)
   - [Variables de entorno](#variables-de-entorno)
5. [Correo y recuperación de contraseña](#correo-y-recuperación-de-contraseña)
6. [Autenticación y roles](#autenticación-y-roles)
   - [Endpoints principales](#endpoints-principales)
   - [Requests de referencia](#requests-de-referencia)
   - [Respuesta confirmada de login](#respuesta-confirmada-de-login)
   - [Regla crítica sobre roles](#regla-crítica-sobre-roles)
   - [Modelo de permisos por rol](#modelo-de-permisos-por-rol)
   - [Catálogo actual de roles](#catálogo-actual-de-roles)
7. [Flujo de trabajo Git](#flujo-de-trabajo-git)
   - [Estructura de ramas](#estructura-de-ramas)
   - [Flujo correcto](#flujo-correcto)
   - [Rutina diaria recomendada](#rutina-diaria-recomendada)
   - [Cómo descargar actualizaciones en tu rama](#cómo-descargar-actualizaciones-en-tu-rama)
   - [Actualizar todas las ramas activas con main](#actualizar-todas-las-ramas-activas-con-main)
   - [Reglas del equipo](#reglas-del-equipo)
   - [Convención de commits](#convención-de-commits)
8. [Funcionalidades implementadas](#funcionalidades-implementadas)
9. [Diseño y UI por rol](#diseño-y-ui-por-rol)
   - [Paleta de colores](#paleta-de-colores)
   - [Navegación por rol](#navegación-por-rol)
   - [Secciones por rol](#secciones-por-rol)
10. [Notas técnicas importantes](#notas-técnicas-importantes)

***

## Equipo de desarrollo

| Nombre | Rol en el equipo | Rama principal |
|--------|------------------|----------------|
| César David Rueda Daza | Líder / Full Stack / IA | `feat/frontend-components` / `feat/frontend-landing`|
| Juan Felipe Bello Pérez | Frontend / IA |`feat/ia-modulo` |
| Kevin Duvan Bueno Melo | Tester / QA | `feat/testing` |

***

## Stack y arquitectura

| Capa | Tecnología | Puerto |
|------|------------|--------|
| Frontend | React 19 + Vite 6 | 5173 |
| Backend | PHP 8.2 + Laravel 11 | 8000 |
| Base de datos | MariaDB | 3306 |
| Entorno | GitHub Codespaces | — |

React no se comunica directamente con MariaDB. Todo pasa por la API REST de Laravel en el puerto 8000.

### Dependencias principales

#### Frontend

| Librería | Versión | Uso |
|----------|---------|-----|
| React | 19.x | Framework principal de UI |
| Vite | 6.x | Servidor de desarrollo y build |
| react-router-dom | 7.x | Rutas y navegación por rol |
| Axios | 1.x | Cliente HTTP para consumir la API |

#### Backend

| Librería | Versión | Uso |
|----------|---------|-----|
| Laravel | 11.x | Framework backend y API REST |
| PHP | 8.2 | Lenguaje del backend |
| Laravel Sanctum | 4.x | Autenticación por token |

> Cada vez que se instale una librería nueva con `npm install` o `composer require`, actualizar esta sección con versión y propósito.

### Base de datos

| Campo | Valor |
|-------|-------|
| Motor | MariaDB |
| Base de datos | `remisoft` |
| Usuario | `remisoft` |
| Contraseña | `remisoft123` |
| Puerto | 3306 |

> Estas credenciales son solo para desarrollo en Codespaces. No deben reutilizarse en producción.

***

## Estructura del proyecto

```bash
Proyecto-Remisoft/
├── .devcontainer/            # Configuración del entorno Codespaces
│   ├── devcontainer.json     # Imagen, puertos y extensiones
│   ├── setup.sh              # Instalación inicial (corre una sola vez)
│   └── start.sh              # Arranque automático de servicios
├── database/                 # SQL del proyecto
│   ├── DBFAMILIAREMI.sql     # Estructura de la base de datos
│   ├── datos.sql             # Datos semilla para desarrollo
│   ├── vistas/               # Vistas SQL
│   └── procedimientos/       # Procedimientos almacenados
├── frontend/                 # Proyecto React + Vite
│   └── src/
│       ├── pages/            # Vistas principales
│       │   ├── auth/         # Landing, login, registro, recuperar contraseña
│       │   ├── superadmin/   # Panel superadmin
│       │   ├── gerente/      # Panel gerente
│       │   ├── mesero/       # Toma de pedidos
│       │   ├── repartidor/   # Gestión de domicilios
│       │   └── cliente/      # (diferido)
│       ├── components/       # Componentes reutilizables
│       ├── api/              # Configuración Axios (usa VITE_API_URL)
│       ├── hooks/            # Hooks personalizados
│       └── context/          # Estado global de autenticación
└── backend/                  # Proyecto Laravel
    └── app/
        ├── Http/Controllers/ # Controladores HTTP
        ├── Http/Requests/    # Validaciones tipo FormRequest
        ├── Models/           # Modelos Eloquent
        ├── Notifications/    # Notificaciones (ej: reset de contraseña)
        └── Services/         # Lógica de negocio
```

> La estructura real del repositorio debe prevalecer sobre este esquema. Si una carpeta cambia, esta sección también debe actualizarse.

***

## Levantar el entorno

### Primera vez

Al crear el Codespace, `setup.sh` deja listo el entorno automáticamente:

- Instala MariaDB
- Crea la base de datos `remisoft`
- Carga `DBFAMILIAREMI.sql`, `datos.sql`, vistas y procedimientos
- Genera el `.env` de Laravel con las credenciales de DB y la URL del Codespace actual
- Corre `composer install`, `php artisan key:generate` y `php artisan migrate`
- Corre `npm install` en el frontend
- Genera `frontend/.env` con la URL del backend (`VITE_API_URL`)

### Cada vez que abres el Codespace

`start.sh` arranca los servicios automáticamente. Verifica que estén activos:

```
React   → http://localhost:5173
Laravel → http://localhost:8000
```

Si no se levantan solos, correr manualmente en terminales separadas:

```bash
# Terminal 1
cd backend && php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2
cd frontend && npm run dev
```

### Configuración del entorno

| Archivo | Cuándo corre | Qué hace |
|---------|-------------|----------|
| `devcontainer.json` | Al crear el Codespace | Define imagen, puertos (8000 y 5173 como Public) y extensiones |
| `setup.sh` | Una sola vez | Instala dependencias, configura DB, genera `.env` y corre migraciones |
| `start.sh` | Cada vez que abres | Arranca MariaDB, Laravel y React |

### Variables de entorno

Los archivos `.env` **no están en el repositorio** (están en `.gitignore`). `setup.sh` los genera automáticamente al crear el Codespace usando la variable `$CODESPACE_NAME` de GitHub.

#### `backend/.env` — variables clave

| Variable | Descripción |
|----------|-------------|
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` | `127.0.0.1` |
| `DB_DATABASE` | `remisoft` |
| `DB_USERNAME` | `remisoft` |
| `DB_PASSWORD` | `remisoft123` |
| `FRONTEND_URL` | URL del frontend en Codespaces (usada en `cors.php`) |
| `MAIL_MAILER` | `smtp` |
| `MAIL_HOST` | Host SMTP de Mailtrap |
| `MAIL_PORT` | `2525` |
| `MAIL_USERNAME` | Credencial Mailtrap (no subir al repo) |
| `MAIL_PASSWORD` | Credencial Mailtrap (no subir al repo) |
| `MAIL_FROM_ADDRESS` | `noreply@remisoft.com` |
| `MAIL_FROM_NAME` | `RemiSoft` |

#### `frontend/.env` — variables clave

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base del backend, ej: `https://<codespace>-8000.app.github.dev/api` |

> Si el Codespace cambia de URL (cuando se crea uno nuevo), actualizar estos valores en los `.env` locales o recrear el Codespace para que `setup.sh` los genere de nuevo.

***

## Correo y recuperación de contraseña

El proyecto usa **Mailtrap** para interceptar correos en desarrollo. Los correos reales nunca se envían a destinatarios reales.

### Configuración

Las credenciales de Mailtrap van en `backend/.env` (ver tabla de variables de entorno arriba). **Nunca subir las credenciales al repositorio.**

Para obtener las credenciales:
1. Ir a [mailtrap.io](https://mailtrap.io)
2. Email Testing → Inboxes → tu inbox → SMTP Settings
3. Copiar `Username` y `Password` al `backend/.env`

### Endpoints de recuperación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/forgot-password` | Recibe el email y envía el enlace de recuperación |
| `POST` | `/api/reset-password` | Recibe token, email y nueva contraseña |

#### Request — forgot-password

```json
{
  "email": "usuario@ejemplo.com"
}
```

#### Request — reset-password

```json
{
  "token": "token-del-enlace",
  "email": "usuario@ejemplo.com",
  "password": "nueva_contraseña",
  "password_confirmation": "nueva_contraseña"
}
```

### Flujo completo

1. Usuario ingresa su email en el formulario de recuperación
2. Laravel envía un correo con un enlace que contiene `token` y `email` como query params
3. El enlace apunta a `/reset-password?token=...&email=...` en el frontend
4. `ResetPassword.jsx` lee esos params y muestra el formulario de nueva contraseña
5. Al enviar, hace POST a `/api/reset-password` con token, email y nueva contraseña

> El correo se puede verificar en el inbox de Mailtrap durante desarrollo.

***

## Autenticación y roles

### Endpoints principales

| Método | Endpoint | Estado | Descripción |
|--------|----------|--------|-------------|
| `POST` | `/api/login` | ✅ Implementado | Valida credenciales, genera token y retorna usuario autenticado |
| `POST` | `/api/register` | ✅ Implementado | Registra un nuevo usuario con validación de datos y unicidad |
| `POST` | `/api/forgot-password` | ✅ Implementado | Envía correo de recuperación vía Mailtrap |
| `POST` | `/api/reset-password` | ✅ Implementado | Restablece la contraseña con token válido |
| `POST` | `/api/logout` | ✅ Implementado | Revoca el token actual de Sanctum — requiere `Authorization: Bearer <token>` |

### Requests de referencia

#### Login

```json
{
  "email": "carlos.ramirez@resto.com",
  "contrasena": "12345678"
}
```

#### Register

```json
{
  "id_rol": 4,
  "identificacion": "2001",
  "nombre": "Prueba",
  "apellido": "Usuario",
  "email": "prueba.usuario@resto.com",
  "telefono": "3005554444",
  "contrasena": "12345678",
  "contrasena_confirmation": "12345678"
}
```

#### Logout

```http
POST /api/logout
Authorization: Bearer <token>
```

Respuesta esperada:

```json
{
  "message": "Sesión cerrada"
}
```

### Respuesta confirmada de login

```json
{
  "token": "...",
  "rol": "GERENTE",
  "user": { ... }
}
```

### Regla crítica sobre roles

El frontend debe navegar usando **exactamente** el valor de `rol` que devuelve el backend. Este punto ya generó un bug real: el backend devolvía `ADMIN`, pero el frontend esperaba otro nombre de rol y el login parecía no hacer nada.

### Modelo de permisos por rol

| Rol | Puede crear / gestionar | Visibilidad |
|-----|------------------------|-------------|
| `SUPERADMIN` | Crea y gestiona Gerentes; configura el sistema | No ve Meseros ni Repartidores |
| `GERENTE` | Crea y gestiona Meseros, Repartidores y Cajeros de su restaurante | Ve la operación completa |
| `MESERO` | Toma pedidos, gestiona mesas | Vista de salón |
| `REPARTIDOR` | Ve y gestiona sus propias entregas | Vista de domicilios asignados |
| `CAJERO` | Gestiona caja y pagos | Vista de caja |

**Reglas de jerarquía:**
- `SUPERADMIN` no puede crear ni ver Meseros o Repartidores directamente; esa responsabilidad es del `GERENTE`.
- `GERENTE` solo administra usuarios de su propio restaurante.
- `MESERO`, `REPARTIDOR` y `CAJERO` no tienen permisos de gestión de usuarios.

### Catálogo actual de roles

> Esta tabla debe validarse contra la base de datos. Si cambia en BD, debe cambiar aquí y en las rutas del frontend.

| Valor en BD | Ruta frontend |
|-------------|---------------|
| `SUPERADMIN` | `/superadmin/dashboard` |
| `GERENTE` | `/gerente/dashboard` |
| `MESERO` | `/mesero/pedidos` |
| `REPARTIDOR` | `/repartidor` |

***

## Flujo de trabajo Git

### Estructura de ramas

```text
main        ← código estable y aprobado
develop     ← rama de integración
├── feat/frontend-components
├── feat/frontend-landing
├── feat/ia-modulo
└── feat/testing
```

### Flujo correcto

```text
feat/tu-rama → commit → push → Pull Request a develop → merge a develop
                                                               ↓
                                                       cuando esté estable
                                                               ↓
                                                    Pull Request a main
```

### Rutina diaria recomendada

Antes de empezar a trabajar:

```bash
git checkout main && git pull origin main
git checkout develop && git pull origin develop
git checkout feat/tu-rama-asignada && git pull origin feat/tu-rama-asignada
```

Subir cambios:

```bash
git add .
git commit -m "feat: descripción de lo que hiciste"
git push origin feat/tu-rama-asignada
```

### Cómo descargar actualizaciones en tu rama

> [!IMPORTANT]
> Si un cambio ya fue agregado a `main`, no va a aparecer automáticamente en tu rama.
> Cada integrante debe traer los cambios de `main` a su propia rama antes de seguir trabajando.

```bash
# 1) Actualizar main local
git checkout main
git fetch origin --prune
git merge origin/main

# 2) Volver a tu rama y mezclar main
git checkout feat/tu-rama
git merge main

# 3) Subir la rama actualizada
git push origin feat/tu-rama
```

### Actualizar todas las ramas activas con main

```bash
git checkout main
git fetch origin --prune
git merge origin/main
git push origin main

for branch in develop feat/frontend-components feat/frontend-landing feat/ia-modulo feat/testing
do
  git checkout "$branch" || continue
  git merge main
  git push origin "$branch"
done

git checkout main
```

> [!WARNING]
> Este proceso puede generar conflictos si una rama tiene cambios incompatibles con `main`. No usarlo sobre ramas con trabajo sin revisar.

### Reglas del equipo

- Nunca hacer push directo a `main` o `develop`.
- Cada tarea debe salir desde una rama `feat/*` creada a partir de `develop`.
- Probar en la rama de trabajo antes de integrar a `develop`.
- Hacer `pull` antes de tocar archivos para evitar conflictos innecesarios.

### Convención de commits

| Prefijo | Uso |
|---------|-----|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `refactor:` | Reorganización sin cambiar comportamiento |
| `chore:` | Configuración o mantenimiento |
| `docs:` | Documentación |
| `test:` | Pruebas |
| `style:` | Formato / estilos sin cambiar lógica |

***

## Funcionalidades implementadas

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| Autenticación (login) | ✅ Implementado | Login real con Sanctum. Laravel valida credenciales, genera token y retorna usuario autenticado |
| Registro de usuarios | ✅ Implementado | Endpoint funcional con validación y persistencia en base de datos |
| Validación de duplicados | ✅ Implementado | Register responde `422` cuando identificación o correo ya existen |
| Hash de contraseñas | ✅ Implementado | Login compara contraseña ingresada contra hash con `Hash::check()` |
| Redirección por rol | ✅ Implementado | Frontend redirige según el valor exacto de `rol` que devuelve la API |
| Recuperación de contraseña | ✅ Implementado | Flujo completo con Mailtrap: forgot-password → correo → reset-password |
| Logout | ✅ Implementado | `currentAccessToken()->delete()` en `AuthController`. Ruta protegida por `auth:sanctum` |
| Gestión de pedidos | 🔲 Prototipo visual | Sin integración real al backend |
| Facturación | 🔲 Prototipo visual | Sin persistencia real |
| Inventario | 🔲 Prototipo visual | Sin lógica de descuento automático |
| Domicilios | 🔲 Prototipo visual | Sin flujo real de estados |
| Módulo IA | 🔲 No iniciado | Requiere meses de datos operativos antes de activarse |

***

## Diseño y UI por rol

### Paleta de colores

| Token CSS | Valor | Uso |
|-----------|-------|-----|
| `--rojo` | `#D85A30` | Botones y acciones primarias |
| `--amarillo` | `#EF9F27` | Advertencias |
| `--verde` | `#1D9E75` | Confirmaciones |
| Texto | `#1A1A1A` | Tipografía principal |
| Fondo | `#FDFAF7` | Fondo base |

### Navegación por rol

| Rol | Ruta base |
|-----|-----------|
| `SUPERADMIN` | `/superadmin/dashboard` |
| `GERENTE` | `/gerente/dashboard` |
| `MESERO` | `/mesero/pedidos` |
| `REPARTIDOR` | `/repartidor` |
| Público | `/`, `/login`, `/registro` |

### Secciones por rol

- **Superadmin:** gestión de gerentes, configuración del sistema.
- **Gerente:** usuarios, pedidos, inventario, facturación, domicilios, caja.
- **Mesero:** registrar venta, generar factura, ver pedidos por mesa.
- **Repartidor:** ver pedidos asignados, dirección, método de pago y confirmar entrega.

***

## Notas técnicas importantes

- El proyecto usa tabla `usuario`, no la convención estándar `users` de Laravel. El modelo `Usuario` tiene configuración explícita de tabla primaria.
- Si la tabla `usuario` no tiene `created_at` y `updated_at`, el modelo debe usar `public $timestamps = false;` para evitar errores SQL.
- La tabla `personal_access_tokens` la crea Laravel con `php artisan migrate`, no el SQL heredado. Si falta, el login falla al intentar crear el token de Sanctum.
- Las URLs del Codespace van en los `.env` locales, nunca en el código. `axios.js` usa `import.meta.env.VITE_API_URL` y `cors.php` usa `env('FRONTEND_URL')`.
- No asumir nombres de roles. El contrato correcto es el que devuelve la API en tiempo real.
- Cada cambio de contrato entre frontend y backend debe reflejarse en este README el mismo día que se mergea a `develop`.