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
- **Frontend:** React + HTML5 + CSS3
- **Base de datos:** MariaDB
- **Entorno:** GitHub Codespaces

## Cómo iniciar el entorno

Cada vez que abras el Codespace ejecuta en la terminal:
```bash
service mariadb start
cd backend && php artisan serve
```

Para ver la base de datos visualmente usar SQLTools en el panel izquierdo de VS Code. La conexión **remisoft** ya está configurada.

## Estructura del proyecto
```
Proyecto-Remisoft/
├── .devcontainer/        # Configuración del entorno Codespaces
├── App/                  # Demo visual inicial
├── backend/              # Proyecto Laravel
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   ├── Services/
│   │   └── Repositories/
├── DBFAMILIAREMI.sql     # Estructura de la base de datos
└── datos.sql             # Datos de prueba
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
