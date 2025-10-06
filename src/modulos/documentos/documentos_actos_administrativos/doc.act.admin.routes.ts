import { Router } from 'express';
import { DocumentoActoAdministrativoController } from './doc.act.admin.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';

const router = Router();
const documentoController = new DocumentoActoAdministrativoController();

/**
 * Rutas para gestión de documentos de actos administrativos
 * Todas las rutas requieren autenticación
 * DELETE requiere rol super_admin (verificado en el controlador)
 */

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

/**
 * @route   POST /api/documentos-actos-administrativos
 * @desc    Crear nuevo documento de acto administrativo
 * @access  Todos los roles autenticados
 */
router.post('/', documentoController.createDocumentoActo);

/**
 * @route   GET /api/documentos-actos-administrativos
 * @desc    Obtener todos los documentos con paginación
 * @access  Todos los roles autenticados
 * @query   page, limit, search, acto_id
 */
router.get('/', documentoController.getDocumentosActos);

/**
 * @route   GET /api/documentos-actos-administrativos/acto/:acto_id
 * @desc    Obtener documentos por acto administrativo ID
 * @access  Todos los roles autenticados
 */
router.get('/acto/:acto_id', documentoController.getDocumentosByActoId);

/**
 * @route   GET /api/documentos-actos-administrativos/:id
 * @desc    Obtener un documento por ID
 * @access  Todos los roles autenticados
 */
router.get('/:id', documentoController.getDocumentoById);

/**
 * @route   GET /api/documentos-actos-administrativos/:id/download
 * @desc    Descargar archivo de documento
 * @access  Todos los roles autenticados
 */
router.get('/:id/download', documentoController.downloadDocumento);

/**
 * @route   PUT /api/documentos-actos-administrativos/:id
 * @desc    Actualizar un documento
 * @access  Todos los roles autenticados
 */
router.put('/:id', documentoController.updateDocumento);

/**
 * @route   DELETE /api/documentos-actos-administrativos/:id
 * @desc    Eliminar un documento
 * @access  Solo super_admin (verificado en el controlador)
 */
router.delete('/:id', documentoController.deleteDocumento);

export default router;
