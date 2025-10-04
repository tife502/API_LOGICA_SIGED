import { Router } from 'express';
import { AsignacionEmpleadoController } from './asignaciones.controller';
import { authMiddleware, roleMiddleware } from '../../../middlewares/auth.middleware';

/**
 * Rutas para la gestión de asignaciones empleado-sede
 * Maneja la relación entre empleados y las sedes donde trabajan
 */
export class AsignacionEmpleadoRoutes {
  static get routes() {
    const router = Router({ mergeParams: true }); // mergeParams para acceder a :sede_id del router padre
    const asignacionController = new AsignacionEmpleadoController();

    // ============= GESTIÓN DE ASIGNACIONES =============
    
    /**
     * @route POST /sede/:sede_id/asignaciones
     * @desc Crear asignación empleado-sede
     * @access super_admin, admin
     */
    router.post('/', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin']),
      async (req, res) => {
        await asignacionController.createAsignacion(req, res);
      }
    );

    /**
     * @route GET /sede/:sede_id/asignaciones
     * @desc Obtener asignaciones de una sede con filtros y paginación
     * @access super_admin, admin, gestor
     * @query estado, empleado_id, page, limit
     */
    router.get('/', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin', 'gestor']),
      async (req, res) => {
        await asignacionController.getAsignacionesBySede(req, res);
      }
    );

    /**
     * @route PUT /sede/:sede_id/asignaciones/:id
     * @desc Actualizar asignación empleado-sede
     * @access super_admin, admin
     */
    router.put('/:id', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin']),
      async (req, res) => {
        await asignacionController.updateAsignacion(req, res);
      }
    );

    /**
     * @route PUT /sede/:sede_id/asignaciones/:id/finalizar
     * @desc Finalizar asignación (cambiar estado a finalizada)
     * @access super_admin, admin
     */
    router.put('/:id/finalizar', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin']),
      async (req, res) => {
        await asignacionController.finalizarAsignacion(req, res);
      }
    );

    /**
     * @route DELETE /sede/:sede_id/asignaciones/:id
     * @desc Eliminar asignación empleado-sede
     * @access super_admin
     */
    // router.delete('/:id', 
    //   authMiddleware,
    //   roleMiddleware(['super_admin']),
    //   async (req, res) => {
    //     await asignacionController.deleteAsignacion(req, res);
    //   }
    // );

    return router;
  }
}