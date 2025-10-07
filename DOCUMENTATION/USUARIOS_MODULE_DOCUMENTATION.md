# 👥 MÓDULO DE USUARIOS - DOCUMENTACIÓN COMPLETA

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Módulo](#arquitectura-del-módulo)
3. [Gestión de Usuarios](#gestión-de-usuarios)
4. [Sistema de Recuperación de Contraseñas](#sistema-de-recuperación-de-contraseñas)
5. [Schemas y Validaciones](#schemas-y-validaciones)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Permisos y Roles](#permisos-y-roles)
8. [Casos de Prueba](#casos-de-prueba)

---

## 🎯 Descripción General

El **Módulo de Usuarios** gestiona los usuarios del sistema SIGED, incluyendo autenticación, autorización y recuperación de contraseñas. Es fundamental para el control de acceso y seguridad de la plataforma.

### 🔑 **Funcionalidades Principales**

- ✅ **CRUD de Usuarios**: Gestión completa de usuarios del sistema
- ✅ **Roles y Permisos**: Sistema de roles jerárquicos (super_admin, admin, gestor)
- ✅ **Gestión de Contraseñas**: Cambio seguro de contraseñas
- ✅ **Recuperación por SMS**: Sistema de recuperación de contraseñas vía SMS
- ✅ **Estados de Usuario**: Control de usuarios activos/inactivos
- ✅ **Auditoría**: Registro de todas las acciones de usuarios

---

## 🏗️ Arquitectura del Módulo

```
modulos/usuario/
├── 📁 usuario.controller.ts       # Controlador principal
├── 📁 usuario.routes.ts           # Rutas y middleware de autorización
└── 📁 [relacionados]
    ├── auth.controller.ts         # Autenticación (../auth/)
    ├── notification.service.ts    # Servicio SMS (../services/)
    └── auth.middleware.ts         # Middleware auth (../middlewares/)
```

### 🌐 **Integración en el Sistema**

```typescript
// Base path: /api/usuario
router.use('/api/usuario', UsuarioRoutes.routes);

// Rutas relacionadas:
router.use('/api/auth', AuthRoutes);  // Autenticación
```

---

## 👥 Gestión de Usuarios

### **Crear Usuario**
```http
POST /api/usuario
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

**Respuesta**:
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": "uuid-usuario",
    "tipo_documento": "CC",
    "documento": "12345678",
    "nombre": "Juan Carlos",
    "apellido": "Pérez García",
    "email": "juan.perez@example.com",
    "celular": "3001234567",
    "rol": "gestor",
    "estado": "activo",
    "created_at": "2025-10-07T12:00:00.000Z"
  }
}
```

### **Obtener Usuarios**
```http
GET /api/usuario?page=1&limit=10&rol=gestor&estado=activo
```
**Permisos**: `super_admin`, `admin`

**Query Parameters**:
- `tipo_documento`: Filtro por tipo de documento
- `documento`: Filtro por número de documento
- `nombre`: Búsqueda por nombre
- `apellido`: Búsqueda por apellido
- `email`: Filtro por email
- `rol`: `super_admin` | `admin` | `gestor`
- `estado`: `activo` | `inactivo` | `suspendido`
- `page`: Página (default: 1)
- `limit`: Resultados por página (default: 10)

### **Obtener Usuario por ID**
```http
GET /api/usuario/:id
```
**Permisos**: `super_admin`, `admin`, o el propio usuario

### **Actualizar Usuario**
```http
PUT /api/usuario/:id
```
**Permisos**: `super_admin`, `admin`, o el propio usuario (campos limitados)

**Body** (admin puede cambiar todo):
```json
{
  "nombre": "Juan Carlos",
  "apellido": "Pérez García", 
  "email": "nuevo.email@example.com",
  "celular": "3009876543",
  "rol": "admin",
  "estado": "activo"
}
```

### **Eliminar Usuario (Lógico)**
```http
DELETE /api/usuario/:id
```
**Permisos**: `super_admin`, `admin`

**Respuesta**:
```json
{
  "success": true,
  "message": "Usuario desactivado exitosamente",
  "data": {
    "id": "uuid-usuario",
    "estado": "inactivo"
  }
}
```

### **Reactivar Usuario**
```http
PUT /api/usuario/:id/reactivar
```
**Permisos**: `super_admin`, `admin`

### **Cambiar Contraseña**
```http
PATCH /api/usuario/:id/cambiar-contrasena
```
**Permisos**: `super_admin`, `admin`, o el propio usuario

**Body**:
```json
{
  "contrasenaActual": "MiContrasenaActual123",
  "nuevaContrasena": "MiNuevaContrasena456"
}
```

---

## 🔐 Sistema de Recuperación de Contraseñas

### **📱 Solicitar Código de Recuperación**
```http
POST /api/usuario/solicitar-codigo
```
**Acceso**: Público (sin autenticación)

**Body**:
```json
{
  "documento": "12345678"
}
```

**Respuesta** (si el usuario existe y tiene celular):
```json
{
  "success": true,
  "message": "Código enviado por SMS",
  "data": {
    "celularParcial": "***4567",
    "validoHasta": "2025-10-07T12:15:00.000Z",
    "instrucciones": "El código es válido por 15 minutos"
  }
}
```

**Respuesta** (por seguridad, siempre positiva):
```json
{
  "success": true,
  "message": "Si el documento existe en nuestro sistema y tiene número de celular registrado, recibirás un código por SMS"
}
```

### **✅ Verificar Código y Cambiar Contraseña**
```http
POST /api/usuario/verificar-codigo
```
**Acceso**: Público (sin autenticación)

**Body**:
```json
{
  "documento": "12345678",
  "codigo": "123456",
  "nuevaContrasena": "MiNuevaContrasena789"
}
```

**Respuesta Exitosa**:
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente",
  "data": {
    "usuario": "Juan Carlos Pérez García",
    "email": "juan.perez@example.com"
  }
}
```

**Respuestas de Error**:
```json
// Código inválido
{
  "success": false,
  "message": "Código inválido",
  "error": "Invalid Code"
}

// Código expirado
{
  "success": false,
  "message": "Código expirado. Solicita uno nuevo.",
  "error": "Expired Code"
}
```

### **🔄 Reenviar Código**
```http
POST /api/usuario/reenviar-codigo
```
**Acceso**: Público (sin autenticación)

**Body**:
```json
{
  "documento": "12345678"
}
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Código reenviado por SMS",
  "data": {
    "celularParcial": "***4567",
    "validoHasta": "2025-10-07T12:30:00.000Z"
  }
}
```

---

## 👑 Usuario Inicial del Sistema

### **Crear Usuario Inicial**
```http
POST /api/usuario/create-initial-user
```
**Acceso**: Público (solo si no existen usuarios)

**Body**:
```json
{
  "tipo_documento": "CC",
  "documento": "00000001",
  "nombre": "Super",
  "apellido": "Administrador",
  "email": "admin@siged.com",
  "celular": "3001234567",
  "contrasena": "AdminSiged2025",
  "rol": "super_admin"
}
```

**Nota**: Este endpoint solo funciona si no existe ningún usuario en el sistema.

---

## 📋 Schemas y Validaciones

### **Modelo de Usuario**
```typescript
interface IUsuario {
  id: string;
  tipo_documento: string;           // CC, CE, TI, etc.
  documento: string;               // Único en el sistema
  nombre: string;                  // Máx 100 caracteres
  apellido: string;               // Máx 100 caracteres
  email: string;                  // Único, validado
  celular?: string;               // Formato colombiano
  contrasena: string;             // Hasheada con bcrypt
  rol: 'super_admin' | 'admin' | 'gestor';
  estado: 'activo' | 'inactivo' | 'suspendido';
  reset_password_token?: string;   // Token para recuperación
  reset_password_expires?: Date;   // Expiración del token
  created_at: Date;
  updated_at: Date;
}
```

### **Validaciones de Entrada**

#### **Crear/Actualizar Usuario**
- ✅ `documento`: Requerido, único, solo números
- ✅ `nombre`: Requerido, máximo 100 caracteres
- ✅ `apellido`: Requerido, máximo 100 caracteres  
- ✅ `email`: Formato válido, único en el sistema
- ✅ `celular`: Formato colombiano (10 dígitos, inicia con 3)
- ✅ `contrasena`: Mínimo 8 caracteres, debe incluir:
  - Al menos una minúscula (a-z)
  - Al menos una mayúscula (A-Z)
  - Al menos un número (0-9)

#### **Recuperación de Contraseña**
- ✅ `codigo`: 6 dígitos exactos
- ✅ `nuevaContrasena`: Mismas validaciones que contraseña
- ⏰ **Expiración**: Códigos válidos por 15 minutos

---

## 🔐 Permisos y Roles

### **Jerarquía de Roles**

1. **🔴 super_admin**: Control total del sistema
   - Crear/modificar/eliminar cualquier usuario
   - Acceso a todas las funcionalidades
   - No puede ser modificado por otros roles

2. **🟡 admin**: Administración operativa
   - Crear/modificar usuarios (excepto super_admin)
   - Gestionar la mayoría de módulos
   - No puede modificar otros admin sin ser super_admin

3. **🟢 gestor**: Usuario operativo
   - Acceso limitado a funcionalidades diarias
   - No puede gestionar usuarios
   - Solo puede cambiar su propia información básica

### **Matriz de Permisos**

| Acción | super_admin | admin | gestor |
|--------|-------------|--------|--------|
| **Gestión de Usuarios** |
| Ver usuarios | ✅ | ✅ | ❌ |
| Crear usuario | ✅ | ✅ | ❌ |
| Actualizar usuario | ✅ | ✅¹ | ❌² |
| Eliminar usuario | ✅ | ✅¹ | ❌ |
| Cambiar rol | ✅ | ✅¹ | ❌ |
| **Autogestión** |
| Ver mi perfil | ✅ | ✅ | ✅ |
| Cambiar mis datos | ✅ | ✅ | ✅³ |
| Cambiar mi contraseña | ✅ | ✅ | ✅ |

**Notas**:
- ¹ Admin no puede modificar super_admin ni otros admin
- ² Gestor solo puede modificar su propio usuario
- ³ Campos limitados: nombre, apellido, email, celular

---

## 🧪 Ejemplos de Uso Completos

### **Flujo 1: Crear y Gestionar Usuario**

```bash
# 1. Crear usuario como admin
curl -X POST http://localhost:3000/api/usuario \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_documento": "CC",
    "documento": "87654321", 
    "nombre": "María",
    "apellido": "González",
    "email": "maria.gonzalez@example.com",
    "celular": "3109876543",
    "contrasena": "MariaPass123",
    "rol": "gestor"
  }'

# 2. Actualizar información del usuario
curl -X PUT http://localhost:3000/api/usuario/{user_id} \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "celular": "3009876543",
    "estado": "activo"
  }'

# 3. Cambiar contraseña del usuario
curl -X PATCH http://localhost:3000/api/usuario/{user_id}/cambiar-contrasena \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nuevaContrasena": "NuevaContrasena456"
  }'
