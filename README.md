# API SIGED - Sistema de Gestión Educativa

## Descripción
API REST para el Sistema Integrado de Gestión Educativa Distrital (SIGED), construida con Node.js, TypeScript, Express.js y Prisma ORM.

## Características Principales

- 🔐 **Autenticación JWT** completa con tokens de acceso y refresh
- 🛡️ **Middleware de autorización** con control de roles
- 👥 **CRUD de usuarios** con validaciones y seguridad
- 🏫 **Gestión de empleados y sedes educativas**
- 📝 **Validación de datos** robusta
- 🗄️ **Base de datos MySQL** con Prisma ORM
- 📊 **Logging** avanzado con Winston

## Tecnologías

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Prisma ORM** - ORM para base de datos
- **MySQL** - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Hasheo de contraseñas
- **Winston** - Logging
- **Zod** - Validación de esquemas

## Instalación y Configuración

1. **Clonar el repositorio:**
```bash
git clone https://github.com/tife502/API_LOGICA_SIGED.git
cd api_basica
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env
```
Editar el archivo `.env` con tu configuración:
```env
PORT=3000
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/siged"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d
```

4. **Ejecutar migraciones de base de datos:**
```bash
npx prisma migrate dev
```

5. **Generar cliente de Prisma:**
```bash
npx prisma generate
```

6. **Ejecutar el servidor:**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Estructura del Proyecto

```
src/
├── auth/                    # Módulo de autenticación JWT
│   ├── auth.controller.ts   # Controlador de autenticación
│   └── auth.routes.ts       # Rutas de autenticación
├── config/                  # Configuraciones
│   ├── envs.ts             # Variables de entorno
│   └── adapters/           # Adaptadores (Winston, UUID)
├── domain/                  # Lógica de dominio
│   ├── dtos/               # Data Transfer Objects
│   ├── interfaces/         # Interfaces TypeScript
│   └── utils/              # Utilidades (validación email)
├── middlewares/            # Middlewares personalizados
│   ├── auth.middleware.ts  # Autenticación y autorización
│   └── validation.middleware.ts # Validación de datos
├── prisma/                 # Configuración de Prisma
├── services/               # Servicios de negocio
│   └── jwt.service.ts      # Servicio JWT
├── modulo/                 # Contenedor de modulos
|   ├── usuario/            # Módulo de usuarios
|   ├── empleado/           # Módulo de empleados
└── presentation/           # Capa de presentación
    ├── routes.ts           # Rutas principales
    └── server.ts           # Configuración del servidor
```

## Autenticación y Autorización

### 🔐 Sistema JWT Completo
- **Login/Logout** con tokens JWT
- **Refresh tokens** para renovación automática
- **Middleware de autenticación** para rutas protegidas
- **Control de roles** (super_admin, admin, gestor)

### 📋 Endpoints de Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Perfil del usuario
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/change-password` - Cambiar contraseña

Ver documentación completa en: [JWT_AUTH_GUIDE.md](./JWT_AUTH_GUIDE.md)

## Endpoints Principales

### Usuarios
- `GET /api/usuario` - Listar usuarios (con paginación y filtros)
- `POST /api/usuario` - Crear usuario
- `GET /api/usuario/:id` - Obtener usuario por ID
- `PUT /api/usuario/:id` - Actualizar usuario
- `DELETE /api/usuario/:id` - Eliminación lógica de usuario

### Empleados
- `GET /api/empleado` - Listar empleados
- `POST /api/empleado` - Crear empleado
- (Más endpoints en desarrollo...)

## Características de Seguridad

- ✅ **Hasheo de contraseñas** con bcrypt (12 rounds)
- ✅ **Validación de email** robusta con utilidades personalizadas
- ✅ **Eliminación lógica** en lugar de eliminación física
- ✅ **Middleware de autorización** por roles
- ✅ **Validación de entrada** en todos los endpoints
- ✅ **Logging de seguridad** para auditoría

## Scripts Disponibles

```bash
npm run dev          # Ejecutar en modo desarrollo con nodemon
npm run build        # Compilar TypeScript
npm start            # Ejecutar en producción
npm run lint         # Ejecutar linter
npm run test         # Ejecutar pruebas (cuando estén disponibles)
```

## Desarrollo

### Agregar Nuevos Módulos
1. Crear carpeta del módulo en `src/`
2. Implementar controlador, rutas y servicios
3. Registrar rutas en `src/presentation/routes.ts`
4. Agregar interfaces en `src/domain/interfaces/`

### Middleware Personalizado
- Usar `authMiddleware` para autenticación
- Usar `roleMiddleware(['rol1', 'rol2'])` para control de roles
- Usar `canModifyUserMiddleware` para verificar permisos de modificación

## Contribución

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia

Este proyecto está bajo la licencia MIT.

## Estado del Proyecto

🚧 **En Desarrollo Activo** 🚧

### ✅ Completado
- Sistema de autenticación JWT completo
- CRUD de usuarios con seguridad
- Middleware de autorización
- Configuración de base de datos
- Logging y validaciones

### 🔄 En Progreso
- Módulos de empleados y sedes
- Documentación de API completa
- Pruebas unitarias

### 📋 Próximas Características
- Sistema de roles más granular
- API de reportes
- Documentación con Swagger
- Pruebas de integración 