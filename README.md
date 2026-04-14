# RemiSoft - Sistema Web Inteligente para Restaurantes

Sistema web con IA para automatizar pedidos, inventario, facturación y domicilios del restaurante Familia Remi.

## Equipo de desarrollo

| Nombre | Rol |
|--------|-----|
| Cesar David Rueda Daza | Líder / Full Stack |
| Odalys Lizeth Layton Martinez | Frontend |
| Juan Felipe Bello Perez | IA / Data Scientist |
| Kevin Duvan Bueno Melo | Tester / QA |

## Stack tecnológico

- **Backend:** PHP 8.2 + Laravel
- **Frontend:** React + Vite
- **Base de datos:** MariaDB
- **Entorno:** GitHub Codespaces

## Servicios y puertos

Cada servicio del proyecto corre en un puerto específico. Los tres deben estar activos para que el sistema funcione correctamente.

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| React / Vite | 5173 | Frontend — lo que ve el usuario en el navegador |
| Laravel | 8000 | Backend — API REST que procesa la lógica y la BD |
| MariaDB | 3306 | Base de datos — almacena toda la información del sistema |

React nunca se comunica directamente con MariaDB. Siempre pasa por Laravel a través de la API en `localhost:8000/api/`.

## Dependencias principales

### Frontend

| Librería | Versión | Uso en el proyecto |
|----------|---------|--------------------|
| React | 19.x | Framework principal de UI |
| Vite | 6.x | Servidor de desarrollo y compilador |
| react-router-dom | 7.14.0 | Manejo de rutas y navegación por rol |

### Backend

| Librería | Versión | Uso en el proyecto |
|----------|---------|--------------------|
| Laravel | 11.x | Framework backend y API REST |
| PHP | 8.2 | Lenguaje del backend |

> Cada vez que se instale una nueva librería con `npm install` o `composer require`, agregarla a esta tabla con su versión exacta y para qué se usa en el proyecto.

## Archivos de configuración del entorno

El entorno de desarrollo está controlado por tres archivos dentro de `.devcontainer/`:

**`devcontainer.json`** — le dice a GitHub Codespaces cómo construir el entorno. Define la imagen base del sistema operativo (PHP 8.2), instala Node.js automáticamente, expone los puertos 8000, 5173 y 3306, e instala las extensiones de VS Code que el equipo necesita. Se ejecuta una sola vez cuando se crea el Codespace por primera vez.

**`setup.sh`** — script que corre automáticamente después de que el entorno se construye por primera vez. Instala MariaDB, crea la base de datos `remisoft`, carga la estructura del SQL y los datos de prueba, configura el `.env` de Laravel y corre `composer install` y `npm install`. Deja todo listo sin que nadie tenga que instalar nada manualmente.

**`start.sh`** — script que corre cada vez que se abre el Codespace. Arranca los tres servicios automáticamente en segundo plano: MariaDB, Laravel en el puerto 8000 y React en el puerto 5173. Los logs quedan disponibles en `/tmp/laravel.log` y `/tmp/react.log`.

## Qué hacer cada vez que abres el Codespace

**Paso 1 — Verificar que los servicios están corriendo**

El `start.sh` los arranca automáticamente. Confirma en la terminal que ves:
```
React  →  http://localhost:5173
Laravel →  http://localhost:8000
```
Si no aparece, córrelos manualmente en dos terminales separadas:
```bash
# Terminal 1
cd backend && php artisan serve

# Terminal 2
cd frontend && npm run dev
```

**Paso 2 — Sincronizar tu código antes de tocar cualquier archivo**
```bash
git checkout main
git pull origin main
git checkout develop
git pull origin develop
git checkout feat/tu-rama-asignada
git pull origin feat/tu-rama-asignada
```

**Paso 3 — Verificar en qué rama estás**
```bash
git branch -vv
```
La rama activa aparece con `*`. Si no estás en tu rama asignada, cámbiate antes de tocar cualquier archivo.

**Paso 4 — Trabajar normalmente**

Ya puedes abrir archivos y hacer cambios.

> Si aprobaste un PR en GitHub, siempre corre el Paso 2 antes de seguir trabajando. No hacerlo causa que las ramas diverjan.

## Cómo iniciar el entorno

Para ver la base de datos visualmente usar SQLTools en el panel izquierdo de VS Code. La conexión **remisoft** ya está configurada.

## Estructura del proyecto

```
Proyecto-Remisoft/
├── .devcontainer/            # Configuración del entorno Codespaces
│   ├── devcontainer.json     # Define imagen, puertos y extensiones
│   ├── setup.sh              # Instalación inicial (corre una vez)
│   └── start.sh              # Arranque automático de servicios
├── frontend/                 # Proyecto React + Vite
│   └── src/
│       ├── pages/            # Vistas por rol — una carpeta por tipo de usuario
│       │   ├── auth/         # Landing, Login, Register — acceso público
│       │   ├── admin/        # Panel administrador
│       │   ├── mesero/       # Toma de pedidos
│       │   ├── repartidor/   # Gestión de domicilios
│       │   └── cliente/      # Menú y pedidos
│       ├── components/       # Componentes reutilizables
│       │   ├── common/       # Modal, botones, inputs
│       │   └── layout/       # Navbar, Footer
│       ├── services/         # Llamadas HTTP al backend (Axios)
│       ├── hooks/            # Hooks personalizados de React
│       └── context/          # Estado global: usuario autenticado y rol
├── backend/                  # Proyecto Laravel
│   └── app/
│       ├── Http/Controllers/ # Reciben peticiones HTTP de React
│       ├── Services/         # Lógica de negocio
│       ├── Repositories/     # Acceso a base de datos
│       └── Models/           # Entidades Eloquent
├── DBFAMILIAREMI.sql         # Estructura de la base de datos
└── datos.sql                 # Datos de prueba
```

