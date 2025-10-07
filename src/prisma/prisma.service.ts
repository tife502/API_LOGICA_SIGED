import PrismaConnection from './prisma.connection';
import { logger } from '../config';
import { PrismaInterfaces} from '../domain';
import { PrismaClient } from '@prisma/client';

class PrismaService {
  private static instance: PrismaService;
  private prisma: PrismaClient; // ✅ Usar PrismaClient como tipo

  private constructor() {
    this.prisma = PrismaConnection.getInstance();
  }

  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  // ============= MÉTODOS DE EMPLEADOS =============
  
  async createEmpleado(data: PrismaInterfaces.ICreateEmpleado) {
    try {
      logger.info('Creando nuevo empleado', { data });
      return await this.prisma.empleado.create({
        data
      });
    } catch (error) {
      logger.error('Error creando empleado', error);
      throw error;
    }
  }

  async getEmpleados(
    filters?: PrismaInterfaces.IEmpleadoFilters, 
    pagination?: PrismaInterfaces.IPaginationOptions,
    includeInactive: boolean = false // Nuevo parámetro para incluir inactivos
  ): Promise<PrismaInterfaces.IPaginatedResponse<any>> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const skip = (page - 1) * limit;
      const orderBy = pagination?.orderBy || 'created_at';
      const orderDirection = pagination?.orderDirection || 'desc';

      // Construir el where con filtros
      const where: any = {};

      // Por defecto, solo traer empleados activos
      if (!includeInactive) {
        where.estado = PrismaInterfaces.EmpleadoEstado.activo;
      }

      // Aplicar filtros adicionales
      if (filters) {
        if (filters.tipo_documento) where.tipo_documento = filters.tipo_documento;
        if (filters.documento) where.documento = { contains: filters.documento };
        if (filters.nombre) where.nombre = { contains: filters.nombre };
        if (filters.apellido) where.apellido = { contains: filters.apellido };
        if (filters.email) where.email = { contains: filters.email };
        if (filters.cargo) where.cargo = filters.cargo;
        
        // Solo aplicar filtro de estado si se especifica explícitamente
        if (filters.estado && includeInactive) {
          where.estado = filters.estado;
        }
        
        if (filters.sede_id) {
          where.asignaciones = {
            some: {
              sede_id: filters.sede_id,
              estado: 'activa'
            }
          };
        }
      }

