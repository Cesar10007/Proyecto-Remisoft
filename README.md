# RemiSoft - Sistema Web Inteligente para Restaurantes

Sistema web con IA para automatizar pedidos, inventario, facturación y domicilios del restaurante Familia Remi.

## Equipo de desarrollo

| Nombre | Rol |
|--------|-----|
| Cesar David Rueda Daza | Líder / Full Stack |
| Juan Felipe Bello Perez | Frontend |
| Odalys Lizeth Layton Martinez | IA / Data Scientist |
| Kevin Duvan Bueno Melo | Tester / QA |

## Stack tecnológico

- **Backend:** PHP 8.2 + Laravel
- **Frontend:** React + Vite
- **Base de datos:** MariaDB
- **Entorno:** GitHub Codespaces

## Cómo iniciar el entorno

El entorno se configura automáticamente al abrir el Codespace. Cada vez que lo abras solo necesitas ejecutar en **dos terminales separadas**:

**Terminal 1 — Laravel:**
```bash
cd backend && php artisan serve
```

**Terminal 2 — React:**
```bash
cd frontend && npm run dev
```

- Laravel corre en `http://localhost:8000`
- React corre en `http://localhost:5173`

Para ver la base de datos visualmente usar SQLTools en el panel izquierdo de VS Code. La conexión **remisoft** ya está configurada.

## Estructura del proyecto

```
Proyecto-Remisoft/
├── .devcontainer/            # Configuración del entorno Codespaces
├── frontend/                 # Proyecto React + Vite
│   └── src/
│       ├── pages/            # Vistas por rol
│       │   ├── auth/         # Login, registro, landing
│       │   ├── admin/        # Panel administrador
│       │   ├── mesero/       # Toma de pedidos
│       │   ├── repartidor/   # Gestión de domicilios
│       │   └── cliente/      # Menú y pedidos
│       ├── components/       # Componentes reutilizables
│       │   ├── common/       # Botones, inputs, modales
│       │   └── layout/       # Navbar, footer
│       ├── services/         # Llamadas HTTP al backend
│       ├── hooks/            # Hooks personalizados
│       └── context/          # Estado global (usuario, rol)
├── backend/                  # Proyecto Laravel
│   └── app/
│       ├── Http/Controllers/ # Reciben peticiones HTTP
│       ├── Services/         # Lógica de negocio
│       ├── Repositories/     # Acceso a base de datos
│       └── Models/           # Entidades Eloquent
├── DBFAMILIAREMI.sql         # Estructura de la base de datos
└── datos.sql                 # Datos de prueba
```

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
| Juan Felipe Bello Perez | `feat/frontend-components` |
| Odalys Lizeth Layton Martinez | `feat/ia-modulo` |
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