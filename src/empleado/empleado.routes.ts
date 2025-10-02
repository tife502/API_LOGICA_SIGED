import { Router } from "express";
import { EmpleadoController } from "./empleado.controller";

/**
 * Rutas para la gestión de empleados
 * Usa las interfaces tipadas para una mejor validación
 */
export class EmpleadoRoutes {
  static get routes() {
    const router = Router();
    const empleadoController = new EmpleadoController();

    // Rutas CRUD para empleados
    router.post('/empleados', empleadoController.createEmpleado);
    router.get('/empleados', empleadoController.getEmpleados);
    router.get('/empleados/inactivos', empleadoController.getEmpleadosInactivos);
    router.get('/empleados/:id', empleadoController.getEmpleadoById);
    router.put('/empleados/:id', empleadoController.updateEmpleado);
    router.delete('/empleados/:id', empleadoController.deleteEmpleado);
    router.patch('/empleados/:id/reactivar', empleadoController.reactivarEmpleado);

    // Rutas específicas
    router.get('/empleados/:empleadoId/horas-extra', empleadoController.getHorasExtraEmpleado);

    return router;
  }
}