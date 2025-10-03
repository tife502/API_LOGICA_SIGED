import { Router } from "express";
import { InformacionAcademicaController } from "./informacion.academica.controller";
import { authMiddleware, roleMiddleware } from "../../middlewares/auth.middleware";

/**
 * Rutas para la gestión de información académica de empleados
 * Los gestores digitalizan la formación académica de docentes/rectores
 */
export class InformacionAcademicaRoutes {
  static get routes() {
    const router = Router();
    const informacionAcademicaController = new InformacionAcademicaController();

    // ============= TRABAJO DIARIO DE GESTORES =============
    
    // Crear información académica - Gestores, Admin y Super_admin
    router.post('/', 
      authMiddleware,
      roleMiddleware(['gestor', 'admin', 'super_admin']),
      informacionAcademicaController.createInformacionAcademica
    );

    // Ver información académica con filtros - Todos los roles
    router.get('/', 
      authMiddleware,
      informacionAcademicaController.getInformacionAcademica
    );

    // Ver información académica por ID - Todos los roles
    router.get('/:id', 
      authMiddleware,
      informacionAcademicaController.getInformacionAcademicaById
    );

    // Ver información académica de un empleado específico - Todos los roles
    router.get('/empleado/:empleado_id', 
      authMiddleware,
      informacionAcademicaController.getInformacionAcademicaByEmpleado
    );

    // Actualizar información académica - Gestores, Admin y Super_admin
    router.put('/:id', 
      authMiddleware,
      roleMiddleware(['gestor', 'admin', 'super_admin']),
      informacionAcademicaController.updateInformacionAcademica
    );

    // ============= FUNCIONES ADMINISTRATIVAS =============
    
    // Eliminar información académica - Solo Admin y Super_admin (decisión administrativa)
    router.delete('/:id', 
      authMiddleware,
      roleMiddleware(['admin', 'super_admin']),
      informacionAcademicaController.deleteInformacionAcademica
    );

    // ============= CONSULTAS Y ESTADÍSTICAS =============
    
    // Estadísticas de niveles académicos - Todos los roles
    router.get('/estadisticas/niveles-academicos', 
      authMiddleware,
      informacionAcademicaController.getEstadisticasNivelesAcademicos
    );

    return router;
  }
}

export default InformacionAcademicaRoutes;