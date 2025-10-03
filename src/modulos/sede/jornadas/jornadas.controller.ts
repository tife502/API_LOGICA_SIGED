import { Request, Response } from 'express';
import PrismaService from '../../../prisma/prisma.service';
import { logger } from '../../../config';

/**
 * Controlador para gestión de jornadas y su relación con sedes
 * Las jornadas definen horarios de trabajo (mañana, tarde, etc.)
 */
export class JornadaController {
  private prismaService: PrismaService;

  constructor() {
    this.prismaService = PrismaService.getInstance();
  }

  /**
   * Obtener todas las jornadas
   * Permisos: super_admin, admin, gestor
   */
  getJornadas = async (req: Request, res: Response) => {
    try {
      const jornadas = await this.prismaService.getJornadas();

      res.status(200).json({
        success: true,
        message: 'Jornadas obtenidas exitosamente',
        data: jornadas
      });

    } catch (error) {
      logger.error('Error al obtener jornadas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Asignar jornada a sede
   * Permisos: super_admin, admin
   */
  asignarJornadaSede = async (req: Request, res: Response) => {
    try {
      const { sede_id } = req.params;
      const { jornada_id } = req.body;
      const usuario = req.usuario;

      if (!sede_id) {
        return res.status(400).json({
          success: false,
          message: 'ID de sede es requerido'
        });
      }

      if (!jornada_id) {
        return res.status(400).json({
          success: false,
          message: 'ID de jornada es requerido'
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

      const asignacion = await this.prismaService.asignarJornadaSede({
        sede_id,
        jornada_id: parseInt(jornada_id)
      });

      logger.info(`Jornada asignada a sede: ${jornada_id} -> ${sede_id} por usuario ${usuario?.id}`, {
        action: 'ASIGNAR_JORNADA_SEDE',
        userId: usuario?.id,
        sedeId: sede_id,
        jornadaId: jornada_id
      });

      res.status(201).json({
        success: true,
        message: 'Jornada asignada a sede exitosamente',
        data: asignacion
      });

    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Esta jornada ya está asignada a esta sede',
          error: 'Duplicate Entry'
        });
      }

      logger.error('Error al asignar jornada a sede:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener jornadas de una sede
   * Permisos: super_admin, admin, gestor
   */
  getJornadasBySede = async (req: Request, res: Response) => {
    try {
      const { sede_id } = req.params;

      if (!sede_id) {
        return res.status(400).json({
          success: false,
          message: 'ID de sede es requerido'
        });
      }

      const jornadas = await this.prismaService.getJornadasBySede(sede_id);

      res.status(200).json({
        success: true,
        message: 'Jornadas de sede obtenidas exitosamente',
        data: jornadas
      });

    } catch (error) {
      logger.error('Error al obtener jornadas de sede:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Desasignar jornada de sede
   * Permisos: super_admin, admin
   */
  desasignarJornadaSede = async (req: Request, res: Response) => {
    try {
      const { sede_id, jornada_id } = req.params;
      const usuario = req.usuario;

      if (!sede_id || !jornada_id) {
        return res.status(400).json({
          success: false,
          message: 'ID de sede y jornada son requeridos'
        });
      }

      await this.prismaService.desasignarJornadaSede(sede_id, parseInt(jornada_id));

      logger.info(`Jornada desasignada de sede: ${jornada_id} <- ${sede_id} por usuario ${usuario?.id}`, {
        action: 'DESASIGNAR_JORNADA_SEDE',
        userId: usuario?.id,
        sedeId: sede_id,
        jornadaId: jornada_id
      });

      res.status(200).json({
        success: true,
        message: 'Jornada desasignada de sede exitosamente'
      });

    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Asignación no encontrada'
        });
      }

      logger.error('Error al desasignar jornada de sede:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
}