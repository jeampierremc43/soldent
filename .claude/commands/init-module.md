---
description: Inicializa un nuevo módulo completo (backend + frontend) con estructura base
argument-hint: nombre-del-modulo
---

# Inicializar módulo: $1

Crea la estructura completa para un nuevo módulo del sistema.

## Pasos a seguir:

1. **Backend**:
   - Crear modelo Prisma en `backend/prisma/schema.prisma`
   - Crear repositorio en `backend/src/repositories/$1.repository.ts`
   - Crear servicio en `backend/src/services/$1.service.ts`
   - Crear controlador en `backend/src/controllers/$1.controller.ts`
   - Crear rutas en `backend/src/routes/$1.routes.ts`
   - Crear tipos en `backend/src/types/$1.types.ts`
   - Agregar validaciones con Zod

2. **Frontend**:
   - Crear página en `frontend/src/app/$1/page.tsx`
   - Crear componentes en `frontend/src/components/$1/`
   - Crear tipos en `frontend/src/types/$1.types.ts`
   - Crear hooks en `frontend/src/hooks/use$1.ts`
   - Crear servicios API en `frontend/src/lib/api/$1.ts`

3. **Tests**:
   - Tests unitarios para servicios
   - Tests de integración para APIs
   - Tests E2E con Playwright

Por favor, procede con la implementación.