## Navegación por roles — react-router-dom

El proyecto usa `react-router-dom` para manejar la navegación. Cada rol tiene su propia URL y solo puede acceder a las rutas que le corresponden. Cuando un usuario inicia sesión, el sistema lo redirige automáticamente según su rol:

| Rol | URL base |
|-----|----------|
| Administrador | `/admin/dashboard` |
| Mesero | `/mesero/pedidos` |
| Repartidor | `/repartidor` |
| Cliente | `/cliente/menu` |

Las rutas públicas (sin autenticación) son `/` para el landing, `/login` y `/registro`. Cualquier URL no reconocida redirige al inicio automáticamente.

## Base de datos

| Campo | Valor |
|-------|-------|
| Motor | MariaDB |
| Base de datos | remisoft |
| Usuario | remisoft |
| Contraseña | remisoft123 |
| Puerto | 3306 |
| Tablas | 24 |

> Estas credenciales son solo para el entorno de desarrollo en Codespaces.

## Estrategia de ramas

El proyecto usa la siguiente estructura de ramas:

```
main                            ← código estable y aprobado. Nadie pushea directo aquí.
develop                         ← rama de integración. Aquí se unen todos los cambios.
  ├── feat/frontend-landing     ← César Rueda
  ├── feat/frontend-components  ← Juan Felipe Bello
  ├── feat/ia-modulo            ← Odalys Layton
  └── feat/testing              ← Kevin Bueno
```

### Rama asignada por integrante

| Integrante | Rama |
|------------|------|
| César David Rueda Daza | `feat/frontend-landing` |
| Odalys Lizeth Layton Martinez | `feat/frontend-components` |
| Juan Felipe Bello Perez | `feat/ia-modulo` |
| Kevin Duvan Bueno Melo | `feat/testing` |

### Flujo de trabajo

```
Tu rama feat/  →  Push  →  Pull Request hacia develop  →  Revisión  →  Aprobado  →  develop
                                                                                         ↓
                                                                         (cuando esté estable)
                                                                                        main
```

1. Trabajas en tu rama `feat/` asignada
2. Cuando terminas algo que funciona hacés commit y push
3. Abrís un Pull Request en GitHub hacia `develop`
4. César como líder revisa y aprueba
5. Solo cuando `develop` está probado y estable se fusiona a `main`

### Cómo posicionarte en tu rama

Cada vez que abras el Codespace asegúrate de estar en tu rama antes de tocar cualquier archivo:

```bash
git checkout feat/tu-rama-asignada
git pull origin feat/tu-rama-asignada
```

### Cómo subir tus cambios

```bash
git add .
git commit -m "feat: descripción de lo que hiciste"
git push origin feat/tu-rama-asignada
```

### Cómo abrir un Pull Request

1. Ve a github.com/Cesar10007/Proyecto-Remisoft
2. Clic en **Pull requests** → **New pull request**
3. Base: `develop` ← Compare: `feat/tu-rama`
4. Escribe un título claro describiendo qué hiciste
5. Asigna a César como revisor
6. Clic en **Create pull request**

### Sincronizar después de aprobar un PR

Cada vez que se apruebe un PR en GitHub, antes de seguir trabajando sincroniza tu copia local:

```bash
git checkout main
git pull origin main
git checkout develop
git pull origin develop
git checkout feat/tu-rama-asignada
```

### Reglas del equipo

- **Nunca pushear directo a `main` o `develop`**
- Cada Pull Request debe ser revisado por César antes de aprobar
- Los commits deben seguir la convención definida abajo
- Una rama por tarea, no acumular cambios de varias tareas en una sola rama
- Antes de empezar a trabajar siempre hacer `git pull` para tener el código actualizado

## Convenciones de commits

El equipo usa la convención **Conventional Commits** para mantener un historial claro y legible.

| Prefijo | Uso |
|---------|-----|
| `feat:` | Nueva funcionalidad del sistema |
| `fix:` | Corrección de un error o bug |
| `chore:` | Configuración, mantenimiento o tareas que no afectan el código funcional |
| `docs:` | Cambios en documentación |
| `refactor:` | Reorganización de código sin cambiar su comportamiento |
| `test:` | Agregar o modificar pruebas |
| `style:` | Cambios de formato sin afectar lógica |

### Ejemplos

```bash
git commit -m "feat: agregar módulo de autenticación por roles"
git commit -m "fix: corregir descuento de inventario al registrar pedido"
git commit -m "chore: configurar MariaDB en setup.sh"
git commit -m "docs: actualizar README con instrucciones de inicio"
```
---
## SECCIONES POR ROL

- **Superadmin:**

  - Ver usuarios
  - Peticiones de usuarios
  - Configuración del sistema

- **Gerente:**

  - Control de menú
  - Control de inventario
  - Control de ingresos y egresos
  - Registro y control de pedidos
  - Control de meseros y mesas
  - Informes de IA
  - Información de proveedores
  - Historial de movimientos
  - Flujo de caja
  - Historial de pedidos
  - Historial de turnos de empleados

- Mesero:

  - Registrar venta
  - Generar factura
  - Ver pedidos por mesa

- Repartidor:

  - Ver pedidos asignados
  - Ver dirección de domicilio
  - Registrar método de pago
  - Confirmar entrega
