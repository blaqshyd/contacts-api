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
import tokenValidator from "../middleware/tokenValidator.js";
import validateRefreshToken from "../middleware/validateRefreshToken.js";

const authRouter = Router();

authRouter
  .post("/register", registerUser)
  .post("/login", loginUser)
  .post("/verify-email", tokenValidator, verifyEmail)
  .post("/forgot-password", tokenValidator, forgotPassword)
  .post("/reset-password", tokenValidator, resetPassword)
  .post("/logout", tokenValidator, logout)
  .post("/refresh", validateRefreshToken, refreshToken);

export default authRouter;
