# ⚙️ CONFIGURACIÓN DEL PROYECTO - API SIGED

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Configuración de Entorno](#configuración-de-entorno)
4. [Base de Datos y Prisma](#base-de-datos-y-prisma)
5. [Scripts y Comandos](#scripts-y-comandos)
6. [Dependencias](#dependencias)
7. [Deployment y Producción](#deployment-y-producción)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Descripción General

**API SIGED** es una aplicación Node.js construida con TypeScript, Express.js y Prisma ORM, diseñada para la gestión integral de sistemas educativos distritales.

### 🛠️ **Stack Tecnológico**

- **Runtime**: Node.js 18+
- **Lenguaje**: TypeScript 5.2+
- **Framework Web**: Express.js 4.x
- **ORM**: Prisma 6.x
- **Base de Datos**: MySQL 8.x
- **Autenticación**: JWT con refresh tokens
- **Logging**: Winston
- **Validación**: Zod (middleware personalizado)
- **Hashing**: bcrypt
- **UUID**: uuid v4

---

## 📁 Estructura del Proyecto

```
API_LOGICA_SIGED/
├── 📁 src/                           # Código fuente
│   ├── 📁 auth/                      # Autenticación
│   │   ├── auth.controller.ts
│   │   └── auth.routes.ts
│   ├── 📁 config/                    # Configuración
│   │   ├── envs.ts                   # Variables de entorno
│   │   ├── index.ts                  # Exportaciones centrales
│   │   └── 📁 adapters/              # Adaptadores
│   │       ├── uuid.adapter.ts
│   │       └── winstonAdapter.ts
│   ├── 📁 domain/                    # Lógica de negocio
│   │   ├── 📁 dtos/                  # Data Transfer Objects
│   │   ├── 📁 exceptions/            # Excepciones personalizadas
│   │   ├── 📁 interfaces/            # Interfaces y tipos
│   │   └── 📁 utils/                 # Utilidades
│   ├── 📁 middlewares/               # Middleware personalizado
│   │   ├── auth.middleware.ts        # Autenticación y autorización
│   │   └── validation.middleware.ts  # Validaciones
│   ├── 📁 modulos/                   # Módulos de negocio
│   │   ├── 📁 empleado/              # Gestión de empleados
│   │   ├── 📁 usuario/               # Gestión de usuarios
│   │   ├── 📁 sede/                  # Gestión de sedes
│   │   ├── 📁 actos.administrativos/ # Actos administrativos
│   │   ├── 📁 horas.extras/          # Horas extra
│   │   ├── 📁 suplencias/            # Suplencias
│   │   ├── 📁 documentos/            # Sistema de documentos
│   │   └── 📁 informacion.academica/ # Información académica
│   ├── 📁 presentation/              # Capa de presentación
│   │   ├── routes.ts                 # Router principal
│   │   └── server.ts                 # Servidor Express
│   ├── 📁 prisma/                    # Servicios de Prisma
│   │   ├── prisma.connection.ts      # Conexión singleton
│   │   └── prisma.service.ts         # Servicio principal
│   ├── 📁 services/                  # Servicios auxiliares
│   │   ├── jwt.service.ts            # Gestión JWT
│   │   ├── notification.service.ts   # Notificaciones SMS
│   │   └── token-blacklist.service.ts # Blacklist de tokens
│   └── app.ts                        # Punto de entrada
├── 📁 prisma/                        # Configuración Prisma
│   └── schema.prisma                 # Schema de base de datos
├── 📁 dist/                          # Código compilado (auto-generado)
├── 📁 node_modules/                  # Dependencias (auto-generado)
├── 📁 documentación/                 # Documentación del proyecto
├── package.json                      # Configuración del proyecto
├── tsconfig.json                     # Configuración TypeScript
├── .env.template                     # Template de variables de entorno
├── .env                              # Variables de entorno (no versionado)
├── .gitignore                        # Archivos ignorados por git
└── dockerfile                        # Configuración Docker
```

---

## 🔧 Configuración de Entorno

### **Variables de Entorno**

Copia `.env.template` a `.env` y configura las siguientes variables:

```bash
# Puerto del servidor
PORT=3000

# Base de datos MySQL
DATABASE_URL="mysql://usuario:password@host:puerto/nombre_db"

# Configuración JWT
JWT_SECRET=tu-clave-secreta-muy-larga-y-compleja-para-produccion
JWT_EXPIRES_IN=2h
JWT_REFRESH_SECRET=otra-clave-secreta-diferente-para-refresh-tokens
JWT_REFRESH_EXPIRES_IN=30d

# Servicio de notificaciones SMS (opcional)
NOTIFICATION_API_URL=https://api.notificaciones.com/sms

# Entorno de ejecución
NODE_ENV=development
```

### **Configuración por Entorno**

#### **🔧 Desarrollo**
```bash
# .env.development
PORT=3000
DATABASE_URL="mysql://root:password@localhost:3306/siged_dev"
JWT_SECRET=desarrollo-secret-key-no-usar-en-produccion
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
```

#### **🧪 Testing**
```bash
# .env.test
PORT=3001
DATABASE_URL="mysql://root:password@localhost:3306/siged_test"
JWT_SECRET=testing-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=1d
NODE_ENV=test
```

#### **🚀 Producción**
```bash
# .env.production
PORT=80
DATABASE_URL="mysql://user:secure-password@prod-server:3306/siged_prod"
JWT_SECRET=clave-ultra-secreta-de-al-menos-64-caracteres-aleatorios-para-produccion
JWT_EXPIRES_IN=2h
JWT_REFRESH_EXPIRES_IN=30d
NOTIFICATION_API_URL=https://prod-api.notificaciones.com/sms
NODE_ENV=production
```

---

## 🗄️ Base de Datos y Prisma

### **Configuración de MySQL**

```sql
-- Crear base de datos
CREATE DATABASE siged CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario específico
CREATE USER 'siged_user'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON siged.* TO 'siged_user'@'%';
FLUSH PRIVILEGES;
```

### **Comandos de Prisma**

```bash
# Instalar Prisma CLI
npm install -g prisma

# Generar cliente de Prisma
npx prisma generate

# Sincronizar schema con base de datos existente
npx prisma db pull

# Aplicar cambios del schema a la base de datos
npx prisma db push

# Ver base de datos en navegador
npx prisma studio

# Reset completo de base de datos (¡CUIDADO!)
npx prisma migrate reset

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy
```

### **Schema Principal**

El archivo `prisma/schema.prisma` define:

- **Modelos**: usuario, empleado, sede, suplencias, etc.
- **Relaciones**: entre entidades del sistema
- **Índices**: para optimización de consultas
- **Enums**: para valores controlados

---

## 📝 Scripts y Comandos

### **Scripts de package.json**

```json
{
  "scripts": {
    "dev": "tsnd --respawn --clear src/app.ts",
    "build": "rimraf ./dist && tsc",
    "start": "npm run build && node dist/app.js"
  }
}
```

### **Comandos de Desarrollo**

```bash
# Desarrollo con hot-reload
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar en producción
npm run start

# Instalar dependencias
npm install

# Limpiar y reinstalar
rm -rf node_modules package-lock.json && npm install
```

### **Comandos de Base de Datos**

```bash
# Backup de base de datos
mysqldump -u usuario -p siged > backup_siged_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u usuario -p siged < backup_siged_20251007.sql

# Conectar a MySQL
mysql -u siged_user -p -h host siged
```

---

## 📦 Dependencias

### **Dependencias de Producción**

```json
{
  "dependencies": {
    "@prisma/client": "^6.5.0",     // Cliente ORM
    "axios": "^1.7.5",             // Cliente HTTP
    "bcrypt": "^5.1.1",            // Hashing de contraseñas
    "cors": "^2.8.5",              // CORS middleware
    "express": "^4.18.2",          // Framework web
    "jsonwebtoken": "^9.0.10",     // JWT tokens
    "uuid": "^10.0.0",             // Generador UUID
    "winston": "^3.11.0",          // Sistema de logging
    "zod": "^3.22.4"               // Validación de schemas
  }
}
```

### **Dependencias de Desarrollo**

```json
{
  "devDependencies": {
    "@types/bcrypt": "^6.0.0",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.18",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^20.8.0",
    "@types/uuid": "^10.0.0",
    "@types/winston": "^2.4.4",
    "prisma": "^6.5.0",            // Prisma CLI
    "rimraf": "^5.0.5",            // Limpieza de directorios
    "ts-node-dev": "^2.0.0",       // Desarrollo con TypeScript
    "typescript": "^5.2.2"         // Compilador TypeScript
  }
}
```

### **Instalación de Dependencias**

```bash
# Instalar todas las dependencias
npm install

# Instalar solo dependencias de producción
npm install --production

# Actualizar dependencias
npm update

# Auditar seguridad
npm audit
npm audit fix
```

---

## 🐳 Deployment y Producción

### **Dockerfile**

```dockerfile
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY src/ ./src/
COPY prisma/ ./prisma/

# Generar Prisma client
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]
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
      - JWT_SECRET=production-secret
    depends_on:
      - db
    
  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=siged
      - MYSQL_USER=siged_user
      - MYSQL_PASSWORD=password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

### **Comandos de Docker**

```bash
# Construir imagen
docker build -t siged-api .

# Ejecutar contenedor
docker run -p 3000:3000 -e DATABASE_URL="mysql://..." siged-api

# Docker Compose
docker-compose up -d
docker-compose down
docker-compose logs -f api
```

---

## 🔍 Troubleshooting

### **Problemas Comunes**

#### **1. Error de Conexión a Base de Datos**

```bash
# Verificar conexión MySQL
mysql -u siged_user -p -h host -e "SELECT 1;"

# Verificar variables de entorno
echo $DATABASE_URL

# Regenerar cliente Prisma
npx prisma generate
```

#### **2. Error de Compilación TypeScript**

```bash
# Limpiar y recompilar
rm -rf dist/
npm run build

# Verificar configuración TypeScript
npx tsc --noEmit
```

#### **3. Error de JWT**

```bash
# Verificar variables JWT
echo $JWT_SECRET
echo $JWT_REFRESH_SECRET

# Regenerar secretos
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### **4. Error de Permisos**

```bash
# Verificar permisos de archivos
ls -la src/
chmod +x scripts/setup.sh

# Verificar usuario del proceso
whoami
id
```

### **Logs y Debugging**

#### **Ubicación de Logs**

```bash
# Logs de aplicación
tail -f combined.log
tail -f error.log

# Logs de sistema
journalctl -u siged-api -f
docker logs -f container_name
```

#### **Niveles de Log**

```typescript
// Configuración Winston
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: {
    error: 0,    // Errores críticos
    warn: 1,     // Advertencias
    info: 2,     // Información general
    debug: 3     // Debugging detallado
  }
});
```

### **Monitoreo de Salud**

#### **Health Check Endpoint**

```bash
# Verificar estado de la API
curl http://localhost:3000/health

# Respuesta esperada:
{
  "status": "healthy",
  "timestamp": "2025-10-07T12:00:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

#### **Métricas Básicas**

```bash
# CPU y memoria
top -p $(pgrep node)
htop

# Conexiones de red
netstat -tlnp | grep :3000
ss -tlnp | grep :3000

# Espacio en disco
df -h
du -sh node_modules/
```

---

## 🔒 Seguridad en Producción

### **Configuraciones Recomendadas**

#### **Variables de Entorno**
- Usar secretos fuertes (mínimo 64 caracteres)
- Rotar claves JWT periódicamente
- No versionar archivos `.env`

#### **Base de Datos**
- Usar usuario con permisos mínimos necesarios
- Configurar SSL/TLS para conexiones
- Implementar backups automáticos

#### **Servidor**
- Usar HTTPS en producción
- Configurar firewall apropiado
- Implementar rate limiting
- Mantener dependencias actualizadas

### **Checklist de Seguridad**

```bash
# ✅ Verificar secretos JWT
# ✅ Configurar HTTPS
# ✅ Actualizar dependencias
# ✅ Configurar firewall
# ✅ Implementar backups
# ✅ Configurar monitoreo
# ✅ Revisar logs regularmente
# ✅ Documentar procedimientos
```

---

## 🚀 Performance y Optimización

### **Configuraciones de Rendimiento**

#### **Base de Datos**
```sql
-- Índices optimizados
CREATE INDEX idx_usuario_documento ON usuario(documento);
CREATE INDEX idx_empleado_estado ON empleado(estado);
CREATE INDEX idx_sede_estado ON sede(estado);
```

#### **Prisma**
```typescript
// Connection pooling
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  
  // Pool settings
  connection_limit = 10
  pool_timeout     = 20s
}
```

#### **Express**
```typescript
// Configuraciones de rendimiento
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

### **Monitoreo de Performance**

```bash
# Tiempo de respuesta
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/usuario

# Memoria y CPU
node --inspect src/app.ts
pm2 monit
```

---

*Documentación de Configuración del Proyecto - API SIGED*  
*Última actualización: Octubre 2025*  
*Versión: 1.0.0 - Configuración completa para desarrollo y producción*