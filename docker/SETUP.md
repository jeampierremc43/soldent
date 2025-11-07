# Setup Guide - Docker

Guia completa de configuracion de Docker para Soldent.

## Tabla de Contenidos

1. [Prerequisitos](#prerequisitos)
2. [Instalacion Rapida](#instalacion-rapida)
3. [Configuracion Manual](#configuracion-manual)
4. [Ambientes](#ambientes)
5. [Base de Datos](#base-de-datos)
6. [Troubleshooting](#troubleshooting)

## Prerequisitos

### Software Requerido

- Docker Desktop 24.0+ o Docker Engine 24.0+
- Docker Compose 2.0+
- Git
- Make (opcional, para usar Makefile)

### Verificar Instalacion

```bash
docker --version
docker-compose --version
git --version
make --version  # opcional
```

### Recursos Minimos

**Desarrollo:**
- CPU: 2 cores
- RAM: 4 GB
- Disk: 10 GB

**Produccion:**
- CPU: 4 cores
- RAM: 8 GB
- Disk: 20 GB

## Instalacion Rapida

### Usando Make (Recomendado)

```bash
# Navegar a la carpeta docker
cd docker

# Setup completo (crea .env y levanta servicios)
make install

# Ver estado
make status
```

### Sin Make

```bash
cd docker

# 1. Copiar archivos de configuracion
cp .env.example .env
cp ../backend/.env.example ../backend/.env
cp ../frontend/.env.example ../frontend/.env.local

# 2. Editar archivos .env con tu configuracion
nano .env
nano ../backend/.env
nano ../frontend/.env.local

# 3. Iniciar servicios de desarrollo
docker-compose -f docker-compose.dev.yml up -d

# 4. Ejecutar migraciones
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev
```

## Configuracion Manual

### 1. Variables de Entorno

#### docker/.env

Variables principales de Docker Compose:

```env
# Database
POSTGRES_DB=soldent_dev
POSTGRES_USER=soldent_dev
POSTGRES_PASSWORD=tu-password-seguro
POSTGRES_PORT=5433

# Redis
REDIS_PASSWORD=tu-redis-password
REDIS_PORT=6380

# Backend
BACKEND_PORT=3001
JWT_SECRET=tu-jwt-secret-min-32-caracteres
CORS_ORIGIN=http://localhost:3000

# Frontend
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=Soldent
```

#### backend/.env

Variables del backend:

```env
NODE_ENV=development
PORT=3001

# Database URL (debe coincidir con docker/.env)
DATABASE_URL=postgresql://soldent_dev:tu-password-seguro@localhost:5433/soldent_dev?schema=public

# Redis
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=tu-redis-password

# JWT
JWT_SECRET=tu-jwt-secret-min-32-caracteres
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### frontend/.env.local

Variables del frontend:

```env
NODE_ENV=development
PORT=3000

NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=Soldent
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development
NEXT_TELEMETRY_DISABLED=1
WATCHPACK_POLLING=true
```

### 2. Estructura de Archivos

Asegurar que existe la siguiente estructura:

```
soldent/
├── backend/
│   ├── .env
│   ├── .dockerignore
│   └── ...
├── frontend/
│   ├── .env.local
│   ├── .dockerignore
│   └── ...
└── docker/
    ├── .env
    ├── Dockerfile.backend
    ├── Dockerfile.backend.dev
    ├── Dockerfile.frontend
    ├── Dockerfile.frontend.dev
    ├── docker-compose.yml
    ├── docker-compose.dev.yml
    ├── docker-compose.prod.yml
    ├── init-scripts/
    ├── nginx/
    └── scripts/
```

## Ambientes

### Desarrollo (docker-compose.dev.yml)

Incluye hot reload, debug ports, y herramientas de desarrollo.

**Servicios:**
- PostgreSQL (puerto 5433)
- Redis (puerto 6380)
- Backend (puerto 3001, debug 9229)
- Frontend (puerto 3000)
- pgAdmin (puerto 5050) - opcional
- Redis Commander (puerto 8081) - opcional

**Iniciar:**

```bash
# Servicios basicos
docker-compose -f docker-compose.dev.yml up -d

# Con herramientas de desarrollo
docker-compose -f docker-compose.dev.yml --profile tools up -d
```

**Caracteristicas:**
- Hot reload habilitado
- Source code montado como volumenes
- Logs verbose
- Migraciones automaticas

### Produccion (docker-compose.yml)

Optimizado para produccion sin herramientas de desarrollo.

**Servicios:**
- PostgreSQL (puerto 5432)
- Redis (puerto 6379)
- Backend (puerto 3001)
- Frontend (puerto 3000)

**Iniciar:**

```bash
docker-compose up -d
```

**Caracteristicas:**
- Multi-stage builds
- Imagenes optimizadas
- Resource limits
- Health checks

### Produccion con Nginx (docker-compose.prod.yml)

Incluye Nginx como reverse proxy.

**Servicios:**
- Nginx (puertos 80, 443)
- PostgreSQL (interno)
- Redis (interno)
- Backend (interno)
- Frontend (interno)

**Iniciar:**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Caracteristicas:**
- Reverse proxy
- Load balancing
- SSL/TLS ready
- Static caching
- Rate limiting

## Base de Datos

### Migraciones

#### Desarrollo

```bash
# Crear y ejecutar migracion
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones pendientes
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev

# Reset (elimina datos)
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate reset
```

#### Produccion

```bash
# Aplicar migraciones
docker-compose exec backend npx prisma migrate deploy
```

### Prisma Studio

```bash
# Abrir Prisma Studio
docker-compose -f docker-compose.dev.yml exec backend npx prisma studio

# Acceder en: http://localhost:5555
```

### pgAdmin

Herramienta visual para gestionar PostgreSQL.

**Acceso:**
- URL: http://localhost:5050
- Email: admin@soldent.local
- Password: admin (configurar en .env)

**Conectar a PostgreSQL:**
- Host: postgres
- Port: 5432
- Database: soldent_dev
- Username: soldent_dev
- Password: (ver en .env)

### Backups

#### Crear Backup

```bash
# Usando script
cd docker
bash scripts/backup-db.sh

# Manual
docker-compose exec postgres pg_dump -U soldent_user -d soldent > backup.sql
```

#### Restaurar Backup

```bash
# Usando script
cd docker
bash scripts/restore-db.sh

# Manual
docker-compose exec -T postgres psql -U soldent_user -d soldent < backup.sql
```

## Comandos Utiles

### Usando Make

```bash
# Ver todos los comandos
make help

# Desarrollo
make dev-up          # Iniciar
make dev-down        # Detener
make dev-logs        # Ver logs
make dev-rebuild     # Reconstruir imagenes

# Base de datos
make db-migrate      # Ejecutar migraciones
make db-studio       # Abrir Prisma Studio
make db-backup       # Crear backup
make db-shell        # Conectar a PostgreSQL

# Servicios
make backend-shell   # Shell del backend
make frontend-shell  # Shell del frontend
make redis-cli       # Redis CLI

# Utilidades
make status          # Estado de servicios
make clean           # Limpiar todo
```

### Sin Make

```bash
# Iniciar servicios
docker-compose -f docker-compose.dev.yml up -d

# Detener servicios
docker-compose -f docker-compose.dev.yml down

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Logs de un servicio especifico
docker-compose -f docker-compose.dev.yml logs -f backend

# Shell de un contenedor
docker-compose -f docker-compose.dev.yml exec backend sh

# Estado de servicios
docker-compose -f docker-compose.dev.yml ps

# Reconstruir imagenes
docker-compose -f docker-compose.dev.yml build --no-cache
```

## Troubleshooting

### Puertos ya en uso

```bash
# Verificar que puertos estan ocupados
netstat -tulpn | grep LISTEN

# Cambiar puertos en .env
POSTGRES_PORT=5434
BACKEND_PORT=3002
FRONTEND_PORT=3001
```

### Contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs [service_name]

# Ver eventos
docker events

# Inspeccionar contenedor
docker inspect [container_name]

# Reconstruir sin cache
docker-compose build --no-cache [service_name]
```

### Base de datos no conecta

```bash
# Verificar health check
docker-compose ps

# Ver logs de PostgreSQL
docker-compose logs postgres

# Verificar conectividad desde backend
docker-compose exec backend ping postgres

# Verificar URL de conexion
docker-compose exec backend env | grep DATABASE_URL
```

### Hot reload no funciona

```bash
# Verificar volumenes montados
docker-compose config

# Verificar variables de polling
# En frontend/.env.local:
WATCHPACK_POLLING=true
CHOKIDAR_USEPOLLING=true
```

### Problemas de permisos

```bash
# En Linux/Mac, dar permisos a scripts
chmod +x scripts/*.sh

# Reconstruir volumenes
docker-compose down -v
docker-compose up -d
```

### Limpiar todo el sistema

```bash
# Detener y eliminar todo
docker-compose down -v --rmi all

# Limpiar sistema Docker
docker system prune -a --volumes

# Reiniciar Docker Desktop
# Windows/Mac: Restart desde la app
# Linux: sudo systemctl restart docker
```

## Seguridad

### Produccion Checklist

- [ ] Cambiar todas las passwords por defecto
- [ ] Usar secrets de Docker Swarm para credenciales
- [ ] Habilitar SSL/TLS con certificados validos
- [ ] Configurar firewall para puertos necesarios
- [ ] Actualizar imagenes base regularmente
- [ ] Escanear imagenes: `docker scan <image>`
- [ ] Habilitar logs de auditoria
- [ ] Configurar backups automaticos
- [ ] Implementar monitoreo y alertas
- [ ] Revisar resource limits

### Recomendaciones

1. **Nunca** commitear archivos `.env`
2. **Siempre** usar HTTPS en produccion
3. **Rotar** secrets regularmente
4. **Monitorear** logs y metricas
5. **Actualizar** dependencias
6. **Hacer** backups frecuentes

## Recursos Adicionales

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Nginx Documentation](https://nginx.org/en/docs/)
