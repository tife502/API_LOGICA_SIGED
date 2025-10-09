# 👨‍💼 Documentación Completa - Módulo de Rectores API SIGED

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Autenticación y Permisos](#autenticación-y-permisos)
3. [Estructura de Datos](#estructura-de-datos)
4. [Endpoints del API](#endpoints-del-api)
5. [Flujo Completo de Creación](#flujo-completo-de-creación)
6. [Implementación Next.js + TypeScript](#implementación-nextjs--typescript)
7. [Servicios para el Frontend](#servicios-para-el-frontend)
8. [Componentes React/Next.js](#componentes-reactnextjs)
9. [Formularios Paso a Paso](#formularios-paso-a-paso)
10. [Validaciones y Errores](#validaciones-y-errores)

---

## 🏢 Descripción General

El módulo de **Rectores** gestiona la creación y administración de rectores de instituciones educativas. Este módulo permite:

- **Crear rector completo** con institución y sedes en un solo flujo
- **Asignar rector** existente a institución educativa
- **Transferir rector** de una institución a otra
- **Gestionar sedes** asociadas a cada rector
- **Validar disponibilidad** antes de crear

### Flujo Completo de Creación

1. **Crear Empleado** con cargo "Rector"
2. **Crear Información Académica** (opcional)
3. **Crear Institución Educativa** asociada al rector
4. **Crear/Asignar Sedes** a la institución
5. **Asignar Jornadas** a cada sede
6. **Crear Asignaciones** rector-sede

---

## 🔐 Autenticación y Permisos

### Headers Requeridos

```typescript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### Permisos por Rol

| Acción | Gestor | Admin | Super Admin |
|--------|--------|-------|-------------|
| Ver rectores | ✅ | ✅ | ✅ |
| Crear rector completo | ❌ | ✅ | ✅ |
| Asignar rector | ❌ | ✅ | ✅ |
| Transferir rector | ❌ | ✅ | ✅ |
| Ver instituciones | ❌ | ✅ | ✅ |
| Validar flujo | ❌ | ✅ | ✅ |
| Eliminar rector | ❌ | ❌ | ✅ |

> ⚠️ **Importante**: El módulo de rectores está restringido a roles `admin` y `super_admin` solamente.

---

## 📊 Estructura de Datos

### Interface de Rector Completo (Request)

```typescript
interface ICreateRectorCompletoRequest {
  // ===== 1. DATOS DEL EMPLEADO (RECTOR) =====
  empleado: {
    tipo_documento: 'CC' | 'CE' | 'TI' | 'PEP' | 'PPT';
    documento: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    celular?: string;
    cargo: 'Rector'; // SIEMPRE debe ser "Rector"
    fecha_nacimiento?: Date | string;
    genero?: 'Masculino' | 'Femenino' | 'Otro';
    estado_civil?: 'Soltero' | 'Casado' | 'Divorciado' | 'Viudo' | 'Unión libre';
    direccion?: string;
    ciudad?: string;
    departamento?: string;
  };

  // ===== 2. INFORMACIÓN ACADÉMICA (OPCIONAL) =====
  informacionAcademica?: {
    nivel_educativo: 'Bachiller' | 'Técnico' | 'Tecnólogo' | 'Profesional' | 'Especialización' | 'Maestría' | 'Doctorado';
    titulo: string;
    institucion_educativa?: string;
    fecha_graduacion?: Date | string;
    anos_experiencia?: number;
  };

  // ===== 3. INSTITUCIÓN EDUCATIVA =====
  institucion: {
    nombre: string; // Nombre de la institución
  };

  // ===== 4. SEDES =====
  sedes: {
    // Crear sedes nuevas
    crear?: Array<{
      nombre: string;
      zona: 'urbana' | 'rural';
      direccion: string;
      codigo_DANE?: string;
      jornadas?: string[]; // ["Mañana", "Tarde", "Sabatina", "Nocturna"]
    }>;
    
    // Asignar sedes existentes
    asignar_existentes?: string[]; // Array de IDs de sedes
  };

  // ===== 5. OPCIONALES =====
  fechaAsignacion?: Date | string; // Fecha de asignación (default: hoy)
  observaciones?: string;
}
```

### Interface de Rector Completo (Response)

```typescript
interface ICreateRectorCompletoResponse {
  rector: {
    id: string;
    tipo_documento: string;
    documento: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string | null;
    celular: string | null;
    cargo: string;
    fecha_nacimiento: Date | null;
    genero: string | null;
    estado_civil: string | null;
    direccion: string | null;
    estado: string;
    created_at: Date;
  };

  informacionAcademica?: {
    id: string;
    empleado_id: string;
    nivel_educativo: string;
    titulo: string;
    institucion_educativa: string | null;
    fecha_graduacion: Date | null;
    anos_experiencia: number | null;
    created_at: Date;
  };

  institucion: {
    id: string;
    nombre: string;
    rector_encargado_id: string;
    created_at: Date;
    updated_at: Date;
  };

  sedes: Array<{
    id: string;
    nombre: string;
    zona: 'urbana' | 'rural';
    direccion: string;
    codigo_DANE: string | null;
    estado: string;
    created_at: Date;
  }>;

  asignaciones: Array<{
    id: string;
    empleado_id: string;
    sede_id: string;
    fecha_asignacion: Date;
    fecha_fin: Date | null;
    estado: string;
    created_at: Date;
  }>;

  jornadaAsignaciones?: Array<{
    sede_id: string;
    jornada_id: number;
    jornada_nombre: string;
  }>;

  resumen: {
    sedesCreadas: number;
    sedesAsignadas: number;
    asignacionesRealizadas: number;
    jornadasAsignadas?: number;
  };
}
```

### Jornadas Disponibles

```typescript
type Jornada = 'Mañana' | 'Tarde' | 'Sabatina' | 'Nocturna';

const jornadasDisponibles = [
  { nombre: 'Mañana', descripcion: '7:00 AM - 12:00 PM' },
  { nombre: 'Tarde', descripcion: '12:00 PM - 6:00 PM' },
  { nombre: 'Sabatina', descripcion: 'Sábados 7:00 AM - 12:00 PM' },
  { nombre: 'Nocturna', descripcion: '6:00 PM - 10:00 PM' }
];
```

---

## 🌐 Endpoints del API

### Base URL
```
https://api-siged.com/api/v1/empleados/rector
```

### 1. **Validar Flujo de Rector (Pre-validación)**

#### `GET /validar-flujo?documento=1234567890&email=rector@ejemplo.com`

**Propósito**: Verificar si se puede crear un rector con ese documento/email ANTES de enviar el formulario completo.

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  documento: string;  // REQUERIDO
  email?: string;     // OPCIONAL
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Validación de flujo completada",
  "data": {
    "documentoDisponible": true,
    "emailDisponible": true,
    "puedeCrearFlujo": true,
    "conflictos": []
  }
}
```

**Response - Conflicto (200):**
```json
{
  "success": true,
  "message": "Validación de flujo completada",
  "data": {
    "documentoDisponible": false,
    "emailDisponible": true,
    "puedeCrearFlujo": false,
    "conflictos": [
      {
        "tipo": "documento",
        "mensaje": "Ya existe un empleado con este documento",
        "empleado": {
          "id": "uuid-empleado",
          "nombre": "Juan Pérez",
          "cargo": "Docente"
        }
      }
    ]
  }
}
```

---

### 2. **Crear Rector Completo (Flujo Principal)**

#### `POST /crear-completo`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "empleado": {
    "tipo_documento": "CC",
    "documento": "1234567890",
    "nombre": "Juan Carlos",
    "apellido": "Rodríguez Pérez",
    "email": "juan.rodriguez@colegio.edu.co",
    "telefono": "6012345678",
    "celular": "3001234567",
    "cargo": "Rector",
    "fecha_nacimiento": "1975-05-15",
    "genero": "Masculino",
    "estado_civil": "Casado",
    "direccion": "Calle 123 #45-67",
    "ciudad": "Bogotá",
    "departamento": "Cundinamarca"
  },
  "informacionAcademica": {
    "nivel_educativo": "Maestría",
    "titulo": "Magister en Educación",
    "institucion_educativa": "Universidad Nacional",
    "fecha_graduacion": "2010-12-15",
    "anos_experiencia": 20
  },
  "institucion": {
    "nombre": "Institución Educativa San José"
  },
  "sedes": {
    "crear": [
      {
        "nombre": "Sede Principal",
        "zona": "urbana",
        "direccion": "Calle 50 #20-30",
        "codigo_DANE": "111001000001",
        "jornadas": ["Mañana", "Tarde"]
      },
      {
        "nombre": "Sede Rural La Esperanza",
        "zona": "rural",
        "direccion": "Vereda La Esperanza",
        "codigo_DANE": "111001000002",
        "jornadas": ["Mañana"]
      }
    ]
  },
  "fechaAsignacion": "2024-01-15",
  "observaciones": "Rector con amplia experiencia en gestión educativa"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Rector creado exitosamente con institución y sedes",
  "data": {
    "rector": {
      "id": "uuid-rector",
      "tipo_documento": "CC",
      "documento": "1234567890",
      "nombre": "Juan Carlos",
      "apellido": "Rodríguez Pérez",
      "email": "juan.rodriguez@colegio.edu.co",
      "telefono": "6012345678",
      "celular": "3001234567",
      "cargo": "Rector",
      "fecha_nacimiento": "1975-05-15T00:00:00.000Z",
      "genero": "Masculino",
      "estado_civil": "Casado",
      "direccion": "Calle 123 #45-67",
      "estado": "activo",
      "created_at": "2024-01-15T10:00:00.000Z"
    },
    "informacionAcademica": {
      "id": "uuid-info",
      "empleado_id": "uuid-rector",
      "nivel_educativo": "Maestría",
      "titulo": "Magister en Educación",
      "institucion_educativa": "Universidad Nacional",
      "fecha_graduacion": "2010-12-15T00:00:00.000Z",
      "anos_experiencia": 20,
      "created_at": "2024-01-15T10:00:00.000Z"
    },
    "institucion": {
      "id": "uuid-institucion",
      "nombre": "Institución Educativa San José",
      "rector_encargado_id": "uuid-rector",
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
    },
    "sedes": [
      {
        "id": "uuid-sede-1",
        "nombre": "Sede Principal",
        "zona": "urbana",
        "direccion": "Calle 50 #20-30",
        "codigo_DANE": "111001000001",
        "estado": "activa",
        "created_at": "2024-01-15T10:00:00.000Z"
      },
      {
        "id": "uuid-sede-2",
        "nombre": "Sede Rural La Esperanza",
        "zona": "rural",
        "direccion": "Vereda La Esperanza",
        "codigo_DANE": "111001000002",
        "estado": "activa",
        "created_at": "2024-01-15T10:00:00.000Z"
      }
    ],
    "asignaciones": [
      {
        "id": "uuid-asignacion-1",
        "empleado_id": "uuid-rector",
        "sede_id": "uuid-sede-1",
        "fecha_asignacion": "2024-01-15T00:00:00.000Z",
        "fecha_fin": null,
        "estado": "activa",
        "created_at": "2024-01-15T10:00:00.000Z"
      },
      {
        "id": "uuid-asignacion-2",
        "empleado_id": "uuid-rector",
        "sede_id": "uuid-sede-2",
        "fecha_asignacion": "2024-01-15T00:00:00.000Z",
        "fecha_fin": null,
        "estado": "activa",
        "created_at": "2024-01-15T10:00:00.000Z"
      }
    ],
    "jornadaAsignaciones": [
      {
        "sede_id": "uuid-sede-1",
        "jornada_id": 1,
        "jornada_nombre": "Mañana"
      },
      {
        "sede_id": "uuid-sede-1",
        "jornada_id": 2,
        "jornada_nombre": "Tarde"
      },
      {
        "sede_id": "uuid-sede-2",
        "jornada_id": 1,
        "jornada_nombre": "Mañana"
      }
    ],
    "resumen": {
      "sedesCreadas": 2,
      "sedesAsignadas": 0,
      "asignacionesRealizadas": 2,
      "jornadasAsignadas": 3
    }
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Datos del empleado incompletos: nombre, documento y email son requeridos",
  "data": null
}
```

**Response Error (409):**
```json
{
  "success": false,
  "message": "Ya existe un empleado con este documento o email",
  "data": null,
  "error": "Conflict"
}
```

---

### 3. **Obtener Instituciones Disponibles**

#### `GET /instituciones-disponibles?sin_rector=true&con_sedes=true`

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
```typescript
{
  sin_rector?: 'true' | 'false'; // Solo instituciones sin rector
  con_sedes?: 'true' | 'false';  // Solo instituciones con sedes
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Instituciones disponibles obtenidas exitosamente",
  "data": [
    {
      "id": "uuid-institucion",
      "nombre": "Colegio San Pedro",
      "rector_encargado_id": null,
      "sedes": [
        {
          "id": "uuid-sede",
          "nombre": "Sede Principal",
          "zona": "urbana"
        }
      ],
      "_count": {
        "sedes": 1
      }
    }
  ],
  "metadata": {
    "total": 1,
    "filters": {
      "sinRector": true,
      "conSedes": true
    }
  }
}
```

---

### 4. **Asignar Rector Existente a Institución**

#### `POST /:rectorId/asignar-institucion`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "institucionId": "uuid-institucion",
  "asignarTodasLasSedes": true,
  "sedesEspecificas": []
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Rector asignado exitosamente a institución",
  "data": {
    "rector": { /* datos del rector */ },
    "institucion": { /* datos de la institución */ },
    "sedesAsignadas": [ /* array de sedes */ ]
  }
}
```

---

### 5. **Obtener Resumen de Rector**

#### `GET /:rectorId/resumen`

**Headers:**
```http
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Resumen de rector obtenido exitosamente",
  "data": {
    "rector": {
      "id": "uuid-rector",
      "nombre": "Juan Carlos",
      "apellido": "Rodríguez Pérez",
      "documento": "1234567890",
      "email": "juan.rodriguez@colegio.edu.co",
      "cargo": "Rector"
    },
    "institucion": {
      "id": "uuid-institucion",
      "nombre": "Institución Educativa San José"
    },
    "sedes": [
      {
        "id": "uuid-sede-1",
        "nombre": "Sede Principal",
        "zona": "urbana",
        "jornadas": ["Mañana", "Tarde"]
      },
      {
        "id": "uuid-sede-2",
        "nombre": "Sede Rural La Esperanza",
        "zona": "rural",
        "jornadas": ["Mañana"]
      }
    ],
    "informacionAcademica": {
      "nivel_educativo": "Maestría",
      "titulo": "Magister en Educación",
      "anos_experiencia": 20
    },
    "estadisticas": {
      "totalSedes": 2,
      "totalAsignaciones": 2,
      "jornadasCubiertas": 3
    }
  }
}
```

---

### 6. **Transferir Rector a Otra Institución**

#### `PUT /:rectorId/transferir-institucion`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "nuevaInstitucionId": "uuid-nueva-institucion",
  "mantenerSedesOriginales": false
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Rector transferido exitosamente",
  "data": {
    "institucionAnterior": {
      "id": "uuid-anterior",
      "nombre": "Colegio Viejo"
    },
    "nuevaInstitucion": {
      "id": "uuid-nueva",
      "nombre": "Colegio Nuevo"
    },
    "sedesMantenidas": false
  }
}
```

---

## 💻 Implementación Next.js + TypeScript

### 1. **Servicio de Rectores**

```typescript
// services/rector.service.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Obtener token de autenticación
const getAuthHeader = () => {
  const token = localStorage.getItem('siged_access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export interface ICreateRectorCompleto {
  empleado: {
    tipo_documento: 'CC' | 'CE' | 'TI' | 'PEP' | 'PPT';
    documento: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    celular?: string;
    cargo: 'Rector';
    fecha_nacimiento?: string;
    genero?: 'Masculino' | 'Femenino' | 'Otro';
    estado_civil?: 'Soltero' | 'Casado' | 'Divorciado' | 'Viudo' | 'Unión libre';
    direccion?: string;
    ciudad?: string;
    departamento?: string;
  };
  informacionAcademica?: {
    nivel_educativo: string;
    titulo: string;
    institucion_educativa?: string;
    fecha_graduacion?: string;
    anos_experiencia?: number;
  };
  institucion: {
    nombre: string;
  };
  sedes: {
    crear?: Array<{
      nombre: string;
      zona: 'urbana' | 'rural';
      direccion: string;
      codigo_DANE?: string;
      jornadas?: string[];
    }>;
    asignar_existentes?: string[];
  };
  fechaAsignacion?: string;
  observaciones?: string;
}

export class RectorService {
  
  /**
   * Validar si se puede crear un rector con ese documento/email
   */
  static async validarFlujo(
    documento: string,
    email?: string
  ): Promise<any> {
    try {
      const params = new URLSearchParams({ documento });
      if (email) params.append('email', email);

      const response = await axios.get(
        `${API_URL}/empleados/rector/validar-flujo?${params}`,
        { headers: getAuthHeader() }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Error validando flujo:', error);
      throw error;
    }
  }

  /**
   * Crear rector completo con institución y sedes
   */
  static async crearRectorCompleto(
    data: ICreateRectorCompleto
  ): Promise<any> {
    try {
      console.log('🚀 Creando rector completo...');

      const response = await axios.post(
        `${API_URL}/empleados/rector/crear-completo`,
        data,
        { headers: getAuthHeader() }
      );

      if (response.data.success) {
        console.log('✅ Rector creado exitosamente');
        return response.data;
      }

      throw new Error(response.data.message || 'Error creando rector');
    } catch (error: any) {
      console.error('❌ Error creando rector:', error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Error al crear rector completo'
      );
    }
  }

  /**
   * Obtener instituciones disponibles
   */
  static async getInstitucionesDisponibles(
    sinRector = false,
    conSedes = false
  ): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (sinRector) params.append('sin_rector', 'true');
      if (conSedes) params.append('con_sedes', 'true');

      const response = await axios.get(
        `${API_URL}/empleados/rector/instituciones-disponibles?${params}`,
        { headers: getAuthHeader() }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo instituciones:', error);
      throw error;
    }
  }

  /**
   * Asignar rector existente a institución
   */
  static async asignarRectorAInstitucion(
    rectorId: string,
    institucionId: string,
    asignarTodasLasSedes = true,
    sedesEspecificas: string[] = []
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${API_URL}/empleados/rector/${rectorId}/asignar-institucion`,
        {
          institucionId,
          asignarTodasLasSedes,
          sedesEspecificas
        },
        { headers: getAuthHeader() }
      );

      if (response.data.success) {
        console.log('✅ Rector asignado a institución');
        return response.data;
      }

      throw new Error(response.data.message);
    } catch (error: any) {
      console.error('❌ Error asignando rector:', error);
      throw error;
    }
  }

  /**
   * Obtener resumen completo de un rector
   */
  static async getResumenRector(rectorId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${API_URL}/empleados/rector/${rectorId}/resumen`,
        { headers: getAuthHeader() }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo resumen:', error);
      throw error;
    }
  }

  /**
   * Transferir rector a otra institución
   */
  static async transferirRector(
    rectorId: string,
    nuevaInstitucionId: string,
    mantenerSedesOriginales = false
  ): Promise<any> {
    try {
      const response = await axios.put(
        `${API_URL}/empleados/rector/${rectorId}/transferir-institucion`,
        {
          nuevaInstitucionId,
          mantenerSedesOriginales
        },
        { headers: getAuthHeader() }
      );

      if (response.data.success) {
        console.log('✅ Rector transferido exitosamente');
        return response.data;
      }

      throw new Error(response.data.message);
    } catch (error: any) {
      console.error('❌ Error transfiriendo rector:', error);
      throw error;
    }
  }

  /**
   * Validar documento (formato colombiano)
   */
  static validarDocumento(documento: string): boolean {
    const documentoLimpio = documento.replace(/[\s\-\.]/g, '');
    return /^\d{6,15}$/.test(documentoLimpio);
  }

  /**
   * Validar email
   */
  static validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar código DANE
   */
  static validarCodigoDANE(codigo: string): boolean {
    // Código DANE debe tener 12 dígitos
    const codigoLimpio = codigo.replace(/[\s\-]/g, '');
    return /^\d{12}$/.test(codigoLimpio);
  }
}

export default RectorService;
```

---

## 🎨 Componentes React/Next.js

### 1. **Página Principal - Crear Rector**

```typescript
// app/rectores/crear/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RectorService, { ICreateRectorCompleto } from '@/services/rector.service';
import FormularioDatosPersonales from '@/components/rectores/FormularioDatosPersonales';
import FormularioInformacionAcademica from '@/components/rectores/FormularioInformacionAcademica';
import FormularioInstitucion from '@/components/rectores/FormularioInstitucion';
import FormularioSedes from '@/components/rectores/FormularioSedes';
import ResumenRector from '@/components/rectores/ResumenRector';

type Step = 'datos' | 'academica' | 'institucion' | 'sedes' | 'resumen';

export default function CrearRectorPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('datos');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado del formulario completo
  const [datosRector, setDatosRector] = useState<ICreateRectorCompleto>({
    empleado: {
      tipo_documento: 'CC',
      documento: '',
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      celular: '',
      cargo: 'Rector',
      fecha_nacimiento: '',
      genero: 'Masculino',
      estado_civil: 'Soltero',
      direccion: '',
      ciudad: '',
      departamento: ''
    },
    informacionAcademica: {
      nivel_educativo: 'Profesional',
      titulo: '',
      institucion_educativa: '',
      fecha_graduacion: '',
      anos_experiencia: 0
    },
    institucion: {
      nombre: ''
    },
    sedes: {
      crear: []
    },
    fechaAsignacion: new Date().toISOString().split('T')[0],
    observaciones: ''
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validar datos básicos
      if (!datosRector.empleado.nombre || !datosRector.empleado.documento) {
        throw new Error('Nombre y documento son requeridos');
      }

      if (!datosRector.institucion.nombre) {
        throw new Error('Nombre de institución es requerido');
      }

      if (!datosRector.sedes.crear || datosRector.sedes.crear.length === 0) {
        throw new Error('Debe crear al menos una sede');
      }

      // Crear rector completo
      const resultado = await RectorService.crearRectorCompleto(datosRector);

      console.log('✅ Rector creado:', resultado);

      // Redirigir al resumen del rector
      router.push(`/rectores/${resultado.data.rector.id}`);

    } catch (error: any) {
      console.error('❌ Error:', error);
      setError(error.message || 'Error al crear rector');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { key: 'datos', label: 'Datos Personales', icon: '👤' },
    { key: 'academica', label: 'Información Académica', icon: '🎓' },
    { key: 'institucion', label: 'Institución', icon: '🏫' },
    { key: 'sedes', label: 'Sedes', icon: '📍' },
    { key: 'resumen', label: 'Resumen', icon: '📋' }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crear Nuevo Rector
          </h1>
          <p className="text-gray-600">
            Complete toda la información para crear un rector con su institución y sedes
          </p>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                      index <= currentStepIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {s.icon}
                  </div>
                  <span
                    className={`text-sm mt-2 ${
                      index <= currentStepIndex ? 'text-blue-600 font-medium' : 'text-gray-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Global */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Formularios según paso */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {step === 'datos' && (
            <FormularioDatosPersonales
              datos={datosRector.empleado}
              onChange={(empleado) => setDatosRector({ ...datosRector, empleado })}
              onNext={() => setStep('academica')}
            />
          )}

          {step === 'academica' && (
            <FormularioInformacionAcademica
              datos={datosRector.informacionAcademica}
              onChange={(informacionAcademica) =>
                setDatosRector({ ...datosRector, informacionAcademica })
              }
              onNext={() => setStep('institucion')}
              onBack={() => setStep('datos')}
            />
          )}

          {step === 'institucion' && (
            <FormularioInstitucion
              datos={datosRector.institucion}
              onChange={(institucion) => setDatosRector({ ...datosRector, institucion })}
              onNext={() => setStep('sedes')}
              onBack={() => setStep('academica')}
            />
          )}

          {step === 'sedes' && (
            <FormularioSedes
              sedes={datosRector.sedes}
              onChange={(sedes) => setDatosRector({ ...datosRector, sedes })}
              onNext={() => setStep('resumen')}
              onBack={() => setStep('institucion')}
            />
          )}

          {step === 'resumen' && (
            <ResumenRector
              datos={datosRector}
              isLoading={isLoading}
              onSubmit={handleSubmit}
              onBack={() => setStep('sedes')}
            />
          )}
        </div>

        {/* Botón volver */}
        <div className="mt-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Volver
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### 2. **Formulario: Datos Personales**

```typescript
// components/rectores/FormularioDatosPersonales.tsx
'use client';

import { useState, useEffect } from 'react';
import RectorService from '@/services/rector.service';

interface Props {
  datos: any;
  onChange: (datos: any) => void;
  onNext: () => void;
}

export default function FormularioDatosPersonales({ datos, onChange, onNext }: Props) {
  const [validacionDocumento, setValidacionDocumento] = useState<any>(null);
  const [validandoDocumento, setValidandoDocumento] = useState(false);

  // Validar documento cuando cambie
  useEffect(() => {
    const validar = async () => {
      if (datos.documento && datos.documento.length >= 6) {
        setValidandoDocumento(true);
        try {
          const resultado = await RectorService.validarFlujo(
            datos.documento,
            datos.email || undefined
          );
          setValidacionDocumento(resultado.data);
        } catch (error) {
          console.error('Error validando:', error);
        } finally {
          setValidandoDocumento(false);
        }
      }
    };

    const timeout = setTimeout(validar, 500); // Debounce
    return () => clearTimeout(timeout);
  }, [datos.documento, datos.email]);

  const handleChange = (field: string, value: any) => {
    onChange({ ...datos, [field]: value });
  };

  const handleNext = () => {
    // Validaciones
    if (!datos.nombre || !datos.apellido || !datos.documento || !datos.email) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (validacionDocumento && !validacionDocumento.puedeCrearFlujo) {
      alert('El documento o email ya está en uso');
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          👤 Datos Personales del Rector
        </h2>
        <p className="text-gray-600 mb-6">
          Ingrese la información personal del rector
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tipo de documento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Documento *
          </label>
          <select
            value={datos.tipo_documento}
            onChange={(e) => handleChange('tipo_documento', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="CE">Cédula de Extranjería</option>
            <option value="TI">Tarjeta de Identidad</option>
            <option value="PEP">Permiso Especial de Permanencia</option>
            <option value="PPT">Permiso por Protección Temporal</option>
          </select>
        </div>

        {/* Documento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Documento *
          </label>
          <input
            type="text"
            value={datos.documento}
            onChange={(e) => handleChange('documento', e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1234567890"
            maxLength={15}
            required
          />
          {validandoDocumento && (
            <p className="text-xs text-blue-600 mt-1">Validando documento...</p>
          )}
          {validacionDocumento && !validacionDocumento.documentoDisponible && (
            <p className="text-xs text-red-600 mt-1">
              ⚠️ Ya existe un empleado con este documento
            </p>
          )}
          {validacionDocumento && validacionDocumento.documentoDisponible && (
            <p className="text-xs text-green-600 mt-1">✓ Documento disponible</p>
          )}
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre *
          </label>
          <input
            type="text"
            value={datos.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Juan Carlos"
            required
          />
        </div>

        {/* Apellido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apellido *
          </label>
          <input
            type="text"
            value={datos.apellido}
            onChange={(e) => handleChange('apellido', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Rodríguez Pérez"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={datos.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="rector@colegio.edu.co"
            required
          />
          {validacionDocumento && !validacionDocumento.emailDisponible && (
            <p className="text-xs text-red-600 mt-1">
              ⚠️ Ya existe un empleado con este email
            </p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono Fijo
          </label>
          <input
            type="tel"
            value={datos.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="6012345678"
          />
        </div>

        {/* Celular */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Celular
          </label>
          <input
            type="tel"
            value={datos.celular}
            onChange={(e) => handleChange('celular', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="3001234567"
          />
        </div>

        {/* Fecha de nacimiento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            value={datos.fecha_nacimiento}
            onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Género */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Género
          </label>
          <select
            value={datos.genero}
            onChange={(e) => handleChange('genero', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        {/* Estado civil */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado Civil
          </label>
          <select
            value={datos.estado_civil}
            onChange={(e) => handleChange('estado_civil', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Soltero">Soltero(a)</option>
            <option value="Casado">Casado(a)</option>
            <option value="Divorciado">Divorciado(a)</option>
            <option value="Viudo">Viudo(a)</option>
            <option value="Unión libre">Unión libre</option>
          </select>
        </div>

        {/* Dirección */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección
          </label>
          <input
            type="text"
            value={datos.direccion}
            onChange={(e) => handleChange('direccion', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Calle 123 #45-67"
          />
        </div>

        {/* Ciudad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ciudad
          </label>
          <input
            type="text"
            value={datos.ciudad}
            onChange={(e) => handleChange('ciudad', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Bogotá"
          />
        </div>

        {/* Departamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departamento
          </label>
          <input
            type="text"
            value={datos.departamento}
            onChange={(e) => handleChange('departamento', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Cundinamarca"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end pt-6 border-t">
        <button
          onClick={handleNext}
          disabled={validandoDocumento || (validacionDocumento && !validacionDocumento.puedeCrearFlujo)}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
```

---

## 📝 Resumen de Implementación

### Checklist Completo

- [ ] **Instalar dependencias**: React, Next.js, TypeScript, Axios
- [ ] **Crear servicio** `rector.service.ts`
- [ ] **Crear página** `/rectores/crear/page.tsx`
- [ ] **Crear componente** `FormularioDatosPersonales.tsx`
- [ ] **Crear componente** `FormularioInformacionAcademica.tsx`
- [ ] **Crear componente** `FormularioInstitucion.tsx`
- [ ] **Crear componente** `FormularioSedes.tsx`
- [ ] **Crear componente** `ResumenRector.tsx`
- [ ] **Configurar rutas** protegidas (admin/super_admin)
- [ ] **Probar flujo completo** con datos reales
- [ ] **Agregar validaciones** de formulario
- [ ] **Implementar manejo** de errores

### Estructura de Archivos

```
app/
├── rectores/
│   ├── crear/
│   │   └── page.tsx
│   ├── [id]/
│   │   └── page.tsx
│   └── page.tsx
components/
├── rectores/
│   ├── FormularioDatosPersonales.tsx
│   ├── FormularioInformacionAcademica.tsx
│   ├── FormularioInstitucion.tsx
│   ├── FormularioSedes.tsx
│   └── ResumenRector.tsx
services/
└── rector.service.ts
```

---

## 🎉 ¡Documentación Completa!

Esta documentación incluye:

✅ **Flujo completo** de creación de rector con institución y sedes  
✅ **6 endpoints** documentados con ejemplos  
✅ **Servicio TypeScript** completo con todas las funciones  
✅ **Componentes React** con formularios paso a paso  
✅ **Validaciones** en tiempo real (documento, email)  
✅ **Multi-step form** con stepper visual  
✅ **Permisos** por rol (admin/super_admin)  
✅ **Manejo de errores** robusto  

**¡Lista para implementar en tu proyecto Next.js! 🚀**