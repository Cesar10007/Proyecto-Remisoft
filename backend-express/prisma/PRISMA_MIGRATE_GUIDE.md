#  Guía de Prisma Migrate y Validaciones de Seguridad

##  Estado Actual

- **Schema:** Generado por introspeccin (`prisma db pull`) de la BD existente
- **Migraciones:** NO generadas aún
- **Proteccin SQL:** Prisma usa queries parametrizadas por defecto (protege contra inyecciones)

---

##  Generar Migraciones (IMPORTANTE)

### Paso 1: Generar migracin inicial
```bash
cd backend-express
prisma migrate dev --name init
```

Esto va a:
1. Crear carpeta `prisma/migrations/` con la migracin inicial
2. Aplicar la migracin a tu BD local
3. Generar `PrismaClient` actualizado

### Paso 2: Verificar migraciones
```bash
prisma migrate status
```

### Paso 3: Commit a Git
```bash
git add prisma/migrations/
git commit -m "feat: agregar migraciones iniciales de Prisma"
```

---

##  Validaciones en Prisma

### 1. Validaciones de Schema (Nivel BD)

Prisma ya define tipos de datos:
```prisma
model usuarios {
  id_usuario  Int      @id @default(autoincrement())
  email       String   @db.VarChar(255)  // VARCHAR(255)
  password    String   @db.VarChar(255)
  nombre      String   @db.VarChar(100)
  telefono    String?  @db.VarChar(20)
}
```

### 2. Validaciones de Formato (Nivel Application)

Prisma **NO** valida formatos, eso se hace en los controllers:

```javascript
// Ejemplo: validar email
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  return res.status(400).json({ message: 'Email invlido' });
}

// Ejemplo: validar solo letras
if (!/^[a-zA-Z\s]+$/.test(nombre)) {
  return res.status(400).json({ message: 'Nombre solo permite letras' });
}

// Ejemplo: validar solo nmeros
if (!/^\d+$/.testtelefono)) {
  return res.status(400).json({ message: 'Teló¡¡¡fono solo nmeros' });
}
```

### 3. Validaciones Recomendadas

| Campo | Validacin | Regex |
|-------|-----------|-------|
| Email | Formato email | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| Nombre | Solo letras y espacios | `/^[a-zA-Z\s]+$/` |
| Teló¡¡¡fono | Solo nmeros (10 dgitos) | `/^\d{10}$/` |
| Contrasea | Mnimo 8 caracteres | `/.{8,}/` |
| NIT/CC | Solo nmeros | `/^\d+$/` |

---

##  Seguridad: Inyeccin SQL

###  Por qu Prisma es seguro?

Prisma usa **queries parametrizadas** por defecto:

```javascript
//  SEGURO - Prisma usa query parametrizada
const user = await prisma.usuarios.findUnique({
  where: { email: userInput } // userInput se escapa automticamente
});

// Equivalente SQL:
// SELECT * FROM usuarios WHERE email = ? (con userInput como parmetro)
```

###  Buenas Prcticas

1. **Nunca** construir queries con string concatenation:
```javascript
//  MAL - No hacer esto
const query = `SELECT * FROM usuarios WHERE email = '${userInput}'`;

//  BIEN - Usar Prisma
const user = await prisma.usuarios.findUnique({ where: { email: userInput } });
```

2. **Validar inputs** en controllers (aunque Prisma proteja)
3. **Usar zod** o similar para validaciones complejas (opcional)

---

##  Comandos Útiles de Prisma

```bash
# Generar nueva migracin
prisma migrate dev --name <nombre>

# Aplicar migraciones en produccin
prisma migrate deploy

# Ver status de migraciones
prisma migrate status

# Regenerar schema desde BD
prisma db pull

# Generar Prisma Client
prisma generate

# Ver logs de queries
DEBUG="prisma:client" pnpm dev
```

---

##  Prximos Pasos

1. **Generar migraciones:** `prisma migrate dev --name init`
2. **Agregar validaciones** a controllers principales (auth, usuarios, clientes)
3. **Opcional:** Instalar `zod` para validaciones ms robustas
4. **Actualizar setup-prisma.sh** para que use `prisma migrate deploy`

---

##  Referencias

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [SQL Injection Prevention](https://www.prisma.io/docs/concepts/components/prisma-client/security#sql-injection)
