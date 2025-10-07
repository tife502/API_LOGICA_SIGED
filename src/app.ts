import { envs } from './config/envs';
import { AppRoutes } from './presentation/routes';
import { Server } from './presentation/server';
import { createServer } from 'http';

(async () => {
  main();
})();

function main() {
  const server = new Server({
    port: envs.PORT,
  });
  const httpServer = createServer(server.app);


  server.setRoutes(AppRoutes.routes);

  httpServer.listen(envs.PORT, '0.0.0.0', () => {
    console.log(`Server corriendo en el puerto ${envs.PORT}`);

  });
}