---
name: odontograma
description: Skill para trabajar con odontogramas dentales (niños y adultos). Usa este skill cuando necesites crear, actualizar o visualizar odontogramas, validar nomenclatura dental FDI/Universal, o implementar lógica de odontograma.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Skill: Odontograma

Este skill proporciona conocimiento y utilidades para trabajar con odontogramas dentales.

## Nomenclatura dental

### Sistema FDI (Internacional)
**Dientes permanentes (adultos - 32 dientes):**
- Cuadrante 1 (superior derecho): 11-18
- Cuadrante 2 (superior izquierdo): 21-28
- Cuadrante 3 (inferior izquierdo): 31-38
- Cuadrante 4 (inferior derecho): 41-48

**Dientes temporales (niños - 20 dientes):**
- Cuadrante 5 (superior derecho): 51-55
- Cuadrante 6 (superior izquierdo): 61-65
- Cuadrante 7 (inferior izquierdo): 71-75
- Cuadrante 8 (inferior derecho): 81-85

### Sistema Universal (Americano)
**Permanentes:** 1-32 (comenzando superior derecho, terminando inferior derecho)
**Temporales:** A-T

## Superficies dentales

- **O**: Oclusal (superficie de masticación)
- **M**: Mesial (hacia el centro)
- **D**: Distal (alejándose del centro)
- **V**: Vestibular (hacia las mejillas/labios)
- **L**: Lingual (hacia la lengua)
- **P**: Palatina (paladar - solo superiores)

## Estados dentales comunes

```typescript
enum ToothStatus {
  HEALTHY = 'healthy',           // Sano
  CARIES = 'caries',            // Caries
  FILLED = 'filled',            // Obturado
  MISSING = 'missing',          // Ausente
  FRACTURED = 'fractured',      // Fracturado
  CROWN = 'crown',              // Corona
  IMPLANT = 'implant',          // Implante
  ROOT_CANAL = 'root_canal',    // Endodoncia
  EXTRACTION = 'extraction',    // Para extracción
  BRIDGE = 'bridge',            // Puente
  TEMPORARY = 'temporary',      // Temporal
}
```

## Estructura de datos recomendada

```typescript
interface Tooth {
  id: string;
  toothNumber: string;  // FDI notation (e.g., "11", "51")
  status: ToothStatus;
  surfaces: {
    oclusal?: SurfaceCondition;
    mesial?: SurfaceCondition;
    distal?: SurfaceCondition;
    vestibular?: SurfaceCondition;
    lingual?: SurfaceCondition;
  };
  notes?: string;
  treatmentHistory: Treatment[];
}

interface SurfaceCondition {
  status: ToothStatus;
  date: Date;
  treatedBy?: string;
}

interface Odontogram {
  id: string;
  patientId: string;
  date: Date;
  type: 'permanent' | 'temporary';
  teeth: Tooth[];
  generalNotes?: string;
  createdBy: string;
}
```

## Validaciones

Al implementar odontogramas, valida:
1. ✓ Números de diente válidos según sistema (FDI/Universal)
2. ✓ Tipo de dentición (permanente/temporal) coincide con edad del paciente
3. ✓ No duplicar dientes
4. ✓ Superficies válidas para cada diente
5. ✓ Historial inmutable (versioning)

## Visualización

Para renderizar odontogramas:
- Usa SVG para representación visual
- Código de colores para estados
- Interactivo (click para seleccionar diente)
- Tooltips con información detallada
- Layout anatómico (4 cuadrantes)
