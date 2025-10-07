# 🎓 MÓDULO DE INFORMACIÓN ACADÉMICA - DOCUMENTACIÓN COMPLETA

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Módulo](#arquitectura-del-módulo)
3. [Endpoints de Información Académica](#endpoints-de-información-académica)
4. [Niveles Académicos](#niveles-académicos)
5. [Schemas y Validaciones](#schemas-y-validaciones)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Permisos y Roles](#permisos-y-roles)
8. [Casos de Prueba](#casos-de-prueba)

---

## 🎯 Descripción General

El **Módulo de Información Académica** gestiona los registros educativos y de formación profesional de los empleados del sistema SIGED, manteniendo un historial completo de títulos, certificaciones y estudios realizados.

### 📚 **Funcionalidades Principales**

- ✅ **Gestión de Títulos**: Registro de títulos universitarios y postgrados
- ✅ **Certificaciones**: Control de cursos, diplomados y especializaciones
- ✅ **Niveles Académicos**: Sistema estandarizado de niveles educativos
- ✅ **Instituciones**: Registro de instituciones educativas emisoras
- ✅ **Fechas de Graduación**: Control temporal de logros académicos
- ✅ **Auditoría Académica**: Trazabilidad de cambios y actualizaciones

---

## 🏗️ Arquitectura del Módulo

```
modulos/informacion.academica/
├── 📁 informacion.academica.controller.ts    # Controlador principal
├── 📁 informacion.academica.routes.ts        # Rutas del módulo
└── 📁 [relacionados]
    ├── empleado/                             # Integración con empleados
    └── documentos/documentos_empleados/      # Documentos de soporte
```

### 🌐 **Integración en el Sistema**

```typescript
// Base path: /api/informacion-academica
router.use('/api/informacion-academica', InformacionAcademicaRoutes.routes);

// Integración con empleados:
// - Cada empleado puede tener múltiples registros académicos
// - Los rectores requieren validación académica específica
```

---

## 🛣️ Endpoints de Información Académica

### **📚 Obtener Niveles Académicos Disponibles**
```http
GET /api/informacion-academica/niveles
```
**Permisos**: Todos los roles autenticados

**Respuesta**:
```json
{
  "success": true,
  "data": [
    {
      "valor": "BACHILLERATO",
      "descripcion": "Bachillerato",
      "orden": 1
    },
    {
      "valor": "TECNICO",
      "descripcion": "Técnico",
      "orden": 2
    },
    {
      "valor": "TECNOLOGO",
      "descripcion": "Tecnólogo",
      "orden": 3
    },
    {
      "valor": "PROFESIONAL",
      "descripcion": "Profesional Universitario",
      "orden": 4
    },
    {
      "valor": "ESPECIALIZACION",
      "descripcion": "Especialización",
      "orden": 5
    },
    {
      "valor": "MAESTRIA",
      "descripcion": "Maestría",
      "orden": 6
    },
    {
      "valor": "DOCTORADO",
      "descripcion": "Doctorado",
      "orden": 7
    }
  ]
}
```

### **➕ Crear Información Académica**
```http
POST /api/informacion-academica
```
**Permisos**: Todos los roles autenticados

**Body**:
```json
{
  "empleado_id": "uuid-empleado",
  "nivel_academico": "PROFESIONAL",
  "titulo": "Licenciatura en Matemáticas",
  "institucion": "Universidad Nacional de Colombia",
  "fecha_graduacion": "2020-12-15",
  "numero_diploma": "MAT-2020-001234"
}
```

**Respuesta Exitosa**:
```json
{
  "success": true,
  "message": "Información académica creada exitosamente",
  "data": {
    "id": "uuid-info-academica",
    "empleado_id": "uuid-empleado",
    "nivel_academico": "PROFESIONAL",
    "titulo": "Licenciatura en Matemáticas",
    "institucion": "Universidad Nacional de Colombia",
    "fecha_graduacion": "2020-12-15T00:00:00.000Z",
    "numero_diploma": "MAT-2020-001234",
    "created_at": "2025-10-07T12:00:00.000Z"
  }
}
```

### **📋 Obtener Información Académica**
```http
GET /api/informacion-academica?page=1&limit=10&empleado_id=uuid&nivel_academico=PROFESIONAL
```
**Permisos**: Todos los roles autenticados

**Query Parameters**:
- `page`: Página (default: 1)
- `limit`: Resultados por página (default: 10)
- `empleado_id`: Filtrar por empleado específico
- `nivel_academico`: Filtrar por nivel académico
- `institucion`: Búsqueda por institución
- `titulo`: Búsqueda parcial en título
- `search`: Búsqueda general en título e institución

**Respuesta**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-info-academica",
      "empleado": {
        "id": "uuid-empleado",
        "nombre": "María Elena",
        "apellido": "González",
        "documento": "87654321",
        "cargo": "Docente"
      },
      "nivel_academico": "PROFESIONAL",
      "titulo": "Licenciatura en Matemáticas",
      "institucion": "Universidad Nacional de Colombia",
      "fecha_graduacion": "2020-12-15T00:00:00.000Z",
      "numero_diploma": "MAT-2020-001234",
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

### **🔍 Obtener Información Académica por ID**
```http
GET /api/informacion-academica/:id
```
**Permisos**: Todos los roles autenticados

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-info-academica",
    "empleado": {
      "id": "uuid-empleado",
      "nombre": "María Elena",
      "apellido": "González",
      "documento": "87654321",
      "tipo_documento": "CC",
      "email": "maria.gonzalez@example.com",
      "cargo": "Docente",
      "estado": "activo"
    },
    "nivel_academico": "PROFESIONAL",
    "titulo": "Licenciatura en Matemáticas",
    "institucion": "Universidad Nacional de Colombia",
    "fecha_graduacion": "2020-12-15T00:00:00.000Z",
    "numero_diploma": "MAT-2020-001234",
    "created_at": "2025-10-07T12:00:00.000Z",
    "updated_at": "2025-10-07T12:00:00.000Z"
  }
}
```

### **👥 Obtener Información Académica por Empleado**
```http
GET /api/informacion-academica/empleado/:empleado_id
```
**Permisos**: Todos los roles autenticados

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "empleado": {
      "id": "uuid-empleado",
      "nombre": "María Elena",
      "apellido": "González",
      "documento": "87654321",
      "cargo": "Docente"
    },
    "formacionAcademica": [
      {
        "id": "uuid-bachillerato",
        "nivel_academico": "BACHILLERATO",
        "titulo": "Bachiller Académico",
        "institucion": "Colegio San José",
        "fecha_graduacion": "2015-11-30T00:00:00.000Z"
      },
      {
        "id": "uuid-profesional",
        "nivel_academico": "PROFESIONAL",
        "titulo": "Licenciatura en Matemáticas",
        "institucion": "Universidad Nacional de Colombia",
        "fecha_graduacion": "2020-12-15T00:00:00.000Z",
        "numero_diploma": "MAT-2020-001234"
      },
      {
        "id": "uuid-especializacion",
        "nivel_academico": "ESPECIALIZACION",
        "titulo": "Especialización en Didáctica de las Matemáticas",
        "institucion": "Universidad Pedagógica Nacional",
        "fecha_graduacion": "2022-06-20T00:00:00.000Z"
      }
    ],
    "estadisticas": {
      "totalRegistros": 3,
      "nivelMasAlto": "ESPECIALIZACION",
      "ultimaFormacion": "2022-06-20T00:00:00.000Z"
    }
  }
}
```

### **✏️ Actualizar Información Académica**
```http
PUT /api/informacion-academica/:id
```
**Permisos**: Todos los roles autenticados

**Body**:
```json
{
  "titulo": "Licenciatura en Matemáticas y Física",
  "numero_diploma": "MAT-FIS-2020-001234"
}
```

### **🗑️ Eliminar Información Académica**
```http
DELETE /api/informacion-academica/:id
```
**Permisos**: Solo `super_admin`

**Respuesta**:
```json
{
  "success": true,
  "message": "Información académica eliminada exitosamente"
}
```

### **📊 Estadísticas Generales**
```http
GET /api/informacion-academica/estadisticas
```
**Permisos**: `super_admin`, `admin`

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "totalRegistros": 156,
    "porNivel": {
      "BACHILLERATO": 45,
      "TECNICO": 23,
      "TECNOLOGO": 18,
      "PROFESIONAL": 42,
      "ESPECIALIZACION": 20,
      "MAESTRIA": 7,
      "DOCTORADO": 1
    },
    "institucionesMasFrecuentes": [
      {
        "institucion": "Universidad Nacional de Colombia",
        "cantidad": 28
      },
      {
        "institucion": "Universidad Pedagógica Nacional",
        "cantidad": 19
      }
    ],
    "empleadosConMayorFormacion": [
      {
        "empleado": "Dr. Carlos Mendoza",
        "niveles": 4,
        "nivelMasAlto": "DOCTORADO"
      }
    ]
  }
}
```

---

## 🎓 Niveles Académicos

### **Jerarquía de Niveles**

| Orden | Nivel | Descripción | Ejemplos |
|-------|-------|-------------|----------|
| 1 | **BACHILLERATO** | Educación secundaria | Bachiller Académico, Bachiller Técnico |
| 2 | **TECNICO** | Formación técnica | Técnico en Sistemas, Técnico Administrativo |
| 3 | **TECNOLOGO** | Tecnología superior | Tecnólogo en Gestión Educativa |
| 4 | **PROFESIONAL** | Universidad | Licenciatura, Ingeniería, Medicina |
| 5 | **ESPECIALIZACION** | Postgrado especializado | Especialización en Educación |
| 6 | **MAESTRIA** | Maestría | Magíster en Educación, MBA |
| 7 | **DOCTORADO** | Nivel doctoral | Ph.D., Doctorado en Educación |

### **Validaciones por Nivel**

#### **BACHILLERATO**
- Título requerido
- Institución educativa válida
- Fecha de graduación coherente

#### **PROFESIONAL**
- Título universitario específico
- Universidad reconocida
- Número de diploma opcional pero recomendado

#### **POSTGRADO (Especialización, Maestría, Doctorado)**
- Requiere título profesional previo
- Universidad con programas de postgrado
- Validación de prerrequisitos académicos

---

## 📋 Schemas y Validaciones

### **Modelo de Información Académica**
```typescript
interface IInformacionAcademica {
  id: string;
  empleado_id: string;              // Requerido - UUID del empleado
  nivel_academico: NivelAcademico;  // Requerido - Enum de niveles
  titulo: string;                   // Requerido - Nombre del título
  institucion: string;              // Requerida - Institución emisora
  fecha_graduacion: Date;           // Requerida - Fecha de graduación
  numero_diploma?: string;          // Opcional - Número de diploma/acta
  created_at: Date;
  updated_at: Date;
}
```

### **Enum de Niveles Académicos**
```typescript
enum NivelAcademico {
  BACHILLERATO = 'BACHILLERATO',
  TECNICO = 'TECNICO',
  TECNOLOGO = 'TECNOLOGO',
  PROFESIONAL = 'PROFESIONAL',
  ESPECIALIZACION = 'ESPECIALIZACION',
  MAESTRIA = 'MAESTRIA',
  DOCTORADO = 'DOCTORADO'
}
```

### **Validaciones de Entrada**

#### **Crear/Actualizar Información Académica**
- ✅ `empleado_id`: UUID válido, empleado debe existir y estar activo
- ✅ `nivel_academico`: Debe ser uno de los valores del enum
- ✅ `titulo`: Requerido, no vacío, máximo 200 caracteres
- ✅ `institucion`: Requerida, no vacía, máximo 150 caracteres
- ✅ `fecha_graduacion`: Fecha válida, no futura, posterior a 1950
- ✅ `numero_diploma`: Opcional, máximo 50 caracteres

#### **Validaciones de Negocio**
- Un empleado no puede tener títulos duplicados exactos
- Las fechas deben ser coherentes (postgrado posterior a pregrado)
- Los rectores deben tener al menos título profesional

---

## 🔐 Permisos y Roles

| Acción | super_admin | admin | gestor |
|--------|-------------|--------|--------|
| **Información Académica** |
| Ver información | ✅ | ✅ | ✅ |
| Crear registro | ✅ | ✅ | ✅ |
| Actualizar registro | ✅ | ✅ | ✅ |
| Eliminar registro | ✅ | ❌ | ❌ |
| Ver estadísticas generales | ✅ | ✅ | ❌ |
| **Niveles Académicos** |
| Ver niveles disponibles | ✅ | ✅ | ✅ |

---

## 🧪 Ejemplos de Uso Completos

### **Flujo 1: Registrar Formación Académica Completa**

```bash
# 1. Ver niveles académicos disponibles
curl -X GET http://localhost:3000/api/informacion-academica/niveles \
  -H "Authorization: Bearer $TOKEN"

# 2. Registrar bachillerato
curl -X POST http://localhost:3000/api/informacion-academica \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "empleado_id": "uuid-empleado",
    "nivel_academico": "BACHILLERATO",
    "titulo": "Bachiller Académico",
    "institucion": "Colegio San José de Bogotá",
    "fecha_graduacion": "2015-11-30"
  }'

