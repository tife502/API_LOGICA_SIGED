# API de Suplencias - SIGED

## Descripción
API para gestión completa de suplencias docentes en el sistema SIGED. Permite administrar ausencias de docentes, sus reemplazos correspondientes, horas cubiertas y la documentación asociada.

## Características
- ✅ **CRUD completo** para suplencias
- ✅ **Gestión de documentos** asociados a cada suplencia
- ✅ **Control de docentes** (ausente y reemplazo)
- ✅ **Seguimiento de horas** cubiertas
- ✅ **Jornadas específicas** (mañana, tarde, sabatina)
- ✅ **Autenticación JWT** requerida en todas las rutas
- ✅ **Control de permisos**: DELETE solo para super_admin
- ✅ **Paginación** en listados
- ✅ **Filtros avanzados** por docente, sede, jornada, fechas
- ✅ **Estadísticas detalladas** por jornada y horas
- ✅ **Validación de fechas** y coherencia de datos

## Modelo de Datos

### Suplencia
```typescript
{
  id: string;                           // UUID generado automáticamente
  docente_ausente_id: string;           // ID del docente ausente
  causa_ausencia: string;               // Motivo de la ausencia
  fecha_inicio_ausencia: Date;          // Fecha de inicio de la ausencia
  fecha_fin_ausencia: Date;             // Fecha de fin de la ausencia
  sede_id: string;                      // ID de la sede
  docente_reemplazo_id: string;         // ID del docente que reemplaza
  fecha_inicio_reemplazo: Date;         // Fecha de inicio del reemplazo
  fecha_fin_reemplazo: Date;            // Fecha de fin del reemplazo
  horas_cubiertas: number;              // Horas cubiertas en el reemplazo
  jornada: SuplenciasJornada;           // Jornada de la suplencia
  observacion?: string;                 // Observaciones adicionales
  created_at: DateTime;                 // Fecha de creación
}
```

### Jornadas Disponibles
```typescript
enum SuplenciasJornada {
  ma_ana = 'mañana',                    // Jornada de mañana
  tarde = 'tarde',                      // Jornada de tarde
  sabatina = 'sabatina'                 // Jornada sabatina
}
```

---

# ENDPOINTS DE SUPLENCIAS

## Base URL: `/api/suplencias`

---

## 1. Obtener Jornadas Disponibles
**GET** `/api/suplencias/jornadas`

### Headers
```json
{
  "Authorization": "Bearer <jwt_token>"
}
```

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Jornadas disponibles obtenidas exitosamente",
  "data": [
    {
      "valor": "ma_ana",
      "descripcion": "Mañana",
      "ejemplo": "Suplencia de 7:00 AM a 12:00 PM"
    },
    {
      "valor": "tarde",
      "descripcion": "Tarde",
      "ejemplo": "Suplencia de 12:00 PM a 6:00 PM"
    },
    {
      "valor": "sabatina",
      "descripcion": "Sabatina",
      "ejemplo": "Suplencia de 7:00 AM a 12:00 PM los sábados"
    }
  ]
}
```

---

## 2. Crear Suplencia
**POST** `/api/suplencias`

### Headers
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

### Body
```json
{
  "docente_ausente_id": "uuid-docente-ausente",
  "causa_ausencia": "Licencia médica",
  "fecha_inicio_ausencia": "2025-01-15",
  "fecha_fin_ausencia": "2025-01-20",
  "sede_id": "uuid-sede",
  "docente_reemplazo_id": "uuid-docente-reemplazo",
  "fecha_inicio_reemplazo": "2025-01-15",
  "fecha_fin_reemplazo": "2025-01-20",
  "horas_cubiertas": 30,
  "jornada": "ma_ana",
  "observacion": "Reemplazo por incapacidad médica temporal"
}
```

### Validaciones
- `docente_ausente_id`: Requerido, debe existir en la base de datos
- `causa_ausencia`: Requerido
- `fecha_inicio_ausencia` y `fecha_fin_ausencia`: Requeridas, inicio debe ser anterior al fin
- `sede_id`: Requerido, debe existir en la base de datos
- `docente_reemplazo_id`: Requerido, debe existir y ser diferente al docente ausente
- `fecha_inicio_reemplazo` y `fecha_fin_reemplazo`: Requeridas, inicio debe ser anterior al fin
- `horas_cubiertas`: Requerido, entre 0.01 y 24
- `jornada`: Requerido, debe ser: ma_ana, tarde, o sabatina

### Respuesta Exitosa (201)
```json
{
  "success": true,
  "message": "Suplencia creada exitosamente",
  "data": {
    "id": "uuid-suplencia",
    "docente_ausente_id": "uuid-docente-ausente",
    "causa_ausencia": "Licencia médica",
    "fecha_inicio_ausencia": "2025-01-15T00:00:00.000Z",
    "fecha_fin_ausencia": "2025-01-20T00:00:00.000Z",
    "sede_id": "uuid-sede",
    "docente_reemplazo_id": "uuid-docente-reemplazo",
    "fecha_inicio_reemplazo": "2025-01-15T00:00:00.000Z",
    "fecha_fin_reemplazo": "2025-01-20T00:00:00.000Z",
    "horas_cubiertas": 30,
    "jornada": "ma_ana",
    "observacion": "Reemplazo por incapacidad médica temporal",
    "created_at": "2025-10-06T10:30:00.000Z",
    "empleado_suplencias_docente_ausente_idToempleado": {
      "id": "uuid-docente-ausente",
      "nombre": "María",
      "apellido": "González",
      "documento": "12345678",
      "email": "maria.gonzalez@ejemplo.com",
      "cargo": "Docente"
    },
    "empleado_suplencias_docente_reemplazo_idToempleado": {
      "id": "uuid-docente-reemplazo",
      "nombre": "Juan",
      "apellido": "Pérez",
      "documento": "87654321",
      "email": "juan.perez@ejemplo.com",
      "cargo": "Docente"
    },
    "sede": {
      "id": "uuid-sede",
      "nombre": "Sede Central",
      "zona": "urbana",
      "direccion": "Calle 10 # 20-30"
    }
  }
}
```

### Errores
```json
// 400 - Datos faltantes
{
  "success": false,
  "message": "Faltan datos requeridos: docente_ausente_id, causa_ausencia, fecha_inicio_ausencia, fecha_fin_ausencia, sede_id, docente_reemplazo_id, fecha_inicio_reemplazo, fecha_fin_reemplazo, horas_cubiertas, jornada",
  "error": "Validation Error"
}

