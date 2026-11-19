import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';

const TEST_URI = process.env.TEST_MONGODB_URI ?? 'mongodb://127.0.0.1:27017/fittrack_test';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
  await connectDB(TEST_URI);
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});