# 3. Registrar título profesional
curl -X POST http://localhost:3000/api/informacion-academica \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "empleado_id": "uuid-empleado",
    "nivel_academico": "PROFESIONAL",
    "titulo": "Licenciatura en Matemáticas",
    "institucion": "Universidad Nacional de Colombia",
    "fecha_graduacion": "2020-12-15",
    "numero_diploma": "MAT-2020-001234"
  }'

# 4. Registrar especialización
curl -X POST http://localhost:3000/api/informacion-academica \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "empleado_id": "uuid-empleado",
    "nivel_academico": "ESPECIALIZACION",
    "titulo": "Especialización en Didáctica de las Matemáticas",
    "institucion": "Universidad Pedagógica Nacional",
    "fecha_graduacion": "2022-06-20"
  }'
```

### **Flujo 2: Consultar y Filtrar**

```bash
# Ver toda la información académica de un empleado
curl -X GET http://localhost:3000/api/informacion-academica/empleado/{empleado_id} \
  -H "Authorization: Bearer $TOKEN"

# Buscar por nivel académico específico
curl -X GET "http://localhost:3000/api/informacion-academica?nivel_academico=PROFESIONAL&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"

# Buscar por institución
curl -X GET "http://localhost:3000/api/informacion-academica?institucion=Universidad Nacional" \
  -H "Authorization: Bearer $TOKEN"