// 400 - Jornada inválida
{
  "success": false,
  "message": "Jornada inválida. Valores permitidos: ma_ana, tarde, sabatina",
  "error": "Validation Error"
}

// 400 - Mismo docente
{
  "success": false,
  "message": "El docente ausente y el docente de reemplazo no pueden ser la misma persona",
  "error": "Validation Error"
}

// 404 - Docente no encontrado
{
  "success": false,
  "message": "Docente ausente no encontrado",
  "error": "Not Found"
}
```

---

## 3. Listar Suplencias
**GET** `/api/suplencias?page=1&limit=10&search=texto&docente_ausente_id=uuid&sede_id=uuid&jornada=ma_ana&fecha_inicio=2025-01-01&fecha_fin=2025-12-31`

### Query Parameters
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, máx: 50)
- `search` (opcional): Buscar en causa, observación, nombres de docentes, sede
- `docente_ausente_id` (opcional): Filtrar por docente ausente específico
- `docente_reemplazo_id` (opcional): Filtrar por docente de reemplazo específico
- `sede_id` (opcional): Filtrar por sede específica
- `jornada` (opcional): Filtrar por jornada específica
- `fecha_inicio` (opcional): Filtrar desde fecha (formato: YYYY-MM-DD)
- `fecha_fin` (opcional): Filtrar hasta fecha (formato: YYYY-MM-DD)
- `causa_ausencia` (opcional): Buscar por causa específica

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Suplencias obtenidas exitosamente",
  "data": [
    {
      "id": "uuid-suplencia",
      "docente_ausente_id": "uuid-docente-ausente",
      "causa_ausencia": "Licencia médica",
      "fecha_inicio_ausencia": "2025-01-15T00:00:00.000Z",
      "fecha_fin_ausencia": "2025-01-20T00:00:00.000Z",
      "sede_id": "uuid-sede",
      "docente_reemplazo_id": "uuid-docente-reemplazo",
      "fecha_inicio_reemplazo": "2025-01-15T00:00:00.000Z",
      "fecha_fin_reemplazo": "2025-01-20T00:00:00.000Z",
      "horas_cubiertas": 30,
      "jornada": "ma_ana",
      "observacion": "Reemplazo por incapacidad médica temporal",
      "created_at": "2025-10-06T10:30:00.000Z",
      "empleado_suplencias_docente_ausente_idToempleado": {
        "id": "uuid-docente-ausente",
        "nombre": "María",
        "apellido": "González",
        "documento": "12345678",
        "email": "maria.gonzalez@ejemplo.com",
        "cargo": "Docente"
      },
      "empleado_suplencias_docente_reemplazo_idToempleado": {
        "id": "uuid-docente-reemplazo",
        "nombre": "Juan",
        "apellido": "Pérez",
        "documento": "87654321",
        "email": "juan.perez@ejemplo.com",
        "cargo": "Docente"
      },
      "sede": {
        "id": "uuid-sede",
        "nombre": "Sede Central",
        "zona": "urbana",
        "direccion": "Calle 10 # 20-30"
      },
      "_count": {
        "documentos_suplencia": 3
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 48,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 4. Obtener Suplencias por Docente
**GET** `/api/suplencias/docente/:empleado_id?tipo=todas&incluir_documentos=false`

### Path Parameters
- `empleado_id`: UUID del empleado/docente

### Query Parameters
- `tipo` (opcional): Tipo de suplencias - 'todas' (default), 'ausencias', 'reemplazos'
- `incluir_documentos` (opcional): Incluir documentos - 'false' (default), 'true'

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Suplencias obtenidas exitosamente",
  "data": [
    {
      "id": "uuid-suplencia-1",
      "docente_ausente_id": "uuid-empleado",
      "causa_ausencia": "Licencia médica",
      "fecha_inicio_ausencia": "2025-01-15T00:00:00.000Z",
      "fecha_fin_ausencia": "2025-01-20T00:00:00.000Z",
      "horas_cubiertas": 30,
      "jornada": "ma_ana",
      "empleado_suplencias_docente_ausente_idToempleado": {
        "id": "uuid-empleado",
        "nombre": "María",
        "apellido": "González",
        "documento": "12345678",
        "email": "maria.gonzalez@ejemplo.com",
        "cargo": "Docente"
      },
      "empleado_suplencias_docente_reemplazo_idToempleado": {
        "id": "uuid-otro-docente",
        "nombre": "Juan",
        "apellido": "Pérez",
        "documento": "87654321",
        "email": "juan.perez@ejemplo.com",
        "cargo": "Docente"
      },
      "sede": {
        "id": "uuid-sede",
        "nombre": "Sede Central",
        "zona": "urbana",
        "direccion": "Calle 10 # 20-30"
      },
      "_count": {
        "documentos_suplencia": 2
      }
    }
  ],
  "suplencias_agrupadas": {
    "ausencias": [
      {
        "id": "uuid-suplencia-1",
        "causa_ausencia": "Licencia médica",
        "horas_cubiertas": 30
      }
    ],
    "reemplazos": [
      {
        "id": "uuid-suplencia-2",
        "causa_ausencia": "Vacaciones",
        "horas_cubiertas": 25
      }
    ]
  },
  "empleado": {
    "id": "uuid-empleado",
    "nombre": "María",
    "apellido": "González",
    "documento": "12345678",
    "email": "maria.gonzalez@ejemplo.com",
    "cargo": "Docente"
  },
  "resumen": {
    "total_suplencias": 2,
    "total_ausencias": 1,
    "total_reemplazos": 1,
    "horas_totales_ausencias": 30,
    "horas_totales_reemplazos": 25
  }
}
```

