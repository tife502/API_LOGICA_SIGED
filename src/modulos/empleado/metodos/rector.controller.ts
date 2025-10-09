import { Request, Response } from 'express';
import { logger } from '../../../config';
import { RectorService } from './rector.service';
import { PrismaInterfaces } from '../../../domain';

// Extender Request para incluir el body tipado
interface CreateRectorCompletoRequest extends Request {
  body: PrismaInterfaces.ICreateRectorCompletoRequest;
}

/**
 * Controlador especializado para gestión de rectores
 * Maneja endpoints específicos para flujos de rectores e instituciones
 */
export class RectorController {
  private rectorService: RectorService;

  constructor() {
    this.rectorService = new RectorService();
  }

    /**
     * GET /api/v1/empleados/rector
     * Listar todos los rectores (acceso para todos los roles)
     */
    public listarRectores = async (req: Request, res: Response): Promise<Response> => {
      try {
        // Obtener todos los empleados con cargo 'Rector'
        const rectores = await this.rectorService['prismaService'].executeTransaction(async (prisma) => {
          return await prisma.empleado.findMany({
            where: { cargo: 'Rector' },
            orderBy: { nombre: 'asc' }
          });
        });

        return res.status(200).json({
          success: true,
          message: 'Rectores listados exitosamente',
          data: rectores,
          total: rectores.length
        });
      } catch (error) {
        logger.error('Error listando rectores', error);
        return res.status(500).json({
          success: false,
          message: 'Error interno del servidor',
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    };

  /**
   * POST /api/empleados/rector/crear-completo
   * Crear rector con institución y sedes en un solo flujo
   */
  public crearRectorCompleto = async (
    req: CreateRectorCompletoRequest, 
    res: Response<{
      success: boolean;
      message: string;
      data: PrismaInterfaces.ICreateRectorCompletoResponse | null;
      error?: string;
    }>
  ): Promise<Response> => {
    try {
      // Ahora el body está completamente tipado
      const { empleado, informacionAcademica, institucion, sedes, fechaAsignacion, observaciones } = req.body;

      // Validaciones básicas con tipado
      if (!empleado || !empleado.nombre || !empleado.documento || !empleado.email) {
        return res.status(400).json({
          success: false,
          message: 'Datos del empleado incompletos: nombre, documento y email son requeridos',
          data: null
        });
      }

      if (!institucion || !institucion.nombre) {
        return res.status(400).json({
          success: false,
          message: 'Datos de institución incompletos: nombre es requerido',
          data: null
        });
      }

      if (!sedes || (!sedes.crear?.length && !sedes.asignar_existentes?.length)) {
        return res.status(400).json({
          success: false,
          message: 'Debe especificar al menos una sede a crear o una sede existente a asignar',
          data: null
        });
      }

      // Validar cargo es rector
      if (empleado.cargo !== 'Rector') {
        return res.status(400).json({
          success: false,
          message: 'El cargo del empleado debe ser "Rector"',
          data: null
        });
      }

      // Validar sedes a crear
      if (sedes.crear) {
        for (const sede of sedes.crear) {
          if (!sede.nombre) {
            return res.status(400).json({
              success: false,
              message: 'Todas las sedes deben tener nombre',
              data: null
            });
          }
        }
      }


      const resultado = await this.rectorService.crearRectorCompleto({
        empleado,
        informacionAcademica,
        institucion,
        sedes,
      });

      return res.status(201).json({
        success: true,
        message: 'Rector creado exitosamente con institución y sedes',
        data: resultado
      });

    } catch (error) {
      logger.error('Error creando rector completo', error);
      
      if (error instanceof Error) {
        // Manejar errores específicos
        if (error.message.includes('unique constraint')) {
          return res.status(409).json({
            success: false,
            message: 'Ya existe un empleado con este documento o email',
            data: null,
            error: 'Conflict'
          });
        }
      }

      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * POST /api/v1/empleados/rector/:rectorId/asignar-institucion
   * Asignar rector existente a institución
   */
  public asignarRectorAInstitucion = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { rectorId } = req.params;
      const { institucionId, asignarTodasLasSedes, sedesEspecificas } = req.body;

      if (!institucionId) {
        return res.status(400).json({
          success: false,
          message: 'ID de institución es requerido',
          data: null
        });
      }

      const resultado = await this.rectorService.asignarRectorAInstitucion({
        rectorId,
        institucionId,
        asignarTodasLasSedes,
        sedesEspecificas
      });

      return res.status(200).json({
        success: true,
        message: 'Rector asignado exitosamente a institución',
        data: resultado
      });

    } catch (error) {
      logger.error('Error asignando rector a institución', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * GET /api/v1/empleados/rector/instituciones-disponibles
   * Obtener instituciones disponibles para asignar
   */
  public getInstitucionesDisponibles = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { sin_rector, con_sedes } = req.query;

      const filters = {
        sinRector: sin_rector === 'true',
        conSedes: con_sedes === 'true'
      };

      const instituciones = await this.rectorService.getInstitucionesDisponibles(filters);

      return res.status(200).json({
        success: true,
        message: 'Instituciones disponibles obtenidas exitosamente',
        data: instituciones,
        metadata: {
          total: instituciones.length,
          filters
        }
      });

    } catch (error) {
      logger.error('Error obteniendo instituciones disponibles', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * GET /api/v1/empleados/rector/:rectorId/resumen
   * Obtener resumen completo de un rector
   */
  public getResumenRector = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { rectorId } = req.params;
      const resumen = await this.rectorService.getResumenRector(rectorId);

      return res.status(200).json({
        success: true,
        message: 'Resumen de rector obtenido exitosamente',
        data: resumen
      });

    } catch (error) {
      logger.error('Error obteniendo resumen de rector', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * GET /api/v1/empleados/rector/validar-flujo
   * Validar si se puede crear un flujo de rector
   */
  public validarFlujoRector = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { documento, email } = req.query;

      if (!documento) {
        return res.status(400).json({
          success: false,
          message: 'Documento es requerido para validación',
          data: null
        });
      }

      // Verificar si ya existe empleado con documento
      const empleadoExistente = await this.rectorService['prismaService'].executeTransaction(async (prisma) => {
        return await prisma.empleado.findFirst({
          where: { documento: documento as string }
        });
      });

      let emailExistente = null;
      if (email) {
        emailExistente = await this.rectorService['prismaService'].executeTransaction(async (prisma) => {
          return await prisma.empleado.findFirst({
            where: { email: email as string }
          });
        });
      }

      const validacion = {
        documentoDisponible: !empleadoExistente,
        emailDisponible: email ? !emailExistente : null,
        puedeCrearFlujo: !empleadoExistente && (!email || !emailExistente),
        conflictos: []
      };

      if (empleadoExistente) {
        (validacion.conflictos as any[]).push({
          tipo: 'documento',
          mensaje: 'Ya existe un empleado con este documento',
          empleado: {
            id: empleadoExistente.id,
            nombre: empleadoExistente.nombre,
            cargo: empleadoExistente.cargo
          }
        });
      }

      if (emailExistente) {
        (validacion.conflictos as any[]).push({
          tipo: 'email',
          mensaje: 'Ya existe un empleado con este email',
          empleado: {
            id: emailExistente.id,
            nombre: emailExistente.nombre,
            cargo: emailExistente.cargo
          }
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Validación de flujo completada',
        data: validacion
      });

    } catch (error) {
      logger.error('Error validando flujo de rector', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  /**
   * PUT /api/v1/empleados/rector/:rectorId/transferir-institucion
   * Transferir rector de una institución a otra
   */
  public transferirRectorInstitucion = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { rectorId } = req.params;
      const { nuevaInstitucionId, mantenerSedesOriginales } = req.body;

      if (!nuevaInstitucionId) {
        return res.status(400).json({
          success: false,
          message: 'Nueva institución ID es requerida',
          data: null
        });
      }

      const resultado = await this.rectorService['prismaService'].executeTransaction(async (prisma) => {
        // Obtener institución actual del rector
        const institucionActual = await prisma.institucion_educativa.findFirst({
          where: { rector_encargado_id: rectorId }
        });

        if (!institucionActual) {
          throw new Error('Rector no tiene institución actual asignada');
        }

        // Verificar nueva institución
        const nuevaInstitucion = await prisma.institucion_educativa.findUnique({
          where: { id: nuevaInstitucionId }
        });

        if (!nuevaInstitucion) {
          throw new Error('Nueva institución no encontrada');
        }

        // Desasignar de institución actual
        await prisma.institucion_educativa.update({
          where: { id: institucionActual.id },
          data: {
            rector_encargado_id: null,
            updated_at: new Date()
          }
        });

        // Si no mantener sedes originales, desasignar de todas las sedes actuales
        if (!mantenerSedesOriginales) {
          await prisma.asignacion_empleado.updateMany({
            where: {
              empleado_id: rectorId,
              estado: 'activa'
            },
            data: {
              estado: 'finalizada',
              fecha_fin: new Date()
            }
          });
        }

        // Asignar a nueva institución
        await prisma.institucion_educativa.update({
          where: { id: nuevaInstitucionId },
          data: {
            rector_encargado_id: rectorId,
            updated_at: new Date()
          }
        });

        return {
          institucionAnterior: institucionActual,
          nuevaInstitucion,
          sedesMantenidas: mantenerSedesOriginales
        };
      });

      return res.status(200).json({
        success: true,
        message: 'Rector transferido exitosamente',
        data: resultado
      });

    } catch (error) {
      logger.error('Error transfiriendo rector', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };
}