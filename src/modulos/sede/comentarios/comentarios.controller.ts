import { Request, Response } from 'express';
import PrismaService from '../../../prisma/prisma.service';
import { logger } from '../../../config';
import { PrismaInterfaces } from '../../../domain';

/**
 * Controlador para gestión de comentarios de sedes
 * Permite agregar observaciones y seguimiento a las sedes
 */
export class ComentarioSedeController {
  private prismaService: PrismaService;

  constructor() {
    this.prismaService = PrismaService.getInstance();
  }

  /**
   * Crear comentario en sede
   * Permisos: super_admin, admin, gestor
   */
  createComentario = async (req: Request, res: Response) => {
    try {
      const usuario = req.usuario;
      const { sede_id } = req.params;
      
      const comentarioData: PrismaInterfaces.ICreateComentarioSede = {
        observacion: req.body.observacion?.trim(),
        sede_id,
        usuario_id: usuario?.id || ''
      };

      // Validación básica
      if (!comentarioData.observacion) {
        return res.status(400).json({
          success: false,
          message: 'La observación es requerida',
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

      // Verificar que la sede existe
      const sede = await this.prismaService.getSedeById(sede_id);
      if (!sede) {
        return res.status(404).json({
          success: false,
          message: 'Sede no encontrada'
        });
      }

      const comentario = await this.prismaService.createComentarioSede(comentarioData);

      res.status(201).json({
        success: true,
        message: 'Comentario creado exitosamente',
        data: comentario
      });

    } catch (error: any) {
      logger.error('Error al crear comentario de sede:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener comentarios de una sede
   * Permisos: super_admin, admin, gestor
   */
  getComentariosBySede = async (req: Request, res: Response) => {
    try {
      const { sede_id } = req.params;
      const { page = '1', limit = '10' } = req.query as any;

      if (!sede_id) {
        return res.status(400).json({
          success: false,
          message: 'ID de sede es requerido'
        });
      }

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

      const filters: PrismaInterfaces.IComentarioSedeFilters = {
        sede_id
      };

      const pagination: PrismaInterfaces.IPaginationOptions = {
        page: pageNum,
        limit: limitNum,
        orderBy: 'created_at',
        orderDirection: 'desc'
      };

      const result = await this.prismaService.getComentariosSede(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Comentarios obtenidos exitosamente',
        data: result.data,
        pagination: result.pagination
      });

    } catch (error) {
      logger.error('Error al obtener comentarios de sede:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Actualizar comentario de sede
   * Permisos: super_admin, admin (solo el autor puede editar)
   */
  updateComentario = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuario = req.usuario;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de comentario requerido'
        });
      }

      const updateData: PrismaInterfaces.IUpdateComentarioSede = {};
      if (req.body.observacion !== undefined) {
        updateData.observacion = req.body.observacion?.trim();
      }

      if (updateData.observacion !== undefined && !updateData.observacion) {
        return res.status(400).json({
          success: false,
          message: 'La observación no puede estar vacía'
        });
      }

      const updatedComentario = await this.prismaService.updateComentarioSede(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Comentario actualizado exitosamente',
        data: updatedComentario
      });

    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Comentario no encontrado'
        });
      }

      logger.error('Error al actualizar comentario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Eliminar comentario de sede
   * Permisos: super_admin (solo super_admin puede eliminar)
   */
  deleteComentario = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuario = req.usuario;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de comentario requerido'
        });
      }

      await this.prismaService.deleteComentarioSede(id);

      res.status(200).json({
        success: true,
        message: 'Comentario eliminado exitosamente'
      });

    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Comentario no encontrado'
        });
      }

      logger.error('Error al eliminar comentario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
}