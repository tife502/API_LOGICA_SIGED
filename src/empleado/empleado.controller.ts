import { Request, Response } from 'express';
import PrismaService from '../prisma/prisma.service';
import { logger } from '../config';
import { PrismaInterfaces, Utils } from '../domain';

/**
 * Controlador para gestión de empleados
 * Ejemplo de cómo usar las interfaces tipadas con el servicio de Prisma
 */
export class EmpleadoController {
  private prismaService: PrismaService;

  constructor() {
    this.prismaService = PrismaService.getInstance();
  }

  // Crear nuevo empleado
  createEmpleado = async (req: Request, res: Response) => {
    try {
      // Validar datos de entrada usando la interface
      const empleadoData: PrismaInterfaces.ICreateEmpleado = {
        tipo_documento: req.body.tipo_documento,
        documento: req.body.documento,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        email: req.body.email,
        direccion: req.body.direccion,
        cargo: req.body.cargo as PrismaInterfaces.EmpleadoCargo,
        estado: req.body.estado as PrismaInterfaces.EmpleadoEstado || PrismaInterfaces.EmpleadoEstado.activo
      };

      // Validación básica
      if (!empleadoData.documento || !empleadoData.nombre || !empleadoData.email) {
        return res.status(400).json({
          success: false,
          message: 'Faltan datos requeridos: documento, nombre, email',
          error: 'Validation Error'
        });
      }

      if (!Utils.isValidEmail(empleadoData.email)) {
        return res.status(400).json({
          success: false,
          message: 'El email proporcionado no es válido',
          error: 'Validation Error'
        });
      }

      const nuevoEmpleado = await this.prismaService.createEmpleado(empleadoData);

      res.status(201).json({
        success: true,
        message: 'Empleado creado exitosamente',
        data: nuevoEmpleado
      });
    } catch (error: any) {
      logger.error('Error en createEmpleado controller', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  // Obtener empleados con filtros y paginación
  getEmpleados = async (req: Request, res: Response) => {
    try {
      // Filtros opcionales
      const filters: PrismaInterfaces.IEmpleadoFilters = {
        tipo_documento: req.query.tipo_documento as string,
        documento: req.query.documento as string,
        nombre: req.query.nombre as string,
        apellido: req.query.apellido as string,
        email: req.query.email as string,
        cargo: req.query.cargo as PrismaInterfaces.EmpleadoCargo,
        estado: req.query.estado as PrismaInterfaces.EmpleadoEstado,
        sede_id: req.query.sede_id as string
      };

      // Eliminar campos vacíos
      Object.keys(filters).forEach(key => {
        if (!filters[key as keyof PrismaInterfaces.IEmpleadoFilters]) {
          delete filters[key as keyof PrismaInterfaces.IEmpleadoFilters];
        }
      });

      // Paginación
      const pagination: PrismaInterfaces.IPaginationOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        orderBy: req.query.orderBy as string || 'created_at',
        orderDirection: (req.query.orderDirection as 'asc' | 'desc') || 'desc'
      };

      const resultado = await this.prismaService.getEmpleados(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Empleados obtenidos exitosamente',
        ...resultado
      });
    } catch (error: any) {
      logger.error('Error en getEmpleados controller', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  // Obtener empleado por ID
  getEmpleadoById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID del empleado es requerido',
          error: 'Validation Error'
        });
      }

      const empleado = await this.prismaService.getEmpleadoById(id);

      if (!empleado) {
        return res.status(404).json({
          success: false,
          message: 'Empleado no encontrado',
          error: 'Not Found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Empleado obtenido exitosamente',
        data: empleado
      });
    } catch (error: any) {
      logger.error('Error en getEmpleadoById controller', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  // Actualizar empleado
  updateEmpleado = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID del empleado es requerido',
          error: 'Validation Error'
        });
      }

      if (req.body.email && !Utils.isValidEmail(req.body.email)) {
        return res.status(400).json({
          success: false,
          message: 'El email proporcionado no es válido',
          error: 'Validation Error'
        });
      }

      // Verificar que el empleado existe
      const empleadoExistente = await this.prismaService.getEmpleadoById(id);
      
      if (!empleadoExistente) {
        return res.status(404).json({
          success: false,
          message: 'Empleado no encontrado',
          error: 'Not Found'
        });
      }
      
