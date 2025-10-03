import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   POST /auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', AuthController.login);

/**
 * @route   POST /auth/refresh
 * @desc    Renovar token usando refresh token
 * @access  Public
 */
router.post('/refresh', AuthController.refreshToken);

/**
 * @route   GET /auth/me
 * @desc    Obtener información del usuario autenticado
 * @access  Private
 */
router.get('/me', authMiddleware, AuthController.me);

/**
 * @route   POST /auth/logout
 * @desc    Cerrar sesión
 * @access  Private
 */
router.post('/logout', authMiddleware, AuthController.logout);

/**
 * @route   POST /auth/change-password
 * @desc    Cambiar contraseña del usuario autenticado
 * @access  Private
 */
router.post('/change-password', authMiddleware, AuthController.cambiarContrasena);

export default router;