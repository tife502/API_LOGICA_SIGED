# API de Documentos de Empleado - SIGED

## Descripción
API para gestión completa de documentos de empleados en el sistema SIGED. Permite administrar diferentes tipos de documentos como hojas de vida, contratos, licencias y soportes médicos.

## Características
- ✅ **CRUD completo** para documentos de empleado
- ✅ **Tipificación de documentos** (HV, LICENCIAS, CONTRATO, SOPORTE_MEDICO)
- ✅ **Autenticación JWT** requerida en todas las rutas
- ✅ **Control de permisos**: DELETE solo para super_admin
- ✅ **Paginación** en listados
- ✅ **Filtros avanzados** por empleado, tipo de documento, búsqueda
- ✅ **Descarga de archivos** 
- ✅ **Estadísticas** y agrupación por tipo
- ✅ **Validación de duplicados** por empleado y tipo

## Modelo de Datos

### Documento de Empleado
```typescript
{
  id: string;                           // UUID generado automáticamente
  empleado_id: string;                  // ID del empleado
  tipo_documento: DocumentosEmpleadoTipo; // Tipo de documento
  nombre: string;                       // Nombre del archivo
  ruta_relativa: string;               // Ruta relativa del archivo
  descripcion?: string;                // Descripción opcional
  created_at: DateTime;                // Fecha de creación
}
```

### Tipos de Documentos Disponibles
```typescript
enum DocumentosEmpleadoTipo {
  HV = 'HV',                          // Hoja de Vida
  LICENCIAS = 'LICENCIAS',            // Licencias y Permisos
  CONTRATO = 'CONTRATO',              // Contratos Laborales
  SOPORTE_MEDICO = 'SOPORTE_MEDICO'   // Soportes Médicos
}
```

---

# ENDPOINTS

## Base URL: `/api/documentos-empleado`

---

## 1. Obtener Tipos de Documentos
**GET** `/api/documentos-empleado/tipos`

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
  "message": "Tipos de documento obtenidos exitosamente",
  "data": [
    {
      "valor": "HV",
      "descripcion": "Hoja de Vida",
      "ejemplo": "CV_Juan_Perez.pdf"
    },
    {
      "valor": "LICENCIAS",
      "descripcion": "Licencias y Permisos",
      "ejemplo": "Licencia_Conducir_Juan_Perez.pdf"
    },
    {
      "valor": "CONTRATO",
      "descripcion": "Contratos Laborales",
      "ejemplo": "Contrato_2025_Juan_Perez.pdf"
    },
    {
      "valor": "SOPORTE_MEDICO",
      "descripcion": "Soportes Médicos",
      "ejemplo": "Certificado_Medico_Juan_Perez.pdf"
    }
  ]
}
```

---

## 2. Crear Documento de Empleado
**POST** `/api/documentos-empleado`

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
  "empleado_id": "uuid-del-empleado",
  "tipo_documento": "HV",
  "nombre": "CV_Juan_Perez_2025.pdf",
  "ruta_relativa": "empleados/documentos/2025/CV_Juan_Perez_2025.pdf",
  "descripcion": "Hoja de vida actualizada con experiencia reciente"
}
```

### Validaciones
- `empleado_id`: Requerido, debe existir en la base de datos
- `tipo_documento`: Requerido, debe ser uno de: HV, LICENCIAS, CONTRATO, SOPORTE_MEDICO
- `nombre`: Requerido, único por empleado y tipo de documento
- `ruta_relativa`: Requerido
- `descripcion`: Opcional

### Respuesta Exitosa (201)
```json
{
  "success": true,
  "message": "Documento de empleado creado exitosamente",
  "data": {
    "id": "uuid-documento",
    "empleado_id": "uuid-empleado",
    "tipo_documento": "HV",
    "nombre": "CV_Juan_Perez_2025.pdf",
    "ruta_relativa": "empleados/documentos/2025/CV_Juan_Perez_2025.pdf",
    "descripcion": "Hoja de vida actualizada con experiencia reciente",
    "created_at": "2025-10-06T10:30:00.000Z",
    "empleado": {
      "id": "uuid-empleado",
      "nombre": "Juan",
      "apellido": "Pérez",
      "documento": "12345678",
      "email": "juan.perez@ejemplo.com"
    }
  }
}
```

