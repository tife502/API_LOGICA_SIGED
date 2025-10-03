import { Router } from "express";
import { EmpleadoController } from "./empleado.controller";
import { authMiddleware, roleMiddleware } from "../../middlewares/auth.middleware";

/**
 * Rutas para la gestión de empleados (docentes/rectores)
 * Los gestores hacen el trabajo diario de digitalización
 */
export class EmpleadoRoutes {
  static get routes() {
    const router = Router();
    const empleadoController = new EmpleadoController();

    // ============= TRABAJO DIARIO DE GESTORES =============
    
    // Crear empleado - Gestores, Admin y Super_admin
    router.post('/', 
      authMiddleware,
      roleMiddleware(['gestor', 'admin', 'super_admin']),
      empleadoController.createEmpleado
    );

    // Ver empleados activos - Todos los roles (trabajo diario)
    router.get('/', 
      authMiddleware,
      empleadoController.getEmpleados
    );

    // Ver empleado específico - Todos los roles
    router.get('/:id', 
      authMiddleware,
      empleadoController.getEmpleadoById
    );

    // Modificar información del empleado - Gestores, Admin y Super_admin
    router.put('/:id', 
      authMiddleware,
      roleMiddleware(['gestor', 'admin', 'super_admin']),
      empleadoController.updateEmpleado
    );

    // Ver horas extra - Todos los roles
    router.get('/:empleadoId/horas-extra', 
      authMiddleware,
      empleadoController.getHorasExtraEmpleado
    );

    // ============= FUNCIONES ADMINISTRATIVAS =============
    
    // Ver empleados inactivos - Solo Admin y Super_admin
    router.get('/inactivos', 
      authMiddleware,
      roleMiddleware(['admin', 'super_admin']),
      empleadoController.getEmpleadosInactivos
    );

    // Borrado lógico - Solo Admin y Super_admin (decisiones importantes)
    router.delete('/:id', 
      authMiddleware,
      roleMiddleware(['admin', 'super_admin']),
      empleadoController.deleteEmpleado
    );

    // Reactivar empleado - Solo Super_admin (decisión crítica)
    router.patch('/:id/reactivar', 
      authMiddleware,
      roleMiddleware(['super_admin']),
      empleadoController.reactivarEmpleado
    );

    return router;
  }
}