import { Router } from 'express';
import { DocumentoHorasExtraController } from './doc.horas.extra.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';

const router = Router();
const documentoController = new DocumentoHorasExtraController();

/**
 * Rutas para gestión de documentos de horas extra
 * Todas las rutas requieren autenticación
 * DELETE requiere rol super_admin (verificado en el controlador)
 */

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

/**
 * @route   POST /api/documentos-horas-extra
 * @desc    Crear nuevo documento de horas extra
 * @access  Todos los roles autenticados
 */
router.post('/', documentoController.createDocumentoHorasExtra);

/**
 * @route   GET /api/documentos-horas-extra
 * @desc    Obtener todos los documentos con paginación
 * @access  Todos los roles autenticados
 * @query   page, limit, search, horas_extra_id, empleado_id
 */
router.get('/', documentoController.getDocumentosHorasExtra);

/**
 * @route   GET /api/documentos-horas-extra/horas-extra/:horas_extra_id
 * @desc    Obtener documentos por registro de horas extra ID
 * @access  Todos los roles autenticados
 */
router.get('/horas-extra/:horas_extra_id', documentoController.getDocumentosByHorasExtraId);

/**
 * @route   GET /api/documentos-horas-extra/:id
 * @desc    Obtener un documento por ID
 * @access  Todos los roles autenticados
 */
router.get('/:id', documentoController.getDocumentoById);

/**
 * @route   GET /api/documentos-horas-extra/:id/download
 * @desc    Descargar archivo de documento
 * @access  Todos los roles autenticados
 */
router.get('/:id/download', documentoController.downloadDocumento);

/**
 * @route   PUT /api/documentos-horas-extra/:id
 * @desc    Actualizar un documento
 * @access  Todos los roles autenticados
 */
router.put('/:id', documentoController.updateDocumento);

/**
 * @route   DELETE /api/documentos-horas-extra/:id
 * @desc    Eliminar un documento
 * @access  Solo super_admin (verificado en el controlador)
 */
router.delete('/:id', documentoController.deleteDocumento);

export default router;