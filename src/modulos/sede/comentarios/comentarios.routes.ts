import { Router } from 'express';
import { ComentarioSedeController } from './comentarios.controller';
import { authMiddleware, roleMiddleware } from '../../../middlewares/auth.middleware';

/**
 * Rutas para la gestión de comentarios de sedes
 * Permite documentar observaciones y seguimiento de sedes
 */
export class ComentarioSedeRoutes {
  static get routes() {
    const router = Router({ mergeParams: true }); // mergeParams para acceder a :sede_id del router padre
    const comentarioController = new ComentarioSedeController();

    // ============= GESTIÓN DE COMENTARIOS =============
    
    /**
     * @route POST /sede/:sede_id/comentarios
     * @desc Crear comentario en sede
     * @access super_admin, admin, gestor
     */
    router.post('/', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin', 'gestor']),
      async (req, res) => {
        await comentarioController.createComentario(req, res);
      }
    );

    /**
     * @route GET /sede/:sede_id/comentarios
     * @desc Obtener comentarios de una sede con paginación
     * @access super_admin, admin, gestor
     * @query page, limit
     */
    router.get('/', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin', 'gestor']),
      async (req, res) => {
        await comentarioController.getComentariosBySede(req, res);
      }
    );

    /**
     * @route PUT /sede/:sede_id/comentarios/:id
     * @desc Actualizar comentario de sede
     * @access super_admin, admin
     */
    router.put('/:id', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin']),
      async (req, res) => {
        await comentarioController.updateComentario(req, res);
      }
    );

    /**
     * @route DELETE /sede/:sede_id/comentarios/:id
     * @desc Eliminar comentario de sede
     * @access super_admin
     */
    router.delete('/:id', 
      authMiddleware,
      roleMiddleware(['super_admin']),
      async (req, res) => {
        await comentarioController.deleteComentario(req, res);
      }
    );

    return router;
  }
}