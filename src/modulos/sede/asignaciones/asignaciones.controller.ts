import { Request, Response } from 'express';
import PrismaService from '../../../prisma/prisma.service';
import { logger } from '../../../config';
import { PrismaInterfaces } from '../../../domain';

/**
 * Controlador para gestión de asignaciones empleado-sede
 * Maneja la relación entre empleados y las sedes donde trabajan
 */
export class AsignacionEmpleadoController {
  private prismaService: PrismaService;

  constructor() {
    this.prismaService = PrismaService.getInstance();
  }

  /**
   * Crear asignación empleado-sede
   * Permisos: super_admin, admin
   */
  createAsignacion = async (req: Request, res: Response) => {
    try {
      const usuario = req.usuario;
      const { sede_id } = req.params;
      
      const asignacionData: PrismaInterfaces.ICreateAsignacionEmpleado = {
        empleado_id: req.body.empleado_id,
        sede_id,
        fecha_asignacion: req.body.fecha_asignacion ? new Date(req.body.fecha_asignacion) : new Date(),
        fecha_fin: req.body.fecha_fin ? new Date(req.body.fecha_fin) : undefined,
        estado: req.body.estado || PrismaInterfaces.AsignacionEmpleadoEstado.activa
      };

      // Validación básica
      if (!asignacionData.empleado_id) {
        return res.status(400).json({
          success: false,
          message: 'ID de empleado es requerido',
          error: 'Validation Error'
        });
      }

      if (!sede_id) {
        return res.status(400).json({
          success: false,
          message: 'ID de sede es requerido',
          error: 'Validation Error'
        });
      }

      // Verificar que el empleado existe
      const empleado = await this.prismaService.getEmpleadoById(asignacionData.empleado_id);
      if (!empleado) {
        return res.status(404).json({
          success: false,
          message: 'Empleado no encontrado'
        });
      }

      // Verificar que la sede existe
      const sede = await this.prismaService.getSedeById(sede_id);
      if (!sede) {
        return res.status(404).json({
          success: false,
          message: 'Sede no encontrada'
        });
      }

      const asignacion = await this.prismaService.createAsignacionEmpleado(asignacionData);

      logger.info(`Asignación creada: empleado ${asignacionData.empleado_id} a sede ${sede_id} por usuario ${usuario?.id}`, {
        action: 'CREATE_ASIGNACION_EMPLEADO',
        userId: usuario?.id,
        empleadoId: asignacionData.empleado_id,
        sedeId: sede_id,
        asignacionId: asignacion.id
      });

      res.status(201).json({
        success: true,
        message: 'Asignación creada exitosamente',
        data: asignacion
      });

    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'El empleado ya tiene una asignación activa en esta sede',
          error: 'Duplicate Entry'
        });
      }

      logger.error('Error al crear asignación empleado-sede:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener asignaciones de una sede
   * Permisos: super_admin, admin, gestor
   */
  getAsignacionesBySede = async (req: Request, res: Response) => {
    try {
      const { sede_id } = req.params;
      const { 
        estado,
        empleado_id,
        page = '1', 
        limit = '10' 
      } = req.query as any;

      if (!sede_id) {
        return res.status(400).json({
          success: false,
          message: 'ID de sede es requerido'
        });
      }

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

      const filters: PrismaInterfaces.IAsignacionEmpleadoFilters = {
        sede_id
      };

      if (estado) filters.estado = estado as PrismaInterfaces.AsignacionEmpleadoEstado;
      if (empleado_id) filters.empleado_id = empleado_id;

      const pagination: PrismaInterfaces.IPaginationOptions = {
        page: pageNum,
        limit: limitNum,
        orderBy: 'fecha_asignacion',
        orderDirection: 'desc'
      };

      const result = await this.prismaService.getAsignacionesEmpleado(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Asignaciones obtenidas exitosamente',
        data: result.data,
        pagination: result.pagination
      });

    } catch (error) {
      logger.error('Error al obtener asignaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Actualizar asignación empleado-sede
   * Permisos: super_admin, admin
   */
  updateAsignacion = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuario = req.usuario;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de asignación requerido'
        });
      }

      const updateData: PrismaInterfaces.IUpdateAsignacionEmpleado = {};
      
      if (req.body.fecha_fin !== undefined) {
        updateData.fecha_fin = req.body.fecha_fin ? new Date(req.body.fecha_fin) : undefined;
      }
      if (req.body.estado !== undefined) {
        updateData.estado = req.body.estado;
      }

      const updatedAsignacion = await this.prismaService.updateAsignacionEmpleado(id, updateData);

      logger.info(`Asignación actualizada: ${id} por usuario ${usuario?.id}`, {
        action: 'UPDATE_ASIGNACION_EMPLEADO',
        userId: usuario?.id,
        asignacionId: id,
        changes: updateData
      });

      res.status(200).json({
        success: true,
        message: 'Asignación actualizada exitosamente',
        data: updatedAsignacion
      });

    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Asignación no encontrada'
        });
      }

      logger.error('Error al actualizar asignación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Finalizar asignación (cambiar estado a finalizada)
   * Permisos: super_admin, admin
   */
  finalizarAsignacion = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuario = req.usuario;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de asignación requerido'
        });
      }

      const updateData: PrismaInterfaces.IUpdateAsignacionEmpleado = {
        estado: PrismaInterfaces.AsignacionEmpleadoEstado.finalizada,
        fecha_fin: new Date()
      };

      const asignacionFinalizada = await this.prismaService.updateAsignacionEmpleado(id, updateData);

      logger.info(`Asignación finalizada: ${id} por usuario ${usuario?.id}`, {
        action: 'FINALIZAR_ASIGNACION_EMPLEADO',
        userId: usuario?.id,
        asignacionId: id
      });

      res.status(200).json({
        success: true,
        message: 'Asignación finalizada exitosamente',
        data: asignacionFinalizada
      });

    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Asignación no encontrada'
        });
      }

      logger.error('Error al finalizar asignación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Eliminar asignación
   * Permisos: super_admin
   */
  deleteAsignacion = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuario = req.usuario;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de asignación requerido'
        });
      }

      await this.prismaService.deleteAsignacionEmpleado(id);

      logger.info(`Asignación eliminada: ${id} por usuario ${usuario?.id}`, {
        action: 'DELETE_ASIGNACION_EMPLEADO',
        userId: usuario?.id,
        asignacionId: id
      });

      res.status(200).json({
        success: true,
        message: 'Asignación eliminada exitosamente'
      });

    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Asignación no encontrada'
        });
      }

      logger.error('Error al eliminar asignación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
}