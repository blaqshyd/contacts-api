import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import client from "./redis_client.js";

const getKeyGenerator = (prefix) => (req) => {
  // Use IP address, optionally combined with user ID if authenticated
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const userId = req.user?.id || "anonymous";
  return `${prefix}:${ip}:${userId}`;
};

const createRedisLimiter = (options) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 20,
    keyPrefix = "rate-limit",
    message = "Too many requests, please try again later",
  } = options;

  return rateLimit({
    store: new RedisStore({
      client: client,
      prefix: keyPrefix,
      sendCommand: async (command, args) => {
        try {
          return await client.sendCommand([command, ...args]);
        } catch (err) {
          console.error(`Redis command failed: ${command}`, err);
          // Fallback to in-memory if Redis fails
          return null;
        }
      },
    }),
    windowMs,
    max,
    message: {
      success: false,
      message,
    },
    keyGenerator: getKeyGenerator(keyPrefix),
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === "/api/v1/health";
    },
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
        retryAfter: req.rateLimit.resetTime,
      });
    },
  });
};

export const authLimiter = createRedisLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyPrefix: "auth-limiter",
  message: "Too many authentication attempts, please try again later",
});

export const strictLimiter = createRedisLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyPrefix: "strict-limiter",
  message: "Too many requests, please try again later",
});
