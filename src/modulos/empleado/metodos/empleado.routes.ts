import { Router } from 'express';
import { EmpleadoNormalController } from './empleado.controller';
import { authMiddleware } from '../../../middlewares';

/**
 * Rutas para el flujo normal de empleados
 * Endpoints para empleados que se asignan a una sola sede
 * 
 * Base path: /api/v1/empleados/normal
 */

const router = Router();
const empleadoController = new EmpleadoNormalController();

/**
 * @route POST /api/v1/empleados/normal/crear-con-sede
 * @desc Crear empleado y asignarlo directamente a una sede
 * @access Private (requiere autenticación)
 * @body {
 *   empleado: {
 *     nombre: string,
 *     documento: string,
 *     tipo_documento: string,
 *     cargo: string,
 *     email?: string,
 *     telefono?: string,
 *     estado_civil?: string,
 *     genero?: string,
 *     fecha_nacimiento?: Date,
 *     direccion?: string
 *   },
 *   informacionAcademica?: {
 *     nivel_educativo: string,
 *     titulo: string,
 *     institucion_educativa?: string,
 *     fecha_graduacion?: Date
 *   },
 *   sedeId: string,
 *   fechaAsignacion?: Date
 * }
 */
router.post('/crear-con-sede', authMiddleware, empleadoController.crearEmpleadoConSede);

/**
 * @route POST /api/v1/empleados/normal/:empleadoId/asignar-sede
 * @desc Asignar empleado existente a una sede
 * @access Private (requiere autenticación)
 * @params empleadoId - ID del empleado a asignar
 * @body {
 *   sedeId: string,
 *   fechaAsignacion?: Date,
 *   reemplazarAsignacionActual?: boolean
 * }
 */
router.post('/:empleadoId/asignar-sede', authMiddleware, empleadoController.asignarEmpleadoASede);

/**
 * @route PUT /api/v1/empleados/normal/:empleadoId/transferir-sede
 * @desc Transferir empleado de una sede a otra
 * @access Private (requiere autenticación)
 * @params empleadoId - ID del empleado a transferir
 * @body {
 *   nuevaSedeId: string,
 *   fechaTransferencia?: Date,
 *   motivoTransferencia?: string
 * }
 */
router.put('/:empleadoId/transferir-sede', authMiddleware, empleadoController.transferirEmpleadoASede);

/**
 * @route DELETE /api/v1/empleados/normal/:empleadoId/finalizar-asignacion
 * @desc Finalizar asignación actual del empleado (dar de baja de sede)
 * @access Private (requiere autenticación)
 * @params empleadoId - ID del empleado
 * @body {
 *   fechaFin?: Date,
 *   motivo?: string
 * }
 */
router.delete('/:empleadoId/finalizar-asignacion', authMiddleware, empleadoController.finalizarAsignacion);

/**
 * @route GET /api/v1/empleados/normal/sede/:sedeId/empleados
 * @desc Obtener todos los empleados de una sede específica
 * @access Private (requiere autenticación)
 * @params sedeId - ID de la sede
 * @query {
 *   cargo?: string - Filtrar por cargo específico
 *   estado?: 'activo' | 'inactivo' - Filtrar por estado del empleado
 *   solo_activos?: 'true' | 'false' - Solo asignaciones activas
 * }
 */
router.get('/sede/:sedeId/empleados', authMiddleware, empleadoController.getEmpleadosPorSede);

/**
 * @route GET /api/v1/empleados/normal/sedes-disponibles
 * @desc Obtener sedes disponibles para asignar empleados
 * @access Private (requiere autenticación)
 * @query {
 *   zona?: 'urbana' | 'rural' - Filtrar por zona
 *   con_capacidad?: 'true' | 'false' - Incluir información de empleados actuales
 * }
 */
router.get('/sedes-disponibles', authMiddleware, empleadoController.getSedesDisponibles);

/**
 * @route GET /api/v1/empleados/normal/:empleadoId/historial-asignaciones
 * @desc Obtener historial completo de asignaciones de un empleado
 * @access Private (requiere autenticación)
 * @params empleadoId - ID del empleado
 */
router.get('/:empleadoId/historial-asignaciones', authMiddleware, empleadoController.getHistorialAsignaciones);

/**
 * @route GET /api/v1/empleados/normal/validar-asignacion
 * @desc Validar si se puede asignar un empleado a una sede específica
 * @access Private (requiere autenticación)
 * @query {
 *   empleadoId: string - ID del empleado a validar
 *   sedeId: string - ID de la sede a validar
 * }
 */
router.get('/validar-asignacion', authMiddleware, empleadoController.validarAsignacion);

export default router;