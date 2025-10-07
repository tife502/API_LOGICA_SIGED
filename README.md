# 🏛️ API SIGED - Sistema Integrado de Gestión Educativa Distrital

## 📋 Descripción

**API SIGED** es una solución robusta y completa para la gestión integral de sistemas educativos distritales. Construida con Node.js, TypeScript, Express.js y Prisma ORM, proporciona todas las funcionalidades necesarias para administrar empleados, sedes, documentos y procesos educativos.

## ✨ Características Principales

### 🔐 **Sistema de Autenticación y Seguridad**
- **JWT con Refresh Tokens**: Autenticación segura de larga duración
- **Control de Roles**: 3 niveles jerárquicos (super_admin, admin, gestor)
- **Recuperación de Contraseña por SMS**: Sistema completo de recuperación
- **Middleware de Autorización**: Protección granular por endpoints
- **Token Blacklist**: Invalidación segura de sesiones

### 👥 **Gestión de Usuarios y Empleados**
- **CRUD Completo de Usuarios**: Gestión total del sistema de usuarios
- **Gestión de Empleados**: Administración de personal educativo
- **Métodos Especializados**: Flujos específicos para rectores y docentes
- **Estados Controlados**: Manejo de ciclo de vida de usuarios/empleados

### 🏫 **Sistema Modular de Sedes**
- **Gestión de Sedes**: CRUD completo con validaciones
- **Instituciones Educativas**: Administración de instituciones y relaciones
- **Asignaciones Empleado-Sede**: Control de personal por ubicación
- **Comentarios y Seguimiento**: Sistema de observaciones y trazabilidad
- **Gestión de Jornadas**: Horarios y tipos de jornada educativa

### 📄 **Sistemas Administrativos**
- **Actos Administrativos**: Gestión de resoluciones y documentos oficiales
- **Horas Extra**: Registro y control de horas adicionales
- **Suplencias**: Administración de reemplazos temporales
- **Sistema de Documentos**: Modular para todas las entidades

### 🎓 **Información Académica**
- **Títulos y Certificaciones**: 7 niveles académicos soportados
- **Historial Educativo**: Trazabilidad completa de formación
- **Validaciones Académicas**: Control de prerrequisitos y coherencia

### �️ **Características Técnicas**
- **Base de Datos MySQL**: Con Prisma ORM para máxima eficiencia
- **Logging Avanzado**: Winston para trazabilidad completa
- **Validación Robusta**: Esquemas TypeScript y validaciones de negocio
- **API RESTful**: Endpoints consistentes y bien documentados
- **Docker Ready**: Configuración para contenedores

## 🛠️ Stack Tecnológico

### **Backend Core**
- **Node.js 18+** - Runtime de JavaScript
- **TypeScript 5.2+** - Tipado estático y desarrollo robusto
- **Express.js 4.x** - Framework web minimalista y flexible

### **Base de Datos**
- **MySQL 8.x** - Sistema de gestión de base de datos relacional
- **Prisma ORM 6.x** - ORM moderno con generación de tipos automática

### **Autenticación y Seguridad**
- **JSON Web Tokens (JWT)** - Autenticación stateless
- **bcrypt** - Hashing seguro de contraseñas
- **Refresh Tokens** - Gestión de sesiones de larga duración

### **Utilidades y Herramientas**
- **Winston** - Sistema de logging profesional
- **Axios** - Cliente HTTP para notificaciones SMS
- **UUID v4** - Generación de identificadores únicos
- **Zod** - Validación de esquemas TypeScript

## 🚀 Instalación y Configuración

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/tife502/API_LOGICA_SIGED.git
cd API_LOGICA_SIGED
```

### **2. Instalar Dependencias**
```bash
npm install
```

### **3. Configurar Variables de Entorno**
```bash
cp .env.template .env
```

Editar el archivo `.env` con tu configuración:
```bash
# Puerto del servidor
PORT=3000

# Base de datos MySQL
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/siged"

