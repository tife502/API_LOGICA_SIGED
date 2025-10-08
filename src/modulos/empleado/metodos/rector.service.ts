import PrismaService from '../../../prisma/prisma.service';
import { logger } from '../../../config';
import { PrismaInterfaces } from '../../../domain';
import { v4 as uuidv4 } from 'uuid';

/**
 * Servicio especializado para la gestión de rectores e instituciones educativas
 * Maneja flujos complejos de creación y asignación de rectores a instituciones y sedes
 */
export class RectorService {
  private prismaService: PrismaService;

  constructor() {
    this.prismaService = PrismaService.getInstance();
  }

  /**
   * Crear rector completo con institución y sedes
   * Flujo: Empleado Rector -> Institución -> Asignación de Sedes
   */
  async crearRectorCompleto(data: PrismaInterfaces.ICreateRectorCompletoRequest): Promise<PrismaInterfaces.ICreateRectorCompletoResponse> {
    return await this.prismaService.executeTransaction(async (prisma) => {
      // 1. Validar datos antes de crear
      await this.validarDatosRector(data.empleado);

      // 2. Crear empleado rector
      const empleadoCreado = await prisma.empleado.create({
        data: {
          ...data.empleado,
          id: uuidv4(),
          cargo: PrismaInterfaces.EmpleadoCargo.Rector, // Usar enum correcto
          estado: PrismaInterfaces.EmpleadoEstado.activo,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // 3. Crear información académica si se proporciona
      let informacionAcademicaCreada: PrismaInterfaces.IInformacionAcademica | undefined;
      if (data.informacionAcademica) {
        const infoAcademica = await prisma.informacion_academica.create({
          data: {
            ...data.informacionAcademica,
            id: uuidv4(),
            empleado_id: empleadoCreado.id,
            created_at: new Date()
          }
        });
        informacionAcademicaCreada = infoAcademica as PrismaInterfaces.IInformacionAcademica;
      }

      // 4. Crear institución educativa
      const institucionCreada = await prisma.institucion_educativa.create({
        data: {
          id: uuidv4(),
          nombre: data.institucion.nombre,
          rector_encargado_id: empleadoCreado.id,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // 5. Procesar sedes
      const sedesCreadas: PrismaInterfaces.ISede[] = [];
      const asignacionesCreadas: PrismaInterfaces.IAsignacionEmpleado[] = [];
      const jornadaAsignaciones: Array<{
        sede_id: string;
        jornada_id: number;
        jornada_nombre: string;
      }> = [];

      // 5a. Crear sedes nuevas si se especifican
      if (data.sedes.crear && data.sedes.crear.length > 0) {
        for (const sedeData of data.sedes.crear) {
          // Crear sede
        const sedeCreada = await prisma.sede.create({
          data: {
            id: uuidv4(),
            nombre: sedeData.nombre,
            zona: sedeData.zona,
            direccion: sedeData.direccion || '',
            codigo_DANE: sedeData.codigo_DANE || null,
            estado: 'activa',
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        sedesCreadas.push(sedeCreada as PrismaInterfaces.ISede);          // Relacionar sede con institución
          await prisma.sede_ie.create({
            data: {
              id: uuidv4(),
              sede_id: sedeCreada.id,
              institucion_educativa_id: institucionCreada.id,
              created_at: new Date()
            }
          });

          // Asignar jornadas existentes a la sede si se especifican
          if (sedeData.jornadas && sedeData.jornadas.length > 0) {
            for (const nombreJornada of sedeData.jornadas) {
              // Buscar jornada existente por nombre
              const jornadaExistente = await prisma.jornada.findFirst({
                where: { 
                  nombre: nombreJornada 
                }
              });

              if (!jornadaExistente) {
                throw new Error(`Jornada '${nombreJornada}' no encontrada. Las jornadas válidas son: Mañana, Tarde, Sabatina, Nocturna`);
              }

              // Verificar si ya existe la relación sede-jornada
              const relacionExistente = await prisma.sede_jornada.findFirst({
                where: {
                  sede_id: sedeCreada.id,
                  jornada_id: jornadaExistente.id
                }
              });

              // Solo crear la relación si no existe
              if (!relacionExistente) {
                await prisma.sede_jornada.create({
                  data: {
                    id: uuidv4(),
                    sede_id: sedeCreada.id,
                    jornada_id: jornadaExistente.id,
                    created_at: new Date()
                  }
                });

                jornadaAsignaciones.push({
                  sede_id: sedeCreada.id,
                  jornada_id: jornadaExistente.id,
                  jornada_nombre: jornadaExistente.nombre
                });
              }
            }
          }

          // Asignar rector a sede
          const asignacion = await prisma.asignacion_empleado.create({
            data: {
              id: uuidv4(),
              empleado_id: empleadoCreado.id,
              sede_id: sedeCreada.id,
              fecha_asignacion: data.fechaAsignacion ? new Date(data.fechaAsignacion) : new Date(),
              fecha_fin: null,
              estado: 'activa',
              created_at: new Date()
            }
          });
          asignacionesCreadas.push(asignacion as PrismaInterfaces.IAsignacionEmpleado);
        }
      }

      // 5b. Asignar sedes existentes si se especifican
      if (data.sedes.asignar_existentes && data.sedes.asignar_existentes.length > 0) {
        for (const sedeId of data.sedes.asignar_existentes) {
          // Verificar que la sede existe
          const sedeExistente = await prisma.sede.findUnique({
            where: { id: sedeId }
          });

          if (!sedeExistente) {
            throw new Error(`Sede con ID ${sedeId} no encontrada`);
          }

          sedesCreadas.push(sedeExistente as PrismaInterfaces.ISede);

          // Relacionar sede con institución (si no está ya relacionada)
          const relacionExistente = await prisma.sede_ie.findFirst({
            where: {
              sede_id: sedeId,
              institucion_educativa_id: institucionCreada.id
            }
          });

          if (!relacionExistente) {
            await prisma.sede_ie.create({
              data: {
                id: uuidv4(),
                sede_id: sedeId,
                institucion_educativa_id: institucionCreada.id,
                created_at: new Date()
              }
            });
          }

          // Asignar rector a sede
          const asignacion = await prisma.asignacion_empleado.create({
            data: {
              id: uuidv4(),
              empleado_id: empleadoCreado.id,
              sede_id: sedeId,
              fecha_asignacion: data.fechaAsignacion ? new Date(data.fechaAsignacion) : new Date(),
              fecha_fin: null,
              estado: 'activa',
              created_at: new Date()
            }
          });
          asignacionesCreadas.push(asignacion as PrismaInterfaces.IAsignacionEmpleado);
        }
      }

    // 6. Retornar en el formato exacto que espera la interface
    const response: PrismaInterfaces.ICreateRectorCompletoResponse = {
      rector: empleadoCreado as PrismaInterfaces.IEmpleado,                    // ✅ IEmpleado
      informacionAcademica: informacionAcademicaCreada as PrismaInterfaces.IInformacionAcademica, // ✅ IInformacionAcademica | undefined
      institucion: institucionCreada as PrismaInterfaces.IInstitucionEducativa,           // ✅ IInstitucionEducativa
      sedes: sedesCreadas,                      // ✅ ISede[]
      asignaciones: asignacionesCreadas,        // ✅ IAsignacionEmpleado[]
      jornadaAsignaciones: jornadaAsignaciones.length > 0 ? jornadaAsignaciones : undefined,
      resumen: {
        sedesCreadas: data.sedes.crear?.length || 0,
        sedesAsignadas: data.sedes.asignar_existentes?.length || 0,
        asignacionesRealizadas: asignacionesCreadas.length,
        jornadasAsignadas: jornadaAsignaciones.length
      }
    };      return response;
    });
  }

  /**
   * Asignar rector existente a institución con sus sedes
   */
  async asignarRectorAInstitucion(data: {
    rectorId: string;
    institucionId: string;
    asignarTodasLasSedes?: boolean;
    sedesEspecificas?: string[];
  }) {
    return await this.prismaService.executeTransaction(async (prisma) => {
      // Verificar que el rector existe y tiene cargo correcto
      const rector = await prisma.empleado.findUnique({
        where: { id: data.rectorId }
      });

      if (!rector) {
        throw new Error('Rector no encontrado');
      }

      if (rector.cargo !== 'Rector') {
        throw new Error('El empleado debe tener cargo de Rector');
      }

      // Verificar institución
      const institucion = await prisma.institucion_educativa.findUnique({
        where: { id: data.institucionId }
      });

      if (!institucion) {
        throw new Error('Institución educativa no encontrada');
      }

      // Actualizar rector en institución
      await prisma.institucion_educativa.update({
        where: { id: data.institucionId },
        data: {
          rector_encargado_id: data.rectorId,
          updated_at: new Date()
        }
      });

      // Obtener sedes de la institución
      const sedesInstitucion = await prisma.sede_ie.findMany({
        where: { institucion_educativa_id: data.institucionId },
        include: { sede: true }
      });

      const asignaciones: any[] = [];

      // Determinar qué sedes asignar
      let sedesParaAsignar: string[] = [];

      if (data.asignarTodasLasSedes) {
        sedesParaAsignar = sedesInstitucion.map(si => si.sede_id);
      } else if (data.sedesEspecificas) {
        // Verificar que las sedes especificadas pertenecen a la institución
        const sedesValidIds = sedesInstitucion.map(si => si.sede_id);
        sedesParaAsignar = data.sedesEspecificas.filter(id => sedesValidIds.includes(id));
      }

      // Crear asignaciones
      for (const sedeId of sedesParaAsignar) {
        const asignacion = await prisma.asignacion_empleado.create({
          data: {
            id: uuidv4(),
            empleado_id: data.rectorId,
            sede_id: sedeId,
            fecha_asignacion: new Date(),
            estado: 'activa',
            created_at: new Date()
          }
        });
        asignaciones.push(asignacion);
      }

      return {
        rector,
        institucion,
        asignaciones,
        resumen: {
          sedesDisponibles: sedesInstitucion.length,
          sedesAsignadas: asignaciones.length
        }
      };
    });
  }

  /**
   * Obtener instituciones disponibles para asignar a un rector
   */
  async getInstitucionesDisponibles(filters?: {
    sinRector?: boolean;
    conSedes?: boolean;
  }) {
    try {
      const where: any = {};

      if (filters?.sinRector) {
        where.rector_encargado_id = null;
      }

      const instituciones = await this.prismaService.getInstitucionesEducativas(where, {
        page: 1,
        limit: 100
      });

      if (filters?.conSedes) {
        // Filtrar solo instituciones que tienen sedes
        const institucionesConSedes = [];
        
        for (const institucion of instituciones.data) {
          const sedes = await this.prismaService.executeTransaction(async (prisma) => {
            return await prisma.sede_ie.count({
              where: { institucion_educativa_id: institucion.id }
            });
          });
          
          if (sedes > 0) {
            institucionesConSedes.push({
              ...institucion,
              totalSedes: sedes
            });
          }
        }
        
        return institucionesConSedes;
      }

      return instituciones.data;
    } catch (error) {
      logger.error('Error obteniendo instituciones disponibles', error);
      throw error;
    }
  }

  /**
 * Validar datos del flujo de rector
 */
private async validarDatosRector(empleadoData: PrismaInterfaces.ICreateEmpleado): Promise<void> {
  // Validar que no exista empleado con mismo documento
  const empleadoExistente = await this.prismaService.executeTransaction(async (prisma) => {
    return await prisma.empleado.findFirst({
      where: { 
        documento: empleadoData.documento,
        estado: PrismaInterfaces.EmpleadoEstado.activo
      }
    });
  });

  if (empleadoExistente) {
    throw new Error(`Ya existe un empleado activo con el documento ${empleadoData.documento}`);
  }

  // Validar email si se proporciona
  if (empleadoData.email) {
    const emailExistente = await this.prismaService.executeTransaction(async (prisma) => {
      return await prisma.empleado.findFirst({
        where: { 
          email: empleadoData.email,
          estado: PrismaInterfaces.EmpleadoEstado.activo
        }
      });
    });

    if (emailExistente) {
      throw new Error(`Ya existe un empleado activo con el email ${empleadoData.email}`);
    }
  }

  // Validar que el cargo sea rector
  if (empleadoData.cargo !== PrismaInterfaces.EmpleadoCargo.Rector) {
    throw new Error('El cargo del empleado debe ser "Rector"');
  }
}

/**
 * Obtener resumen completo de un rector
 */
async getResumenRector(rectorId: string) {
  try {
      const rector = await this.prismaService.getEmpleadoById(rectorId);
      
      if (!rector || rector.cargo !== 'Rector') {
        throw new Error('Rector no encontrado');
      }

      // Obtener instituciones donde es rector
      const instituciones = await this.prismaService.executeTransaction(async (prisma) => {
        return await prisma.institucion_educativa.findMany({
          where: { rector_encargado_id: rectorId },
          include: {
            sede_ie: {
              include: {
                sede: true
              }
            }
          }
        });
      });

      // Obtener asignaciones directas a sedes
      const asignaciones = await this.prismaService.executeTransaction(async (prisma) => {
        return await prisma.asignacion_empleado.findMany({
          where: { 
            empleado_id: rectorId,
            estado: 'activa'
          },
          include: {
            sede: true
          }
        });
      });

      return {
        rector,
        instituciones: instituciones.map(inst => ({
          ...inst,
          totalSedes: inst.sede_ie.length,
          sedes: inst.sede_ie.map(si => si.sede)
        })),
        asignacionesDirectas: asignaciones,
        resumen: {
          totalInstituciones: instituciones.length,
          totalSedesAsignadas: asignaciones.length,
          sedesActivasPorInstitucion: instituciones.reduce((acc, inst) => acc + inst.sede_ie.length, 0)
        }
      };
    } catch (error) {
      logger.error('Error obteniendo resumen de rector', error);
      throw error;
    }
  }
}