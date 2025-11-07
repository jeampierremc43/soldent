# 🤖 Guía de Uso de Agentes de Claude Code

Esta guía explica cómo usar los agentes especializados, skills y comandos para desarrollar el proyecto Soldent de manera eficiente.

---

## 📋 Tabla de Contenidos

1. [¿Qué son los Agentes?](#qué-son-los-agentes)
2. [¿Qué son las Skills?](#qué-son-las-skills)
3. [¿Qué son los Comandos Slash?](#qué-son-los-comandos-slash)
4. [Agentes Disponibles](#agentes-disponibles)
5. [Skills Disponibles](#skills-disponibles)
6. [Comandos Disponibles](#comandos-disponibles)
7. [Flujos de Trabajo Comunes](#flujos-de-trabajo-comunes)
8. [Trabajo en Paralelo](#trabajo-en-paralelo)
9. [Mejores Prácticas](#mejores-prácticas)

---

## 🤔 ¿Qué son los Agentes?

Los **agentes** son asistentes AI especializados con conocimientos y responsabilidades específicas. Cada agente tiene:

- **Expertise definido:** Conocimiento especializado en un área
- **Contexto aislado:** Trabaja en su propio espacio sin contaminar la conversación principal
- **Herramientas específicas:** Acceso a tools relevantes para su trabajo
- **System prompt personalizado:** Instrucciones que guían su comportamiento

### Ubicación
Los agentes están en [.claude/agents/](.claude/agents/)

### Cómo Usar un Agente

Simplemente pide a Claude que actúe como ese agente:

```
"Actúa como el agente backend-dev y crea el módulo de pacientes"
```

O usa el Task tool para delegarle trabajo:

```
"Usa el Task tool para que el agente database-expert optimice las queries"
```

---

## 🛠️ ¿Qué son las Skills?

Las **skills** son módulos de conocimiento especializado que se activan automáticamente cuando son relevantes. Contienen:

- **Conocimiento de dominio:** Información especializada (ej: nomenclatura dental)
- **Estructuras de datos:** Interfaces y tipos recomendados
- **Validaciones:** Reglas de negocio
- **Best practices:** Mejores prácticas del dominio

### Ubicación
Las skills están en [.claude/skills/](.claude/skills/)

### Activación Automática

Las skills se activan cuando mencionas temas relacionados:

```
"Necesito implementar un odontograma"
→ Activa automáticamente la skill de odontograma

"¿Qué códigos CIE-10 usar para gingivitis?"
→ Activa automáticamente la skill de CIE-10
```

---

## ⚡ ¿Qué son los Comandos Slash?

Los **comandos slash** son atajos para tareas repetitivas. Son como scripts reutilizables.

### Ubicación
Los comandos están en [.claude/commands/](.claude/commands/)

### Cómo Usar un Comando

```bash
/init-module pacientes
/review-module citas
/generate-api-doc tratamientos
```

---

## 👥 Agentes Disponibles

### 1. 🏗️ Arquitecto
**Archivo:** [.claude/agents/arquitecto.md](.claude/agents/arquitecto.md)

**Cuándo usar:**
- Necesitas diseñar la arquitectura de un módulo nuevo
- Quieres diseñar un esquema de base de datos
- Necesitas definir APIs RESTful
- Quieres aplicar patrones de diseño
- Necesitas asegurar escalabilidad

**Ejemplo de uso:**
```
Actúa como el agente arquitecto.

Necesito diseñar la arquitectura para un módulo de notificaciones que:
- Envíe SMS, Email y WhatsApp
- Soporte templates personalizables
- Tenga queue para procesamiento asíncrono
- Integre con servicios externos (Twilio, SendGrid)

Por favor diseña:
1. Esquema de base de datos
2. APIs necesarias
3. Servicios y su interacción
4. Patrones de diseño a aplicar
```

### 2. 💻 Backend Developer
**Archivo:** [.claude/agents/backend-dev.md](.claude/agents/backend-dev.md)

**Cuándo usar:**
- Implementar APIs REST
- Crear servicios de negocio
- Implementar validaciones
- Crear controladores y rutas
- Integrar con Prisma

**Ejemplo de uso:**
```
Actúa como el agente backend-dev.

Implementa el módulo completo de pacientes con:

1. Repository (backend/src/repositories/patient.repository.ts)
2. Service con lógica de negocio (backend/src/services/patient.service.ts)
3. Controller (backend/src/controllers/patient.controller.ts)
4. Routes (backend/src/routes/patient.routes.ts)
5. Validaciones con Zod (backend/src/types/patient.types.ts)

Incluye:
- CRUD completo
- Búsqueda con filtros
- Paginación
- Manejo de errores
- Validaciones robustas
```

### 3. 🎨 Frontend Developer
**Archivo:** [.claude/agents/frontend-dev.md](.claude/agents/frontend-dev.md)

**Cuándo usar:**
- Crear componentes React
- Implementar páginas de Next.js 14
- Integrar shadcn/ui
- Crear formularios con validación
- Implementar estado global

**Ejemplo de uso:**
```
Actúa como el agente frontend-dev.

Crea la página de gestión de pacientes con:

1. Página principal (frontend/src/app/pacientes/page.tsx)
2. Componente de tabla con paginación
3. Modal para crear/editar paciente
4. Formulario con React Hook Form + Zod
5. Integración con API del backend
6. Estados de carga y errores

Usa shadcn/ui para los componentes base.
```

### 4. 🦷 Experto en Odontología
**Archivo:** [.claude/agents/odontologia-expert.md](.claude/agents/odontologia-expert.md)

**Cuándo usar:**
- Validar terminología médica
- Diseñar estructuras de odontogramas
- Validar códigos CIE-10
- Definir flujos clínicos
- Validar nomenclatura dental

**Ejemplo de uso:**
```
Actúa como el agente odontologia-expert.

Revisa esta estructura de odontograma y valida:

1. ¿Los números de dientes son correctos según FDI?
2. ¿Las superficies dentales están bien definidas?
3. ¿Los estados son apropiados para odontología?
4. ¿Falta algún estado o superficie importante?
5. ¿La lógica de versionado es correcta?

[código del odontograma aquí]
```

### 5. 💰 Experto en Contabilidad
**Archivo:** [.claude/agents/contabilidad-expert.md](.claude/agents/contabilidad-expert.md)

**Cuándo usar:**
- Diseñar módulos financieros
- Validar cálculos contables
- Estructurar reportes financieros
- Implementar facturación
- Validar flujos de pago

**Ejemplo de uso:**
```
Actúa como el agente contabilidad-expert.

Necesito implementar el módulo de planes de pago:

1. Valida esta estructura de datos de PaymentPlan
2. ¿Los cálculos de cuotas son correctos?
3. ¿Cómo manejar cuotas vencidas con intereses de mora?
4. ¿Qué reportes necesito para control financiero?
5. ¿Cómo integrar con facturación electrónica SRI?

[código aquí]
```

### 6. 🗄️ Experto en Base de Datos
**Archivo:** [.claude/agents/database-expert.md](.claude/agents/database-expert.md)

**Cuándo usar:**
- Diseñar esquemas de base de datos
- Optimizar queries
- Crear índices
- Definir migraciones
- Solucionar problemas de performance

**Ejemplo de uso:**
```
Actúa como el agente database-expert.

Tengo un problema de performance en estas queries:

[queries lentas aquí]

Por favor:
1. Analiza qué está causando lentitud
2. Sugiere índices necesarios
3. Optimiza las queries
4. Verifica que no haya problemas N+1
5. Genera la migración de Prisma para los índices
```

### 7. 🐳 DevOps Engineer
**Archivo:** [.claude/agents/devops.md](.claude/agents/devops.md)

**Cuándo usar:**
- Configurar Docker
- Optimizar builds
- Configurar CI/CD
- Solucionar problemas de deployment
- Configurar monitoreo

**Ejemplo de uso:**
```
Actúa como el agente devops.

Necesito optimizar los Dockerfiles:

1. Reducir tamaño de imágenes
2. Mejorar tiempo de build con cache layers
3. Implementar health checks más robustos
4. Configurar secrets de manera segura
5. Agregar stage de testing en CI/CD

Revisa los archivos en docker/ y sugiere mejoras.
```

### 8. 🎨 UI/UX Designer
**Archivo:** [.claude/agents/ui-ux-designer.md](.claude/agents/ui-ux-designer.md)

**Cuándo usar:**
- Diseñar interfaces
- Mejorar experiencia de usuario
- Validar accesibilidad
- Diseñar flujos de usuario
- Elegir componentes apropiados

**Ejemplo de uso:**
```
Actúa como el agente ui-ux-designer.

Necesito diseñar la interfaz del calendario de citas:

1. ¿Qué vista es mejor: día, semana o mes como default?
2. ¿Cómo mostrar múltiples doctores simultáneamente?
3. ¿Qué información mostrar en cada cita?
4. ¿Cómo implementar drag & drop para reagendar?
5. ¿Qué componentes de shadcn/ui usar?
6. ¿Cómo hacer accesible el calendario?

Diseña los componentes y flujos de usuario.
```

### 9. 🧪 QA Tester
**Archivo:** [.claude/agents/qa-tester.md](.claude/agents/qa-tester.md)

**Cuándo usar:**
- Escribir tests
- Encontrar bugs
- Validar funcionalidad
- Crear test cases
- Revisar cobertura

**Ejemplo de uso:**
```
Actúa como el agente qa-tester.

Necesito tests E2E con Playwright para el módulo de citas:

1. Test: Agendar una cita simple
2. Test: Agendar una cita recurrente
3. Test: Validar que no se permitan citas duplicadas
4. Test: Reagendar una cita
5. Test: Cancelar una cita

Implementa los tests en tests/e2e/appointments.spec.ts
```

---

## 🎯 Skills Disponibles

### 1. 🦷 Odontograma
**Archivo:** [.claude/skills/odontograma/SKILL.md](.claude/skills/odontograma/SKILL.md)

**Se activa automáticamente con:**
- "odontograma"
- "dientes"
- "nomenclatura dental"
- "FDI"
- "sistema universal"
- "superficies dentales"

**Contenido:**
- Nomenclatura FDI e Universal
- 32 dientes permanentes vs 20 temporales
- Superficies dentales (O, M, D, V, L, P)
- Estados dentales
- Estructuras de datos TypeScript
- Validaciones

### 2. 📋 CIE-10 Ecuador
**Archivo:** [.claude/skills/cie10/SKILL.md](.claude/skills/cie10/SKILL.md)

**Se activa automáticamente con:**
- "CIE-10"
- "códigos diagnósticos"
- "K00", "K02", "caries", "gingivitis"
- "diagnósticos odontológicos"

**Contenido:**
- Códigos K00-K14 completos
- Categorías de enfermedades bucales
- Estructuras de datos
- Validaciones
- Uso en el sistema

### 3. 💰 Contabilidad
**Archivo:** [.claude/skills/contabilidad/SKILL.md](.claude/skills/contabilidad/SKILL.md)

**Se activa automáticamente con:**
- "contabilidad"
- "pagos"
- "cuotas"
- "facturación"
- "ingresos", "egresos"
- "plan de pago"

**Contenido:**
- Transacciones
- Planes de pago
- Cuotas e installments
- Gastos categorizados
- Reportes financieros
- Facturación SRI Ecuador

### 4. 📅 Sistema de Citas
**Archivo:** [.claude/skills/citas/SKILL.md](.claude/skills/citas/SKILL.md)

**Se activa automáticamente con:**
- "citas"
- "agendamiento"
- "calendario"
- "citas recurrentes"
- "disponibilidad"
- "horarios"

**Contenido:**
- Estructura de citas
- Citas recurrentes (frecuencias)
- Validación de disponibilidad
- Slots de tiempo
- Recordatorios
- Vistas de calendario

---

## ⚡ Comandos Disponibles

### /init-module
**Archivo:** [.claude/commands/init-module.md](.claude/commands/init-module.md)

**Uso:**
```bash
/init-module nombre-del-modulo
```

**Qué hace:**
Inicializa un módulo completo con:
- Backend: modelo Prisma, repository, service, controller, routes, types
- Frontend: página, componentes, types, hooks, API services
- Tests: unitarios, integración, E2E

**Ejemplo:**
```bash
/init-module notificaciones
```

### /review-module
**Archivo:** [.claude/commands/review-module.md](.claude/commands/review-module.md)

**Uso:**
```bash
/review-module nombre-del-modulo
```

**Qué hace:**
Revisa un módulo buscando:
- Errores de TypeScript
- Validaciones faltantes
- Problemas de seguridad
- Code smells
- Tests faltantes

**Ejemplo:**
```bash
/review-module pacientes
```

### /generate-api-doc
**Archivo:** [.claude/commands/generate-api-doc.md](.claude/commands/generate-api-doc.md)

**Uso:**
```bash
/generate-api-doc nombre-del-modulo
```

**Qué hace:**
Genera documentación completa de API:
- Endpoints con método HTTP
- Request (headers, params, query, body)
- Response (status codes, ejemplos)
- Ejemplos de uso (cURL, JavaScript, Axios)

**Ejemplo:**
```bash
/generate-api-doc tratamientos
```

---

## 🔄 Flujos de Trabajo Comunes

### Flujo 1: Crear un Nuevo Módulo

```
1. Usa el comando para generar estructura:
   /init-module nuevo-modulo

2. El arquitecto diseña el esquema:
   Actúa como el agente arquitecto y diseña el esquema de base de datos para [nuevo-modulo]

3. El database-expert implementa el schema:
   Actúa como el agente database-expert e implementa el modelo Prisma para [nuevo-modulo]

4. El backend-dev implementa la API:
   Actúa como el agente backend-dev e implementa el módulo backend completo

5. El frontend-dev implementa la UI:
   Actúa como el agente frontend-dev e implementa la interfaz de usuario

6. El qa-tester crea los tests:
   Actúa como el agente qa-tester y crea tests E2E para [nuevo-modulo]

7. Revisa el módulo:
   /review-module nuevo-modulo

8. Genera la documentación:
   /generate-api-doc nuevo-modulo
```

### Flujo 2: Optimizar Performance

```
1. Identifica el problema:
   "Estas queries son lentas: [queries]"

2. El database-expert analiza:
   Actúa como el agente database-expert y analiza por qué estas queries son lentas

3. Implementa las optimizaciones:
   Actúa como el agente database-expert e implementa los índices y optimizaciones sugeridas

4. El qa-tester valida:
   Actúa como el agente qa-tester y crea tests de performance para verificar la mejora
```

### Flujo 3: Implementar Feature Compleja

```
1. El arquitecto diseña:
   Actúa como el agente arquitecto y diseña la arquitectura para [feature compleja]

2. Divide en sub-tareas y asigna agentes:
   - Backend-dev: APIs
   - Frontend-dev: UI
   - Database-expert: Schema
   - Experto de dominio: Validaciones

3. Los agentes trabajan en paralelo (ver sección siguiente)

4. El qa-tester integra y testea:
   Actúa como el agente qa-tester y crea tests de integración

5. Revisión final:
   /review-module feature
```

---

## 🚀 Trabajo en Paralelo

Claude Code puede ejecutar múltiples agentes en paralelo para maximizar eficiencia.

### Cómo Ejecutar Agentes en Paralelo

Usa un solo mensaje con múltiples Task tools:

```
Ejecuta estos agentes en paralelo:

1. Agente backend-dev: Implementa el servicio de pacientes
2. Agente frontend-dev: Implementa el formulario de pacientes
3. Agente database-expert: Optimiza las queries de búsqueda
4. Agente qa-tester: Crea tests E2E para pacientes

[Incluye detalles para cada agente]
```

### Ejemplo Práctico

```
Necesito implementar el módulo de citas completo. Ejecuta en paralelo:

AGENTE 1 - database-expert:
- Implementa el modelo Prisma de Appointment
- Implementa el modelo de RecurringAppointment
- Crea índices para fecha, doctorId, patientId

AGENTE 2 - backend-dev:
- Implementa repository de appointments
- Implementa service con validación de disponibilidad
- Implementa controller y routes

AGENTE 3 - frontend-dev:
- Implementa componente de calendario
- Implementa modal de nueva cita
- Implementa drag & drop para reagendar

AGENTE 4 - ui-ux-designer:
- Diseña el flujo de usuario para agendar citas
- Define componentes de shadcn/ui a usar
- Define paleta de colores para estados de cita
```

### Ventajas del Trabajo en Paralelo

✅ **Velocidad:** 4x más rápido que secuencial
✅ **Especialización:** Cada agente usa su expertise
✅ **Aislamiento:** No hay conflictos de contexto
✅ **Eficiencia:** Máximo uso de capacidad de Claude

---

## 💡 Mejores Prácticas

### 1. Elige el Agente Correcto

❌ **Mal:**
```
"Implementa el módulo de pacientes"
```

✅ **Bien:**
```
"Actúa como el agente backend-dev e implementa el módulo de pacientes siguiendo la estructura definida en .claude/agents/backend-dev.md"
```

### 2. Sé Específico

❌ **Mal:**
```
"Actúa como el agente database-expert y arregla la base de datos"
```

✅ **Bien:**
```
"Actúa como el agente database-expert y:
1. Analiza esta query lenta: [query]
2. Sugiere índices necesarios
3. Implementa la migración de Prisma
4. Documenta los cambios"
```

### 3. Usa Skills Automáticamente

❌ **No necesitas:**
```
"Lee la skill de odontograma y luego..."
```

✅ **Simplemente menciona:**
```
"Necesito implementar un odontograma con sistema FDI"
→ La skill se activará automáticamente
```

### 4. Combina Agentes y Skills

✅ **Ejemplo:**
```
Actúa como el agente backend-dev.

Implementa el servicio de odontogramas usando el conocimiento de la skill de odontograma. Asegúrate de validar:
- Números de dientes según FDI
- Superficies dentales correctas
- Estados válidos
- Versionado apropiado
```

### 5. Usa Comandos para Tareas Repetitivas

❌ **Repetir manualmente:**
```
1. Crea modelo Prisma
2. Crea repository
3. Crea service
4. Crea controller
5. Crea routes
...
```

✅ **Usa el comando:**
```
/init-module nuevo-modulo
```

### 6. Revisa Siempre

Después de implementar, siempre revisa:

```
/review-module nombre-modulo
```

### 7. Documenta la API

Después de implementar endpoints:

```
/generate-api-doc nombre-modulo
```

### 8. Paraleliza Cuando Sea Posible

❌ **Secuencial (lento):**
```
1. Primero el backend
2. Luego el frontend
3. Luego los tests
```

✅ **Paralelo (rápido):**
```
Ejecuta en paralelo:
- backend-dev: Implementa API
- frontend-dev: Implementa UI
- qa-tester: Escribe tests
```

### 9. Mantén el Contexto Claro

Cuando uses un agente, dale todo el contexto necesario:

```
Actúa como el agente backend-dev.

Contexto:
- El modelo Prisma ya existe en backend/prisma/schema.prisma
- Seguimos la estructura: Repository → Service → Controller
- Usamos Zod para validación
- Todos los endpoints requieren autenticación JWT

Tarea:
Implementa el módulo de [...]
```

### 10. Iteración y Refinamiento

No esperes perfección en el primer intento:

```
1. Implementación inicial:
   Actúa como el agente backend-dev e implementa [módulo]

2. Revisión:
   /review-module modulo

3. Refinamiento:
   Actúa como el agente backend-dev y corrige los issues encontrados en la revisión

4. Testing:
   Actúa como el agente qa-tester y verifica que todo funciona correctamente
```

---

## 🎯 Casos de Uso Completos

### Caso 1: Implementar Módulo de Odontogramas

```markdown
### Fase 1: Diseño (Arquitecto)

Actúa como el agente arquitecto.

Diseña el módulo de odontogramas considerando:
- Versionado (un paciente puede tener múltiples odontogramas en el tiempo)
- Sistema FDI para numeración
- Estados de dientes (healthy, caries, filled, missing, etc.)
- Superficies dentales
- Relación con tratamientos
- Queries eficientes

### Fase 2: Validación (Experto Odontología)

Actúa como el agente odontologia-expert.

Revisa el diseño propuesto y valida:
- Nomenclatura dental correcta
- Estados y superficies apropiadas
- Lógica clínica correcta

### Fase 3: Implementación Paralela

Ejecuta en paralelo:

AGENTE database-expert:
Implementa el modelo Prisma de Odontogram y Tooth con:
- Versionado automático
- Relaciones correctas
- Índices necesarios

AGENTE backend-dev:
Implementa:
- Repository con métodos de versionado
- Service con validaciones de FDI
- Controller y routes CRUD
- Validaciones Zod

AGENTE frontend-dev:
Implementa:
- Componente visual de odontograma (SVG)
- Interactividad (click en dientes)
- Color coding por estado
- Modal de edición de diente

AGENTE ui-ux-designer:
Diseña:
- Layout del odontograma
- Leyenda de colores
- Flujo de edición
- Responsividad

### Fase 4: Testing (QA Tester)

Actúa como el agente qa-tester.

Crea tests E2E:
- Crear odontograma inicial
- Actualizar estado de diente
- Verificar versionado
- Validar números FDI
- Exportar odontograma

### Fase 5: Revisión Final

/review-module odontogramas

### Fase 6: Documentación

/generate-api-doc odontogramas
```

---

## 🔍 Troubleshooting

### Problema: El agente no sigue las instrucciones

**Solución:**
- Sé más específico en tus instrucciones
- Incluye ejemplos de lo que esperas
- Referencia el archivo del agente: "según .claude/agents/[agente].md"

### Problema: Los agentes en paralelo crean conflictos

**Solución:**
- Define claramente qué hace cada agente
- Asigna archivos específicos a cada agente
- No hagas que dos agentes modifiquen el mismo archivo

### Problema: La skill no se activa

**Solución:**
- Menciona explícitamente el tema de la skill
- Usa las palabras clave de la descripción
- O actívala manualmente: "usando la skill de [nombre]"

### Problema: El comando no hace lo que espero

**Solución:**
- Revisa el archivo del comando en .claude/commands/
- Modifica el comando según tus necesidades
- Crea un comando personalizado nuevo

---

## 📚 Recursos Adicionales

- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Resumen completo del proyecto
- [Backend README](backend/README.md) - Documentación del backend
- [Prisma Docs](backend/prisma/SCHEMA_OVERVIEW.md) - Documentación de base de datos
- [Claude Code Docs](https://docs.claude.com/en/docs/claude-code) - Documentación oficial

---

<div align="center">
  <p>🤖 Hecho con AI por Claude Code</p>
  <p>© 2025 Soldent</p>
</div>
