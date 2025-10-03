import { Request, Response } from 'express';
import { logger } from '../../../config';
import { EmpleadoService } from './empleado.service';

/**
 * Controlador para flujos normales de empleados
 * Maneja endpoints para empleados que se asignan a una sola sede
 */
export class EmpleadoNormalController {
  private empleadoService: EmpleadoService;

  constructor() {
    this.empleadoService = new EmpleadoService();
  }

  /**
   * POST /api/v1/empleados/normal/crear-con-sede
   * Crear empleado normal y asignarlo a una sede específica
   */
  public crearEmpleadoConSede = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { empleado, informacionAcademica, sedeId, fechaAsignacion } = req.body;

      // Validaciones básicas
      if (!empleado || !sedeId) {
        return res.status(400).json({
          success: false,
          message: 'Datos del empleado y sedeId son requeridos',
          data: null
        });
      }

      logger.info('Creando empleado con sede', {
        empleado: empleado.nombre,
        sedeId
      });

      const resultado = await this.empleadoService.crearEmpleadoConSede({
        empleado,
        informacionAcademica,
        sedeId,
        fechaAsignacion: fechaAsignacion ? new Date(fechaAsignacion) : undefined
      });

      return res.status(201).json({
        success: true,
        message: 'Empleado creado y asignado exitosamente',
        data: resultado
      });

    } catch (error) {
      logger.error('Error creando empleado con sede', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * POST /api/v1/empleados/normal/:empleadoId/asignar-sede
   * Asignar empleado existente a una sede
   */
  public asignarEmpleadoASede = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { empleadoId } = req.params;
      const { sedeId, fechaAsignacion, reemplazarAsignacionActual } = req.body;

      if (!sedeId) {
        return res.status(400).json({
          success: false,
          message: 'ID de sede es requerido',
          data: null
        });
      }

      logger.info('Asignando empleado a sede', {
        empleadoId,
        sedeId
      });

      const resultado = await this.empleadoService.asignarEmpleadoASede({
        empleadoId,
        sedeId,
        fechaAsignacion: fechaAsignacion ? new Date(fechaAsignacion) : undefined,
        reemplazarAsignacionActual
      });

      return res.status(200).json({
        success: true,
        message: 'Empleado asignado exitosamente',
        data: resultado
      });

    } catch (error) {
      logger.error('Error asignando empleado a sede', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * PUT /api/v1/empleados/normal/:empleadoId/transferir-sede
   * Transferir empleado a nueva sede
   */
  public transferirEmpleadoASede = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { empleadoId } = req.params;
      const { nuevaSedeId, fechaTransferencia, motivoTransferencia } = req.body;

      if (!nuevaSedeId) {
        return res.status(400).json({
          success: false,
          message: 'ID de nueva sede es requerido',
          data: null
        });
      }

      logger.info('Transfiriendo empleado a nueva sede', {
        empleadoId,
        nuevaSedeId
      });

      const resultado = await this.empleadoService.transferirEmpleadoASede({
        empleadoId,
        nuevaSedeId,
        fechaTransferencia: fechaTransferencia ? new Date(fechaTransferencia) : undefined,
        motivoTransferencia
      });

      return res.status(200).json({
        success: true,
        message: 'Empleado transferido exitosamente',
        data: resultado
      });

    } catch (error) {
      logger.error('Error transfiriendo empleado', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * DELETE /api/v1/empleados/normal/:empleadoId/finalizar-asignacion
   * Finalizar asignación actual del empleado (dar de baja de sede)
   */
  public finalizarAsignacion = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { empleadoId } = req.params;
      const { fechaFin, motivo } = req.body;

      logger.info('Finalizando asignación de empleado', {
        empleadoId
      });

      const resultado = await this.empleadoService.finalizarAsignacionEmpleado({
        empleadoId,
        fechaFin: fechaFin ? new Date(fechaFin) : undefined,
        motivo
      });

      return res.status(200).json({
        success: true,
        message: 'Asignación finalizada exitosamente',
        data: resultado
      });

    } catch (error) {
      logger.error('Error finalizando asignación', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * GET /api/v1/empleados/normal/sede/:sedeId/empleados
   * Obtener empleados de una sede específica
   */
  public getEmpleadosPorSede = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { sedeId } = req.params;
      const { cargo, estado, solo_activos } = req.query;

      const filtros = {
        cargo: cargo as string,
        estado: estado as 'activo' | 'inactivo',
        soloAsignacionesActivas: solo_activos === 'true'
      };

      logger.info('Obteniendo empleados por sede', {
        sedeId,
        filtros
      });

      const empleados = await this.empleadoService.getEmpleadosPorSede(sedeId, filtros);

      return res.status(200).json({
        success: true,
        message: 'Empleados obtenidos exitosamente',
        data: empleados,
        metadata: {
          total: empleados.length,
          sede: sedeId,
          filtros
        }
      });

    } catch (error) {
      logger.error('Error obteniendo empleados por sede', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * GET /api/v1/empleados/normal/sedes-disponibles
   * Obtener sedes disponibles para asignar empleados
   */
  public getSedesDisponibles = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { zona, con_capacidad } = req.query;

      const filtros = {
        zona: zona as any,
        conCapacidad: con_capacidad === 'true'
      };

      logger.info('Obteniendo sedes disponibles', {
        filtros
      });

      const sedes = await this.empleadoService.getSedesDisponibles(filtros);

      return res.status(200).json({
        success: true,
        message: 'Sedes disponibles obtenidas exitosamente',
        data: sedes,
        metadata: {
          total: sedes.length,
          filtros
        }
      });

    } catch (error) {
      logger.error('Error obteniendo sedes disponibles', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * GET /api/v1/empleados/normal/:empleadoId/historial-asignaciones
   * Obtener historial completo de asignaciones de un empleado
   */
  public getHistorialAsignaciones = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { empleadoId } = req.params;

      logger.info('Obteniendo historial de asignaciones', {
        empleadoId
      });

      const historial = await this.empleadoService.getHistorialAsignacionesEmpleado(empleadoId);

      return res.status(200).json({
        success: true,
        message: 'Historial de asignaciones obtenido exitosamente',
        data: historial
      });

    } catch (error) {
      logger.error('Error obteniendo historial de asignaciones', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * GET /api/v1/empleados/normal/validar-asignacion
   * Validar si se puede asignar un empleado a una sede
   */
  public validarAsignacion = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { empleadoId, sedeId } = req.query;

      if (!empleadoId || !sedeId) {
        return res.status(400).json({
          success: false,
          message: 'empleadoId y sedeId son requeridos',
          data: null
        });
      }

      logger.info('Validando asignación empleado-sede', {
        empleadoId,
        sedeId
      });

      // Verificar empleado
      const empleado = await this.empleadoService['prismaService'].executeTransaction(async (prisma) => {
        return await prisma.empleado.findUnique({
          where: { id: empleadoId as string },
          include: {
            asignacion_empleado: {
              where: { estado: 'activa' }
            }
          }
        });
      });

      // Verificar sede
      const sede = await this.empleadoService['prismaService'].executeTransaction(async (prisma) => {
        return await prisma.sede.findUnique({
          where: { id: sedeId as string }
        });
      });

      const validacion = {
        empleadoExiste: !!empleado,
        empleadoActivo: empleado?.estado === 'activo',
        sedeExiste: !!sede,
        sedeActiva: sede?.estado === 'activa',
        empleadoTieneAsignacionActiva: (empleado?.asignacion_empleado?.length || 0) > 0,
        puedeAsignar: false,
        conflictos: []
      };

      // Determinar si se puede asignar
      if (validacion.empleadoExiste && validacion.empleadoActivo && 
          validacion.sedeExiste && validacion.sedeActiva) {
        validacion.puedeAsignar = true;
      }

      // Identificar conflictos
      if (!validacion.empleadoExiste) {
        (validacion.conflictos as any[]).push({
          tipo: 'empleado_no_existe',
          mensaje: 'El empleado no existe'
        });
      }

      if (empleado && empleado.estado !== 'activo') {
        (validacion.conflictos as any[]).push({
          tipo: 'empleado_inactivo',
          mensaje: 'El empleado está inactivo'
        });
      }

      if (!validacion.sedeExiste) {
        (validacion.conflictos as any[]).push({
          tipo: 'sede_no_existe',
          mensaje: 'La sede no existe'
        });
      }

      if (sede && sede.estado !== 'activa') {
        (validacion.conflictos as any[]).push({
          tipo: 'sede_inactiva',
          mensaje: 'La sede está inactiva'
        });
      }

      if (validacion.empleadoTieneAsignacionActiva) {
        (validacion.conflictos as any[]).push({
          tipo: 'asignacion_existente',
          mensaje: 'El empleado ya tiene una asignación activa',
          asignacionActual: empleado?.asignacion_empleado?.[0]
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Validación de asignación completada',
        data: {
          ...validacion,
          empleado: empleado ? {
            id: empleado.id,
            nombre: empleado.nombre,
            cargo: empleado.cargo,
            estado: empleado.estado
          } : null,
          sede: sede ? {
            id: sede.id,
            nombre: sede.nombre,
            zona: sede.zona,
            estado: sede.estado
          } : null
        }
      });

    } catch (error) {
      logger.error('Error validando asignación', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };
}