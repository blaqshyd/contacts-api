import jwt from "jsonwebtoken";
import { constants, statusCode } from "../constants.js";
import { isTokenBlacklisted } from "../utils/tokenBlacklist.js";

const tokenValidator = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(statusCode.UNAUTHORIZED).json({
        code: statusCode.UNAUTHORIZED,
        success: false,
        message: "Authorization header is missing",
      });
    }

    const token = authHeader.startsWith(constants.BEARER_PREFIX)
      ? authHeader.slice(constants.BEARER_LENGTH)
      : authHeader;

    if (!token) {
      return res.status(statusCode.UNAUTHORIZED).json({
        code: statusCode.UNAUTHORIZED,
        success: false,
        message: "No authentication token provided",
      });
    }

    // Add token expiration check
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (verified.exp && Date.now() >= verified.exp * 1000) {
      return res.status(statusCode.UNAUTHORIZED).json({
        code: statusCode.UNAUTHORIZED,
        success: false,
        message: "Token has expired",
      });
    }

    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(statusCode.UNAUTHORIZED).json({
        code: statusCode.UNAUTHORIZED,
        success: false,
        message: "Token has been revoked",
      });
    }

    req.user = verified;
    next();
  } catch (err) {
    // More specific error handling
    const message =
      err instanceof jwt.JsonWebTokenError
        ? "Invalid token format"
        : "Token verification failed";

    res.status(statusCode.UNAUTHORIZED).json({
      code: statusCode.UNAUTHORIZED,
      success: false,
      message,
    });
  }
};

export default tokenValidator;
