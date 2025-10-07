# API de Actos Administrativos - SIGED

## Descripción
API para gestión de actos administrativos con generación automática de nombres usando el formato:
**`Resolución I.E [Nombre Institución]-[Consecutivo]`**

## Características
- ✅ **Generación automática de nombres** con consecutivo por institución
- ✅ **Autenticación JWT** requerida en todas las rutas
- ✅ **Control de permisos**: DELETE solo para super_admin
- ✅ **Paginación** en listados
- ✅ **Búsqueda** por texto
- ✅ **Gestión de documentos** asociados

## Estructura del Nombre Generado

### Formato:
```
Resolución I.E [Nombre Institución]-[Consecutivo de 4 dígitos]
```

### Ejemplos:
- `Resolución I.E Jaime Salazar-0001`
- `Resolución I.E Santa Sofia-0001`
- `Resolución I.E Jaime Salazar-0002`
- `Resolución I.E Los Andes-0001`

## Endpoints

### 1. Crear Acto Administrativo
```http
POST /api/actos-administrativos
Authorization: Bearer <token>
Content-Type: application/json

### Body
```json
{
  "institucion_educativa_id": "uuid-de-la-institucion",
  "descripcion": "Descripción opcional del acto administrativo"
}
```

### Respuesta Exitosa (201)
```json
{
  "success": true,
  "message": "Acto administrativo creado exitosamente",
  "data": {
    "id": 1,
    "fecha_creacion": "2025-10-06",
    "nombre": "Resolución I.E Jaime Salazar-0001",
    "descripcion": "Descripción del acto",
    "created_at": "2025-10-06T10:30:00.000Z",
    "documentos_actos_administrativos": [],
    "institucion_educativa": {
      "id": "uuid-institucion",
      "nombre": "Jaime Salazar"
    },
    "consecutivo": "0001",
    "patron_generado": true
  }
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Acto administrativo creado exitosamente",
  "data": {
    "id": 1,
    "fecha_creacion": "2025-10-06",
    "nombre": "Resolución 001-2025",
    "descripcion": "Nombramiento de docentes para el año escolar 2025",
    "created_at": "2025-10-06T15:30:00.000Z",
    "documentos_actos_administrativos": []
  }
}
```

### 2. Obtener Actos Administrativos (con paginación)
```http
GET /api/actos-administrativos?page=1&limit=10&search=resolución
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Actos administrativos obtenidos exitosamente",
  "data": [
    {
      "id": 1,
      "fecha_creacion": "2025-10-06",
      "nombre": "Resolución 001-2025",
      "descripcion": "Nombramiento de docentes para el año escolar 2025",
      "created_at": "2025-10-06T15:30:00.000Z",
      "documentos_actos_administrativos": [
        {
          "id": "uuid-documento-1",
          "nombre": "Resolución_Nombramiento.pdf",
          "created_at": "2025-10-06T15:35:00.000Z"
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### 3. Obtener Acto Administrativo por ID
```http
GET /api/actos-administrativos/1
Authorization: Bearer <token>
```

### 4. Actualizar Acto Administrativo
```http
PUT /api/actos-administrativos/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Resolución 001-2025 - Modificada",
  "descripcion": "Nombramiento y reasignación de docentes para el año escolar 2025"
}
```

### 5. Eliminar Acto Administrativo (Solo super_admin)
```http
DELETE /api/actos-administrativos/1
Authorization: Bearer <token_super_admin>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Acto administrativo eliminado exitosamente",
  "data": {
    "id": 1,
    "nombre": "Resolución 001-2025",
    "documentosEliminados": 2
  }
}
```

## Endpoints de Documentos de Actos Administrativos

### 1. Crear Documento
```http
POST /api/documentos-actos-administrativos
Authorization: Bearer <token>
Content-Type: application/json

{
  "acto_administrativo_id": 1,
  "nombre": "Resolución_Nombramiento_Original.pdf",
  "ruta_relativa": "actos_administrativos/2025/resolucion_001_original.pdf"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Documento de acto administrativo creado exitosamente",
  "data": {
    "id": "uuid-documento-1",
    "acto_administrativo_id": 1,
    "ruta_relativa": "actos_administrativos/2025/resolucion_001_original.pdf",
    "nombre": "Resolución_Nombramiento_Original.pdf",
    "created_at": "2025-10-06T15:35:00.000Z",
    "actos_administrativos": {
      "id": 1,
      "nombre": "Resolución 001-2025"
    }
  }
}
```

### 2. Obtener Documentos (con filtros)
```http
GET /api/documentos-actos-administrativos?page=1&limit=10&acto_id=1&search=resolución
Authorization: Bearer <token>
```

### 3. Obtener Documentos por Acto ID
```http
GET /api/documentos-actos-administrativos/acto/1
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Documentos obtenidos exitosamente",
  "data": [
    {
      "id": "uuid-documento-1",
      "acto_administrativo_id": 1,
      "ruta_relativa": "actos_administrativos/2025/resolucion_001_original.pdf",
      "nombre": "Resolución_Nombramiento_Original.pdf",
      "created_at": "2025-10-06T15:35:00.000Z",
      "actos_administrativos": {
        "id": 1,
        "nombre": "Resolución 001-2025",
        "fecha_creacion": "2025-10-06"
      }
    }
  ],
  "acto": {
    "id": 1,
    "fecha_creacion": "2025-10-06",
    "nombre": "Resolución 001-2025",
    "descripcion": "Nombramiento de docentes para el año escolar 2025",
    "created_at": "2025-10-06T15:30:00.000Z"
  }
}
```

### 4. Obtener Documento por ID
```http
GET /api/documentos-actos-administrativos/uuid-documento-1
Authorization: Bearer <token>
```

### 5. Descargar Documento
```http
GET /api/documentos-actos-administrativos/uuid-documento-1/download
Authorization: Bearer <token>
```

**Respuesta:** Archivo descargable con headers apropiados:
```
Content-Disposition: attachment; filename="Resolución_Nombramiento_Original.pdf"
Content-Type: application/octet-stream
```

### 6. Actualizar Documento
```http
PUT /api/documentos-actos-administrativos/uuid-documento-1
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Resolución_Nombramiento_Actualizada.pdf",
  "ruta_relativa": "actos_administrativos/2025/resolucion_001_actualizada.pdf"
}
```

### 7. Eliminar Documento (Solo super_admin)
```http
DELETE /api/documentos-actos-administrativos/uuid-documento-1
Authorization: Bearer <token_super_admin>
```

## Códigos de Estado HTTP

- **200**: Operación exitosa
- **201**: Recurso creado exitosamente
- **400**: Datos de entrada inválidos
- **401**: Token de autenticación requerido o inválido
- **403**: Permisos insuficientes (solo para DELETE - requiere super_admin)
- **404**: Recurso no encontrado
- **409**: Conflicto (nombre duplicado, etc.)
- **500**: Error interno del servidor

## Validaciones Implementadas

### Actos Administrativos:
- **nombre**: Requerido, string, 3-100 caracteres, único
- **descripcion**: Opcional, string, máximo 1000 caracteres

### Documentos:
- **acto_administrativo_id**: Requerido, debe existir el acto
- **nombre**: Requerido, string, único por acto administrativo
- **ruta_relativa**: Requerida, string, ruta del archivo

## Características de Seguridad

1. **Autenticación JWT**: Todas las rutas requieren token válido
2. **Autorización por rol**: DELETE solo para super_admin
3. **Validación de entrada**: Sanitización y validación de datos
4. **Verificación de archivos**: Comprobación de existencia antes de descarga
5. **Logging**: Registro de todas las operaciones críticas

## Relaciones de Base de Datos

```
actos_administrativos (1) -> (N) documentos_actos_administrativos
- Eliminación en cascada: Al eliminar un acto, se eliminan todos sus documentos
- Restricción de integridad: No se puede crear documento sin acto válido
```

## Ejemplos de Uso Frontend

### JavaScript/Fetch
```javascript
// Crear acto administrativo
const crearActo = async (nombre, descripcion) => {
  const response = await fetch('/api/actos-administrativos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ nombre, descripcion })
  });
  return await response.json();
};

// Obtener actos con paginación
const obtenerActos = async (page = 1, limit = 10, search = '') => {
  const params = new URLSearchParams({ page, limit, search });
  const response = await fetch(`/api/actos-administrativos?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};

// Descargar documento
const descargarDocumento = async (documentoId) => {
  const response = await fetch(`/api/documentos-actos-administrativos/${documentoId}/download`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = response.headers.get('Content-Disposition').split('filename=')[1];
    a.click();
  }
};
```

## Estructura de Archivos Creados

```
src/
├── modulos/
│   ├── actos.administrativos/
│   │   ├── act.admi.controller.ts     ✅ CRUD de actos administrativos
│   │   └── act.admin.routes.ts        ✅ Rutas de actos administrativos
│   └── documentos/
│       └── documentos_actos_administrativos/
│           ├── doc.act.admin.controller.ts  ✅ CRUD de documentos
│           └── doc.act.admin.routes.ts      ✅ Rutas de documentos
└── presentation/
    └── routes.ts                      ✅ Rutas principales actualizadas
```

## Notas Importantes

1. **DELETE restringido**: Solo usuarios con rol `super_admin` pueden eliminar actos administrativos y documentos
2. **Cascada automática**: Al eliminar un acto administrativo, todos sus documentos se eliminan automáticamente
3. **Nombres únicos**: Los nombres de actos administrativos son únicos globalmente, y los nombres de documentos son únicos por acto
4. **Archivos físicos**: Los documentos deben existir físicamente en la ruta especificada para poder descargarse
5. **Logging completo**: Todas las operaciones se registran en los logs para auditoría