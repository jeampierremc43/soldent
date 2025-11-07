# Docker Structure - Soldent

Estructura completa de archivos Docker del proyecto.

## Arbol de Archivos

```
soldent/
│
├── backend/
│   ├── .dockerignore          # Archivos a excluir del build
│   └── .env.example           # Variables de entorno del backend
│
├── frontend/
│   ├── .dockerignore          # Archivos a excluir del build
│   └── .env.example           # Variables de entorno del frontend
│
└── docker/
    │
    ├── Dockerfiles
    │   ├── Dockerfile.backend          # Production backend (multi-stage)
    │   ├── Dockerfile.backend.dev      # Development backend (hot reload)
    │   ├── Dockerfile.frontend         # Production frontend (multi-stage)
    │   └── Dockerfile.frontend.dev     # Development frontend (hot reload)
    │
    ├── Docker Compose
    │   ├── docker-compose.yml          # Production
    │   ├── docker-compose.dev.yml      # Development (hot reload)
    │   └── docker-compose.prod.yml     # Production + Nginx
    │
    ├── Configuration
    │   ├── .env.example                # Docker Compose variables
    │   ├── .gitignore                  # Git ignore rules
    │   └── .gitattributes              # Git line endings
    │
    ├── Database Scripts
    │   └── init-scripts/
    │       ├── 01-init-database.sql    # PostgreSQL initialization
    │       └── 02-create-backup-user.sql  # Backup user creation
    │
    ├── Nginx
    │   ├── nginx.conf                  # Main nginx config
    │   ├── conf.d/
    │   │   └── default.conf           # Virtual host config
    │   └── README.md                   # Nginx documentation
    │
    ├── Scripts
    │   ├── start-dev.sh                # Start development
    │   ├── stop-dev.sh                 # Stop development
    │   ├── start-prod.sh               # Start production
    │   ├── backup-db.sh                # Database backup
    │   └── restore-db.sh               # Database restore
    │
    ├── Utilities
    │   ├── Makefile                    # Make commands
    │   └── healthcheck.js              # Health check script
    │
    └── Documentation
        ├── README.md                   # Main documentation
        ├── SETUP.md                    # Setup guide
        ├── QUICK-REFERENCE.md          # Quick reference
        └── STRUCTURE.md                # This file
```

## Descripcion de Archivos

### Dockerfiles

#### Production (Multi-stage)

**Dockerfile.backend**
- Stage 1: Base - Node.js 20 Alpine
- Stage 2: Dependencies - Install all deps
- Stage 3: Build - Compile TypeScript, generate Prisma
- Stage 4: Production Dependencies - Only prod deps
- Stage 5: Production - Final optimized image
- Features: Non-root user, health check, dumb-init

**Dockerfile.frontend**
- Stage 1: Base - Node.js 20 Alpine
- Stage 2: Dependencies - Install all deps
- Stage 3: Build - Build Next.js (standalone)
- Stage 4: Production Dependencies - Only prod deps
- Stage 5: Production - Final optimized image
- Features: Non-root user, health check, dumb-init

#### Development (Hot Reload)

**Dockerfile.backend.dev**
- Single stage for development
- All dependencies included
- Source code mounted as volume
- Nodemon for hot reload
- Debug port exposed (9229)

**Dockerfile.frontend.dev**
- Single stage for development
- All dependencies included
- Source code mounted as volume
- Next.js dev server with Fast Refresh
- Polling enabled for Docker

### Docker Compose Files

#### docker-compose.yml (Production)

**Services:**
- `postgres`: PostgreSQL 16 Alpine
  - Port: 5432
  - Volume: postgres_data
  - Health check configured
  - Resource limits

- `redis`: Redis 7 Alpine
  - Port: 6379
  - Volume: redis_data
  - Persistence enabled (AOF)
  - Health check configured

- `backend`: Node.js Backend API
  - Port: 3001
  - Depends on: postgres, redis
  - Health check configured
  - Resource limits

- `frontend`: Next.js Frontend
  - Port: 3000
  - Depends on: backend
  - Health check configured
  - Resource limits

**Networks:**
- `soldent-network` (bridge, 172.20.0.0/16)

**Volumes:**
- `postgres_data` (persistent)
- `redis_data` (persistent)

#### docker-compose.dev.yml (Development)

**Additional Services:**
- `pgadmin`: PostgreSQL management (port 5050)
- `redis-commander`: Redis management (port 8081)

**Features:**
- Different ports (5433, 6380, etc.)
- Source code mounted as volumes
- Debug ports exposed
- Verbose logging
- Development database names
- Optional tools (profiles)

**Additional Volumes:**
- `backend_node_modules` (performance)
- `frontend_node_modules` (performance)
- `frontend_next` (Next.js cache)

#### docker-compose.prod.yml (Production + Nginx)

**Additional Service:**
- `nginx`: Reverse proxy
  - Ports: 80, 443
  - Load balancing
  - SSL/TLS ready
  - Rate limiting
  - Static caching

**Features:**
- Services not exposed to host
- Only Nginx is public-facing
- Replicas ready (2x backend, 2x frontend)
- Higher resource limits
- Production optimizations

### Configuration Files

#### .env.example

Template para variables de entorno:
- Database credentials
- Redis password
- JWT secret
- CORS origins
- API configuration
- Feature flags

#### .dockerignore

Excluye del build:
- node_modules
- .git
- logs
- test files
- documentation
- development files

### Database Scripts