# Configuración JWT
JWT_SECRET=tu-clave-secreta-muy-larga-y-compleja-para-produccion
JWT_EXPIRES_IN=2h
JWT_REFRESH_SECRET=otra-clave-secreta-diferente-para-refresh-tokens
JWT_REFRESH_EXPIRES_IN=30d

# Servicio de notificaciones SMS (opcional)
NOTIFICATION_API_URL=https://api.notificaciones.com/sms

# Entorno
NODE_ENV=development
```

### **4. Configurar Base de Datos**
```bash
# Sincronizar schema con base de datos existente
npx prisma db pull

# O aplicar schema a nueva base de datos
npx prisma db push

# Generar cliente de Prisma
npx prisma generate
```

### **5. Ejecutar el Servidor**
```bash
# Desarrollo con hot-reload
npm run dev

# Compilar y ejecutar en producción
npm run build
npm start
```

### **6. Verificar Instalación**
```bash
# Verificar que la API esté funcionando
curl http://localhost:3000/api/auth/me
# Debe retornar error 401 (sin token) - confirmando que la API responde

# Ver logs en tiempo real
tail -f combined.log
```

## 📁 Estructura del Proyecto

```
API_LOGICA_SIGED/
├── 📁 src/                          # Código fuente principal
│   ├── 📁 auth/                     # Sistema de autenticación
│   │   ├── auth.controller.ts       # Login, refresh, logout
│   │   └── auth.routes.ts           # Rutas de autenticación
│   ├── 📁 config/                   # Configuración del sistema
│   │   ├── envs.ts                  # Variables de entorno
│   │   ├── index.ts                 # Exportaciones centrales
│   │   └── 📁 adapters/             # Adaptadores de servicios
│   ├── 📁 domain/                   # Lógica de dominio
│   │   ├── 📁 dtos/                 # Data Transfer Objects
│   │   ├── 📁 exceptions/           # Excepciones personalizadas
│   │   ├── 📁 interfaces/           # Interfaces y tipos TypeScript
│   │   └── 📁 utils/                # Utilidades (validación email, etc.)
│   ├── 📁 middlewares/              # Middleware personalizado
│   │   ├── auth.middleware.ts       # Autenticación y autorización
│   │   └── validation.middleware.ts # Validación de esquemas
│   ├── 📁 modulos/                  # Módulos de negocio
│   │   ├── 📁 usuario/              # 👥 Gestión de usuarios del sistema
│   │   ├── 📁 empleado/             # 👨‍🏫 Gestión de empleados educativos
│   │   │   └── 📁 metodos/          # Métodos especializados (rector, normal)
│   │   ├── 📁 sede/                 # 🏫 Sistema modular de sedes
│   │   │   ├── 📁 asignaciones/     # Empleado-sede assignments
│   │   │   ├── 📁 comentarios/      # Observaciones y seguimiento
│   │   │   ├── 📁 instituciones/    # Instituciones educativas
│   │   │   └── 📁 jornadas/         # Horarios y jornadas
│   │   ├── 📁 actos.administrativos/ # 📄 Actos administrativos
│   │   ├── 📁 horas.extras/         # ⏰ Registro de horas extra
│   │   ├── 📁 suplencias/           # 🔄 Gestión de suplencias
│   │   ├── 📁 documentos/           # 📁 Sistema modular de documentos
│   │   │   ├── 📁 documentos_empleados/
│   │   │   ├── 📁 documentos_actos_administrativos/
│   │   │   ├── 📁 documentos.horas.extra/
│   │   │   └── 📁 documentos_suplencias/
│   │   └── 📁 informacion.academica/ # 🎓 Información académica
│   ├── 📁 presentation/             # Capa de presentación
│   │   ├── routes.ts                # Router principal
│   │   └── server.ts                # Configuración del servidor Express
│   ├── 📁 prisma/                   # Servicios de base de datos
│   │   ├── prisma.connection.ts     # Conexión singleton
│   │   └── prisma.service.ts        # Servicio principal ORM
│   ├── 📁 services/                 # Servicios auxiliares
│   │   ├── jwt.service.ts           # Gestión de tokens JWT
│   │   ├── notification.service.ts  # Notificaciones SMS
│   │   └── token-blacklist.service.ts # Control de tokens revocados
│   └── app.ts                       # Punto de entrada de la aplicación
├── 📁 prisma/                       # Configuración de Prisma ORM
│   └── schema.prisma                # Schema de base de datos
├── 📁 documentación/                # 📚 Documentación completa del proyecto
│   ├── DOCUMENTACION_COMPLETA_SIGED.md
│   ├── SEDES_MODULE_DOCUMENTATION.md
│   ├── USUARIOS_MODULE_DOCUMENTATION.md
│   ├── AUTH_SYSTEM_DOCUMENTATION.md
│   └── ... (más documentación detallada)
├── package.json                     # Configuración del proyecto
├── tsconfig.json                    # Configuración TypeScript
├── .env.template                    # Template de variables de entorno
└── dockerfile                       # Configuración Docker
```

## 🌐 API Endpoints

### **Base URL**: `http://localhost:3000/api`