```

### **Flujo 2: Recuperación de Contraseña por SMS**

```bash
# 1. Solicitar código de recuperación
curl -X POST http://localhost:3000/api/usuario/solicitar-codigo \
  -H "Content-Type: application/json" \
  -d '{
    "documento": "87654321"
  }'

# 2. Verificar código y cambiar contraseña
curl -X POST http://localhost:3000/api/usuario/verificar-codigo \
  -H "Content-Type: application/json" \
  -d '{
    "documento": "87654321",
    "codigo": "123456", 
    "nuevaContrasena": "ContrasenaRecuperada789"
  }'

# 3. Si es necesario, reenviar código
curl -X POST http://localhost:3000/api/usuario/reenviar-codigo \
  -H "Content-Type: application/json" \
  -d '{
    "documento": "87654321"
  }'
```

### **Flujo 3: Autogestión de Usuario**

```bash
# Usuario consultando su propio perfil
curl -X GET http://localhost:3000/api/usuario/{mi_user_id} \
  -H "Authorization: Bearer $MI_TOKEN"

# Usuario cambiando su propia información
curl -X PUT http://localhost:3000/api/usuario/{mi_user_id} \
  -H "Authorization: Bearer $MI_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María Elena",
    "celular": "3001234567"
  }'

# Usuario cambiando su contraseña
curl -X PATCH http://localhost:3000/api/usuario/{mi_user_id}/cambiar-contrasena \
  -H "Authorization: Bearer $MI_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contrasenaActual": "MiContrasenaActual",
    "nuevaContrasena": "MiNuevaContrasena123"
  }'
