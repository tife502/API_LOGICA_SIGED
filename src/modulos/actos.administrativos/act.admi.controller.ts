import { Request, Response } from 'express';
import PrismaConnection from '../../prisma/prisma.connection';
import { logger } from '../../config';
import { PrismaInterfaces } from '../../domain';

/**
 * Controlador para gestión de actos administrativos
 * - CREATE, READ, UPDATE: Todos los roles autenticados
 * - DELETE: Solo super_admin
 */
export class ActoAdministrativoController {
  private prisma: PrismaConnection;

  constructor() {
    this.prisma = PrismaConnection.getInstance();
  }

  /**
   * Crear nuevo acto administrativo
   * Acceso: Todos los roles autenticados
   * El nombre se genera automáticamente: "Resolución I.E [Nombre Institución]-[Consecutivo]"
   */
  createActoAdministrativo = async (req: Request, res: Response) => {
    try {
      const usuario = req.usuario;
      
      // Validar datos de entrada
      const { institucion_educativa_id, descripcion } = req.body;

      // Validación básica
      if (!institucion_educativa_id) {
        return res.status(400).json({
          success: false,
          message: 'El ID de la institución educativa es requerido',
          error: 'Validation Error'
        });
      }

      // Buscar la institución educativa
      const institucion = await this.prisma.institucion_educativa.findUnique({
        where: { id: institucion_educativa_id }
      });

      if (!institucion) {
        return res.status(404).json({
          success: false,
          message: 'Institución educativa no encontrada',
          error: 'Not Found'
        });
      }

      // Generar el patrón base del nombre
      const patronBase = `Resolución I.E ${institucion.nombre}-`;
      
      // Buscar el último consecutivo para esta institución
      const ultimoActo = await this.prisma.actos_administrativos.findFirst({
        where: {
          nombre: {
            startsWith: patronBase
          }
        },
        orderBy: {
          nombre: 'desc'
        }
      });

      // Calcular el siguiente consecutivo
      let siguienteConsecutivo = 1;
      
      if (ultimoActo) {
        // Extraer el número del final del nombre
        const match = ultimoActo.nombre.match(/-(\d+)$/);
        if (match) {
          siguienteConsecutivo = parseInt(match[1]) + 1;
        }
      }

      // Formatear el consecutivo con ceros a la izquierda (4 dígitos)
      const consecutivoFormateado = siguienteConsecutivo.toString().padStart(4, '0');
      
      // Generar el nombre completo
      const nombreCompleto = `${patronBase}${consecutivoFormateado}`;

      // Preparar datos para crear el acto
      const actoData: PrismaInterfaces.ICreateActoAdministrativo = {
        nombre: nombreCompleto,
        descripcion: descripcion?.trim()
      };

      // Crear el acto administrativo
      const nuevoActo = await this.prisma.actos_administrativos.create({
        data: actoData,
        include: {
          documentos_actos_administrativos: true
        }
      });

      logger.info(`Acto administrativo creado exitosamente`, {
        actoId: nuevoActo.id,
        nombre: nuevoActo.nombre,
        institucionId: institucion_educativa_id,
        institucionNombre: institucion.nombre,
        consecutivo: consecutivoFormateado,
        usuarioId: usuario?.id
      });

      return res.status(201).json({
        success: true,
        message: 'Acto administrativo creado exitosamente',
        data: {
          ...nuevoActo,
          institucion_educativa: {
            id: institucion.id,
            nombre: institucion.nombre
          },
          consecutivo: consecutivoFormateado,
          patron_generado: true
        }
      });

    } catch (error) {
      logger.error('Error al crear acto administrativo:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  /**
   * Obtener todos los actos administrativos con paginación
   * Acceso: Todos los roles autenticados
   */
  getActosAdministrativos = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const skip = (page - 1) * limit;

      // Construir filtros
      const where: any = {};
      
      if (search) {
        where.OR = [
          { nombre: { contains: search } },
          { descripcion: { contains: search } }
        ];
      }

      // Obtener actos con paginación
      const [actos, total] = await Promise.all([
        this.prisma.actos_administrativos.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            documentos_actos_administrativos: {
              select: {
                id: true,
                nombre: true,
                created_at: true
              }
            }
          }
        }),
        this.prisma.actos_administrativos.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        success: true,
        message: 'Actos administrativos obtenidos exitosamente',
        data: actos,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });

    } catch (error) {
      logger.error('Error al obtener actos administrativos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  /**
   * Obtener actos administrativos por institución educativa
   * Acceso: Todos los roles autenticados
   */
  getActosByInstitucion = async (req: Request, res: Response) => {
    try {
      const { institucion_id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Verificar que la institución existe
      const institucion = await this.prisma.institucion_educativa.findUnique({
        where: { id: institucion_id }
      });

      if (!institucion) {
        return res.status(404).json({
          success: false,
          message: 'Institución educativa no encontrada',
          error: 'Not Found'
        });
      }

      // Generar el patrón para buscar actos de esta institución
      const patronBusqueda = `Resolución I.E ${institucion.nombre}-`;

      // Obtener actos de esta institución
      const [actos, total] = await Promise.all([
        this.prisma.actos_administrativos.findMany({
          where: {
            nombre: {
              startsWith: patronBusqueda
            }
          },
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            documentos_actos_administrativos: {
              select: {
                id: true,
                nombre: true,
                created_at: true
              }
            }
          }
        }),
        this.prisma.actos_administrativos.count({
          where: {
            nombre: {
              startsWith: patronBusqueda
            }
          }
        })
      ]);

      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        success: true,
        message: 'Actos administrativos de la institución obtenidos exitosamente',
        data: actos,
        institucion: {
          id: institucion.id,
          nombre: institucion.nombre
        },
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });

    } catch (error) {
      logger.error('Error al obtener actos por institución:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  /**
   * Obtener un acto administrativo por ID
   * Acceso: Todos los roles autenticados
   */
  getActoAdministrativoById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Validar que el ID sea un número
      const actoId = parseInt(id);
      if (isNaN(actoId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de acto administrativo inválido',
          error: 'Validation Error'
        });
      }

      const acto = await this.prisma.actos_administrativos.findUnique({
        where: { id: actoId },
        include: {
          documentos_actos_administrativos: {
            orderBy: { created_at: 'desc' }
          }
        }
      });

      if (!acto) {
        return res.status(404).json({
          success: false,
          message: 'Acto administrativo no encontrado',
          error: 'Not Found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Acto administrativo obtenido exitosamente',
        data: acto
      });

    } catch (error) {
      logger.error('Error al obtener acto administrativo:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  /**
   * Actualizar un acto administrativo
   * Acceso: Todos los roles autenticados
   */
  updateActoAdministrativo = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuario = req.usuario;

      // Validar que el ID sea un número
      const actoId = parseInt(id);
      if (isNaN(actoId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de acto administrativo inválido',
          error: 'Validation Error'
        });
      }

      // Validar datos de entrada
      const updateData: PrismaInterfaces.IUpdateActoAdministrativo = {};
      
      // El nombre NO se puede actualizar porque es generado automáticamente
      if (req.body.nombre) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del acto administrativo no se puede modificar porque es generado automáticamente',
          error: 'Validation Error'
        });
      }
      
      if (req.body.descripcion !== undefined) {
        updateData.descripcion = req.body.descripcion?.trim() || null;
      }

      // Verificar que el acto existe
      const actoExistente = await this.prisma.actos_administrativos.findUnique({
        where: { id: actoId }
      });

      if (!actoExistente) {
        return res.status(404).json({
          success: false,
          message: 'Acto administrativo no encontrado',
          error: 'Not Found'
        });
      }

      // Verificar que hay datos para actualizar
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionaron datos para actualizar',
          error: 'Validation Error'
        });
      }

      // Actualizar el acto
      const actoActualizado = await this.prisma.actos_administrativos.update({
        where: { id: actoId },
        data: updateData,
        include: {
          documentos_actos_administrativos: true
        }
      });

      logger.info(`Acto administrativo actualizado exitosamente`, {
        actoId: actoActualizado.id,
        usuarioId: usuario?.id
      });

      return res.status(200).json({
        success: true,
        message: 'Acto administrativo actualizado exitosamente',
        data: actoActualizado
      });

    } catch (error) {
      logger.error('Error al actualizar acto administrativo:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  /**
   * Eliminar un acto administrativo
   * Acceso: Solo super_admin
   */
  deleteActoAdministrativo = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuario = req.usuario;

      // Verificar que el usuario sea super_admin
      if (usuario?.rol !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar actos administrativos',
          error: 'Forbidden'
        });
      }

      // Validar que el ID sea un número
      const actoId = parseInt(id);
      if (isNaN(actoId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de acto administrativo inválido',
          error: 'Validation Error'
        });
      }

      // Verificar que el acto existe
      const actoExistente = await this.prisma.actos_administrativos.findUnique({
        where: { id: actoId },
        include: {
          documentos_actos_administrativos: true
        }
      });

      if (!actoExistente) {
        return res.status(404).json({
          success: false,
          message: 'Acto administrativo no encontrado',
          error: 'Not Found'
        });
      }

      // Eliminar el acto (los documentos se eliminarán automáticamente por CASCADE)
      await this.prisma.actos_administrativos.delete({
        where: { id: actoId }
      });

      logger.warn(`Acto administrativo eliminado`, {
        actoId: actoId,
        nombre: actoExistente.nombre,
        documentosEliminados: actoExistente.documentos_actos_administrativos.length,
        usuarioId: usuario?.id
      });

      return res.status(200).json({
        success: true,
        message: 'Acto administrativo eliminado exitosamente',
        data: {
          id: actoId,
          nombre: actoExistente.nombre,
          documentosEliminados: actoExistente.documentos_actos_administrativos.length
        }
      });

    } catch (error) {
      logger.error('Error al eliminar acto administrativo:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };
}
