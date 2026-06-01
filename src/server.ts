import http from 'node:http';
import { app } from './app';
import { env } from './config/env';
import { prisma } from './database/prisma';
import { createSocketServer } from './socket/socket.service';

async function bootstrap() {
  await prisma.$connect();
  console.log('✅ Database connected');

  const httpServer = http.createServer(app);
  const io = createSocketServer(httpServer);

  httpServer.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    console.log(`⚡ Socket.io ready`);
  });

  // Expose io instance globally if needed by services
  (globalThis as any).io = io;
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