# Búsqueda general
curl -X GET "http://localhost:3000/api/informacion-academica?search=matemáticas" \
  -H "Authorization: Bearer $TOKEN"
```

### **Flujo 3: Actualizar y Gestionar**

```bash
# Actualizar información de un registro
curl -X PUT http://localhost:3000/api/informacion-academica/{id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Licenciatura en Matemáticas y Física",
    "numero_diploma": "MAT-FIS-2020-001234"
  }'

# Ver detalles específicos de un registro
curl -X GET http://localhost:3000/api/informacion-academica/{id} \
  -H "Authorization: Bearer $TOKEN"
```

### **Flujo 4: Estadísticas (Admin)**

```bash
# Ver estadísticas generales del sistema
curl -X GET http://localhost:3000/api/informacion-academica/estadisticas \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 🔄 Casos de Prueba

### **Caso 1: Validación de Empleado**

```bash
# ❌ Error - Empleado inexistente
curl -X POST http://localhost:3000/api/informacion-academica \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "empleado_id": "uuid-inexistente",
    "nivel_academico": "PROFESIONAL",
    "titulo": "Licenciatura en Matemáticas"
  }'

# Respuesta esperada: 400 Bad Request
{
  "success": false,
  "message": "El empleado especificado no existe",
  "error": "Employee Not Found"
}
```

