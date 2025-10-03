# Controlador de Usuarios - API SIGED

## Descripción

Controlador completo para la gestión de usuarios que implementa:

- ✅ **CRUD completo** con validaciones robustas
- ✅ **Contraseñas hasheadas** con bcrypt (12 rounds)
- ✅ **Validación de email** usando utils personalizadas
- ✅ **Borrado lógico** (cambio de estado en lugar de eliminación física)
- ✅ **Autenticación y autorización** con middlewares
- ✅ **Buenas prácticas de seguridad**
- ✅ **Logging completo** de todas las operaciones

## Endpoints Disponibles

### 🔐 **Autenticación Requerida**
Todos los endpoints requieren el header `Authorization` con un token válido.

### 📋 **CRUD de Usuarios**

#### 1. **POST `/api/usuario`** - Crear Usuario
**Permisos:** Solo `admin` y `super_admin`

```json
{
  "tipo_documento": "CC",
  "documento": "1234567890",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@ejemplo.com",
  "celular": "3001234567", // Opcional
  "contrasena": "MiPassword123!",
  "rol": "gestor", // Optional: gestor (default), admin, super_admin
  "estado": "activo" // Optional: activo (default), inactivo, suspendido
}
```
```json
//http://localhost:3000/api/usuario/create-initial-user
{
  "tipo_documento": "CC",
  "documento": "1088238704",
  "nombre": "Jean",
  "apellido": "Duran",
  "email": "jean.duran@superadmin.com",
  "celular": "3007445783", 
  "contrasena": "Admin123456"
}
```
**Validaciones:**
- Email válido y único
- Contraseña: mínimo 8 caracteres, incluir mayúscula, minúscula y número
- Documento único
- Nombre y apellido mínimo 2 caracteres

#### 2. **GET `/api/usuario`** - Listar Usuarios
**Permisos:** Todos los usuarios autenticados

**Query Parameters:**
```
?page=1&limit=10&orderBy=created_at&orderDirection=desc
&tipo_documento=CC&documento=123&nombre=Juan&apellido=Pérez
&email=juan&rol=gestor&estado=activo
```

**Solo muestra usuarios activos por defecto**

#### 3. **GET `/api/usuario/inactivos`** - Listar Usuarios Inactivos
**Permisos:** Solo `admin` y `super_admin`

#### 4. **GET `/api/usuario/:id`** - Obtener Usuario por ID
**Permisos:** Usuario puede ver su perfil, admin ve cualquier perfil

#### 5. **PUT `/api/usuario/:id`** - Actualizar Usuario
**Permisos:** Usuario puede editar su perfil, admin puede editar cualquier usuario

```json
{
  "nombre": "Juan Carlos", // Cualquier campo es opcional
  "email": "nuevo.email@ejemplo.com",
  "contrasena": "NuevaPassword123!" // Se hashea automáticamente
}
```

#### 6. **DELETE `/api/usuario/:id`** - Desactivar Usuario (Borrado Lógico)
**Permisos:** Solo `admin` y `super_admin`

**No elimina físicamente, cambia estado a `inactivo`**

#### 7. **PATCH `/api/usuario/:id/reactivar`** - Reactivar Usuario
**Permisos:** Solo `admin` y `super_admin`

#### 8. **PATCH `/api/usuario/:id/cambiar-contrasena`** - Cambiar Contraseña
**Permisos:** Usuario puede cambiar su contraseña, admin puede cambiar cualquiera

```json
{
  "contrasenaActual": "PasswordActual123!",
  "contrasenaNueva": "NuevaPassword456!"
}
```

## Middlewares Implementados

### 🔒 **authMiddleware**
- Valida token de autorización en el header
- Agrega información del usuario a `req.user`

### 🛡️ **roleMiddleware(['admin', 'super_admin'])**
- Verifica que el usuario tenga uno de los roles permitidos

### 👤 **canModifyUserMiddleware**
- `super_admin`: Puede modificar cualquier usuario
- `admin`: Puede modificar gestores
- `gestor`: Solo puede modificar su propio perfil

### ✅ **validateCreateUser**
- Valida todos los campos requeridos para crear usuario
- Verifica formato de email y fortaleza de contraseña

