# 👥 Documentación Completa - Módulo de Empleados API SIGED

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Tipos de Empleados](#tipos-de-empleados)
3. [Autenticación y Permisos](#autenticación-y-permisos)
4. [Estructura de Datos](#estructura-de-datos)
5. [Endpoints Principales](#endpoints-principales)
6. [Flujos Especializados](#flujos-especializados)
7. [Validaciones y Restricciones](#validaciones-y-restricciones)
8. [Ejemplos de Implementación Frontend](#ejemplos-de-implementación-frontend)
9. [Casos de Uso Específicos](#casos-de-uso-específicos)
10. [Códigos de Error](#códigos-de-error)

---

## 🏢 Descripción General

El módulo de empleados en SIGED gestiona **docentes** y **rectores** del sistema educativo. Es manejado principalmente por **gestores** que digitalizan la información diariamente, con supervisión administrativa de **admins** y **super_admins**.

### Características Principales
- **Dos tipos de empleados**: Docentes y Rectores
- **Digitalización diaria** por gestores
- **Auditoría completa** de cambios
- **Asignación a sedes** educativas
- **Gestión de horas extra** y suplencias
- **Estados de actividad** (activo/inactivo)
- **Comentarios de seguimiento**

---

## 👨‍🏫 Tipos de Empleados

### 1. **Docente**
```typescript
cargo: 'Docente'
```
- **Función**: Enseñanza en aulas
- **Asignación**: Pueden asignarse a múltiples sedes
- **Características**:
  - Horas extra por jornadas
  - Suplencias temporales
  - Información académica específica
  - Documentos laborales

### 2. **Rector**
```typescript
cargo: 'Rector'
```
- **Función**: Dirección de institución educativa
- **Asignación**: Responsable de institución completa
- **Características**:
  - Manejo de múltiples sedes
  - Decisiones administrativas
  - Reportes institucionales
  - Coordinación de docentes

---

## 🔐 Autenticación y Permisos

### Matriz de Permisos por Rol

| Acción | Gestor | Admin | Super Admin |
|--------|--------|-------|-------------|
| Crear empleado | ✅ | ✅ | ✅ |
| Ver empleados activos | ✅ | ✅ | ✅ |
| Editar empleado | ✅ | ✅ | ✅ |
| Ver empleado específico | ✅ | ✅ | ✅ |
| Ver horas extra | ✅ | ✅ | ✅ |
| Ver empleados inactivos | ❌ | ✅ | ✅ |
| Desactivar empleado | ❌ | ✅ | ✅ |
| Reactivar empleado | ❌ | ❌ | ✅ |
| Flujos de rector | ❌ | ✅ | ✅ |
| Flujos normales | ✅ | ✅ | ✅ |

### Headers Requeridos
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 📊 Estructura de Datos

### Interface Base para Crear Empleado

```typescript
interface ICreateEmpleado {
  tipo_documento: string;        // CC, CE, PA, etc.
  documento: string;             // Número único
  nombre: string;                // Requerido
  apellido: string;              // Requerido
  email: string;                 // Requerido, único
  direccion?: string;            // Opcional
  cargo: 'Docente' | 'Rector';   // Requerido
  estado?: 'activo' | 'inactivo'; // Opcional, default: 'activo'
}
```

### Interface para Comentario de Empleado

```typescript
interface ICreateComentarioEmpleado {
  observacion: string;    // Comentario del gestor
  empleado_id: string;    // ID del empleado
  usuario_id: string;     // ID del usuario que comenta
}
```

### Estados Posibles

```typescript
enum EmpleadoEstado {
  activo = 'activo',       // Empleado trabajando
  inactivo = 'inactivo',   // Empleado dado de baja
  suspendido = 'suspendido' // Empleado temporalmente suspendido
}

enum EmpleadoCargo {
  Docente = 'Docente',     // Profesor de aula
  Rector = 'Rector'        // Director de institución
}
```

### Tipos de Documento Válidos

```typescript
// Tipos comunes en Colombia
const tiposDocumento = [
  'CC',    // Cédula de Ciudadanía
  'CE',    // Cédula de Extranjería
  'PA',    // Pasaporte
  'TI',    // Tarjeta de Identidad
  'RC',    // Registro Civil
  'NIT',   // Número de Identificación Tributaria
];
```

### Filtros de Búsqueda

```typescript
interface IEmpleadoFilters {
  tipo_documento?: string;
  documento?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  cargo?: 'Docente' | 'Rector';
  estado?: 'activo' | 'inactivo';
  sede_id?: string;      // Filtrar por sede específica
}
```

---

## 🌐 Endpoints Principales

### 📋 Base URL
```
https://api-siged.com/api/v1/empleados
```

### 1. **Crear Empleado**

#### `POST /empleados/`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "tipo_documento": "CC",
  "documento": "12345678",
  "nombre": "Juan Carlos",
  "apellido": "Pérez García",
  "email": "juan.perez@colegio.edu.co",
  "direccion": "Calle 123 #45-67, Bogotá",
  "cargo": "Docente",
  "estado": "activo",
  "comentario": "Docente nuevo con experiencia en matemáticas"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Empleado digitalizado exitosamente",
  "data": {
    "id": "uuid-generated-id",
    "tipo_documento": "CC",
    "documento": "12345678",
    "nombre": "Juan Carlos",
    "apellido": "Pérez García",
    "email": "juan.perez@colegio.edu.co",
    "direccion": "Calle 123 #45-67, Bogotá",
    "cargo": "Docente",
    "estado": "activo",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  "comentarioEmpleado": {
    "id": "comment-uuid",
    "observacion": "Docente nuevo con experiencia en matemáticas",
    "empleado_id": "uuid-generated-id",
    "usuario_id": "user-uuid",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Ya existe un empleado con este documento o email",
  "error": "Conflict"
}
```

### 2. **Obtener Lista de Empleados**

#### `GET /empleados/?page=1&limit=10&cargo=Docente&estado=activo`

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  page?: number;           // Página (default: 1)
  limit?: number;          // Elementos por página (default: 10)
  orderBy?: string;        // Campo para ordenar (default: 'created_at')
  orderDirection?: 'asc' | 'desc'; // Dirección (default: 'desc')
  
  // Filtros
  tipo_documento?: string;
  documento?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  cargo?: 'Docente' | 'Rector';
  estado?: 'activo' | 'inactivo';
  sede_id?: string;
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Empleados obtenidos exitosamente",
  "data": [
    {
      "id": "uuid-1",
      "tipo_documento": "CC",
      "documento": "12345678",
      "nombre": "Juan Carlos",
      "apellido": "Pérez García",
      "email": "juan.perez@colegio.edu.co",
      "direccion": "Calle 123 #45-67",
      "cargo": "Docente",
      "estado": "activo",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
    // ... más empleados
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "totalPages": 16,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 3. **Obtener Empleado por ID**

#### `GET /empleados/:id`

**Headers:**
```http
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Empleado obtenido exitosamente",
  "data": {
    "id": "uuid-empleado",
    "tipo_documento": "CC",
    "documento": "12345678",
    "nombre": "Juan Carlos",
    "apellido": "Pérez García",
    "email": "juan.perez@colegio.edu.co",
    "direccion": "Calle 123 #45-67",
    "cargo": "Docente",
    "estado": "activo",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. **Actualizar Empleado**

#### `PUT /empleados/:id`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Juan Carlos",
  "apellido": "Pérez García",
  "email": "nuevo.email@colegio.edu.co",
  "direccion": "Nueva dirección 456",
  "cargo": "Rector",
  "estado": "activo"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Información del empleado actualizada exitosamente",
  "data": {
    "id": "uuid-empleado",
    "tipo_documento": "CC",
    "documento": "12345678",
    "nombre": "Juan Carlos",
    "apellido": "Pérez García",
    "email": "nuevo.email@colegio.edu.co",
    "direccion": "Nueva dirección 456",
    "cargo": "Rector",
    "estado": "activo",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T11:45:00.000Z"
  }
}
```

### 5. **Desactivar Empleado (Solo Admin+)**

#### `DELETE /empleados/:id`

**Headers:**
```http
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Empleado desactivado exitosamente",
  "data": {
    "id": "uuid-empleado",
    "estado": "inactivo",
    "updated_at": "2024-01-15T12:00:00.000Z"
  }
}
```

### 6. **Reactivar Empleado (Solo Super Admin)**

#### `PATCH /empleados/:id/reactivar`

**Headers:**
```http
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Empleado reactivado exitosamente",
  "data": {
    "id": "uuid-empleado",
    "estado": "activo",
    "updated_at": "2024-01-15T13:30:00.000Z"
  }
}
```

### 7. **Obtener Empleados Inactivos (Solo Admin+)**

#### `GET /empleados/inactivos?page=1&limit=10`

**Headers:**
```http
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Empleados inactivos obtenidos exitosamente",
  "data": [
    {
      "id": "uuid-inactivo",
      "tipo_documento": "CC",
      "documento": "87654321",
      "nombre": "María",
      "apellido": "González",
      "email": "maria.gonzalez@colegio.edu.co",
      "cargo": "Docente",
      "estado": "inactivo",
      "created_at": "2024-01-10T08:00:00.000Z",
      "updated_at": "2024-01-14T16:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 23,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 8. **Obtener Horas Extra de Empleado**

#### `GET /empleados/:empleadoId/horas-extra`

**Headers:**
```http
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Horas extra obtenidas exitosamente",
  "data": [
    {
      "id": "horas-extra-uuid",
      "empleado_id": "empleado-uuid",
      "sede_id": "sede-uuid",
      "cantidad_horas": 8.5,
      "fecha_realizacion": "2024-01-15",
      "jornada": "nocturna",
      "observacion": "Clases de refuerzo",
      "estado": "aprobada",
      "created_at": "2024-01-15T18:00:00.000Z"
    }
  ]
}
```

---

## 🔧 Flujos Especializados

### 1. **Flujo Normal de Empleados**
Base URL: `/empleados/normal/`

#### Crear Empleado con Asignación a Sede
```http
POST /empleados/normal/crear-con-sede
```

**Body:**
```json
{
  "empleado": {
    "tipo_documento": "CC",
    "documento": "12345678",
    "nombre": "Ana María",
    "apellido": "Rodríguez",
    "email": "ana.rodriguez@colegio.edu.co",
    "cargo": "Docente",
    "direccion": "Carrera 15 #23-45"
  },
  "informacionAcademica": {
    "nivel_academico": "licenciado",
    "titulo": "Licenciatura en Matemáticas",
    "institucion": "Universidad Nacional",
    "anos_experiencia": 5
  },
  "sedeId": "sede-uuid-123",
  "fechaAsignacion": "2024-01-15"
}
```

### 2. **Flujo de Rectores**
Base URL: `/empleados/rector/`

#### Crear Rector Completo con Institución
```http
POST /empleados/rector/crear-completo
```

**Body:**
```json
{
  "empleado": {
    "tipo_documento": "CC", 
    "documento": "87654321",
    "nombre": "Carlos Alberto",
    "apellido": "Mendoza",
    "email": "carlos.mendoza@institucion.edu.co",
    "cargo": "Rector",
    "direccion": "Avenida Principal #100-50"
  },
  "informacionAcademica": {
    "nivel_academico": "magister",
    "titulo": "Magister en Educación",
    "institucion": "Universidad Pedagógica",
    "anos_experiencia": 15
  },
  "institucion": {
    "nombre": "Institución Educativa San José",
    "esSedePrincipal": true
  },
  "sedes": {
    "crear": [
      {
        "nombre": "Sede Principal",
        "zona": "urbana",
        "direccion": "Calle 50 #30-20",
        "codigo_DANE": "11001234567",
        "esPrincipal": true
      },
      {
        "nombre": "Sede Rural El Prado",
        "zona": "rural", 
        "direccion": "Vereda El Prado",
        "codigo_DANE": "11001234568",
        "esPrincipal": false
      }
    ]
  }
}
```

---

## ✅ Validaciones y Restricciones

### Validaciones de Entrada

#### 1. **Campos Obligatorios**
```typescript
const camposRequeridos = [
  'tipo_documento',  // No puede estar vacío
  'documento',       // Único en el sistema
  'nombre',         // Mínimo 2 caracteres
  'apellido',       // Mínimo 2 caracteres  
  'email',          // Formato válido y único
  'cargo'           // Solo 'Docente' o 'Rector'
];
```

#### 2. **Validación de Email**
```typescript
// Formato válido de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Casos de error:
- Email ya registrado
- Formato inválido
- Dominio no permitido (opcional)
```

#### 3. **Validación de Documento**
```typescript
// Reglas por tipo:
CC: /^\d{6,10}$/,           // 6-10 dígitos
CE: /^\d{6,10}$/,           // 6-10 dígitos  
PA: /^[A-Z0-9]{6,12}$/,     // 6-12 caracteres alfanuméricos
TI: /^\d{10,11}$/           // 10-11 dígitos
```

#### 4. **Estados Válidos**
```typescript
// Transiciones permitidas:
activo → inactivo     // ✅ Admin puede desactivar
inactivo → activo     // ✅ Solo Super Admin puede reactivar
activo → suspendido   // ✅ Por decisión administrativa
suspendido → activo   // ✅ Al finalizar suspensión
```

### Restricciones de Negocio

1. **Documento único**: No pueden existir dos empleados con el mismo documento
2. **Email único**: No pueden existir dos empleados con el mismo email
3. **Cargo rector**: Solo puede haber un rector activo por institución
4. **Auditoría obligatoria**: Todo cambio debe registrar quién lo hizo
5. **Comentario requerido**: Al crear empleado debe incluir observación

---

## 💻 Ejemplos de Implementación Frontend

### 1. **Servicio de Empleados (TypeScript)**

```typescript
// services/empleado.service.ts
import api from './api.service';

export interface CreateEmpleadoRequest {
  tipo_documento: string;
  documento: string;
  nombre: string;
  apellido: string;
  email: string;
  direccion?: string;
  cargo: 'Docente' | 'Rector';
  estado?: 'activo' | 'inactivo';
  comentario: string;
}

export interface EmpleadoFilters {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  tipo_documento?: string;
  documento?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  cargo?: 'Docente' | 'Rector';
  estado?: 'activo' | 'inactivo';
  sede_id?: string;
}

export interface Empleado {
  id: string;
  tipo_documento: string;
  documento: string;
  nombre: string;
  apellido: string;
  email: string;
  direccion?: string;
  cargo: 'Docente' | 'Rector';
  estado: 'activo' | 'inactivo';
  created_at: string;
  updated_at: string;
}

export interface EmpleadosResponse {
  success: boolean;
  message: string;
  data: Empleado[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class EmpleadoService {
  
  // Crear empleado
  static async createEmpleado(data: CreateEmpleadoRequest): Promise<Empleado> {
    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        data: Empleado;
        comentarioEmpleado: any;
      }>('/empleados', data);
      
      if (response.data.success) {
        console.log('✅ Empleado creado:', response.data.data);
        return response.data.data;
      }
      
      throw new Error(response.data.message);
    } catch (error: any) {
      console.error('❌ Error creando empleado:', error);
      throw this.handleError(error);
    }
  }

  // Obtener lista de empleados
  static async getEmpleados(filters: EmpleadoFilters = {}): Promise<EmpleadosResponse> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<EmpleadosResponse>(`/empleados?${params}`);
      
      console.log(`✅ Empleados obtenidos: ${response.data.data.length}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo empleados:', error);
      throw this.handleError(error);
    }
  }

  // Obtener empleado por ID
  static async getEmpleadoById(id: string): Promise<Empleado> {
    try {
      const response = await api.get<{
        success: boolean;
        message: string;
        data: Empleado;
      }>(`/empleados/${id}`);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message);
    } catch (error: any) {
      console.error(`❌ Error obteniendo empleado ${id}:`, error);
      throw this.handleError(error);
    }
  }

  // Actualizar empleado
  static async updateEmpleado(id: string, data: Partial<CreateEmpleadoRequest>): Promise<Empleado> {
    try {
      const response = await api.put<{
        success: boolean;
        message: string;
        data: Empleado;
      }>(`/empleados/${id}`, data);
      
      if (response.data.success) {
        console.log('✅ Empleado actualizado:', response.data.data);
        return response.data.data;
      }
      
      throw new Error(response.data.message);
    } catch (error: any) {
      console.error(`❌ Error actualizando empleado ${id}:`, error);
      throw this.handleError(error);
    }
  }

  // Desactivar empleado (solo admin+)
  static async deactivateEmpleado(id: string): Promise<boolean> {
    try {
      const response = await api.delete<{
        success: boolean;
        message: string;
        data: any;
      }>(`/empleados/${id}`);
      
      if (response.data.success) {
        console.log(`✅ Empleado ${id} desactivado`);
        return true;
      }
      
      throw new Error(response.data.message);
    } catch (error: any) {
      console.error(`❌ Error desactivando empleado ${id}:`, error);
      throw this.handleError(error);
    }
  }

  // Reactivar empleado (solo super admin)
  static async reactivateEmpleado(id: string): Promise<boolean> {
    try {
      const response = await api.patch<{
        success: boolean;
        message: string;
        data: any;
      }>(`/empleados/${id}/reactivar`);
      
      if (response.data.success) {
        console.log(`✅ Empleado ${id} reactivado`);
        return true;
      }
      
      throw new Error(response.data.message);
    } catch (error: any) {
      console.error(`❌ Error reactivando empleado ${id}:`, error);
      throw this.handleError(error);
    }
  }

  // Obtener empleados inactivos (solo admin+)
  static async getEmpleadosInactivos(filters: EmpleadoFilters = {}): Promise<EmpleadosResponse> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get<EmpleadosResponse>(`/empleados/inactivos?${params}`);
      
      console.log(`✅ Empleados inactivos obtenidos: ${response.data.data.length}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo empleados inactivos:', error);
      throw this.handleError(error);
    }
  }

  // Obtener horas extra de empleado
  static async getHorasExtraEmpleado(empleadoId: string): Promise<any[]> {
    try {
      const response = await api.get<{
        success: boolean;
        message: string;
        data: any[];
      }>(`/empleados/${empleadoId}/horas-extra`);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message);
    } catch (error: any) {
      console.error(`❌ Error obteniendo horas extra empleado ${empleadoId}:`, error);
      throw this.handleError(error);
    }
  }

  // Manejar errores de API
  private static handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    }
    return new Error(error.message || 'Error desconocido');
  }
}

export default EmpleadoService;
```

### 2. **Componente de Formulario para Crear Empleado**

```typescript
// components/CreateEmpleadoForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EmpleadoService, { CreateEmpleadoRequest } from '../services/empleado.service';

const CreateEmpleadoForm: React.FC = () => {
  const [formData, setFormData] = useState<CreateEmpleadoRequest>({
    tipo_documento: 'CC',
    documento: '',
    nombre: '',
    apellido: '',
    email: '',
    direccion: '',
    cargo: 'Docente',
    estado: 'activo',
    comentario: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const nuevoEmpleado = await EmpleadoService.createEmpleado(formData);
      console.log('✅ Empleado creado exitosamente:', nuevoEmpleado);
      
      navigate('/empleados', {
        state: {
          message: `Empleado ${nuevoEmpleado.nombre} ${nuevoEmpleado.apellido} creado exitosamente`,
          type: 'success'
        }
      });
    } catch (error: any) {
      setError(error.message);
      console.error('❌ Error creando empleado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          Crear Nuevo Empleado
        </h1>
        
        <p className="text-gray-600 mb-6">
          Digitalizando como: <strong>{user?.nombre}</strong> ({user?.rol})
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Información Básica */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4 text-gray-900">
              Información Personal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento *
                </label>
                <select
                  name="tipo_documento"
                  value={formData.tipo_documento}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PA">Pasaporte</option>
                  <option value="TI">Tarjeta de Identidad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Documento *
                </label>
                <input
                  type="text"
                  name="documento"
                  value={formData.documento}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 12345678"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombres *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Juan Carlos"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos *
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Pérez García"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: juan.perez@colegio.edu.co"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo *
                </label>
                <select
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Docente">Docente</option>
                  <option value="Rector">Rector</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Calle 123 #45-67, Bogotá"
              />
            </div>
          </div>

          {/* Comentario de Digitalización */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4 text-gray-900">
              Observaciones de Digitalización
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comentario *
              </label>
              <textarea
                name="comentario"
                value={formData.comentario}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe las características, experiencia o observaciones relevantes del empleado..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Este comentario será registrado como parte del proceso de digitalización.
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando Empleado...
                </>
              ) : (
                'Crear Empleado'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/empleados')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmpleadoForm;
```

### 3. **Componente de Lista de Empleados**

```typescript
// components/EmpleadosList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EmpleadoService, { EmpleadoFilters, EmpleadosResponse, Empleado } from '../services/empleado.service';

const EmpleadosList: React.FC = () => {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  const [filters, setFilters] = useState<EmpleadoFilters>({
    page: 1,
    limit: 10,
    nombre: '',
    documento: '',
    cargo: undefined,
    estado: undefined
  });

  const { hasAnyRole } = useAuth();

  useEffect(() => {
    loadEmpleados();
  }, [filters]);

  const loadEmpleados = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: EmpleadosResponse = await EmpleadoService.getEmpleados(filters);
      
      if (response.success) {
        setEmpleados(response.data);
        setPagination(response.pagination);
      }
    } catch (error: any) {
      setError(error.message);
      console.error('❌ Error cargando empleados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof EmpleadoFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset a primera página
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleDeactivateEmpleado = async (empleadoId: string, nombreCompleto: string) => {
    if (!confirm(`¿Estás seguro de que quieres desactivar a ${nombreCompleto}?`)) {
      return;
    }

    try {
      await EmpleadoService.deactivateEmpleado(empleadoId);
      loadEmpleados(); // Recargar lista
      alert(`Empleado ${nombreCompleto} desactivado exitosamente`);
    } catch (error: any) {
      alert(`Error desactivando empleado: ${error.message}`);
    }
  };

  const getRoleColor = (cargo: string) => {
    return cargo === 'Rector' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const getStatusColor = (estado: string) => {
    return estado === 'activo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de Empleados
        </h1>
        
        <div className="flex gap-3">
          <Link
            to="/empleados/crear"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
          >
            Crear Empleado
          </Link>
          
          {hasAnyRole(['admin', 'super_admin']) && (
            <Link
              to="/empleados/inactivos"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 font-medium"
            >
              Ver Inactivos
            </Link>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-900">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por Nombre
            </label>
            <input
              type="text"
              value={filters.nombre || ''}
              onChange={(e) => handleFilterChange('nombre', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar empleado..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documento
            </label>
            <input
              type="text"
              value={filters.documento || ''}
              onChange={(e) => handleFilterChange('documento', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Número documento..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cargo
            </label>
            <select
              value={filters.cargo || ''}
              onChange={(e) => handleFilterChange('cargo', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los cargos</option>
              <option value="Docente">Docente</option>
              <option value="Rector">Rector</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.estado || ''}
              onChange={(e) => handleFilterChange('estado', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Tabla de empleados */}
      {!isLoading && !error && (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {empleados.map((empleado) => (
                  <tr key={empleado.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {empleado.nombre} {empleado.apellido}
                        </div>
                        <div className="text-sm text-gray-500">
                          {empleado.direccion}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {empleado.tipo_documento} {empleado.documento}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {empleado.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(empleado.cargo)}`}>
                        {empleado.cargo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(empleado.estado)}`}>
                        {empleado.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        to={`/empleados/${empleado.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver
                      </Link>
                      <Link
                        to={`/empleados/${empleado.id}/editar`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </Link>
                      {empleado.estado === 'activo' && hasAnyRole(['admin', 'super_admin']) && (
                        <button
                          onClick={() => handleDeactivateEmpleado(
                            empleado.id, 
                            `${empleado.nombre} ${empleado.apellido}`
                          )}
                          className="text-red-600 hover:text-red-900"
                        >
                          Desactivar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-medium">
                      {((pagination.page - 1) * pagination.limit) + 1}
                    </span>{' '}
                    a{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    de{' '}
                    <span className="font-medium">{pagination.total}</span> empleados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmpleadosList;
```

---

## 🎯 Casos de Uso Específicos

### 1. **Digitalizador de Gestores (Flujo Diario)**

**Escenario**: Un gestor necesita digitalizar información de un nuevo docente.

**Proceso**:
1. Login con credenciales de gestor
2. Navegar a "Crear Empleado"
3. Llenar formulario completo
4. Incluir comentario descriptivo
5. Sistema registra quién digitalizó y cuándo
6. Empleado queda disponible para asignación a sedes

**Validaciones Especiales**:
- Documento y email únicos
- Comentario obligatorio para auditoría
- Log automático de quién digitalizó

### 2. **Flujo de Rector (Administrativo)**

**Escenario**: Un admin necesita crear un rector completo con su institución.

**Proceso**:
1. Login con credenciales admin+
2. Usar endpoint `/empleados/rector/crear-completo`
3. Crear empleado con cargo "Rector"
4. Crear institución educativa asociada
5. Crear/asignar sedes a la institución
6. Establecer rector como responsable

**Consideraciones**:
- Solo admin+ puede crear rectores
- Un rector por institución
- Manejo de múltiples sedes

### 3. **Búsqueda y Filtrado (Operativo)**

**Escenario**: Un gestor necesita encontrar docentes de matemáticas en zona rural.

**Implementación**:
```typescript
const filters = {
  cargo: 'Docente',
  estado: 'activo',
  sede_id: 'sede-rural-123'  // Filtrar por sede específica
};

const empleados = await EmpleadoService.getEmpleados(filters);
```

### 4. **Desactivación Administrativa**

**Escenario**: Un empleado se retira y debe ser desactivado.

**Proceso**:
1. Admin busca empleado específico
2. Confirma desactivación
3. Sistema hace borrado lógico (estado = 'inactivo')
4. Log crítico de auditoría
5. Empleado no aparece en listas activas

**Auditoría Generada**:
```json
{
  "level": "warn",
  "message": "🚨 EMPLEADO DESACTIVADO - Decisión administrativa",
  "empleado_id": "uuid",
  "empleado_documento": "12345678",
  "empleado_nombre": "Juan Pérez",
  "desactivado_por": "admin-uuid",
  "fecha_desactivacion": "2024-01-15T16:30:00.000Z",
  "razon": "Borrado lógico administrativo"
}
```

---

## ⚠️ Códigos de Error

### Errores de Validación (400)

```json
{
  "success": false,
  "message": "Faltan datos requeridos: documento, nombre, email",
  "error": "Validation Error"
}
```

```json
{
  "success": false,
  "message": "El email proporcionado no es válido",
  "error": "Validation Error"
}
```

### Errores de Conflicto (400)

```json
{
  "success": false,
  "message": "Ya existe un empleado con este documento o email",
  "error": "Conflict"
}
```

### Errores de Autorización (401/403)

```json
{
  "ok": false,
  "msg": "Token de autorización requerido"
}
```

```json
{
  "ok": false,
  "msg": "No tienes permisos para realizar esta acción"
}
```

### Errores de Recurso No Encontrado (404)

```json
{
  "success": false,
  "message": "Empleado no encontrado",
  "error": "Not Found"
}
```

### Errores de Estado (400)

```json
{
  "success": false,
  "message": "El empleado ya está inactivo",
  "error": "Bad Request"
}
```

---

## 📝 Notas Importantes

### Para el Desarrollo Frontend

1. **Siempre incluir JWT**: Todos los endpoints requieren autenticación
2. **Manejar permisos**: Verificar roles antes de mostrar opciones
3. **Validación cliente**: Implementar validaciones en formularios
4. **Estados de carga**: Mostrar indicadores durante peticiones
5. **Manejo de errores**: Capturar y mostrar errores específicos
6. **Auditoría**: Mostrar quién y cuándo se digitalizó información

### Flujo de Trabajo Recomendado

1. **Autenticación**: Login y verificación de permisos
2. **Navegación**: Según rol del usuario
3. **Formularios**: Con validación en tiempo real
4. **Confirmaciones**: Para acciones destructivas
5. **Feedback**: Mensajes claros de éxito/error
6. **Logs**: Para debugging y auditoría

**La documentación está completa y lista para la implementación frontend! 🚀**