import { Router } from "express";
import {
  currentUserInfo,
  loginUser,
  registerUser,
} from "../controllers/userController.js";
import validateToken from "../middleware/validateTokenHandler.js";

const router = Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/info", validateToken, currentUserInfo);

export default router;
