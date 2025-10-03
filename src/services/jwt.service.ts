import * as jwt from 'jsonwebtoken';
import { envs } from '../config';
import { IUsuario } from '../domain/interfaces';

export interface JwtPayload {
  id: string;
  email: string;
  rol: 'super_admin' | 'admin' | 'gestor';
}

export interface LoginResult {
  usuario: {
    id: string;
    nombre: string;
    email: string;
    rol: 'super_admin' | 'admin' | 'gestor';
  };
  token: string;
  refreshToken: string;
}

export class JwtService {
  /**
   * Genera un token JWT
   */
  static generateToken(payload: JwtPayload): string {
    return (jwt as any).sign(
      payload,
      envs.JWT_SECRET,
      { expiresIn: envs.JWT_EXPIRES_IN }
    );
  }

  /**
   * Genera un refresh token
   */
  static generateRefreshToken(payload: JwtPayload): string {
    return (jwt as any).sign(
      payload,
      envs.JWT_REFRESH_SECRET,
      { expiresIn: envs.JWT_REFRESH_EXPIRES_IN }
    );
  }

  /**
   * Verifica un token JWT
   */
  static verifyToken(token: string): JwtPayload {
    try {
      return (jwt as any).verify(token, envs.JWT_SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  /**
   * Verifica un refresh token
   */
  static verifyRefreshToken(refreshToken: string): JwtPayload {
    try {
      return (jwt as any).verify(refreshToken, envs.JWT_REFRESH_SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('Refresh token inválido o expirado');
    }
  }

  /**
   * Extrae el token del header Authorization
   */
  static extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }

  /**
   * Genera los tokens para un usuario
   */
  static generateTokensForUser(usuario: IUsuario): { token: string; refreshToken: string } {
    const payload: JwtPayload = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    };

    return {
      token: this.generateToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }
}