### Errores
```json
// 400 - Datos faltantes
{
  "success": false,
  "message": "Faltan datos requeridos: empleado_id, tipo_documento, nombre, ruta_relativa",
  "error": "Validation Error"
}

// 400 - Tipo de documento inválido
{
  "success": false,
  "message": "Tipo de documento inválido. Valores permitidos: HV, LICENCIAS, CONTRATO, SOPORTE_MEDICO",
  "error": "Validation Error"
}

// 404 - Empleado no encontrado
{
  "success": false,
  "message": "Empleado no encontrado",
  "error": "Not Found"
}

// 409 - Documento duplicado
{
  "success": false,
  "message": "Ya existe un documento de tipo HV con ese nombre para este empleado",
  "error": "Conflict Error"
}
```

---

## 3. Listar Documentos de Empleado
**GET** `/api/documentos-empleado?page=1&limit=10&search=texto&empleado_id=uuid&tipo_documento=HV`

### Query Parameters
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `search` (opcional): Buscar en nombre, descripción, ruta o datos del empleado
- `empleado_id` (opcional): Filtrar por empleado específico
- `tipo_documento` (opcional): Filtrar por tipo específico

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Documentos de empleado obtenidos exitosamente",
  "data": [
    {
      "id": "uuid-documento",
      "empleado_id": "uuid-empleado",
      "tipo_documento": "HV",
      "nombre": "CV_Juan_Perez_2025.pdf",
      "ruta_relativa": "empleados/documentos/2025/CV_Juan_Perez_2025.pdf",
      "descripcion": "Hoja de vida actualizada",
      "created_at": "2025-10-06T10:30:00.000Z",
      "empleado": {
        "id": "uuid-empleado",
        "nombre": "Juan",
        "apellido": "Pérez",
        "documento": "12345678",
        "email": "juan.perez@ejemplo.com",
        "cargo": "Docente"
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

## 4. Obtener Documentos por Empleado
**GET** `/api/documentos-empleado/empleado/:empleado_id?tipo_documento=HV`

### Path Parameters
- `empleado_id`: UUID del empleado

### Query Parameters
- `tipo_documento` (opcional): Filtrar por tipo específico

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Documentos obtenidos exitosamente",
  "data": [
    {
      "id": "uuid-documento-1",
      "tipo_documento": "HV",
      "nombre": "CV_Juan_Perez_2025.pdf",
      "descripcion": "Hoja de vida actualizada",
      "created_at": "2025-10-06T10:30:00.000Z"
    },
    {
      "id": "uuid-documento-2",
      "tipo_documento": "CONTRATO",
      "nombre": "Contrato_Juan_Perez_2025.pdf",
      "descripcion": "Contrato laboral vigente",
      "created_at": "2025-10-05T14:20:00.000Z"
    }
  ],
  "documentos_agrupados": {
    "HV": [
      {
        "id": "uuid-documento-1",
        "nombre": "CV_Juan_Perez_2025.pdf",
        "created_at": "2025-10-06T10:30:00.000Z"
      }
    ],
    "CONTRATO": [
      {
        "id": "uuid-documento-2",
        "nombre": "Contrato_Juan_Perez_2025.pdf",
        "created_at": "2025-10-05T14:20:00.000Z"
      }
    ]
  },
  "empleado": {
    "id": "uuid-empleado",
    "nombre": "Juan",
    "apellido": "Pérez",
    "documento": "12345678",
    "email": "juan.perez@ejemplo.com",
    "cargo": "Docente"
  },
  "resumen": {
    "total_documentos": 2,
    "tipos_disponibles": ["HV", "CONTRATO"],
    "conteo_por_tipo": {
      "HV": 1,
      "CONTRATO": 1
    }
  }
}
```

---

## 5. Obtener Documento por ID
**GET** `/api/documentos-empleado/:id`

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Documento obtenido exitosamente",
  "data": {
    "id": "uuid-documento",
    "empleado_id": "uuid-empleado",
    "tipo_documento": "HV",
    "nombre": "CV_Juan_Perez_2025.pdf",
    "ruta_relativa": "empleados/documentos/2025/CV_Juan_Perez_2025.pdf",
    "descripcion": "Hoja de vida actualizada con experiencia reciente",
    "created_at": "2025-10-06T10:30:00.000Z",
    "empleado": {
      "id": "uuid-empleado",
      "nombre": "Juan",
      "apellido": "Pérez",
      "documento": "12345678",
      "email": "juan.perez@ejemplo.com",
      "cargo": "Docente",
      "direccion": "Calle 123 # 45-67"
    }
  }
}
```

---

## 6. Actualizar Documento
**PUT** `/api/documentos-empleado/:id`

### Body (todos los campos son opcionales)
```json
{
  "tipo_documento": "LICENCIAS",
  "nombre": "Licencia_Conducir_Juan_Perez.pdf",
  "ruta_relativa": "empleados/documentos/2025/Licencia_Conducir_Juan_Perez.pdf",
  "descripcion": "Licencia de conducir categoría B"
}
```

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Documento actualizado exitosamente",
  "data": {
    "id": "uuid-documento",
    "empleado_id": "uuid-empleado",
    "tipo_documento": "LICENCIAS",
    "nombre": "Licencia_Conducir_Juan_Perez.pdf",
    "ruta_relativa": "empleados/documentos/2025/Licencia_Conducir_Juan_Perez.pdf",
    "descripcion": "Licencia de conducir categoría B",
    "created_at": "2025-10-06T10:30:00.000Z",
    "empleado": {
      "id": "uuid-empleado",
      "nombre": "Juan",
      "apellido": "Pérez",
      "documento": "12345678",
      "email": "juan.perez@ejemplo.com"
    }
  }
}
```

---

## 7. Descargar Documento
**GET** `/api/documentos-empleado/:id/download`

### Respuesta Exitosa (200)
- **Content-Type**: `application/octet-stream`
- **Content-Disposition**: `attachment; filename="CV_Juan_Perez_2025.pdf"`
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

## 8. Eliminar Documento
**DELETE** `/api/documentos-empleado/:id`

### Restricción
- ⚠️ **Solo usuarios con rol `super_admin`**

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Documento eliminado exitosamente",
  "data": {
    "id": "uuid-documento",
    "nombre": "CV_Juan_Perez_2025.pdf",
    "tipo_documento": "HV",
    "empleado": "Juan Pérez",
    "empleado_documento": "12345678"
  }
}
```

### Error de permisos
```json
{
  "success": false,
  "message": "No tienes permisos para eliminar documentos de empleado",
  "error": "Forbidden"
}
```

---

## 9. Obtener Estadísticas de Documentos
**GET** `/api/documentos-empleado/estadisticas?empleado_id=uuid`

### Query Parameters
- `empleado_id` (opcional): Obtener estadísticas de un empleado específico

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Estadísticas obtenidas exitosamente",
  "data": {
    "total_documentos": 125,
    "documentos_por_tipo": [
      {
        "tipo": "HV",
        "cantidad": 45,
        "porcentaje": "36.00"
      },
      {
        "tipo": "CONTRATO",
        "cantidad": 40,
        "porcentaje": "32.00"
      },
      {
        "tipo": "LICENCIAS",
        "cantidad": 25,
        "porcentaje": "20.00"
      },
      {
        "tipo": "SOPORTE_MEDICO",
        "cantidad": 15,
        "porcentaje": "12.00"
      }
    ],
    "documentos_recientes": [
      {
        "id": "uuid-documento-1",
        "nombre": "CV_Maria_Garcia_2025.pdf",
        "tipo_documento": "HV",
        "created_at": "2025-10-06T15:30:00.000Z",
        "empleado": {
          "nombre": "María",
          "apellido": "García",
          "documento": "87654321"
        }
      }
    ],
    "empleado_filtrado": false
  }
}
```

---

## Códigos de Estado HTTP

- `200` - OK (GET, PUT, DELETE exitosos)
- `201` - Created (POST exitoso)
- `400` - Bad Request (datos inválidos, tipo de documento inválido)
- `401` - Unauthorized (sin token JWT)
- `403` - Forbidden (sin permisos para DELETE)
- `404` - Not Found (recurso no encontrado)
- `409` - Conflict (documento duplicado para empleado y tipo)
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

### Obtener Tipos de Documentos
```bash
curl -X GET http://localhost:3000/api/documentos-empleado/tipos \
  -H "Authorization: Bearer <token>"
