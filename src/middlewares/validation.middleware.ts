import { Request, Response, NextFunction } from 'express';
import { validateEmail } from '../domain/utils';
import { logger } from '../config';

/**
 * Middleware para validar datos de creación de usuario
 */
export const validateCreateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tipo_documento, documento, nombre, apellido, email, contrasena } = req.body;
    const errors: string[] = [];

    // Validaciones requeridas
    if (!tipo_documento || typeof tipo_documento !== 'string') {
      errors.push('Tipo de documento es requerido');
    }

    if (!documento || typeof documento !== 'string') {
      errors.push('Documento es requerido');
    } else if (documento.length < 5 || documento.length > 20) {
      errors.push('Documento debe tener entre 5 y 20 caracteres');
    }

    if (!nombre || typeof nombre !== 'string') {
      errors.push('Nombre es requerido');
    } else if (nombre.trim().length < 2) {
      errors.push('Nombre debe tener al menos 2 caracteres');
    }

    if (!apellido || typeof apellido !== 'string') {
      errors.push('Apellido es requerido');
    } else if (apellido.trim().length < 2) {
      errors.push('Apellido debe tener al menos 2 caracteres');
    }

    if (!email || typeof email !== 'string') {
      errors.push('Email es requerido');
    } else {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        errors.push(...emailValidation.errors);
      }
    }

    if (!contrasena || typeof contrasena !== 'string') {
      errors.push('Contraseña es requerida');
    } else if (contrasena.length < 8) {
      errors.push('Contraseña debe tener al menos 8 caracteres');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(contrasena)) {
      errors.push('Contraseña debe contener al menos una minúscula, una mayúscula y un número');
    }

    // Validar rol si se proporciona
    if (req.body.rol && !['super_admin', 'admin', 'gestor'].includes(req.body.rol)) {
      errors.push('Rol inválido. Debe ser: super_admin, admin o gestor');
    }

    // Validar estado si se proporciona
    if (req.body.estado && !['activo', 'inactivo', 'suspendido'].includes(req.body.estado)) {
      errors.push('Estado inválido. Debe ser: activo, inactivo o suspendido');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validation Error',
        details: errors
      });
    }

    next();
  } catch (error: any) {
    logger.error('Error en validación de creación de usuario', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Middleware para validar datos de actualización de usuario
 */
export const validateUpdateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tipo_documento, documento, nombre, apellido, email, contrasena, rol, estado } = req.body;
    const errors: string[] = [];

    // Validaciones opcionales (solo si se proporcionan)
    if (tipo_documento !== undefined && (typeof tipo_documento !== 'string' || !tipo_documento.trim())) {
      errors.push('Tipo de documento debe ser un texto válido');
    }

    if (documento !== undefined) {
      if (typeof documento !== 'string' || !documento.trim()) {
        errors.push('Documento debe ser un texto válido');
      } else if (documento.length < 5 || documento.length > 20) {
        errors.push('Documento debe tener entre 5 y 20 caracteres');
      }
    }

    if (nombre !== undefined) {
      if (typeof nombre !== 'string' || !nombre.trim()) {
        errors.push('Nombre debe ser un texto válido');
      } else if (nombre.trim().length < 2) {
        errors.push('Nombre debe tener al menos 2 caracteres');
      }
    }

    if (apellido !== undefined) {
      if (typeof apellido !== 'string' || !apellido.trim()) {
        errors.push('Apellido debe ser un texto válido');
      } else if (apellido.trim().length < 2) {
        errors.push('Apellido debe tener al menos 2 caracteres');
      }
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || !email.trim()) {
        errors.push('Email debe ser un texto válido');
      } else {
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
          errors.push(...emailValidation.errors);
        }
      }
    }

    if (contrasena !== undefined) {
      if (typeof contrasena !== 'string' || !contrasena) {
        errors.push('Contraseña debe ser un texto válido');
      } else if (contrasena.length < 8) {
        errors.push('Contraseña debe tener al menos 8 caracteres');
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(contrasena)) {
        errors.push('Contraseña debe contener al menos una minúscula, una mayúscula y un número');
      }
    }

    if (rol !== undefined && !['super_admin', 'admin', 'gestor'].includes(rol)) {
      errors.push('Rol inválido. Debe ser: super_admin, admin o gestor');
    }

    if (estado !== undefined && !['activo', 'inactivo', 'suspendido'].includes(estado)) {
      errors.push('Estado inválido. Debe ser: activo, inactivo o suspendido');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validation Error',
        details: errors
      });
    }

    next();
  } catch (error: any) {
    logger.error('Error en validación de actualización de usuario', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};