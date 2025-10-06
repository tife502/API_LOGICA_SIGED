import { Router } from 'express';
import { ActoAdministrativoController } from './act.admi.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const actoController = new ActoAdministrativoController();

/**
 * Rutas para gestión de actos administrativos
 * Todas las rutas requieren autenticación
 * DELETE requiere rol super_admin (verificado en el controlador)
 */

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

/**
 * @route   POST /api/actos-administrativos
 * @desc    Crear nuevo acto administrativo
 * @access  Todos los roles autenticados
 */
router.post('/', actoController.createActoAdministrativo);

/**
 * @route   GET /api/actos-administrativos
 * @desc    Obtener todos los actos administrativos con paginación
 * @access  Todos los roles autenticados
 * @query   page, limit, search
 */
router.get('/', actoController.getActosAdministrativos);

/**
 * @route   GET /api/actos-administrativos/institucion/:institucion_id
 * @desc    Obtener actos administrativos por institución educativa
 * @access  Todos los roles autenticados
 */
router.get('/institucion/:institucion_id', actoController.getActosByInstitucion);

/**
 * @route   GET /api/actos-administrativos/:id
 * @desc    Obtener un acto administrativo por ID
 * @access  Todos los roles autenticados
 */
router.get('/:id', actoController.getActoAdministrativoById);

/**
 * @route   PUT /api/actos-administrativos/:id
 * @desc    Actualizar un acto administrativo
 * @access  Todos los roles autenticados
 */
router.put('/:id', actoController.updateActoAdministrativo);

/**
 * @route   DELETE /api/actos-administrativos/:id
 * @desc    Eliminar un acto administrativo
 * @access  Solo super_admin (verificado en el controlador)
 */
router.delete('/:id', actoController.deleteActoAdministrativo);

export default router;
