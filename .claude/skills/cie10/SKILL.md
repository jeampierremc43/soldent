---
name: cie10-ecuador
description: Skill para trabajar con códigos CIE-10 de Ecuador en odontología. Usa este skill cuando necesites validar códigos diagnósticos, buscar enfermedades odontológicas, o implementar catálogos de CIE-10.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebSearch
  - WebFetch
---

# Skill: CIE-10 Ecuador - Odontología

Este skill proporciona conocimiento sobre códigos CIE-10 aplicados a odontología en Ecuador.

## Códigos CIE-10 comunes en odontología

### K00-K14: Enfermedades de la cavidad bucal, glándulas salivales y maxilares

#### K00: Trastornos del desarrollo y erupción de los dientes
- K00.0: Anodoncia
- K00.1: Dientes supernumerarios
- K00.2: Anomalías del tamaño y forma de los dientes
- K00.3: Dientes moteados
- K00.4: Alteraciones en la formación de los dientes
- K00.5: Alteraciones hereditarias de la estructura del diente
- K00.6: Alteraciones en la erupción de los dientes
- K00.7: Síndrome de erupción de los dientes
- K00.8: Otros trastornos del desarrollo de los dientes
- K00.9: Trastorno del desarrollo de los dientes, no especificado

#### K01: Dientes incluidos e impactados
- K01.0: Dientes incluidos
- K01.1: Dientes impactados

#### K02: Caries dental
- K02.0: Caries limitada al esmalte
- K02.1: Caries de la dentina
- K02.2: Caries del cemento
- K02.3: Caries dentaria detenida
- K02.4: Odontoclasia
- K02.8: Otras caries dentales
- K02.9: Caries dental, no especificada

#### K03: Otras enfermedades de los tejidos duros de los dientes
- K03.0: Atrición excesiva de los dientes
- K03.1: Abrasión de los dientes
- K03.2: Erosión de los dientes
- K03.3: Reabsorción patológica de los dientes
- K03.4: Hipercementosis
- K03.5: Anquilosis dental
- K03.6: Depósitos [acreciones] en los dientes
- K03.7: Cambios posteruptivos del color de los tejidos duros de los dientes
- K03.8: Otras enfermedades especificadas de los tejidos duros de los dientes
- K03.9: Enfermedad de los tejidos duros de los dientes, no especificada

#### K04: Enfermedades de la pulpa y tejidos periapicales
- K04.0: Pulpitis
- K04.1: Necrosis de la pulpa
- K04.2: Degeneración de la pulpa
- K04.3: Formación anormal de tejido duro en la pulpa
- K04.4: Periodontitis apical aguda originada en la pulpa
- K04.5: Periodontitis apical crónica
- K04.6: Absceso periapical con fístula
- K04.7: Absceso periapical sin fístula
- K04.8: Quiste radicular
- K04.9: Otras enfermedades y las no especificadas de la pulpa y del tejido periapical

#### K05: Gingivitis y enfermedades periodontales
- K05.0: Gingivitis aguda
- K05.1: Gingivitis crónica
- K05.2: Periodontitis aguda
- K05.3: Periodontitis crónica
- K05.4: Periodontosis
- K05.5: Otras enfermedades periodontales
- K05.6: Enfermedad periodontal, no especificada

#### K06: Otros trastornos de la encía y de la zona edéntula
- K06.0: Retracción gingival
- K06.1: Hiperplasia gingival
- K06.2: Lesiones de la encía y de la zona edéntula asociadas con traumatismo
- K06.8: Otros trastornos especificados de la encía y de la zona edéntula
- K06.9: Trastorno de la encía y de la zona edéntula, no especificado

#### K07: Anomalías dentofaciales [incluso maloclusión]
- K07.0: Anomalías evidentes del tamaño de los maxilares
- K07.1: Anomalías de la relación maxilobasilar
- K07.2: Anomalías de la relación entre los arcos dentarios
- K07.3: Anomalías de la posición del diente
- K07.4: Maloclusión de tipo no especificado
- K07.5: Anomalías dentofaciales funcionales
- K07.6: Trastornos de la articulación temporomandibular
- K07.8: Otras anomalías dentofaciales
- K07.9: Anomalía dentofacial, no especificada

#### K08: Otros trastornos de los dientes y estructuras de sostén
- K08.0: Exfoliación de los dientes debida a causas sistémicas
- K08.1: Pérdida de dientes debida a accidente, extracción o enfermedad periodontal local
- K08.2: Atrofia del reborde alveolar desdentado
- K08.3: Raíz dental retenida
- K08.8: Otros trastornos especificados de los dientes y de sus estructuras de sostén
- K08.9: Trastorno de los dientes y de sus estructuras de sostén, no especificado

## Estructura de datos recomendada

```typescript
interface CIE10Code {
  code: string;        // e.g., "K02.1"
  name: string;        // "Caries de la dentina"
  category: string;    // "K02: Caries dental"
  chapter: string;     // "K00-K14: Enfermedades de cavidad bucal"
  description?: string;
}

interface Diagnosis {
  id: string;
  patientId: string;
  date: Date;
  cie10Code: string;
  cie10Name: string;
  tooth?: string;      // Si aplica a diente específico
  notes?: string;
  diagnosedBy: string;
  relatedTreatments?: string[];
}
```

## Validaciones

1. ✓ Código existe en catálogo CIE-10
2. ✓ Código pertenece a categoría odontológica (K00-K14)
3. ✓ Formato correcto (letra + dígitos + punto + dígito)
4. ✓ Asociar con tratamiento correspondiente

## Uso en el sistema

- Registrar diagnósticos en historia clínica
- Filtrar y buscar por código o nombre
- Reportes epidemiológicos
- Facturación y seguros
- Estadísticas del consultorio
