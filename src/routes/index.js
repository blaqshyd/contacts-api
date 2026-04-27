import { Router } from "express";
import authRouter from "./authRoutes.js";
import contactRoutes from "./contactRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();

// API routes
router.use("/auth", authRouter);
router.use("/contact", contactRoutes);
router.use("/user", userRoutes);

// Health check endpoint
router.get("/", (req, res) => {
  try {
    res.json({
      code: res.statusCode,
      status: true,
      message: "Welcome to the Contact API",
      data: {
        name: "Blaqshyd",
        description: "A simple contact API",
        version: "1.0.0",
        author: "Blaqshyd",
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      status: false,
      message: "Internal server error",
    });
  }
});

export default router;
