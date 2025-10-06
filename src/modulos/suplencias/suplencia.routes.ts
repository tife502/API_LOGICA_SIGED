import { Router } from 'express';
import { SuplenciaController } from './suplencia.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const suplenciaController = new SuplenciaController();

/**
 * Rutas para gestión de suplencias
 * Todas las rutas requieren autenticación
 * DELETE requiere rol super_admin (verificado en el controlador)
 */

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

/**
 * @route GET /api/suplencias/jornadas
 * @description Obtener jornadas disponibles para suplencias
 * @access Todos los roles autenticados
 */
router.get(
  '/jornadas',
  suplenciaController.getJornadasDisponibles
);

/**
 * @route POST /api/suplencias
 * @description Crear nueva suplencia
 * @access Todos los roles autenticados
 */
router.post(
  '/',
  suplenciaController.createSuplencia
);

/**
 * @route GET /api/suplencias
 * @description Obtener suplencias con filtros y paginación
 * @access Todos los roles autenticados
 */
router.get(
  '/',
  suplenciaController.getSuplencias
);

/**
 * @route GET /api/suplencias/docente/:empleado_id
 * @description Obtener suplencias por docente (ausencias y reemplazos)
 * @access Todos los roles autenticados
 */
router.get(
  '/docente/:empleado_id',
  suplenciaController.getSuplenciasByDocente
);

/**
 * @route GET /api/suplencias/estadisticas
 * @description Obtener estadísticas de suplencias
 * @access Todos los roles autenticados
 */
router.get(
  '/estadisticas',
  suplenciaController.getEstadisticasSuplencias
);

/**
 * @route GET /api/suplencias/:id
 * @description Obtener suplencia por ID
 * @access Todos los roles autenticados
 */
router.get(
  '/:id',
  suplenciaController.getSuplenciaById
);

/**
 * @route PUT /api/suplencias/:id
 * @description Actualizar suplencia
 * @access Todos los roles autenticados
 */
router.put(
  '/:id',
  suplenciaController.updateSuplencia
);

/**
 * @route DELETE /api/suplencias/:id
 * @description Eliminar suplencia (solo super_admin)
 * @access Solo super_admin
 */
router.delete(
  '/:id',
  suplenciaController.deleteSuplencia
);

export default router;