# 🔄 MÓDULO DE SUPLENCIAS - DOCUMENTACIÓN COMPLETA

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Módulo](#arquitectura-del-módulo)
3. [Endpoints de Suplencias](#endpoints-de-suplencias)
4. [Sistema de Documentos](#sistema-de-documentos)
5. [Schemas y Validaciones](#schemas-y-validaciones)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Permisos y Roles](#permisos-y-roles)
8. [Casos de Prueba](#casos-de-prueba)

---

## 🎯 Descripción General

El **Módulo de Suplencias** gestiona el registro y administración de suplencias educativas, permitiendo documentar cuando un empleado reemplaza a otro en sus funciones docentes de manera temporal.

### 📚 **Funcionalidades Principales**

- ✅ **Gestión de Suplencias**: CRUD completo de registros de suplencia
- ✅ **Control de Jornadas**: Manejo de horarios (mañana, tarde, sabatina)
- ✅ **Documentos Asociados**: Sistema de archivos para suplencias
- ✅ **Registro Temporal**: Control de fechas de inicio y fin
- ✅ **Empleados Involucrados**: Empleado suplente y empleado suplido
- ✅ **Auditoría**: Registro completo de cambios y observaciones

---

## 🏗️ Arquitectura del Módulo

```
modulos/suplencias/
├── 📁 suplencia.controller.ts     # Controlador principal
├── 📁 suplencia.routes.ts         # Rutas del módulo
└── 📁 [relacionados]
    └── documentos/documentos_suplencias/
        ├── doc.suplencia.controller.ts # Gestión de documentos
        └── doc.suplencia.routes.ts     # Rutas de documentos
```

### 🌐 **Integración en el Sistema**

```typescript
// Base path: /api/suplencias
router.use('/api/suplencias', SuplenciasRoutes);

// Documentos relacionados:
router.use('/api/documentos-suplencias', DocumentoSuplenciaRoutes);
```

---

## 🛣️ Endpoints de Suplencias

### **📅 Obtener Jornadas Disponibles**
```http
GET /api/suplencias/jornadas
```
**Permisos**: Todos los roles autenticados

**Respuesta**:
```json
{
  "success": true,
  "message": "Jornadas disponibles obtenidas exitosamente",
  "data": [
    {
      "valor": "mañana",
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

### **➕ Crear Suplencia**
```http
POST /api/suplencias
```
**Permisos**: Todos los roles autenticados

**Body**:
```json
{
  "empleado_suplente_id": "uuid-empleado-suplente",
  "empleado_suplido_id": "uuid-empleado-suplido", 
  "sede_id": "uuid-sede",
  "jornada": "mañana",
  "fecha_inicio": "2025-10-07",
  "fecha_fin": "2025-10-14",
  "observaciones": "Suplencia por licencia médica"
}
```

**Respuesta Exitosa**:
```json
{
  "success": true,
  "message": "Suplencia creada exitosamente",
  "data": {
    "id": "uuid-suplencia",
    "empleado_suplente_id": "uuid-empleado-suplente",
    "empleado_suplido_id": "uuid-empleado-suplido",
    "sede_id": "uuid-sede",
    "jornada": "mañana",
    "fecha_inicio": "2025-10-07T00:00:00.000Z",
    "fecha_fin": "2025-10-14T00:00:00.000Z",
    "observaciones": "Suplencia por licencia médica",
    "created_at": "2025-10-07T12:00:00.000Z"
  }
}
```

### **📋 Obtener Suplencias**
```http
GET /api/suplencias?page=1&limit=10&empleado_suplente_id=uuid&jornada=mañana
```
**Permisos**: Todos los roles autenticados

**Query Parameters**:
- `page`: Página (default: 1)
- `limit`: Resultados por página (default: 10)
- `empleado_suplente_id`: Filtrar por empleado suplente
- `empleado_suplido_id`: Filtrar por empleado suplido
- `sede_id`: Filtrar por sede
- `jornada`: `mañana` | `tarde` | `sabatina`
- `fecha_desde`: Fecha desde (YYYY-MM-DD)
- `fecha_hasta`: Fecha hasta (YYYY-MM-DD)
- `search`: Búsqueda en observaciones

**Respuesta**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-suplencia",
      "empleado_suplente": {
        "id": "uuid-suplente",
        "nombre": "María Elena",
        "apellido": "González",
        "documento": "87654321"
      },
      "empleado_suplido": {
        "id": "uuid-suplido", 
        "nombre": "Carlos Alberto",
        "apellido": "Martínez",
        "documento": "12345678"
      },
      "sede": {
        "id": "uuid-sede",
        "nombre": "Sede Norte"
      },
      "jornada": "mañana",
      "fecha_inicio": "2025-10-07T00:00:00.000Z",
      "fecha_fin": "2025-10-14T00:00:00.000Z",
      "observaciones": "Suplencia por licencia médica",
      "created_at": "2025-10-07T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### **🔍 Obtener Suplencia por ID**
```http
GET /api/suplencias/:id
```
**Permisos**: Todos los roles autenticados

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-suplencia",
    "empleado_suplente": {
      "id": "uuid-suplente",
      "nombre": "María Elena",
      "apellido": "González",
      "documento": "87654321",
      "email": "maria.gonzalez@example.com",
      "cargo": "Docente"
    },
    "empleado_suplido": {
      "id": "uuid-suplido",
      "nombre": "Carlos Alberto", 
      "apellido": "Martínez",
      "documento": "12345678",
      "email": "carlos.martinez@example.com",
      "cargo": "Docente"
    },
    "sede": {
      "id": "uuid-sede",
      "nombre": "Sede Norte",
      "direccion": "Calle 80 # 15-20"
    },
    "jornada": "mañana",
    "fecha_inicio": "2025-10-07T00:00:00.000Z",
    "fecha_fin": "2025-10-14T00:00:00.000Z",
    "observaciones": "Suplencia por licencia médica",
    "created_at": "2025-10-07T12:00:00.000Z",
    "updated_at": "2025-10-07T12:00:00.000Z"
  }
}
```

### **✏️ Actualizar Suplencia**
```http
PUT /api/suplencias/:id
```
**Permisos**: Todos los roles autenticados

**Body**:
```json
{
  "fecha_fin": "2025-10-21",
  "observaciones": "Extensión de suplencia por licencia médica prolongada"
}
```

### **🗑️ Eliminar Suplencia**
```http
DELETE /api/suplencias/:id
```
**Permisos**: Solo `super_admin`

**Respuesta**:
```json
{
  "success": true,
  "message": "Suplencia eliminada exitosamente"
}
```

---

## 📁 Sistema de Documentos

### **➕ Crear Documento de Suplencia**
```http
POST /api/documentos-suplencias
```
**Permisos**: Todos los roles autenticados

**Body**:
```json
{
  "suplencia_id": "uuid-suplencia",
  "ruta_archivo": "/documentos/suplencias/licencia_medica_carlos.pdf",
  "descripcion": "Licencia médica que justifica la suplencia"
}
```

### **📋 Obtener Documentos de Suplencia**
```http
GET /api/documentos-suplencias?suplencia_id=uuid&page=1&limit=10
```
**Permisos**: Todos los roles autenticados

**Query Parameters**:
- `suplencia_id`: Filtrar por suplencia específica
- `search`: Búsqueda en descripción
- `page`: Página
- `limit`: Resultados por página

### **🔍 Obtener Documento por ID**
```http
GET /api/documentos-suplencias/:id
```

### **✏️ Actualizar Documento**
```http
PUT /api/documentos-suplencias/:id
```

### **🗑️ Eliminar Documento**
```http
DELETE /api/documentos-suplencias/:id
```
**Permisos**: Solo `super_admin`

---

## 📋 Schemas y Validaciones

### **Modelo de Suplencia**
```typescript
interface ISuplencia {
  id: string;
  empleado_suplente_id: string;      // Requerido - UUID del empleado que suple
  empleado_suplido_id: string;       // Requerido - UUID del empleado suplido
  sede_id: string;                   // Requerido - UUID de la sede
  jornada: 'mañana' | 'tarde' | 'sabatina';  // Requerido
  fecha_inicio: Date;                // Requerida
  fecha_fin?: Date;                  // Opcional - null si es indefinida
  observaciones?: string;            // Opcional
  created_at: Date;
  updated_at: Date;
}
```

### **Modelo de Documento de Suplencia**
```typescript
interface IDocumentoSuplencia {
  id: string;
  suplencia_id: string;              // Requerido - UUID de la suplencia
  ruta_archivo: string;              // Requerida - Path del archivo
  descripcion?: string;              // Opcional
  created_at: Date;
  updated_at: Date;
}
```

### **Validaciones de Entrada**

#### **Crear/Actualizar Suplencia**
- ✅ `empleado_suplente_id`: UUID válido, empleado debe existir y estar activo
- ✅ `empleado_suplido_id`: UUID válido, empleado debe existir, diferente al suplente
- ✅ `sede_id`: UUID válido, sede debe existir y estar activa
- ✅ `jornada`: Debe ser uno de: 'mañana', 'tarde', 'sabatina'
- ✅ `fecha_inicio`: Fecha válida, no puede ser anterior a hoy
- ✅ `fecha_fin`: Si se proporciona, debe ser posterior a fecha_inicio
- ✅ `observaciones`: Máximo 500 caracteres

#### **Jornadas Disponibles**
```typescript
enum SuplenciasJornada {
  mañana = 'mañana',      // 7:00 AM - 12:00 PM
  tarde = 'tarde',        // 12:00 PM - 6:00 PM
  sabatina = 'sabatina'   // 7:00 AM - 12:00 PM (sábados)
}
```

---

## 🔐 Permisos y Roles

| Acción | super_admin | admin | gestor |
|--------|-------------|--------|--------|
| **Suplencias** |
| Ver suplencias | ✅ | ✅ | ✅ |
| Crear suplencia | ✅ | ✅ | ✅ |
| Actualizar suplencia | ✅ | ✅ | ✅ |
| Eliminar suplencia | ✅ | ❌ | ❌ |
| **Documentos** |
| Ver documentos | ✅ | ✅ | ✅ |
| Crear documento | ✅ | ✅ | ✅ |
| Actualizar documento | ✅ | ✅ | ✅ |
| Eliminar documento | ✅ | ❌ | ❌ |
| **Jornadas** |
| Ver jornadas disponibles | ✅ | ✅ | ✅ |

---

## 🧪 Ejemplos de Uso Completos

### **Flujo 1: Crear Suplencia Completa**

```bash
# 1. Obtener jornadas disponibles
curl -X GET http://localhost:3000/api/suplencias/jornadas \
  -H "Authorization: Bearer $TOKEN"

# 2. Crear suplencia
curl -X POST http://localhost:3000/api/suplencias \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "empleado_suplente_id": "uuid-maria",
    "empleado_suplido_id": "uuid-carlos",
    "sede_id": "uuid-sede-norte", 
    "jornada": "mañana",
    "fecha_inicio": "2025-10-07",
    "fecha_fin": "2025-10-14",
    "observaciones": "Suplencia por licencia médica"
  }'

# 3. Agregar documento justificativo
curl -X POST http://localhost:3000/api/documentos-suplencias \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "suplencia_id": "{suplencia_id}",
    "ruta_archivo": "/docs/licencia_medica.pdf",
    "descripcion": "Licencia médica justificativa"
  }'
```

### **Flujo 2: Búsqueda y Filtrado**

```bash
# Buscar suplencias por empleado suplente
curl -X GET "http://localhost:3000/api/suplencias?empleado_suplente_id=uuid-maria&page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN"

# Buscar por rango de fechas y jornada
curl -X GET "http://localhost:3000/api/suplencias?fecha_desde=2025-10-01&fecha_hasta=2025-10-31&jornada=mañana" \
  -H "Authorization: Bearer $TOKEN"

# Buscar por sede específica
curl -X GET "http://localhost:3000/api/suplencias?sede_id=uuid-sede&search=licencia" \
  -H "Authorization: Bearer $TOKEN"
```

### **Flujo 3: Gestión de Documentos**

```bash
# Ver documentos de una suplencia específica
curl -X GET "http://localhost:3000/api/documentos-suplencias?suplencia_id={suplencia_id}" \
  -H "Authorization: Bearer $TOKEN"

# Actualizar descripción de documento
curl -X PUT http://localhost:3000/api/documentos-suplencias/{documento_id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "descripcion": "Licencia médica actualizada con extensión"
  }'

# Ver detalles completos de un documento
curl -X GET http://localhost:3000/api/documentos-suplencias/{documento_id} \
  -H "Authorization: Bearer $TOKEN"
```

### **Flujo 4: Actualización de Suplencia**

```bash
# Extender fecha de fin de suplencia
curl -X PUT http://localhost:3000/api/suplencias/{suplencia_id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fecha_fin": "2025-10-28",
    "observaciones": "Suplencia extendida por prolongación de licencia médica"
  }'

# Ver detalles actualizados
curl -X GET http://localhost:3000/api/suplencias/{suplencia_id} \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔄 Casos de Prueba

### **Caso 1: Validación de Empleados**

```json
// ❌ Error - Empleado suplente y suplido iguales
POST /api/suplencias
{
  "empleado_suplente_id": "uuid-mismo",
  "empleado_suplido_id": "uuid-mismo",
  "sede_id": "uuid-sede",
  "jornada": "mañana"
}

// Respuesta esperada:
{
  "success": false,
  "message": "El empleado suplente no puede ser el mismo que el empleado suplido",
  "error": "Validation Error"
}
```

### **Caso 2: Validación de Fechas**

```json
// ❌ Error - Fecha fin anterior a fecha inicio
POST /api/suplencias
{
  "empleado_suplente_id": "uuid-1",
  "empleado_suplido_id": "uuid-2", 
  "sede_id": "uuid-sede",
  "jornada": "tarde",
  "fecha_inicio": "2025-10-15",
  "fecha_fin": "2025-10-10"
}

// Respuesta esperada:
{
  "success": false,
  "message": "La fecha de fin no puede ser anterior a la fecha de inicio",
  "error": "Invalid Date Range"
}
```

### **Caso 3: Empleado Inexistente**

```bash
# ❌ Error - Empleado no existe
curl -X POST http://localhost:3000/api/suplencias \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "empleado_suplente_id": "uuid-inexistente",
    "empleado_suplido_id": "uuid-valido",
    "sede_id": "uuid-sede",
    "jornada": "mañana"
  }'

# Respuesta esperada: 400 Bad Request
{
  "success": false,
  "message": "El empleado suplente especificado no existe",
  "error": "Employee Not Found"
}
```

### **Caso 4: Permisos Insuficientes**

```bash
# ❌ Error - Gestor intentando eliminar suplencia
curl -X DELETE http://localhost:3000/api/suplencias/{id} \
  -H "Authorization: Bearer $GESTOR_TOKEN"

# Respuesta esperada: 403 Forbidden
{
  "success": false,
  "message": "No tienes permisos para eliminar suplencias",
  "error": "Insufficient Permissions"
}
```

---

## 🚀 Características Avanzadas

### **Búsqueda Inteligente**
- Filtros combinables por empleados, sede, jornada y fechas
- Búsqueda de texto en observaciones
- Paginación eficiente para datasets grandes

### **Validaciones Cruzadas**
- Verificación de existencia de empleados y sedes
- Control de coherencia en fechas
- Prevención de auto-suplencias

### **Gestión Documental**
- Sistema integrado de documentos justificativos
- Control de versiones de documentos
- Trazabilidad completa

### **Auditoría y Trazabilidad**
- Registro de todas las operaciones
- Timestamps de creación y modificación
- Log detallado de cambios

---

## 📝 Casos de Uso Comunes

### **Suplencia por Licencia Médica**
1. Empleado solicita licencia médica
2. Se asigna empleado suplente
3. Se crea registro de suplencia
4. Se adjunta documento de licencia médica
5. Al finalizar licencia, se actualiza fecha fin

### **Suplencia por Capacitación**
1. Empleado va a capacitación externa
2. Se programa suplencia temporal
3. Se documenta motivo y duración
4. Se registra empleado que cubre funciones

### **Suplencia por Vacaciones**
1. Empleado solicita vacaciones
2. Se asigna cobertura por período específico
3. Se registra suplencia con fechas definidas
4. Se documenta entrega de responsabilidades

---

*Documentación del Módulo de Suplencias - API SIGED*  
*Última actualización: Octubre 2025*  
*Versión: 1.0.0 - Gestión integral de suplencias temporales*