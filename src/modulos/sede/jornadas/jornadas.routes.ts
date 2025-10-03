import { Router } from 'express';
import { JornadaController } from './jornadas.controller';
import { authMiddleware, roleMiddleware } from '../../../middlewares/auth.middleware';

/**
 * Rutas para la gestión de jornadas y su relación con sedes
 * Las jornadas definen horarios de trabajo (mañana, tarde, etc.)
 */
export class JornadaRoutes {
  static get routes() {
    const router = Router({ mergeParams: true }); // mergeParams para acceder a :sede_id del router padre
    const jornadaController = new JornadaController();

    // ============= GESTIÓN DE JORNADAS =============
    
    /**
     * @route GET /jornadas
     * @desc Obtener todas las jornadas disponibles
     * @access super_admin, admin, gestor
     */
    router.get('/all', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin', 'gestor']),
      async (req, res) => {
        await jornadaController.getJornadas(req, res);
      }
    );

    /**
     * @route POST /sede/:sede_id/jornadas
     * @desc Asignar jornada a sede
     * @access super_admin, admin
     */
    router.post('/', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin']),
      async (req, res) => {
        await jornadaController.asignarJornadaSede(req, res);
      }
    );

    /**
     * @route GET /sede/:sede_id/jornadas
     * @desc Obtener jornadas de una sede
     * @access super_admin, admin, gestor
     */
    router.get('/', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin', 'gestor']),
      async (req, res) => {
        await jornadaController.getJornadasBySede(req, res);
      }
    );

    /**
     * @route DELETE /sede/:sede_id/jornadas/:jornada_id
     * @desc Desasignar jornada de sede
     * @access super_admin, admin
     */
    router.delete('/:jornada_id', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin']),
      async (req, res) => {
        await jornadaController.desasignarJornadaSede(req, res);
      }
    );

    return router;
  }
}