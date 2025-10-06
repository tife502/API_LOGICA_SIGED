import { Router } from 'express';
import { HorasExtraController } from './horas.extra.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const horasExtraController = new HorasExtraController();

/**
 * Rutas para gestión de horas extra
 * Todas las rutas requieren autenticación
 * DELETE requiere rol super_admin (verificado en el controlador)
 */

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

/**
 * @route   POST /api/horas-extra
 * @desc    Crear nuevo registro de horas extra
 * @access  Todos los roles autenticados
 */
router.post('/', horasExtraController.createHorasExtra);

/**
 * @route   GET /api/horas-extra
 * @desc    Obtener todos los registros de horas extra con paginación
 * @access  Todos los roles autenticados
 * @query   page, limit, empleado_id, sede_id, jornada, fecha_desde, fecha_hasta
 */
router.get('/', horasExtraController.getHorasExtra);

/**
 * @route   GET /api/horas-extra/:id
 * @desc    Obtener un registro de horas extra por ID
 * @access  Todos los roles autenticados
 */
router.get('/:id', horasExtraController.getHorasExtraById);

/**
 * @route   PUT /api/horas-extra/:id
 * @desc    Actualizar un registro de horas extra
 * @access  Todos los roles autenticados
 */
router.put('/:id', horasExtraController.updateHorasExtra);

/**
 * @route   DELETE /api/horas-extra/:id
 * @desc    Eliminar un registro de horas extra
 * @access  Solo super_admin (verificado en el controlador)
 */
router.delete('/:id', horasExtraController.deleteHorasExtra);

export default router;