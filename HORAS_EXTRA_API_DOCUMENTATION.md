# API de Horas Extra y Documentos - SIGED

## Descripción
API para gestión completa de registros de horas extra y sus documentos de respaldo en el sistema SIGED.

## Características
- ✅ **CRUD completo** para horas extra y documentos
- ✅ **Autenticación JWT** requerida en todas las rutas
- ✅ **Control de permisos**: DELETE solo para super_admin
- ✅ **Paginación** en listados
- ✅ **Filtros avanzados** por empleado, sede, jornada, fechas
- ✅ **Gestión de documentos** con subida y descarga de archivos
- ✅ **Eliminación en cascada**

## Modelos de Datos

### Horas Extra
```typescript
{
  id: string;                    // UUID generado automáticamente
  empleado_id: string;          // ID del empleado
  sede_id: string;              // ID de la sede
  cantidad_horas: Decimal;      // Cantidad de horas (máx 99.99)
  fecha_realizacion: Date;      // Fecha de realización
  jornada: 'ma_ana' | 'tarde' | 'sabatina' | 'nocturna';
  observacion?: string;         // Observaciones opcionales
  created_at: DateTime;         // Fecha de creación del registro
}
```

### Documentos de Horas Extra
```typescript
{
  id: string;                   // UUID generado automáticamente
  horas_extra_id: string;      // ID del registro de horas extra
  nombre: string;              // Nombre del archivo
  ruta_relativa: string;       // Ruta relativa del archivo
  created_at: DateTime;        // Fecha de creación del documento
}
```

---

# ENDPOINTS DE HORAS EXTRA

## Base URL: `/api/horas-extra`

---

## 1. Crear Registro de Horas Extra
**POST** `/api/horas-extra`

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
  "sede_id": "uuid-de-la-sede",
  "cantidad_horas": 4.5,
  "fecha_realizacion": "2025-10-06",
  "jornada": "ma_ana",
  "observacion": "Horas extra por actividad especial"
}
```

### Jornadas Disponibles
- `ma_ana` - Mañana
- `tarde` - Tarde  
- `sabatina` - Sabatina
- `nocturna` - Nocturna

### Respuesta Exitosa (201)
```json
{
  "success": true,
  "message": "Registro de horas extra creado exitosamente",
  "data": {
    "id": "uuid-horas-extra",
    "empleado_id": "uuid-empleado",
    "sede_id": "uuid-sede",
    "cantidad_horas": 4.5,
    "fecha_realizacion": "2025-10-06",
    "jornada": "ma_ana",
    "observacion": "Horas extra por actividad especial",
    "created_at": "2025-10-06T10:30:00.000Z",
    "empleado": {
      "id": "uuid-empleado",
      "nombre": "Juan",
      "apellido": "Pérez",
      "documento": "12345678"
    },
    "sede": {
      "id": "uuid-sede",
      "nombre": "Sede Principal"
    },
    "documentos_horas_extra": []
  }
}
```

### Errores
```json
// 400 - Datos faltantes
{
  "success": false,
  "message": "Faltan datos requeridos: empleado_id, sede_id, cantidad_horas, fecha_realizacion, jornada",
  "error": "Validation Error"
}

// 404 - Empleado no encontrado
{
  "success": false,
  "message": "Empleado no encontrado",
  "error": "Not Found"
}

