# 📁 SISTEMA DE DOCUMENTOS - DOCUMENTACIÓN COMPLETA

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Módulos de Documentos](#módulos-de-documentos)
4. [Endpoints por Categoría](#endpoints-por-categoría)
5. [Schemas y Validaciones](#schemas-y-validaciones)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Permisos y Roles](#permisos-y-roles)
8. [Casos de Prueba](#casos-de-prueba)

---

## 🎯 Descripción General

El **Sistema de Documentos** de SIGED es una arquitectura modular que gestiona archivos y documentos relacionados con diferentes entidades del sistema educativo, proporcionando trazabilidad, organización y acceso controlado a la información documental.

### 📚 **Categorías de Documentos**

- ✅ **Documentos de Empleados**: HV, licencias, contratos, soportes médicos
- ✅ **Documentos de Actos Administrativos**: Resoluciones y documentos oficiales
- ✅ **Documentos de Horas Extra**: Justificaciones y autorizaciones
- ✅ **Documentos de Suplencias**: Licencias médicas y justificaciones

---

## 🏗️ Arquitectura del Sistema

```
modulos/documentos/
├── 📁 documentos_empleados/           # Documentos de empleados
│   ├── doc.empleado.controller.ts     # HV, contratos, licencias
│   └── doc.empleado.routes.ts         # Rutas específicas
├── 📁 documentos_actos_administrativos/   # Documentos oficiales
│   ├── doc.act.admin.controller.ts    # Resoluciones y actos
│   └── doc.act.admin.routes.ts        # Rutas específicas
├── 📁 documentos.horas.extra/         # Documentos de horas extra
│   ├── doc.horas.extra.controller.ts  # Justificaciones
│   └── doc.horas.extra.routes.ts      # Rutas específicas
└── 📁 documentos_suplencias/          # Documentos de suplencias
    ├── doc.suplencia.controller.ts    # Licencias y justificaciones
    └── doc.suplencia.routes.ts        # Rutas específicas
```

### 🌐 **Integración en el Sistema**

```typescript
// Rutas base para cada categoría
router.use('/api/documentos-empleado', DocumentoEmpleadoRoutes);
router.use('/api/documentos-actos-administrativos', DocumentoActoAdministrativoRoutes);
router.use('/api/documentos-horas-extra', DocumentoHorasExtraRoutes);
router.use('/api/documentos-suplencias', DocumentoSuplenciaRoutes);
```

---

## 📋 Módulos de Documentos

### 👥 **DOCUMENTOS DE EMPLEADOS**

#### **Tipos de Documentos Disponibles**
```http
GET /api/documentos-empleado/tipos
```

**Respuesta**:
```json
{
  "success": true,
  "data": [
    {
      "valor": "HV",
      "descripcion": "Hoja de Vida",
      "ejemplo": "Currículum vitae y documentos de soporte"
    },
    {
      "valor": "LICENCIAS",
      "descripcion": "Licencias y Permisos",
      "ejemplo": "Licencias médicas, maternidad, etc."
    },
    {
      "valor": "CONTRATO",
      "descripcion": "Documentos Contractuales",
      "ejemplo": "Contratos de trabajo, adendos"
    },
    {
      "valor": "SOPORTE_MEDICO",
      "descripcion": "Soportes Médicos",
      "ejemplo": "Certificados médicos, incapacidades"
    }
  ]
}
```

#### **Crear Documento de Empleado**
```http
POST /api/documentos-empleado
```

**Body**:
```json
{
  "empleado_id": "uuid-empleado",
  "tipo_documento": "HV",
  "ruta_archivo": "/documentos/empleados/hv_juan_perez.pdf",
  "descripcion": "Hoja de vida actualizada 2025"
}
```

#### **Obtener Documentos por Empleado**
```http
GET /api/documentos-empleado?empleado_id=uuid&tipo_documento=HV&page=1&limit=10
```

### 📄 **DOCUMENTOS DE ACTOS ADMINISTRATIVOS**

#### **Crear Documento de Acto**
```http
POST /api/documentos-actos-administrativos
```

**Body**:
```json
{
  "acto_id": "uuid-acto",
  "ruta_archivo": "/documentos/actos/resolucion_001_2025.pdf",
  "descripcion": "Resolución de nombramiento"
}
```

#### **Obtener Documentos de Actos**
```http
GET /api/documentos-actos-administrativos?acto_id=uuid&search=resolucion
```

### ⏰ **DOCUMENTOS DE HORAS EXTRA**

#### **Crear Documento de Horas Extra**
```http
POST /api/documentos-horas-extra
```

**Body**:
```json
{
  "horas_extra_id": "uuid-horas-extra",
  "ruta_archivo": "/documentos/horas_extra/autorizacion_marzo_2025.pdf",
  "descripcion": "Autorización de horas extra marzo 2025"
}
```

### 🔄 **DOCUMENTOS DE SUPLENCIAS**

#### **Crear Documento de Suplencia**
```http
POST /api/documentos-suplencias
```

**Body**:
```json
{
  "suplencia_id": "uuid-suplencia",
  "ruta_archivo": "/documentos/suplencias/licencia_medica.pdf",
  "descripcion": "Licencia médica justificativa"
}
```

---

## 🛣️ Endpoints por Categoría

### **📋 Operaciones Comunes (Todos los Módulos)**

Cada módulo de documentos implementa las siguientes operaciones:

#### **➕ Crear Documento**
```http
POST /api/documentos-{categoria}
```
**Permisos**: Todos los roles autenticados

#### **📋 Listar Documentos**
```http
GET /api/documentos-{categoria}?page=1&limit=10&search=texto
```
**Permisos**: Todos los roles autenticados

**Query Parameters Comunes**:
- `page`: Página (default: 1)
- `limit`: Resultados por página (default: 10)
- `search`: Búsqueda en descripción
- `{entidad}_id`: Filtrar por entidad específica

#### **🔍 Obtener Documento por ID**
```http
GET /api/documentos-{categoria}/:id
```
**Permisos**: Todos los roles autenticados

#### **✏️ Actualizar Documento**
```http
PUT /api/documentos-{categoria}/:id
```
**Permisos**: Todos los roles autenticados

#### **🗑️ Eliminar Documento**
```http
DELETE /api/documentos-{categoria}/:id
```
**Permisos**: Solo `super_admin`

### **📊 Estadísticas de Documentos**

#### **Documentos de Empleados**
```http
GET /api/documentos-empleado/estadisticas?empleado_id=uuid
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "totalDocumentos": 15,
    "porTipo": {
      "HV": 3,
      "LICENCIAS": 5,
      "CONTRATO": 4,
      "SOPORTE_MEDICO": 3
    },
    "ultimoDocumento": {
      "fecha": "2025-10-07T12:00:00.000Z",
      "tipo": "LICENCIAS",
      "descripcion": "Licencia médica octubre"
    }
  }
}
```

---

## 📋 Schemas y Validaciones

### **Schema Base de Documento**
```typescript
interface IDocumentoBase {
  id: string;
  ruta_archivo: string;              // Requerida - Path del archivo
  descripcion?: string;              // Opcional - Descripción del documento
  created_at: Date;
  updated_at: Date;
}
```

### **Schemas Específicos**

#### **Documento de Empleado**
```typescript
interface IDocumentoEmpleado extends IDocumentoBase {
  empleado_id: string;               // Requerido - UUID del empleado
  tipo_documento: 'HV' | 'LICENCIAS' | 'CONTRATO' | 'SOPORTE_MEDICO';
}
```

#### **Documento de Acto Administrativo**
```typescript
interface IDocumentoActoAdministrativo extends IDocumentoBase {
  acto_id: string;                   // Requerido - UUID del acto
}
```

#### **Documento de Horas Extra**
```typescript
interface IDocumentoHorasExtra extends IDocumentoBase {
  horas_extra_id: string;            // Requerido - UUID del registro de horas
}
```

#### **Documento de Suplencia**
```typescript
interface IDocumentoSuplencia extends IDocumentoBase {
  suplencia_id: string;              // Requerido - UUID de la suplencia
}
```

### **Validaciones Comunes**

#### **Crear/Actualizar Documento**
- ✅ `{entidad}_id`: UUID válido, entidad debe existir
- ✅ `ruta_archivo`: Requerida, formato de path válido
- ✅ `descripcion`: Opcional, máximo 500 caracteres
- ✅ `tipo_documento`: (Solo empleados) Valor del enum válido

#### **Tipos de Archivo Permitidos**
```typescript
const TIPOS_ARCHIVO_PERMITIDOS = [
  '.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.xls', '.xlsx'
];
```

---

## 🔐 Permisos y Roles

### **Matriz de Permisos (Aplicable a Todos los Módulos)**

| Acción | super_admin | admin | gestor |
|--------|-------------|--------|--------|
| Ver documentos | ✅ | ✅ | ✅ |
| Crear documento | ✅ | ✅ | ✅ |
| Actualizar documento | ✅ | ✅ | ✅ |
| Eliminar documento | ✅ | ❌ | ❌ |
| Ver estadísticas | ✅ | ✅ | ✅ |

### **Restricciones Especiales**
- **Eliminación**: Solo super_admin puede eliminar documentos
- **Integridad**: No se pueden crear documentos para entidades inexistentes
- **Auditoría**: Todas las operaciones se registran en logs

---

## 🧪 Ejemplos de Uso Completos

### **Flujo 1: Gestión de Documentos de Empleado**

```bash
# 1. Ver tipos de documentos disponibles
curl -X GET http://localhost:3000/api/documentos-empleado/tipos \
  -H "Authorization: Bearer $TOKEN"

# 2. Crear documento de hoja de vida
curl -X POST http://localhost:3000/api/documentos-empleado \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "empleado_id": "uuid-empleado",
    "tipo_documento": "HV",
    "ruta_archivo": "/docs/empleados/hv_maria_gonzalez.pdf",
    "descripcion": "Hoja de vida actualizada con últimos estudios"
  }'

# 3. Ver documentos del empleado
curl -X GET "http://localhost:3000/api/documentos-empleado?empleado_id=uuid-empleado&tipo_documento=HV" \
  -H "Authorization: Bearer $TOKEN"

# 4. Obtener estadísticas del empleado
curl -X GET "http://localhost:3000/api/documentos-empleado/estadisticas?empleado_id=uuid-empleado" \
  -H "Authorization: Bearer $TOKEN"
```

### **Flujo 2: Documentos de Actos Administrativos**

```bash
# 1. Crear documento de resolución
curl -X POST http://localhost:3000/api/documentos-actos-administrativos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "acto_id": "uuid-acto",
    "ruta_archivo": "/docs/actos/resolucion_nombramiento_001.pdf",
    "descripcion": "Resolución de nombramiento en propiedad"
  }'

# 2. Buscar documentos por palabra clave
curl -X GET "http://localhost:3000/api/documentos-actos-administrativos?search=nombramiento" \
  -H "Authorization: Bearer $TOKEN"

# 3. Ver detalles de un documento específico
curl -X GET http://localhost:3000/api/documentos-actos-administrativos/{doc_id} \
  -H "Authorization: Bearer $TOKEN"
```

### **Flujo 3: Documentos de Horas Extra**

```bash
# 1. Crear documento de autorización
curl -X POST http://localhost:3000/api/documentos-horas-extra \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "horas_extra_id": "uuid-horas-extra",
    "ruta_archivo": "/docs/horas_extra/autorizacion_octubre_2025.pdf",
    "descripcion": "Autorización de horas extra para proyecto especial"
  }'

# 2. Ver documentos de horas extra específicas
curl -X GET "http://localhost:3000/api/documentos-horas-extra?horas_extra_id=uuid-horas-extra" \
  -H "Authorization: Bearer $TOKEN"

# 3. Actualizar descripción del documento
curl -X PUT http://localhost:3000/api/documentos-horas-extra/{doc_id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "descripcion": "Autorización aprobada para horas extra nocturnas"
  }'
```

### **Flujo 4: Documentos de Suplencias**

```bash
# 1. Crear documento de licencia médica
curl -X POST http://localhost:3000/api/documentos-suplencias \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "suplencia_id": "uuid-suplencia",
    "ruta_archivo": "/docs/suplencias/licencia_medica_15_dias.pdf",
    "descripcion": "Licencia médica por 15 días calendario"
  }'

# 2. Ver todos los documentos de una suplencia
curl -X GET "http://localhost:3000/api/documentos-suplencias?suplencia_id=uuid-suplencia" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔄 Casos de Prueba

### **Caso 1: Validación de Entidad**

```bash
# ❌ Error - Empleado inexistente
curl -X POST http://localhost:3000/api/documentos-empleado \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "empleado_id": "uuid-inexistente",
    "tipo_documento": "HV",
    "ruta_archivo": "/docs/test.pdf"
  }'

# Respuesta esperada: 400 Bad Request
{
  "success": false,
  "message": "El empleado especificado no existe",
  "error": "Employee Not Found"
}
```

### **Caso 2: Tipo de Documento Inválido**

```json
// ❌ Error - Tipo no válido para empleados
POST /api/documentos-empleado
{
  "empleado_id": "uuid-valido",
  "tipo_documento": "TIPO_INVALIDO",
  "ruta_archivo": "/docs/test.pdf"
}

// Respuesta esperada:
{
  "success": false,
  "message": "Tipo de documento inválido",
  "error": "Invalid Document Type"
}
```

### **Caso 3: Archivo Sin Ruta**

```json
// ❌ Error - Ruta de archivo faltante
POST /api/documentos-empleado
{
  "empleado_id": "uuid-valido",
  "tipo_documento": "HV"
}

// Respuesta esperada:
{
  "success": false,
  "message": "La ruta del archivo es requerida",
  "error": "Missing File Path"
}
```

### **Caso 4: Permisos de Eliminación**

```bash
# ❌ Error - Admin intentando eliminar documento
curl -X DELETE http://localhost:3000/api/documentos-empleado/{doc_id} \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Respuesta esperada: 403 Forbidden
{
  "success": false,
  "message": "Solo super_admin puede eliminar documentos",
  "error": "Insufficient Permissions"
}
```

---

## 🚀 Características Avanzadas

### **Búsqueda Unificada**
- Búsqueda de texto en descripciones
- Filtros por tipo de documento (empleados)
- Filtros por entidad específica
- Ordenamiento por fecha

### **Estadísticas Detalladas**
- Conteo por tipos de documento
- Documentos más recientes
- Análisis por empleado/entidad

### **Integridad Referencial**
- Validación de existencia de entidades
- Control de eliminación en cascada
- Mantenimiento de consistencia

### **Auditoría Completa**
- Registro de todas las operaciones
- Trazabilidad de cambios
- Logs de acceso a documentos

---

## 📝 Mejores Prácticas

### **Organización de Archivos**
```bash
# Estructura recomendada de directorios
/documentos/
├── empleados/
│   ├── hv/
│   ├── licencias/
│   ├── contratos/
│   └── soportes_medicos/
├── actos_administrativos/
├── horas_extra/
└── suplencias/
```

### **Nomenclatura de Archivos**
```bash
# Empleados
hv_{nombre}_{apellido}_{fecha}.pdf
contrato_{documento}_{fecha}.pdf
licencia_{tipo}_{fecha_inicio}_{fecha_fin}.pdf

# Actos administrativos  
resolucion_{numero}_{año}.pdf
acto_{tipo}_{fecha}.pdf

# Horas extra
autorizacion_{mes}_{año}_{empleado}.pdf

# Suplencias
licencia_{motivo}_{fecha_inicio}.pdf
```

### **Control de Versiones**
- Incluir fecha en nombres de archivo
- Mantener historial de versiones
- Descripción detallada de cambios

---

*Documentación del Sistema de Documentos - API SIGED*  
*Última actualización: Octubre 2025*  
*Versión: 1.0.0 - Sistema modular de gestión documental*