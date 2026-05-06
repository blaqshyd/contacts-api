import jwt from "jsonwebtoken";
import { constants, statusCode } from "../constants.js";
import { errorResponse } from "../utils/responseHelper.js";

const emailVerificationValidator = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return errorResponse(res, statusCode.UNAUTHORIZED, "Authorization header is missing");
    }

    const token = authHeader.startsWith(constants.BEARER_PREFIX)
      ? authHeader.slice(constants.BEARER_LENGTH)
      : authHeader;

    if (!token) {
      return errorResponse(res, statusCode.UNAUTHORIZED, "No verification token provided");
    }

    const verified = jwt.verify(token, process.env.VERIFY_TOKEN_SECRET);

    req.user = verified;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return errorResponse(res, statusCode.UNAUTHORIZED, "Verification token has expired");
    }
    const message =
      err instanceof jwt.JsonWebTokenError
        ? "Invalid verification token format"
        : "Verification token validation failed";
    return errorResponse(res, statusCode.UNAUTHORIZED, message);
  }
};

export default emailVerificationValidator;
