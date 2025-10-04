import { Request, Response } from 'express';
import PrismaService from '../../prisma/prisma.service';
import { logger } from '../../config';
import { PrismaInterfaces, Utils } from '../../domain';
import { v4 as uuidv4 } from 'uuid';
import { ComentarioSedeController } from './comentarios/comentarios.controller';



  /**
   * Controlador para gestión de sedes educativas
   * Administración de ubicaciones físicas donde se imparten clases
   */
export class SedeController {
  private prismaService: PrismaService;

  constructor() {
    this.prismaService = PrismaService.getInstance();
  }


  /**
   * Crear nueva sede
   * Permisos: super_admin, admin
   */
  createSede = async (req: Request, res: Response) => {
    try {
      const usuario = req.usuario; // Usuario que está creando
      
      // Validar datos de entrada usando la interface
      const sedeData: PrismaInterfaces.ICreateSede= {
        nombre: req.body.nombre?.trim(),
        estado: req.body.estado || PrismaInterfaces.SedeEstado.activa,
        zona: req.body.zona as PrismaInterfaces.SedeZona,
        direccion: req.body.direccion?.trim(),
        codigo_DANE: req.body.codigo_DANE?.trim() || null
      };

      const comentarioData: PrismaInterfaces.ICreateComentarioSede = {
        observacion: req.body.comentario?.trim(),
        sede_id: '', // Se asignará después de crear la sede
        usuario_id: usuario?.id || ''
      };

      // Validación básica
      if (!sedeData.nombre) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de la sede es requerido',
          error: 'Validation Error'
        });
      }

      if (!sedeData.zona) {
        return res.status(400).json({
          success: false,
          message: 'La zona es requerida',
          error: 'Validation Error'
        });
      }

      if (!sedeData.direccion) {
        return res.status(400).json({
          success: false,
          message: 'La dirección es requerida',
          error: 'Validation Error'
        });
      }

      // Crear sede usando el método del servicio
      const sede = await this.prismaService.createSede(sedeData);

      const comentarioSede = await this.prismaService.createComentarioSede({
        ...comentarioData,
        sede_id: sede.id
      });

      logger.info(`Sede creada: ${sede.id} por usuario ${usuario?.id}, 
        y con el comentario: ${comentarioSede.id} con el contenido: ${comentarioSede.observacion}`, {
        action: 'CREATE_SEDE',
        userId: usuario?.id,
        sedeId: sede.id,
        sede: sede,
        comentarioSede: comentarioSede
      });

      res.status(201).json({
        success: true,
        message: 'Sede creada exitosamente',
        data: sede, 
        comentarioSede: comentarioSede
      });

    } catch (error: any) {
      if (error.code === 'P2002') {
        // Violación de constraint único
        return res.status(409).json({
          success: false,
          message: 'Ya existe una sede con este nombre o código DANE',
          error: 'Duplicate Entry'
        });
      }

      logger.error('Error al crear sede:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener todas las sedes con filtros
   * Permisos: super_admin, admin, gestor
   */
  getSedes = async (req: Request, res: Response) => {
    try {
      const { 
        nombre, 
        estado, 
        zona, 
        codigo_DANE,
        page = '1',
        limit = '10'
      } = req.query as any;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

      // Construir filtros
      const filters: PrismaInterfaces.ISedeFilters = {};

      if (nombre) filters.nombre = nombre;
      if (estado) filters.estado = estado as PrismaInterfaces.SedeEstado;
      if (zona) filters.zona = zona as PrismaInterfaces.SedeZona;
      if (codigo_DANE) filters.codigo_DANE = codigo_DANE;

      // Configurar paginación
      const pagination: PrismaInterfaces.IPaginationOptions = {
        page: pageNum,
        limit: limitNum,
        orderBy: 'created_at',
        orderDirection: 'desc'
      };

      const result = await this.prismaService.getSedes(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Sedes obtenidas exitosamente',
        data: result.data,
        pagination: result.pagination
      });

    } catch (error) {
      logger.error('Error al obtener sedes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener sede por ID
   * Permisos: super_admin, admin, gestor
   */
  getSedeById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de sede requerido'
        });
      }

      const sede = await this.prismaService.getSedeById(id);

      if (!sede) {
        return res.status(404).json({
          success: false,
          message: 'Sede no encontrada'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Sede obtenida exitosamente',
        data: sede
      });

    } catch (error) {
      logger.error('Error al obtener sede:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Actualizar sede
   * Permisos: super_admin, admin
   */
  updateSede = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuario = req.usuario;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de sede requerido'
        });
      }

      // Preparar datos para actualización
      const updateData: PrismaInterfaces.IUpdateSede = {};
      
      if (req.body.nombre !== undefined) updateData.nombre = req.body.nombre?.trim();
      if (req.body.estado !== undefined) updateData.estado = req.body.estado;
      if (req.body.zona !== undefined) updateData.zona = req.body.zona;
      if (req.body.direccion !== undefined) updateData.direccion = req.body.direccion?.trim();
      if (req.body.codigo_DANE !== undefined) updateData.codigo_DANE = req.body.codigo_DANE?.trim() || null;

      // Validar que no estén vacíos los campos requeridos
      if (updateData.nombre !== undefined && !updateData.nombre) {
        return res.status(400).json({
          success: false,
          message: 'El nombre no puede estar vacío'
        });
      }

      if (updateData.direccion !== undefined && !updateData.direccion) {
        return res.status(400).json({
          success: false,
          message: 'La dirección no puede estar vacía'
        });
      }

      const updatedSede = await this.prismaService.updateSede(id, updateData);

      logger.info(`Sede actualizada: ${id} por usuario ${usuario?.id}`, {
        action: 'UPDATE_SEDE',
        userId: usuario?.id,
        sedeId: id,
        changes: updateData
      });

      res.status(200).json({
        success: true,
        message: 'Sede actualizada exitosamente',
        data: updatedSede
      });

    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe otra sede con este nombre o código DANE',
          error: 'Duplicate Entry'
        });
      }

      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Sede no encontrada'
        });
      }

      logger.error('Error al actualizar sede:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Eliminar sede (borrado físico)
   * Permisos: super_admin
   */
  deleteSede = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuario = req.usuario;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de sede requerido'
        });
      }

      await this.prismaService.deleteSede(id);

      logger.info(`Sede eliminada: ${id} por usuario ${usuario?.id}`, {
        action: 'DELETE_SEDE',
        userId: usuario?.id,
        sedeId: id
      });

      res.status(200).json({
        success: true,
        message: 'Sede eliminada exitosamente'
      });

    } catch (error: any) {
      if (error.message?.includes('empleados asignados activos')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Sede no encontrada'
        });
      }

      logger.error('Error al eliminar sede:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
}