import { Router } from "express";
import {
  forgotPassword,
  loginUser,
  logout,
  refreshToken,
  registerUser,
  resetPassword,
  verifyEmail,
} from "../controllers/authController.js";
import emailVerificationValidator from "../middleware/emailVerificationValidator.js";
import tokenValidator from "../middleware/tokenValidator.js";
import validateRefreshToken from "../middleware/validateRefreshToken.js";
import { authLimiter, strictLimiter } from "../config/rateLimiter.js";

const authRouter = Router();

authRouter
  .post("/register", authLimiter, registerUser)
  .post("/login", authLimiter, loginUser)
  .post("/verify-email", emailVerificationValidator, verifyEmail)
  .post("/forgot-password", strictLimiter, forgotPassword)
  .post("/reset-password", strictLimiter, resetPassword)
  .post("/logout", tokenValidator, logout)
  .post("/refresh", validateRefreshToken, refreshToken);

export default authRouter;