```

---

## 🔄 Casos de Prueba

### **Caso 1: Validaciones de Contraseña**

```json
// ❌ Error - Contraseña débil
POST /api/usuario
{
  "documento": "12345678",
  "contrasena": "123456"
}

// Respuesta esperada:
{
  "success": false,
  "message": "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números",
  "error": "Validation Error"
}
```

### **Caso 2: Usuarios Duplicados**

```json
// ❌ Error - Documento o email ya existe
POST /api/usuario  
{
  "documento": "12345678",  // Ya existe
  "email": "existente@example.com"
}

// Respuesta esperada:
{
  "success": false,
  "message": "Ya existe un usuario con este documento o email",
  "error": "Duplicate Entry"
}
```

### **Caso 3: Recuperación con Código Expirado**

```bash
# ❌ Error - Código expirado (después de 15 minutos)
curl -X POST http://localhost:3000/api/usuario/verificar-codigo \
  -H "Content-Type: application/json" \
  -d '{
    "documento": "12345678",
    "codigo": "123456",
    "nuevaContrasena": "NuevaPass123"
  }'

# Respuesta esperada:
{
  "success": false, 
  "message": "Código expirado. Solicita uno nuevo.",
  "error": "Expired Code"
}
```

### **Caso 4: Permisos Insuficientes**

```bash
# ❌ Error - Gestor intentando crear usuario
curl -X POST http://localhost:3000/api/usuario \
  -H "Authorization: Bearer $GESTOR_TOKEN"