---

## 5. Obtener Suplencia por ID
**GET** `/api/suplencias/:id`

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Suplencia obtenida exitosamente",
  "data": {
    "id": "uuid-suplencia",
    "docente_ausente_id": "uuid-docente-ausente",
    "causa_ausencia": "Licencia médica",
    "fecha_inicio_ausencia": "2025-01-15T00:00:00.000Z",
    "fecha_fin_ausencia": "2025-01-20T00:00:00.000Z",
    "sede_id": "uuid-sede",
    "docente_reemplazo_id": "uuid-docente-reemplazo",
    "fecha_inicio_reemplazo": "2025-01-15T00:00:00.000Z",
    "fecha_fin_reemplazo": "2025-01-20T00:00:00.000Z",
    "horas_cubiertas": 30,
    "jornada": "ma_ana",
    "observacion": "Reemplazo por incapacidad médica temporal",
    "created_at": "2025-10-06T10:30:00.000Z",
    "empleado_suplencias_docente_ausente_idToempleado": {
      "id": "uuid-docente-ausente",
      "nombre": "María",
      "apellido": "González",
      "documento": "12345678",
      "email": "maria.gonzalez@ejemplo.com",
      "cargo": "Docente",
      "direccion": "Calle 123 # 45-67"
    },
    "empleado_suplencias_docente_reemplazo_idToempleado": {
      "id": "uuid-docente-reemplazo",
      "nombre": "Juan",
      "apellido": "Pérez",
      "documento": "87654321",
      "email": "juan.perez@ejemplo.com",
      "cargo": "Docente",
      "direccion": "Carrera 50 # 80-90"
    },
    "sede": {
      "id": "uuid-sede",
      "nombre": "Sede Central",
      "zona": "urbana",
      "direccion": "Calle 10 # 20-30",
      "codigo_DANE": "111001001234"
    },
    "documentos_suplencia": [
      {
        "id": "uuid-documento-1",
        "nombre": "Certificado_medico_ausencia.pdf",
        "ruta_relativa": "suplencias/documentos/2025/certificado_medico.pdf",
        "created_at": "2025-10-06T11:00:00.000Z"
      },
      {
        "id": "uuid-documento-2",
        "nombre": "Acta_reemplazo.pdf",
        "ruta_relativa": "suplencias/documentos/2025/acta_reemplazo.pdf",
        "created_at": "2025-10-06T11:30:00.000Z"
      }
    ]
  }
}
```

---

## 6. Actualizar Suplencia
**PUT** `/api/suplencias/:id`

### Body (todos los campos son opcionales)
```json
{
  "causa_ausencia": "Licencia de maternidad",
  "fecha_fin_ausencia": "2025-02-15",
  "fecha_fin_reemplazo": "2025-02-15",
  "horas_cubiertas": 45,
  "observacion": "Extensión del reemplazo por licencia de maternidad"
}
```

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Suplencia actualizada exitosamente",
  "data": {
    "id": "uuid-suplencia",
    "docente_ausente_id": "uuid-docente-ausente",
    "causa_ausencia": "Licencia de maternidad",
    "fecha_inicio_ausencia": "2025-01-15T00:00:00.000Z",
    "fecha_fin_ausencia": "2025-02-15T00:00:00.000Z",
    "sede_id": "uuid-sede",
    "docente_reemplazo_id": "uuid-docente-reemplazo",
    "fecha_inicio_reemplazo": "2025-01-15T00:00:00.000Z",
    "fecha_fin_reemplazo": "2025-02-15T00:00:00.000Z",
    "horas_cubiertas": 45,
    "jornada": "ma_ana",
    "observacion": "Extensión del reemplazo por licencia de maternidad",
    "created_at": "2025-10-06T10:30:00.000Z"
  }
}
```