| Módulo | Endpoint Base | Funcionalidad |
|--------|---------------|---------------|
| **Autenticación** | `/auth` | Login, refresh, logout, cambio de contraseña |
| **Usuarios** | `/usuario` | CRUD usuarios + recuperación por SMS |
| **Empleados** | `/empleado` | CRUD empleados + métodos especializados |
| **Sedes** | `/sede` | Gestión integral de sedes educativas |
| **Instituciones** | `/instituciones` | Gestión de instituciones educativas |
| **Actos Administrativos** | `/actos-administrativos` | Resoluciones y documentos oficiales |
| **Horas Extra** | `/horas-extra` | Registro y control de horas adicionales |
| **Suplencias** | `/suplencias` | Administración de reemplazos temporales |
| **Documentos** | `/documentos-*` | Sistema modular de documentos |
| **Información Académica** | `/informacion-academica` | Títulos y certificaciones |

## 🔐 Sistema de Autenticación

### **Roles del Sistema**
- **🔴 super_admin**: Control total del sistema
- **🟡 admin**: Administración operativa  
- **🟢 gestor**: Usuario operativo diario

### **Ejemplo de Autenticación**
```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"documento":"12345678","contrasena":"password"}'

# 2. Usar token en requests
curl -H "Authorization: Bearer {access_token}" \
  http://localhost:3000/api/usuario
```

### **Recuperación de Contraseña por SMS**
```bash
# Solicitar código
curl -X POST http://localhost:3000/api/usuario/solicitar-codigo \
  -H "Content-Type: application/json" \
  -d '{"documento":"12345678"}'

# Verificar código y cambiar contraseña
curl -X POST http://localhost:3000/api/usuario/verificar-codigo \
  -H "Content-Type: application/json" \
  -d '{
    "documento":"12345678",
    "codigo":"123456",
    "nuevaContrasena":"NuevaContrasena123"
  }'
```

## 🚢 Deployment

### **Docker**
```bash
# Construir imagen
docker build -t siged-api .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://user:pass@host:3306/db" \
  -e JWT_SECRET="your-secret" \
  siged-api
```

### **Docker Compose**
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://siged_user:password@db:3306/siged
    depends_on:
      - db
  
  db:
    image: mysql:8.0
    environment:
      - MYSQL_DATABASE=siged
      - MYSQL_USER=siged_user
      - MYSQL_PASSWORD=password
    ports:
      - "3306:3306"
