import { Request, Response, NextFunction } from 'express';
import { logger } from '../config';
import { JwtService } from '../services/jwt.service';

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
        rol: 'super_admin' | 'admin' | 'gestor';
        email: string;
      };
    }
  }
}

/**
 * Middleware de autenticación JWT
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization;
    
    if (!authorization) {
      return res.status(401).json({
        ok: false,
        msg: 'Token de autorización requerido'
      });
    }

    // Extraer token del header
    const token = JwtService.extractTokenFromHeader(authorization);
    
    if (!token) {
      return res.status(401).json({
        ok: false,
        msg: 'Token de autorización inválido'
      });
    }

    // Verificar y decodificar token
    const payload = JwtService.verifyToken(token);
    
    // Añadir usuario al request
    req.usuario = {
      id: payload.id,
      rol: payload.rol,
      email: payload.email
    };

    next();
  } catch (error: any) {
    logger.error('Error en middleware de autenticación', { error: error.message });
    return res.status(401).json({
      ok: false,
      msg: 'Token inválido o expirado'
    });
  }
};

/**
 * Middleware para verificar roles específicos
 */
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.usuario) {
        return res.status(401).json({
          ok: false,
          msg: 'Usuario no autenticado'
        });
      }

      if (!allowedRoles.includes(req.usuario.rol)) {
        return res.status(403).json({
          ok: false,
          msg: 'No tienes permisos para realizar esta acción'
        });
      }

      next();
    } catch (error: any) {
      logger.error('Error en middleware de roles', error);
      return res.status(403).json({
        ok: false,
        msg: 'Error verificando permisos'
      });
    }
  };
};

/**
 * Middleware para verificar si el usuario puede modificar otros usuarios
 */
export const canModifyUserMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const currentUser = req.usuario;

    if (!currentUser) {
      return res.status(401).json({
        ok: false,
        msg: 'Usuario no autenticado'
      });
    }

    // Super admin y admin pueden modificar cualquier usuario
    if (currentUser.rol === 'super_admin' || currentUser.rol === 'admin') {
      return next();
    }

    // Usuarios solo pueden modificar su propio perfil
    if (currentUser.id === id) {
      return next();
    }

    return res.status(403).json({
      ok: false,
      msg: 'No tienes permisos para modificar este usuario'
    });
  } catch (error: any) {
    logger.error('Error en middleware canModifyUser', error);
    return res.status(403).json({
      success: false,
      message: 'Error verificando permisos',
      error: 'Forbidden'
    });
  }
};