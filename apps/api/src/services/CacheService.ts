import Redis from 'ioredis';

class CacheService {
  private client: Redis | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      this.client = new Redis(redisUrl, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      this.client.on('connect', () => {
        console.log('✓ Conectado a Redis');
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        console.error('Error de Redis:', error);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('Conexión a Redis cerrada');
        this.isConnected = false;
      });
    } catch (error) {
      console.error('Error conectando a Redis:', error);
      this.client = null;
      this.isConnected = false;
    }
  }

  /**
   * Verificar si Redis está disponible
   */
  isAvailable(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Obtener valor del caché
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable()) return null;

    try {
      const value = await this.client!.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error obteniendo clave ${key}:`, error);
      return null;
    }
  }

  /**
   * Guardar valor en caché
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const serialized = JSON.stringify(value);

      if (ttlSeconds) {
        await this.client!.setex(key, ttlSeconds, serialized);
      } else {
        await this.client!.set(key, serialized);
      }

      return true;
    } catch (error) {
      console.error(`Error guardando clave ${key}:`, error);
      return false;
    }
  }

  /**
   * Eliminar valor del caché
   */
  async delete(key: string): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      await this.client!.del(key);
      return true;
    } catch (error) {
      console.error(`Error eliminando clave ${key}:`, error);
      return false;
    }
  }

  /**
   * Eliminar múltiples claves por patrón
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!this.isAvailable()) return 0;

    try {
      const keys = await this.client!.keys(pattern);
      if (keys.length === 0) return 0;

      await this.client!.del(...keys);
      return keys.length;
    } catch (error) {
      console.error(`Error eliminando patrón ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Verificar si existe una clave
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const result = await this.client!.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Error verificando clave ${key}:`, error);
      return false;
    }
  }

  /**
   * Establecer tiempo de expiración
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      await this.client!.expire(key, seconds);
      return true;
    } catch (error) {
      console.error(`Error estableciendo expiración para ${key}:`, error);
      return false;
    }
  }

  /**
   * Incrementar contador
   */
  async increment(key: string, by: number = 1): Promise<number> {
    if (!this.isAvailable()) return 0;

    try {
      return await this.client!.incrby(key, by);
    } catch (error) {
      console.error(`Error incrementando ${key}:`, error);
      return 0;
    }
  }

  /**
   * Obtener con fallback (si no existe en caché, ejecutar función y cachear)
   */
  async getOrSet<T>(
    key: string,
    fallbackFn: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T | null> {
    // Intentar obtener del caché
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Si no existe, ejecutar función de fallback
    try {
      const value = await fallbackFn();
      await this.set(key, value, ttlSeconds);
      return value;
    } catch (error) {
      console.error(`Error en getOrSet para ${key}:`, error);
      return null;
    }
  }

  /**
   * Limpiar todo el caché (usar con precaución)
   */
  async flush(): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      await this.client!.flushdb();
      return true;
    } catch (error) {
      console.error('Error limpiando caché:', error);
      return false;
    }
  }

  /**
   * Obtener información de Redis
   */
  async getInfo(): Promise<any> {
    if (!this.isAvailable()) return null;

    try {
      const info = await this.client!.info();
      return info;
    } catch (error) {
      console.error('Error obteniendo info de Redis:', error);
      return null;
    }
  }

  /**
   * Cerrar conexión
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
    }
  }
}

// Exportar instancia singleton
export const cacheService = new CacheService();

// Claves de caché predefinidas
export const CacheKeys = {
  // Visitas
  activeVisits: () => 'visits:active',
  visitByQR: (qrId: string) => `visit:qr:${qrId}`,
  visitsByResident: (residentId: string) => `visits:resident:${residentId}`,

  // Usuarios
  userById: (userId: string) => `user:${userId}`,
  userByEmail: (email: string) => `user:email:${email}`,

  // Estadísticas
  visitStats: () => 'stats:visits',
  parkingStats: () => 'stats:parking',
  auditStats: () => 'stats:audit',

  // Parqueaderos
  availableParking: (type: string) => `parking:available:${type}`,
  activeAssignments: () => 'parking:assignments:active',

  // Listas de acceso
  blacklist: () => 'access:blacklist',
  whitelist: () => 'access:whitelist',

  // Visitas recurrentes
  recurringActive: () => 'recurring:active',
};

// TTL predefinidos (en segundos)
export const CacheTTL = {
  short: 60, // 1 minuto
  medium: 300, // 5 minutos
  long: 900, // 15 minutos
  veryLong: 3600, // 1 hora
  day: 86400, // 24 horas
};