// 404 - Sede no encontrada
{
  "success": false,
  "message": "Sede no encontrada",
  "error": "Not Found"
}
```

---

## 2. Listar Registros de Horas Extra
**GET** `/api/horas-extra?page=1&limit=10&empleado_id=uuid&sede_id=uuid&jornada=ma_ana&fecha_desde=2025-01-01&fecha_hasta=2025-12-31`

### Query Parameters
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `empleado_id` (opcional): Filtrar por empleado específico
- `sede_id` (opcional): Filtrar por sede específica
- `jornada` (opcional): Filtrar por jornada específica
- `fecha_desde` (opcional): Fecha de inicio del rango
- `fecha_hasta` (opcional): Fecha de fin del rango

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Registros de horas extra obtenidos exitosamente",
  "data": [
    {
      "id": "uuid-horas-extra",
      "cantidad_horas": 4.5,
      "fecha_realizacion": "2025-10-06",
      "jornada": "ma_ana",
      "observacion": "Horas extra por actividad especial",
      "created_at": "2025-10-06T10:30:00.000Z",
      "empleado": {
        "id": "uuid-empleado",
        "nombre": "Juan",
        "apellido": "Pérez",
        "documento": "12345678"
      },
      "sede": {
        "id": "uuid-sede",
        "nombre": "Sede Principal"
      },
      "documentos_horas_extra": [
        {
          "id": "uuid-documento",
          "nombre": "respaldo_horas_extra.pdf",
          "created_at": "2025-10-06T11:00:00.000Z"
        }
      ]
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

## 3. Obtener Registro por ID
**GET** `/api/horas-extra/:id`

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Registro de horas extra obtenido exitosamente",
  "data": {
    "id": "uuid-horas-extra",
    "empleado_id": "uuid-empleado",
    "sede_id": "uuid-sede",
    "cantidad_horas": 4.5,
    "fecha_realizacion": "2025-10-06",
    "jornada": "ma_ana",
    "observacion": "Horas extra por actividad especial",
    "created_at": "2025-10-06T10:30:00.000Z",
    "empleado": {
      "id": "uuid-empleado",
      "nombre": "Juan",
      "apellido": "Pérez",
      "documento": "12345678",
      "email": "juan.perez@ejemplo.com"
    },
    "sede": {
      "id": "uuid-sede",
      "nombre": "Sede Principal",
      "direccion": "Calle 123 # 45-67"
    },
    "documentos_horas_extra": [
      {
        "id": "uuid-documento",
        "nombre": "respaldo_horas_extra.pdf",
        "ruta_relativa": "horas_extra/2025/respaldo_horas_extra.pdf",
        "created_at": "2025-10-06T11:00:00.000Z"
      }
    ]
  }
}
```

---

## 4. Actualizar Registro de Horas Extra
**PUT** `/api/horas-extra/:id`

### Body (todos los campos son opcionales)
```json
{
  "empleado_id": "nuevo-uuid-empleado",
  "sede_id": "nuevo-uuid-sede",
  "cantidad_horas": 6.0,
  "fecha_realizacion": "2025-10-07",
  "jornada": "tarde",
  "observacion": "Observación actualizada"
}
```

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Registro de horas extra actualizado exitosamente",
  "data": {
    "id": "uuid-horas-extra",
    "empleado_id": "nuevo-uuid-empleado",
    "sede_id": "nuevo-uuid-sede",
    "cantidad_horas": 6.0,
    "fecha_realizacion": "2025-10-07",
    "jornada": "tarde",
    "observacion": "Observación actualizada",
    "created_at": "2025-10-06T10:30:00.000Z",
    "empleado": {
      "id": "nuevo-uuid-empleado",
      "nombre": "María",
      "apellido": "González",
      "documento": "87654321"
    },
    "sede": {
      "id": "nuevo-uuid-sede",
      "nombre": "Sede Norte"
    },
    "documentos_horas_extra": []
  }
}
```

---

## 5. Eliminar Registro de Horas Extra
**DELETE** `/api/horas-extra/:id`

### Restricción
- ⚠️ **Solo usuarios con rol `super_admin`**
- 🗑️ **Eliminación en cascada**: Se eliminan todos los documentos asociados

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Registro de horas extra eliminado exitosamente",
  "data": {
    "id": "uuid-horas-extra",
    "empleado": "Juan Pérez",
    "sede": "Sede Principal",
    "cantidadHoras": 4.5,
    "documentosEliminados": 2
  }
}
```

---

# ENDPOINTS DE DOCUMENTOS DE HORAS EXTRA

## Base URL: `/api/documentos-horas-extra`

---

