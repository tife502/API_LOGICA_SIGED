import { Request, Response } from 'express';
import PrismaConnection from '../../prisma/prisma.connection';
import { logger } from '../../config';
import { ICreateSuplencia, IUpdateSuplencia, SuplenciasJornada } from '../../domain/interfaces';

export class SuplenciaController {
  private prisma: PrismaConnection;

  constructor() {
    this.prisma = PrismaConnection.getInstance();
  }

  // Obtener tipos de jornada disponibles
  public getJornadasDisponibles = async (req: Request, res: Response): Promise<void> => {
    try {

      const jornadas = [
        {
          valor: 'ma_ana',
          descripcion: 'Mañana',
          ejemplo: 'Suplencia de 7:00 AM a 12:00 PM'
        },
        {
          valor: 'tarde',
          descripcion: 'Tarde',
          ejemplo: 'Suplencia de 12:00 PM a 6:00 PM'
        },
        {
          valor: 'sabatina',
          descripcion: 'Sabatina',
          ejemplo: 'Suplencia de 7:00 AM a 12:00 PM los sábados'
        }
      ];

      res.status(200).json({
        success: true,
        message: 'Jornadas disponibles obtenidas exitosamente',
        data: jornadas
      });

    } catch (error) {
      logger.error('Error al obtener jornadas de suplencias:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  // Crear nueva suplencia
  public createSuplencia = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        docente_ausente_id,
        causa_ausencia,
        fecha_inicio_ausencia,
        fecha_fin_ausencia,
        sede_id,
        docente_reemplazo_id,
        fecha_inicio_reemplazo,
        fecha_fin_reemplazo,
        horas_cubiertas,
        jornada,
        observacion
      }: ICreateSuplencia = req.body;

      // Validar datos requeridos
      if (!docente_ausente_id || !causa_ausencia || !fecha_inicio_ausencia || 
          !fecha_fin_ausencia || !sede_id || !docente_reemplazo_id || 
          !fecha_inicio_reemplazo || !fecha_fin_reemplazo || !horas_cubiertas || !jornada) {
        logger.warn('Faltan datos requeridos para crear suplencia');
        res.status(400).json({
          success: false,
          message: 'Faltan datos requeridos: docente_ausente_id, causa_ausencia, fecha_inicio_ausencia, fecha_fin_ausencia, sede_id, docente_reemplazo_id, fecha_inicio_reemplazo, fecha_fin_reemplazo, horas_cubiertas, jornada',
          error: 'Validation Error'
        });
        return;
      }

      // Validar jornada
      const jornadasValidas = ['ma_ana', 'tarde', 'sabatina'];
      if (!jornadasValidas.includes(jornada)) {
        logger.warn('Jornada inválida:', jornada);
        res.status(400).json({
          success: false,
          message: 'Jornada inválida. Valores permitidos: ma_ana, tarde, sabatina',
          error: 'Validation Error'
        });
        return;
      }

      // Validar que las fechas sean coherentes
      const inicioAusencia = new Date(fecha_inicio_ausencia);
      const finAusencia = new Date(fecha_fin_ausencia);
      const inicioReemplazo = new Date(fecha_inicio_reemplazo);
      const finReemplazo = new Date(fecha_fin_reemplazo);

      if (inicioAusencia >= finAusencia) {
        res.status(400).json({
          success: false,
          message: 'La fecha de inicio de ausencia debe ser anterior a la fecha de fin',
          error: 'Validation Error'
        });
        return;
      }

      if (inicioReemplazo >= finReemplazo) {
        res.status(400).json({
          success: false,
          message: 'La fecha de inicio de reemplazo debe ser anterior a la fecha de fin',
          error: 'Validation Error'
        });
        return;
      }

      // Validar que los empleados existan
      const docenteAusente = await this.prisma.empleado.findUnique({
        where: { id: docente_ausente_id }
      });

      if (!docenteAusente) {
        logger.warn('Docente ausente no encontrado:', docente_ausente_id);
        res.status(404).json({
          success: false,
          message: 'Docente ausente no encontrado',
          error: 'Not Found'
        });
        return;
      }

      const docenteReemplazo = await this.prisma.empleado.findUnique({
        where: { id: docente_reemplazo_id }
      });

      if (!docenteReemplazo) {
        logger.warn('Docente de reemplazo no encontrado:', docente_reemplazo_id);
        res.status(404).json({
          success: false,
          message: 'Docente de reemplazo no encontrado',
          error: 'Not Found'
        });
        return;
      }

      // Validar que la sede exista
      const sede = await this.prisma.sede.findUnique({
        where: { id: sede_id }
      });

      if (!sede) {
        logger.warn('Sede no encontrada:', sede_id);
        res.status(404).json({
          success: false,
          message: 'Sede no encontrada',
          error: 'Not Found'
        });
        return;
      }

      // Validar que no sea el mismo docente
      if (docente_ausente_id === docente_reemplazo_id) {
        res.status(400).json({
          success: false,
          message: 'El docente ausente y el docente de reemplazo no pueden ser la misma persona',
          error: 'Validation Error'
        });
        return;
      }

      // Validar horas cubiertas
      if (horas_cubiertas <= 0 || horas_cubiertas > 24) {
        res.status(400).json({
          success: false,
          message: 'Las horas cubiertas deben ser mayor a 0 y menor o igual a 24',
          error: 'Validation Error'
        });
        return;
      }

      // Crear suplencia
      const nuevaSuplencia = await this.prisma.suplencias.create({
        data: {
          docente_ausente_id,
          causa_ausencia,
          fecha_inicio_ausencia: inicioAusencia,
          fecha_fin_ausencia: finAusencia,
          sede_id,
          docente_reemplazo_id,
          fecha_inicio_reemplazo: inicioReemplazo,
          fecha_fin_reemplazo: finReemplazo,
          horas_cubiertas,
          jornada: jornada as any,
          observacion
        } as any,
        include: {
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

      res.status(201).json({
        success: true,
        message: 'Suplencia creada exitosamente',
        data: nuevaSuplencia
      });

    } catch (error) {
      logger.error('Error al crear suplencia:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  // Obtener suplencias con filtros y paginación
  public getSuplencias = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = '1',
        limit = '10',
        search,
        docente_ausente_id,
        docente_reemplazo_id,
        sede_id,
        jornada,
        fecha_inicio,
        fecha_fin,
        causa_ausencia
      } = req.query;

      const pageNumber = Math.max(1, parseInt(page as string));
      const limitNumber = Math.min(50, Math.max(1, parseInt(limit as string)));
      const skip = (pageNumber - 1) * limitNumber;

      // Construir filtros
      const where: any = {};

      if (docente_ausente_id) {
        where.docente_ausente_id = docente_ausente_id;
      }

      if (docente_reemplazo_id) {
        where.docente_reemplazo_id = docente_reemplazo_id;
      }

      if (sede_id) {
        where.sede_id = sede_id;
      }

      if (jornada) {
        where.jornada = jornada;
      }

      if (causa_ausencia) {
        where.causa_ausencia = {
          contains: causa_ausencia as string,
          mode: 'insensitive'
        };
      }

      // Filtros de fecha
      if (fecha_inicio && fecha_fin) {
        where.AND = [
          {
            fecha_inicio_ausencia: {
              gte: new Date(fecha_inicio as string)
            }
          },
          {
            fecha_fin_ausencia: {
              lte: new Date(fecha_fin as string)
            }
          }
        ];
      } else if (fecha_inicio) {
        where.fecha_inicio_ausencia = {
          gte: new Date(fecha_inicio as string)
        };
      } else if (fecha_fin) {
        where.fecha_fin_ausencia = {
          lte: new Date(fecha_fin as string)
        };
      }

      // Búsqueda general
      if (search) {
        where.OR = [
          {
            causa_ausencia: {
              contains: search as string,
              mode: 'insensitive'
            }
          },
          {
            observacion: {
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
                },
                {
                  documento: {
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
                },
                {
                  documento: {
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
        ];
      }

      // Obtener suplencias y contar total
      const [suplencias, totalItems] = await Promise.all([
        this.prisma.suplencias.findMany({
          where,
          skip,
          take: limitNumber,
          orderBy: {
            created_at: 'desc'
          },
          include: {
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
            },
            _count: {
              select: {
                documentos_suplencia: true
              }
            }
          }
        }),
        this.prisma.suplencias.count({ where })
      ]);

      const totalPages = Math.ceil(totalItems / limitNumber);

      res.status(200).json({
        success: true,
        message: 'Suplencias obtenidas exitosamente',
        data: suplencias,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalItems,
          itemsPerPage: limitNumber,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1
        }
      });

    } catch (error) {
      logger.error('Error al obtener suplencias:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  // Obtener suplencia por ID
  public getSuplenciaById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const suplencia = await this.prisma.suplencias.findUnique({
        where: { id },
        include: {
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
          },
          documentos_suplencia: {
            select: {
              id: true,
              nombre: true,
              ruta_relativa: true,
              created_at: true
            },
            orderBy: {
              created_at: 'desc'
            }
          }
        }
      });

      if (!suplencia) {
        logger.warn('Suplencia no encontrada:', id);
        res.status(404).json({
          success: false,
          message: 'Suplencia no encontrada',
          error: 'Not Found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Suplencia obtenida exitosamente',
        data: suplencia
      });

    } catch (error) {
      logger.error('Error al obtener suplencia por ID:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  // Obtener suplencias por docente
  public getSuplenciasByDocente = async (req: Request, res: Response): Promise<void> => {
    try {
      const { empleado_id } = req.params;
      const { tipo = 'todas', incluir_documentos = 'false' } = req.query;

      // Validar que el empleado exista
      const empleado = await this.prisma.empleado.findUnique({
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

      if (!empleado) {
        logger.warn('Empleado no encontrado:', empleado_id);
        res.status(404).json({
          success: false,
          message: 'Empleado no encontrado',
          error: 'Not Found'
        });
        return;
      }

      // Construir filtros según el tipo
      let where: any = {};
      
      if (tipo === 'ausencias') {
        where = { docente_ausente_id: empleado_id };
      } else if (tipo === 'reemplazos') {
        where = { docente_reemplazo_id: empleado_id };
      } else {
        // Todas las suplencias donde participa
        where = {
          OR: [
            { docente_ausente_id: empleado_id },
            { docente_reemplazo_id: empleado_id }
          ]
        };
      }

      const includeConfig: any = {
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
        },
        _count: {
          select: {
            documentos_suplencia: true
          }
        }
      };

      if (incluir_documentos === 'true') {
        includeConfig.documentos_suplencia = {
          select: {
            id: true,
            nombre: true,
            created_at: true
          },
          orderBy: {
            created_at: 'desc'
          }
        };
      }

      const suplencias = await this.prisma.suplencias.findMany({
        where,
        orderBy: {
          fecha_inicio_ausencia: 'desc'
        },
        include: includeConfig
      });

      // Agrupar por tipo de participación
      const ausencias = suplencias.filter((s: any) => s.docente_ausente_id === empleado_id);
      const reemplazos = suplencias.filter((s: any) => s.docente_reemplazo_id === empleado_id);

      res.status(200).json({
        success: true,
        message: 'Suplencias obtenidas exitosamente',
        data: suplencias,
        suplencias_agrupadas: {
          ausencias,
          reemplazos
        },
        empleado,
        resumen: {
          total_suplencias: suplencias.length,
          total_ausencias: ausencias.length,
          total_reemplazos: reemplazos.length,
          horas_totales_ausencias: ausencias.reduce((total: number, sup: any) => total + Number(sup.horas_cubiertas), 0),
          horas_totales_reemplazos: reemplazos.reduce((total: number, sup: any) => total + Number(sup.horas_cubiertas), 0)
        }
      });

    } catch (error) {
      logger.error('Error al obtener suplencias por docente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  // Actualizar suplencia
  public updateSuplencia = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: IUpdateSuplencia = req.body;


      // Verificar que la suplencia existe
      const suplenciaExistente = await this.prisma.suplencias.findUnique({
        where: { id }
      });

      if (!suplenciaExistente) {
        logger.warn('Suplencia no encontrada para actualizar:', id);
        res.status(404).json({
          success: false,
          message: 'Suplencia no encontrada',
          error: 'Not Found'
        });
        return;
      }

      // Validar jornada si se está actualizando
      if (updateData.jornada) {
        const jornadasValidas = ['ma_ana', 'tarde', 'sabatina'];
        if (!jornadasValidas.includes(updateData.jornada as string)) {
          res.status(400).json({
            success: false,
            message: 'Jornada inválida. Valores permitidos: ma_ana, tarde, sabatina',
            error: 'Validation Error'
          });
          return;
        }
      }

      // Validar fechas si se están actualizando
      if (updateData.fecha_inicio_ausencia && updateData.fecha_fin_ausencia) {
        const inicio = new Date(updateData.fecha_inicio_ausencia);
        const fin = new Date(updateData.fecha_fin_ausencia);
        if (inicio >= fin) {
          res.status(400).json({
            success: false,
            message: 'La fecha de inicio de ausencia debe ser anterior a la fecha de fin',
            error: 'Validation Error'
          });
          return;
        }
      }

      if (updateData.fecha_inicio_reemplazo && updateData.fecha_fin_reemplazo) {
        const inicio = new Date(updateData.fecha_inicio_reemplazo);
        const fin = new Date(updateData.fecha_fin_reemplazo);
        if (inicio >= fin) {
          res.status(400).json({
            success: false,
            message: 'La fecha de inicio de reemplazo debe ser anterior a la fecha de fin',
            error: 'Validation Error'
          });
          return;
        }
      }

      // Validar horas cubiertas
      if (updateData.horas_cubiertas !== undefined) {
        if (updateData.horas_cubiertas <= 0 || updateData.horas_cubiertas > 24) {
          res.status(400).json({
            success: false,
            message: 'Las horas cubiertas deben ser mayor a 0 y menor o igual a 24',
            error: 'Validation Error'
          });
          return;
        }
      }

      // Validar que no sea el mismo docente
      if (updateData.docente_ausente_id && updateData.docente_reemplazo_id) {
        if (updateData.docente_ausente_id === updateData.docente_reemplazo_id) {
          res.status(400).json({
            success: false,
            message: 'El docente ausente y el docente de reemplazo no pueden ser la misma persona',
            error: 'Validation Error'
          });
          return;
        }
      }

      // Preparar datos para actualizar
      const dataToUpdate: any = {};
      
      if (updateData.docente_ausente_id) dataToUpdate.docente_ausente_id = updateData.docente_ausente_id;
      if (updateData.causa_ausencia) dataToUpdate.causa_ausencia = updateData.causa_ausencia;
      if (updateData.fecha_inicio_ausencia) dataToUpdate.fecha_inicio_ausencia = new Date(updateData.fecha_inicio_ausencia);
      if (updateData.fecha_fin_ausencia) dataToUpdate.fecha_fin_ausencia = new Date(updateData.fecha_fin_ausencia);
      if (updateData.sede_id) dataToUpdate.sede_id = updateData.sede_id;
      if (updateData.docente_reemplazo_id) dataToUpdate.docente_reemplazo_id = updateData.docente_reemplazo_id;
      if (updateData.fecha_inicio_reemplazo) dataToUpdate.fecha_inicio_reemplazo = new Date(updateData.fecha_inicio_reemplazo);
      if (updateData.fecha_fin_reemplazo) dataToUpdate.fecha_fin_reemplazo = new Date(updateData.fecha_fin_reemplazo);
      if (updateData.horas_cubiertas !== undefined) dataToUpdate.horas_cubiertas = updateData.horas_cubiertas;
      if (updateData.jornada) dataToUpdate.jornada = updateData.jornada;
      if (updateData.observacion !== undefined) dataToUpdate.observacion = updateData.observacion;

      // Actualizar suplencia
      const suplenciaActualizada = await this.prisma.suplencias.update({
        where: { id },
        data: dataToUpdate,
        include: {
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

      res.status(200).json({
        success: true,
        message: 'Suplencia actualizada exitosamente',
        data: suplenciaActualizada
      });
    } catch (error) {
      logger.error('Error al actualizar suplencia:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  // Eliminar suplencia (solo super_admin)
  public deleteSuplencia = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userRole = (req as any).user?.rol;

      // Verificar permisos
      if (userRole !== 'super_admin') {
        logger.warn('Usuario sin permisos para eliminar suplencia', { userRole });
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar suplencias',
          error: 'Forbidden'
        });
        return;
      }

      // Verificar que la suplencia existe
      const suplenciaExistente = await this.prisma.suplencias.findUnique({
        where: { id },
        include: {
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
          },
          sede: {
            select: {
              nombre: true
            }
          }
        }
      });

      if (!suplenciaExistente) {
        logger.warn('Suplencia no encontrada para eliminar:', id);
        res.status(404).json({
          success: false,
          message: 'Suplencia no encontrada',
          error: 'Not Found'
        });
        return;
      }

      // Eliminar suplencia (Prisma eliminará automáticamente los documentos relacionados por CASCADE)
      await this.prisma.suplencias.delete({
        where: { id }
      });

      res.status(200).json({
        success: true,
        message: 'Suplencia eliminada exitosamente',
        data: {
          id,
          causa_ausencia: suplenciaExistente.causa_ausencia,
          docente_ausente: `${suplenciaExistente.empleado_suplencias_docente_ausente_idToempleado.nombre} ${suplenciaExistente.empleado_suplencias_docente_ausente_idToempleado.apellido}`,
          docente_reemplazo: `${suplenciaExistente.empleado_suplencias_docente_reemplazo_idToempleado.nombre} ${suplenciaExistente.empleado_suplencias_docente_reemplazo_idToempleado.apellido}`,
          sede: suplenciaExistente.sede.nombre
        }
      });

    } catch (error) {
      logger.error('Error al eliminar suplencia:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };

  // Obtener estadísticas de suplencias
  public getEstadisticasSuplencias = async (req: Request, res: Response): Promise<void> => {
    try {
      const { empleado_id, sede_id, año } = req.query;

      // Construir filtros
      const where: any = {};
      
      if (empleado_id) {
        where.OR = [
          { docente_ausente_id: empleado_id },
          { docente_reemplazo_id: empleado_id }
        ];
      }

      if (sede_id) {
        where.sede_id = sede_id;
      }

      if (año) {
        const year = parseInt(año as string);
        where.fecha_inicio_ausencia = {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`)
        };
      }

      // Obtener estadísticas generales
      const [
        totalSuplencias,
        suplenciasPorJornada,
        suplenciasRecientes,
        horasTotales
      ] = await Promise.all([
        this.prisma.suplencias.count({ where }),
        this.prisma.suplencias.groupBy({
          by: ['jornada'],
          where,
          _count: true,
          _sum: {
            horas_cubiertas: true
          }
        }),
        this.prisma.suplencias.findMany({
          where,
          take: 10,
          orderBy: {
            created_at: 'desc'
          },
          include: {
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
            },
            sede: {
              select: {
                nombre: true
              }
            }
          }
        }),
        this.prisma.suplencias.aggregate({
          where,
          _sum: {
            horas_cubiertas: true
          }
        })
      ]);

      // Formatear estadísticas por jornada
      const estadisticasPorJornada = suplenciasPorJornada.map((stat: any) => ({
        jornada: stat.jornada,
        cantidad: stat._count,
        horas_totales: Number(stat._sum.horas_cubiertas || 0),
        porcentaje: totalSuplencias > 0 ? ((stat._count / totalSuplencias) * 100).toFixed(2) : '0.00'
      }));

      res.status(200).json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: {
          total_suplencias: totalSuplencias,
          horas_totales_cubiertas: Number(horasTotales._sum.horas_cubiertas || 0),
          suplencias_por_jornada: estadisticasPorJornada,
          suplencias_recientes: suplenciasRecientes,
          empleado_filtrado: !!empleado_id,
          sede_filtrada: !!sede_id,
          año_filtrado: año || null
        }
      });
    } catch (error) {
      logger.error('Error al obtener estadísticas de suplencias:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'Internal Server Error'
      });
    }
  };
}