      const [empleados, total] = await Promise.all([
        this.prisma.empleado.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [orderBy]: orderDirection },
          include: {
            asignacion_empleado: {
              where: { estado: 'activa' },
              include: { sede: true }
            },
            documentos_empleado: true
          }
        }),
        this.prisma.empleado.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      logger.info(`Empleados obtenidos: ${empleados.length} de ${total}`, {
        filters,
        pagination,
        includeInactive
      });

      return {
        data: empleados,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      logger.error('Error obteniendo empleados', error);
      throw error;
    }
  }

  async getEmpleadosInactivos(
    filters?: PrismaInterfaces.IEmpleadoFilters, 
    pagination?: PrismaInterfaces.IPaginationOptions
  ): Promise<PrismaInterfaces.IPaginatedResponse<any>> {
    const inactiveFilters = { ...filters, estado: PrismaInterfaces.EmpleadoEstado.inactivo };
    return this.getEmpleados(inactiveFilters, pagination, true);
  }

  async getEmpleadoById(id: string) {
    try {
      logger.info('Obteniendo empleado por ID', { id });
      return await this.prisma.empleado.findUnique({
        where: { id },
        include: {
          asignacion_empleado: {
            include: { sede: true }
          },
          informacion_academica: true,
          documentos_empleado: true,
          horas_extra: {
            include: { sede: true }
          },
          comentario_empleado: {
            include: { usuario: true }
          }
        }
      });
    } catch (error) {
      logger.error('Error obteniendo empleado por ID', error);
      throw error;
    }
  }

  async updateEmpleado(id: string, data: PrismaInterfaces.IUpdateEmpleado) {
    try {
      logger.info('Actualizando empleado', { id, data });
      return await this.prisma.empleado.update({
        where: { id },
        data
      });
    } catch (error) {
      logger.error('Error actualizando empleado', error);
      throw error;
    }
  }

    // Método para reactivar empleado
  async reactivarEmpleado(id: string) {
    try {
      logger.info(`Reactivando empleado: ${id}`);
      
      const empleado = await this.prisma.empleado.update({
        where: { id },
        data: { estado: PrismaInterfaces.EmpleadoEstado.activo },
        include: {
          asignacion_empleado: {
            where: { estado: 'activa' },
            include: { sede: true }
          }
        }
      });

      logger.info(`Empleado reactivado exitosamente: ${id}`);
      return empleado;
    } catch (error) {
      logger.error(`Error reactivando empleado ${id}`, error);
      throw error;
    }
  }


  // ============= MÉTODOS DE USUARIOS =============

  async createUsuario(data: PrismaInterfaces.ICreateUsuario) {
    try {
      logger.info('Creando nuevo usuario', { data: { ...data, contrasena: '[HIDDEN]' } });
      return await this.prisma.usuario.create({
        data
      });
    } catch (error) {
      logger.error('Error creando usuario', error);
      throw error;
    }
  }

  async getUsuarios(filters?: PrismaInterfaces.IUsuarioFilters, pagination?: PrismaInterfaces.IPaginationOptions) {
    try {
      logger.info('Obteniendo usuarios', { filters, pagination });
      
      const where: any = {};
      if (filters) {
        if (filters.tipo_documento) where.tipo_documento = filters.tipo_documento;
        if (filters.documento) where.documento = { contains: filters.documento };
        if (filters.nombre) where.nombre = { contains: filters.nombre };
        if (filters.apellido) where.apellido = { contains: filters.apellido };
        if (filters.email) where.email = { contains: filters.email };
        if (filters.rol) where.rol = filters.rol;
        if (filters.estado) where.estado = filters.estado;
      }

      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const skip = (page - 1) * limit;

      const [usuarios, total] = await Promise.all([
        this.prisma.usuario.findMany({
          where,
          skip,
          take: limit,
          orderBy: pagination?.orderBy ? {
            [pagination.orderBy]: pagination.orderDirection || 'asc'
          } : { created_at: 'desc' },
          select: {
            id: true,
            tipo_documento: true,
            documento: true,
            nombre: true,
            apellido: true,
            email: true,
            celular: true,
            rol: true,
            estado: true,
            created_at: true,
            updated_at: true,
            reset_password_expires: true,
            reset_password_token: true
          }
        }),
        this.prisma.usuario.count({ where })
      ]);

      return {
        data: usuarios,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      } as PrismaInterfaces.IPaginatedResponse<any>;
    } catch (error) {
      logger.error('Error obteniendo usuarios', error);
      throw error;
    }
  }

  async getUsuarioById(id: string) {
    try {
      logger.info('Obteniendo usuario por ID', { id });
      return await this.prisma.usuario.findUnique({
        where: { id },
        select: {
          id: true,
          tipo_documento: true,
          documento: true,
          nombre: true,
          apellido: true,
          email: true,
          celular: true,
          rol: true,
          estado: true,
          created_at: true,
          updated_at: true,
          comentario_empleado: true,
          comentario_sede: true
          // Excluir contraseña
        }
      });
    } catch (error) {
      logger.error('Error obteniendo usuario por ID', error);
      throw error;
    }
  }

  async getUsuarioByEmail(email: string) {
    try {
      logger.info('Obteniendo usuario por email', { email });
      return await this.prisma.usuario.findUnique({
        where: { email },
        select: {
          id: true,
          tipo_documento: true,
          documento: true,
          nombre: true,
          apellido: true,
          email: true,
          celular: true,
          contrasena: true, // Incluir contraseña para autenticación
          rol: true,
          estado: true,
          created_at: true,
          updated_at: true,
          comentario_empleado: true,
          comentario_sede: true
        }
      });
    } catch (error) {
      logger.error('Error obteniendo usuario por email', error);
      throw error;
    }
  }

  async updateUsuario(id: string, data: PrismaInterfaces.IUpdateUsuario) {
    try {
      logger.info('Actualizando usuario', { id, data: { ...data, contrasena: data.contrasena ? '[HIDDEN]' : undefined } });
      return await this.prisma.usuario.update({
        where: { id },
        data
      });
    } catch (error) {
      logger.error('Error actualizando usuario', error);
      throw error;
    }
  }

  // ============= MÉTODOS DE SEDES =============

  async createSede(data: PrismaInterfaces.ICreateSede) {
    try {
      logger.info('Creando nueva sede', { data });
      return await this.prisma.sede.create({
        data
      });
    } catch (error) {
      logger.error('Error creando sede', error);
      throw error;
    }
  }

  async getSedes(filters?: PrismaInterfaces.ISedeFilters, pagination?: PrismaInterfaces.IPaginationOptions) {
    try {
      logger.info('Obteniendo sedes', { filters, pagination });
      
      const where: any = {};
      if (filters) {
        if (filters.nombre) where.nombre = { contains: filters.nombre };
        if (filters.estado) where.estado = filters.estado;
        if (filters.zona) where.zona = filters.zona;
        if (filters.codigo_DANE) where.codigo_DANE = { contains: filters.codigo_DANE };
      }

      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const skip = (page - 1) * limit;

      const [sedes, total] = await Promise.all([
        this.prisma.sede.findMany({
          where,
          skip,
          take: limit,
          orderBy: pagination?.orderBy ? {
            [pagination.orderBy]: pagination.orderDirection || 'asc'
          } : { created_at: 'desc' },
          include: {
            asignacion_empleado: {
              include: { empleado: true }
            },
            sede_ie: {
              include: { institucion_educativa: true }
            }
          }
        }),
        this.prisma.sede.count({ where })
      ]);

      return {
        data: sedes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      } as PrismaInterfaces.IPaginatedResponse<any>;
    } catch (error) {
      logger.error('Error obteniendo sedes', error);
      throw error;
    }
  }

  async getSedeById(id: string) {
    try {
      logger.info('Obteniendo sede por ID', { id });
      return await this.prisma.sede.findFirst({
        where: { id },
        include: {
          asignacion_empleado: {
            include: { 
              empleado: {
                select: { id: true, nombre: true, apellido: true, cargo: true, documento: true }
              }
            }
          },
          sede_ie: {
            include: { 
              institucion_educativa: true
            }
          },
          sede_jornada: {
            include: {
              jornada: {
                select: { id: true, nombre: true }
              }
            }
          },
          comentario_sede: {
            include: {
              usuario: {
                select: { id: true, nombre: true, apellido: true }
              }
            },
            orderBy: { created_at: 'desc' }
          }
        }
      });
    } catch (error) {
      logger.error('Error obteniendo sede por ID', error);
      throw error;
    }
  }

  async updateSede(id: string, data: PrismaInterfaces.IUpdateSede) {
    try {
      logger.info('Actualizando sede', { id, data });
      return await this.prisma.sede.update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date()
        }
      });
    } catch (error) {
      logger.error('Error actualizando sede', error);
      throw error;
    }
  }

  async deleteSede(id: string) {
    try {
      logger.info('Eliminando sede (borrado físico)', { id });
      // Verificar si tiene relaciones activas
      const asignacionesActivas = await this.prisma.asignacion_empleado.findFirst({
        where: {
          sede_id: id,
          estado: 'activa'
        }
      });

      if (asignacionesActivas) {
        throw new Error('No se puede eliminar la sede porque tiene empleados asignados activos');
      }

      // Eliminar físicamente
      return await this.prisma.sede.delete({
        where: { id }
      });
    } catch (error) {
      logger.error('Error eliminando sede', error);
      throw error;
    }
  }

  async getComentariosSede(filters?: PrismaInterfaces.IComentarioSedeFilters, pagination?: PrismaInterfaces.IPaginationOptions) {
    try {
      logger.info('Obteniendo comentarios de sede', { filters, pagination });
      
      const where: any = {};
      if (filters) {
        if (filters.sede_id) where.sede_id = filters.sede_id;
        if (filters.usuario_id) where.usuario_id = filters.usuario_id;
      }

      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const skip = (page - 1) * limit;

      const [comentarios, total] = await Promise.all([
        this.prisma.comentario_sede.findMany({
          where,
          skip,
          take: limit,
          orderBy: pagination?.orderBy ? {
            [pagination.orderBy]: pagination.orderDirection || 'asc'
          } : { created_at: 'desc' },
          include: {
            usuario: {
              select: { id: true, nombre: true, apellido: true, email: true }
            },
            sede: {
              select: { id: true, nombre: true }
            }
          }
        }),
        this.prisma.comentario_sede.count({ where })
      ]);

      return {
        data: comentarios,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      } as PrismaInterfaces.IPaginatedResponse<any>;
    } catch (error) {
      logger.error('Error obteniendo comentarios de sede', error);
      throw error;
    }
  }

  async updateComentarioSede(id: string, data: PrismaInterfaces.IUpdateComentarioSede) {
    try {
      logger.info('Actualizando comentario de sede', { id, data });
      return await this.prisma.comentario_sede.update({
        where: { id },
        data,
        include: {
          usuario: {
            select: { id: true, nombre: true, apellido: true }
          },
          sede: {
            select: { id: true, nombre: true }
          }
        }
      });
    } catch (error) {
      logger.error('Error actualizando comentario de sede', error);
      throw error;
    }
  }

  async deleteComentarioSede(id: string) {
    try {
      logger.info('Eliminando comentario de sede', { id });
      return await this.prisma.comentario_sede.delete({
        where: { id }
      });
    } catch (error) {
      logger.error('Error eliminando comentario de sede', error);
      throw error;
    }
  }

  // ============= MÉTODOS DE ASIGNACIONES EMPLEADO-SEDE =============

  async createAsignacionEmpleado(data: PrismaInterfaces.ICreateAsignacionEmpleado) {
    try {
      logger.info('Creando asignación empleado-sede', { data });
      return await this.prisma.asignacion_empleado.create({
        data,
        include: {
          empleado: {
            select: { id: true, nombre: true, apellido: true, cargo: true, documento: true }
          },
          sede: {
            select: { id: true, nombre: true, direccion: true }
          }
        }
      });
    } catch (error) {
      logger.error('Error creando asignación empleado-sede', error);
      throw error;
    }
  }

  async getAsignacionesEmpleado(filters?: PrismaInterfaces.IAsignacionEmpleadoFilters, pagination?: PrismaInterfaces.IPaginationOptions) {
    try {
      logger.info('Obteniendo asignaciones empleado-sede', { filters, pagination });
      
      const where: any = {};
      if (filters) {
        if (filters.empleado_id) where.empleado_id = filters.empleado_id;
        if (filters.sede_id) where.sede_id = filters.sede_id;
        if (filters.estado) where.estado = filters.estado;
        if (filters.fecha_asignacion) where.fecha_asignacion = filters.fecha_asignacion;
      }

      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const skip = (page - 1) * limit;

      const [asignaciones, total] = await Promise.all([
        this.prisma.asignacion_empleado.findMany({
          where,
          skip,
          take: limit,
          orderBy: pagination?.orderBy ? {
            [pagination.orderBy]: pagination.orderDirection || 'asc'
          } : { fecha_asignacion: 'desc' },
          include: {
            empleado: {
              select: { id: true, nombre: true, apellido: true, cargo: true, documento: true }
            },
            sede: {
              select: { id: true, nombre: true, direccion: true }
            }
          }
        }),
        this.prisma.asignacion_empleado.count({ where })
      ]);

      return {
        data: asignaciones,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      } as PrismaInterfaces.IPaginatedResponse<any>;
    } catch (error) {
      logger.error('Error obteniendo asignaciones empleado-sede', error);
      throw error;
    }
  }

  async updateAsignacionEmpleado(id: string, data: PrismaInterfaces.IUpdateAsignacionEmpleado) {
    try {
      logger.info('Actualizando asignación empleado-sede', { id, data });
      return await this.prisma.asignacion_empleado.update({
        where: { id },
        data,
        include: {
          empleado: {
            select: { id: true, nombre: true, apellido: true, cargo: true }
          },
          sede: {
            select: { id: true, nombre: true }
          }
        }
      });
    } catch (error) {
      logger.error('Error actualizando asignación empleado-sede', error);
      throw error;
    }
  }

  async deleteAsignacionEmpleado(id: string) {
    try {
      logger.info('Eliminando asignación empleado-sede', { id });
      return await this.prisma.asignacion_empleado.delete({
        where: { id }
      });
    } catch (error) {
      logger.error('Error eliminando asignación empleado-sede', error);
      throw error;
    }
  }

  // ============= MÉTODOS DE INSTITUCIONES EDUCATIVAS =============

  async createInstitucionEducativa(data: PrismaInterfaces.ICreateInstitucionEducativa) {
    try {
      logger.info('Creando institución educativa', { data });
      return await this.prisma.institucion_educativa.create({
        data,
        include: {
          empleado: {
            select: { id: true, nombre: true, apellido: true, documento: true }
          }
        }
      });
    } catch (error) {
      logger.error('Error creando institución educativa', error);
      throw error;
    }
  }

  async getInstitucionesEducativas(filters?: PrismaInterfaces.IInstitucionEducativaFilters, pagination?: PrismaInterfaces.IPaginationOptions) {
    try {
      logger.info('Obteniendo instituciones educativas', { filters, pagination });
      
      const where: any = {};
      if (filters) {
        if (filters.nombre) {
          where.nombre = { contains: filters.nombre, mode: 'insensitive' };
        }
        if (filters.rector_encargado_id) where.rector_encargado_id = filters.rector_encargado_id;
      }

      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const skip = (page - 1) * limit;

      const [instituciones, total] = await Promise.all([
        this.prisma.institucion_educativa.findMany({
          where,
          skip,
          take: limit,
          orderBy: pagination?.orderBy ? {
            [pagination.orderBy]: pagination.orderDirection || 'asc'
          } : { created_at: 'desc' },
          include: {
            empleado: {
              select: { id: true, nombre: true, apellido: true, documento: true, cargo: true }
            },
            sede_ie: {
              include: {
                sede: {
                  select: { id: true, nombre: true, direccion: true, zona: true }
                }
              }
            }
          }
        }),
        this.prisma.institucion_educativa.count({ where })
      ]);

      return {
        data: instituciones,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      } as PrismaInterfaces.IPaginatedResponse<any>;
    } catch (error) {
      logger.error('Error obteniendo instituciones educativas', error);
      throw error;
    }
  }

  async getInstitucionEducativaById(id: string) {
    try {
      logger.info('Obteniendo institución educativa por ID', { id });
      return await this.prisma.institucion_educativa.findUnique({
        where: { id },
        include: {
          empleado: {
            select: { id: true, nombre: true, apellido: true, documento: true, cargo: true }
          },
          sede_ie: {
            include: {
              sede: {
                select: { id: true, nombre: true, direccion: true, zona: true, codigo_DANE: true }
              }
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error obteniendo institución educativa por ID', error);
      throw error;
    }
  }

  async updateInstitucionEducativa(id: string, data: PrismaInterfaces.IUpdateInstitucionEducativa) {
    try {
      logger.info('Actualizando institución educativa', { id, data });
      return await this.prisma.institucion_educativa.update({
        where: { id },
        data,
        include: {
          empleado: {
            select: { id: true, nombre: true, apellido: true, documento: true }
          }
        }
      });
    } catch (error) {
      logger.error('Error actualizando institución educativa', error);
      throw error;
    }
  }

  async deleteInstitucionEducativa(id: string) {
    try {
      logger.info('Eliminando institución educativa', { id });
      
      // Verificar si tiene sedes asociadas
      const sedesAsociadas = await this.prisma.sede_ie.findFirst({
        where: { institucion_educativa_id: id }
      });

      if (sedesAsociadas) {
        throw new Error('No se puede eliminar la institución educativa porque tiene sedes asociadas');
      }

      return await this.prisma.institucion_educativa.delete({
        where: { id }
      });
    } catch (error) {
      logger.error('Error eliminando institución educativa', error);
      throw error;
    }
  }

  async asignarSedeInstitucionEducativa(data: PrismaInterfaces.ICreateSedeIE) {
    try {
      logger.info('Asignando sede a institución educativa', { data });
      return await this.prisma.sede_ie.create({
        data,
        include: {
          sede: {
            select: { id: true, nombre: true, direccion: true }
          },
          institucion_educativa: {
            select: { id: true, nombre: true }
          }
        }
      });
    } catch (error) {
      logger.error('Error asignando sede a institución educativa', error);
      throw error;
    }
  }

  // ============= MÉTODOS DE JORNADAS =============

  async getJornadas() {
    try {
      logger.info('Obteniendo todas las jornadas');
      return await this.prisma.jornada.findMany({
        orderBy: { nombre: 'asc' }
      });
    } catch (error) {
      logger.error('Error obteniendo jornadas', error);
      throw error;
    }
  }

  async asignarJornadaSede(data: PrismaInterfaces.ICreateSedeJornada) {
    try {
      logger.info('Asignando jornada a sede', { data });
      return await this.prisma.sede_jornada.create({
        data,
        include: {
          sede: {
            select: { id: true, nombre: true }
          },
          jornada: {
            select: { id: true, nombre: true }
          }
        }
      });
    } catch (error) {
      logger.error('Error asignando jornada a sede', error);
      throw error;
    }
  }

  async getJornadasBySede(sede_id: string) {
    try {
      logger.info('Obteniendo jornadas por sede', { sede_id });
      return await this.prisma.sede_jornada.findMany({
        where: { sede_id },
        include: {
          jornada: {
            select: { id: true, nombre: true }
          }
        },
        orderBy: { 
          jornada: { nombre: 'asc' } 
        }
      });
    } catch (error) {
      logger.error('Error obteniendo jornadas por sede', error);
      throw error;
    }
  }

  async desasignarJornadaSede(sede_id: string, jornada_id: number) {
    try {
      logger.info('Desasignando jornada de sede', { sede_id, jornada_id });
      return await this.prisma.sede_jornada.delete({
        where: {
          sede_id_jornada_id: {
            sede_id,
            jornada_id
          }
        }
      });
    } catch (error) {
      logger.error('Error desasignando jornada de sede', error);
      throw error;
    }
  }

  // ============= MÉTODOS DE HORAS EXTRA =============

  async createHorasExtra(data: PrismaInterfaces.ICreateHorasExtra) {
    try {
      logger.info('Creando registro de horas extra', { data });
      return await this.prisma.horas_extra.create({
        data: data as any
      });
    } catch (error) {
      logger.error('Error creando horas extra', error);
      throw error;
    }
  }

  async getHorasExtraByEmpleado(empleado_id: string) {
    try {
      logger.info('Obteniendo horas extra por empleado', { empleado_id });
      return await this.prisma.horas_extra.findMany({
        where: { empleado_id },
        include: {
          empleado: true,
          sede: true,
          documentos_horas_extra: true
        },
        orderBy: { fecha_realizacion: 'desc' }
      });
    } catch (error) {
      logger.error('Error obteniendo horas extra por empleado', error);
      throw error;
    }
  }

  // ============= MÉTODOS DE SUPLENCIAS =============

  async createSuplencia(data: PrismaInterfaces.ICreateSuplencia) {
    try {
      logger.info('Creando suplencia', { data });
      return await this.prisma.suplencias.create({
        data
      });
    } catch (error) {
      logger.error('Error creando suplencia', error);
      throw error;
    }
  }

  async getSuplenciasByEmpleado(empleado_id: string) {
    try {
      logger.info('Obteniendo suplencias por empleado', { empleado_id });
      return await this.prisma.suplencias.findMany({
        where: {
          OR: [
            { docente_ausente_id: empleado_id },
            { docente_reemplazo_id: empleado_id }
          ]
        },
        include: {
          empleado_suplencias_docente_ausente_idToempleado: true,
          empleado_suplencias_docente_reemplazo_idToempleado: true,
          sede: true,
          documentos_suplencia: true
        },
        orderBy: { fecha_inicio_ausencia: 'desc' }
      });
    } catch (error) {
      logger.error('Error obteniendo suplencias por empleado', error);
      throw error;
    }
  }

  // ============= MÉTODOS DE INFORMACIÓN ACADÉMICA =============

  async createInformacionAcademica(data: PrismaInterfaces.ICreateInformacionAcademica) {
    try {
      logger.info('Creando información académica', { data });
      return await this.prisma.informacion_academica.create({
        data
      });
    } catch (error) {
      logger.error('Error creando información académica', error);
      throw error;
    }
  }

  async getInformacionAcademica(
    filters?: PrismaInterfaces.IInformacionAcademicaFilters, 
    pagination?: PrismaInterfaces.IPaginationOptions
  ): Promise<PrismaInterfaces.IPaginatedResponse<any>> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const skip = (page - 1) * limit;
      const orderBy = pagination?.orderBy || 'created_at';
      const orderDirection = pagination?.orderDirection || 'desc';

      // Construir el where con filtros
      const where: any = {};

      if (filters) {
        if (filters.empleado_id) where.empleado_id = filters.empleado_id;
        if (filters.nivel_academico) where.nivel_academico = filters.nivel_academico;
        if (filters.institucion) where.institucion = { contains: filters.institucion };
        if (filters.titulo) where.titulo = { contains: filters.titulo };
        
        // Filtros por años de experiencia
        if (filters.anos_experiencia_min || filters.anos_experiencia_max) {
          where.anos_experiencia = {};
          if (filters.anos_experiencia_min) where.anos_experiencia.gte = filters.anos_experiencia_min;
          if (filters.anos_experiencia_max) where.anos_experiencia.lte = filters.anos_experiencia_max;
        }
      }

      const [informacionAcademica, total] = await Promise.all([
        this.prisma.informacion_academica.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [orderBy]: orderDirection },
          include: {
            empleado: {
              select: {
                id: true,
                documento: true,
                nombre: true,
                apellido: true,
                email: true,
                cargo: true,
                estado: true
              }
            }
          }
        }),
        this.prisma.informacion_academica.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      logger.info(`Información académica obtenida: ${informacionAcademica.length} de ${total}`, {
        filters,
        pagination
      });

      return {
        data: informacionAcademica,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      logger.error('Error obteniendo información académica', error);
      throw error;
    }
  }

  async getInformacionAcademicaByEmpleado(empleado_id: string) {
    try {
      logger.info('Obteniendo información académica por empleado', { empleado_id });
      return await this.prisma.informacion_academica.findMany({
        where: { empleado_id },
        include: { 
          empleado: {
            select: {
              id: true,
              documento: true,
              nombre: true,
              apellido: true,
              email: true,
              cargo: true,
              estado: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });
    } catch (error) {
      logger.error('Error obteniendo información académica por empleado', error);
      throw error;
    }
  }

  async getInformacionAcademicaById(id: string) {
    try {
      logger.info('Obteniendo información académica por ID', { id });
      return await this.prisma.informacion_academica.findUnique({
        where: { id },
        include: {
          empleado: {
            select: {
              id: true,
              documento: true,
              nombre: true,
              apellido: true,
              email: true,
              cargo: true,
              estado: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error obteniendo información académica por ID', error);
      throw error;
    }
  }

  async updateInformacionAcademica(id: string, data: PrismaInterfaces.IUpdateInformacionAcademica) {
    try {
      logger.info('Actualizando información académica', { id, data });
      return await this.prisma.informacion_academica.update({
        where: { id },
        data,
        include: {
          empleado: {
            select: {
              id: true,
              documento: true,
              nombre: true,
              apellido: true,
              email: true,
              cargo: true,
              estado: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error actualizando información académica', error);
      throw error;
    }
  }

  async deleteInformacionAcademica(id: string) {
    try {
      logger.info('Eliminando información académica', { id });
      return await this.prisma.informacion_academica.delete({
        where: { id },
        include: {
          empleado: {
            select: {
              id: true,
              documento: true,
              nombre: true,
              apellido: true,
              email: true,
              cargo: true,
              estado: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error eliminando información académica', error);
      throw error;
    }
  }

  async getEstadisticasNivelesAcademicos() {
    try {
      logger.info('Obteniendo estadísticas de niveles académicos');
      
      const [estadisticas, empleadosConInfo, totalEmpleadosActivos] = await Promise.all([
        this.prisma.informacion_academica.groupBy({
          by: ['nivel_academico'],
          _count: {
            nivel_academico: true
          },
          orderBy: {
            _count: {
              nivel_academico: 'desc'
            }
          }
        }),
        this.prisma.empleado.count({
          where: {
            estado: 'activo',
            informacion_academica: {
              some: {}
            }
          }
        }),
        this.prisma.empleado.count({
          where: { estado: 'activo' }
        })
      ]);

      return {
        estadisticas_por_nivel: estadisticas,
        resumen: {
          total_empleados_activos: totalEmpleadosActivos,
          empleados_con_informacion_academica: empleadosConInfo,
          empleados_sin_informacion_academica: totalEmpleadosActivos - empleadosConInfo,
          porcentaje_completitud: totalEmpleadosActivos > 0 
            ? Math.round((empleadosConInfo / totalEmpleadosActivos) * 100) 
            : 0
        }
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas de niveles académicos', error);
      throw error;
    }
  }

  // ============= MÉTODOS DE COMENTARIOS =============

  async createComentarioEmpleado(data: PrismaInterfaces.ICreateComentarioEmpleado) {
    try {
      logger.info('Creando comentario de empleado', { data });
      return await this.prisma.comentario_empleado.create({
        data,
        include: {
          empleado: true,
          usuario: true
        }
      });
    } catch (error) {
      logger.error('Error creando comentario de empleado', error);
      throw error;
    }
  }

  async createComentarioSede(data: PrismaInterfaces.ICreateComentarioSede) {
    try {
      logger.info('Creando comentario de sede', { data });
      return await this.prisma.comentario_sede.create({
        data,
        include: {
          sede: true,
          usuario: true
        }
      });
    } catch (error) {
      logger.error('Error creando comentario de sede', error);
      throw error;
    }
  }

  // ============= MÉTODO GENÉRICO PARA TRANSACCIONES =============

  async executeTransaction<T>(operations: (prisma: Omit<PrismaClient, '$on' | '$connect' | '$disconnect' | '$transaction' | '$extends'>) => Promise<T>): Promise<T> {
    try {
      logger.info('Ejecutando transacción');
      return await this.prisma.$transaction(operations);
    } catch (error) {
      logger.error('Error en transacción', error);
      throw error;
    }
  }
}

export default PrismaService;