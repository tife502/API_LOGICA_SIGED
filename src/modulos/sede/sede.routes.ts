import { Router } from 'express';
import { SedeController } from './sede.controller';
import { authMiddleware, roleMiddleware } from '../../middlewares/auth.middleware';
import { ComentarioSedeRoutes } from './comentarios/comentarios.routes';
import { AsignacionEmpleadoRoutes } from './asignaciones/asignaciones.routes';
import { InstitucionEducativaRoutes } from './instituciones/instituciones.routes';
import { JornadaRoutes } from './jornadas/jornadas.routes';

/**
 * Rutas principales para la gestión integral de sedes educativas
 * Sistema modular completo con subcarpetas especializadas
 */
export class SedeRoutes {
  static get routes() {
    const router = Router();
    const sedeController = new SedeController();

    // ============= GESTIÓN PRINCIPAL DE SEDES =============
    
    /**
     * @route POST /sede
     * @desc Crear nueva sede
     * @access super_admin, admin
     */
    router.post('/', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin']),
      async (req, res) => {
        await sedeController.createSede(req, res);
      }
    );

    /**
     * @route GET /sede
     * @desc Obtener todas las sedes con filtros y paginación
     * @access super_admin, admin, gestor
     * @query nombre, estado, zona, codigo_DANE, page, limit
     */
    router.get('/', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin', 'gestor']),
      async (req, res) => {
        await sedeController.getSedes(req, res);
      }
    );

    /**
     * @route GET /sede/:id
     * @desc Obtener sede por ID con todas sus relaciones
     * @access super_admin, admin, gestor
     */
    router.get('/:id', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin', 'gestor']),
      async (req, res) => {
        await sedeController.getSedeById(req, res);
      }
    );

    /**
     * @route PUT /sede/:id
     * @desc Actualizar sede
     * @access super_admin, admin
     */
    router.put('/:id', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin']),
      async (req, res) => {
        await sedeController.updateSede(req, res);
      }
    );

    /**
     * @route DELETE /sede/:id
     * @desc Eliminar sede
     * @access super_admin
     */
    router.delete('/:id', 
      authMiddleware,
      roleMiddleware(['super_admin']),
      async (req, res) => {
        await sedeController.deleteSede(req, res);
      }
    );

    // ============= SUBMÓDULOS ESPECIALIZADOS =============

    /**
     * Comentarios y observaciones de sedes
     * @routes /sede/:sede_id/comentarios/*
     */
    router.use('/:sede_id/comentarios', ComentarioSedeRoutes.routes);

    /**
     * Asignaciones empleado-sede
     * @routes /sede/:sede_id/asignaciones/*
     */
    router.use('/:sede_id/asignaciones', AsignacionEmpleadoRoutes.routes);

    /**
     * Jornadas y horarios de sedes
     * @routes /sede/:sede_id/jornadas/*
     */
    router.use('/:sede_id/jornadas', JornadaRoutes.routes);

    return router;
  }
}

/**
 * Router independiente para instituciones educativas
 * Se monta por separado ya que no depende de una sede específica
 */
export class InstitucionesRouter {
  static get routes() {
    return InstitucionEducativaRoutes.routes;
  }
}

/**
 * Router independiente para todas las jornadas
 * Endpoint global para obtener jornadas disponibles
 */
export class JornadasGlobalRouter {
  static get routes() {
    const router = Router();
    
    // Ruta global para obtener todas las jornadas disponibles
    router.use('/jornadas', JornadaRoutes.routes);
    
    return router;
  }
}