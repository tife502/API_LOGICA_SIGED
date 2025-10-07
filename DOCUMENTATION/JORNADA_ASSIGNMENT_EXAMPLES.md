# Ejemplos de Asignación de Jornadas - Sistema Corregido

## ℹ️ Información Importante sobre Jornadas

### Jornadas Existentes en la Base de Datos
Las siguientes jornadas ya existen en la base de datos y **NO se deben crear nuevas**:
- ID: 1 - "Mañana"
- ID: 2 - "Tarde" 
- ID: 3 - "Sabatina"
- ID: 4 - "Nocturna"

### Lógica de Asignación
- Se buscan las jornadas existentes por **nombre**
- Se crean relaciones en la tabla `sede_jornada`
- Si una jornada no existe, se genera error
- Se previenen duplicados en asignaciones

---

## 📋 Ejemplo JSON Corregido para Crear Rector Completo

### Request Body (POST /api/empleado/metodos/rector/completo)

```json
{
  "empleado": {
    "tipo_documento": "cedula_ciudadania",
    "documento": "98765432",
    "nombre": "María Elena",
    "apellido": "García Rodríguez", 
    "email": "maria.garcia@educacion.gov.co",
    "direccion": "Calle 45 #12-34",
    "cargo": "rector"
  },
  "informacionAcademica": {
    "nivel_academico": "magister",
    "anos_experiencia": 15,
    "institucion": "Universidad Nacional de Colombia",
    "titulo": "Magister en Administración Educativa"
  },
  "institucion": {
    "nombre": "Institución Educativa María Montessori"
  },
  "sedes": {
    "crear": [
      {
        "nombre": "Sede Principal María Montessori",
        "zona": "urbana",
        "direccion": "Carrera 15 #23-45, Bogotá",
        "codigo_DANE": "11001012345",
        "jornadas": ["Mañana", "Tarde"]
      },
      {
        "nombre": "Sede Rural El Progreso", 
        "zona": "rural",
        "direccion": "Vereda El Progreso, Km 5",
        "codigo_DANE": "11001012346",
        "jornadas": ["Mañana", "Sabatina"]
      }
    ]
  },
  "fechaAsignacion": "2024-01-15",
  "observaciones": "Rector con experiencia en instituciones rurales"
}
```

### Response Example

```json
{
  "success": true,
  "data": {
    "rector": {
      "id": "uuid-generated-123",
      "tipo_documento": "cedula_ciudadania",
      "documento": "98765432",
      "nombre": "María Elena",
      "apellido": "García Rodríguez",
      "email": "maria.garcia@educacion.gov.co",
      "direccion": "Calle 45 #12-34",
      "cargo": "rector",
      "estado": "activo",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    "informacionAcademica": {
      "id": "uuid-info-456",
      "empleado_id": "uuid-generated-123",
      "nivel_academico": "magister",
      "anos_experiencia": 15,
      "institucion": "Universidad Nacional de Colombia",
      "titulo": "Magister en Administración Educativa",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    "institucion": {
      "id": "uuid-inst-789",
      "nombre": "Institución Educativa María Montessori",
      "rector_encargado_id": "uuid-generated-123",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    "sedes": [
      {
        "id": "uuid-sede-001",
        "nombre": "Sede Principal María Montessori",
        "estado": "activa",
        "zona": "urbana",
        "direccion": "Carrera 15 #23-45, Bogotá",
        "codigo_DANE": "11001012345",
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": "uuid-sede-002",
        "nombre": "Sede Rural El Progreso",
        "estado": "activa", 
        "zona": "rural",
        "direccion": "Vereda El Progreso, Km 5",
        "codigo_DANE": "11001012346",
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "asignaciones": [
      {
        "id": "uuid-asig-001",
        "empleado_id": "uuid-generated-123",
        "sede_id": "uuid-sede-001",
        "fecha_asignacion": "2024-01-15T00:00:00.000Z",
        "fecha_fin": null,
        "estado": "activa",
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": "uuid-asig-002", 
        "empleado_id": "uuid-generated-123",
        "sede_id": "uuid-sede-002",
        "fecha_asignacion": "2024-01-15T00:00:00.000Z",
        "fecha_fin": null,
        "estado": "activa",
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "jornadaAsignaciones": [
      {
        "sede_id": "uuid-sede-001",
        "jornada_id": 1,
        "jornada_nombre": "Mañana"
      },
      {
        "sede_id": "uuid-sede-001", 
        "jornada_id": 2,
        "jornada_nombre": "Tarde"
      },
      {
        "sede_id": "uuid-sede-002",
        "jornada_id": 1,
        "jornada_nombre": "Mañana"
      },
      {
        "sede_id": "uuid-sede-002",
        "jornada_id": 3,
        "jornada_nombre": "Sabatina"
      }
    ],
    "resumen": {
      "sedesCreadas": 2,
      "sedesAsignadas": 0,
      "asignacionesRealizadas": 2,
      "jornadasAsignadas": 4
    }
  },
  "message": "Rector completo creado exitosamente con 2 sedes y 4 asignaciones de jornada"
}
```

---

## ⚠️ Casos de Error con Jornadas

### 1. Jornada Inexistente
```json
{
  "jornadas": ["Mañana", "JornadaInventada"]
}
```
**Error Response:**
```json
{
  "success": false,
  "error": "Jornada no encontrada: JornadaInventada. Jornadas disponibles: Mañana, Tarde, Sabatina, Nocturna"
}
```

### 2. Jornadas Válidas Disponibles
- ✅ "Mañana" (ID: 1)
- ✅ "Tarde" (ID: 2)  
- ✅ "Sabatina" (ID: 3)
- ✅ "Nocturna" (ID: 4)
- ❌ Cualquier otro nombre

---

## 🔧 Cambios Implementados

### En el Servicio (`rector.service.ts`)
1. **Eliminado**: Lógica de creación de nuevas jornadas
2. **Corregido**: Manejo de jornadas como array de strings (no objetos)
3. **Agregado**: Búsqueda de jornadas existentes por nombre
4. **Agregado**: Validación de jornadas válidas
5. **Agregado**: Prevención de duplicados en `sede_jornada`
6. **Actualizado**: Respuesta incluye `jornadaAsignaciones` correctamente
7. **Mejorado**: Manejo de errores específicos para jornadas

### En las Interfaces (`prisma.interfaces.ts`)
1. **Modificado**: `ICreateRectorCompletoRequest.sedes.crear.jornadas` ahora es `string[]`
2. **Actualizado**: `ICreateRectorCompletoResponse.jornadaAsignaciones` en lugar de `jornadas`
3. **Corregido**: Resumen incluye `jornadasAsignadas` en lugar de `jornadasCreadas`

### Beneficios
- ✅ Consistencia con base de datos existente
- ✅ No duplicación de jornadas
- ✅ Validación robusta
- ✅ Mejor rendimiento (no creación innecesaria)
- ✅ Interfaz más simple y clara