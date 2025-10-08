import axios from 'axios';
import { logger } from '../config';

export class NotificationService {
  private apiURL: string;

  constructor() {
    this.apiURL = process.env.NOTIFICATION_API_URL || 'http://localhost:8080'; // URL de tu API de notificaciones
  }

  /**
   * Enviar código de recuperación por SMS
   * @param telefono Número de teléfono del usuario
   * @param codigo Código de recuperación de 6 dígitos
   * @param nombreUsuario Nombre del usuario para personalizar el mensaje
   * @returns Promise<boolean> - true si se envió exitosamente
   */
  async enviarCodigoRecuperacionSMS(telefono: string, codigo: string, nombreUsuario: string): Promise<boolean> {
    try {
      const mensaje = `Hola ${nombreUsuario}, tu código de recuperación para SIGED es: ${codigo}. Válido por 15 minutos. Si no solicitaste este cambio, ignora este mensaje.`;

      const response = await axios.post(`${this.apiURL}/notificarViaSMS`, {
        toNumber: telefono,
        content: mensaje,
        isPriority: false, // Alta prioridad para recuperación de contraseña
        isFlash: false
      });

      if (response.status === 200) {
        return true;
      } else {
        logger.error(`Error en respuesta de API SMS: ${response.status}`);
        return false;
      }

    } catch (error: any) {
      logger.error('Error enviando SMS de recuperación:', {
        error: error.message,
        telefono: `***${telefono.slice(-4)}`,
        usuario: nombreUsuario
      });
      return false;
    }
  }

  /**
   * Enviar notificación de cambio de contraseña exitoso
   * @param telefono Número de teléfono del usuario
   * @param nombreUsuario Nombre del usuario
   * @returns Promise<boolean>
   */
  async notificarCambioContrasenaExitoso(telefono: string, nombreUsuario: string): Promise<boolean> {
    try {
      const mensaje = `${nombreUsuario}, tu contraseña de SIGED ha sido cambiada exitosamente. Si no fuiste tú, contacta inmediatamente al administrador.`;

      const response = await axios.post(`${this.apiURL}/notificarViaSMS`, {
        toNumber: telefono,
        content: mensaje,
        isPriority: true,
        isFlash: false
      });

      if (response.status === 200) {
        return true;
      }
      
      return false;

    } catch (error: any) {
      logger.error('Error enviando notificación de cambio:', error);
      return false;
    }
  }

  /**
   * Validar formato de número telefónico
   * @param telefono Número a validar
   * @returns boolean
   */
  validarFormatoTelefono(telefono: string): boolean {
    // Expresión regular para números colombianos (+57 + 10 dígitos)
    const regexColombia = /^(\+57|57)?[3][0-9]{9}$/;
    
    // Limpiar número (quitar espacios, guiones, etc.)
    const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
    
    return regexColombia.test(telefonoLimpio);
  }

  /**
   * Normalizar número telefónico al formato estándar
   * @param telefono Número a normalizar
   * @returns string - Número normalizado
   */
  normalizarTelefono(telefono: string): string {
    // Limpiar número
    let telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
    
    // Si no tiene código de país, agregarlo
    if (telefonoLimpio.startsWith('3') && telefonoLimpio.length === 10) {
      telefonoLimpio = `+57${telefonoLimpio}`;
    } else if (telefonoLimpio.startsWith('57') && telefonoLimpio.length === 12) {
      telefonoLimpio = `+${telefonoLimpio}`;
    } else if (!telefonoLimpio.startsWith('+57')) {
      telefonoLimpio = `+57${telefonoLimpio}`;
    }
    
    return telefonoLimpio;
  }
}