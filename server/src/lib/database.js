import mongoose from 'mongoose';

let databaseConnected = false;

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    if (process.env.REQUIRE_MONGODB === 'true') {
      throw new Error('MONGODB_URI is required. Add it to server/.env.');
    }

    console.warn('MONGODB_URI is not set. Using local JSON storage for development/demo mode.');
    return false;
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  databaseConnected = true;
  console.log('MongoDB connected');
  return true;
}

export function isDatabaseConnected() {
  return databaseConnected;
}