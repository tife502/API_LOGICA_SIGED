/**
 * Módulo de métodos especializados para empleados
 * Contiene servicios y controladores para flujos específicos de negocio
 */

// Exportar servicios especializados
export { RectorService } from './rector.service';
export { EmpleadoService } from './empleado.service';

// Exportar controladores especializados
export { RectorController } from './rector.controller';
export { EmpleadoNormalController } from './empleado.controller';

// Re-exportar rutas por conveniencia
export { default as rectorRoutes } from './rector.routes';
export { default as empleadoNormalRoutes } from './empleado.routes';