---

## 7. Eliminar Suplencia
**DELETE** `/api/suplencias/:id`

### Restricción
- ⚠️ **Solo usuarios con rol `super_admin`**

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Suplencia eliminada exitosamente",
  "data": {
    "id": "uuid-suplencia",
    "causa_ausencia": "Licencia médica",
    "docente_ausente": "María González",
    "docente_reemplazo": "Juan Pérez",
    "sede": "Sede Central"
  }
}
```

---

## 8. Obtener Estadísticas de Suplencias
**GET** `/api/suplencias/estadisticas?empleado_id=uuid&sede_id=uuid&año=2025`

### Query Parameters
- `empleado_id` (opcional): Estadísticas de un empleado específico
- `sede_id` (opcional): Estadísticas de una sede específica
- `año` (opcional): Estadísticas de un año específico

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Estadísticas obtenidas exitosamente",
  "data": {
    "total_suplencias": 125,
    "horas_totales_cubiertas": 3750,
    "suplencias_por_jornada": [
      {
        "jornada": "ma_ana",
        "cantidad": 65,
        "horas_totales": 1950,
        "porcentaje": "52.00"
      },
      {
        "jornada": "tarde",
        "cantidad": 45,
        "horas_totales": 1350,
        "porcentaje": "36.00"
      },
      {
        "jornada": "sabatina",
        "cantidad": 15,
        "horas_totales": 450,
        "porcentaje": "12.00"
      }
    ],
    "suplencias_recientes": [
      {
        "id": "uuid-suplencia-1",
        "causa_ausencia": "Licencia médica",
        "created_at": "2025-10-06T15:30:00.000Z",
        "empleado_suplencias_docente_ausente_idToempleado": {
          "nombre": "María",
          "apellido": "González",
          "documento": "12345678"
        },
        "empleado_suplencias_docente_reemplazo_idToempleado": {
          "nombre": "Juan",
          "apellido": "Pérez",
          "documento": "87654321"
        },
        "sede": {
          "nombre": "Sede Central"
        }
      }
    ],
    "empleado_filtrado": false,
    "sede_filtrada": false,
    "año_filtrado": "2025"
  }
}
```

---

# ENDPOINTS DE DOCUMENTOS DE SUPLENCIAS

## Base URL: `/api/documentos-suplencia`

---

