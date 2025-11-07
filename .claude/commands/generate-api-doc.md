---
description: Genera documentación completa de API para un módulo
argument-hint: nombre-del-modulo
---

# Generar documentación API: $1

Crea documentación completa de los endpoints del módulo en formato Markdown.

## Estructura de la documentación:

Para cada endpoint documentar:

### Información general
- Método HTTP (GET, POST, PUT, DELETE, PATCH)
- Ruta completa
- Descripción breve
- Autenticación requerida
- Permisos necesarios

### Request
- Headers requeridos
- Path parameters
- Query parameters
- Body (con ejemplo JSON)
- Validaciones

### Response
- Status codes posibles
- Body structure
- Ejemplos de respuestas exitosas
- Ejemplos de errores

### Ejemplos de uso
- cURL command
- JavaScript/TypeScript fetch
- Axios example

## Formato

```markdown
## GET /api/$1/:id

Obtiene un $1 por ID.

**Autenticación**: Requerida
**Permisos**: `$1:read`

### Request

**Path Parameters**:
- `id` (string): ID del $1

**Query Parameters**:
- `include` (string, optional): Relaciones a incluir

### Response

**Success (200)**:
```json
{
  "id": "uuid",
  "name": "Example",
  ...
}
```

**Error (404)**:
```json
{
  "error": "Not found",
  "message": "$1 no encontrado"
}
```
```

Genera la documentación completa.
