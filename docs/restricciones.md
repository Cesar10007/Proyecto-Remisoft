# Restricciones del Proyecto — RemiSoft

<!--
  ¿Qué? Restricciones globales que gobiernan todo el proyecto.
  ¿Para qué? Definir límites claros de tecnología, diseño, seguridad y organización que no son negociables.
  ¿Impacto? Cualquier decisión técnica o de diseño debe verificarse contra estas restricciones antes de implementarse.
-->

---

## 1. Restricciones Tecnológicas

### RT-001 — Stack Tecnológico Fijo

El stack tecnológico está definido y **no puede modificarse** sin aprobación explícita de César (líder) o del instructor:

| Capa            | Tecnología                          |
| --------------- | ------------------------------------ |
| Framework FE    | React 19 + Vite 6                   |
| Framework BE    | PHP 8.2 + Laravel 11                |
| Base de datos   | MariaDB                             |
| ORM             | Eloquent (Laravel)                  |
| Auth            | Laravel Sanctum (tokens)            |
| Hashing         | bcrypt (Laravel `Hash::make`)       |
| Rutas FE        | react-router-dom                    |
| Entorno         | GitHub Codespaces                   |

### RT-002 — Gestión de Paquetes

- Frontend: `npm` (no mezclar con `yarn`/`pnpm`)
- Backend: `composer`
- Cada librería nueva debe registrarse en el README con versión exacta y propósito

### RT-003 — Idiomas Soportados (i18n)

- Si el sistema soporta más de un idioma, solo `"es"` (Español) por defecto — cualquier otro idioma debe aprobarse antes de agregarse

---

## 2. Restricciones de Herramientas y Entorno

### RH-001 — Control de Versiones

- Ramas: `main` (estable) → `develop` (integración) → `feat/tu-rama` (trabajo individual)
- **NUNCA** hacer commits directamente en `main` ni en `develop`
- **NUNCA** usar `git push --force`
- Los merges a `develop` requieren Pull Request revisado por César
- Los merges a `main` solo se hacen desde `develop` cuando está estable

### RH-002 — Entorno de Desarrollo

- El entorno se levanta en GitHub Codespaces vía `.devcontainer/setup.sh` y `start.sh`
- Backend: `php artisan serve` (puerto 8000)
- Frontend: `npm run dev` (puerto 5173)
- Base de datos: MariaDB (puerto 3306), inspección con SQLTools en VS Code

---

## 3. Restricciones de Diseño Visual

### RD-001 — Paleta de Colores Fija

- Usar exclusivamente los tokens definidos: rojo `#D85A30`, amarillo `#EF9F27`, verde `#1D9E75`, texto `#1a1a1a`, fondo `#FDFAF7`
- No introducir colores nuevos sin aprobación

### RD-002 — Consistencia Visual por Rol

- Todas las interfaces deben mantener el mismo sidebar, misma lógica de topbar, misma paleta y jerarquía tipográfica, mismos estilos de cards y botones
- Solo cambia el contenido específico de cada rol (Admin, Mesero, Repartidor, Cliente)

---

## 4. Restricciones de Idioma

### RI-001 — Código en Inglés

Todo lo que sea código debe estar en inglés: variables, funciones, clases, nombres de archivos/carpetas de código, endpoints, nombres de tablas/columnas, nombres de componentes React.

### RI-002 — Documentación en Español

Todo lo que sea documentación debe estar en español: comentarios en el código, archivos `.md`, README, mensajes de error visibles al usuario.

**Excepción**: mensajes de commit siguen la convención acordada por el equipo (`feat:`, `fix:`, `docs:`, etc. en inglés como prefijo).

---

## 5. Restricciones Organizacionales

### RO-001 — Calidad Mínima No Negociable

- Sin errores de linter antes de hacer commit
- Cada funcionalidad crítica (login, pedidos, facturación, inventario) debe probarse manualmente antes de marcarse como "Implementada" en el README

### RO-002 — Formato de Commits

- Prefijos permitidos: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`
- Ejemplo: `git commit -m "feat: agregar módulo de autenticación por roles"`

### RO-003 — Variables de Entorno

- El archivo `.env` no debe versionarse (debe estar en `.gitignore`)
- Nunca hardcodear: contraseñas, tokens, credenciales de BD
- Las credenciales de desarrollo (`remisoft`/`remisoft123`) son solo para el entorno de Codespaces, nunca para producción

---

## 6. Restricciones de Seguridad

### RS-001 — Contraseñas

- Nunca almacenar contraseñas en texto plano
- Nunca exponer el hash de la contraseña en respuestas HTTP
- Nunca loggear contraseñas, ni siquiera parcialmente

### RS-002 — Secrets y Credenciales

- Nunca hardcodear secrets, tokens o credenciales de BD en el código fuente
- Usar variables de entorno para toda configuración sensible

### RS-003 — CORS y Headers

- Nunca usar orígenes CORS abiertos (`*`) en producción
- Configurar CORS con orígenes explícitos en `config/cors.php`

### RS-004 — Cumplimiento Legal (DIAN)

- Toda factura generada debe incluir CUFE según la resolución DIAN vigente
- Los valores monetarios deben mostrarse siempre en COP con formato correcto