      // Datos para actualizar usando la interface
      const updateData: PrismaInterfaces.IUpdateEmpleado = {
        tipo_documento: req.body.tipo_documento,
        documento: req.body.documento,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        email: req.body.email,
        direccion: req.body.direccion,
        cargo: req.body.cargo as PrismaInterfaces.EmpleadoCargo,
        estado: req.body.estado as PrismaInterfaces.EmpleadoEstado
      };

      // Eliminar campos vacíos/undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof PrismaInterfaces.IUpdateEmpleado] === undefined) {
          delete updateData[key as keyof PrismaInterfaces.IUpdateEmpleado];
        }
      });

      const empleadoActualizado = await this.prismaService.updateEmpleado(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Empleado actualizado exitosamente',
        data: empleadoActualizado
      });
    } catch (error: any) {
      logger.error('Error en updateEmpleado controller', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  // Borrado lógico - cambiar estado a inactivo
  deleteEmpleado = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID del empleado es requerido',
          error: 'Validation Error'
        });
      }

      // Verificar que el empleado existe y está activo
      const empleadoExistente = await this.prismaService.getEmpleadoById(id);
      
      if (!empleadoExistente) {
        return res.status(404).json({
          success: false,
          message: 'Empleado no encontrado',
          error: 'Not Found'
        });
      }

      if (empleadoExistente.estado === PrismaInterfaces.EmpleadoEstado.inactivo) {
        return res.status(400).json({
          success: false,
          message: 'El empleado ya está inactivo',
          error: 'Bad Request'
        });
      }

      // Borrado lógico: actualizar estado a inactivo
      const empleadoInactivado = await this.prismaService.updateEmpleado(id, {
        estado: PrismaInterfaces.EmpleadoEstado.inactivo
      });

      res.status(200).json({
        success: true,
        message: 'Empleado desactivado exitosamente',
        data: empleadoInactivado
      });
    } catch (error: any) {
      logger.error('Error en deleteEmpleado controller', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  // Obtener horas extra de un empleado
  getHorasExtraEmpleado = async (req: Request, res: Response) => {
    try {
      const { empleadoId } = req.params;

      if (!empleadoId) {
        return res.status(400).json({
          success: false,
          message: 'ID del empleado es requerido',
          error: 'Validation Error'
        });
      }

      const horasExtra = await this.prismaService.getHorasExtraByEmpleado(empleadoId);

      res.status(200).json({
        success: true,
        message: 'Horas extra obtenidas exitosamente',
        data: horasExtra
      });
    } catch (error: any) {
      logger.error('Error en getHorasExtraEmpleado controller', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

  // Reactivar empleado
  reactivarEmpleado = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID del empleado es requerido',
          error: 'Validation Error'
        });
      }

      const empleadoReactivado = await this.prismaService.reactivarEmpleado(id);

      res.status(200).json({
        success: true,
        message: 'Empleado reactivado exitosamente',
        data: empleadoReactivado
      });
    } catch (error: any) {
      logger.error('Error en reactivarEmpleado controller', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };

   // Obtener empleados inactivos
  getEmpleadosInactivos = async (req: Request, res: Response) => {
    try {
      const filters: PrismaInterfaces.IEmpleadoFilters = {
        tipo_documento: req.query.tipo_documento as string,
        documento: req.query.documento as string,
        nombre: req.query.nombre as string,
        apellido: req.query.apellido as string,
        email: req.query.email as string,
        cargo: req.query.cargo as PrismaInterfaces.EmpleadoCargo
      };

      // Eliminar campos vacíos
      Object.keys(filters).forEach(key => {
        if (!filters[key as keyof PrismaInterfaces.IEmpleadoFilters]) {
          delete filters[key as keyof PrismaInterfaces.IEmpleadoFilters];
        }
      });

      const pagination: PrismaInterfaces.IPaginationOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        orderBy: req.query.orderBy as string || 'created_at',
        orderDirection: (req.query.orderDirection as 'asc' | 'desc') || 'desc'
      };

      const resultado = await this.prismaService.getEmpleadosInactivos(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Empleados inactivos obtenidos exitosamente',
        ...resultado
      });
    } catch (error: any) {
      logger.error('Error en getEmpleadosInactivos controller', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  };
}