## 1. Crear Documento de Suplencia
**POST** `/api/documentos-suplencia`

### Headers
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

### Body
```json
{
  "suplencia_id": "uuid-suplencia",
  "nombre": "Certificado_medico_ausencia.pdf",
  "ruta_relativa": "suplencias/documentos/2025/certificado_medico_ausencia.pdf"
}
```

### Validaciones
- `suplencia_id`: Requerido, debe existir en la base de datos
- `nombre`: Requerido, único por suplencia
- `ruta_relativa`: Requerido

### Respuesta Exitosa (201)
```json
{
  "success": true,
  "message": "Documento de suplencia creado exitosamente",
  "data": {
    "id": "uuid-documento",
    "suplencia_id": "uuid-suplencia",
    "nombre": "Certificado_medico_ausencia.pdf",
    "ruta_relativa": "suplencias/documentos/2025/certificado_medico_ausencia.pdf",
    "created_at": "2025-10-06T10:30:00.000Z",
    "suplencias": {
      "id": "uuid-suplencia",
      "causa_ausencia": "Licencia médica",
      "fecha_inicio_ausencia": "2025-01-15T00:00:00.000Z",
      "fecha_fin_ausencia": "2025-01-20T00:00:00.000Z",
      "empleado_suplencias_docente_ausente_idToempleado": {
        "id": "uuid-docente-ausente",
        "nombre": "María",
        "apellido": "González",
        "documento": "12345678",
        "email": "maria.gonzalez@ejemplo.com"
      },
      "empleado_suplencias_docente_reemplazo_idToempleado": {
        "id": "uuid-docente-reemplazo",
        "nombre": "Juan",
        "apellido": "Pérez",
        "documento": "87654321",
        "email": "juan.perez@ejemplo.com"
      },
      "sede": {
        "id": "uuid-sede",
        "nombre": "Sede Central"
      }
    }
  }
}
```

---

## 2. Listar Documentos de Suplencias
**GET** `/api/documentos-suplencia?page=1&limit=10&search=texto&suplencia_id=uuid`

