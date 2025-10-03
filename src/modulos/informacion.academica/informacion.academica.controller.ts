import { Request, Response } from 'express';
import PrismaService from '../../prisma/prisma.service';
import { logger } from '../../config';
import { PrismaInterfaces } from '../../domain';

/**
 * Controlador para gestión de información académica de empleados
 * Los gestores digitalizan y actualizan la formación académica de docentes/rectores
 */
export class InformacionAcademicaController {
  private prismaService: PrismaService;

  constructor() {
    this.prismaService = PrismaService.getInstance();
  }

  /**
   * Crear nueva información académica para un empleado
   * Permitido: gestores, admin, super_admin
   */
  createInformacionAcademica = async (req: Request, res: Response) => {
    try {
      const usuario = req.usuario; // Usuario que está digitalizando
      
      // Validar datos de entrada
      const informacionData: PrismaInterfaces.ICreateInformacionAcademica = {
        empleado_id: req.body.empleado_id,
        nivel_academico: req.body.nivel_academico as PrismaInterfaces.NivelAcademico,
        anos_experiencia: req.body.anos_experiencia || 0,
        institucion: req.body.institucion,
        titulo: req.body.titulo
      };

      // Validaciones básicas
      if (!informacionData.empleado_id || !informacionData.nivel_academico) {
        return res.status(400).json({
          success: false,
          message: 'empleado_id y nivel_academico son requeridos',
          error: 'Validation Error'
        });
      }

      // Verificar que el empleado existe y está activo
      const empleado = await this.prismaService.getEmpleadoById(informacionData.empleado_id);
      
      if (!empleado) {
        return res.status(404).json({
          success: false,
          message: 'El empleado especificado no existe',
          error: 'Not Found'
        });
      }

      if (empleado.estado !== 'activo') {
        return res.status(400).json({
          success: false,
          message: 'No se puede agregar información académica a un empleado inactivo',
          error: 'Bad Request'
        });
      }

      // Validar años de experiencia
      if (informacionData.anos_experiencia && informacionData.anos_experiencia < 0) {
        return res.status(400).json({
          success: false,
          message: 'Los años de experiencia no pueden ser negativos',
          error: 'Validation Error'
        });
      }

      const nuevaInformacion = await this.prismaService.createInformacionAcademica(informacionData);

      // Auditoría: Quién digitalizó la información académica
      logger.info(`Información académica digitalizada por ${usuario?.email} (${usuario?.rol})`, {
        informacion_id: nuevaInformacion.id,
        empleado_id: informacionData.empleado_id,
        empleado_nombre: `${empleado.nombre} ${empleado.apellido}`,
        nivel_academico: informacionData.nivel_academico,
        digitalizado_por: usuario?.id,
        digitalizado_por_rol: usuario?.rol
      });

      res.status(201).json({
        success: true,
        message: 'Información académica creada exitosamente',
        data: nuevaInformacion
      });
    } catch (error: any) {
      logger.error('Error en createInformacionAcademica controller', error);
      
      // Manejo específico de errores de Prisma
      if (error.code === 'P2003') {
        return res.status(400).json({
          success: false,
          message: 'El empleado especificado no existe',
          error: 'Foreign Key Constraint'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  /**
   * Obtener información académica con filtros y paginación
   * Permitido: todos los roles autenticados
   */
  getInformacionAcademica = async (req: Request, res: Response) => {
    try {
      const usuario = req.usuario;
      
      // Filtros opcionales
      const filters: PrismaInterfaces.IInformacionAcademicaFilters = {
        empleado_id: req.query.empleado_id as string,
        nivel_academico: req.query.nivel_academico as PrismaInterfaces.NivelAcademico,
        anos_experiencia_min: req.query.anos_experiencia_min ? parseInt(req.query.anos_experiencia_min as string) : undefined,
        anos_experiencia_max: req.query.anos_experiencia_max ? parseInt(req.query.anos_experiencia_max as string) : undefined,
        institucion: req.query.institucion as string,
        titulo: req.query.titulo as string
      };

      // Eliminar campos vacíos
      Object.keys(filters).forEach(key => {
        if (!filters[key as keyof PrismaInterfaces.IInformacionAcademicaFilters]) {
          delete filters[key as keyof PrismaInterfaces.IInformacionAcademicaFilters];
        }
      });

      // Paginación
      const pagination: PrismaInterfaces.IPaginationOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        orderBy: req.query.orderBy as string || 'created_at',
        orderDirection: (req.query.orderDirection as 'asc' | 'desc') || 'desc'
      };

      const resultado = await this.prismaService.getInformacionAcademica(filters, pagination);

      // Log de consulta (sin saturar el log)
      if (usuario?.rol === 'gestor') {
        logger.info(`Gestor ${usuario.email} consultó información académica`, {
          total_encontradas: resultado.pagination.total,
          pagina: pagination.page
        });
      }

      res.status(200).json({
        success: true,
        message: 'Información académica obtenida exitosamente',
        ...resultado
      });
    } catch (error: any) {
      logger.error('Error en getInformacionAcademica controller', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  /**
   * Obtener información académica de un empleado específico
   * Permitido: todos los roles autenticados
   */
  getInformacionAcademicaByEmpleado = async (req: Request, res: Response) => {
    try {
      const { empleado_id } = req.params;
      const usuario = req.usuario;

      if (!empleado_id) {
        return res.status(400).json({
          success: false,
          message: 'ID del empleado es requerido',
          error: 'Validation Error'
        });
      }

      // Verificar que el empleado existe
      const empleado = await this.prismaService.getEmpleadoById(empleado_id);
      
      if (!empleado) {
        return res.status(404).json({
          success: false,
          message: 'El empleado especificado no existe',
          error: 'Not Found'
        });
      }

      const informacionAcademica = await this.prismaService.getInformacionAcademicaByEmpleado(empleado_id);

      logger.info(`Información académica consultada por ${usuario?.email}`, {
        empleado_id,
        empleado_nombre: `${empleado.nombre} ${empleado.apellido}`,
        total_registros: informacionAcademica.length
      });

      res.status(200).json({
        success: true,
        message: 'Información académica del empleado obtenida exitosamente',
        data: {
          empleado: {
            id: empleado.id,
            documento: empleado.documento,
            nombre: empleado.nombre,
            apellido: empleado.apellido,
            cargo: empleado.cargo
          },
          informacion_academica: informacionAcademica
        }
      });
    } catch (error: any) {
      logger.error('Error en getInformacionAcademicaByEmpleado controller', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  /**
   * Obtener información académica por ID
   * Permitido: todos los roles autenticados
   */
  getInformacionAcademicaById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de la información académica es requerido',
          error: 'Validation Error'
        });
      }

      const informacionAcademica = await this.prismaService.getInformacionAcademicaById(id);
      
      if (!informacionAcademica) {
        return res.status(404).json({
          success: false,
          message: 'Información académica no encontrada',
          error: 'Not Found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Información académica obtenida exitosamente',
        data: informacionAcademica
      });
    } catch (error: any) {
      logger.error('Error en getInformacionAcademicaById controller', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  /**
   * Actualizar información académica
   * Permitido: gestores, admin, super_admin
   */
  updateInformacionAcademica = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuario = req.usuario;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de la información académica es requerido',
          error: 'Validation Error'
        });
      }

      // Verificar que la información académica existe
      const informacionExistente = await this.prismaService.getInformacionAcademicaById(id);
      
      if (!informacionExistente) {
        return res.status(404).json({
          success: false,
          message: 'Información académica no encontrada',
          error: 'Not Found'
        });
      }
      
      // Datos para actualizar
      const updateData: PrismaInterfaces.IUpdateInformacionAcademica = {
        nivel_academico: req.body.nivel_academico as PrismaInterfaces.NivelAcademico,
        anos_experiencia: req.body.anos_experiencia,
        institucion: req.body.institucion,
        titulo: req.body.titulo
      };

      // Eliminar campos vacíos/undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof PrismaInterfaces.IUpdateInformacionAcademica] === undefined) {
          delete updateData[key as keyof PrismaInterfaces.IUpdateInformacionAcademica];
        }
      });

      // Validar años de experiencia si se proporciona
      if (updateData.anos_experiencia && updateData.anos_experiencia < 0) {
        return res.status(400).json({
          success: false,
          message: 'Los años de experiencia no pueden ser negativos',
          error: 'Validation Error'
        });
      }

      const informacionActualizada = await this.prismaService.updateInformacionAcademica(id, updateData);

      // Auditoría: Cambios realizados
      logger.info(`Información académica actualizada por ${usuario?.email} (${usuario?.rol})`, {
        informacion_id: id,
        empleado_id: informacionExistente.empleado_id,
        empleado_nombre: `${informacionExistente.empleado.nombre} ${informacionExistente.empleado.apellido}`,
        campos_modificados: Object.keys(updateData),
        modificado_por: usuario?.id,
        modificado_por_rol: usuario?.rol
      });

      res.status(200).json({
        success: true,
        message: 'Información académica actualizada exitosamente',
        data: informacionActualizada
      });
    } catch (error: any) {
      logger.error('Error en updateInformacionAcademica controller', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  /**
   * Eliminar información académica (eliminación física)
   * Permitido: admin, super_admin
   */
  deleteInformacionAcademica = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuario = req.usuario;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de la información académica es requerido',
          error: 'Validation Error'
        });
      }

      // Verificar que la información académica existe
      const informacionExistente = await this.prismaService.getInformacionAcademicaById(id);
      
      if (!informacionExistente) {
        return res.status(404).json({
          success: false,
          message: 'Información académica no encontrada',
          error: 'Not Found'
        });
      }

      // Eliminación física (no hay borrado lógico en información académica por ser datos históricos)
      const informacionEliminada = await this.prismaService.deleteInformacionAcademica(id);

      // Auditoría CRÍTICA: Eliminación de información académica
      logger.warn(`🗑️ INFORMACIÓN ACADÉMICA ELIMINADA - Decisión administrativa`, {
        informacion_id: id,
        empleado_id: informacionExistente.empleado_id,
        empleado_nombre: `${informacionExistente.empleado.nombre} ${informacionExistente.empleado.apellido}`,
        nivel_academico: informacionExistente.nivel_academico,
        institucion: informacionExistente.institucion,
        titulo: informacionExistente.titulo,
        eliminado_por: usuario?.id,
        eliminado_por_email: usuario?.email,
        eliminado_por_rol: usuario?.rol,
        fecha_eliminacion: new Date().toISOString(),
        razon: 'Eliminación administrativa de información académica'
      });

      res.status(200).json({
        success: true,
        message: 'Información académica eliminada exitosamente',
        data: informacionEliminada
      });
    } catch (error: any) {
      logger.error('Error en deleteInformacionAcademica controller', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  /**
   * Obtener estadísticas de niveles académicos
   * Permitido: todos los roles autenticados
   */
  getEstadisticasNivelesAcademicos = async (req: Request, res: Response) => {
    try {
      const usuario = req.usuario;

      const estadisticas = await this.prismaService.getEstadisticasNivelesAcademicos();

      logger.info(`Estadísticas académicas consultadas por ${usuario?.email}`, {
        total_empleados_activos: estadisticas.resumen.total_empleados_activos,
        empleados_con_info_academica: estadisticas.resumen.empleados_con_informacion_academica
      });

      res.status(200).json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: estadisticas
      });
    } catch (error: any) {
      logger.error('Error en getEstadisticasNivelesAcademicos controller', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };
}
