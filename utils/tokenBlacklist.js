import redisClient from "./redis_client.js";

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
