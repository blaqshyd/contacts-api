import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, "..", ".env") });

// Validate required environment variables
const requiredEnvVars = [
  "NODE_ENV",
  "REDIS_USERNAME",
  "REDIS_PASSWORD",
  "REDIS_HOST",
  "REDIS_PORT",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.warn(`⚠️ Warning: ${envVar} is not set in environment variables`);
  }
});

// Log current environment
console.log("📚 Environment variables loaded");
