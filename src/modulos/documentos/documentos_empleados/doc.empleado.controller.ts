import { Request, Response } from 'express';
import PrismaConnection from '../../../prisma/prisma.connection';
import { logger } from '../../../config';
import { PrismaInterfaces } from '../../../domain';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Controlador para gestión de documentos de empleado
 * - CREATE, READ, UPDATE: Todos los roles autenticados
 * - DELETE: Solo super_admin
 */
export class DocumentoEmpleadoController {
  private prisma: PrismaConnection;

  constructor() {
    this.prisma = PrismaConnection.getInstance();
  }

  /**
   * Crear nuevo documento de empleado
   * Acceso: Todos los roles autenticados
   */
  createDocumentoEmpleado = async (req: Request, res: Response) => {
    try {
      const usuario = req.usuario;
      
      // Validar datos de entrada
      const { empleado_id, tipo_documento, nombre, ruta_relativa, descripcion } = req.body;

      // Validación básica
      if (!empleado_id || !tipo_documento || !nombre || !ruta_relativa) {
        return res.status(400).json({
          success: false,
          message: 'Faltan datos requeridos: empleado_id, tipo_documento, nombre, ruta_relativa',
          error: 'Validation Error'
        });
      }

      // Validar que el tipo de documento sea válido
      const tiposValidos = ['HV', 'LICENCIAS', 'CONTRATO', 'SOPORTE_MEDICO'];
      if (!tiposValidos.includes(tipo_documento)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de documento inválido. Valores permitidos: HV, LICENCIAS, CONTRATO, SOPORTE_MEDICO',
          error: 'Validation Error'
        });
      }

