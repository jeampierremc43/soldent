# Quick Reference - Docker Commands

Referencia rapida de comandos Docker para Soldent.

## Inicio Rapido

```bash
cd docker
make install    # Setup completo
make status     # Ver estado
```

## Comandos Make

### Desarrollo

| Comando | Descripcion |
|---------|-------------|
| `make dev-up` | Iniciar desarrollo |
| `make dev-down` | Detener desarrollo |
| `make dev-logs` | Ver logs |
| `make dev-restart` | Reiniciar servicios |
| `make dev-rebuild` | Reconstruir imagenes |
| `make dev-tools` | Iniciar con herramientas |

### Produccion

| Comando | Descripcion |
|---------|-------------|
| `make prod-up` | Iniciar produccion |
| `make prod-down` | Detener produccion |
| `make prod-logs` | Ver logs |
| `make prod-build` | Build imagenes |
| `make prod-rebuild` | Rebuild imagenes |

### Base de Datos

| Comando | Descripcion |
|---------|-------------|
| `make db-migrate` | Ejecutar migraciones (dev) |
| `make db-migrate-prod` | Ejecutar migraciones (prod) |
| `make db-studio` | Abrir Prisma Studio |
| `make db-reset` | Resetear database (dev) |
| `make db-seed` | Seed database |
| `make db-backup` | Crear backup |
| `make db-restore` | Restaurar backup |
| `make db-shell` | PostgreSQL shell |

### Servicios

| Comando | Descripcion |
|---------|-------------|
| `make backend-shell` | Shell del backend |
| `make frontend-shell` | Shell del frontend |
| `make backend-logs` | Logs del backend |
| `make frontend-logs` | Logs del frontend |
| `make redis-cli` | Redis CLI |
| `make redis-flush` | Limpiar Redis |

### Utilidades

| Comando | Descripcion |
|---------|-------------|
| `make ps` | Listar contenedores |
| `make status` | Estado y URLs |
| `make clean` | Limpiar todo |
| `make prune` | Limpiar sistema |
| `make setup` | Crear archivos .env |

## Comandos Docker Compose

### Sin Make

```bash
# Desarrollo
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml logs -f
docker-compose -f docker-compose.dev.yml ps

# Produccion
docker-compose up -d
docker-compose down
docker-compose logs -f
docker-compose ps

# Servicio especifico
docker-compose -f docker-compose.dev.yml restart backend
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml exec backend sh
```

## URLs de Servicios

### Desarrollo

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Backend API**: http://localhost:3001/api
- **Prisma Studio**: http://localhost:5555
- **pgAdmin**: http://localhost:5050
- **Redis Commander**: http://localhost:8081

### Base de Datos (Desarrollo)

- **Host**: localhost
- **Port**: 5433
- **Database**: soldent_dev
- **User**: soldent_dev
- **Password**: (ver .env)

### Redis (Desarrollo)

- **Host**: localhost
- **Port**: 6380
- **Password**: (ver .env)

## Comandos Prisma

```bash
# Migraciones
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate reset

# Studio
docker-compose -f docker-compose.dev.yml exec backend npx prisma studio

# Generate client
docker-compose -f docker-compose.dev.yml exec backend npx prisma generate

# Seed
docker-compose -f docker-compose.dev.yml exec backend npx prisma db seed
```

## Troubleshooting Rapido

### Contenedor no inicia

```bash
docker-compose logs [service]
docker-compose build --no-cache [service]
docker-compose up -d [service]
```

### Limpiar y reiniciar

```bash
docker-compose down -v
docker-compose up -d
```

### Problemas de base de datos

```bash
# Ver logs
docker-compose logs postgres

# Reiniciar
docker-compose restart postgres

# Verificar health
docker-compose ps
```

### Hot reload no funciona

```bash
# Verificar en .env.local
WATCHPACK_POLLING=true
CHOKIDAR_USEPOLLING=true

# Reiniciar frontend
docker-compose restart frontend
```

## Variables de Entorno Importantes

### docker/.env

```env
POSTGRES_PASSWORD=change-me
REDIS_PASSWORD=change-me
JWT_SECRET=change-me-min-32-chars
CORS_ORIGIN=http://localhost:3000
```

### backend/.env

```env
DATABASE_URL=postgresql://user:pass@localhost:5433/db
JWT_SECRET=same-as-docker-env
CORS_ORIGIN=http://localhost:3000
```

### frontend/.env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
WATCHPACK_POLLING=true
```

## Scripts Bash

```bash
# Desarrollo
bash scripts/start-dev.sh
bash scripts/stop-dev.sh

# Produccion
bash scripts/start-prod.sh

# Base de datos
bash scripts/backup-db.sh
bash scripts/restore-db.sh
```

## Health Checks

```bash
# Backend
curl http://localhost:3001/health

# Frontend
curl http://localhost:3000/api/health

# Nginx (en produccion)
curl http://localhost/health
```

## Logs

```bash
# Todos los servicios
docker-compose logs -f

# Servicio especifico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f redis

# Ultimas N lineas
docker-compose logs --tail=100 backend

# Desde un tiempo especifico
docker-compose logs --since 10m backend
```

## Recursos

```bash
# Ver uso de recursos
docker stats

# Ver imagenes
docker images

# Ver volumenes
docker volume ls

# Ver redes
docker network ls
```

## Limpieza

```bash
# Detener y eliminar contenedores
docker-compose down

# Eliminar volumenes tambien
docker-compose down -v

# Eliminar imagenes
docker-compose down --rmi all

# Limpiar sistema completo
docker system prune -a --volumes
```
