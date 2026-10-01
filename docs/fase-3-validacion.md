# Validación de fase 3

## Objetivo

Verificar que Docker, la inicialización de MariaDB y el pipeline de CI puedan ejecutarse de forma reproducible.

## Validación local

Desde la raíz del repositorio:

```bash
docker compose down -v
docker compose config --quiet
docker compose up --build
```

En otra terminal, comprobar los servicios:

```bash
docker compose ps
docker compose logs db
docker compose logs backend
docker compose logs frontend
```

## Criterios

- MariaDB permanece en estado `healthy`.
- Backend inicia después de que la base de datos esté saludable.
- Las migraciones Prisma terminan sin errores.
- El seed, las vistas y los procedimientos se ejecutan de forma idempotente.
- Frontend y backend quedan accesibles mediante los puertos definidos en Compose.
- Una segunda ejecución no duplica estructuras ni falla por objetos existentes.

## CI

El workflow de `.github/workflows/ci.yml` debe pasar instalación con lockfile, auditoría, lint, pruebas, build del frontend y construcción de las imágenes Docker.

Las vulnerabilidades transitivas deben corregirse mediante actualización compatible o quedar documentadas con una justificación y seguimiento en una issue separada.

## Evidencia requerida

Registrar en la issue #188:

- Salida de `docker compose config --quiet`.
- Salida de `docker compose ps` con servicios saludables.
- Resultado de tests, lint y build.
- Resultado de `docker compose down -v && docker compose up --build` desde una instalación limpia.