## 1. Crear Documento de Horas Extra
**POST** `/api/documentos-horas-extra`

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
  "horas_extra_id": "uuid-del-registro-horas-extra",
  "nombre": "respaldo_horas_extra_octubre.pdf",
  "ruta_relativa": "horas_extra/2025/10/respaldo_horas_extra_octubre.pdf"
}
```

### Respuesta Exitosa (201)
```json
{
  "success": true,
  "message": "Documento de horas extra creado exitosamente",
  "data": {
    "id": "uuid-documento",
    "horas_extra_id": "uuid-horas-extra",
    "nombre": "respaldo_horas_extra_octubre.pdf",
    "ruta_relativa": "horas_extra/2025/10/respaldo_horas_extra_octubre.pdf",
    "created_at": "2025-10-06T11:00:00.000Z",
    "horas_extra": {
      "id": "uuid-horas-extra",
      "cantidad_horas": 4.5,
      "fecha_realizacion": "2025-10-06",
      "jornada": "ma_ana",
      "empleado": {
        "id": "uuid-empleado",
        "nombre": "Juan",
        "apellido": "Pérez",
        "documento": "12345678"
      },
      "sede": {
        "id": "uuid-sede",
        "nombre": "Sede Principal"
      }
    }
  }
}
```

---

## 2. Listar Documentos de Horas Extra
**GET** `/api/documentos-horas-extra?page=1&limit=10&search=texto&horas_extra_id=uuid&empleado_id=uuid`

### Query Parameters
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `search` (opcional): Buscar en nombre de archivo, empleado o documento
- `horas_extra_id` (opcional): Filtrar por registro específico de horas extra
- `empleado_id` (opcional): Filtrar por empleado específico

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Documentos de horas extra obtenidos exitosamente",
  "data": [
    {
      "id": "uuid-documento",
      "horas_extra_id": "uuid-horas-extra",
      "nombre": "respaldo_horas_extra_octubre.pdf",
      "ruta_relativa": "horas_extra/2025/10/respaldo_horas_extra_octubre.pdf",
      "created_at": "2025-10-06T11:00:00.000Z",
      "horas_extra": {
        "id": "uuid-horas-extra",
        "cantidad_horas": 4.5,
        "fecha_realizacion": "2025-10-06",
        "jornada": "ma_ana",
        "empleado": {
          "id": "uuid-empleado",
          "nombre": "Juan",
          "apellido": "Pérez",
          "documento": "12345678"
        },
        "sede": {
          "id": "uuid-sede",
          "nombre": "Sede Principal"
        }
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 15,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 3. Obtener Documentos por Registro de Horas Extra
**GET** `/api/documentos-horas-extra/horas-extra/:horas_extra_id`

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Documentos obtenidos exitosamente",
  "data": [
    {
      "id": "uuid-documento-1",
      "nombre": "respaldo_horas_extra_octubre.pdf",
      "ruta_relativa": "horas_extra/2025/10/respaldo_horas_extra_octubre.pdf",
      "created_at": "2025-10-06T11:00:00.000Z"
    },
    {
      "id": "uuid-documento-2",
      "nombre": "autorizacion_horas_extra.pdf",
      "ruta_relativa": "horas_extra/2025/10/autorizacion_horas_extra.pdf",
      "created_at": "2025-10-06T11:30:00.000Z"
    }
  ],
  "horas_extra": {
    "id": "uuid-horas-extra",
    "empleado": "Juan Pérez",
    "sede": "Sede Principal",
    "cantidad_horas": 4.5,
    "fecha_realizacion": "2025-10-06",
    "jornada": "ma_ana"
  }
}
```

---

