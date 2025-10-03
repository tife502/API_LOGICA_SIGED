import { Router } from 'express';
import { InstitucionEducativaController } from './instituciones.controller';
import { authMiddleware, roleMiddleware } from '../../../middlewares/auth.middleware';

/**
 * Rutas para la gestión de instituciones educativas
 * Maneja las instituciones educativas y su relación con sedes
 */
export class InstitucionEducativaRoutes {
  static get routes() {
    const router = Router();
    const institucionController = new InstitucionEducativaController();

    // ============= GESTIÓN DE INSTITUCIONES EDUCATIVAS =============
    
    /**
     * @route POST /instituciones
     * @desc Crear institución educativa
     * @access super_admin, admin
     */
    router.post('/', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin']),
      async (req, res) => {
        await institucionController.createInstitucion(req, res);
      }
    );

    /**
     * @route GET /instituciones
     * @desc Obtener todas las instituciones educativas con filtros y paginación
     * @access super_admin, admin, gestor
     * @query nombre, rector_encargado_id, page, limit
     */
    router.get('/', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin', 'gestor']),
      async (req, res) => {
        await institucionController.getInstituciones(req, res);
      }
    );

    /**
     * @route GET /instituciones/:id
     * @desc Obtener institución educativa por ID con todas sus relaciones
     * @access super_admin, admin, gestor
     */
    router.get('/:id', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin', 'gestor']),
      async (req, res) => {
        await institucionController.getInstitucionById(req, res);
      }
    );

    /**
     * @route PUT /instituciones/:id
     * @desc Actualizar institución educativa
     * @access super_admin, admin
     */
    router.put('/:id', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin']),
      async (req, res) => {
        await institucionController.updateInstitucion(req, res);
      }
    );

    /**
     * @route DELETE /instituciones/:id
     * @desc Eliminar institución educativa
     * @access super_admin
     */
    router.delete('/:id', 
      authMiddleware,
      roleMiddleware(['super_admin']),
      async (req, res) => {
        await institucionController.deleteInstitucion(req, res);
      }
    );

    /**
     * @route POST /instituciones/:id/sedes
     * @desc Asignar sede a institución educativa
     * @access super_admin, admin
     */
    router.post('/:id/sedes', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin']),
      async (req, res) => {
        await institucionController.asignarSede(req, res);
      }
    );

    return router;
  }
}