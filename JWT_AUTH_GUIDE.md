# API de Autenticación JWT - Documentación

## Configuración

### Variables de Entorno
Asegúrate de configurar estas variables en tu archivo `.env`:

```env
# Configuración JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d
```

## Endpoints de Autenticación

### 1. Login de Usuario
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "contrasena": "password123"
}
```

**Response (200):**
```json
{
  "ok": true,
  "data": {
    "usuario": {
      "id": "uuid-del-usuario",
      "nombre": "Juan",
      "email": "admin@example.com",
      "rol": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errores:**
- `400`: Email y contraseña requeridos / Formato de email inválido
- `401`: Credenciales inválidas / Usuario inactivo o suspendido

### 2. Renovar Token
**POST** `/api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "ok": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Obtener Perfil del Usuario Autenticado
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "ok": true,
  "data": {
    "id": "uuid-del-usuario",
    "tipo_documento": "CC",
    "documento": "12345678",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "admin@example.com",
    "celular": "3001234567",
    "rol": "admin",
    "estado": "activo",
    "fecha_creacion": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Cerrar Sesión
**POST** `/api/auth/logout`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "ok": true,
  "msg": "Sesión cerrada exitosamente"
}
```

### 5. Cambiar Contraseña
**POST** `/api/auth/change-password`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "contrasenaActual": "passwordActual123",
  "contrasenaNueva": "nuevaPassword456"
}
```

**Response (200):**
```json
{
  "ok": true,
  "msg": "Contraseña cambiada exitosamente"
}
```

## Uso del Token en Otros Endpoints

Para acceder a endpoints protegidos, incluye el token en el header `Authorization`:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Ejemplo: Obtener Lista de Usuarios
**GET** `/api/usuario`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Roles de Usuario

El sistema maneja tres roles:

- **super_admin**: Acceso completo a todo el sistema
- **admin**: Acceso administrativo con algunas restricciones
- **gestor**: Acceso básico para gestión de contenido

## Middleware de Autorización

### Middleware básico de autenticación
```typescript
import { authMiddleware } from '../middlewares/auth.middleware';

// Aplicar a rutas que requieren autenticación
router.get('/protected', authMiddleware, controller.method);
```

### Middleware de roles específicos
```typescript
import { roleMiddleware } from '../middlewares/auth.middleware';

// Solo super_admin y admin
router.post('/admin-only', 
  authMiddleware, 
  roleMiddleware(['super_admin', 'admin']), 
  controller.method
);
```

### Middleware para modificación de usuarios
```typescript
import { canModifyUserMiddleware } from '../middlewares/auth.middleware';

// Verifica si el usuario puede modificar el usuario del parámetro
router.put('/usuario/:id', 
  authMiddleware, 
  canModifyUserMiddleware, 
  controller.updateUsuario
);
```

## Ejemplos con cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "contrasena": "password123"
  }'
```

### Obtener perfil
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Cambiar contraseña
```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "contrasenaActual": "currentPassword",
    "contrasenaNueva": "newPassword123"
  }'
```

## Estructura de Respuesta

Todas las respuestas siguen el formato estándar:

**Éxito:**
```json
{
  "ok": true,
  "data": { /* datos de respuesta */ },
  "msg": "Mensaje opcional"
}
```

**Error:**
```json
{
  "ok": false,
  "msg": "Descripción del error",
  "errors": ["array opcional de errores específicos"]
}
```

## Notas de Seguridad

1. **Tokens JWT**: Los tokens tienen una duración de 24 horas por defecto
2. **Refresh Tokens**: Los refresh tokens duran 7 días por defecto
3. **Contraseñas**: Se hashean con bcrypt usando 12 rounds
4. **Headers**: Siempre usar HTTPS en producción
5. **Secrets**: Cambiar los secrets por defecto en producción

## Ejemplo de Uso Completo

```typescript
// 1. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    contrasena: 'password123'
  })
});

const { data } = await loginResponse.json();
const token = data.token;

// 2. Usar token en requests posteriores
const profileResponse = await fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const profile = await profileResponse.json();
```