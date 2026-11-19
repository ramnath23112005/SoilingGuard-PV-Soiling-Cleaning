import http from 'http';
import { createApp } from './app';
import { connectDB, disconnectDB } from './config/db';
import { env } from './config/env';
import { logger } from './utils/logger';

async function main() {
  try {
    await connectDB();
  } catch (err) {
    logger.error('MongoDB connection failed - server will retry on requests', { err: String(err) });
    if (env.NODE_ENV === 'production') process.exit(1);
  }

  const app = createApp();
  const server = http.createServer(app);

  // Optional Socket.IO layer for real-time workout events
  try {
    const { Server } = require('socket.io');
    const io = new Server(server, { cors: { origin: env.CLIENT_URL === '*' ? true : env.CLIENT_URL.split(',') } });
    io.on('connection', (socket: { on: (ev: string, cb: (data: unknown) => void) => void; emit: (ev: string, data: unknown) => void }) => {
      socket.on('workout:set-completed', (data: unknown) => socket.emit('workout:set-confirmed', data));
      socket.on('disconnect', () => undefined);
    });
  } catch {
    /* socket.io optional */
  }

  server.listen(env.PORT, () => {
    logger.info(`FitTrack API listening on http://localhost:${env.PORT}`, { env: env.NODE_ENV });
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

void main();
