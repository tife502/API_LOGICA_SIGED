import { Request, Response } from 'express';
import PrismaConnection from '../../prisma/prisma.connection';
import { logger } from '../../config';
import { PrismaInterfaces } from '../../domain';

/**
 * Controlador para gestión de horas extra
 * - CREATE, READ, UPDATE: Todos los roles autenticados
 * - DELETE: Solo super_admin
 */
export class HorasExtraController {
  private prisma: PrismaConnection;

  constructor() {
    this.prisma = PrismaConnection.getInstance();
  }

  /**
   * Crear nuevo registro de horas extra
   * Acceso: Todos los roles autenticados
   */
  createHorasExtra = async (req: Request, res: Response) => {
    try {
      const usuario = req.usuario;
      
      // Validar datos de entrada
      const horasExtraData: PrismaInterfaces.ICreateHorasExtra = {
        empleado_id: req.body.empleado_id,
        sede_id: req.body.sede_id,
        cantidad_horas: parseFloat(req.body.cantidad_horas),
        fecha_realizacion: new Date(req.body.fecha_realizacion),
        jornada: req.body.jornada,
        observacion: req.body.observacion?.trim()
      };

      // Validación básica
      if (!horasExtraData.empleado_id || !horasExtraData.sede_id || !horasExtraData.cantidad_horas || !horasExtraData.fecha_realizacion || !horasExtraData.jornada) {
        return res.status(400).json({
          success: false,
          message: 'Faltan datos requeridos: empleado_id, sede_id, cantidad_horas, fecha_realizacion, jornada',
          error: 'Validation Error'
        });
      }

      // Validar que la cantidad de horas sea positiva
      if (horasExtraData.cantidad_horas <= 0) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad de horas debe ser mayor a 0',
          error: 'Validation Error'
        });
      }

      // Verificar que el empleado existe
      const empleadoExistente = await this.prisma.empleado.findUnique({
        where: { id: horasExtraData.empleado_id }
      });

      if (!empleadoExistente) {
        return res.status(404).json({
          success: false,
          message: 'Empleado no encontrado',
          error: 'Not Found'
        });
      }

      // Verificar que la sede existe
      const sedeExistente = await this.prisma.sede.findUnique({
        where: { id: horasExtraData.sede_id }
      });

      if (!sedeExistente) {
        return res.status(404).json({
          success: false,
          message: 'Sede no encontrada',
          error: 'Not Found'
        });
      }

      // Crear el registro de horas extra
      const nuevasHorasExtra = await this.prisma.horas_extra.create({
        data: horasExtraData as any,
        include: {
          empleado: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              documento: true
            }
          },
          sede: {
            select: {
              id: true,
              nombre: true
            }
          },
          documentos_horas_extra: true
        }
      });

      logger.info(`Registro de horas extra creado exitosamente`, {
        horasExtraId: nuevasHorasExtra.id,
        empleadoId: horasExtraData.empleado_id,
        sedeId: horasExtraData.sede_id,
        cantidadHoras: horasExtraData.cantidad_horas,
        usuarioId: usuario?.id
      });

      return res.status(201).json({
        success: true,
        message: 'Registro de horas extra creado exitosamente',
        data: nuevasHorasExtra
      });

    } catch (error) {
      logger.error('Error al crear registro de horas extra:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  /**
   * Obtener todos los registros de horas extra con paginación
   * Acceso: Todos los roles autenticados
   */
  getHorasExtra = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const empleado_id = req.query.empleado_id as string;
      const sede_id = req.query.sede_id as string;
      const jornada = req.query.jornada as string;
      const fecha_desde = req.query.fecha_desde as string;
      const fecha_hasta = req.query.fecha_hasta as string;
      const skip = (page - 1) * limit;

      // Construir filtros
      const where: any = {};
      
      if (empleado_id) {
        where.empleado_id = empleado_id;
      }

      if (sede_id) {
        where.sede_id = sede_id;
      }

      if (jornada) {
        where.jornada = jornada;
      }

      if (fecha_desde || fecha_hasta) {
        where.fecha_realizacion = {};
        if (fecha_desde) {
          where.fecha_realizacion.gte = new Date(fecha_desde);
        }
        if (fecha_hasta) {
          where.fecha_realizacion.lte = new Date(fecha_hasta);
        }
      }

      // Obtener registros con paginación
      const [horasExtra, total] = await Promise.all([
        this.prisma.horas_extra.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            empleado: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                documento: true
              }
            },
            sede: {
              select: {
                id: true,
                nombre: true
              }
            },
            documentos_horas_extra: {
              select: {
                id: true,
                nombre: true,
                created_at: true
              }
            }
          }
        }),
        this.prisma.horas_extra.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        success: true,
        message: 'Registros de horas extra obtenidos exitosamente',
        data: horasExtra,
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
      logger.error('Error al obtener registros de horas extra:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  /**
   * Obtener un registro de horas extra por ID
   * Acceso: Todos los roles autenticados
   */
  getHorasExtraById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const horasExtra = await this.prisma.horas_extra.findUnique({
        where: { id: id },
        include: {
          empleado: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              documento: true,
              email: true
            }
          },
          sede: {
            select: {
              id: true,
              nombre: true,
              direccion: true
            }
          },
          documentos_horas_extra: {
            orderBy: { created_at: 'desc' }
          }
        }
      });

      if (!horasExtra) {
        return res.status(404).json({
          success: false,
          message: 'Registro de horas extra no encontrado',
          error: 'Not Found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Registro de horas extra obtenido exitosamente',
        data: horasExtra
      });

    } catch (error) {
      logger.error('Error al obtener registro de horas extra:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  /**
   * Actualizar un registro de horas extra
   * Acceso: Todos los roles autenticados
   */
  updateHorasExtra = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuario = req.usuario;

      // Verificar que el registro existe
      const horasExtraExistente = await this.prisma.horas_extra.findUnique({
        where: { id: id }
      });

      if (!horasExtraExistente) {
        return res.status(404).json({
          success: false,
          message: 'Registro de horas extra no encontrado',
          error: 'Not Found'
        });
      }

      // Validar datos de entrada
      const updateData: PrismaInterfaces.IUpdateHorasExtra = {};
      
      if (req.body.empleado_id) {
        updateData.empleado_id = req.body.empleado_id;
        
        // Verificar que el empleado existe
        const empleadoExistente = await this.prisma.empleado.findUnique({
          where: { id: req.body.empleado_id }
        });

        if (!empleadoExistente) {
          return res.status(404).json({
            success: false,
            message: 'Empleado no encontrado',
            error: 'Not Found'
          });
        }
      }

      if (req.body.sede_id) {
        updateData.sede_id = req.body.sede_id;
        
        // Verificar que la sede existe
        const sedeExistente = await this.prisma.sede.findUnique({
          where: { id: req.body.sede_id }
        });

        if (!sedeExistente) {
          return res.status(404).json({
            success: false,
            message: 'Sede no encontrada',
            error: 'Not Found'
          });
        }
      }

      if (req.body.cantidad_horas !== undefined) {
        const cantidadHoras = parseFloat(req.body.cantidad_horas);
        if (cantidadHoras <= 0) {
          return res.status(400).json({
            success: false,
            message: 'La cantidad de horas debe ser mayor a 0',
            error: 'Validation Error'
          });
        }
        updateData.cantidad_horas = cantidadHoras;
      }

      if (req.body.fecha_realizacion) {
        updateData.fecha_realizacion = new Date(req.body.fecha_realizacion);
      }

      if (req.body.jornada) {
        updateData.jornada = req.body.jornada;
      }

      if (req.body.observacion !== undefined) {
        updateData.observacion = req.body.observacion?.trim() || null;
      }

      // Verificar que hay datos para actualizar
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionaron datos para actualizar',
          error: 'Validation Error'
        });
      }

      // Actualizar el registro
      const horasExtraActualizado = await this.prisma.horas_extra.update({
        where: { id: id },
        data: updateData as any,
        include: {
          empleado: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              documento: true
            }
          },
          sede: {
            select: {
              id: true,
              nombre: true
            }
          },
          documentos_horas_extra: true
        }
      });

      logger.info(`Registro de horas extra actualizado exitosamente`, {
        horasExtraId: id,
        usuarioId: usuario?.id
      });

      return res.status(200).json({
        success: true,
        message: 'Registro de horas extra actualizado exitosamente',
        data: horasExtraActualizado
      });

    } catch (error) {
      logger.error('Error al actualizar registro de horas extra:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  /**
   * Eliminar un registro de horas extra
   * Acceso: Solo super_admin
   */
  deleteHorasExtra = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuario = req.usuario;

      // Verificar que el usuario sea super_admin
      if (usuario?.rol !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar registros de horas extra',
          error: 'Forbidden'
        });
      }

      // Verificar que el registro existe
      const horasExtraExistente = await this.prisma.horas_extra.findUnique({
        where: { id: id },
        include: {
          empleado: {
            select: {
              nombre: true,
              apellido: true
            }
          },
          sede: {
            select: {
              nombre: true
            }
          },
          documentos_horas_extra: true
        }
      });

      if (!horasExtraExistente) {
        return res.status(404).json({
          success: false,
          message: 'Registro de horas extra no encontrado',
          error: 'Not Found'
        });
      }

      // Eliminar el registro (los documentos se eliminarán automáticamente por CASCADE)
      await this.prisma.horas_extra.delete({
        where: { id: id }
      });

      logger.warn(`Registro de horas extra eliminado`, {
        horasExtraId: id,
        empleado: `${horasExtraExistente.empleado.nombre} ${horasExtraExistente.empleado.apellido}`,
        sede: horasExtraExistente.sede.nombre,
        documentosEliminados: horasExtraExistente.documentos_horas_extra.length,
        usuarioId: usuario?.id
      });

      return res.status(200).json({
        success: true,
        message: 'Registro de horas extra eliminado exitosamente',
        data: {
          id: id,
          empleado: `${horasExtraExistente.empleado.nombre} ${horasExtraExistente.empleado.apellido}`,
          sede: horasExtraExistente.sede.nombre,
          cantidadHoras: horasExtraExistente.cantidad_horas,
          documentosEliminados: horasExtraExistente.documentos_horas_extra.length
        }
      });

    } catch (error) {
      logger.error('Error al eliminar registro de horas extra:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };
}