```

### Crear Documento de Empleado
```bash
curl -X POST http://localhost:3000/api/documentos-empleado \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "empleado_id": "uuid-empleado",
    "tipo_documento": "HV",
    "nombre": "CV_Juan_Perez_2025.pdf",
    "ruta_relativa": "empleados/documentos/2025/CV_Juan_Perez_2025.pdf",
    "descripcion": "Hoja de vida actualizada"
  }'
```

### Obtener Documentos de un Empleado
```bash
curl -X GET "http://localhost:3000/api/documentos-empleado/empleado/uuid-empleado?tipo_documento=HV" \
  -H "Authorization: Bearer <token>"
```

### Buscar Documentos
```bash
curl -X GET "http://localhost:3000/api/documentos-empleado?search=Juan&tipo_documento=CONTRATO&page=1&limit=5" \
  -H "Authorization: Bearer <token>"
```

### Descargar Documento
```bash
curl -X GET "http://localhost:3000/api/documentos-empleado/uuid-documento/download" \
  -H "Authorization: Bearer <token>" \
  -o "documento_descargado.pdf"
```

### Obtener Estadísticas
```bash
curl -X GET "http://localhost:3000/api/documentos-empleado/estadisticas?empleado_id=uuid-empleado" \
  -H "Authorization: Bearer <token>"
