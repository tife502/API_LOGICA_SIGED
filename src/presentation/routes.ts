import { Router } from 'express';
import { ModuloRoutes } from '../modulo/modulo.routes';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    /*  
    aqui iran el nombre de los modulos que usaremos y la importacion de sus rutas por defecto esta prsima como ORMs
    */
  
    router.use(`/api/modulo`,ModuloRoutes.routes)
    // aqui colocare la nueva ruta para el manejo del email
 

    return router;
  }
}




