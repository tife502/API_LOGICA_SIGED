import { Router } from 'express';
import { EmpleadoRoutes } from '../modulos/empleado/empleado.routes';
import { UsuarioRoutes } from '../modulos/usuario/usuario.routes';
import { InformacionAcademicaRoutes } from '../modulos/informacion.academica/informacion.academica.routes';
import { SedeRoutes, InstitucionesRouter, JornadasGlobalRouter } from '../modulos/sede/sede.routes';
import AuthRoutes from '../auth/auth.routes';

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
    
    //Ruta para el modulo de empleados
    router.use(`/api/empleado`, EmpleadoRoutes.routes);

    //Ruta para el modulo de usuarios
    router.use(`/api/usuario`, UsuarioRoutes.routes);

    //Ruta para información académica de empleados
    router.use(`/api/informacion-academica`, InformacionAcademicaRoutes.routes);

    //Ruta para autenticación
    router.use(`/api/auth`, AuthRoutes);

    //Rutas para el módulo de sedes (sistema modular completo)
    router.use(`/api/sede`, SedeRoutes.routes);

    //Rutas para instituciones educativas (independiente de sedes)
    router.use(`/api/instituciones`, InstitucionesRouter.routes);

    //Rutas globales para jornadas
    router.use(`/api`, JornadasGlobalRouter.routes);

    return router;
  }
}




