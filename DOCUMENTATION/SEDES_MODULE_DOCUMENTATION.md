# 🏫 MÓDULO DE SEDES - DOCUMENTACIÓN COMPLETA

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Módulo](#arquitectura-del-módulo)
3. [Endpoints Principales](#endpoints-principales)
4. [Submódulos Especializados](#submódulos-especializados)
5. [Schemas y Validaciones](#schemas-y-validaciones)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Permisos y Roles](#permisos-y-roles)
8. [Casos de Prueba](#casos-de-prueba)

---

## 🎯 Descripción General

El **Módulo de Sedes** es el sistema central para la gestión integral de sedes educativas en SIGED. Maneja todas las ubicaciones físicas donde se imparten clases y coordina múltiples aspectos organizacionales.

### 🏗️ **Funcionalidades Principales**

- ✅ **Gestión de Sedes**: CRUD completo de sedes educativas
- ✅ **Instituciones Educativas**: Administración de instituciones y su relación con sedes
- ✅ **Asignaciones Empleado-Sede**: Control de personal asignado por sede
- ✅ **Comentarios y Seguimiento**: Sistema de observaciones y documentación
- ✅ **Gestión de Jornadas**: Horarios y tipos de jornada por sede

---

## 🏗️ Arquitectura del Módulo

```
modulos/sede/
├── 📁 sede.controller.ts          # Controlador principal de sedes
├── 📁 sede.routes.ts              # Rutas principales y coordinación
├── 📁 asignaciones/               # Submódulo de asignaciones
│   ├── asignaciones.controller.ts # Gestión empleado-sede
│   └── asignaciones.routes.ts     # Rutas de asignaciones
├── 📁 comentarios/                # Submódulo de comentarios
│   ├── comentarios.controller.ts  # Observaciones y seguimiento
│   └── comentarios.routes.ts      # Rutas de comentarios
├── 📁 instituciones/              # Submódulo de instituciones
│   ├── instituciones.controller.ts # Gestión de instituciones educativas
│   └── instituciones.routes.ts    # Rutas de instituciones
└── 📁 jornadas/                   # Submódulo de jornadas
    ├── jornadas.controller.ts     # Horarios y tipos de jornada
    └── jornadas.routes.ts         # Rutas de jornadas
```

### 🌐 **Integración de Rutas**

```typescript
// Base path: /api/sede
router.use('/api/sede', SedeRoutes.routes);                    // Gestión principal
router.use('/api/instituciones', InstitucionesRouter.routes);  // Instituciones independientes
router.use('/api', JornadasGlobalRouter.routes);               // Jornadas globales
```

---

## 🛣️ Endpoints Principales

### 🏫 **GESTIÓN DE SEDES**

#### **Crear Sede**
```http
POST /api/sede
```
**Permisos**: `super_admin`, `admin`

**Body**:
```json
{
  "nombre": "Sede Central Bogotá",
  "zona": "urbana",
  "direccion": "Carrera 7 # 32-16",
  "codigo_DANE": "111001000001",
  "comentario": "Sede principal con todas las facilidades"
}
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Sede creada exitosamente",
  "data": {
    "id": "uuid-sede",
    "nombre": "Sede Central Bogotá",
    "estado": "activa",
    "zona": "urbana",
    "direccion": "Carrera 7 # 32-16",
    "codigo_DANE": "111001000001",
    "created_at": "2025-10-07T12:00:00.000Z"
  }
}
```

#### **Obtener Sedes**
```http
GET /api/sede?page=1&limit=10&estado=activa&zona=urbana
```
**Permisos**: `super_admin`, `admin`, `gestor`

**Query Parameters**:
- `nombre`: Filtro por nombre (búsqueda parcial)
- `estado`: `activa` | `inactiva`
- `zona`: `urbana` | `rural`
- `codigo_DANE`: Filtro por código DANE
- `page`: Página (default: 1)
- `limit`: Resultados por página (default: 10)

#### **Obtener Sede por ID**
```http
GET /api/sede/:id
```
**Permisos**: `super_admin`, `admin`, `gestor`

#### **Actualizar Sede**
```http
PUT /api/sede/:id
```
**Permisos**: `super_admin`, `admin`

#### **Eliminar Sede (Lógico)**
```http
DELETE /api/sede/:id
```
**Permisos**: `super_admin`

---

## 🔧 Submódulos Especializados

### 👥 **ASIGNACIONES EMPLEADO-SEDE**

#### **Crear Asignación**
```http
POST /api/sede/:sede_id/asignaciones
```
**Permisos**: `super_admin`, `admin`

**Body**:
```json
{
  "empleado_id": "uuid-empleado",
  "fecha_asignacion": "2025-10-07",
  "comentario": "Asignación para el período 2025"
}
```

#### **Obtener Asignaciones de una Sede**
```http
GET /api/sede/:sede_id/asignaciones?estado=activa
```
**Permisos**: `super_admin`, `admin`, `gestor`

**Respuesta**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-asignacion",
      "empleado": {
        "id": "uuid-empleado",
        "nombre": "Juan Pérez",
        "apellido": "García",
        "documento": "12345678",
        "cargo": "Docente"
      },
      "fecha_asignacion": "2025-10-07T00:00:00.000Z",
      "estado": "activa"
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

#### **Finalizar Asignación**
```http
PUT /api/sede/:sede_id/asignaciones/:id/finalizar
```
**Permisos**: `super_admin`, `admin`

---

### 💬 **COMENTARIOS DE SEDE**

#### **Crear Comentario**
```http
POST /api/sede/:sede_id/comentarios
```
**Permisos**: `super_admin`, `admin`, `gestor`

**Body**:
```json
{
  "observacion": "Necesita mantenimiento en el sistema eléctrico"
}
```

#### **Obtener Comentarios**
```http
GET /api/sede/:sede_id/comentarios?page=1&limit=5
```

**Respuesta**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-comentario",
      "observacion": "Necesita mantenimiento en el sistema eléctrico",
      "usuario": {
        "nombre": "Admin",
        "apellido": "Sistema"
      },
      "created_at": "2025-10-07T12:30:00.000Z"
    }
  ]
}
```

---

### 🏛️ **INSTITUCIONES EDUCATIVAS**

#### **Crear Institución**
```http
POST /api/instituciones
```
**Permisos**: `super_admin`, `admin`

**Body**:
```json
{
  "nombre": "Institución Educativa San José",
  "rector_encargado_id": "uuid-rector-opcional"
}
```

#### **Asignar Sede a Institución**
```http
POST /api/instituciones/:id/sedes
```
**Permisos**: `super_admin`, `admin`

**Body**:
```json
{
  "sede_id": "uuid-sede"
}
```

#### **Obtener Instituciones**
```http
GET /api/instituciones?page=1&limit=10
```

---

### ⏰ **JORNADAS**

#### **Crear Jornada**
```http
POST /api/sede/:sede_id/jornadas
```
**Permisos**: `super_admin`, `admin`

**Body**:
```json
{
  "nombre": "Jornada Matutina"
}
```

#### **Obtener Jornadas Globales**
```http
GET /api/jornadas
```
**Permisos**: Todos los roles autenticados

---

## 📋 Schemas y Validaciones

### **Modelo de Sede**
```typescript
interface ISede {
  id: string;
  nombre: string;                    // Requerido, máx 100 caracteres
  estado: 'activa' | 'inactiva';     // Default: 'activa'
  zona: 'urbana' | 'rural';          // Requerido
  direccion: string;                 // Requerido
  codigo_DANE?: string;              // Opcional, 12 caracteres
  created_at: Date;
  updated_at: Date;
}
```

### **Validaciones de Entrada**

#### **Crear/Actualizar Sede**
- ✅ `nombre`: Requerido, no vacío, máximo 100 caracteres
- ✅ `zona`: Debe ser 'urbana' o 'rural'
- ✅ `direccion`: Requerida, no vacía
- ✅ `codigo_DANE`: Opcional, exactamente 12 dígitos si se proporciona
- ✅ `estado`: 'activa' o 'inactiva' (default: 'activa')

### **Estados de Asignación**
```typescript
enum AsignacionEstado {
  activa = 'activa',
  finalizada = 'finalizada'
}
```

---

## 🔐 Permisos y Roles

| Acción | super_admin | admin | gestor |
|--------|-------------|--------|--------|
| **Sedes** |
| Ver sedes | ✅ | ✅ | ✅ |
| Crear sede | ✅ | ✅ | ❌ |
| Actualizar sede | ✅ | ✅ | ❌ |
| Eliminar sede | ✅ | ❌ | ❌ |
| **Asignaciones** |
| Ver asignaciones | ✅ | ✅ | ✅ |
| Crear asignación | ✅ | ✅ | ❌ |
| Finalizar asignación | ✅ | ✅ | ❌ |
| **Comentarios** |
| Ver comentarios | ✅ | ✅ | ✅ |
| Crear comentario | ✅ | ✅ | ✅ |
| **Instituciones** |
| Ver instituciones | ✅ | ✅ | ✅ |
| Crear institución | ✅ | ✅ | ❌ |
| Asignar sedes | ✅ | ✅ | ❌ |

---

## 🧪 Ejemplos de Uso Completos

### **Flujo 1: Crear Sede Completa**

```bash
# 1. Crear sede
curl -X POST http://localhost:3000/api/sede \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Sede Norte",
    "zona": "urbana", 
    "direccion": "Calle 80 # 15-20",
    "codigo_DANE": "111001000002",
    "comentario": "Nueva sede en zona norte"
  }'

# 2. Asignar empleado a la sede
curl -X POST http://localhost:3000/api/sede/{sede_id}/asignaciones \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "empleado_id": "{empleado_id}",
    "fecha_asignacion": "2025-10-07"
  }'

