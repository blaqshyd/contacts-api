import { createClient } from "redis";
import "./env.config.js";

let client;
let isConnected = false;
let isConnecting = false;

const createRedisClient = () => {
  const environment = process.env.NODE_ENV || "development";

  if (environment === "production") {
    // Environment variables are already validated in env.config.js
    // Just ensure they exist before using them
    if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
      throw new Error("Redis host or port not configured for production");
    }

    console.log(
      "🟢 Connecting to Production Redis at:",
      process.env.REDIS_HOST,
    );
    return createClient({
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    });
  } else {
    console.log("🟢 Connecting to Development Redis at: localhost:6379");
    return createClient({
      url: "redis://localhost:6379",
    });
  }
};

const connectWithRetry = async (client, maxRetries = 5, delay = 1000) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      await client.connect();
      isConnected = true;
      isConnecting = false;
      console.log("Connected to Redis successfully 🚀");
      return;
    } catch (err) {
      retries++;
      isConnecting = false;
      console.error(
        `Failed to connect to Redis, retrying (${retries}/${maxRetries})...`,
        err.message,
      );
      if (retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        isConnecting = true;
      }
    }
  }
  isConnecting = false;
  throw new Error(`Failed to connect to Redis after ${maxRetries} retries`);
};

const closeClient = async () => {
  if (client && isConnected) {
    try {
      await client.quit();
      isConnected = false;
      console.log("Redis client disconnected");
    } catch (err) {
      console.error("Error disconnecting Redis client:", err.message);
    }
  }
};

const ensureConnected = async () => {
  if (!client) {
    client = createRedisClient();
    setupEventListeners();
  }

  if (isConnected) return;
  if (isConnecting) {
    // Wait for existing connection attempt
    while (isConnecting) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return;
  }

  isConnecting = true;
  try {
    await connectWithRetry(client);
  } catch (err) {
    isConnecting = false;
    throw err;
  }
};

const setupEventListeners = () => {
  client.on("error", (err) => {
    console.error("Redis Client Error:", err);
    isConnected = false;
  });

  client.on("connect", () => {
    isConnected = true;
    isConnecting = false;
  });

  client.on("end", () => {
    isConnected = false;
    console.log("Redis connection closed");
  });
};

// Initialize client
client = createRedisClient();
setupEventListeners();

const connectRedis = async () => {
  try {
    await ensureConnected();
  } catch (err) {
    console.error("Failed to connect to Redis after retries:", err);
    // Don't exit in production, but log the error
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  }
};

process.on("SIGTERM", closeClient);
process.on("SIGINT", closeClient);

connectRedis();

export default client;
export { ensureConnected, isConnected };
