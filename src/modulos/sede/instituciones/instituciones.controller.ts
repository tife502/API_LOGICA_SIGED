import { Request, Response } from 'express';
import PrismaService from '../../../prisma/prisma.service';
import { logger } from '../../../config';
import { PrismaInterfaces } from '../../../domain';

/**
 * Controlador para gestión de instituciones educativas
 * Maneja las instituciones educativas y su relación con sedes
 */
export class InstitucionEducativaController {
  private prismaService: PrismaService;

  constructor() {
    this.prismaService = PrismaService.getInstance();
  }

  /**
   * Crear institución educativa
   * Permisos: super_admin, admin
   */
  createInstitucion = async (req: Request, res: Response) => {
    try {
      const usuario = req.usuario;
      
      const institucionData: PrismaInterfaces.ICreateInstitucionEducativa = {
        nombre: req.body.nombre?.trim(),
        rector_encargado_id: req.body.rector_encargado_id || undefined
      };

      // Validación básica
      if (!institucionData.nombre) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de la institución es requerido',
          error: 'Validation Error'
        });
      }

      // Verificar que el rector existe (si se proporciona)
      if (institucionData.rector_encargado_id) {
        const rector = await this.prismaService.getEmpleadoById(institucionData.rector_encargado_id);
        if (!rector) {
          return res.status(404).json({
            success: false,
            message: 'Rector encargado no encontrado'
          });
        }

        // Verificar que el empleado tenga cargo de Rector
        if (rector.cargo !== 'Rector') {
          return res.status(400).json({
            success: false,
            message: 'El empleado seleccionado debe tener cargo de Rector'
          });
        }
      }

      const institucion = await this.prismaService.createInstitucionEducativa(institucionData);

      res.status(201).json({
        success: true,
        message: 'Institución educativa creada exitosamente',
        data: institucion
      });

    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una institución educativa con este nombre',
          error: 'Duplicate Entry'
        });
      }

      logger.error('Error al crear institución educativa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener todas las instituciones educativas
   * Permisos: super_admin, admin, gestor
   */
  getInstituciones = async (req: Request, res: Response) => {
    try {
      const { 
        nombre, 
        rector_encargado_id,
        page = '1', 
        limit = '10' 
      } = req.query as any;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

      const filters: PrismaInterfaces.IInstitucionEducativaFilters = {};
      if (nombre) filters.nombre = nombre;
      if (rector_encargado_id) filters.rector_encargado_id = rector_encargado_id;

      const pagination: PrismaInterfaces.IPaginationOptions = {
        page: pageNum,
        limit: limitNum,
        orderBy: 'created_at',
        orderDirection: 'desc'
      };

      const result = await this.prismaService.getInstitucionesEducativas(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Instituciones educativas obtenidas exitosamente',
        data: result.data,
        pagination: result.pagination
      });

    } catch (error) {
      logger.error('Error al obtener instituciones educativas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener institución educativa por ID
   * Permisos: super_admin, admin, gestor
   */
  getInstitucionById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de institución requerido'
        });
      }

      const institucion = await this.prismaService.getInstitucionEducativaById(id);

      if (!institucion) {
        return res.status(404).json({
          success: false,
          message: 'Institución educativa no encontrada'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Institución educativa obtenida exitosamente',
        data: institucion
      });

    } catch (error) {
      logger.error('Error al obtener institución educativa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Actualizar institución educativa
   * Permisos: super_admin, admin
   */
  updateInstitucion = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuario = req.usuario;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de institución requerido'
        });
      }

      const updateData: PrismaInterfaces.IUpdateInstitucionEducativa = {};
      if (req.body.nombre !== undefined) updateData.nombre = req.body.nombre?.trim();
      if (req.body.rector_encargado_id !== undefined) updateData.rector_encargado_id = req.body.rector_encargado_id || undefined;

      // Validar nombre
      if (updateData.nombre !== undefined && !updateData.nombre) {
        return res.status(400).json({
          success: false,
          message: 'El nombre no puede estar vacío'
        });
      }

      // Verificar que el rector existe (si se proporciona)
      if (updateData.rector_encargado_id) {
        const rector = await this.prismaService.getEmpleadoById(updateData.rector_encargado_id);
        if (!rector) {
          return res.status(404).json({
            success: false,
            message: 'Rector encargado no encontrado'
          });
        }

        if (rector.cargo !== 'Rector') {
          return res.status(400).json({
            success: false,
            message: 'El empleado seleccionado debe tener cargo de Rector'
          });
        }
      }

      const updatedInstitucion = await this.prismaService.updateInstitucionEducativa(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Institución educativa actualizada exitosamente',
        data: updatedInstitucion
      });

    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe otra institución educativa con este nombre',
          error: 'Duplicate Entry'
        });
      }

      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Institución educativa no encontrada'
        });
      }

      logger.error('Error al actualizar institución educativa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Eliminar institución educativa
   * Permisos: super_admin
   */
  deleteInstitucion = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuario = req.usuario;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de institución requerido'
        });
      }

      await this.prismaService.deleteInstitucionEducativa(id);

      res.status(200).json({
        success: true,
        message: 'Institución educativa eliminada exitosamente'
      });

    } catch (error: any) {
      if (error.message?.includes('sedes asociadas')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Institución educativa no encontrada'
        });
      }

      logger.error('Error al eliminar institución educativa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Asignar sede a institución educativa
   * Permisos: super_admin, admin
   */
  asignarSede = async (req: Request, res: Response) => {
    try {
      const { id } = req.params; // ID de la institución
      const { sede_id } = req.body;
      const usuario = req.usuario;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de institución requerido'
        });
      }

      if (!sede_id) {
        return res.status(400).json({
          success: false,
          message: 'ID de sede requerido'
        });
      }

      // Verificar que la institución existe
      const institucion = await this.prismaService.getInstitucionEducativaById(id);
      if (!institucion) {
        return res.status(404).json({
          success: false,
          message: 'Institución educativa no encontrada'
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

      const asignacion = await this.prismaService.asignarSedeInstitucionEducativa({
        sede_id,
        institucion_educativa_id: id
      });
      
      res.status(201).json({
        success: true,
        message: 'Sede asignada a institución educativa exitosamente',
        data: asignacion
      });

    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Esta sede ya está asignada a esta institución educativa',
          error: 'Duplicate Entry'
        });
      }

      logger.error('Error al asignar sede a institución:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
}