# 3. Agregar comentario de seguimiento
curl -X POST http://localhost:3000/api/sede/{sede_id}/comentarios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "observacion": "Sede lista para funcionamiento"
  }'
```

### **Flujo 2: Buscar y Filtrar Sedes**

```bash
# Buscar sedes activas en zona urbana
curl -X GET "http://localhost:3000/api/sede?estado=activa&zona=urbana&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Buscar sede por nombre
curl -X GET "http://localhost:3000/api/sede?nombre=Norte" \
  -H "Authorization: Bearer $TOKEN"

# Ver detalles completos de una sede
curl -X GET http://localhost:3000/api/sede/{sede_id} \
  -H "Authorization: Bearer $TOKEN"
```

### **Flujo 3: Gestión de Instituciones**

```bash
# 1. Crear institución educativa
curl -X POST http://localhost:3000/api/instituciones \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "IE San Pedro",
    "rector_encargado_id": "{rector_id}"
  }'

# 2. Asignar sede a institución
curl -X POST http://localhost:3000/api/instituciones/{institucion_id}/sedes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sede_id": "{sede_id}"
  }'
```

---

## 🔄 Casos de Prueba

### **Caso 1: Validación de Datos**

```json
// ❌ Error - Datos faltantes
POST /api/sede
{
  "nombre": "",
  "zona": "invalida"
}

