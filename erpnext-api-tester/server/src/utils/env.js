import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  PORT: z.string().transform(Number).default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  ENCRYPTION_KEY_BASE64: z.string().min(1, 'ENCRYPTION_KEY_BASE64 is required'),
});

// Validate environment variables
function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
    return env;
  } catch (error) {
    console.error('❌ Environment validation failed:');
    if (error.errors) {
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error(`  - ${error.message}`);
    }
    process.exit(1);
  }
}

// Export validated environment variables
export const env = validateEnv();

// Export individual variables for convenience
export const {
  PORT,
  NODE_ENV,
  MONGODB_URI,
  ENCRYPTION_KEY_BASE64
} = env;