### ✅ **validateUpdateUser**
- Valida campos opcionales para actualizar usuario

## Seguridad Implementada

### 🔐 **Contraseñas**
```typescript
// Hasheo con bcrypt (12 rounds)
const hashedPassword = await bcrypt.hash(contrasena, 12);

// Verificación
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

### 📧 **Validación de Email**
```typescript
// Usando utils personalizadas
const emailValidation = validateEmail(email);
if (!emailValidation.isValid) {
  // Manejar errores: emailValidation.errors[]
}
```

### 🚫 **Borrado Lógico**
```typescript
// No eliminación física, solo cambio de estado
await prismaService.updateUsuario(id, {
  estado: UsuarioEstado.inactivo
});
```

### 🛡️ **Prevención de Conflictos**
- Verificación de documentos y emails únicos
- Manejo de errores Prisma P2002 (unique constraint)
- Validación de existencia antes de operaciones

## Ejemplos de Uso

### 📝 **Crear Usuario (Admin)**
```bash
curl -X POST http://localhost:3000/api/usuario \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-token" \
  -d '{
    "tipo_documento": "CC",
    "documento": "1234567890",
    "nombre": "Ana",
    "apellido": "García",
    "email": "ana.garcia@empresa.com",
    "contrasena": "SecurePass123!",
    "rol": "gestor"
  }'
```

### 📋 **Listar Usuarios con Filtros**
```bash
curl "http://localhost:3000/api/usuario?page=1&limit=5&rol=gestor&estado=activo" \
  -H "Authorization: Bearer user-token"
```

### 🔄 **Actualizar Perfil Propio**
```bash
curl -X PUT http://localhost:3000/api/usuario/user-id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer user-token" \
  -d '{
    "nombre": "Ana María",
    "celular": "3009876543"
  }'
```

### 🔒 **Cambiar Contraseña**
```bash
curl -X PATCH http://localhost:3000/api/usuario/user-id/cambiar-contrasena \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer user-token" \
  -d '{
    "contrasenaActual": "SecurePass123!",
    "contrasenaNueva": "NewSecurePass456!"
  }'
```

### ❌ **Desactivar Usuario (Admin)**
```bash
curl -X DELETE http://localhost:3000/api/usuario/user-id \
  -H "Authorization: Bearer admin-token"
```

## Respuestas de la API

### ✅ **Éxito**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": "uuid-generado",
    "nombre": "Ana",
    "apellido": "García",
    "email": "ana.garcia@empresa.com",
    "rol": "gestor",
    "estado": "activo",
    "created_at": "2024-01-01T00:00:00Z"
    // Nota: La contraseña NUNCA se incluye en respuestas
  }
}
```

### ❌ **Error de Validación**
```json
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "error": "Validation Error",
  "details": [
    "Email es requerido",
    "Contraseña debe tener al menos 8 caracteres"
  ]
}
```

### 🚫 **Error de Permisos**
```json
{
  "success": false,
  "message": "No tienes permisos para realizar esta acción",
  "error": "Forbidden"
}
```

## Logging

Todas las operaciones se registran con:
- ID del usuario que realiza la acción
- Tipo de operación realizada
- ID del usuario afectado (si aplica)
- Timestamp y detalles adicionales

```typescript
logger.info('Usuario creado exitosamente', { 
  id: nuevoUsuario.id, 
  email: nuevoUsuario.email,
  createdBy: req.user?.id 
});
```

## Notas Importantes

1. **Nunca se devuelven contraseñas** en las respuestas de la API
2. **Borrado lógico** mantiene la integridad referencial
3. **Validaciones robustas** previenen datos inconsistentes
4. **Logs completos** para auditoría de seguridad
5. **Middleware de autenticación** debe implementarse según tu sistema de tokens (JWT, etc.)

## Próximos Pasos

Para producción, considera implementar:
- JWT tokens reales en lugar del middleware básico
- Rate limiting para prevenir ataques de fuerza bruta
- Validación de contraseñas más robusta (historial, etc.)
- Auditoría completa de todas las operaciones
- Notificaciones por email en cambios críticos