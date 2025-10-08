import { logger } from '../config/adapters/winstonAdapter';

/**
 * Servicio para manejar tokens invalidados (blacklist)
 * En producción, esto debería usar Redis o una base de datos
 */
export class TokenBlacklistService {
  private static instance: TokenBlacklistService;
  private blacklistedTokens: Set<string> = new Set();
  private tokenExpirationMap: Map<string, number> = new Map();

  private constructor() {
    // Limpiar tokens expirados cada 15 minutos
    setInterval(() => {
      this.cleanExpiredTokens();
    }, 15 * 60 * 1000);
  }

  public static getInstance(): TokenBlacklistService {
    if (!TokenBlacklistService.instance) {
      TokenBlacklistService.instance = new TokenBlacklistService();
    }
    return TokenBlacklistService.instance;
  }

  /**
   * Agregar token a la blacklist
   */
  addToken(token: string, expirationTime?: number): void {
    try {
      this.blacklistedTokens.add(token);
      
      if (expirationTime) {
        this.tokenExpirationMap.set(token, expirationTime);
      }
    } catch (error) {
      logger.error('Error agregando token a blacklist', error);
    }
  }

  /**
   * Verificar si un token está en la blacklist
   */
  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  /**
   * Remover token de la blacklist (opcional)
   */
  removeToken(token: string): void {
    this.blacklistedTokens.delete(token);
    this.tokenExpirationMap.delete(token);
  }

  /**
   * Limpiar tokens expirados automáticamente
   */
  private cleanExpiredTokens(): void {
    const now = Math.floor(Date.now() / 1000);
    let cleanedCount = 0;

    for (const [token, expirationTime] of this.tokenExpirationMap.entries()) {
      if (expirationTime <= now) {
        this.blacklistedTokens.delete(token);
        this.tokenExpirationMap.delete(token);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
    }
  }

  /**
   * Obtener estadísticas de la blacklist
   */
  getStats(): { totalBlacklisted: number; withExpiration: number } {
    return {
      totalBlacklisted: this.blacklistedTokens.size,
      withExpiration: this.tokenExpirationMap.size
    };
  }

  /**
   * Limpiar toda la blacklist (solo para testing)
   */
  clearAll(): void {
    this.blacklistedTokens.clear();
    this.tokenExpirationMap.clear();
    logger.warn('Blacklist de tokens limpiada completamente');
  }
}

export default TokenBlacklistService;