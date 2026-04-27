import redisClient, {
  ensureConnected,
  isConnected,
} from "../config/redis_client.js";

/**
 * Blacklists a token by storing it in Redis with an expiry time
 * @param {string} token - The JWT token to blacklist
 * @param {number} expiryTime - Time in seconds until the token should be automatically unblacklisted
 * @throws {Error} If token is invalid or Redis operation fails
 */
export const blacklistToken = async (token, expiryTime) => {
  // Input validation
  if (!token || typeof token !== "string" || token.trim() === "") {
    throw new Error("Invalid token: token must be a non-empty string");
  }

  if (!expiryTime || typeof expiryTime !== "number" || expiryTime <= 0) {
    throw new Error("Invalid expiryTime: must be a positive number");
  }

  try {
    // Ensure Redis connection is established
    if (!isConnected) {
      await ensureConnected();
    }

    // Store the blacklisted token with expiry
    await redisClient.set(`bl_${token}`, "true", {
      EX: Math.floor(expiryTime), // Ensure it's an integer
    });

    console.log(`Token blacklisted successfully (expires in ${expiryTime}s)`);
  } catch (err) {
    console.error("Error blacklisting token:", err.message);
    throw new Error(`Failed to blacklist token: ${err.message}`);
  }
};

/**
 * Checks if a token is blacklisted
 * @param {string} token - The JWT token to check
 * @returns {Promise<boolean>} True if token is blacklisted, false otherwise
 * @throws {Error} If token is invalid or Redis operation fails
 */
export const isTokenBlacklisted = async (token) => {
  // Input validation
  if (!token || typeof token !== "string" || token.trim() === "") {
    throw new Error("Invalid token: token must be a non-empty string");
  }

  try {
    // Ensure Redis connection is established
    if (!isConnected) {
      await ensureConnected();
    }

    const result = await redisClient.get(`bl_${token}`);
    return result !== null;
  } catch (err) {
    console.error("Error checking blacklisted token:", err.message);
    // In case of Redis failure, we should fail safe and assume token is valid
    // This prevents locking users out due to Redis issues
    console.warn(
      "Redis error - failing safe: assuming token is not blacklisted",
    );
    return false;
  }
};

/**
 * Removes a token from the blacklist (useful for testing or manual override)
 * @param {string} token - The JWT token to unblacklist
 * @throws {Error} If token is invalid or Redis operation fails
 */
export const unblacklistToken = async (token) => {
  // Input validation
  if (!token || typeof token !== "string" || token.trim() === "") {
    throw new Error("Invalid token: token must be a non-empty string");
  }

  try {
    // Ensure Redis connection is established
    if (!isConnected) {
      await ensureConnected();
    }

    await redisClient.del(`bl_${token}`);
    console.log(`Token unblacklisted successfully`);
  } catch (err) {
    console.error("Error unblacklisting token:", err.message);
    throw new Error(`Failed to unblacklist token: ${err.message}`);
  }
};
