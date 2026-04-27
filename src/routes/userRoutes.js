import express from "express";
import * as userController from "../controllers/userController.js";
import tokenValidator from "../middleware/tokenValidator.js";
import { uploadAvatar } from "../middleware/uploadMiddleware.js";
import {
  validatePasswordUpdate,
  validatePreferencesUpdate,
  validateProfileUpdate,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

// Profile management
router.get("/profile", tokenValidator, userController.currentUserInfo);
router.put(
  "/profile",
  tokenValidator,
  validateProfileUpdate,
  userController.updateProfile
);
router.patch(
  "/profile/password",
  tokenValidator,
  validatePasswordUpdate,
  userController.updatePassword
);
router.delete("/profile", tokenValidator, userController.deleteAccount);

// Preferences & Settings
router.get(
  "/profile/preferences",
  tokenValidator,
  userController.getUserPreferences
);
router.put(
  "/profile/preferences",
  tokenValidator,
  validatePreferencesUpdate,
  userController.updatePreferences
);

// Profile-specific features
router.post(
  "/profile/avatar",
  tokenValidator,
  uploadAvatar,
  userController.uploadAvatar
);
router.get(
  "/profile/notifications",
  tokenValidator,
  userController.getNotifications
);
router.put(
  "/profile/notifications/settings",
  tokenValidator,
  userController.updateNotificationSettings
);

export default router;
