import { Request, Response } from 'express';
import PrismaConnection from '../../../prisma/prisma.connection';
import { logger } from '../../../config';
import { PrismaInterfaces } from '../../../domain';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Controlador para gestión de documentos de actos administrativos
 * - CREATE, READ, UPDATE: Todos los roles autenticados
 * - DELETE: Solo super_admin
 */
export class DocumentoActoAdministrativoController {
  private prisma: PrismaConnection;

  constructor() {
    this.prisma = PrismaConnection.getInstance();
  }

  /**
   * Crear nuevo documento de acto administrativo
   * Acceso: Todos los roles autenticados
   */
  createDocumentoActo = async (req: Request, res: Response) => {
    try {
      const usuario = req.usuario;
      
      // Validar datos de entrada
      const { acto_administrativo_id, nombre, ruta_relativa } = req.body;

      // Validación básica
      if (!acto_administrativo_id || !nombre || !ruta_relativa) {
        return res.status(400).json({
          success: false,
          message: 'Faltan datos requeridos: acto_administrativo_id, nombre, ruta_relativa',
          error: 'Validation Error'
        });
      }

      // Validar que el acto administrativo existe
      const actoExistente = await this.prisma.actos_administrativos.findUnique({
        where: { id: parseInt(acto_administrativo_id) }
      });

      if (!actoExistente) {
        return res.status(404).json({
          success: false,
          message: 'Acto administrativo no encontrado',
          error: 'Not Found'
        });
      }

      // Verificar que no exista un documento con el mismo nombre para el mismo acto
      const documentoExistente = await this.prisma.documentos_actos_administrativos.findFirst({
        where: {
          acto_administrativo_id: parseInt(acto_administrativo_id),
          nombre: {
            equals: nombre.trim()
          }
        }
      });

      if (documentoExistente) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un documento con ese nombre para este acto administrativo',
          error: 'Conflict Error'
        });
      }

      // Crear el documento
      const nuevoDocumento = await this.prisma.documentos_actos_administrativos.create({
        data: {
          acto_administrativo_id: parseInt(acto_administrativo_id),
          nombre: nombre.trim(),
          ruta_relativa: ruta_relativa.trim()
        },
        include: {
          actos_administrativos: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Documento de acto administrativo creado exitosamente',
        data: nuevoDocumento
      });

    } catch (error) {
      logger.error('Error al crear documento de acto administrativo:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  /**
   * Obtener todos los documentos de actos administrativos con paginación
   * Acceso: Todos los roles autenticados
   */
  getDocumentosActos = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const acto_id = req.query.acto_id as string;
      const skip = (page - 1) * limit;

      // Construir filtros
      const where: any = {};
      
      if (acto_id) {
        where.acto_administrativo_id = parseInt(acto_id);
      }

      if (search) {
        where.OR = [
          { nombre: { contains: search } },
          { ruta_relativa: { contains: search } },
          { 
            actos_administrativos: { 
              nombre: { contains: search } 
            } 
          }
        ];
      }

      // Obtener documentos con paginación
      const [documentos, total] = await Promise.all([
        this.prisma.documentos_actos_administrativos.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            actos_administrativos: {
              select: {
                id: true,
                nombre: true,
                fecha_creacion: true
              }
            }
          }
        }),
        this.prisma.documentos_actos_administrativos.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        success: true,
        message: 'Documentos de actos administrativos obtenidos exitosamente',
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
      logger.error('Error al obtener documentos de actos administrativos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  /**
   * Obtener documentos por acto administrativo ID
   * Acceso: Todos los roles autenticados
   */
  getDocumentosByActoId = async (req: Request, res: Response) => {
    try {
      const { acto_id } = req.params;

      // Validar que el ID sea un número
      const actoId = parseInt(acto_id);
      if (isNaN(actoId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de acto administrativo inválido',
          error: 'Validation Error'
        });
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

      const documentos = await this.prisma.documentos_actos_administrativos.findMany({
        where: { acto_administrativo_id: actoId },
        orderBy: { created_at: 'desc' },
        include: {
          actos_administrativos: {
            select: {
              id: true,
              nombre: true,
              fecha_creacion: true
            }
          }
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Documentos obtenidos exitosamente',
        data: documentos,
        acto: actoExistente
      });

    } catch (error) {
      logger.error('Error al obtener documentos por acto:', error);
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

      const documento = await this.prisma.documentos_actos_administrativos.findUnique({
        where: { id: id },
        include: {
          actos_administrativos: true
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
      const documentoExistente = await this.prisma.documentos_actos_administrativos.findUnique({
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
        
        // Verificar que no exista otro documento con el mismo nombre para el mismo acto
        const nombreDuplicado = await this.prisma.documentos_actos_administrativos.findFirst({
          where: {
            acto_administrativo_id: documentoExistente.acto_administrativo_id,
            nombre: {
              equals: nombre.trim()
            },
            id: { not: id }
          }
        });

        if (nombreDuplicado) {
          return res.status(409).json({
            success: false,
            message: 'Ya existe otro documento con ese nombre para este acto administrativo',
            error: 'Conflict Error'
          });
        }
      }

      if (ruta_relativa) {
        updateData.ruta_relativa = ruta_relativa.trim();
      }

      // Actualizar el documento
      const documentoActualizado = await this.prisma.documentos_actos_administrativos.update({
        where: { id: id },
        data: updateData,
        include: {
          actos_administrativos: {
            select: {
              id: true,
              nombre: true
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
      const documentoExistente = await this.prisma.documentos_actos_administrativos.findUnique({
        where: { id: id },
        include: {
          actos_administrativos: {
            select: {
              id: true,
              nombre: true
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
      await this.prisma.documentos_actos_administrativos.delete({
        where: { id: id }
      });

      logger.warn(`Documento de acto administrativo eliminado`, {
        documentoId: id,
        nombre: documentoExistente.nombre,
        actoId: documentoExistente.acto_administrativo_id,
        usuarioId: usuario?.id
      });

      return res.status(200).json({
        success: true,
        message: 'Documento eliminado exitosamente',
        data: {
          id: id,
          nombre: documentoExistente.nombre,
          acto: documentoExistente.actos_administrativos
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
      const documento = await this.prisma.documentos_actos_administrativos.findUnique({
        where: { id: id },
        include: {
          actos_administrativos: {
            select: {
              nombre: true
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
      const rutaCompleta = path.join(process.cwd(), documento.ruta_relativa);

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
