# Guía de Prisma Migrate y Validaciones de Seguridad

## Estado Actual

- **Schema:** Generado por introspeccin (`prisma db pull`) de la BD existente
- **Migraciones:** NO generadas aún
- **Proteccin SQL:** Prisma usa queries parametrizadas por defecto (protege contra inyecciones)

## Generar Migraciones

```bash
cd backend-express
pnpm exec prisma migrate dev --name init
```

## Validaciones Recomendadas

| Campo | Validacin | Regex |
|-------|-----------|-------|
| Email | Formato email | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| Nombre | Solo letras | `/^[a-zA-Z\s]+$/` |
| Teléfono | Solo nmeros | `/^\d{10}$/` |
| Contrasea | Mnimo 8 | `/.{8,}/` |

## Seguridad

Prisma usa queries parametrizadas por defecto - protege contra SQL injection automáticamente.
