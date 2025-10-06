import { Router } from 'express';
import { DocumentoSuplenciaController } from './doc.suplencia.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';

const router = Router();
const documentoSuplenciaController = new DocumentoSuplenciaController();

/**
 * Rutas para gestión de documentos de suplencias
 * Todas las rutas requieren autenticación
 * DELETE requiere rol super_admin (verificado en el controlador)
 */

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

/**
 * @route POST /api/documentos-suplencia
 * @description Crear nuevo documento de suplencia
 * @access Todos los roles autenticados
 */
router.post(
  '/',
  documentoSuplenciaController.createDocumentoSuplencia
);

/**
 * @route GET /api/documentos-suplencia
 * @description Obtener documentos de suplencia con filtros y paginación
 * @access Todos los roles autenticados
 */
router.get(
  '/',
  documentoSuplenciaController.getDocumentosSuplencia
);

/**
 * @route GET /api/documentos-suplencia/suplencia/:suplencia_id
 * @description Obtener documentos por suplencia específica
 * @access Todos los roles autenticados
 */
router.get(
  '/suplencia/:suplencia_id',
  documentoSuplenciaController.getDocumentosBySuplencia
);

/**
 * @route GET /api/documentos-suplencia/estadisticas
 * @description Obtener estadísticas de documentos de suplencia
 * @access Todos los roles autenticados
 */
router.get(
  '/estadisticas',
  documentoSuplenciaController.getEstadisticasDocumentos
);

/**
 * @route GET /api/documentos-suplencia/:id
 * @description Obtener documento de suplencia por ID
 * @access Todos los roles autenticados
 */
router.get(
  '/:id',
  documentoSuplenciaController.getDocumentoById
);

/**
 * @route GET /api/documentos-suplencia/:id/download
 * @description Descargar documento de suplencia
 * @access Todos los roles autenticados
 */
router.get(
  '/:id/download',
  documentoSuplenciaController.downloadDocumento
);

/**
 * @route PUT /api/documentos-suplencia/:id
 * @description Actualizar documento de suplencia
 * @access Todos los roles autenticados
 */
router.put(
  '/:id',
  documentoSuplenciaController.updateDocumentoSuplencia
);

/**
 * @route DELETE /api/documentos-suplencia/:id
 * @description Eliminar documento de suplencia (solo super_admin)
 * @access Solo super_admin
 */
router.delete(
  '/:id',
  documentoSuplenciaController.deleteDocumentoSuplencia
);

export default router;