# Respuesta esperada: 403 Forbidden
{
  "success": false,
  "message": "No tienes permisos para realizar esta acción",
  "error": "Forbidden"
}
```

---

## 🚀 Características Avanzadas

### **Seguridad de Contraseñas**
- **Hashing bcrypt** con 12 rondas de salt
- **Validación robusta** de complejidad
- **Tokens seguros** para recuperación (6 dígitos + expiración)

### **Sistema de Notificaciones SMS**
- **Integración con API externa** de notificaciones
- **Validación de números** colombianos
- **Control de reenvíos** para prevenir spam

### **Auditoría y Trazabilidad**
- **Logging completo** de todas las acciones
- **Registro de cambios** con timestamp
- **Control de sesiones** con tokens JWT

### **Estados y Ciclo de Vida**
- **Estados controlados**: activo, inactivo, suspendido
- **Eliminación lógica** para conservar histórico
- **Reactivación** de usuarios inactivos

---

## 📝 Notas de Implementación

### **Validación de Números Telefónicos**
```typescript
// Formato colombiano: 10 dígitos, inicia con 3
const COLOMBIA_PHONE_REGEX = /^3[0-9]{9}$/;
```

### **Generación de Códigos**
```typescript
// Códigos de 6 dígitos con expiración de 15 minutos
const codigo = Math.floor(100000 + Math.random() * 900000).toString();
const expiracion = new Date(Date.now() + 15 * 60 * 1000);
```

### **Control de Roles**
```typescript
// Middleware para verificar permisos jerárquicos
const verificarJerarquia = (usuarioSolicitante, usuarioObjetivo) => {
  // super_admin puede todo
  if (usuarioSolicitante.rol === 'super_admin') return true;
  
  // admin no puede modificar super_admin
  if (usuarioObjetivo.rol === 'super_admin') return false;
  
  // admin puede modificar admin/gestor
  if (usuarioSolicitante.rol === 'admin') return true;
  
  return false;
};
```

---

*Documentación del Módulo de Usuarios - API SIGED*  
*Última actualización: Octubre 2025*  
*Versión: 1.0.0 - Incluye sistema de recuperación por SMS*