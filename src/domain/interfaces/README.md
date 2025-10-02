# Interfaces de Prisma - API SIGED

## Descripción

Este archivo contiene todas las interfaces TypeScript para interactuar con los modelos de la base de datos SIGED usando Prisma. Las interfaces proporcionan tipado fuerte y validación para todas las operaciones CRUD.

## Estructura

### Enums
- `EmpleadoCargo`: Cargos disponibles (Docente, Rector)
- `EmpleadoEstado`: Estados del empleado (activo, inactivo, suspendido)
- `SedeEstado`: Estados de la sede (activa, inactiva)
- `SedeZona`: Zonas geográficas (urbana, rural)
- `UsuarioRol`: Roles de usuario (super_admin, admin, gestor)
- `HorasExtraJornada`: Jornadas de horas extra (mañana, tarde, sabatina, nocturna)
- Y más...

### Interfaces Principales

#### Para Empleados
```typescript
// Crear empleado
ICreateEmpleado
// Actualizar empleado
IUpdateEmpleado
// Filtros de búsqueda
IEmpleadoFilters
```

#### Para Usuarios
```typescript
// Crear usuario
ICreateUsuario
// Actualizar usuario
IUpdateUsuario
// Filtros de búsqueda
IUsuarioFilters
```

#### Para Sedes
```typescript
// Crear sede
ICreateSede
// Actualizar sede
IUpdateSede
// Filtros de búsqueda
ISedeFilters
```

#### Utilidades
```typescript
// Paginación
IPaginationOptions
IPaginatedResponse<T>
// Respuesta de API estándar
IApiResponse<T>
```

## Ejemplos de Uso

### 1. Crear un empleado

```typescript
import PrismaService from '../prisma/prisma.service';
import { ICreateEmpleado, EmpleadoCargo, EmpleadoEstado } from '../domain/interfaces';

const prismaService = PrismaService.getInstance();

const nuevoEmpleado: ICreateEmpleado = {
  tipo_documento: "CC",
  documento: "1234567890",
  nombre: "Juan",
  apellido: "Pérez",
  email: "juan.perez@ejemplo.com",
  direccion: "Calle 123 #45-67",
  cargo: EmpleadoCargo.Docente,
  estado: EmpleadoEstado.activo
};

const resultado = await prismaService.createEmpleado(nuevoEmpleado);
```

### 2. Buscar empleados con filtros y paginación

```typescript
import { IEmpleadoFilters, IPaginationOptions } from '../domain/interfaces';

const filtros: IEmpleadoFilters = {
  cargo: EmpleadoCargo.Docente,
  estado: EmpleadoEstado.activo,
  nombre: "Juan"
};

const paginacion: IPaginationOptions = {
  page: 1,
  limit: 10,
  orderBy: 'nombre',
  orderDirection: 'asc'
};

const empleados = await prismaService.getEmpleados(filtros, paginacion);
```

### 3. Crear usuario

```typescript
import { ICreateUsuario, UsuarioRol, UsuarioEstado } from '../domain/interfaces';

const nuevoUsuario: ICreateUsuario = {
  tipo_documento: "CC",
  documento: "9876543210",
  nombre: "Ana",
  apellido: "García",
  email: "ana.garcia@ejemplo.com",
  celular: "3001234567",
  contrasena: "password123", // Debería estar hasheada
  rol: UsuarioRol.gestor,
  estado: UsuarioEstado.activo
};

const usuario = await prismaService.createUsuario(nuevoUsuario);
```

### 4. Crear sede

```typescript
import { ICreateSede, SedeEstado, SedeZona } from '../domain/interfaces';

const nuevaSede: ICreateSede = {
  nombre: "Sede Central",
  estado: SedeEstado.activa,
  zona: SedeZona.urbana,
  direccion: "Avenida Principal #123",
  codigo_DANE: "12345678"
};

const sede = await prismaService.createSede(nuevaSede);
```

### 5. Registrar horas extra

```typescript
import { ICreateHorasExtra, HorasExtraJornada, HorasExtraEstado } from '../domain/interfaces';

const horasExtra: ICreateHorasExtra = {
  empleado_id: "uuid-del-empleado",
  sede_id: "uuid-de-la-sede",
  cantidad_horas: 8.5,
  fecha_realizacion: new Date("2024-01-15"),
  jornada: HorasExtraJornada.mañana,
  observacion: "Clases de refuerzo",
  estado: HorasExtraEstado.pendiente
};

const registro = await prismaService.createHorasExtra(horasExtra);
```

### 6. Crear suplencia

```typescript
import { ICreateSuplencia, SuplenciasJornada, SuplenciasEstado } from '../domain/interfaces';

const suplencia: ICreateSuplencia = {
  docente_ausente_id: "uuid-docente-ausente",
  causa_ausencia: "Incapacidad médica",
  fecha_inicio_ausencia: new Date("2024-01-15"),
  fecha_fin_ausencia: new Date("2024-01-20"),
  sede_id: "uuid-de-la-sede",
  docente_reemplazo_id: "uuid-docente-reemplazo",
  fecha_inicio_reemplazo: new Date("2024-01-15"),
  fecha_fin_reemplazo: new Date("2024-01-20"),
  horas_cubiertas: 40.0,
  jornada: SuplenciasJornada.mañana,
  observacion: "Suplencia temporal por incapacidad",
  estado: SuplenciasEstado.activa
};

const nuevaSuplencia = await prismaService.createSuplencia(suplencia);
```

## Controlador de Ejemplo

El archivo `empleado.controller.ts` muestra cómo implementar un controlador completo usando estas interfaces:

```typescript
import { EmpleadoController } from '../controllers/empleado.controller';

// En tus rutas
const empleadoController = new EmpleadoController();
router.post('/empleados', empleadoController.createEmpleado);
router.get('/empleados', empleadoController.getEmpleados);
router.get('/empleados/:id', empleadoController.getEmpleadoById);
router.put('/empleados/:id', empleadoController.updateEmpleado);
router.delete('/empleados/:id', empleadoController.deleteEmpleado);
```

## Beneficios del Tipado

1. **Autocompletado**: IntelliSense completo en VS Code
2. **Validación**: Errores de tipo en tiempo de compilación
3. **Documentación**: Las interfaces sirven como documentación
4. **Refactoring**: Cambios seguros en toda la aplicación
5. **Consistencia**: Mismo formato de datos en toda la app

## Patrón de Uso Recomendado

1. **Importar interfaces específicas** que necesites
2. **Validar datos de entrada** usando las interfaces
3. **Usar el servicio tipado** para operaciones de DB
4. **Manejar errores** de forma consistente
5. **Responder con formato estándar** usando `IApiResponse<T>`

## Notas Importantes

- Las contraseñas nunca se incluyen en las consultas SELECT por seguridad
- Todos los métodos incluyen logging para debugging
- Las transacciones están disponibles para operaciones complejas
- La paginación está implementada de forma eficiente
- Los filtros soportan búsqueda parcial (LIKE) cuando es apropiado