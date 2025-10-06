import { Router } from 'express';
import { DocumentoEmpleadoController } from './doc.empleado.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';

const router = Router();
const documentoController = new DocumentoEmpleadoController();

/**
 * Rutas para gestión de documentos de empleado
 * Todas las rutas requieren autenticación
 * DELETE requiere rol super_admin (verificado en el controlador)
 */

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

/**
 * @route   GET /api/documentos-empleado/tipos
 * @desc    Obtener tipos de documentos disponibles
 * @access  Todos los roles autenticados
 */
router.get('/tipos', documentoController.getTiposDocumento);

/**
 * @route   GET /api/documentos-empleado/estadisticas
 * @desc    Obtener estadísticas de documentos
 * @access  Todos los roles autenticados
 * @query   empleado_id (opcional)
 */
router.get('/estadisticas', documentoController.getEstadisticasDocumentos);

/**
 * @route   POST /api/documentos-empleado
 * @desc    Crear nuevo documento de empleado
 * @access  Todos los roles autenticados
 */
router.post('/', documentoController.createDocumentoEmpleado);

/**
 * @route   GET /api/documentos-empleado
 * @desc    Obtener todos los documentos con paginación
 * @access  Todos los roles autenticados
 * @query   page, limit, search, empleado_id, tipo_documento
 */
router.get('/', documentoController.getDocumentosEmpleado);

/**
 * @route   GET /api/documentos-empleado/empleado/:empleado_id
 * @desc    Obtener documentos por empleado ID
 * @access  Todos los roles autenticados
 * @query   tipo_documento (opcional)
 */
router.get('/empleado/:empleado_id', documentoController.getDocumentosByEmpleadoId);

/**
 * @route   GET /api/documentos-empleado/:id
 * @desc    Obtener un documento por ID
 * @access  Todos los roles autenticados
 */
router.get('/:id', documentoController.getDocumentoById);

/**
 * @route   GET /api/documentos-empleado/:id/download
 * @desc    Descargar archivo de documento
 * @access  Todos los roles autenticados
 */
router.get('/:id/download', documentoController.downloadDocumento);

/**
 * @route   PUT /api/documentos-empleado/:id
 * @desc    Actualizar un documento
 * @access  Todos los roles autenticados
 */
router.put('/:id', documentoController.updateDocumento);

/**
 * @route   DELETE /api/documentos-empleado/:id
 * @desc    Eliminar un documento
 * @access  Solo super_admin (verificado en el controlador)
 */
router.delete('/:id', documentoController.deleteDocumento);

export default router;