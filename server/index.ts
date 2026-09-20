import { buildApp } from './app';
import { config } from './config';

async function main() {
  const app = await buildApp();

  // Handle graceful shutdown signals
  const closeSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  closeSignals.forEach((signal) => {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}. Gracefully shutting down ORCA server...`);
      try {
        await app.close();
        app.log.info('ORCA server stopped cleanly.');
        process.exit(0);
      } catch (err) {
        app.log.error(err, 'Error during server shutdown.');
        process.exit(1);
      }
    });
  });

  try {
    await app.listen({
      port: config.PORT,
      host: config.HOST,
    });
    app.log.info(`ORCA Backend API Server listening at http://${config.HOST}:${config.PORT}`);
    app.log.info(`Health check: http://${config.HOST}:${config.PORT}/health`);
  } catch (err) {
    app.log.error(err, 'Failed to start ORCA server.');
    process.exit(1);
  }
}

main();
