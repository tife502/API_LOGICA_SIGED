# 🌐 API ENDPOINTS REFERENCE - SIGED

## 📋 Tabla de Contenidos

1. [Información General](#información-general)
2. [Autenticación](#autenticación)
3. [Usuarios](#usuarios)
4. [Empleados](#empleados)
5. [Sedes](#sedes)
6. [Actos Administrativos](#actos-administrativos)
7. [Horas Extra](#horas-extra)
8. [Suplencias](#suplencias)
9. [Documentos](#documentos)
10. [Información Académica](#información-académica)
11. [Códigos de Respuesta](#códigos-de-respuesta)

---

## 🎯 Información General

**Base URL**: `http://localhost:3000/api`  
**Formato**: JSON  
**Autenticación**: JWT Bearer Token  
**Versión**: 1.0.0

### **Headers Comunes**

```http
Content-Type: application/json
Authorization: Bearer {access_token}
```

### **Estructura de Respuesta**

```json
{
  "success": boolean,
  "message": string,
  "data": object | array,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

---

## 🔐 Autenticación

### **Login**
```http
POST /auth/login
```
**Body**:
```json
{
  "documento": "12345678",
  "contrasena": "MiContrasena123"
}
```

### **Refresh Token**
```http
POST /auth/refresh
```
**Headers**: `Authorization: Bearer {refresh_token}`

### **Usuario Actual**
```http
GET /auth/me
```

### **Logout**
```http
POST /auth/logout
```

### **Cambiar Contraseña**
```http
POST /auth/change-password
```
**Body**:
```json
{
  "contrasenaActual": "actual",
  "nuevaContrasena": "nueva"
}
```

---

## 👥 Usuarios

### **Crear Usuario**
```http
POST /usuario
```
**Permisos**: `super_admin`, `admin`
**Body**:
```json
{
  "tipo_documento": "CC",
  "documento": "12345678",
  "nombre": "Juan Carlos",
  "apellido": "Pérez García",
  "email": "juan.perez@example.com",
  "celular": "3001234567",
  "contrasena": "MiContrasena123",
  "rol": "gestor"
}
```

### **Listar Usuarios**
```http
GET /usuario?page=1&limit=10&rol=gestor&estado=activo
```
**Permisos**: `super_admin`, `admin`

### **Usuario por ID**
```http
GET /usuario/:id
```

### **Actualizar Usuario**
```http
PUT /usuario/:id
```

### **Eliminar Usuario**
```http
DELETE /usuario/:id
```
**Permisos**: `super_admin`, `admin`

### **Reactivar Usuario**
```http
PUT /usuario/:id/reactivar
```

### **Cambiar Contraseña**
```http
PATCH /usuario/:id/cambiar-contrasena
```

### **Recuperación de Contraseña**

#### **Solicitar Código**
```http
POST /usuario/solicitar-codigo
```
**Público**
**Body**:
```json
{
  "documento": "12345678"
}
```

#### **Verificar Código**
```http
POST /usuario/verificar-codigo
```
**Público**
**Body**:
```json
{
  "documento": "12345678",
  "codigo": "123456",
  "nuevaContrasena": "NuevaContrasena123"
}
```

#### **Reenviar Código**
```http
POST /usuario/reenviar-codigo
```
**Público**

### **Usuario Inicial**
```http
POST /usuario/create-initial-user
```
**Público** (solo si no existen usuarios)

---

## 👨‍🏫 Empleados

### **Crear Empleado**
```http
POST /empleado
```
**Body**:
```json
{
  "tipo_documento": "CC",
  "documento": "87654321",
  "nombre": "María Elena",
  "apellido": "González",
  "email": "maria.gonzalez@example.com",
  "telefono": "3109876543",
  "cargo": "Docente",
  "fecha_nacimiento": "1985-05-15",
  "estado_civil": "Soltero",
  "genero": "Femenino",
  "direccion": "Carrera 15 # 25-30"
}
```

### **Listar Empleados**
```http
GET /empleado?page=1&limit=10&cargo=Docente&estado=activo
```

### **Empleado por ID**
```http
GET /empleado/:id
```

### **Actualizar Empleado**
```http
PUT /empleado/:id
```

### **Eliminar Empleado**
```http
DELETE /empleado/:id
```

### **Empleados Inactivos**
```http
GET /empleado/inactivos
```

### **Reactivar Empleado**
```http
PUT /empleado/:id/reactivar
```

### **Horas Extra por Empleado**
```http
GET /empleado/:empleadoId/horas-extra
```

### **Métodos Especializados**

#### **Empleado Normal**
```http
POST /empleado/normal/crear-con-sede
```

#### **Rector Completo**
```http
POST /empleado/rector/crear-completo
```

---

## 🏫 Sedes

### **Crear Sede**
```http
POST /sede
```
**Permisos**: `super_admin`, `admin`
**Body**:
```json
{
  "nombre": "Sede Norte",
  "zona": "urbana",
  "direccion": "Calle 80 # 15-20",
  "codigo_DANE": "111001000002",
  "comentario": "Nueva sede en zona norte"
}
```

### **Listar Sedes**
```http
GET /sede?page=1&limit=10&estado=activa&zona=urbana
```

### **Sede por ID**
```http
GET /sede/:id
```

### **Actualizar Sede**
```http
PUT /sede/:id
```

### **Eliminar Sede**
```http
DELETE /sede/:id
```
**Permisos**: `super_admin`

### **Asignaciones de Empleados**

#### **Crear Asignación**
```http
POST /sede/:sede_id/asignaciones
```
**Body**:
```json
{
  "empleado_id": "uuid-empleado",
  "fecha_asignacion": "2025-10-07"
}
```

#### **Listar Asignaciones**
```http
GET /sede/:sede_id/asignaciones
```

#### **Finalizar Asignación**
```http
PUT /sede/:sede_id/asignaciones/:id/finalizar
```

### **Comentarios de Sede**

#### **Crear Comentario**
```http
POST /sede/:sede_id/comentarios
```
**Body**:
```json
{
  "observacion": "Necesita mantenimiento"
}
```

#### **Listar Comentarios**
```http
GET /sede/:sede_id/comentarios
```

### **Jornadas**

#### **Crear Jornada**
```http
POST /sede/:sede_id/jornadas
```

#### **Listar Jornadas de Sede**
```http
GET /sede/:sede_id/jornadas
```

#### **Jornadas Globales**
```http
GET /jornadas
```

---

## 🏛️ Instituciones Educativas

### **Crear Institución**
```http
POST /instituciones
```
**Permisos**: `super_admin`, `admin`

### **Listar Instituciones**
```http
GET /instituciones
```

### **Institución por ID**
```http
GET /instituciones/:id
```

### **Actualizar Institución**
```http
PUT /instituciones/:id
```

### **Eliminar Institución**
```http
DELETE /instituciones/:id
```

### **Asignar Sede**
```http
POST /instituciones/:id/sedes
```
**Body**:
```json
{
  "sede_id": "uuid-sede"
}
```

---

## 📄 Actos Administrativos

### **Crear Acto**
```http
POST /actos-administrativos
```
**Body**:
```json
{
  "numero_acto": "001-2025",
  "titulo": "Resolución de Nombramiento",
  "descripcion": "Nombramiento en propiedad"
}
```

### **Listar Actos**
```http
GET /actos-administrativos?page=1&limit=10&search=nombramiento
```

### **Acto por ID**
```http
GET /actos-administrativos/:id
```

### **Actualizar Acto**
```http
PUT /actos-administrativos/:id
```

### **Eliminar Acto**
```http
DELETE /actos-administrativos/:id
```
**Permisos**: `super_admin`

---

## ⏰ Horas Extra

### **Crear Horas Extra**
```http
POST /horas-extra
```
**Body**:
```json
{
  "empleado_id": "uuid-empleado",
  "sede_id": "uuid-sede",
  "jornada": "nocturna",
  "fecha": "2025-10-07",
  "horas_trabajadas": 4,
  "tarifa_por_hora": 15000,
  "observaciones": "Horas extra por evento especial"
}
```

### **Listar Horas Extra**
```http
GET /horas-extra?page=1&limit=10&empleado_id=uuid&jornada=nocturna
```

### **Horas Extra por ID**
```http
GET /horas-extra/:id
```

### **Actualizar Horas Extra**
```http
PUT /horas-extra/:id
```

### **Eliminar Horas Extra**
```http
DELETE /horas-extra/:id
```
**Permisos**: `super_admin`

### **Estadísticas**
```http
GET /horas-extra/estadisticas?empleado_id=uuid&fecha_desde=2025-10-01
```

---

## 🔄 Suplencias

### **Jornadas Disponibles**
```http
GET /suplencias/jornadas
```

### **Crear Suplencia**
```http
POST /suplencias
```
**Body**:
```json
{
  "empleado_suplente_id": "uuid-suplente",
  "empleado_suplido_id": "uuid-suplido",
  "sede_id": "uuid-sede",
  "jornada": "mañana",
  "fecha_inicio": "2025-10-07",
  "fecha_fin": "2025-10-14",
  "observaciones": "Suplencia por licencia médica"
}
```

### **Listar Suplencias**
```http
GET /suplencias?page=1&limit=10&empleado_suplente_id=uuid
```

### **Suplencia por ID**
```http
GET /suplencias/:id
```

### **Actualizar Suplencia**
```http
PUT /suplencias/:id
```

### **Eliminar Suplencia**
```http
DELETE /suplencias/:id
```
**Permisos**: `super_admin`

---

## 📁 Documentos

### **Documentos de Empleados**

#### **Tipos Disponibles**
```http
GET /documentos-empleado/tipos
```

#### **Crear Documento**
```http
POST /documentos-empleado
```
**Body**:
```json
{
  "empleado_id": "uuid-empleado",
  "tipo_documento": "HV",
  "ruta_archivo": "/docs/hv_empleado.pdf",
  "descripcion": "Hoja de vida actualizada"
}
```

#### **Listar Documentos**
```http
GET /documentos-empleado?empleado_id=uuid&tipo_documento=HV
```

#### **Estadísticas**
```http
GET /documentos-empleado/estadisticas?empleado_id=uuid
```

### **Documentos de Actos Administrativos**

#### **Crear Documento**
```http
POST /documentos-actos-administrativos
```

#### **Listar Documentos**
```http
GET /documentos-actos-administrativos?acto_id=uuid
```

### **Documentos de Horas Extra**

#### **Crear Documento**
```http
POST /documentos-horas-extra
```

#### **Listar Documentos**
```http
GET /documentos-horas-extra?horas_extra_id=uuid
```

### **Documentos de Suplencias**

#### **Crear Documento**
```http
POST /documentos-suplencias
```

#### **Listar Documentos**
```http
GET /documentos-suplencias?suplencia_id=uuid
```

### **Operaciones Comunes para Todos los Documentos**

#### **Documento por ID**
```http
GET /documentos-{categoria}/:id
```

#### **Actualizar Documento**
```http
PUT /documentos-{categoria}/:id
```

#### **Eliminar Documento**
```http
DELETE /documentos-{categoria}/:id
```
**Permisos**: `super_admin`

---

## 🎓 Información Académica

### **Niveles Académicos**
```http
GET /informacion-academica/niveles
```

### **Crear Información Académica**
```http
POST /informacion-academica
```
**Body**:
```json
{
  "empleado_id": "uuid-empleado",
  "nivel_academico": "PROFESIONAL",
  "titulo": "Licenciatura en Matemáticas",
  "institucion": "Universidad Nacional",
  "fecha_graduacion": "2020-12-15",
  "numero_diploma": "MAT-2020-001234"
}
```

### **Listar Información Académica**
```http
GET /informacion-academica?empleado_id=uuid&nivel_academico=PROFESIONAL
```

### **Por ID**
```http
GET /informacion-academica/:id
```

### **Por Empleado**
```http
GET /informacion-academica/empleado/:empleado_id
```

### **Actualizar**
```http
PUT /informacion-academica/:id
```

### **Eliminar**
```http
DELETE /informacion-academica/:id
```
**Permisos**: `super_admin`

### **Estadísticas Generales**
```http
GET /informacion-academica/estadisticas
```
**Permisos**: `super_admin`, `admin`

---

## 📊 Códigos de Respuesta

### **Códigos de Éxito**
| Código | Descripción | Uso |
|--------|-------------|-----|
| **200** | OK | Consulta exitosa |
| **201** | Created | Recurso creado |
| **204** | No Content | Eliminación exitosa |

### **Códigos de Error del Cliente**
| Código | Descripción | Causa Común |
|--------|-------------|-------------|
| **400** | Bad Request | Datos inválidos en el body |
| **401** | Unauthorized | Token faltante o inválido |
| **403** | Forbidden | Sin permisos para la acción |
| **404** | Not Found | Recurso no encontrado |
| **409** | Conflict | Conflicto de datos (duplicados) |
| **422** | Unprocessable Entity | Error de validación |

### **Códigos de Error del Servidor**
| Código | Descripción | Causa Común |
|--------|-------------|-------------|
| **500** | Internal Server Error | Error interno del servidor |
| **502** | Bad Gateway | Error de conexión a base de datos |
| **503** | Service Unavailable | Servicio temporalmente no disponible |

---

## 🔍 Query Parameters Comunes

### **Paginación**
```http
?page=1&limit=10
```
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10, max: 100)

### **Filtros de Fecha**
```http
?fecha_desde=2025-10-01&fecha_hasta=2025-10-31
```

### **Búsqueda**
```http
?search=texto&nombre=Juan&estado=activo
```

### **Ordenamiento**
```http
?sort=created_at&order=desc
```

---

## 📝 Ejemplos de Uso con cURL

### **Login y Uso de Token**
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"documento":"12345678","contrasena":"password"}' \
  | jq -r '.data.accessToken')

# 2. Usar token en requests
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/usuario
```

### **Crear Empleado con Información Académica**
```bash
# 1. Crear empleado
EMPLEADO_ID=$(curl -s -X POST http://localhost:3000/api/empleado \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María",
    "apellido": "González",
    "documento": "87654321",
    "cargo": "Docente"
  }' | jq -r '.data.id')

# 2. Agregar información académica
curl -X POST http://localhost:3000/api/informacion-academica \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "empleado_id": "'$EMPLEADO_ID'",
    "nivel_academico": "PROFESIONAL",
    "titulo": "Licenciatura en Matemáticas"
  }'
```

---

## 🚀 Rate Limiting y Límites

### **Límites por Endpoint**
- **Login**: 5 intentos por minuto por IP
- **Crear recursos**: 60 requests por minuto por usuario
- **Consultas**: 100 requests por minuto por usuario
- **Upload de archivos**: 10MB máximo por archivo

### **Headers de Rate Limiting**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696680000
```

---

*Referencia Completa de Endpoints - API SIGED*  
*Última actualización: Octubre 2025*  
*Versión: 1.0.0 - Documentación completa de la API*