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
    router.post('/create-empleados', empleadoController.createEmpleado);
    router.get('/get-empleados', empleadoController.getEmpleados);
    router.get('/get-empleados/inactivos', empleadoController.getEmpleadosInactivos);
    router.get('/get-empleados/:id', empleadoController.getEmpleadoById);
    router.put('/update-empleados/:id', empleadoController.updateEmpleado);
    router.delete('/delete-empleados/:id', empleadoController.deleteEmpleado);
    router.patch('/reactivar-empleados/:id', empleadoController.reactivarEmpleado);

    // Rutas específicas
    router.get('/get-empleados/:empleadoId/horas-extra', empleadoController.getHorasExtraEmpleado);

    return router;
  }
}