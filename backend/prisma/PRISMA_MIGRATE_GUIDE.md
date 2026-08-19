# Guía de migraciones Prisma

## Aplicar migraciones existentes

Desde la raíz del repositorio:

```bash
pnpm --dir backend exec prisma migrate deploy
```

## Generar una migración de desarrollo

Con MariaDB disponible y las variables de entorno configuradas:

```bash
pnpm --dir backend exec prisma migrate dev --name nombre_del_cambio
```

## Regenerar el cliente

```bash
pnpm --dir backend exec prisma generate
```

Las migraciones versionadas se encuentran en `backend/prisma/migrations/`. Revisa el SQL generado antes de crear un Pull Request y no edites una migración ya aplicada en un entorno compartido.