### **Caso 2: Nivel Académico Inválido**

```json
// ❌ Error - Nivel no válido
POST /api/informacion-academica
{
  "empleado_id": "uuid-valido",
  "nivel_academico": "NIVEL_INVALIDO",
  "titulo": "Algún título"
}

// Respuesta esperada:
{
  "success": false,
  "message": "Nivel académico inválido",
  "error": "Invalid Academic Level"
}
```

### **Caso 3: Fecha Futura**

```json
// ❌ Error - Fecha de graduación en el futuro
POST /api/informacion-academica
{
  "empleado_id": "uuid-valido",
  "nivel_academico": "PROFESIONAL",
  "titulo": "Licenciatura en Matemáticas",
  "fecha_graduacion": "2030-12-15"
}

// Respuesta esperada:
{
  "success": false,
  "message": "La fecha de graduación no puede ser futura",
  "error": "Invalid Graduation Date"
}
```

### **Caso 4: Permisos de Eliminación**

```bash
# ❌ Error - Admin intentando eliminar
curl -X DELETE http://localhost:3000/api/informacion-academica/{id} \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Respuesta esperada: 403 Forbidden
{
  "success": false,
  "message": "Solo super_admin puede eliminar información académica",
  "error": "Insufficient Permissions"
}
```

---

## 🚀 Características Avanzadas

### **Validación de Progresión Académica**
- Control de secuencia lógica en niveles
- Validación de fechas coherentes
- Prevención de duplicados

### **Búsqueda Inteligente**
- Búsqueda en títulos e instituciones
- Filtros combinables
- Ordenamiento por nivel y fecha

### **Estadísticas Detalladas**
- Distribución por niveles académicos
- Instituciones más frecuentes
- Análisis de formación por empleado

### **Integración con Empleados**
- Validación automática para rectores
- Historial académico completo
- Soporte para múltiples títulos

---

## 📝 Casos de Uso Típicos

### **Docente Nuevo**
1. Registrar bachillerato
2. Registrar título profesional (licenciatura)
3. Opcional: Agregar especializaciones o maestría
4. Asociar documentos de soporte

### **Rector**
1. Validar título profesional mínimo requerido
2. Preferiblemente postgrado en educación
3. Documentar experiencia administrativa
4. Mantener actualizada la información

### **Empleado Administrativo**
1. Registrar nivel técnico o profesional según cargo
2. Agregar certificaciones relevantes
3. Actualizar con cursos de capacitación
4. Mantener coherencia con funciones

---

*Documentación del Módulo de Información Académica - API SIGED*  
*Última actualización: Octubre 2025*  
*Versión: 1.0.0 - Gestión integral de formación académica*