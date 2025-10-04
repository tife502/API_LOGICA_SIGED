import PrismaService from '../../../prisma/prisma.service';
import { logger } from '../../../config';
import { PrismaInterfaces } from '../../../domain';
import { v4 as uuidv4 } from 'uuid';

/**
 * Servicio para flujos normales de empleados
 * Maneja la creación de empleados con asignación a una sola sede
 */
export class EmpleadoService {
  private prismaService: PrismaService;

  constructor() {
    this.prismaService = PrismaService.getInstance();
  }

  /**
   * Crear empleado normal con asignación a una sede específica
   * Flujo: Empleado -> Información Académica -> Asignación a Sede
   */
  async crearEmpleadoConSede(data: {
    // Datos del empleado
    empleado: PrismaInterfaces.ICreateEmpleado;
    informacionAcademica?: PrismaInterfaces.ICreateInformacionAcademica;
    usuarioId: string;
    // Asignación a sede
    sedeId: string;
    fechaAsignacion?: Date;
    comentario?: PrismaInterfaces.ICreateComentarioEmpleado;
  }) {
    return await this.prismaService.executeTransaction(async (prisma) => {
      logger.info('Iniciando creación de empleado con sede', { 
        empleado: data.empleado.nombre,
        sedeId: data.sedeId
      });

      // 1. Validar que la sede existe
      const sede = await prisma.sede.findUnique({
        where: { id: data.sedeId }
      });

      if (!sede) {
        throw new Error('La sede especificada no existe');
      }

      if (sede.estado !== 'activa') {
        throw new Error('No se puede asignar empleado a una sede inactiva');
      }

      // 2. Validar datos del empleado
      await this.validarDatosEmpleado(data.empleado);

      // 3. Crear empleado
      const empleado = await prisma.empleado.create({
        data: {
          ...data.empleado,
          id: uuidv4(),
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      

      // 4. Crear información académica si se proporciona
      let informacionAcademica = null;
      if (data.informacionAcademica) {
        informacionAcademica = await prisma.informacion_academica.create({
          data: {
            ...data.informacionAcademica,
            id: uuidv4(),
            empleado_id: empleado.id,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }

      const comentarioEmpleadoCreado = data.comentario ? await prisma.comentario_empleado.create({
        data: {
          ...data.comentario,
          id: uuidv4(),
          empleado_id: empleado.id,
          usuario_id: data.usuarioId,
          created_at: new Date(),
        }
      }) : null;

      // 5. Crear asignación a sede
      const asignacion = await prisma.asignacion_empleado.create({
        data: {
          id: uuidv4(),
          empleado_id: empleado.id,
          sede_id: data.sedeId,
          fecha_asignacion: data.fechaAsignacion || new Date(),
          estado: 'activa',
          created_at: new Date()
        }
      });

      logger.info('Empleado creado y asignado exitosamente', {
        empleadoId: empleado.id,
        sedeId: data.sedeId,
        cargo: empleado.cargo,
        comentarioEmpleadoId: comentarioEmpleadoCreado?.id
      });

      return {
        empleado,
        informacionAcademica,
        asignacion,
        sede,
        comentarioEmpleado: comentarioEmpleadoCreado,
        resumen: {
          empleadoCreado: true,
          sedeAsignada: sede.nombre,
          tieneInformacionAcademica: !!informacionAcademica
        }
      };
    });
  }

  /**
   * Asignar empleado existente a una sede
   */
  async asignarEmpleadoASede(data: {
    empleadoId: string;
    sedeId: string;
    fechaAsignacion?: Date;
    reemplazarAsignacionActual?: boolean;
  }) {
    return await this.prismaService.executeTransaction(async (prisma) => {
      logger.info('Asignando empleado existente a sede', data);

      // Verificar que el empleado existe
      const empleado = await prisma.empleado.findUnique({
        where: { id: data.empleadoId }
      });

      if (!empleado) {
        throw new Error('Empleado no encontrado');
      }

      if (empleado.estado !== 'activo') {
        throw new Error('No se puede asignar empleado inactivo');
      }

      // Verificar que la sede existe
      const sede = await prisma.sede.findUnique({
        where: { id: data.sedeId }
      });

      if (!sede) {
        throw new Error('Sede no encontrada');
      }

      if (sede.estado !== 'activa') {
        throw new Error('No se puede asignar a sede inactiva');
      }

      // Verificar si ya tiene asignación activa
      const asignacionActual = await prisma.asignacion_empleado.findFirst({
        where: {
          empleado_id: data.empleadoId,
          estado: 'activa'
        }
      });

      if (asignacionActual) {
        if (!data.reemplazarAsignacionActual) {
          throw new Error('El empleado ya tiene una asignación activa. Use reemplazarAsignacionActual=true para cambiar');
        }

        // Finalizar asignación actual
        await prisma.asignacion_empleado.update({
          where: { id: asignacionActual.id },
          data: {
            estado: 'finalizada',
            fecha_fin: new Date()
          }
        });
      }

      // Crear nueva asignación
      const nuevaAsignacion = await prisma.asignacion_empleado.create({
        data: {
          id: uuidv4(),
          empleado_id: data.empleadoId,
          sede_id: data.sedeId,
          fecha_asignacion: data.fechaAsignacion || new Date(),
          estado: 'activa',
          created_at: new Date()
        }
      });

      logger.info('Empleado asignado exitosamente', {
        empleadoId: data.empleadoId,
        sedeId: data.sedeId,
        reemplazoAsignacion: !!asignacionActual
      });

      return {
        empleado,
        sede,
        asignacionAnterior: asignacionActual,
        nuevaAsignacion,
        resumen: {
          cambioDeAsignacion: !!asignacionActual,
          sedeAnterior: asignacionActual ? 'Sede anterior finalizada' : null,
          nuevaSede: sede.nombre
        }
      };
    });
  }

  /**
   * Cambiar empleado de sede (transferencia)
   */
  async transferirEmpleadoASede(data: {
    empleadoId: string;
    nuevaSedeId: string;
    fechaTransferencia?: Date;
    motivoTransferencia?: string;
  }) {
    return await this.prismaService.executeTransaction(async (prisma) => {
      logger.info('Transfiriendo empleado a nueva sede', data);

      // Obtener asignación actual
      const asignacionActual = await prisma.asignacion_empleado.findFirst({
        where: {
          empleado_id: data.empleadoId,
          estado: 'activa'
        },
        include: {
          sede: true,
          empleado: true
        }
      });

      if (!asignacionActual) {
        throw new Error('El empleado no tiene asignación activa para transferir');
      }

      // Verificar nueva sede
      const nuevaSede = await prisma.sede.findUnique({
        where: { id: data.nuevaSedeId }
      });

      if (!nuevaSede) {
        throw new Error('Nueva sede no encontrada');
      }

      if (nuevaSede.estado !== 'activa') {
        throw new Error('No se puede transferir a sede inactiva');
      }

      if (asignacionActual.sede_id === data.nuevaSedeId) {
        throw new Error('El empleado ya está asignado a esta sede');
      }

      // Finalizar asignación actual
      await prisma.asignacion_empleado.update({
        where: { id: asignacionActual.id },
        data: {
          estado: 'finalizada',
          fecha_fin: data.fechaTransferencia || new Date()
        }
      });

      // Crear nueva asignación
      const nuevaAsignacion = await prisma.asignacion_empleado.create({
        data: {
          id: uuidv4(),
          empleado_id: data.empleadoId,
          sede_id: data.nuevaSedeId,
          fecha_asignacion: data.fechaTransferencia || new Date(),
          estado: 'activa',
          created_at: new Date()
        }
      });

      logger.info('Empleado transferido exitosamente', {
        empleadoId: data.empleadoId,
        sedeAnterior: asignacionActual.sede.nombre,
        nuevaSede: nuevaSede.nombre
      });

      return {
        empleado: asignacionActual.empleado,
        sedeAnterior: asignacionActual.sede,
        nuevaSede,
        asignacionAnterior: asignacionActual,
        nuevaAsignacion,
        resumen: {
          transferido: true,
          sedeAnterior: asignacionActual.sede.nombre,
          nuevaSede: nuevaSede.nombre,
          fechaTransferencia: data.fechaTransferencia || new Date()
        }
      };
    });
  }

  /**
   * Obtener empleados por sede
   */
  async getEmpleadosPorSede(sedeId: string, filtros?: {
    cargo?: string;
    estado?: 'activo' | 'inactivo';
    soloAsignacionesActivas?: boolean;
  }) {
    try {
      const where: any = {
        asignacion_empleado: {
          some: {
            sede_id: sedeId
          }
        }
      };

      // Aplicar filtros
      if (filtros?.cargo) {
        where.cargo = filtros.cargo;
      }

      if (filtros?.estado) {
        where.estado = filtros.estado;
      }

      if (filtros?.soloAsignacionesActivas) {
        where.asignacion_empleado.some.estado = 'activa';
      }

      const empleados = await this.prismaService.executeTransaction(async (prisma) => {
        return await prisma.empleado.findMany({
          where,
          include: {
            asignacion_empleado: {
              where: {
                sede_id: sedeId,
                ...(filtros?.soloAsignacionesActivas ? { estado: 'activa' } : {})
              },
              include: {
                sede: true
              }
            },
            informacion_academica: true
          }
        });
      });

      return empleados.map(emp => ({
        ...emp,
        asignacionActual: emp.asignacion_empleado.find(a => a.estado === 'activa'),
        historialAsignaciones: emp.asignacion_empleado
      }));

    } catch (error) {
      logger.error('Error obteniendo empleados por sede', error);
      throw error;
    }
  }

  /**
   * Obtener sedes disponibles para asignar empleados
   */
  async getSedesDisponibles(filtros?: {
    zona?: PrismaInterfaces.SedeZona;
    conCapacidad?: boolean;
  }) {
    try {
      const where: any = {
        estado: 'activa'
      };

      if (filtros?.zona) {
        where.zona = filtros.zona;
      }

      const sedes = await this.prismaService.getSedes(where, {
        page: 1,
        limit: 100
      });

      if (filtros?.conCapacidad) {
        // Agregar información de empleados actuales por sede
        const sedesConInfo = [];
        
        for (const sede of sedes.data) {
          const totalEmpleados = await this.prismaService.executeTransaction(async (prisma) => {
            return await prisma.asignacion_empleado.count({
              where: {
                sede_id: sede.id,
                estado: 'activa'
              }
            });
          });
          
          sedesConInfo.push({
            ...sede,
            empleadosActuales: totalEmpleados
          });
        }
        
        return sedesConInfo;
      }

      return sedes.data;
    } catch (error) {
      logger.error('Error obteniendo sedes disponibles', error);
      throw error;
    }
  }

  /**
   * Validar datos del empleado antes de crear
   */
  private async validarDatosEmpleado(empleadoData: PrismaInterfaces.ICreateEmpleado): Promise<void> {
    // Validar que no exista empleado con mismo documento
    const empleadoExistente = await this.prismaService.executeTransaction(async (prisma) => {
      return await prisma.empleado.findFirst({
        where: { documento: empleadoData.documento }
      });
    });

    if (empleadoExistente) {
      throw new Error('Ya existe un empleado con este documento');
    }

    // Validar email si se proporciona
    if (empleadoData.email) {
      const emailExistente = await this.prismaService.executeTransaction(async (prisma) => {
        return await prisma.empleado.findFirst({
          where: { email: empleadoData.email }
        });
      });

      if (emailExistente) {
        throw new Error('Ya existe un empleado con este email');
      }
    }
  }

  /**
   * Finalizar asignación de empleado (baja de sede)
   */
  async finalizarAsignacionEmpleado(data: {
    empleadoId: string;
    fechaFin?: Date;
    motivo?: string;
  }) {
    return await this.prismaService.executeTransaction(async (prisma) => {
      logger.info('Finalizando asignación de empleado', data);

      // Buscar asignación activa
      const asignacionActiva = await prisma.asignacion_empleado.findFirst({
        where: {
          empleado_id: data.empleadoId,
          estado: 'activa'
        },
        include: {
          empleado: true,
          sede: true
        }
      });

      if (!asignacionActiva) {
        throw new Error('El empleado no tiene asignación activa');
      }

      // Finalizar asignación
      const asignacionFinalizada = await prisma.asignacion_empleado.update({
        where: { id: asignacionActiva.id },
        data: {
          estado: 'finalizada',
          fecha_fin: data.fechaFin || new Date()
        }
      });

      logger.info('Asignación finalizada exitosamente', {
        empleadoId: data.empleadoId,
        sede: asignacionActiva.sede.nombre
      });

      return {
        empleado: asignacionActiva.empleado,
        sede: asignacionActiva.sede,
        asignacionFinalizada,
        resumen: {
          empleadoLiberado: true,
          sedeAnterior: asignacionActiva.sede.nombre,
          fechaFin: data.fechaFin || new Date()
        }
      };
    });
  }

  /**
   * Obtener historial de asignaciones de un empleado
   */
  async getHistorialAsignacionesEmpleado(empleadoId: string) {
    try {
      const empleado = await this.prismaService.getEmpleadoById(empleadoId);
      
      if (!empleado) {
        throw new Error('Empleado no encontrado');
      }

      const asignaciones = await this.prismaService.executeTransaction(async (prisma) => {
        return await prisma.asignacion_empleado.findMany({
          where: { empleado_id: empleadoId },
          include: {
            sede: true
          },
          orderBy: {
            fecha_asignacion: 'desc'
          }
        });
      });

      return {
        empleado,
        historialCompleto: asignaciones,
        asignacionActual: asignaciones.find(a => a.estado === 'activa'),
        totalAsignaciones: asignaciones.length,
        resumen: {
          tieneAsignacionActiva: asignaciones.some(a => a.estado === 'activa'),
          totalSedes: new Set(asignaciones.map(a => a.sede_id)).size,
          periodoTotal: {
            desde: asignaciones[asignaciones.length - 1]?.fecha_asignacion,
            hasta: asignaciones.find(a => a.estado === 'activa')?.fecha_asignacion || 
                   asignaciones[0]?.fecha_fin
          }
        }
      };
    } catch (error) {
      logger.error('Error obteniendo historial de empleado', error);
      throw error;
    }
  }
}