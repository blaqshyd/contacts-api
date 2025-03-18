import jwt from "jsonwebtoken";
import { statusCode } from "../constants.js";

const validateRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken; // Assuming you store it in cookies

    if (!refreshToken) {
      return res.status(statusCode.UNAUTHORIZED).json({
        code: statusCode.UNAUTHORIZED,
        success: false,
        message: "Refresh token is missing",
      });
    }

    const verified = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    const message =
      err instanceof jwt.JsonWebTokenError
        ? "Invalid refresh token"
        : "Refresh token verification failed";

    res.status(statusCode.UNAUTHORIZED).json({
      code: statusCode.UNAUTHORIZED,
      success: false,
      message,
    });
  }
};

export default validateRefreshToken;