## 4. Obtener Documento por ID
**GET** `/api/documentos-horas-extra/:id`

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Documento obtenido exitosamente",
  "data": {
    "id": "uuid-documento",
    "horas_extra_id": "uuid-horas-extra",
    "nombre": "respaldo_horas_extra_octubre.pdf",
    "ruta_relativa": "horas_extra/2025/10/respaldo_horas_extra_octubre.pdf",
    "created_at": "2025-10-06T11:00:00.000Z",
    "horas_extra": {
      "id": "uuid-horas-extra",
      "cantidad_horas": 4.5,
      "fecha_realizacion": "2025-10-06",
      "jornada": "ma_ana",
      "empleado": {
        "id": "uuid-empleado",
        "nombre": "Juan",
        "apellido": "Pérez",
        "documento": "12345678"
      },
      "sede": {
        "id": "uuid-sede",
        "nombre": "Sede Principal"
      }
    }
  }
}
```

---

## 5. Descargar Documento
**GET** `/api/documentos-horas-extra/:id/download`

### Respuesta Exitosa (200)
- **Content-Type**: `application/octet-stream`
- **Content-Disposition**: `attachment; filename="respaldo_horas_extra_octubre.pdf"`
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

## 6. Actualizar Documento
**PUT** `/api/documentos-horas-extra/:id`

### Body
```json
{
  "nombre": "nuevo_nombre_archivo.pdf",
  "ruta_relativa": "horas_extra/2025/10/nuevo_nombre_archivo.pdf"
}
```

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Documento actualizado exitosamente",
  "data": {
    "id": "uuid-documento",
    "horas_extra_id": "uuid-horas-extra",
    "nombre": "nuevo_nombre_archivo.pdf",
    "ruta_relativa": "horas_extra/2025/10/nuevo_nombre_archivo.pdf",
    "created_at": "2025-10-06T11:00:00.000Z",
    "horas_extra": {
      "id": "uuid-horas-extra",
      "empleado": {
        "id": "uuid-empleado",
        "nombre": "Juan",
        "apellido": "Pérez"
      },
      "sede": {
        "id": "uuid-sede",
        "nombre": "Sede Principal"
      }
    }
  }
}
```

---

## 7. Eliminar Documento
**DELETE** `/api/documentos-horas-extra/:id`

### Restricción
- ⚠️ **Solo usuarios con rol `super_admin`**

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Documento eliminado exitosamente",
  "data": {
    "id": "uuid-documento",
    "nombre": "respaldo_horas_extra_octubre.pdf",
    "empleado": "Juan Pérez",
    "sede": "Sede Principal"
  }
}
```

---

## Códigos de Estado HTTP

- `200` - OK (GET, PUT, DELETE exitosos)
- `201` - Created (POST exitoso)
- `400` - Bad Request (datos inválidos)
- `401` - Unauthorized (sin token JWT)
- `403` - Forbidden (sin permisos para DELETE)
- `404` - Not Found (recurso no encontrado)
- `409` - Conflict (nombre de documento duplicado)
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

### Crear Registro de Horas Extra
```bash
curl -X POST http://localhost:3000/api/horas-extra \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "empleado_id": "uuid-empleado",
    "sede_id": "uuid-sede",
    "cantidad_horas": 4.5,
    "fecha_realizacion": "2025-10-06",
    "jornada": "ma_ana",
    "observacion": "Horas extra por evento especial"
  }'
```

### Crear Documento de Respaldo
```bash
curl -X POST http://localhost:3000/api/documentos-horas-extra \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "horas_extra_id": "uuid-horas-extra",
    "nombre": "respaldo_horas_extra.pdf",
    "ruta_relativa": "horas_extra/2025/10/respaldo_horas_extra.pdf"
  }'
```

### Filtrar Horas Extra por Empleado y Fechas
```bash
curl -X GET "http://localhost:3000/api/horas-extra?empleado_id=uuid-empleado&fecha_desde=2025-10-01&fecha_hasta=2025-10-31&page=1&limit=5" \
  -H "Authorization: Bearer <token>"
```

### Descargar Documento
```bash
curl -X GET "http://localhost:3000/api/documentos-horas-extra/uuid-documento/download" \
  -H "Authorization: Bearer <token>" \
  -o "archivo_descargado.pdf"
```

### Eliminar Registro (solo super_admin)
```bash
curl -X DELETE http://localhost:3000/api/horas-extra/uuid-horas-extra \
  -H "Authorization: Bearer <token>"
```

---

## Flujo Típico de Uso

1. **Crear registro de horas extra** con datos básicos
2. **Subir documento(s) de respaldo** referenciando el registro creado
3. **Consultar registros** con filtros según necesidad
4. **Descargar documentos** cuando se requiera verificación
5. **Actualizar información** si es necesario
6. **Eliminar registros** solo cuando sea absolutamente necesario (super_admin)

## Notas Importantes

- ✅ Los documentos se eliminan automáticamente cuando se elimina un registro de horas extra
- ✅ La cantidad de horas admite decimales (ej: 4.5 horas)
- ✅ Las fechas deben estar en formato ISO (YYYY-MM-DD)
- ✅ Los filtros se pueden combinar para búsquedas específicas
- ✅ La paginación es automática en todos los listados