```

### Eliminar Documento (solo super_admin)
```bash
curl -X DELETE http://localhost:3000/api/documentos-empleado/uuid-documento \
  -H "Authorization: Bearer <token>"
```

---

## Flujo Típico de Uso

### 1. Subir Documentos de un Nuevo Empleado
```bash
# 1. Obtener tipos de documentos disponibles
GET /api/documentos-empleado/tipos

# 2. Subir hoja de vida
POST /api/documentos-empleado
{
  "empleado_id": "uuid-empleado",
  "tipo_documento": "HV",
  "nombre": "CV_Juan_Perez.pdf",
  "ruta_relativa": "empleados/documentos/2025/CV_Juan_Perez.pdf"
}

# 3. Subir contrato
POST /api/documentos-empleado
{
  "empleado_id": "uuid-empleado",
  "tipo_documento": "CONTRATO",
  "nombre": "Contrato_Juan_Perez_2025.pdf",
  "ruta_relativa": "empleados/contratos/2025/Contrato_Juan_Perez_2025.pdf"
}
```

### 2. Consultar Documentos de un Empleado
```bash
# Obtener todos los documentos del empleado agrupados por tipo
GET /api/documentos-empleado/empleado/uuid-empleado

# Obtener solo contratos del empleado
GET /api/documentos-empleado/empleado/uuid-empleado?tipo_documento=CONTRATO
```

### 3. Buscar Documentos
```bash
# Buscar por nombre de empleado
GET /api/documentos-empleado?search=Juan

# Buscar contratos específicamente
GET /api/documentos-empleado?tipo_documento=CONTRATO&search=2025

# Buscar documentos de un empleado específico
GET /api/documentos-empleado?empleado_id=uuid-empleado&page=1&limit=20
```

### 4. Gestionar Documentos
```bash
# Descargar documento
GET /api/documentos-empleado/uuid-documento/download

# Actualizar información del documento
PUT /api/documentos-empleado/uuid-documento
{
  "descripcion": "Nueva descripción del documento"
}

# Ver estadísticas generales
GET /api/documentos-empleado/estadisticas

# Ver estadísticas de un empleado específico
GET /api/documentos-empleado/estadisticas?empleado_id=uuid-empleado
```

---

## Notas Importantes

### Validaciones de Negocio
- ✅ **Un empleado no puede tener dos documentos del mismo tipo con el mismo nombre**
- ✅ **Los tipos de documento están limitados a los 4 definidos en el enum**
- ✅ **El empleado debe existir antes de crear un documento**
- ✅ **Solo super_admin puede eliminar documentos**

### Características Especiales
- ✅ **Agrupación automática** por tipo de documento al consultar por empleado
- ✅ **Estadísticas detalladas** con porcentajes y documentos recientes
- ✅ **Búsqueda avanzada** en múltiples campos
- ✅ **Filtros combinables** para consultas específicas
- ✅ **Descarga segura** de archivos con validación de existencia

### Organización Recomendada de Archivos
```
uploads/
├── empleados/
│   ├── documentos/
│   │   ├── 2025/
│   │   │   ├── CV_Juan_Perez_2025.pdf
│   │   │   ├── CV_Maria_Garcia_2025.pdf
│   │   └── 2024/
│   ├── contratos/
│   │   ├── 2025/
│   │   │   ├── Contrato_Juan_Perez_2025.pdf
│   │   └── 2024/
│   ├── licencias/
│   └── soportes_medicos/
```

**¡El CRUD completo de Documentos de Empleado está listo para usar!** 🎉