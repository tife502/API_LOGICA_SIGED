import { Router } from 'express';
import { ModuloRoutes } from '../modulo/modulo.routes';
import { EmpleadoRoutes } from '../empleado/empleado.routes';
/**
 * Clase para definir las rutas principales de la aplicación
 * Aquí se importan y usan las rutas de los diferentes módulos
 */

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    /*  
    aqui iran el nombre de los modulos que usaremos y la importacion de sus rutas por defecto esta prsima como ORMs
    */
    
    //Ruta para el modulo de ejemplo
    router.use(`/api/modulo`,ModuloRoutes.routes)

    //Ruta para el modulo de empleados
    router.use(`/api/empleado`, EmpleadoRoutes.routes);

    return router;
  }
}




