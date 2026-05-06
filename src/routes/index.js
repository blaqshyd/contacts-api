import { Router } from "express";
import authRouter from "./authRoutes.js";
import contactRoutes from "./contactRoutes.js";
import userRoutes from "./userRoutes.js";
import { successResponse } from "../utils/responseHelper.js";

const router = Router();

router.get("/health", (req, res) => {
  return successResponse(res, 200, "System is running well", "System is running well");
});

router.use("/auth", authRouter);
router.use("/contact", contactRoutes);
router.use("/user", userRoutes);

export default router;