### Query Parameters
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, máx: 50)
- `search` (opcional): Buscar en nombre, ruta, causa de ausencia, nombres de docentes
- `suplencia_id` (opcional): Filtrar por suplencia específica

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Documentos de suplencia obtenidos exitosamente",
  "data": [
    {
      "id": "uuid-documento",
      "suplencia_id": "uuid-suplencia",
      "nombre": "Certificado_medico_ausencia.pdf",
      "ruta_relativa": "suplencias/documentos/2025/certificado_medico_ausencia.pdf",
      "created_at": "2025-10-06T10:30:00.000Z",
      "suplencias": {
        "id": "uuid-suplencia",
        "causa_ausencia": "Licencia médica",
        "fecha_inicio_ausencia": "2025-01-15T00:00:00.000Z",
        "fecha_fin_ausencia": "2025-01-20T00:00:00.000Z",
        "jornada": "ma_ana",
        "empleado_suplencias_docente_ausente_idToempleado": {
          "id": "uuid-docente-ausente",
          "nombre": "María",
          "apellido": "González",
          "documento": "12345678",
          "email": "maria.gonzalez@ejemplo.com"
        },
        "empleado_suplencias_docente_reemplazo_idToempleado": {
          "id": "uuid-docente-reemplazo",
          "nombre": "Juan",
          "apellido": "Pérez",
          "documento": "87654321",
          "email": "juan.perez@ejemplo.com"
        },
        "sede": {
          "id": "uuid-sede",
          "nombre": "Sede Central",
          "zona": "urbana"
        }
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 3. Obtener Documentos por Suplencia
**GET** `/api/documentos-suplencia/suplencia/:suplencia_id`

### Path Parameters
- `suplencia_id`: UUID de la suplencia

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Documentos obtenidos exitosamente",
  "data": [
    {
      "id": "uuid-documento-1",
      "nombre": "Certificado_medico_ausencia.pdf",
      "ruta_relativa": "suplencias/documentos/2025/certificado_medico.pdf",
      "created_at": "2025-10-06T11:00:00.000Z"
    },
    {
      "id": "uuid-documento-2",
      "nombre": "Acta_reemplazo.pdf",
      "ruta_relativa": "suplencias/documentos/2025/acta_reemplazo.pdf",
      "created_at": "2025-10-06T11:30:00.000Z"
    }
  ],
  "suplencia": {
    "id": "uuid-suplencia",
    "causa_ausencia": "Licencia médica",
    "fecha_inicio_ausencia": "2025-01-15T00:00:00.000Z",
    "fecha_fin_ausencia": "2025-01-20T00:00:00.000Z",
    "fecha_inicio_reemplazo": "2025-01-15T00:00:00.000Z",
    "fecha_fin_reemplazo": "2025-01-20T00:00:00.000Z",
    "horas_cubiertas": 30,
    "jornada": "ma_ana",
    "empleado_suplencias_docente_ausente_idToempleado": {
      "id": "uuid-docente-ausente",
      "nombre": "María",
      "apellido": "González",
      "documento": "12345678",
      "email": "maria.gonzalez@ejemplo.com",
      "cargo": "Docente"
    },
    "empleado_suplencias_docente_reemplazo_idToempleado": {
      "id": "uuid-docente-reemplazo",
      "nombre": "Juan",
      "apellido": "Pérez",
      "documento": "87654321",
      "email": "juan.perez@ejemplo.com",
      "cargo": "Docente"
    },
    "sede": {
      "id": "uuid-sede",
      "nombre": "Sede Central",
      "zona": "urbana",
      "direccion": "Calle 10 # 20-30"
    }
  },
  "resumen": {
    "total_documentos": 2,
    "documentos_por_fecha": {
      "2025-10-06": 2
    }
  }
}
```

---

## 4. Obtener Documento por ID
**GET** `/api/documentos-suplencia/:id`

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Documento obtenido exitosamente",
  "data": {
    "id": "uuid-documento",
    "suplencia_id": "uuid-suplencia",
    "nombre": "Certificado_medico_ausencia.pdf",
    "ruta_relativa": "suplencias/documentos/2025/certificado_medico_ausencia.pdf",
    "created_at": "2025-10-06T10:30:00.000Z",
    "suplencias": {
      "id": "uuid-suplencia",
      "causa_ausencia": "Licencia médica",
      "fecha_inicio_ausencia": "2025-01-15T00:00:00.000Z",
      "fecha_fin_ausencia": "2025-01-20T00:00:00.000Z",
      "fecha_inicio_reemplazo": "2025-01-15T00:00:00.000Z",
      "fecha_fin_reemplazo": "2025-01-20T00:00:00.000Z",
      "horas_cubiertas": 30,
      "jornada": "ma_ana",
      "observacion": "Reemplazo por incapacidad médica temporal",
      "empleado_suplencias_docente_ausente_idToempleado": {
        "id": "uuid-docente-ausente",
        "nombre": "María",
        "apellido": "González",
        "documento": "12345678",
        "email": "maria.gonzalez@ejemplo.com",
        "cargo": "Docente",
        "direccion": "Calle 123 # 45-67"
      },
      "empleado_suplencias_docente_reemplazo_idToempleado": {
        "id": "uuid-docente-reemplazo",
        "nombre": "Juan",
        "apellido": "Pérez",
        "documento": "87654321",
        "email": "juan.perez@ejemplo.com",
        "cargo": "Docente",
        "direccion": "Carrera 50 # 80-90"
      },
      "sede": {
        "id": "uuid-sede",
        "nombre": "Sede Central",
        "zona": "urbana",
        "direccion": "Calle 10 # 20-30",
        "codigo_DANE": "111001001234"
      }
    }
  }
}
```

---

## 5. Actualizar Documento de Suplencia
**PUT** `/api/documentos-suplencia/:id`

### Body (todos los campos son opcionales)
```json
{
  "nombre": "Certificado_medico_actualizado.pdf",
  "ruta_relativa": "suplencias/documentos/2025/certificado_medico_actualizado.pdf"
}
```

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Documento de suplencia actualizado exitosamente",
  "data": {
    "id": "uuid-documento",
    "suplencia_id": "uuid-suplencia",
    "nombre": "Certificado_medico_actualizado.pdf",
    "ruta_relativa": "suplencias/documentos/2025/certificado_medico_actualizado.pdf",
    "created_at": "2025-10-06T10:30:00.000Z",
    "suplencias": {
      "id": "uuid-suplencia",
      "causa_ausencia": "Licencia médica",
      "empleado_suplencias_docente_ausente_idToempleado": {
        "id": "uuid-docente-ausente",
        "nombre": "María",
        "apellido": "González",
        "documento": "12345678",
        "email": "maria.gonzalez@ejemplo.com"
      },
      "empleado_suplencias_docente_reemplazo_idToempleado": {
        "id": "uuid-docente-reemplazo",
        "nombre": "Juan",
        "apellido": "Pérez",
        "documento": "87654321",
        "email": "juan.perez@ejemplo.com"
      },
      "sede": {
        "id": "uuid-sede",
        "nombre": "Sede Central"
      }
    }
  }
}
```

---

## 6. Descargar Documento de Suplencia
**GET** `/api/documentos-suplencia/:id/download`

### Respuesta Exitosa (200)
- **Content-Type**: `application/octet-stream`
- **Content-Disposition**: `attachment; filename="Certificado_medico_ausencia.pdf"`
- **Body**: Archivo binario

### Error si archivo no existe
```json
{
  "success": false,
  "message": "Archivo no encontrado en el sistema",
  "error": "File Not Found"
}
```

---

## 7. Eliminar Documento de Suplencia
**DELETE** `/api/documentos-suplencia/:id`

### Restricción
- ⚠️ **Solo usuarios con rol `super_admin`**

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Documento de suplencia eliminado exitosamente",
  "data": {
    "id": "uuid-documento",
    "nombre": "Certificado_medico_ausencia.pdf",
    "suplencia_causa": "Licencia médica",
    "docente_ausente": "María González",
    "docente_documento": "12345678"
  }
}
```

---

## 8. Obtener Estadísticas de Documentos de Suplencias
**GET** `/api/documentos-suplencia/estadisticas?suplencia_id=uuid`

### Query Parameters
- `suplencia_id` (opcional): Obtener estadísticas de una suplencia específica

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Estadísticas obtenidas exitosamente",
  "data": {
    "total_documentos": 85,
    "documentos_por_suplencia": 35,
    "promedio_documentos_por_suplencia": "2.43",
    "documentos_recientes": [
      {
        "id": "uuid-documento-1",
        "nombre": "Acta_nueva_suplencia.pdf",
        "created_at": "2025-10-06T15:30:00.000Z",
        "suplencias": {
          "causa_ausencia": "Vacaciones",
          "empleado_suplencias_docente_ausente_idToempleado": {
            "nombre": "Ana",
            "apellido": "Martínez",
            "documento": "98765432"
          },
          "empleado_suplencias_docente_reemplazo_idToempleado": {
            "nombre": "Carlos",
            "apellido": "López",
            "documento": "11223344"
          }
        }
      }
    ],
    "suplencia_filtrada": false
  }
}
```

---

## Códigos de Estado HTTP

- `200` - OK (GET, PUT, DELETE exitosos)
- `201` - Created (POST exitoso)
- `400` - Bad Request (datos inválidos, fechas incorrectas)
- `401` - Unauthorized (sin token JWT)
- `403` - Forbidden (sin permisos para DELETE)
- `404` - Not Found (recurso no encontrado)
- `409` - Conflict (documento duplicado para suplencia)
- `500` - Internal Server Error

---

## Autenticación

Todas las rutas requieren header de autorización:
```
Authorization: Bearer <jwt_token>
```

### Roles y Permisos:
- **super_admin**: Acceso completo (CREATE, READ, UPDATE, DELETE)
- **admin**: CREATE, READ, UPDATE
- **gestor**: CREATE, READ, UPDATE

---

## Ejemplos de Uso con cURL

### Obtener Jornadas Disponibles
```bash
curl -X GET http://localhost:3000/api/suplencias/jornadas \
  -H "Authorization: Bearer <token>"
