import jwt from "jsonwebtoken";
import { statusCode } from "../constants.js";
import { errorResponse } from "../utils/responseHelper.js";

const validateRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return errorResponse(res, statusCode.UNAUTHORIZED, "Refresh token is missing");
    }

    const verified = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return errorResponse(res, statusCode.UNAUTHORIZED, "Refresh token has expired");
    }
    const message =
      err instanceof jwt.JsonWebTokenError
        ? "Invalid refresh token"
        : "Refresh token verification failed";
    return errorResponse(res, statusCode.UNAUTHORIZED, message);
  }
};

export default validateRefreshToken;
