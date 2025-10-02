import { PrismaClient } from '@prisma/client';
import { envs } from '../config/envs';



class PrismaConnection extends PrismaClient {
  private static instance: PrismaConnection;

  constructor() {
    super({
      log: ['warn', 'error'],
      datasources: {
        db: {
          url: envs.DATABASE_URL || "",
        },
      },
    });

    this.init();
  }

  public static getInstance(): PrismaConnection {
    if (!PrismaConnection.instance) {
      PrismaConnection.instance = new PrismaConnection();
    }
    return PrismaConnection.instance;
  }

  async init() {
    try {
      await this.$connect();
      console.log(`Conexión a la base de datos establecida correctamente.`);
    } catch (error) {
      console.error('Error al conectar con la base de datos:', error);
    }
  }

  async destroy() {
    try {
      await this.$disconnect();
      console.log('Conexión a la base de datos cerrada.');
    } catch (error) {
      console.error('Error al cerrar la conexión con la base de datos:', error);
    }
  }

  public async cleanup() {
    await this.$disconnect();
  }
}

const setupGracefulShutdown = () => {
  const prismaInstance = PrismaConnection.getInstance();
  
  process.on('SIGINT', async () => {
    await prismaInstance.destroy();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await prismaInstance.destroy();
    process.exit(0);
  });
};

if (require.main === module) {
  setupGracefulShutdown();
}

export default PrismaConnection;
export { setupGracefulShutdown };