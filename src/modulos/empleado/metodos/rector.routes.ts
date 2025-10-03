import { Router } from 'express';
import { RectorController } from './rector.controller';
import { authMiddleware } from '../../../middlewares';

/**
 * Rutas especializadas para el módulo de rectores
 * Endpoints específicos para flujos de rectores e instituciones educativas
 * 
 * Base path: /api/v1/empleados/rector
 */

const router = Router();
const rectorController = new RectorController();

/**
 * @route POST /api/v1/empleados/rector/crear-completo
 * @desc Crear rector completo con institución y sedes en un solo flujo
 * @access Private (requiere autenticación)
 * @body {
 *   empleado: {
 *     nombre: string,
 *     documento: string,
 *     tipo_documento: string,
 *     cargo: string (será forzado a 'Rector'),
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
 *   institucion: {
 *     nombre: string,
 *     esSedePrincipal?: boolean
 *   },
 *   sedes: {
 *     crear?: Array<{
 *       nombre: string,
 *       zona: 'urbana' | 'rural',
 *       direccion: string,
 *       codigo_DANE?: string,
 *       esPrincipal?: boolean
 *     }>,
 *     asignarExistentes?: string[]
 *   }
 * }
 */
router.post('/crear-completo', authMiddleware, rectorController.crearRectorCompleto);

/**
 * @route POST /api/v1/empleados/rector/:rectorId/asignar-institucion
 * @desc Asignar rector existente a institución educativa
 * @access Private (requiere autenticación)
 * @params rectorId - ID del rector a asignar
 * @body {
 *   institucionId: string,
 *   asignarTodasLasSedes?: boolean,
 *   sedesEspecificas?: string[]
 * }
 */
router.post('/:rectorId/asignar-institucion', authMiddleware, rectorController.asignarRectorAInstitucion);

/**
 * @route PUT /api/v1/empleados/rector/:rectorId/transferir-institucion
 * @desc Transferir rector de una institución a otra
 * @access Private (requiere autenticación)
 * @params rectorId - ID del rector a transferir
 * @body {
 *   nuevaInstitucionId: string,
 *   mantenerSedesOriginales?: boolean
 * }
 */
router.put('/:rectorId/transferir-institucion', authMiddleware, rectorController.transferirRectorInstitucion);

/**
 * @route GET /api/v1/empleados/rector/instituciones-disponibles
 * @desc Obtener instituciones educativas disponibles para asignar
 * @access Private (requiere autenticación)
 * @query {
 *   sin_rector?: 'true' | 'false' - Solo instituciones sin rector asignado
 *   con_sedes?: 'true' | 'false' - Solo instituciones que tienen sedes
 * }
 */
router.get('/instituciones-disponibles', authMiddleware, rectorController.getInstitucionesDisponibles);

/**
 * @route GET /api/v1/empleados/rector/:rectorId/resumen
 * @desc Obtener resumen completo de un rector con sus instituciones y sedes
 * @access Private (requiere autenticación)
 * @params rectorId - ID del rector
 */
router.get('/:rectorId/resumen', authMiddleware, rectorController.getResumenRector);

/**
 * @route GET /api/v1/empleados/rector/validar-flujo
 * @desc Validar si se puede crear un flujo de rector (verificar documento y email)
 * @access Private (requiere autenticación)
 * @query {
 *   documento: string - Documento del rector a validar
 *   email?: string - Email del rector a validar
 * }
 */
router.get('/validar-flujo', authMiddleware, rectorController.validarFlujoRector);

export default router;