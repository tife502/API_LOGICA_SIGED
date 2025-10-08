# 🔐 Documentación Completa - Sistema de Recuperación de Contraseña SIGED

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Flujo Completo del Proceso](#flujo-completo-del-proceso)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Endpoints del API](#endpoints-del-api)
5. [Implementación Next.js + TypeScript](#implementación-nextjs--typescript)
6. [Servicios para el Frontend](#servicios-para-el-frontend)
7. [Componentes React/Next.js](#componentes-reactnextjs)
8. [Estados y Validaciones](#estados-y-validaciones)
9. [Seguridad y Buenas Prácticas](#seguridad-y-buenas-prácticas)
10. [Manejo de Errores](#manejo-de-errores)

---

## 🎯 Descripción General

El sistema de recuperación de contraseñas de SIGED utiliza **códigos de verificación enviados por SMS** al número de celular registrado del usuario. El proceso es completamente **sin autenticación** (rutas públicas) y consta de 3 pasos principales.

### Características Principales

- ✅ **Códigos de 6 dígitos** generados aleatoriamente
- ✅ **Validez de 15 minutos** para cada código
- ✅ **Envío por SMS** al celular registrado
- ✅ **Validación de contraseña fuerte** (8+ caracteres, mayúscula, minúscula, número)
- ✅ **Protección contra spam** con límites de tiempo
- ✅ **Logs de auditoría** completos
- ✅ **Notificaciones de cambio exitoso**
- ✅ **Seguridad por oscuridad** (no revela si el documento existe)

---

## 🔄 Flujo Completo del Proceso

### Diagrama de Flujo

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant API as Backend API
    participant SMS as Servicio SMS
    participant DB as Base de Datos

    Note over U,DB: PASO 1: Solicitar Código
    U->>F: Ingresa documento
    F->>API: POST /recuperacion/solicitar-codigo
    API->>DB: Buscar usuario por documento
    DB-->>API: Usuario encontrado
    API->>API: Generar código 6 dígitos
    API->>DB: Guardar código + expiración (15 min)
    API->>SMS: Enviar SMS con código
    SMS-->>U: SMS recibido con código
    API-->>F: Código enviado exitosamente
    F-->>U: Mostrar: "Código enviado a ***1234"

    Note over U,DB: PASO 2: Usuario no recibió el código
    U->>F: Click "Reenviar código"
    F->>API: POST /recuperacion/reenviar-codigo
    API->>DB: Verificar solicitud activa
    API->>API: Generar nuevo código
    API->>DB: Actualizar código + expiración
    API->>SMS: Reenviar SMS
    SMS-->>U: Nuevo SMS recibido
    API-->>F: Código reenviado
    F-->>U: "Código reenviado a ***1234"

    Note over U,DB: PASO 3: Verificar Código y Cambiar Contraseña
    U->>F: Ingresa código + nueva contraseña
    F->>API: POST /recuperacion/verificar-codigo
    API->>DB: Buscar usuario por documento
    API->>API: Validar código y expiración
    API->>API: Validar formato contraseña
    API->>API: Hash nueva contraseña (bcrypt)
    API->>DB: Actualizar contraseña + limpiar código
    API->>SMS: Notificar cambio exitoso
    SMS-->>U: SMS de confirmación
    API-->>F: Contraseña cambiada exitosamente
    F-->>U: Redirigir a login
```

### Paso a Paso del Usuario

1. **Usuario olvida su contraseña**
   - Hace clic en "¿Olvidaste tu contraseña?" en la página de login

2. **Solicita código de recuperación**
   - Ingresa su número de documento
   - El sistema valida que el documento exista y tenga celular
   - Recibe un SMS con código de 6 dígitos (válido 15 minutos)

3. **¿No recibió el código?**
   - Puede solicitar reenvío del código
   - Se genera un nuevo código con nueva expiración

4. **Verifica código y cambia contraseña**
   - Ingresa el código recibido por SMS
   - Ingresa y confirma su nueva contraseña
   - El sistema valida el código, su expiración y la contraseña
   - Si todo es correcto, actualiza la contraseña
   - Recibe SMS de confirmación del cambio

5. **Inicia sesión con nueva contraseña**
   - Es redirigido al login
   - Puede iniciar sesión con su nueva contraseña

---

## 🏗️ Arquitectura del Sistema

### Tablas de Base de Datos Involucradas

```sql
-- Campos relevantes en la tabla usuarios
CREATE TABLE usuarios (
  id UUID PRIMARY KEY,
  tipo_documento VARCHAR(20) NOT NULL,
  documento VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  celular VARCHAR(20),
  contrasena VARCHAR(255) NOT NULL,
  estado VARCHAR(20) DEFAULT 'activo',
  rol VARCHAR(20) NOT NULL,
  reset_password_token VARCHAR(6), -- Código de recuperación
  reset_password_expires TIMESTAMP, -- Fecha de expiración del código
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

### Variables de Entorno Necesarias

```bash
# .env
NOTIFICATION_API_URL=http://localhost:8080  # URL de tu servicio SMS
JWT_SECRET=tu_secreto_super_seguro
DATABASE_URL=postgresql://user:pass@localhost:5432/siged
```

### Servicio SMS Externo

El sistema depende de un servicio SMS externo que debe exponer:

**Endpoint**: `POST /notificarViaSMS`

**Body**:
```json
{
  "toNumber": "+573001234567",
  "content": "Tu código de recuperación es: 123456",
  "isPriority": true,
  "isFlash": false
}
```

**Response**: Status 200 si se envió exitosamente

---

## 🌐 Endpoints del API

### Base URL
```
https://api-siged.com/api/v1/usuarios
```

### 1. **Solicitar Código de Recuperación**

#### `POST /recuperacion/solicitar-codigo`

**Autenticación**: ❌ No requiere (ruta pública)

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "documento": "1234567890"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Código enviado por SMS",
  "data": {
    "celularParcial": "***4567",
    "validoHasta": "2024-01-15T11:45:00.000Z",
    "instrucciones": "El código es válido por 15 minutos"
  }
}
```

**Response - Usuario no encontrado (200):**
```json
{
  "success": true,
  "message": "Si el documento existe en nuestro sistema y tiene número de celular registrado, recibirás un código por SMS"
}
```
> ⚠️ **Nota de Seguridad**: Por seguridad, el API no revela si el documento existe o no. Siempre responde 200.

**Response - Usuario inactivo (400):**
```json
{
  "success": false,
  "message": "Esta cuenta está inactiva. Contacta al administrador.",
  "error": "Account Inactive"
}
```

**Response - Formato celular inválido (400):**
```json
{
  "success": false,
  "message": "El número de celular registrado no tiene un formato válido. Contacta al administrador.",
  "error": "Invalid Phone Format"
}
```

**Response - Error enviando SMS (500):**
```json
{
  "success": false,
  "message": "Error enviando código por SMS. Intenta nuevamente.",
  "error": "SMS Service Error"
}
```

**Response - Validación (400):**
```json
{
  "success": false,
  "message": "Número de documento es requerido",
  "error": "Validation Error"
}
```

---

### 2. **Verificar Código y Cambiar Contraseña**

#### `POST /recuperacion/verificar-codigo`

**Autenticación**: ❌ No requiere (ruta pública)

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "documento": "1234567890",
  "codigo": "123456",
  "nuevaContrasena": "MiNuevaContraseña123"
}
```

**Validaciones de contraseña:**
- Mínimo 8 caracteres
- Al menos una letra minúscula
- Al menos una letra mayúscula
- Al menos un número

**Response Success (200):**
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente",
  "data": {
    "usuario": "Juan Pérez",
    "email": "juan.perez@colegio.edu.co"
  }
}
```

**Response - Datos faltantes (400):**
```json
{
  "success": false,
  "message": "Documento, código y nueva contraseña son requeridos",
  "error": "Validation Error"
}
```

**Response - Contraseña débil (400):**
```json
{
  "success": false,
  "message": "La contraseña debe tener al menos 8 caracteres",
  "error": "Validation Error"
}
```

```json
{
  "success": false,
  "message": "La contraseña debe contener al menos una minúscula, una mayúscula y un número",
  "error": "Validation Error"
}
```

**Response - Código inválido (400):**
```json
{
  "success": false,
  "message": "Código inválido",
  "error": "Invalid Code"
}
```

**Response - Código expirado (400):**
```json
{
  "success": false,
  "message": "Código expirado. Solicita uno nuevo.",
  "error": "Expired Code"
}
```

**Response - Usuario no encontrado (400):**
```json
{
  "success": false,
  "message": "Datos inválidos",
  "error": "Invalid Data"
}
```

---

### 3. **Reenviar Código de Recuperación**

#### `POST /recuperacion/reenviar-codigo`

**Autenticación**: ❌ No requiere (ruta pública)

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "documento": "1234567890"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Código reenviado por SMS",
  "data": {
    "celularParcial": "***4567",
    "validoHasta": "2024-01-15T12:00:00.000Z"
  }
}
```

**Response - No hay solicitud activa (400):**
```json
{
  "success": false,
  "message": "No tienes una solicitud de recuperación activa. Solicita un código nuevo.",
  "error": "No Active Request"
}
```

**Response - Solicitud muy antigua (400):**
```json
{
  "success": false,
  "message": "La solicitud de recuperación ha expirado. Solicita un código nuevo.",
  "error": "Request Expired"
}
```

**Response - Error SMS (500):**
```json
{
  "success": false,
  "message": "Error reenviando código por SMS",
  "error": "SMS Service Error"
}
```

---

## 💻 Implementación Next.js + TypeScript

### 1. **Servicio de Recuperación de Contraseña**

```typescript
// services/password-recovery.service.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface SolicitarCodigoRequest {
  documento: string;
}

export interface SolicitarCodigoResponse {
  success: boolean;
  message: string;
  data?: {
    celularParcial: string;
    validoHasta: string;
    instrucciones: string;
  };
  error?: string;
}

export interface VerificarCodigoRequest {
  documento: string;
  codigo: string;
  nuevaContrasena: string;
}

export interface VerificarCodigoResponse {
  success: boolean;
  message: string;
  data?: {
    usuario: string;
    email: string;
  };
  error?: string;
}

export interface ReenviarCodigoRequest {
  documento: string;
}

export interface ReenviarCodigoResponse {
  success: boolean;
  message: string;
  data?: {
    celularParcial: string;
    validoHasta: string;
  };
  error?: string;
}

export class PasswordRecoveryService {
  
  /**
   * PASO 1: Solicitar código de recuperación por SMS
   * @param documento Número de documento del usuario
   * @returns Promise con la respuesta del servidor
   */
  static async solicitarCodigo(
    documento: string
  ): Promise<SolicitarCodigoResponse> {
    try {
      const response = await fetch(
        `${API_URL}/usuarios/recuperacion/solicitar-codigo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ documento })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al solicitar código');
      }

      console.log('✅ Código solicitado exitosamente');
      return data;

    } catch (error: any) {
      console.error('❌ Error solicitando código:', error);
      throw new Error(
        error.message || 'Error al solicitar código de recuperación'
      );
    }
  }

  /**
   * PASO 2: Verificar código y cambiar contraseña
   * @param documento Número de documento
   * @param codigo Código de 6 dígitos recibido por SMS
   * @param nuevaContrasena Nueva contraseña del usuario
   * @returns Promise con la respuesta del servidor
   */
  static async verificarCodigoYCambiarContrasena(
    documento: string,
    codigo: string,
    nuevaContrasena: string
  ): Promise<VerificarCodigoResponse> {
    try {
      // Validar formato del código
      if (!/^\d{6}$/.test(codigo)) {
        throw new Error('El código debe ser de 6 dígitos');
      }

      // Validar contraseña en el frontend
      const validacion = this.validarContrasena(nuevaContrasena);
      if (!validacion.esValida) {
        throw new Error(validacion.errores.join('. '));
      }

      const response = await fetch(
        `${API_URL}/usuarios/recuperacion/verificar-codigo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            documento,
            codigo,
            nuevaContrasena
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al verificar código');
      }

      console.log('✅ Contraseña cambiada exitosamente');
      return data;

    } catch (error: any) {
      console.error('❌ Error verificando código:', error);
      throw new Error(
        error.message || 'Error al verificar código'
      );
    }
  }

  /**
   * PASO 3: Reenviar código de recuperación
   * @param documento Número de documento del usuario
   * @returns Promise con la respuesta del servidor
   */
  static async reenviarCodigo(
    documento: string
  ): Promise<ReenviarCodigoResponse> {
    try {
      const response = await fetch(
        `${API_URL}/usuarios/recuperacion/reenviar-codigo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ documento })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al reenviar código');
      }

      console.log('✅ Código reenviado exitosamente');
      return data;

    } catch (error: any) {
      console.error('❌ Error reenviando código:', error);
      throw new Error(
        error.message || 'Error al reenviar código'
      );
    }
  }

  /**
   * Validar formato y seguridad de la contraseña
   * @param contrasena Contraseña a validar
   * @returns Objeto con resultado de validación
   */
  static validarContrasena(contrasena: string): {
    esValida: boolean;
    errores: string[];
  } {
    const errores: string[] = [];

    if (!contrasena || contrasena.length < 8) {
      errores.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/[a-z]/.test(contrasena)) {
      errores.push('Debe contener al menos una letra minúscula');
    }

    if (!/[A-Z]/.test(contrasena)) {
      errores.push('Debe contener al menos una letra mayúscula');
    }

    if (!/\d/.test(contrasena)) {
      errores.push('Debe contener al menos un número');
    }

    return {
      esValida: errores.length === 0,
      errores
    };
  }

  /**
   * Validar formato de documento
   * @param documento Documento a validar
   * @returns boolean
   */
  static validarDocumento(documento: string): boolean {
    // Remover espacios y guiones
    const documentoLimpio = documento.replace(/[\s\-]/g, '');
    
    // Debe ser numérico y tener entre 6 y 15 dígitos
    return /^\d{6,15}$/.test(documentoLimpio);
  }

  /**
   * Calcular fortaleza de contraseña (1-5)
   * @param contrasena Contraseña a evaluar
   * @returns número del 1 al 5
   */
  static calcularFortaleza(contrasena: string): number {
    let fortaleza = 0;

    if (contrasena.length >= 8) fortaleza++;
    if (contrasena.length >= 12) fortaleza++;
    if (/[a-z]/.test(contrasena) && /[A-Z]/.test(contrasena)) fortaleza++;
    if (/\d/.test(contrasena)) fortaleza++;
    if (/[^A-Za-z0-9]/.test(contrasena)) fortaleza++;

    return Math.min(fortaleza, 5);
  }
}