```

### Crear Suplencia
```bash
curl -X POST http://localhost:3000/api/suplencias \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "docente_ausente_id": "uuid-docente-ausente",
    "causa_ausencia": "Licencia médica",
    "fecha_inicio_ausencia": "2025-01-15",
    "fecha_fin_ausencia": "2025-01-20",
    "sede_id": "uuid-sede",
    "docente_reemplazo_id": "uuid-docente-reemplazo",
    "fecha_inicio_reemplazo": "2025-01-15",
    "fecha_fin_reemplazo": "2025-01-20",
    "horas_cubiertas": 30,
    "jornada": "ma_ana",
    "observacion": "Reemplazo por incapacidad médica temporal"
  }'
```

### Buscar Suplencias
```bash
curl -X GET "http://localhost:3000/api/suplencias?search=médica&jornada=ma_ana&page=1&limit=5" \
  -H "Authorization: Bearer <token>"
```

### Obtener Suplencias de un Docente
```bash
curl -X GET "http://localhost:3000/api/suplencias/docente/uuid-empleado?tipo=ausencias&incluir_documentos=true" \
  -H "Authorization: Bearer <token>"
```

### Crear Documento de Suplencia
```bash
curl -X POST http://localhost:3000/api/documentos-suplencia \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "suplencia_id": "uuid-suplencia",
    "nombre": "Certificado_medico_ausencia.pdf",
    "ruta_relativa": "suplencias/documentos/2025/certificado_medico_ausencia.pdf"
  }'