#### 01-init-database.sql

Inicializacion de PostgreSQL:
- Crear extensiones (uuid-ossp, pg_trgm, unaccent)
- Configurar timezone
- Configurar encoding
- Optimizaciones de performance
- Configuracion de logging

#### 02-create-backup-user.sql

Usuario de respaldo:
- Usuario read-only
- Acceso a todas las tablas
- Para backups y reportes

### Nginx Configuration

#### nginx.conf

Configuracion principal:
- Worker processes
- Event loop
- HTTP settings
- Gzip compression
- Security headers
- Rate limiting
- Logging

#### conf.d/default.conf

Virtual host:
- Upstream definitions
- HTTP server (port 80)
- HTTPS server (port 443, commented)
- API proxy (/api -> backend)
- Frontend proxy (/ -> frontend)
- Static file caching
- WebSocket support

### Shell Scripts

#### start-dev.sh

Iniciar desarrollo:
1. Verificar/crear archivos .env
2. Iniciar servicios
3. Esperar PostgreSQL
4. Mostrar URLs e instrucciones

#### stop-dev.sh

Detener desarrollo:
- Detener servicios
- Opcion para eliminar volumenes

#### start-prod.sh

Iniciar produccion:
1. Verificar archivos .env existen
2. Build imagenes
3. Iniciar servicios
4. Ejecutar migraciones
5. Mostrar URLs

#### backup-db.sh

Backup de base de datos:
1. Crear dump de PostgreSQL
2. Comprimir con gzip
3. Guardar en backups/
4. Mantener ultimos 7 backups

#### restore-db.sh

Restaurar base de datos:
1. Listar backups disponibles
2. Seleccionar backup
3. Confirmar restauracion
4. Recrear database
5. Restaurar datos

### Makefile

Comandos simplificados:

**Desarrollo:**
- dev-up, dev-down, dev-logs
- dev-restart, dev-rebuild
- dev-tools

**Produccion:**
- prod-up, prod-down, prod-logs
- prod-build, prod-rebuild

**Base de Datos:**
- db-migrate, db-migrate-prod
- db-studio, db-reset, db-seed
- db-backup, db-restore, db-shell

**Servicios:**
- backend-shell, frontend-shell
- backend-logs, frontend-logs
- redis-cli, redis-flush

**Utilidades:**
- ps, status, clean, prune
- setup, install

### Documentation

#### README.md
Documentacion principal con:
- Descripcion de servicios
- Inicio rapido
- Comandos utiles
- Gestion de volumenes
- Troubleshooting
- Seguridad

#### SETUP.md
Guia de instalacion completa:
- Prerequisitos
- Instalacion paso a paso
- Configuracion de variables
- Ambientes (dev/prod)
- Base de datos
- Troubleshooting detallado

#### QUICK-REFERENCE.md
Referencia rapida:
- Comandos Make
- Comandos Docker Compose
- URLs de servicios
- Comandos Prisma
- Troubleshooting rapido

#### STRUCTURE.md
Este archivo:
- Arbol de archivos
- Descripcion de cada archivo
- Proposito y contenido

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                         PRODUCTION                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Internet → Nginx (80/443)                                  │
│               │                                             │
│               ├─→ /api → Backend (3001) → PostgreSQL (5432) │
│               │            │                                │
│               │            └──→ Redis (6379)                │
│               │                                             │
│               └─→ / → Frontend (3000)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        DEVELOPMENT                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Developer                                                  │
│      │                                                      │
│      ├─→ Frontend (3000) ──┐                                │
│      │                     │                                │
│      ├─→ Backend (3001) ───┼─→ PostgreSQL (5433)            │
│      │                     │       ↕                        │
│      ├─→ pgAdmin (5050) ───┘   (pgAdmin)                    │
│      │                                                      │
│      └─→ Redis Commander (8081) → Redis (6380)              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Mejores Practicas Implementadas

### Docker
- ✅ Multi-stage builds
- ✅ .dockerignore files
- ✅ Minimal base images (Alpine)
- ✅ Non-root users
- ✅ Layer caching optimization
- ✅ Security options

### Docker Compose
- ✅ Health checks
- ✅ Restart policies
- ✅ Resource limits
- ✅ Named volumes
- ✅ Networks isolation
- ✅ Dependencies management

### Security
- ✅ No-new-privileges
- ✅ Secrets via environment
- ✅ Non-root execution
- ✅ Minimal attack surface
- ✅ Security headers (Nginx)
- ✅ Rate limiting

### Development
- ✅ Hot reload enabled
- ✅ Source code volumes
- ✅ Debug ports exposed
- ✅ Development tools included
- ✅ Separate configurations

### Production
- ✅ Optimized images
- ✅ Resource limits
- ✅ Health monitoring
- ✅ Persistent storage
- ✅ Scalability ready
- ✅ Logging configured

## Proximos Pasos

### Opcional - Mejoras Futuras

1. **Monitoring**
   - Prometheus + Grafana
   - ELK Stack
   - Jaeger tracing

2. **CI/CD**
   - GitHub Actions
   - GitLab CI
   - Jenkins pipeline

3. **Orchestration**
   - Kubernetes manifests
   - Docker Swarm
   - Helm charts

4. **Security**
   - Vulnerability scanning
   - Secrets management (Vault)
   - WAF integration

5. **Performance**
   - CDN integration
   - Image optimization
   - Database tuning

6. **Backup**
   - Automated backups
   - S3 integration
   - Disaster recovery
