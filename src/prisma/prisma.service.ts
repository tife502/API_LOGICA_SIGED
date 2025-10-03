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
            updated_at: true
            // Excluir contraseña
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

  // ============= MÉTODOS DE HORAS EXTRA =============

  async createHorasExtra(data: PrismaInterfaces.ICreateHorasExtra) {
    try {
      logger.info('Creando registro de horas extra', { data });
      return await this.prisma.horas_extra.create({
        data
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

  async getInformacionAcademicaByEmpleado(empleado_id: string) {
    try {
      logger.info('Obteniendo información académica por empleado', { empleado_id });
      return await this.prisma.informacion_academica.findMany({
        where: { empleado_id },
        include: { empleado: true },
        orderBy: { created_at: 'desc' }
      });
    } catch (error) {
      logger.error('Error obteniendo información académica por empleado', error);
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