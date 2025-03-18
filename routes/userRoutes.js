import { Router } from "express";
import { currentUserInfo } from "../controllers/userController.js";
import validateToken from "../middleware/tokenValidator.js";

const router = Router();

router.use(validateToken);

router.get("/info", currentUserInfo);

export default router;
