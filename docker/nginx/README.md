# Nginx Configuration

Configuracion de Nginx como reverse proxy para Soldent.

## Estructura

```
nginx/
├── nginx.conf           # Configuracion principal
├── conf.d/
│   └── default.conf    # Virtual host configuration
└── ssl/                # Certificados SSL (crear en produccion)
    ├── cert.pem
    └── key.pem
```

## Configuracion SSL para Produccion

### Opcion 1: Let's Encrypt (Recomendado)

1. Instalar Certbot:

```bash
# En el host
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

2. Obtener certificado:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

3. Copiar certificados a la carpeta ssl:

```bash
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem
```

4. Renovacion automatica:

```bash
sudo certbot renew --dry-run
```

### Opcion 2: Certificado Auto-firmado (Solo desarrollo)

```bash
cd ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem \
  -out cert.pem \
  -subj "/C=PE/ST=Lima/L=Lima/O=Soldent/CN=localhost"
```

### Opcion 3: Certificado Comercial

1. Comprar certificado SSL de un proveedor
2. Copiar los archivos a la carpeta `ssl/`:
   - `cert.pem` - Certificado completo con cadena
   - `key.pem` - Clave privada

## Habilitar HTTPS

1. Descomentar la seccion HTTPS en `conf.d/default.conf`
2. Actualizar `server_name` con tu dominio
3. Reiniciar Nginx:

```bash
docker-compose -f docker-compose.prod.yml restart nginx
```

## Testing

### Test de configuracion:

```bash
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

### Reload sin downtime:

```bash
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

## Monitoreo

### Ver logs:

```bash
# Access logs
docker-compose -f docker-compose.prod.yml logs -f nginx

# Error logs
docker-compose -f docker-compose.prod.yml exec nginx tail -f /var/log/nginx/error.log
```

## Optimizaciones

### Cache de contenido estatico

Ya configurado en `default.conf` para:
- Imagenes (jpg, png, gif, etc.)
- CSS y JavaScript
- Fuentes (woff, ttf, etc.)

### Rate Limiting

Configurado para limitar requests a la API:
- 10 requests/segundo
- Burst de 20 requests
- Respuesta 429 si se excede

### Gzip Compression

Habilitado para:
- HTML, CSS, JavaScript
- JSON y XML
- SVG

## Security Headers

Headers de seguridad configurados:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security (HSTS)

## Troubleshooting

### Nginx no inicia

```bash
# Verificar sintaxis
docker-compose exec nginx nginx -t

# Ver logs
docker-compose logs nginx
```

### Problemas de permisos SSL

```bash
# Verificar permisos de certificados
ls -la ssl/
chmod 644 ssl/cert.pem
chmod 600 ssl/key.pem
```

### Backend/Frontend no responde

```bash
# Verificar upstreams
docker-compose ps

# Test de conectividad
docker-compose exec nginx ping backend
docker-compose exec nginx ping frontend
```
