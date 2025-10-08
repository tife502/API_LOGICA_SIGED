import { Request, Response } from 'express';
import PrismaConnection from '../../../prisma/prisma.connection';
import { logger } from '../../../config';
import { PrismaInterfaces } from '../../../domain';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Controlador para gestión de documentos de horas extra
 * - CREATE, READ, UPDATE: Todos los roles autenticados
 * - DELETE: Solo super_admin
 */
export class DocumentoHorasExtraController {
  private prisma: PrismaConnection;

  constructor() {
    this.prisma = PrismaConnection.getInstance();
  }

  /**
   * Crear nuevo documento de horas extra
   * Acceso: Todos los roles autenticados
   */
  createDocumentoHorasExtra = async (req: Request, res: Response) => {
    try {
      const usuario = req.usuario;
      
      // Validar datos de entrada
      const { horas_extra_id, nombre, ruta_relativa } = req.body;

      // Validación básica
      if (!horas_extra_id || !nombre || !ruta_relativa) {
        return res.status(400).json({
          success: false,
          message: 'Faltan datos requeridos: horas_extra_id, nombre, ruta_relativa',
          error: 'Validation Error'
        });
      }

      // Validar que el registro de horas extra existe
      const horasExtraExistente = await this.prisma.horas_extra.findUnique({
        where: { id: horas_extra_id },
        include: {
          empleado: {
            select: {
              nombre: true,
              apellido: true,
              documento: true
            }
          },
          sede: {
            select: {
              nombre: true
            }
          }
        }
      });

      if (!horasExtraExistente) {
        return res.status(404).json({
          success: false,
          message: 'Registro de horas extra no encontrado',
          error: 'Not Found'
        });
      }

      // Verificar que no exista un documento con el mismo nombre para las mismas horas extra
      const documentoExistente = await this.prisma.documentos_horas_extra.findFirst({
        where: {
          horas_extra_id: horas_extra_id,
          nombre: {
            equals: nombre.trim()
          }
        }
      });

      if (documentoExistente) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un documento con ese nombre para este registro de horas extra',
          error: 'Conflict Error'
        });
      }

      // Crear el documento
      const nuevoDocumento = await this.prisma.documentos_horas_extra.create({
        data: {
          horas_extra_id: horas_extra_id,
          nombre: nombre.trim(),
          ruta_relativa: ruta_relativa.trim()
        },
        include: {
          horas_extra: {
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
              }
            }
          }
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Documento de horas extra creado exitosamente',
        data: nuevoDocumento
      });

    } catch (error) {
      logger.error('Error al crear documento de horas extra:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  /**
   * Obtener todos los documentos de horas extra con paginación
   * Acceso: Todos los roles autenticados
   */
  getDocumentosHorasExtra = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const horas_extra_id = req.query.horas_extra_id as string;
      const empleado_id = req.query.empleado_id as string;
      const skip = (page - 1) * limit;

      // Construir filtros
      const where: any = {};
      
      if (horas_extra_id) {
        where.horas_extra_id = horas_extra_id;
      }

      if (empleado_id) {
        where.horas_extra = {
          empleado_id: empleado_id
        };
      }

      if (search) {
        where.OR = [
          { nombre: { contains: search } },
          { ruta_relativa: { contains: search } },
          { 
            horas_extra: { 
              empleado: {
                OR: [
                  { nombre: { contains: search } },
                  { apellido: { contains: search } },
                  { documento: { contains: search } }
                ]
              }
            } 
          }
        ];
      }

      // Obtener documentos con paginación
      const [documentos, total] = await Promise.all([
        this.prisma.documentos_horas_extra.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            horas_extra: {
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
                }
              }
            }
          }
        }),
        this.prisma.documentos_horas_extra.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        success: true,
        message: 'Documentos de horas extra obtenidos exitosamente',
        data: documentos,
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
      logger.error('Error al obtener documentos de horas extra:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  /**
   * Obtener documentos por registro de horas extra ID
   * Acceso: Todos los roles autenticados
   */
  getDocumentosByHorasExtraId = async (req: Request, res: Response) => {
    try {
      const { horas_extra_id } = req.params;

      // Verificar que el registro de horas extra existe
      const horasExtraExistente = await this.prisma.horas_extra.findUnique({
        where: { id: horas_extra_id },
        include: {
          empleado: {
            select: {
              nombre: true,
              apellido: true,
              documento: true
            }
          },
          sede: {
            select: {
              nombre: true
            }
          }
        }
      });

      if (!horasExtraExistente) {
        return res.status(404).json({
          success: false,
          message: 'Registro de horas extra no encontrado',
          error: 'Not Found'
        });
      }

      const documentos = await this.prisma.documentos_horas_extra.findMany({
        where: { horas_extra_id: horas_extra_id },
        orderBy: { created_at: 'desc' },
        include: {
          horas_extra: {
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
              }
            }
          }
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Documentos obtenidos exitosamente',
        data: documentos,
        horas_extra: {
          id: horasExtraExistente.id,
          empleado: `${horasExtraExistente.empleado.nombre} ${horasExtraExistente.empleado.apellido}`,
          sede: horasExtraExistente.sede.nombre,
          cantidad_horas: horasExtraExistente.cantidad_horas,
          fecha_realizacion: horasExtraExistente.fecha_realizacion,
          jornada: horasExtraExistente.jornada
        }
      });

    } catch (error) {
      logger.error('Error al obtener documentos por horas extra:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  /**
   * Obtener un documento por ID
   * Acceso: Todos los roles autenticados
   */
  getDocumentoById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const documento = await this.prisma.documentos_horas_extra.findUnique({
        where: { id: id },
        include: {
          horas_extra: {
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
              }
            }
          }
        }
      });

      if (!documento) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado',
          error: 'Not Found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Documento obtenido exitosamente',
        data: documento
      });

    } catch (error) {
      logger.error('Error al obtener documento:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  /**
   * Actualizar un documento
   * Acceso: Todos los roles autenticados
   */
  updateDocumento = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuario = req.usuario;
      const { nombre, ruta_relativa } = req.body;

      // Verificar que el documento existe
      const documentoExistente = await this.prisma.documentos_horas_extra.findUnique({
        where: { id: id }
      });

      if (!documentoExistente) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado',
          error: 'Not Found'
        });
      }

      // Preparar datos de actualización
      const updateData: any = {};
      
      if (nombre) {
        updateData.nombre = nombre.trim();
        
        // Verificar que no exista otro documento con el mismo nombre para las mismas horas extra
        const nombreDuplicado = await this.prisma.documentos_horas_extra.findFirst({
          where: {
            horas_extra_id: documentoExistente.horas_extra_id,
            nombre: {
              equals: nombre.trim()
            },
            id: { not: id }
          }
        });

        if (nombreDuplicado) {
          return res.status(409).json({
            success: false,
            message: 'Ya existe otro documento con ese nombre para este registro de horas extra',
            error: 'Conflict Error'
          });
        }
      }

      if (ruta_relativa) {
        updateData.ruta_relativa = ruta_relativa.trim();
      }

      // Verificar que hay datos para actualizar
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionaron datos para actualizar',
          error: 'Validation Error'
        });
      }

      // Actualizar el documento
      const documentoActualizado = await this.prisma.documentos_horas_extra.update({
        where: { id: id },
        data: updateData,
        include: {
          horas_extra: {
            include: {
              empleado: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true
                }
              },
              sede: {
                select: {
                  id: true,
                  nombre: true
                }
              }
            }
          }
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Documento actualizado exitosamente',
        data: documentoActualizado
      });

    } catch (error) {
      logger.error('Error al actualizar documento:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  /**
   * Eliminar un documento
   * Acceso: Solo super_admin
   */
  deleteDocumento = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuario = req.usuario;

      // Verificar que el usuario sea super_admin
      if (usuario?.rol !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar documentos',
          error: 'Forbidden'
        });
      }

      // Verificar que el documento existe
      const documentoExistente = await this.prisma.documentos_horas_extra.findUnique({
        where: { id: id },
        include: {
          horas_extra: {
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
              }
            }
          }
        }
      });

      if (!documentoExistente) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado',
          error: 'Not Found'
        });
      }

      // Eliminar el documento
      await this.prisma.documentos_horas_extra.delete({
        where: { id: id }
      });

      logger.warn(`Documento de horas extra eliminado`, {
        documentoId: id,
        nombre: documentoExistente.nombre,
        empleado: `${documentoExistente.horas_extra.empleado.nombre} ${documentoExistente.horas_extra.empleado.apellido}`,
        horasExtraId: documentoExistente.horas_extra_id,
        usuarioId: usuario?.id
      });

      return res.status(200).json({
        success: true,
        message: 'Documento eliminado exitosamente',
        data: {
          id: id,
          nombre: documentoExistente.nombre,
          empleado: `${documentoExistente.horas_extra.empleado.nombre} ${documentoExistente.horas_extra.empleado.apellido}`,
          sede: documentoExistente.horas_extra.sede.nombre
        }
      });

    } catch (error) {
      logger.error('Error al eliminar documento:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  /**
   * Descargar archivo de documento
   * Acceso: Todos los roles autenticados
   */
  downloadDocumento = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Obtener información del documento
      const documento = await this.prisma.documentos_horas_extra.findUnique({
        where: { id: id },
        include: {
          horas_extra: {
            include: {
              empleado: {
                select: {
                  nombre: true,
                  apellido: true
                }
              }
            }
          }
        }
      });

      if (!documento) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado',
          error: 'Not Found'
        });
      }

      // Construir la ruta completa del archivo
      const rutaCompleta = path.join(process.cwd(), 'uploads', documento.ruta_relativa);

      // Verificar que el archivo existe
      if (!fs.existsSync(rutaCompleta)) {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado en el sistema',
          error: 'File Not Found'
        });
      }

      // Configurar headers para descarga
      res.setHeader('Content-Disposition', `attachment; filename="${documento.nombre}"`);
      res.setHeader('Content-Type', 'application/octet-stream');

      // Enviar el archivo
      return res.sendFile(rutaCompleta);

    } catch (error) {
      logger.error('Error al descargar documento:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };
}