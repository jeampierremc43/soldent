---
description: Revisa un módulo completo buscando errores, mejoras y best practices
argument-hint: nombre-del-modulo
---

# Revisar módulo: $1

Realiza una revisión exhaustiva del módulo buscando:

## Aspectos a revisar:

### Backend
- [ ] Tipos TypeScript correctos y completos
- [ ] Validaciones de entrada con Zod
- [ ] Manejo de errores apropiado
- [ ] Queries optimizados (sin N+1)
- [ ] Transacciones donde sea necesario
- [ ] Logs estructurados
- [ ] Comentarios JSDoc
- [ ] Tests con buena cobertura

### Frontend
- [ ] Componentes tipados correctamente
- [ ] Manejo de estados de carga
- [ ] Manejo de errores
- [ ] Validación de formularios
- [ ] Accesibilidad (a11y)
- [ ] Responsive design
- [ ] Performance (memoización)
- [ ] UX apropiada

### Seguridad
- [ ] Validación de permisos
- [ ] Sanitización de inputs
- [ ] No exponer datos sensibles
- [ ] SQL injection prevention
- [ ] XSS prevention

### Código limpio
- [ ] Naming conventions
- [ ] DRY (Don't Repeat Yourself)
- [ ] SOLID principles
- [ ] Funciones pequeñas y enfocadas
- [ ] Separación de responsabilidades

Procede con la revisión y reporta los hallazgos.
