import jwt from "jsonwebtoken";
import { constants, statusCode } from "../constants.js";
import { isTokenBlacklisted } from "../utils/tokenBlacklist.js";
import { errorResponse } from "../utils/responseHelper.js";

const tokenValidator = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return errorResponse(res, statusCode.UNAUTHORIZED, "Authorization header is missing");
    }

    const token = authHeader.startsWith(constants.BEARER_PREFIX)
      ? authHeader.slice(constants.BEARER_LENGTH)
      : authHeader;

    if (!token) {
      return errorResponse(res, statusCode.UNAUTHORIZED, "No authentication token provided");
    }

    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return errorResponse(res, statusCode.UNAUTHORIZED, "Token has been revoked");
    }

    req.user = verified;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return errorResponse(res, statusCode.UNAUTHORIZED, "Token has expired");
    }
    const message =
      err instanceof jwt.JsonWebTokenError
        ? "Invalid token format"
        : "Token verification failed";
    return errorResponse(res, statusCode.UNAUTHORIZED, message);
  }
};

export default tokenValidator;
