import mongoose from 'mongoose';
import { env } from './env';

let connected = false;

export async function connectDB(uri: string = env.MONGODB_URI): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { autoIndex: true });
  connected = true;
  // eslint-disable-next-line no-console
  console.log(`[db] connected: ${mongoose.connection.name}`);
  return mongoose;
}

export async function disconnectDB(): Promise<void> {
  if (!connected) return;
  await mongoose.disconnect();
  connected = false;
}

export function isConnected(): boolean {
  return connected && mongoose.connection.readyState === 1;
}
