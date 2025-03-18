import Redis from "redis";

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries) => {
      // Maximum retry delay is 3 seconds
      return Math.min(retries * 50, 3000);
    },
  },
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis successfully");
});

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    // Optional: you might want to exit the process if Redis is critical
    // process.exit(1);
  }
};

connectRedis();

export const blacklistToken = async (token, expiryTime) => {
  try {
    await redisClient.set(`bl_${token}`, "true", {
      EX: expiryTime, // Time in seconds
    });
  } catch (err) {
    console.error("Error blacklisting token:", err);
    throw err;
  }
};

export const isTokenBlacklisted = async (token) => {
  try {
    return (await redisClient.get(`bl_${token}`)) !== null;
  } catch (err) {
    console.error("Error checking blacklisted token:", err);
    throw err;
  }
};
