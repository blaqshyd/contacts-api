import { createClient } from "redis";

const createRedisClient = () => {
  if (process.env.NODE_ENV === "production") {
    // Production configuration
    return createClient({
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    });
  } else {
    // Development configuration
    return createClient({
      url: "redis://localhost:6379",
    });
  }
};

const client = createRedisClient();

client.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

client.on("connect", () => {
  console.log("Connected to Redis successfully");
});

// Connect to Redis
const connectRedis = async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
};

connectRedis();

export default client;