```

## 📚 Documentación Completa

La API cuenta con documentación exhaustiva y detallada:

### **📋 Documentación por Módulos**
- [`SEDES_MODULE_DOCUMENTATION.md`](SEDES_MODULE_DOCUMENTATION.md) - Sistema modular de sedes
- [`USUARIOS_MODULE_DOCUMENTATION.md`](USUARIOS_MODULE_DOCUMENTATION.md) - Gestión de usuarios con SMS
- [`AUTH_SYSTEM_DOCUMENTATION.md`](AUTH_SYSTEM_DOCUMENTATION.md) - Sistema de autenticación JWT
- [`SUPLENCIAS_MODULE_DOCUMENTATION.md`](SUPLENCIAS_MODULE_DOCUMENTATION.md) - Gestión de suplencias
- [`DOCUMENTOS_SYSTEM_DOCUMENTATION.md`](DOCUMENTOS_SYSTEM_DOCUMENTATION.md) - Sistema modular de documentos
- [`INFORMACION_ACADEMICA_DOCUMENTATION.md`](INFORMACION_ACADEMICA_DOCUMENTATION.md) - Información académica
- [`EMPLEADOS_MODULE_DOCUMENTATION.md`](EMPLEADOS_MODULE_DOCUMENTATION.md) - Gestión de empleados
- [`ACTOS_ADMINISTRATIVOS_API_DOCUMENTATION.md`](ACTOS_ADMINISTRATIVOS_API_DOCUMENTATION.md) - Actos administrativos
- [`HORAS_EXTRA_API_DOCUMENTATION.md`](HORAS_EXTRA_API_DOCUMENTATION.md) - Sistema de horas extra

### **🛠️ Documentación Técnica**
- [`PROJECT_CONFIGURATION.md`](PROJECT_CONFIGURATION.md) - Configuración completa del proyecto
- [`API_ENDPOINTS_REFERENCE.md`](API_ENDPOINTS_REFERENCE.md) - Referencia completa de endpoints
- [`JWT_SYSTEM_ANALYSIS.md`](JWT_SYSTEM_ANALYSIS.md) - Análisis del sistema JWT
- [`DOCUMENTACION_COMPLETA_SIGED.md`](DOCUMENTACION_COMPLETA_SIGED.md) - Índice general

## 🧪 Testing

### **Verificar Funcionamiento**
```bash
# Health check básico
curl http://localhost:3000/api/auth/me
# Debe retornar 401 (sin token) - confirmando que funciona

# Crear usuario inicial (solo primera vez)
curl -X POST http://localhost:3000/api/usuario/create-initial-user \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_documento":"CC",
    "documento":"00000001",
    "nombre":"Super",
    "apellido":"Administrador",
    "email":"admin@siged.com",
    "contrasena":"AdminSiged2025",
    "rol":"super_admin"
  }'
```

### **Postman Collection**
Se recomienda usar la documentación de endpoints para crear una colección de Postman con todos los endpoints disponibles.

## 🛠️ Scripts Disponibles

```bash
# Desarrollo con hot-reload
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar en producción
npm start

# Comandos de Prisma
npx prisma generate    # Generar cliente
npx prisma db push     # Aplicar schema a DB
npx prisma db pull     # Sincronizar desde DB existente
npx prisma studio      # Interfaz visual de DB
```

## 🔧 Configuración Avanzada

### **Variables de Entorno Completas**
```bash
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
DATABASE_URL="mysql://usuario:password@host:puerto/database"

# JWT
JWT_SECRET=clave-secreta-minimo-64-caracteres
JWT_EXPIRES_IN=2h
JWT_REFRESH_SECRET=otra-clave-secreta-diferente
JWT_REFRESH_EXPIRES_IN=30d

# Notificaciones SMS (opcional)
NOTIFICATION_API_URL=https://api.notificaciones.com/sms

# Logging
LOG_LEVEL=info
```

### **Configuración de Producción**
- Usar secretos JWT fuertes (mínimo 64 caracteres)
- Configurar HTTPS
- Implementar rate limiting
- Configurar monitoreo y logs
- Realizar backups regulares de base de datos

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autores

- **Equipo SIGED** - *Desarrollo inicial* - [tife502](https://github.com/tife502)

## 🙏 Agradecimientos

- Comunidad de Node.js y TypeScript
- Equipo de Prisma por el excelente ORM
- Contribuidores del ecosistema Express.js

---

*📧 Para soporte técnico o preguntas sobre la implementación, consulta la documentación detallada en cada módulo o crea un issue en el repositorio.*

**🚀 API SIGED - Transformando la gestión educativa con tecnología moderna**
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