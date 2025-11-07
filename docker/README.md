# Docker Configuration - Soldent

Configuracion completa de Docker y Docker Compose para el proyecto Soldent.

## Contenido

- `Dockerfile.backend` - Dockerfile de produccion para el backend (multi-stage)
- `Dockerfile.backend.dev` - Dockerfile de desarrollo para el backend (hot reload)
- `Dockerfile.frontend` - Dockerfile de produccion para el frontend (multi-stage)
- `Dockerfile.frontend.dev` - Dockerfile de desarrollo para el frontend (hot reload)
- `docker-compose.yml` - Configuracion de produccion
- `docker-compose.dev.yml` - Configuracion de desarrollo
- `init-scripts/` - Scripts de inicializacion de base de datos

## Servicios

### Produccion (docker-compose.yml)

- **PostgreSQL 16**: Base de datos principal
- **Redis 7**: Cache y sesiones
- **Backend**: API Node.js + TypeScript + Prisma
- **Frontend**: Aplicacion Next.js 14

### Desarrollo (docker-compose.dev.yml)

Incluye todos los servicios de produccion mas:

- **pgAdmin**: Interfaz web para gestionar PostgreSQL (puerto 5050)
- **Redis Commander**: Interfaz web para gestionar Redis (puerto 8081)

## Inicio Rapido

### Desarrollo

1. Copiar archivos de ejemplo:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

2. Editar variables de entorno en los archivos `.env` y `.env.local`

3. Iniciar servicios:

```bash
cd docker
docker-compose -f docker-compose.dev.yml up -d
```

4. Ver logs:

```bash
docker-compose -f docker-compose.dev.yml logs -f
```

5. Ejecutar migraciones de Prisma:

```bash
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev
```

### Produccion

1. Configurar variables de entorno:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

2. Construir imagenes:

```bash
cd docker
docker-compose build
```

3. Iniciar servicios:

```bash
docker-compose up -d
```

4. Ejecutar migraciones:

```bash
docker-compose exec backend npx prisma migrate deploy
```

## Comandos Utiles

### Gestion de Contenedores

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Reiniciar un servicio especifico
docker-compose restart backend

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio especifico
docker-compose logs -f backend

# Ejecutar comando en un contenedor
docker-compose exec backend sh

# Ver estado de servicios
docker-compose ps
```

### Base de Datos

```bash
# Ejecutar migraciones (desarrollo)
docker-compose exec backend npx prisma migrate dev

# Ejecutar migraciones (produccion)
docker-compose exec backend npx prisma migrate deploy

# Abrir Prisma Studio
docker-compose exec backend npx prisma studio

# Resetear base de datos (desarrollo)
docker-compose exec backend npx prisma migrate reset

# Generar cliente Prisma
docker-compose exec backend npx prisma generate

# Conectar a PostgreSQL via psql
docker-compose exec postgres psql -U soldent_dev -d soldent_dev
```

### Cache Redis

```bash
# Conectar a Redis CLI
docker-compose exec redis redis-cli

# Limpiar cache
docker-compose exec redis redis-cli FLUSHALL

# Ver informacion de Redis
docker-compose exec redis redis-cli INFO
```

### Limpieza

```bash
# Detener y eliminar contenedores
docker-compose down

# Eliminar volumenes tambien
docker-compose down -v

# Eliminar imagenes
docker-compose down --rmi all

# Limpiar todo el sistema Docker
docker system prune -a --volumes
```

## Herramientas de Desarrollo

### pgAdmin

Acceder a: http://localhost:5050

- Email: admin@soldent.local
- Password: admin (cambiar en .env)

Para conectar a PostgreSQL desde pgAdmin:
- Host: postgres
- Port: 5432
- Database: soldent_dev
- Username: soldent_dev
- Password: (ver en .env)

### Redis Commander

Acceder a: http://localhost:8081

Herramientas opcionales disponibles usando profiles:

```bash
# Iniciar con herramientas de desarrollo
docker-compose -f docker-compose.dev.yml --profile tools up -d
```

## Volumenes

Los datos persistentes se almacenan en volumenes Docker:

### Produccion
- `soldent-postgres-data`: Datos de PostgreSQL
- `soldent-redis-data`: Datos de Redis

### Desarrollo
- `soldent-postgres-dev-data`: Datos de PostgreSQL
- `soldent-redis-dev-data`: Datos de Redis
- `soldent-pgadmin-dev-data`: Configuracion de pgAdmin
- `soldent-backend-node-modules`: node_modules del backend
- `soldent-frontend-node-modules`: node_modules del frontend
- `soldent-frontend-next`: Cache de build de Next.js

## Redes

- `soldent-network`: Red de produccion (172.20.0.0/16)
- `soldent-dev-network`: Red de desarrollo

## Puertos

### Produccion
- Frontend: 3000
- Backend: 3001
- PostgreSQL: 5432
- Redis: 6379

### Desarrollo
- Frontend: 3000
- Backend: 3001
- Backend Debug: 9229
- PostgreSQL: 5433
- Redis: 6380
- pgAdmin: 5050
- Redis Commander: 8081

## Seguridad

### Mejores Practicas Implementadas

1. **Multi-stage builds**: Imagenes optimizadas y ligeras
2. **Usuarios no-root**: Todos los servicios corren con usuarios limitados
3. **Security options**: `no-new-privileges:true`
4. **Health checks**: Monitoreo de salud de servicios
5. **Resource limits**: Limites de CPU y memoria
6. **Secrets management**: Variables de entorno para credenciales
7. **.dockerignore**: Excluir archivos innecesarios

### Recomendaciones

- Cambiar todas las passwords por defecto
- Usar secrets de Docker Swarm en produccion
- Escanear imagenes regularmente: `docker scan <image>`
- Mantener imagenes base actualizadas
- No exponer puertos innecesarios
- Usar HTTPS en produccion (con reverse proxy)

## Troubleshooting

### Contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs [service_name]

# Ver eventos
docker events

# Inspeccionar contenedor
docker inspect [container_name]
```

### Problemas de permisos

```bash
# Reconstruir sin cache
docker-compose build --no-cache

# Eliminar volumenes y recrear
docker-compose down -v
docker-compose up -d
```

### Hot reload no funciona

Verificar en `docker-compose.dev.yml`:
- Volumenes montados correctamente
- Variable `WATCHPACK_POLLING=true`
- Variable `CHOKIDAR_USEPOLLING=true`

### Base de datos no conecta

```bash
# Verificar health check
docker-compose ps

# Ver logs de PostgreSQL
docker-compose logs postgres

# Verificar conectividad
docker-compose exec backend ping postgres
```

## CI/CD

Estos Dockerfiles estan optimizados para CI/CD:

```yaml
# Ejemplo GitHub Actions
- name: Build Docker images
  run: |
    docker-compose build

- name: Run tests
  run: |
    docker-compose -f docker-compose.dev.yml run backend npm test
```

## Monitoreo

Para monitoreo en produccion, considerar agregar:

- Prometheus + Grafana
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Jaeger para distributed tracing
- Sentry para error tracking

## Recursos Adicionales

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [Prisma Docker Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
