import { Request, Response } from 'express';
import PrismaConnection from '../../../prisma/prisma.connection';
import { logger } from '../../../config';
import * as fs from 'fs';
import * as path from 'path';

export class DocumentoSuplenciaController {
  private prisma: PrismaConnection;

  constructor() {
    this.prisma = PrismaConnection.getInstance();
  }

  // Crear nuevo documento de suplencia
  public createDocumentoSuplencia = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        suplencia_id,
        nombre,
        ruta_relativa
      } = req.body;

      logger.info('Iniciando creación de documento de suplencia', {
        suplencia_id,
        nombre
      });

      // Validar datos requeridos
      if (!suplencia_id || !nombre || !ruta_relativa) {
        logger.warn('Faltan datos requeridos para crear documento de suplencia');
        res.status(400).json({
          success: false,
          message: 'Faltan datos requeridos: suplencia_id, nombre, ruta_relativa',
          error: 'Validation Error'
        });
        return;
      }

      // Validar que la suplencia exista
      const suplencia = await this.prisma.suplencias.findUnique({
        where: { id: suplencia_id }
      });

      if (!suplencia) {
        logger.warn('Suplencia no encontrada:', suplencia_id);
        res.status(404).json({
          success: false,
          message: 'Suplencia no encontrada',
          error: 'Not Found'
        });
        return;
      }

      // Verificar si ya existe un documento con el mismo nombre para esta suplencia
      const documentoExistente = await this.prisma.documentos_suplencia.findFirst({
        where: {
          suplencia_id,
          nombre
        }
      });

      if (documentoExistente) {
        logger.warn('Ya existe un documento con ese nombre para esta suplencia', {
          suplencia_id,
          nombre
        });
        res.status(409).json({
          success: false,
          message: 'Ya existe un documento con ese nombre para esta suplencia',
          error: 'Conflict Error'
        });
        return;
      }

      // Crear documento de suplencia
      const nuevoDocumento = await this.prisma.documentos_suplencia.create({
        data: {
          suplencia_id,
          nombre,
          ruta_relativa
        },
        include: {
          suplencias: {
            select: {
              id: true,
              causa_ausencia: true,
              fecha_inicio_ausencia: true,
              fecha_fin_ausencia: true,
              empleado_suplencias_docente_ausente_idToempleado: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  documento: true,
                  email: true
                }
              },
              empleado_suplencias_docente_reemplazo_idToempleado: {
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
                  nombre: true
                }
              }
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Documento de suplencia creado exitosamente',
        data: nuevoDocumento
      });

      logger.info('Documento de suplencia creado exitosamente', { id: nuevoDocumento.id });
    } catch (error) {
      logger.error('Error al crear documento de suplencia:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  // Obtener documentos de suplencia con filtros y paginación
  public getDocumentosSuplencia = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = '1',
        limit = '10',
        search,
        suplencia_id
      } = req.query;

      const pageNumber = Math.max(1, parseInt(page as string));
      const limitNumber = Math.min(50, Math.max(1, parseInt(limit as string)));
      const skip = (pageNumber - 1) * limitNumber;

      logger.info('Obteniendo documentos de suplencia con filtros', {
        page: pageNumber,
        limit: limitNumber,
        search,
        suplencia_id
      });

      // Construir filtros
      const where: any = {};

      if (suplencia_id) {
        where.suplencia_id = suplencia_id;
      }

      // Búsqueda general
      if (search) {
        where.OR = [
          {
            nombre: {
              contains: search as string,
              mode: 'insensitive'
            }
          },
          {
            ruta_relativa: {
              contains: search as string,
              mode: 'insensitive'
            }
          },
          {
            suplencias: {
              OR: [
                {
                  causa_ausencia: {
                    contains: search as string,
                    mode: 'insensitive'
                  }
                },
                {
                  empleado_suplencias_docente_ausente_idToempleado: {
                    OR: [
                      {
                        nombre: {
                          contains: search as string,
                          mode: 'insensitive'
                        }
                      },
                      {
                        apellido: {
                          contains: search as string,
                          mode: 'insensitive'
                        }
                      }
                    ]
                  }
                },
                {
                  empleado_suplencias_docente_reemplazo_idToempleado: {
                    OR: [
                      {
                        nombre: {
                          contains: search as string,
                          mode: 'insensitive'
                        }
                      },
                      {
                        apellido: {
                          contains: search as string,
                          mode: 'insensitive'
                        }
                      }
                    ]
                  }
                },
                {
                  sede: {
                    nombre: {
                      contains: search as string,
                      mode: 'insensitive'
                    }
                  }
                }
              ]
            }
          }
        ];
      }

      // Obtener documentos y contar total
      const [documentos, totalItems] = await Promise.all([
        this.prisma.documentos_suplencia.findMany({
          where,
          skip,
          take: limitNumber,
          orderBy: {
            created_at: 'desc'
          },
          include: {
            suplencias: {
              select: {
                id: true,
                causa_ausencia: true,
                fecha_inicio_ausencia: true,
                fecha_fin_ausencia: true,
                jornada: true,
                empleado_suplencias_docente_ausente_idToempleado: {
                  select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    documento: true,
                    email: true
                  }
                },
                empleado_suplencias_docente_reemplazo_idToempleado: {
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
                    zona: true
                  }
                }
              }
            }
          }
        }),
        this.prisma.documentos_suplencia.count({ where })
      ]);

      const totalPages = Math.ceil(totalItems / limitNumber);

      res.status(200).json({
        success: true,
        message: 'Documentos de suplencia obtenidos exitosamente',
        data: documentos,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalItems,
          itemsPerPage: limitNumber,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1
        }
      });

      logger.info('Documentos de suplencia obtenidos exitosamente', {
        count: documentos.length,
        totalItems,
        page: pageNumber
      });
    } catch (error) {
      logger.error('Error al obtener documentos de suplencia:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  // Obtener documentos por suplencia específica
  public getDocumentosBySuplencia = async (req: Request, res: Response): Promise<void> => {
    try {
      const { suplencia_id } = req.params;

      logger.info('Obteniendo documentos por suplencia', { suplencia_id });

      // Validar que la suplencia exista
      const suplencia = await this.prisma.suplencias.findUnique({
        where: { id: suplencia_id },
        select: {
          id: true,
          causa_ausencia: true,
          fecha_inicio_ausencia: true,
          fecha_fin_ausencia: true,
          fecha_inicio_reemplazo: true,
          fecha_fin_reemplazo: true,
          horas_cubiertas: true,
          jornada: true,
          empleado_suplencias_docente_ausente_idToempleado: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              documento: true,
              email: true,
              cargo: true
            }
          },
          empleado_suplencias_docente_reemplazo_idToempleado: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              documento: true,
              email: true,
              cargo: true
            }
          },
          sede: {
            select: {
              id: true,
              nombre: true,
              zona: true,
              direccion: true
            }
          }
        }
      });

      if (!suplencia) {
        logger.warn('Suplencia no encontrada:', suplencia_id);
        res.status(404).json({
          success: false,
          message: 'Suplencia no encontrada',
          error: 'Not Found'
        });
        return;
      }

      const documentos = await this.prisma.documentos_suplencia.findMany({
        where: { suplencia_id },
        orderBy: {
          created_at: 'desc'
        },
        select: {
          id: true,
          nombre: true,
          ruta_relativa: true,
          created_at: true
        }
      });

      res.status(200).json({
        success: true,
        message: 'Documentos obtenidos exitosamente',
        data: documentos,
        suplencia,
        resumen: {
          total_documentos: documentos.length,
          documentos_por_fecha: documentos.reduce((acc: any, doc: any) => {
            const fecha = doc.created_at?.toISOString().split('T')[0];
            if (fecha) {
              acc[fecha] = (acc[fecha] || 0) + 1;
            }
            return acc;
          }, {})
        }
      });

      logger.info('Documentos por suplencia obtenidos exitosamente', {
        suplencia_id,
        total: documentos.length
      });
    } catch (error) {
      logger.error('Error al obtener documentos por suplencia:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  // Obtener documento por ID
  public getDocumentoById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      logger.info('Obteniendo documento de suplencia por ID:', id);

      const documento = await this.prisma.documentos_suplencia.findUnique({
        where: { id },
        include: {
          suplencias: {
            select: {
              id: true,
              causa_ausencia: true,
              fecha_inicio_ausencia: true,
              fecha_fin_ausencia: true,
              fecha_inicio_reemplazo: true,
              fecha_fin_reemplazo: true,
              horas_cubiertas: true,
              jornada: true,
              observacion: true,
              empleado_suplencias_docente_ausente_idToempleado: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  documento: true,
                  email: true,
                  cargo: true,
                  direccion: true
                }
              },
              empleado_suplencias_docente_reemplazo_idToempleado: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  documento: true,
                  email: true,
                  cargo: true,
                  direccion: true
                }
              },
              sede: {
                select: {
                  id: true,
                  nombre: true,
                  zona: true,
                  direccion: true,
                  codigo_DANE: true
                }
              }
            }
          }
        }
      });

      if (!documento) {
        logger.warn('Documento de suplencia no encontrado:', id);
        res.status(404).json({
          success: false,
          message: 'Documento de suplencia no encontrado',
          error: 'Not Found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Documento obtenido exitosamente',
        data: documento
      });

      logger.info('Documento de suplencia obtenido exitosamente:', id);
    } catch (error) {
      logger.error('Error al obtener documento de suplencia por ID:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  // Actualizar documento de suplencia
  public updateDocumentoSuplencia = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { nombre, ruta_relativa } = req.body;

      logger.info('Actualizando documento de suplencia', { id, nombre, ruta_relativa });

      // Verificar que el documento existe
      const documentoExistente = await this.prisma.documentos_suplencia.findUnique({
        where: { id }
      });

      if (!documentoExistente) {
        logger.warn('Documento de suplencia no encontrado para actualizar:', id);
        res.status(404).json({
          success: false,
          message: 'Documento de suplencia no encontrado',
          error: 'Not Found'
        });
        return;
      }

      // Preparar datos para actualizar
      const dataToUpdate: any = {};
      if (nombre) dataToUpdate.nombre = nombre;
      if (ruta_relativa) dataToUpdate.ruta_relativa = ruta_relativa;

      // Si se está actualizando el nombre, verificar que no exista otro documento con el mismo nombre para la misma suplencia
      if (nombre && nombre !== documentoExistente.nombre) {
        const documentoDuplicado = await this.prisma.documentos_suplencia.findFirst({
          where: {
            suplencia_id: documentoExistente.suplencia_id,
            nombre,
            id: { not: id } // Excluir el documento actual
          }
        });

        if (documentoDuplicado) {
          logger.warn('Ya existe otro documento con ese nombre para esta suplencia', {
            suplencia_id: documentoExistente.suplencia_id,
            nombre
          });
          res.status(409).json({
            success: false,
            message: 'Ya existe otro documento con ese nombre para esta suplencia',
            error: 'Conflict Error'
          });
          return;
        }
      }

      // Actualizar documento
      const documentoActualizado = await this.prisma.documentos_suplencia.update({
        where: { id },
        data: dataToUpdate,
        include: {
          suplencias: {
            select: {
              id: true,
              causa_ausencia: true,
              empleado_suplencias_docente_ausente_idToempleado: {
                select: {
                  id: true,
                  nombre: true,
                  apellido: true,
                  documento: true,
                  email: true
                }
              },
              empleado_suplencias_docente_reemplazo_idToempleado: {
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
                  nombre: true
                }
              }
            }
          }
        }
      });

      res.status(200).json({
        success: true,
        message: 'Documento de suplencia actualizado exitosamente',
        data: documentoActualizado
      });

      logger.info('Documento de suplencia actualizado exitosamente:', id);
    } catch (error) {
      logger.error('Error al actualizar documento de suplencia:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  // Descargar documento
  public downloadDocumento = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      logger.info('Descargando documento de suplencia:', id);

      // Buscar el documento
      const documento = await this.prisma.documentos_suplencia.findUnique({
        where: { id },
        select: {
          id: true,
          nombre: true,
          ruta_relativa: true
        }
      });

      if (!documento) {
        logger.warn('Documento de suplencia no encontrado para descarga:', id);
        res.status(404).json({
          success: false,
          message: 'Documento de suplencia no encontrado',
          error: 'Not Found'
        });
        return;
      }

      // Verificar si el archivo existe en el sistema de archivos
      const rutaCompleta = path.resolve(documento.ruta_relativa);
      
      if (!fs.existsSync(rutaCompleta)) {
        logger.warn('Archivo no encontrado en el sistema:', rutaCompleta);
        res.status(404).json({
          success: false,
          message: 'Archivo no encontrado en el sistema',
          error: 'File Not Found'
        });
        return;
      }

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${documento.nombre}"`);

      // Enviar archivo
      const fileStream = fs.createReadStream(rutaCompleta);
      fileStream.pipe(res);

      logger.info('Documento de suplencia descargado exitosamente:', {
        id,
        nombre: documento.nombre
      });
    } catch (error) {
      logger.error('Error al descargar documento de suplencia:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  // Eliminar documento (solo super_admin)
  public deleteDocumentoSuplencia = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userRole = (req as any).user?.rol;

      logger.info('Eliminando documento de suplencia', { id, userRole });

      // Verificar permisos
      if (userRole !== 'super_admin') {
        logger.warn('Usuario sin permisos para eliminar documento de suplencia', { userRole });
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar documentos de suplencia',
          error: 'Forbidden'
        });
        return;
      }

      // Verificar que el documento exists
      const documentoExistente = await this.prisma.documentos_suplencia.findUnique({
        where: { id },
        include: {
          suplencias: {
            select: {
              causa_ausencia: true,
              empleado_suplencias_docente_ausente_idToempleado: {
                select: {
                  nombre: true,
                  apellido: true,
                  documento: true
                }
              }
            }
          }
        }
      });

      if (!documentoExistente) {
        logger.warn('Documento de suplencia no encontrado para eliminar:', id);
        res.status(404).json({
          success: false,
          message: 'Documento de suplencia no encontrado',
          error: 'Not Found'
        });
        return;
      }

      // Eliminar documento
      await this.prisma.documentos_suplencia.delete({
        where: { id }
      });

      res.status(200).json({
        success: true,
        message: 'Documento de suplencia eliminado exitosamente',
        data: {
          id,
          nombre: documentoExistente.nombre,
          suplencia_causa: documentoExistente.suplencias.causa_ausencia,
          docente_ausente: `${documentoExistente.suplencias.empleado_suplencias_docente_ausente_idToempleado.nombre} ${documentoExistente.suplencias.empleado_suplencias_docente_ausente_idToempleado.apellido}`,
          docente_documento: documentoExistente.suplencias.empleado_suplencias_docente_ausente_idToempleado.documento
        }
      });

      logger.info('Documento de suplencia eliminado exitosamente:', id);
    } catch (error) {
      logger.error('Error al eliminar documento de suplencia:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  // Obtener estadísticas de documentos de suplencia
  public getEstadisticasDocumentos = async (req: Request, res: Response): Promise<void> => {
    try {
      const { suplencia_id } = req.query;

      logger.info('Obteniendo estadísticas de documentos de suplencia', { suplencia_id });

      // Construir filtros
      const where: any = {};
      if (suplencia_id) {
        where.suplencia_id = suplencia_id;
      }

      // Obtener estadísticas generales
      const [
        totalDocumentos,
        documentosRecientes,
        documentosPorSuplencia
      ] = await Promise.all([
        this.prisma.documentos_suplencia.count({ where }),
        this.prisma.documentos_suplencia.findMany({
          where,
          take: 10,
          orderBy: {
            created_at: 'desc'
          },
          include: {
            suplencias: {
              select: {
                causa_ausencia: true,
                empleado_suplencias_docente_ausente_idToempleado: {
                  select: {
                    nombre: true,
                    apellido: true,
                    documento: true
                  }
                },
                empleado_suplencias_docente_reemplazo_idToempleado: {
                  select: {
                    nombre: true,
                    apellido: true,
                    documento: true
                  }
                }
              }
            }
          }
        }),
        this.prisma.documentos_suplencia.groupBy({
          by: ['suplencia_id'],
          where,
          _count: true
        })
      ]);

      res.status(200).json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: {
          total_documentos: totalDocumentos,
          documentos_por_suplencia: documentosPorSuplencia.length,
          promedio_documentos_por_suplencia: documentosPorSuplencia.length > 0 
            ? (totalDocumentos / documentosPorSuplencia.length).toFixed(2)
            : '0.00',
          documentos_recientes: documentosRecientes,
          suplencia_filtrada: !!suplencia_id
        }
      });

      logger.info('Estadísticas de documentos de suplencia obtenidas exitosamente', {
        total: totalDocumentos,
        filtros: { suplencia_id }
      });
    } catch (error) {
      logger.error('Error al obtener estadísticas de documentos de suplencia:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };
}