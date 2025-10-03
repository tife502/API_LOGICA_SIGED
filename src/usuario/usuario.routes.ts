import { Router } from 'express';
import { UsuarioController } from './usuario.controller';
import { authMiddleware, roleMiddleware, canModifyUserMiddleware } from '../middlewares/auth.middleware';
import { validateCreateUser, validateUpdateUser } from '../middlewares/validation.middleware';

/**
 * Rutas para la gestión de usuarios
 * Implementa autenticación, autorización y validación de datos
 */
export class UsuarioRoutes {
  static get routes() {
    const router = Router();
    const usuarioController = new UsuarioController();

    // ============= RUTAS PÚBLICAS (sin autenticación) =============
    // Nota: En producción podrías querer restringir algunas de estas

    // ============= RUTAS PROTEGIDAS =============
    
    // Crear usuario - Solo admin y super_admin
    router.post('/', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin']),
      validateCreateUser,
      usuarioController.createUsuario
    );

    // Obtener usuarios - Todos los usuarios autenticados
    router.get('/', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin']),
      usuarioController.getUsuarios
    );

    // Obtener usuarios inactivos - Solo admin y super_admin
    router.get('/inactivos', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin']),
      usuarioController.getUsuariosInactivos
    );

    // Obtener usuario por ID - Usuarios pueden ver su propio perfil, admin ve todos
    router.get('/:id', 
      authMiddleware,
      usuarioController.getUsuarioById
    );

    // Actualizar usuario - Usuarios pueden editar su perfil, admin puede editar otros
    router.put('/:id', 
      authMiddleware,
      canModifyUserMiddleware,
      validateUpdateUser,
      usuarioController.updateUsuario
    );

    // Desactivar usuario (borrado lógico) - Solo admin y super_admin
    router.delete('/:id', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin']),
      usuarioController.deleteUsuario
    );

    // Reactivar usuario - Solo admin y super_admin
    router.patch('/:id/reactivar', 
      authMiddleware,
      roleMiddleware(['super_admin', 'admin']),
      usuarioController.reactivarUsuario
    );

    // Cambiar contraseña - Usuarios pueden cambiar su propia contraseña, admin puede cambiar cualquiera
    router.patch('/:id/cambiar-contrasena', 
      authMiddleware,
      canModifyUserMiddleware,
      usuarioController.cambiarContrasena
    );

    router.post('/create-initial-user', usuarioController.createInitialUser);


    return router;
  }
}

export default UsuarioRoutes;
