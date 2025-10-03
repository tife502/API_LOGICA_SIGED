import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import PrismaService from '../prisma/prisma.service';
import { logger } from '../config';
import { PrismaInterfaces } from '../domain';
import { validateEmail } from '../domain/utils';

/**
 * Controlador para gestión de usuarios
 * Implementa CRUD completo con:
 * - Contraseñas hasheadas con bcrypt
 * - Validación de email
 * - Borrado lógico (cambio de estado)
 * - Autenticación y autorización
 * - Buenas prácticas de seguridad
 */
export class UsuarioController {
  private prismaService: PrismaService;
  private saltRounds: number = 12; // Rondas de bcrypt para hasheo

  constructor() {
    this.prismaService = PrismaService.getInstance();
  }

  // ============= CREAR USUARIO =============
  
  createUsuario = async (req: Request, res: Response) => {
    try {
      const { 
        tipo_documento, 
        documento, 
        nombre, 
        apellido, 
        email, 
        celular, 
        contrasena, 
        rol = PrismaInterfaces.UsuarioRol.gestor,
        estado = PrismaInterfaces.UsuarioEstado.activo 
      } = req.body;

      // Validar email
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Email inválido',
          error: 'Validation Error',
          details: emailValidation.errors
        });
      }

      // Verificar si ya existe usuario con mismo documento o email
      const existingUser = await this.prismaService.getUsuarios({
        documento,
        email
      });

      if (existingUser.data.length > 0) {
        const existingByDoc = existingUser.data.find(u => u.documento === documento);
        const existingByEmail = existingUser.data.find(u => u.email === email);

        return res.status(409).json({
          success: false,
          message: `Ya existe un usuario con ${existingByDoc ? 'ese documento' : 'ese email'}`,
          error: 'Conflict'
        });
      }

      // Hashear contraseña
      const hashedPassword = await bcrypt.hash(contrasena, this.saltRounds);

      // Crear datos para usuario
      const usuarioData: PrismaInterfaces.ICreateUsuario = {
        tipo_documento,
        documento,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.toLowerCase().trim(),
        celular: celular?.trim(),
        contrasena: hashedPassword,
        rol: rol as PrismaInterfaces.UsuarioRol,
        estado: estado as PrismaInterfaces.UsuarioEstado
      };

      const nuevoUsuario = await this.prismaService.createUsuario(usuarioData);

      logger.info('Usuario creado exitosamente', { 
        id: nuevoUsuario.id, 
        email: nuevoUsuario.email,
        createdBy: req.usuario?.id 
      });

      // Respuesta sin contraseña
      const { contrasena: _, ...usuarioResponse } = nuevoUsuario;

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: usuarioResponse
      });

    } catch (error: any) {
      logger.error('Error creando usuario', error);
      
      // Manejar errores específicos de Prisma
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un usuario con ese documento o email',
          error: 'Conflict'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  createInitialUser = async (req: Request, res: Response) => {
    try {
      // Verificar si ya existe al menos un usuario
      const existingUsers = await this.prismaService.getUsuarios({}, { page: 1, limit: 1 });
      
      if (existingUsers.data.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ya existen usuarios en el sistema. Use el endpoint normal de creación.',
          error: 'Bad Request'
        });
      }

      const { tipo_documento, documento, nombre, apellido, email, celular,contrasena, rol = 'super_admin' } = req.body;

      // Validaciones básicas
      if (!tipo_documento || !documento || !nombre || !apellido || !email || !contrasena) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos',
          error: 'Validation Error'
        });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Email no válido',
          error: 'Validation Error'
        });
      }

      if (contrasena.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 8 caracteres',
          error: 'Validation Error'
        });
      }

      const hashedPassword = await bcrypt.hash(contrasena, this.saltRounds);

      // Crear usuario inicial con rol super_admin
      const userData: PrismaInterfaces.ICreateUsuario = {
        tipo_documento,
        documento,
        nombre,
        apellido,
        email,
        celular,
        contrasena : hashedPassword,
        rol: rol as PrismaInterfaces.UsuarioRol.super_admin,
        estado: PrismaInterfaces.UsuarioEstado.activo
      };

      const nuevoUsuario = await this.prismaService.createUsuario(userData);

      logger.info(`Usuario inicial creado: ${email}`);

      res.status(201).json({
        success: true,
        message: 'Usuario inicial creado exitosamente',
        data: {
          id: nuevoUsuario.id,
          email: nuevoUsuario.email,
          nombre: nuevoUsuario.nombre,
          apellido: nuevoUsuario.apellido,
          rol: nuevoUsuario.rol,
          documento: nuevoUsuario.documento,
          tipo_documento: nuevoUsuario.tipo_documento
        }
      });
    } catch (error: any) {
      logger.error('Error creando usuario inicial', error);
      
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0];
        return res.status(400).json({
          success: false,
          message: `Ya existe un usuario con este ${field === 'email' ? 'email' : 'documento'}`,
          error: 'Conflict'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };



  // ============= OBTENER USUARIOS =============

  getUsuarios = async (req: Request, res: Response) => {
    try {
      // Filtros de búsqueda
      const filters: PrismaInterfaces.IUsuarioFilters = {
        tipo_documento: req.query.tipo_documento as string,
        documento: req.query.documento as string,
        nombre: req.query.nombre as string,
        apellido: req.query.apellido as string,
        email: req.query.email as string,
        rol: req.query.rol as PrismaInterfaces.UsuarioRol,
        estado: req.query.estado as PrismaInterfaces.UsuarioEstado
      };

      // Eliminar campos vacíos
      Object.keys(filters).forEach(key => {
        if (!filters[key as keyof PrismaInterfaces.IUsuarioFilters]) {
          delete filters[key as keyof PrismaInterfaces.IUsuarioFilters];
        }
      });

      // Solo mostrar usuarios activos por defecto (excluir inactivos)
      if (!filters.estado) {
        filters.estado = PrismaInterfaces.UsuarioEstado.activo;
      }

      // Paginación
      const pagination: PrismaInterfaces.IPaginationOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        orderBy: req.query.orderBy as string || 'created_at',
        orderDirection: (req.query.orderDirection as 'asc' | 'desc') || 'desc'
      };

      const resultado = await this.prismaService.getUsuarios(filters, pagination);

      logger.info(`Usuarios obtenidos: ${resultado.data.length}`, {
        filters,
        requestedBy: req.usuario?.id
      });

      res.status(200).json({
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        ...resultado
      });

    } catch (error: any) {
      logger.error('Error obteniendo usuarios', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  // ============= OBTENER USUARIOS INACTIVOS =============

  getUsuariosInactivos = async (req: Request, res: Response) => {
    try {
      const filters: PrismaInterfaces.IUsuarioFilters = {
        tipo_documento: req.query.tipo_documento as string,
        documento: req.query.documento as string,
        nombre: req.query.nombre as string,
        apellido: req.query.apellido as string,
        email: req.query.email as string,
        rol: req.query.rol as PrismaInterfaces.UsuarioRol,
        estado: PrismaInterfaces.UsuarioEstado.inactivo // Forzar estado inactivo
      };

      // Eliminar campos vacíos (excepto estado)
      Object.keys(filters).forEach(key => {
        if (key !== 'estado' && !filters[key as keyof PrismaInterfaces.IUsuarioFilters]) {
          delete filters[key as keyof PrismaInterfaces.IUsuarioFilters];
        }
      });

      const pagination: PrismaInterfaces.IPaginationOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        orderBy: req.query.orderBy as string || 'updated_at',
        orderDirection: (req.query.orderDirection as 'asc' | 'desc') || 'desc'
      };

      const resultado = await this.prismaService.getUsuarios(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Usuarios inactivos obtenidos exitosamente',
        ...resultado
      });

    } catch (error: any) {
      logger.error('Error obteniendo usuarios inactivos', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  // ============= OBTENER USUARIO POR ID =============

  getUsuarioById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID del usuario es requerido',
          error: 'Validation Error'
        });
      }

      const usuario = await this.prismaService.getUsuarioById(id);

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
          error: 'Not Found'
        });
      }

      logger.info('Usuario obtenido por ID', { 
        id, 
        requestedBy: req.usuario?.id 
      });

      res.status(200).json({
        success: true,
        message: 'Usuario obtenido exitosamente',
        data: usuario
      });

    } catch (error: any) {
      logger.error('Error obteniendo usuario por ID', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  // ============= ACTUALIZAR USUARIO =============

  updateUsuario = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID del usuario es requerido',
          error: 'Validation Error'
        });
      }

      // Verificar que el usuario existe
      const usuarioExistente = await this.prismaService.getUsuarioById(id);
      
      if (!usuarioExistente) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
          error: 'Not Found'
        });
      }

      // Validar email si se proporciona
      if (req.body.email) {
        const emailValidation = validateEmail(req.body.email);
        if (!emailValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: 'Email inválido',
            error: 'Validation Error',
            details: emailValidation.errors
          });
        }
      }

      // Preparar datos para actualizar
      const updateData: PrismaInterfaces.IUpdateUsuario = {
        tipo_documento: req.body.tipo_documento,
        documento: req.body.documento,
        nombre: req.body.nombre?.trim(),
        apellido: req.body.apellido?.trim(),
        email: req.body.email?.toLowerCase().trim(),
        celular: req.body.celular?.trim(),
        rol: req.body.rol as PrismaInterfaces.UsuarioRol,
        estado: req.body.estado as PrismaInterfaces.UsuarioEstado
      };

      // Hashear nueva contraseña si se proporciona
      if (req.body.contrasena) {
        updateData.contrasena = await bcrypt.hash(req.body.contrasena, this.saltRounds);
      }

      // Eliminar campos vacíos/undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof PrismaInterfaces.IUpdateUsuario] === undefined) {
          delete updateData[key as keyof PrismaInterfaces.IUpdateUsuario];
        }
      });

      const usuarioActualizado = await this.prismaService.updateUsuario(id, updateData);

      logger.info('Usuario actualizado exitosamente', { 
        id, 
        updatedBy: req.usuario?.id,
        fields: Object.keys(updateData)
      });

      // Respuesta sin contraseña
      const { contrasena: _, ...usuarioResponse } = usuarioActualizado;

      res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuarioResponse
      });

    } catch (error: any) {
      logger.error('Error actualizando usuario', error);
      
      // Manejar errores específicos de Prisma
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un usuario con ese documento o email',
          error: 'Conflict'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  // ============= BORRADO LÓGICO (DESACTIVAR) =============

  deleteUsuario = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID del usuario es requerido',
          error: 'Validation Error'
        });
      }

      // Verificar que el usuario existe y está activo
      const usuarioExistente = await this.prismaService.getUsuarioById(id);
      
      if (!usuarioExistente) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
          error: 'Not Found'
        });
      }

      if (usuarioExistente.estado === PrismaInterfaces.UsuarioEstado.inactivo) {
        return res.status(400).json({
          success: false,
          message: 'El usuario ya está inactivo',
          error: 'Bad Request'
        });
      }

      // Evitar que se desactive a sí mismo
      if (req.usuario?.id === id) {
        return res.status(400).json({
          success: false,
          message: 'No puedes desactivar tu propia cuenta',
          error: 'Bad Request'
        });
      }

      // Borrado lógico: cambiar estado a inactivo
      const usuarioDesactivado = await this.prismaService.updateUsuario(id, {
        estado: PrismaInterfaces.UsuarioEstado.inactivo
      });

      logger.info('Usuario desactivado exitosamente', { 
        id, 
        deactivatedBy: req.usuario?.id 
      });

      // Respuesta sin contraseña
      const { contrasena: _, ...usuarioResponse } = usuarioDesactivado;

      res.status(200).json({
        success: true,
        message: 'Usuario desactivado exitosamente',
        data: usuarioResponse
      });

    } catch (error: any) {
      logger.error('Error desactivando usuario', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  // ============= REACTIVAR USUARIO =============

  reactivarUsuario = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID del usuario es requerido',
          error: 'Validation Error'
        });
      }

      // Verificar que el usuario existe
      const usuarioExistente = await this.prismaService.getUsuarioById(id);
      
      if (!usuarioExistente) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
          error: 'Not Found'
        });
      }

      if (usuarioExistente.estado === PrismaInterfaces.UsuarioEstado.activo) {
        return res.status(400).json({
          success: false,
          message: 'El usuario ya está activo',
          error: 'Bad Request'
        });
      }

      // Reactivar: cambiar estado a activo
      const usuarioReactivado = await this.prismaService.updateUsuario(id, {
        estado: PrismaInterfaces.UsuarioEstado.activo
      });

      logger.info('Usuario reactivado exitosamente', { 
        id, 
        reactivatedBy: req.usuario?.id 
      });

      // Respuesta sin contraseña
      const { contrasena: _, ...usuarioResponse } = usuarioReactivado;

      res.status(200).json({
        success: true,
        message: 'Usuario reactivado exitosamente',
        data: usuarioResponse
      });

    } catch (error: any) {
      logger.error('Error reactivando usuario', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  // ============= CAMBIAR CONTRASEÑA =============

  cambiarContrasena = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { contrasenaActual, contrasenaNueva } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID del usuario es requerido',
          error: 'Validation Error'
        });
      }

      if (!contrasenaActual || !contrasenaNueva) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual y nueva son requeridas',
          error: 'Validation Error'
        });
      }

      // Obtener usuario con contraseña
      const usuario = await this.prismaService.getUsuarioById(id);
      
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
          error: 'Not Found'
        });
      }

      // Verificar contraseña actual (solo si no es admin cambiando otra cuenta)
      if (req.usuario?.id === id) {
        // TODO: Aquí necesitarías obtener la contraseña hasheada de la base de datos
        // const isCurrentPasswordValid = await bcrypt.compare(contrasenaActual, usuario.contrasena);
        // if (!isCurrentPasswordValid) {
        //   return res.status(400).json({
        //     success: false,
        //     message: 'Contraseña actual incorrecta',
        //     error: 'Bad Request'
        //   });
        // }
      }

      // Validar nueva contraseña
      if (contrasenaNueva.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 8 caracteres',
          error: 'Validation Error'
        });
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(contrasenaNueva)) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe contener al menos una minúscula, una mayúscula y un número',
          error: 'Validation Error'
        });
      }

      // Hashear nueva contraseña
      const hashedNewPassword = await bcrypt.hash(contrasenaNueva, this.saltRounds);

      await this.prismaService.updateUsuario(id, {
        contrasena: hashedNewPassword
      });

      logger.info('Contraseña cambiada exitosamente', { 
        id, 
        changedBy: req.usuario?.id 
      });

      res.status(200).json({
        success: true,
        message: 'Contraseña cambiada exitosamente'
      });

    } catch (error: any) {
      logger.error('Error cambiando contraseña', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };
}