```

### Descargar Documento de Suplencia
```bash
curl -X GET "http://localhost:3000/api/documentos-suplencia/uuid-documento/download" \
  -H "Authorization: Bearer <token>" \
  -o "documento_suplencia.pdf"
```

### Obtener Estadísticas de Suplencias
```bash
curl -X GET "http://localhost:3000/api/suplencias/estadisticas?año=2025&sede_id=uuid-sede" \
  -H "Authorization: Bearer <token>"
```

### Eliminar Suplencia (solo super_admin)
```bash
curl -X DELETE http://localhost:3000/api/suplencias/uuid-suplencia \
  -H "Authorization: Bearer <token>"
```

---

## Flujo Típico de Uso

### 1. Registrar Nueva Suplencia
```bash
# 1. Obtener jornadas disponibles
GET /api/suplencias/jornadas

# 2. Crear suplencia
POST /api/suplencias
{
  "docente_ausente_id": "uuid-docente-ausente",
  "causa_ausencia": "Licencia médica",
  "fecha_inicio_ausencia": "2025-01-15",
  "fecha_fin_ausencia": "2025-01-20",
  "sede_id": "uuid-sede",
  "docente_reemplazo_id": "uuid-docente-reemplazo",
  "fecha_inicio_reemplazo": "2025-01-15",
  "fecha_fin_reemplazo": "2025-01-20",
  "horas_cubiertas": 30,
  "jornada": "ma_ana"
}

# 3. Subir documentos relacionados
POST /api/documentos-suplencia
{
  "suplencia_id": "uuid-suplencia-creada",
  "nombre": "Certificado_medico.pdf",
  "ruta_relativa": "suplencias/docs/certificado.pdf"
}
```

### 2. Consultar Historial de un Docente
```bash
# Obtener todas las suplencias de un docente (ausencias y reemplazos)
GET /api/suplencias/docente/uuid-empleado?tipo=todas&incluir_documentos=true

# Obtener solo las ausencias del docente
GET /api/suplencias/docente/uuid-empleado?tipo=ausencias

# Obtener solo los reemplazos realizados por el docente
GET /api/suplencias/docente/uuid-empleado?tipo=reemplazos
```

### 3. Gestión de Documentos
```bash
# Obtener todos los documentos de una suplencia específica
GET /api/documentos-suplencia/suplencia/uuid-suplencia

# Descargar documento específico
GET /api/documentos-suplencia/uuid-documento/download

# Actualizar información del documento
PUT /api/documentos-suplencia/uuid-documento
{
  "nombre": "Certificado_medico_actualizado.pdf"
}
```

### 4. Reportes y Estadísticas
```bash
# Estadísticas generales de suplencias
GET /api/suplencias/estadisticas

# Estadísticas por sede
GET /api/suplencias/estadisticas?sede_id=uuid-sede

# Estadísticas por docente específico
GET /api/suplencias/estadisticas?empleado_id=uuid-empleado

# Estadísticas por año
GET /api/suplencias/estadisticas?año=2025

# Estadísticas de documentos
GET /api/documentos-suplencia/estadisticas
```

---

## Notas Importantes

### Validaciones de Negocio
- ✅ **Los docentes ausente y reemplazo deben ser diferentes**
- ✅ **Las fechas de inicio deben ser anteriores a las fechas de fin**
- ✅ **Las horas cubiertas deben estar entre 0.01 y 24**
- ✅ **Las jornadas están limitadas a: ma_ana, tarde, sabatina**
- ✅ **Solo super_admin puede eliminar suplencias y documentos**
- ✅ **No se pueden crear documentos duplicados por nombre para la misma suplencia**

### Características Especiales
- ✅ **Seguimiento detallado** de ausencias y reemplazos por docente
- ✅ **Estadísticas por jornada** con porcentajes y horas totales
- ✅ **Búsqueda avanzada** en múltiples campos relacionados
- ✅ **Filtros por fechas** para consultas de períodos específicos
- ✅ **Gestión completa de documentos** con descarga segura
- ✅ **Relaciones complejas** entre docentes, sedes y períodos

### Organización Recomendada de Archivos
```
uploads/
├── suplencias/
│   ├── documentos/
│   │   ├── 2025/
│   │   │   ├── certificados_medicos/
│   │   │   ├── actas_reemplazo/
│   │   │   ├── solicitudes_ausencia/
│   │   └── 2024/
│   ├── reportes/
│   └── respaldos/
```

**¡El sistema completo de Suplencias y Documentos de Suplencias está listo para usar!** 🎉