export default PasswordRecoveryService;
```

---

## 🎨 Componentes React/Next.js

### 1. **Página Principal de Recuperación**

```typescript
// app/recuperar-contrasena/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PasswordRecoveryService from '@/services/password-recovery.service';
import SolicitarCodigoForm from '@/components/password-recovery/SolicitarCodigoForm';
import VerificarCodigoForm from '@/components/password-recovery/VerificarCodigoForm';

type Step = 'solicitar' | 'verificar' | 'exito';

export default function RecuperarContrasenaPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('solicitar');
  const [documento, setDocumento] = useState('');
  const [celularParcial, setCelularParcial] = useState('');
  const [validoHasta, setValidoHasta] = useState<Date | null>(null);
  const [usuarioNombre, setUsuarioNombre] = useState('');

  const handleCodigoSolicitado = (data: any) => {
    setDocumento(data.documento);
    setCelularParcial(data.celularParcial);
    setValidoHasta(new Date(data.validoHasta));
    setStep('verificar');
  };

  const handleContrasenaCanbiada = (data: any) => {
    setUsuarioNombre(data.usuario);
    setStep('exito');
    
    // Redirigir al login después de 3 segundos
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  };

  const handleVolverAlInicio = () => {
    setStep('solicitar');
    setDocumento('');
    setCelularParcial('');
    setValidoHasta(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Recuperar Contraseña
          </h1>
          <p className="text-gray-600">
            {step === 'solicitar' && 'Ingresa tu documento para recibir un código por SMS'}
            {step === 'verificar' && 'Ingresa el código que recibiste por SMS'}
            {step === 'exito' && '¡Contraseña actualizada exitosamente!'}
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 'solicitar' ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'
            }`}>
              {step === 'solicitar' ? '1' : '✓'}
            </div>
            <div className={`w-20 h-1 ${
              step === 'solicitar' ? 'bg-gray-300' : 'bg-green-500'
            }`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 'verificar' ? 'bg-blue-600 text-white' : 
              step === 'exito' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {step === 'exito' ? '✓' : '2'}
            </div>
            <div className={`w-20 h-1 ${
              step === 'exito' ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 'exito' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Formularios según el paso */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {step === 'solicitar' && (
            <SolicitarCodigoForm onSuccess={handleCodigoSolicitado} />
          )}

          {step === 'verificar' && (
            <VerificarCodigoForm
              documento={documento}
              celularParcial={celularParcial}
              validoHasta={validoHasta}
              onSuccess={handleContrasenaCanbiada}
              onVolverAlInicio={handleVolverAlInicio}
            />
          )}

          {step === 'exito' && (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Contraseña Actualizada!
              </h2>
              <p className="text-gray-600 mb-6">
                {usuarioNombre}, tu contraseña ha sido cambiada exitosamente.
              </p>
              <p className="text-sm text-gray-500">
                Redirigiendo al inicio de sesión en 3 segundos...
              </p>
              <button
                onClick={() => router.push('/login')}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Ir al inicio de sesión ahora →
              </button>
            </div>
          )}
        </div>

        {/* Link para volver al login */}
        {step !== 'exito' && (
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/login')}
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              ← Volver al inicio de sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### 2. **Formulario: Solicitar Código**

```typescript
// components/password-recovery/SolicitarCodigoForm.tsx
'use client';

import { useState } from 'react';
import PasswordRecoveryService from '@/services/password-recovery.service';

interface Props {
  onSuccess: (data: any) => void;
}

export default function SolicitarCodigoForm({ onSuccess }: Props) {
  const [documento, setDocumento] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validar documento
      if (!PasswordRecoveryService.validarDocumento(documento)) {
        throw new Error('Número de documento inválido');
      }

      // Solicitar código
      const response = await PasswordRecoveryService.solicitarCodigo(documento);

      if (response.success && response.data) {
        // Pasar al siguiente paso
        onSuccess({
          documento,
          celularParcial: response.data.celularParcial,
          validoHasta: response.data.validoHasta
        });
      }

    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al solicitar código');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Número de Documento
        </label>
        <input
          type="text"
          value={documento}
          onChange={(e) => setDocumento(e.target.value.replace(/\D/g, ''))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ej: 1234567890"
          maxLength={15}
          required
        />
        <p className="mt-2 text-xs text-gray-500">
          Recibirás un código de 6 dígitos en el celular registrado
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !documento}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Enviando código...
          </span>
        ) : (
          'Enviar Código por SMS'
        )}
      </button>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          💡 Información importante:
        </h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• El código será válido por 15 minutos</li>
          <li>• Verifica que tu celular esté activo</li>
          <li>• Si no recibes el código, podrás reenviarlo</li>
        </ul>
      </div>
    </form>
  );
}
```

---

### 3. **Formulario: Verificar Código y Cambiar Contraseña**

```typescript
// components/password-recovery/VerificarCodigoForm.tsx
'use client';

import { useState, useEffect } from 'react';
import PasswordRecoveryService from '@/services/password-recovery.service';

interface Props {
  documento: string;
  celularParcial: string;
  validoHasta: Date | null;
  onSuccess: (data: any) => void;
  onVolverAlInicio: () => void;
}

export default function VerificarCodigoForm({
  documento,
  celularParcial,
  validoHasta,
  onSuccess,
  onVolverAlInicio
}: Props) {
  const [codigo, setCodigo] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tiempoRestante, setTiempoRestante] = useState<number>(0);
  const [puedeReenviar, setPuedeReenviar] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  // Calcular tiempo restante para expiración
  useEffect(() => {
    if (!validoHasta) return;

    const interval = setInterval(() => {
      const ahora = new Date().getTime();
      const expiracion = new Date(validoHasta).getTime();
      const diferencia = expiracion - ahora;

      if (diferencia <= 0) {
        setTiempoRestante(0);
        setPuedeReenviar(true);
        clearInterval(interval);
      } else {
        setTiempoRestante(Math.floor(diferencia / 1000));
        setPuedeReenviar(diferencia < 60000); // Permitir reenvío en el último minuto
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [validoHasta]);

  const fortalezaContrasena = PasswordRecoveryService.calcularFortaleza(nuevaContrasena);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validar que las contraseñas coincidan
      if (nuevaContrasena !== confirmarContrasena) {
        throw new Error('Las contraseñas no coinciden');
      }

      // Verificar código y cambiar contraseña
      const response = await PasswordRecoveryService.verificarCodigoYCambiarContrasena(
        documento,
        codigo,
        nuevaContrasena
      );

      if (response.success && response.data) {
        onSuccess(response.data);
      }

    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al verificar código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReenviarCodigo = async () => {
    setReenviando(true);
    setError(null);

    try {
      const response = await PasswordRecoveryService.reenviarCodigo(documento);

      if (response.success) {
        alert('Código reenviado exitosamente');
        setPuedeReenviar(false);
      }

    } catch (error: any) {
      setError(error.message || 'Error al reenviar código');
    } finally {
      setReenviando(false);
    }
  };

  const formatearTiempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  const getColorFortaleza = () => {
    const colores = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
    return colores[fortalezaContrasena - 1] || 'bg-gray-300';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información del celular */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Código enviado a: <span className="font-bold">{celularParcial}</span>
        </p>
        {tiempoRestante > 0 ? (
          <p className="text-xs text-blue-600 mt-1">
            ⏱️ Válido por: {formatearTiempo(tiempoRestante)}
          </p>
        ) : (
          <p className="text-xs text-red-600 mt-1">
            ⚠️ Código expirado. Solicita uno nuevo.
          </p>
        )}
      </div>

      {/* Código de verificación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Código de Verificación
        </label>
        <input
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-bold"
          placeholder="000000"
          maxLength={6}
          required
        />
      </div>

      {/* Botón reenviar */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleReenviarCodigo}
          disabled={!puedeReenviar || reenviando}
          className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {reenviando ? 'Reenviando...' : '¿No recibiste el código? Reenviar'}
        </button>
      </div>

      <hr className="my-6" />

      {/* Nueva contraseña */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nueva Contraseña
        </label>
        <div className="relative">
          <input
            type={mostrarContrasena ? 'text' : 'password'}
            value={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
            placeholder="Mínimo 8 caracteres"
            required
          />
          <button
            type="button"
            onClick={() => setMostrarContrasena(!mostrarContrasena)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {mostrarContrasena ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>

        {/* Indicador de fortaleza */}
        {nuevaContrasena && (
          <div className="mt-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((nivel) => (
                <div
                  key={nivel}
                  className={`h-1 flex-1 rounded ${
                    nivel <= fortalezaContrasena ? getColorFortaleza() : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Fortaleza: {['Muy débil', 'Débil', 'Media', 'Fuerte', 'Muy fuerte'][fortalezaContrasena - 1] || 'Ninguna'}
            </p>
          </div>
        )}

        {/* Requisitos */}
        <div className="mt-3 space-y-1">
          <p className="text-xs text-gray-600">Requisitos:</p>
          <ul className="text-xs space-y-1">
            <li className={nuevaContrasena.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
              {nuevaContrasena.length >= 8 ? '✓' : '○'} Mínimo 8 caracteres
            </li>
            <li className={/[a-z]/.test(nuevaContrasena) ? 'text-green-600' : 'text-gray-500'}>
              {/[a-z]/.test(nuevaContrasena) ? '✓' : '○'} Una letra minúscula
            </li>
            <li className={/[A-Z]/.test(nuevaContrasena) ? 'text-green-600' : 'text-gray-500'}>
              {/[A-Z]/.test(nuevaContrasena) ? '✓' : '○'} Una letra mayúscula
            </li>
            <li className={/\d/.test(nuevaContrasena) ? 'text-green-600' : 'text-gray-500'}>
              {/\d/.test(nuevaContrasena) ? '✓' : '○'} Un número
            </li>
          </ul>
        </div>
      </div>

      {/* Confirmar contraseña */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirmar Nueva Contraseña
        </label>
        <input
          type={mostrarContrasena ? 'text' : 'password'}
          value={confirmarContrasena}
          onChange={(e) => setConfirmarContrasena(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Repite tu nueva contraseña"
          required
        />
        {confirmarContrasena && nuevaContrasena !== confirmarContrasena && (
          <p className="text-xs text-red-600 mt-1">
            Las contraseñas no coinciden
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onVolverAlInicio}
          className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 font-medium"
        >
          ← Volver
        </button>
        <button
          type="submit"
          disabled={
            isLoading ||
            !codigo ||
            codigo.length !== 6 ||
            !nuevaContrasena ||
            nuevaContrasena !== confirmarContrasena ||
            tiempoRestante === 0
          }
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? 'Verificando...' : 'Cambiar Contraseña'}
        </button>
      </div>
    </form>
  );
}
```

---

## 🔒 Seguridad y Buenas Prácticas

### Medidas de Seguridad Implementadas

1. **Oscuridad de información**
   - No revela si un documento existe en el sistema
   - Respuestas genéricas para evitar enumeración de usuarios

2. **Códigos de un solo uso**
   - Códigos de 6 dígitos aleatorios
   - Se invalidan después de usarse
   - Expiración de 15 minutos

3. **Validación de contraseña fuerte**
   - Mínimo 8 caracteres
   - Combinación de mayúsculas, minúsculas y números
   - Indicador visual de fortaleza

4. **Hash de contraseñas**
   - bcrypt con 12 salt rounds
   - Nunca se almacenan contraseñas en texto plano

5. **Logs de auditoría**
   - Todos los intentos se registran
   - Información sensible ofuscada en logs

6. **Rate limiting** (recomendado implementar)
   - Limitar intentos de solicitud de códigos
   - Prevenir ataques de fuerza bruta

7. **Notificaciones de seguridad**
   - SMS de confirmación después del cambio
   - Alertas si alguien intenta cambiar sin autorización

### Recomendaciones Adicionales

```typescript
// middleware para rate limiting (opcional)
// app/api/middleware/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "15 m"), // 3 intentos cada 15 minutos
  analytics: true,
});

export async function rateLimitMiddleware(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response("Too Many Requests", { status: 429 });
  }
  
  return null;
}
```

---

## ⚠️ Manejo de Errores

### Tabla de Códigos de Error

| Código | Error | Descripción | Acción Recomendada |
|--------|-------|-------------|-------------------|
| 400 | Validation Error | Datos faltantes o inválidos | Revisar campos del formulario |
| 400 | Account Inactive | Cuenta desactivada | Contactar administrador |
| 400 | Invalid Phone Format | Celular con formato inválido | Contactar administrador |
| 400 | Invalid Code | Código incorrecto | Verificar código recibido |
| 400 | Expired Code | Código expirado | Solicitar nuevo código |
| 400 | No Active Request | Sin solicitud activa | Iniciar proceso nuevamente |
| 400 | Request Expired | Solicitud muy antigua | Iniciar proceso nuevamente |
| 500 | SMS Service Error | Error enviando SMS | Reintentar más tarde |
| 500 | Internal Server Error | Error del servidor | Contactar soporte técnico |

### Componente de Manejo de Errores

```typescript
// components/ErrorAlert.tsx
interface ErrorAlertProps {
  error: string;
  onClose?: () => void;
}

export default function ErrorAlert({ error, onClose }: ErrorAlertProps) {
  const getErrorInfo = (errorMessage: string) => {
    if (errorMessage.includes('expirado')) {
      return {
        title: 'Código Expirado',
        message: 'El código ha expirado. Por favor, solicita uno nuevo.',
        icon: '⏰',
        color: 'orange'
      };
    }
    
    if (errorMessage.includes('inválido')) {
      return {
        title: 'Código Inválido',
        message: 'El código ingresado no es correcto. Verifica e intenta nuevamente.',
        icon: '❌',
        color: 'red'
      };
    }
    
    return {
      title: 'Error',
      message: errorMessage,
      icon: '⚠️',
      color: 'red'
    };
  };

  const info = getErrorInfo(error);

  return (
    <div className={`bg-${info.color}-50 border border-${info.color}-200 rounded-lg p-4`}>
      <div className="flex items-start">
        <span className="text-2xl mr-3">{info.icon}</span>
        <div className="flex-1">
          <h3 className={`text-sm font-medium text-${info.color}-900`}>
            {info.title}
          </h3>
          <p className={`text-sm text-${info.color}-700 mt-1`}>
            {info.message}
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className={`text-${info.color}-400 hover:text-${info.color}-600`}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## 📱 Testing

### Tests de Integración Recomendados

```typescript
// __tests__/password-recovery.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import PasswordRecoveryService from '@/services/password-recovery.service';

describe('Password Recovery Service', () => {
  describe('validarDocumento', () => {
    it('debe validar documento correcto', () => {
      expect(PasswordRecoveryService.validarDocumento('1234567890')).toBe(true);
    });

    it('debe rechazar documento con letras', () => {
      expect(PasswordRecoveryService.validarDocumento('123ABC456')).toBe(false);
    });

    it('debe rechazar documento muy corto', () => {
      expect(PasswordRecoveryService.validarDocumento('12345')).toBe(false);
    });
  });

  describe('validarContrasena', () => {
    it('debe validar contraseña fuerte', () => {
      const result = PasswordRecoveryService.validarContrasena('MiPass123');
      expect(result.esValida).toBe(true);
      expect(result.errores).toHaveLength(0);
    });

    it('debe rechazar contraseña corta', () => {
      const result = PasswordRecoveryService.validarContrasena('Pass1');
      expect(result.esValida).toBe(false);
      expect(result.errores).toContain('La contraseña debe tener al menos 8 caracteres');
    });

    it('debe rechazar contraseña sin mayúscula', () => {
      const result = PasswordRecoveryService.validarContrasena('password123');
      expect(result.esValida).toBe(false);
      expect(result.errores).toContain('Debe contener al menos una letra mayúscula');
    });
  });

  describe('calcularFortaleza', () => {
    it('debe calcular fortaleza 5 para contraseña muy fuerte', () => {
      const fortaleza = PasswordRecoveryService.calcularFortaleza('MiContraseña123!@#');
      expect(fortaleza).toBe(5);
    });

    it('debe calcular fortaleza 1 para contraseña débil', () => {
      const fortaleza = PasswordRecoveryService.calcularFortaleza('password');
      expect(fortaleza).toBeLessThan(3);
    });
  });
});
```

---

## 📝 Resumen del Flujo para el Frontend

### Checklist de Implementación

- [ ] **Instalar dependencias**: React, Next.js, TypeScript
- [ ] **Crear servicio** `password-recovery.service.ts`
- [ ] **Crear página** `/recuperar-contrasena/page.tsx`
- [ ] **Crear componente** `SolicitarCodigoForm.tsx`
- [ ] **Crear componente** `VerificarCodigoForm.tsx`
- [ ] **Agregar link** en página de login
- [ ] **Probar flujo completo** con usuario real
- [ ] **Configurar variables** de entorno (API_URL)
- [ ] **Implementar rate limiting** (opcional pero recomendado)
- [ ] **Agregar analytics** para monitorear uso

### Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api-siged.com/api/v1
```

### Estructura de Archivos Final

```
app/
├── recuperar-contrasena/
│   └── page.tsx
├── login/
│   └── page.tsx
components/
├── password-recovery/
│   ├── SolicitarCodigoForm.tsx
│   ├── VerificarCodigoForm.tsx
│   └── ErrorAlert.tsx
services/
└── password-recovery.service.ts
```

---

## 🎉 ¡Documentación Completa!

Esta documentación cubre todo lo necesario para implementar el sistema de recuperación de contraseñas en tu frontend Next.js con TypeScript:

✅ **Flujo completo** de 3 pasos con diagrama  
✅ **Endpoints del API** con requests/responses completos  
✅ **Servicio TypeScript** con todas las funciones  
✅ **Componentes React** listos para usar  
✅ **Validaciones** de documento y contraseña  
✅ **Manejo de errores** robusto  
✅ **Seguridad** y buenas prácticas  
✅ **Testing** básico incluido  

**¡Copia, pega y adapta a tu proyecto! 🚀**