import * as jwt from 'jsonwebtoken';
import { envs } from '../config/envs';
import { logger } from '../config/adapters/winstonAdapter';
import TokenBlacklistService from './token-blacklist.service';

// Interfaces
export interface JwtPayload {
  id: string;
  email: string;
  rol: 'super_admin' | 'admin' | 'gestor';
  iat?: number;
  exp?: number;
}

export interface LoginResult {
  usuario: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
  };
  token: string;
  refreshToken: string;
}

export class JwtService {
  private static blacklistService = TokenBlacklistService.getInstance();

  /**
   * Generar token JWT
   */
  static generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    try {
      return jwt.sign(
        payload,
        envs.JWT_SECRET as string,
        {
          expiresIn: '24h',
          algorithm: 'HS256'
        }
      );
    } catch (error) {
      logger.error('Error generando token JWT', error);
      throw new Error('Error al generar token de autenticación');
    }
  }

  /**
   * Generar refresh token
   */
  static generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    try {
      return jwt.sign(
        { id: payload.id, email: payload.email },
        envs.JWT_REFRESH_SECRET as string,
        {
          expiresIn: '7d',
          algorithm: 'HS256'
        }
      );
    } catch (error) {
      logger.error('Error generando refresh token', error);
      throw new Error('Error al generar refresh token');
    }
  }

  /**
   * Verificar token JWT con validación de blacklist
   */
  static verifyToken(token: string): JwtPayload {
    try {
      // Primero verificar si el token está en la blacklist
      if (this.blacklistService.isTokenBlacklisted(token)) {
        logger.warn('Intento de uso de token blacklisteado', { 
          tokenPrefix: token.substring(0, 20) + '...' 
        });
        throw new Error('Token invalidado');
      }

      // Verificar y decodificar el token
      const decoded = jwt.verify(token, envs.JWT_SECRET as string) as JwtPayload;
      return decoded;
    } catch (error: any) {
      if (error.message === 'Token invalidado') {
        throw error;
      }
      
      logger.warn('Error verificando token JWT', { 
        error: error.message,
        tokenPrefix: token.substring(0, 20) + '...'
      });
      
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expirado');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Token inválido');
      }
      
      throw new Error('Error verificando token');
    }
  }

  /**
   * Verificar refresh token
   */
  static verifyRefreshToken(refreshToken: string): { id: string; email: string } {
    try {
      // Verificar si el refresh token está en blacklist
      if (this.blacklistService.isTokenBlacklisted(refreshToken)) {
        throw new Error('Refresh token invalidado');
      }

      const decoded = jwt.verify(
        refreshToken,
        envs.JWT_REFRESH_SECRET as string
      ) as { id: string; email: string };
      
      return decoded;
    } catch (error: any) {
      if (error.message === 'Refresh token invalidado') {
        throw error;
      }
      
      logger.warn('Error verificando refresh token', { error: error.message });
      throw new Error('Refresh token inválido o expirado');
    }
  }

  /**
   * Extraer token del header Authorization
   */
  static extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Invalidar token (agregar a blacklist)
   */
  static invalidateToken(token: string): void {
    try {
      // Decodificar token para obtener tiempo de expiración
      const decoded = jwt.decode(token) as JwtPayload | null;
      const expirationTime = decoded?.exp;
      
      // Agregar a blacklist
      this.blacklistService.addToken(token, expirationTime);
      
      logger.info('Token invalidado exitosamente', { 
        tokenPrefix: token.substring(0, 20) + '...',
        userId: decoded?.id 
      });
    } catch (error) {
      logger.error('Error invalidando token', error);
      throw new Error('Error al invalidar token');
    }
  }

  /**
   * Invalidar refresh token
   */
  static invalidateRefreshToken(refreshToken: string): void {
    try {
      const decoded = jwt.decode(refreshToken) as any;
      const expirationTime = decoded?.exp;
      
      this.blacklistService.addToken(refreshToken, expirationTime);
      
      logger.info('Refresh token invalidado exitosamente', { 
        tokenPrefix: refreshToken.substring(0, 20) + '...'
      });
    } catch (error) {
      logger.error('Error invalidando refresh token', error);
      throw new Error('Error al invalidar refresh token');
    }
  }

  /**
   * Obtener estadísticas de blacklist
   */
  static getBlacklistStats(): { totalBlacklisted: number; withExpiration: number } {
    return this.blacklistService.getStats();
  }
}

export default JwtService;