      // Validar que el empleado existe
      const empleadoExistente = await this.prisma.empleado.findUnique({
        where: { id: empleado_id },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          documento: true,
          email: true
        }
      });

      if (!empleadoExistente) {
        return res.status(404).json({
          success: false,
          message: 'Empleado no encontrado',
          error: 'Not Found'
        });
      }

      // Verificar que no exista un documento con el mismo nombre y tipo para el mismo empleado
      const documentoExistente = await this.prisma.documentos_empleado.findFirst({
        where: {
          empleado_id: empleado_id,
          tipo_documento: tipo_documento as any,
          nombre: {
            equals: nombre.trim()
          }
        }
      });

      if (documentoExistente) {
        return res.status(409).json({
          success: false,
          message: `Ya existe un documento de tipo ${tipo_documento} con ese nombre para este empleado`,
          error: 'Conflict Error'
        });
      }

      // Crear el documento
      const nuevoDocumento = await this.prisma.documentos_empleado.create({
        data: {
          empleado_id: empleado_id,
          tipo_documento: tipo_documento as any,
          nombre: nombre.trim(),
          ruta_relativa: ruta_relativa.trim(),
          descripcion: descripcion?.trim() || null
        },
        include: {
          empleado: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              documento: true,
              email: true
            }
          }
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Documento de empleado creado exitosamente',
        data: nuevoDocumento
      });

    } catch (error) {
      logger.error('Error al crear documento de empleado:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  /**
   * Obtener todos los documentos de empleado con paginación
   * Acceso: Todos los roles autenticados
   */
  getDocumentosEmpleado = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const empleado_id = req.query.empleado_id as string;
      const tipo_documento = req.query.tipo_documento as string;
      const skip = (page - 1) * limit;

      // Construir filtros
      const where: any = {};
      
      if (empleado_id) {
        where.empleado_id = empleado_id;
      }

      if (tipo_documento) {
        where.tipo_documento = tipo_documento;
      }

      if (search) {
        where.OR = [
          { nombre: { contains: search } },
          { descripcion: { contains: search } },
          { ruta_relativa: { contains: search } },
          { 
            empleado: {
              OR: [
                { nombre: { contains: search } },
                { apellido: { contains: search } },
                { documento: { contains: search } },
                { email: { contains: search } }
              ]
            }
          }
        ];
      }

      // Obtener documentos con paginación
      const [documentos, total] = await Promise.all([
        this.prisma.documentos_empleado.findMany({
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
                documento: true,
                email: true,
                cargo: true
              }
            }
          }
        }),
        this.prisma.documentos_empleado.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        success: true,
        message: 'Documentos de empleado obtenidos exitosamente',
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
      logger.error('Error al obtener documentos de empleado:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  /**
   * Obtener documentos por empleado ID
   * Acceso: Todos los roles autenticados
   */
  getDocumentosByEmpleadoId = async (req: Request, res: Response) => {
    try {
      const { empleado_id } = req.params;
      const tipo_documento = req.query.tipo_documento as string;

      // Verificar que el empleado existe
      const empleadoExistente = await this.prisma.empleado.findUnique({
        where: { id: empleado_id },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          documento: true,
          email: true,
          cargo: true
        }
      });

      if (!empleadoExistente) {
        return res.status(404).json({
          success: false,
          message: 'Empleado no encontrado',
          error: 'Not Found'
        });
      }

      // Construir filtros
      const where: any = { empleado_id: empleado_id };
      
      if (tipo_documento) {
        where.tipo_documento = tipo_documento;
      }

      const documentos = await this.prisma.documentos_empleado.findMany({
        where,
        orderBy: [
          { tipo_documento: 'asc' },
          { created_at: 'desc' }
        ],
        include: {
          empleado: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              documento: true,
              email: true,
              cargo: true
            }
          }
        }
      });

      // Agrupar documentos por tipo
      const documentosAgrupados = documentos.reduce((acc: any, doc) => {
        const tipo = doc.tipo_documento;
        if (!acc[tipo]) {
          acc[tipo] = [];
        }
        acc[tipo].push(doc);
        return acc;
      }, {});

      return res.status(200).json({
        success: true,
        message: 'Documentos obtenidos exitosamente',
        data: documentos,
        documentos_agrupados: documentosAgrupados,
        empleado: {
          id: empleadoExistente.id,
          nombre: empleadoExistente.nombre,
          apellido: empleadoExistente.apellido,
          documento: empleadoExistente.documento,
          email: empleadoExistente.email,
          cargo: empleadoExistente.cargo
        },
        resumen: {
          total_documentos: documentos.length,
          tipos_disponibles: Object.keys(documentosAgrupados),
          conteo_por_tipo: Object.fromEntries(
            Object.entries(documentosAgrupados).map(([tipo, docs]: [string, any]) => [tipo, docs.length])
          )
        }
      });

    } catch (error) {
      logger.error('Error al obtener documentos por empleado:', error);
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

      const documento = await this.prisma.documentos_empleado.findUnique({
        where: { id: id },
        include: {
          empleado: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              documento: true,
              email: true,
              cargo: true,
              direccion: true
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
      const { tipo_documento, nombre, ruta_relativa, descripcion } = req.body;

      // Verificar que el documento existe
      const documentoExistente = await this.prisma.documentos_empleado.findUnique({
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
      
      if (tipo_documento) {
        const tiposValidos = ['HV', 'LICENCIAS', 'CONTRATO', 'SOPORTE_MEDICO'];
        if (!tiposValidos.includes(tipo_documento)) {
          return res.status(400).json({
            success: false,
            message: 'Tipo de documento inválido. Valores permitidos: HV, LICENCIAS, CONTRATO, SOPORTE_MEDICO',
            error: 'Validation Error'
          });
        }
        updateData.tipo_documento = tipo_documento;
      }

      if (nombre) {
        updateData.nombre = nombre.trim();
        
        // Verificar que no exista otro documento con el mismo nombre y tipo para el mismo empleado
        const tipoFinal = tipo_documento || documentoExistente.tipo_documento;
        const nombreDuplicado = await this.prisma.documentos_empleado.findFirst({
          where: {
            empleado_id: documentoExistente.empleado_id,
            tipo_documento: tipoFinal as any,
            nombre: {
              equals: nombre.trim()
            },
            id: { not: id }
          }
        });

        if (nombreDuplicado) {
          return res.status(409).json({
            success: false,
            message: `Ya existe otro documento de tipo ${tipoFinal} con ese nombre para este empleado`,
            error: 'Conflict Error'
          });
        }
      }

      if (ruta_relativa) {
        updateData.ruta_relativa = ruta_relativa.trim();
      }

      if (descripcion !== undefined) {
        updateData.descripcion = descripcion?.trim() || null;
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
      const documentoActualizado = await this.prisma.documentos_empleado.update({
        where: { id: id },
        data: updateData,
        include: {
          empleado: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              documento: true,
              email: true
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
          message: 'No tienes permisos para eliminar documentos de empleado',
          error: 'Forbidden'
        });
      }

      // Verificar que el documento existe
      const documentoExistente = await this.prisma.documentos_empleado.findUnique({
        where: { id: id },
        include: {
          empleado: {
            select: {
              nombre: true,
              apellido: true,
              documento: true
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
      await this.prisma.documentos_empleado.delete({
        where: { id: id }
      });

      logger.warn(`Documento de empleado eliminado`, {
        documentoId: id,
        nombre: documentoExistente.nombre,
        tipoDocumento: documentoExistente.tipo_documento,
        empleado: `${documentoExistente.empleado.nombre} ${documentoExistente.empleado.apellido}`,
        empleadoDocumento: documentoExistente.empleado.documento,
        usuarioId: usuario?.id
      });

      return res.status(200).json({
        success: true,
        message: 'Documento eliminado exitosamente',
        data: {
          id: id,
          nombre: documentoExistente.nombre,
          tipo_documento: documentoExistente.tipo_documento,
          empleado: `${documentoExistente.empleado.nombre} ${documentoExistente.empleado.apellido}`,
          empleado_documento: documentoExistente.empleado.documento
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
      const documento = await this.prisma.documentos_empleado.findUnique({
        where: { id: id },
        include: {
          empleado: {
            select: {
              nombre: true,
              apellido: true,
              documento: true
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

  /**
   * Obtener tipos de documentos disponibles
   * Acceso: Todos los roles autenticados
   */
  getTiposDocumento = async (req: Request, res: Response) => {
    try {
      const tiposDocumento = [
        {
          valor: 'HV',
          descripcion: 'Hoja de Vida',
          ejemplo: 'CV_Juan_Perez.pdf'
        },
        {
          valor: 'LICENCIAS',
          descripcion: 'Licencias y Permisos',
          ejemplo: 'Licencia_Conducir_Juan_Perez.pdf'
        },
        {
          valor: 'CONTRATO',
          descripcion: 'Contratos Laborales',
          ejemplo: 'Contrato_2025_Juan_Perez.pdf'
        },
        {
          valor: 'SOPORTE_MEDICO',
          descripcion: 'Soportes Médicos',
          ejemplo: 'Certificado_Medico_Juan_Perez.pdf'
        }
      ];

      return res.status(200).json({
        success: true,
        message: 'Tipos de documento obtenidos exitosamente',
        data: tiposDocumento
      });

    } catch (error) {
      logger.error('Error al obtener tipos de documento:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  /**
   * Obtener estadísticas de documentos por empleado
   * Acceso: Todos los roles autenticados
   */
  getEstadisticasDocumentos = async (req: Request, res: Response) => {
    try {
      const empleado_id = req.query.empleado_id as string;

      let where: any = {};
      if (empleado_id) {
        // Verificar que el empleado existe
        const empleadoExistente = await this.prisma.empleado.findUnique({
          where: { id: empleado_id }
        });

        if (!empleadoExistente) {
          return res.status(404).json({
            success: false,
            message: 'Empleado no encontrado',
            error: 'Not Found'
          });
        }

        where.empleado_id = empleado_id;
      }

      // Obtener estadísticas generales
      const [
        totalDocumentos,
        documentosPorTipo,
        documentosRecientes
      ] = await Promise.all([
        this.prisma.documentos_empleado.count({ where }),
        this.prisma.documentos_empleado.groupBy({
          by: ['tipo_documento'],
          where,
          _count: {
            tipo_documento: true
          }
        }),
        this.prisma.documentos_empleado.findMany({
          where,
          take: 5,
          orderBy: { created_at: 'desc' },
          include: {
            empleado: {
              select: {
                nombre: true,
                apellido: true,
                documento: true
              }
            }
          }
        })
      ]);

      // Procesar estadísticas por tipo
      const estadisticasPorTipo = documentosPorTipo.map(item => ({
        tipo: item.tipo_documento,
        cantidad: item._count.tipo_documento,
        porcentaje: totalDocumentos > 0 ? 
          ((item._count.tipo_documento / totalDocumentos) * 100).toFixed(2) : '0.00'
      }));

      return res.status(200).json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: {
          total_documentos: totalDocumentos,
          documentos_por_tipo: estadisticasPorTipo,
          documentos_recientes: documentosRecientes,
          empleado_filtrado: empleado_id ? true : false
        }
      });

    } catch (error) {
      logger.error('Error al obtener estadísticas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };
}