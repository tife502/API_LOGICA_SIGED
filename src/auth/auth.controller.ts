import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import PrismaService from '../prisma/prisma.service';
import { JwtService, LoginResult } from '../services/jwt.service';
import { logger } from '../config/adapters/winstonAdapter';
import { validateEmail } from '../domain/utils/email.validator';

interface AuthenticatedRequest extends Request {
  usuario?: {
    id: string;
    rol: 'super_admin' | 'admin' | 'gestor';
    email: string;
  };
}

export class AuthController {
  private static prismaService = PrismaService.getInstance();

  /**
   * Login de usuario
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, contrasena } = req.body;

      // Validaciones básicas
      if (!email || !contrasena) {
        res.status(400).json({
          ok: false,
          msg: 'Email y contraseña son requeridos'
        });
        return;
      }

      // Validar formato de email
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        res.status(400).json({
          ok: false,
          msg: 'Formato de email inválido',
          errors: emailValidation.errors
        });
        return;
      }

      // Buscar usuario por email
      const usuario = await AuthController.prismaService.getUsuarioByEmail(email);
      
      if (!usuario) {
        logger.warn('Intento de login con email no registrado', { email });
        res.status(401).json({
          ok: false,
          msg: 'Credenciales inválidas'
        });
        return;
      }

      // Verificar si el usuario está activo
      if (usuario.estado !== 'activo') {
        logger.warn('Intento de login con usuario inactivo', { 
          email, 
          estado: usuario.estado 
        });
        res.status(401).json({
          ok: false,
          msg: 'Usuario inactivo o suspendido'
        });
        return;
      }

      // Verificar contraseña
      const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
      
      if (!contrasenaValida) {
        logger.warn('Intento de login con contraseña incorrecta', { email });
        res.status(401).json({
          ok: false,
          msg: 'Credenciales inválidas'
        });
        return;
      }

      // Generar tokens
      const payload = {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      };
      const tokens = {
        token: JwtService.generateToken(payload),
        refreshToken: JwtService.generateRefreshToken(payload)
      };

      // Preparar respuesta
      const loginResult: LoginResult = {
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        },
        token: tokens.token,
        refreshToken: tokens.refreshToken
      };

      logger.info('Login exitoso', { 
        usuarioId: usuario.id, 
        email: usuario.email 
      });

      res.status(200).json({
        ok: true,
        data: loginResult
      });

    } catch (error) {
      logger.error('Error en login', { error });
      res.status(500).json({
        ok: false,
        msg: 'Error interno del servidor'
      });
    }
  }

  /**
   * Renovar token usando refresh token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          ok: false,
          msg: 'Refresh token requerido'
        });
        return;
      }

      // Verificar refresh token
      const refreshPayload = JwtService.verifyRefreshToken(refreshToken);

      // Obtener usuario actualizado
      const usuario = await AuthController.prismaService.getUsuarioById(refreshPayload.id);
      
      if (!usuario || usuario.estado !== 'activo') {
        res.status(401).json({
          ok: false,
          msg: 'Usuario no válido'
        });
        return;
      }

      // Generar nuevos tokens
      const newPayload = {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      };
      const tokens = {
        token: JwtService.generateToken(newPayload),
        refreshToken: JwtService.generateRefreshToken(newPayload)
      };

      logger.info('Token renovado', { usuarioId: usuario.id });

      res.status(200).json({
        ok: true,
        data: {
          token: tokens.token,
          refreshToken: tokens.refreshToken
        }
      });

    } catch (error) {
      logger.error('Error renovando token', { error });
      res.status(401).json({
        ok: false,
        msg: 'Refresh token inválido o expirado'
      });
    }
  }

  /**
   * Obtener información del usuario autenticado
   */
  static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;

      if (!usuarioId) {
        res.status(401).json({
          ok: false,
          msg: 'No autorizado'
        });
        return;
      }

      const usuario = await AuthController.prismaService.getUsuarioById(usuarioId);
      
      if (!usuario) {
        res.status(404).json({
          ok: false,
          msg: 'Usuario no encontrado'
        });
        return;
      }

      res.status(200).json({
        ok: true,
        data: {
          id: usuario.id,
          tipo_documento: usuario.tipo_documento,
          documento: usuario.documento,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          celular: usuario.celular,
          rol: usuario.rol,
          estado: usuario.estado,
          fecha_creacion: usuario.created_at
        }
      });

    } catch (error) {
      logger.error('Error obteniendo perfil de usuario', { 
        error, 
        usuarioId: req.usuario?.id 
      });
      res.status(500).json({
        ok: false,
        msg: 'Error interno del servidor'
      });
    }
  }

  /**
   * Logout (invalidar token)
   */
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // En un sistema de producción, aquí se podría añadir el token a una blacklist
      // Por ahora, simplemente confirmamos el logout
      
      logger.info('Usuario cerró sesión', { 
        usuarioId: req.usuario?.id,
        email: req.usuario?.email
      });      res.status(200).json({
        ok: true,
        msg: 'Sesión cerrada exitosamente'
      });

    } catch (error) {
            logger.error('Error en logout', { error });
      res.status(500).json({
        ok: false,
        msg: 'Error interno del servidor'
      });
    }
  }

  /**
   * Cambiar contraseña
   */
  static async cambiarContrasena(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuario?.id;
      const { contrasenaActual, contrasenaNueva } = req.body;

      if (!usuarioId) {
        res.status(401).json({
          ok: false,
          msg: 'No autorizado'
        });
        return;
      }

      if (!contrasenaActual || !contrasenaNueva) {
        res.status(400).json({
          ok: false,
          msg: 'Contraseña actual y nueva contraseña son requeridas'
        });
        return;
      }

      if (contrasenaNueva.length < 6) {
        res.status(400).json({
          ok: false,
          msg: 'La nueva contraseña debe tener al menos 6 caracteres'
        });
        return;
      }

      // Obtener usuario completo (con contraseña) usando el email
      const usuarioAuth = req.usuario;
      if (!usuarioAuth?.email) {
        res.status(401).json({
          ok: false,
          msg: 'Usuario no autenticado correctamente'
        });
        return;
      }

      const usuarioCompleto = await AuthController.prismaService.getUsuarioByEmail(usuarioAuth.email);
      
      if (!usuarioCompleto || usuarioCompleto.id !== usuarioId) {
        res.status(404).json({
          ok: false,
          msg: 'Usuario no encontrado'
        });
        return;
      }

      // Verificar contraseña actual
      const contrasenaValida = await bcrypt.compare(contrasenaActual, usuarioCompleto.contrasena);
      
      if (!contrasenaValida) {
        res.status(400).json({
          ok: false,
          msg: 'Contraseña actual incorrecta'
        });
        return;
      }

      // Hash de la nueva contraseña
      const salt = await bcrypt.genSalt(12);
      const nuevaContrasenaHash = await bcrypt.hash(contrasenaNueva, salt);

      // Actualizar contraseña
      await AuthController.prismaService.updateUsuario(usuarioId, {
        contrasena: nuevaContrasenaHash
      });

      logger.info('Contraseña cambiada exitosamente', { 
        usuarioId: usuarioCompleto.id 
      });      res.status(200).json({
        ok: true,
        msg: 'Contraseña cambiada exitosamente'
      });

    } catch (error) {
      logger.error('Error cambiando contraseña', { 
        error, 
        usuarioId: req.usuario?.id 
      });
      res.status(500).json({
        ok: false,
        msg: 'Error interno del servidor'
      });
    }
  }
}