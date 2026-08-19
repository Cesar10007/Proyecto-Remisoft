# Archivos legacy

`DBFAMILIAREMI.sql` era el esquema completo de la base de datos, usado
para crear las tablas manualmente antes de integrar Prisma.

Desde la migración a Express + Prisma, el esquema se gestiona con
`prisma migrate deploy` (ver `backend/prisma/migrations/`). Este archivo
se conserva solo como referencia histórica del diseño original — no se
ejecuta en el arranque del proyecto.
