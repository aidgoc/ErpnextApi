import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing MongoDB connection...');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV);

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ MongoDB connection failed:', error.message);
  process.exit(1);
}