// Respuesta esperada:
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "errors": [
    "El nombre de la sede es requerido",
    "La zona debe ser 'urbana' o 'rural'"
  ]
}
```

### **Caso 2: Permisos**

```bash
# ❌ Error - Sin permisos (gestor intentando crear)
curl -X POST http://localhost:3000/api/sede \
  -H "Authorization: Bearer $GESTOR_TOKEN"

# Respuesta esperada: 403 Forbidden
```

### **Caso 3: Sede No Encontrada**

```bash
# ❌ Error - Sede inexistente
curl -X GET http://localhost:3000/api/sede/uuid-inexistente \
  -H "Authorization: Bearer $TOKEN"

# Respuesta esperada:
{
  "success": false,
  "message": "Sede no encontrada",
  "error": "Not Found"
}
```

---

## 🚀 Características Avanzadas

### **Paginación Inteligente**
- Soporte para paginación en todas las consultas
- Ordenamiento por múltiples campos
- Filtros combinables

### **Búsqueda Avanzada**
- Búsqueda parcial por nombre
- Filtros por estado, zona y código DANE
- Combinación de múltiples filtros

### **Integridad Referencial**
- Validación de empleados existentes en asignaciones
- Control de estados coherentes
- Manejo de eliminaciones lógicas

### **Auditoría Completa**
- Registro de todas las acciones
- Trazabilidad de cambios
- Sistema de comentarios para seguimiento

---

## 📝 Notas de Implementación

### **Patrones de Diseño**
- **Controladores especializados** para cada submódulo
- **Middleware de autorización** por rol
- **Validaciones robustas** en entrada
- **Respuestas consistentes** en toda la API

### **Optimizaciones**
- **Consultas eficientes** con Prisma
- **Paginación** para datasets grandes
- **Índices** en campos de búsqueda frecuente
- **Eliminación lógica** para conservar histórico

---

*Documentación del Módulo de Sedes - API SIGED*  
*Última actualización: Octubre 2025*  
*Versión: 1.0.0*