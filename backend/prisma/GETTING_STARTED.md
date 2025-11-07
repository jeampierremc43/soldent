# Guía de Inicio Rápido - Prisma Schema Soldent

Esta guía te ayudará a configurar y usar el esquema de base de datos de Soldent.

## 📋 Tabla de Contenidos

1. [Instalación](#instalación)
2. [Configuración](#configuración)
3. [Migraciones](#migraciones)
4. [Seed](#seed)
5. [Uso](#uso)
6. [Documentación](#documentación)

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ instalado
- PostgreSQL 14+ instalado y corriendo
- npm o yarn

### Instalar dependencias

```bash
cd backend
npm install
```

Esto instalará:
- `prisma` - CLI de Prisma
- `@prisma/client` - Cliente de Prisma
- `bcrypt` - Para hashear contraseñas
- `ts-node` - Para ejecutar seed

## ⚙️ Configuración

### 1. Configurar variables de entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Edita `.env` y actualiza la URL de la base de datos:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/soldent_dev?schema=public"
```

### 2. Crear base de datos

```bash
# Opción 1: Usando psql
psql -U postgres
CREATE DATABASE soldent_dev;
\q

# Opción 2: Usando Docker (ver docker/README.md)
cd ../docker
docker-compose up -d postgres
```

## 🗄️ Migraciones

### Crear primera migración

```bash
npx prisma migrate dev --name init
```

Esto hará:
1. Crear carpeta `prisma/migrations/`
2. Generar SQL de migración
3. Aplicar migración a la base de datos
4. Generar cliente Prisma

### Comandos útiles

```bash
# Ver estado de migraciones
npx prisma migrate status

# Aplicar migraciones pendientes (producción)
npx prisma migrate deploy

# Reset completo (CUIDADO: borra todos los datos)
npx prisma migrate reset

# Generar cliente después de cambios en schema
npx prisma generate
```

## 🌱 Seed

El seed crea datos iniciales para desarrollo y pruebas.

### Ejecutar seed

```bash
npx prisma db seed
```

### Datos creados

#### Roles y Permisos
- 3 roles: `admin`, `doctor`, `receptionist`
- ~24 permisos granulares

#### Usuarios de Prueba
| Email | Password | Rol |
|-------|----------|-----|
| admin@soldent.com | admin123 | Admin |
| doctor@soldent.com | admin123 | Doctor |
| recepcion@soldent.com | admin123 | Receptionist |

#### Códigos CIE-10
- ~30 códigos diagnósticos odontológicos (K00-K14)

#### Catálogo de Tratamientos
- ~30 tratamientos base con costos
- Categorías: Preventivo, Diagnóstico, Restauración, Endodoncia, Cirugía, Prótesis, Ortodoncia, Periodoncia, Estética

## 💻 Uso

### Importar Prisma Client

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
```

### Ejemplos básicos

#### Crear un paciente

```typescript
const patient = await prisma.patient.create({
  data: {
    firstName: 'Juan',
    lastName: 'Pérez',
    dateOfBirth: new Date('1990-05-15'),
    gender: 'MALE',
    identification: '1234567890',
    identificationType: 'CEDULA',
    phone: '0999123456',
    email: 'juan@example.com',
  }
});
```

#### Buscar paciente con relaciones

```typescript
const patient = await prisma.patient.findUnique({
  where: { id: patientId },
  include: {
    medicalHistories: true,
    odontograms: { where: { isCurrent: true } },
    appointments: { orderBy: { date: 'desc' }, take: 5 }
  }
});
```

#### Crear cita

```typescript
const appointment = await prisma.appointment.create({
  data: {
    patientId: patient.id,
    doctorId: doctor.id,
    date: new Date('2025-11-15'),
    startTime: '10:00',
    endTime: '10:30',
    duration: 30,
    type: 'CONSULTATION',
    status: 'SCHEDULED',
    reason: 'Consulta inicial'
  }
});
```

Ver `examples.ts` para más ejemplos completos.

## 📚 Documentación

### Archivos de documentación

| Archivo | Descripción |
|---------|-------------|
| `README.md` | Descripción general del esquema |
| `GETTING_STARTED.md` | Esta guía de inicio rápido |
| `VALIDATIONS.md` | Validaciones y reglas de negocio |
| `ER_DIAGRAM.md` | Diagramas ER en Mermaid |
| `examples.ts` | Ejemplos de código |
| `schema.prisma` | Schema de Prisma (código) |

### Estructura del Schema

#### 7 Módulos principales

1. **Usuarios y Autenticación** - User, Role, Permission
2. **Pacientes** - Patient, EmergencyContact
3. **Historia Clínica** - MedicalHistory, Diagnosis, Odontogram, Tooth, Treatment
4. **Agendamiento** - Appointment, RecurringAppointment, WorkSchedule, BlockedTime
5. **Seguimiento** - FollowUp, Note
6. **Contabilidad** - Transaction, PatientPayment, PaymentPlan, Installment, Expense
7. **Catálogos** - CIE10Code, TreatmentCatalog

#### 19 Enums

Valores fijos para estados, tipos, categorías, etc.

Ver `schema.prisma` para lista completa.

## 🛠️ Herramientas útiles

### Prisma Studio

Interface visual para explorar y editar datos:

```bash
npx prisma studio
```

Abre en: http://localhost:5555

### Formatear Schema

```bash
npx prisma format
```

### Validar Schema

```bash
npx prisma validate
```

### Generar Diagrama ER

```bash
# Usar extensión de VS Code: Prisma
# O generar con herramientas online pegando schema.prisma
```

## 🔧 Desarrollo

### Workflow típico

1. **Modificar schema**
   ```bash
   # Editar prisma/schema.prisma
   ```

2. **Crear migración**
   ```bash
   npx prisma migrate dev --name descripcion_cambio
   ```

3. **Verificar en Prisma Studio**
   ```bash
   npx prisma studio
   ```

4. **Actualizar seed si es necesario**
   ```bash
   # Editar prisma/seed.ts
   npx prisma db seed
   ```

### Mejores prácticas

✅ **SI**
- Usar transacciones para operaciones relacionadas
- Validar datos en capa de servicio
- Usar índices para queries frecuentes
- Implementar soft delete para datos importantes
- Mantener historial (odontogramas, diagnósticos)
- Paginar resultados grandes

❌ **NO**
- No eliminar datos financieros (soft delete)
- No modificar migraciones ya aplicadas
- No exponer Prisma Client directamente en API
- No hacer queries N+1 (usar `include`)
- No olvidar manejar errores de unicidad

## 📊 Monitoreo

### Logs de Prisma

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### Métricas

```typescript
// Tiempo de queries
const startTime = Date.now();
const result = await prisma.patient.findMany();
console.log(`Query took ${Date.now() - startTime}ms`);
```

## 🐛 Troubleshooting

### Error: "Can't reach database server"

```bash
# Verificar que PostgreSQL esté corriendo
pg_isready

# Verificar URL en .env
echo $DATABASE_URL
```

### Error: "Migration failed"

```bash
# Reset y volver a migrar
npx prisma migrate reset
npx prisma migrate dev
```

### Error: "Type ... is not assignable"

```bash
# Regenerar cliente
npx prisma generate
```

### Error de permisos en seed

```bash
# Asegurar que seed.ts es ejecutable
chmod +x prisma/seed.ts

# Verificar configuración en package.json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

## 🔒 Seguridad

### En desarrollo

- ✅ Usar `.env` para credenciales
- ✅ Nunca commitear `.env`
- ✅ Usar usuarios de DB con permisos limitados
- ✅ Hash de contraseñas con bcrypt (rounds=10+)

### En producción

- ✅ Usar variables de entorno seguras
- ✅ SSL/TLS para conexión a DB
- ✅ Connection pooling
- ✅ Backup automático
- ✅ Logs de auditoría
- ✅ Rate limiting

## 📦 Deployment

### Pre-deployment checklist

- [ ] Todas las migraciones aplicadas
- [ ] Variables de entorno configuradas
- [ ] Backup de base de datos
- [ ] Tests pasando
- [ ] Seed en producción (solo catálogos)

### Aplicar migraciones en producción

```bash
# NO usar migrate dev en producción
# Usar migrate deploy

DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### Rollback

```bash
# Prisma no tiene rollback automático
# Debes crear una nueva migración que revierta cambios

npx prisma migrate dev --name rollback_descripcion
```

## 🤝 Contribuir

### Agregar nuevo modelo

1. Definir en `schema.prisma`
2. Agregar relaciones
3. Agregar índices necesarios
4. Crear migración
5. Actualizar seed si es necesario
6. Documentar en README.md
7. Agregar ejemplos en examples.ts
8. Agregar validaciones en VALIDATIONS.md

### Modificar modelo existente

1. Modificar en `schema.prisma`
2. Crear migración con nombre descriptivo
3. Actualizar seed si es necesario
4. Actualizar documentación
5. Actualizar ejemplos

## 📖 Recursos

- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [CIE-10 Ecuador](https://www.salud.gob.ec/)

## 🆘 Soporte

Si tienes problemas:

1. Revisa esta guía
2. Consulta `VALIDATIONS.md` para reglas de negocio
3. Revisa `examples.ts` para casos de uso
4. Consulta logs de Prisma
5. Revisa issues conocidos

## ✅ Checklist de inicio

- [ ] PostgreSQL instalado y corriendo
- [ ] Dependencias instaladas (`npm install`)
- [ ] `.env` configurado
- [ ] Base de datos creada
- [ ] Migraciones aplicadas (`prisma migrate dev`)
- [ ] Seed ejecutado (`prisma db seed`)
- [ ] Prisma Studio funciona (`prisma studio`)
- [ ] Ejemplos probados

¡Listo para desarrollar! 🎉
