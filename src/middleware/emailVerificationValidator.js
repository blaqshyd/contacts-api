import jwt from "jsonwebtoken";
import { constants, statusCode } from "../constants.js";

const emailVerificationValidator = async (req, res, next) => {
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
        message: "No verification token provided",
      });
    }

    // Verify with email verification secret
    const verified = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
    if (verified.exp && Date.now() >= verified.exp * 1000) {
      return res.status(statusCode.UNAUTHORIZED).json({
        code: statusCode.UNAUTHORIZED,
        success: false,
        message: "Verification token has expired",
      });
    }

    req.user = verified;
    next();
  } catch (err) {
    const message =
      err instanceof jwt.JsonWebTokenError
        ? "Invalid verification token format"
        : "Verification token validation failed";

    res.status(statusCode.UNAUTHORIZED).json({
      code: statusCode.UNAUTHORIZED,
      success: false,
      message,
    });
  }
};

export default emailVerificationValidator;
