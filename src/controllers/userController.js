import bcryptjs from "bcryptjs";
import { statusCode } from "../constants.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import { successResponse, errorResponse } from "../utils/responseHelper.js";
import { transformUser, transformUserMinimal } from "../utils/userTransformer.js";

export const currentUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return errorResponse(res, statusCode.NOT_FOUND, "User not found");
    }
    return successResponse(res, statusCode.OK, "User profile retrieved", transformUser(user, { includeSensitive: true }));
  } catch (err) {
    return errorResponse(res, statusCode.SERVER_ERROR, "Failed to retrieve profile", err.message);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { email, username } = req.body;
    const user = req.user;

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return errorResponse(res, statusCode.CONFLICT, "Email already exists");
      }
      user.email = email;
    }

    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return errorResponse(res, statusCode.CONFLICT, "Username is taken");
      }
      user.username = username;
    }

    const updatedUser = await user.save();
    return successResponse(res, statusCode.OK, "User updated successfully", transformUserMinimal(updatedUser));
  } catch (err) {
    return errorResponse(res, statusCode.SERVER_ERROR, "Failed to update user", err.message);
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, statusCode.BAD_REQUEST, "Current password and new password are required");
    }

    const user = req.user;
    const correctPassword = await bcryptjs.compare(currentPassword, user.password);
    if (!correctPassword) {
      return errorResponse(res, statusCode.UNAUTHORIZED, "Current password is incorrect");
    }

    user.password = await bcryptjs.hash(newPassword, 12);
    await user.save();

    return successResponse(res, statusCode.OK, "Password updated successfully");
  } catch (err) {
    return errorResponse(res, statusCode.SERVER_ERROR, "Failed to update password", err.message);
  }
};

export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.userId);
    return successResponse(res, statusCode.OK, "Account deleted successfully", { id: req.user.userId });
  } catch (err) {
    return errorResponse(res, statusCode.SERVER_ERROR, "Failed to delete user", err.message);
  }
};

export const getUserPreferences = async (req, res) => {
  try {
    return successResponse(res, statusCode.OK, "Preferences retrieved", req.user.preferences || {});
  } catch (err) {
    return errorResponse(res, statusCode.SERVER_ERROR, "Failed to retrieve preferences", err.message);
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const user = req.user;
    user.preferences = { ...user.preferences, ...req.body };
    await user.save();
    return successResponse(res, statusCode.OK, "Preferences updated", user.preferences);
  } catch (err) {
    return errorResponse(res, statusCode.SERVER_ERROR, "Failed to update preferences", err.message);
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, statusCode.BAD_REQUEST, "No file uploaded");
    }

    const user = req.user;
    user.avatar = req.file.path;
    await user.save();

    return successResponse(res, statusCode.OK, "Avatar uploaded successfully", { avatarUrl: user.avatar });
  } catch (err) {
    return errorResponse(res, statusCode.SERVER_ERROR, "Failed to upload avatar", err.message);
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    return successResponse(res, statusCode.OK, "Notifications retrieved", notifications);
  } catch (err) {
    return errorResponse(res, statusCode.SERVER_ERROR, "Failed to retrieve notifications", err.message);
  }
};

export const updateNotificationSettings = async (req, res) => {
  try {
    const user = req.user;
    user.notificationSettings = { ...user.notificationSettings, ...req.body };
    await user.save();
    return successResponse(res, statusCode.OK, "Notification settings updated", user.notificationSettings);
  } catch (err) {
    return errorResponse(res, statusCode.SERVER_ERROR, "Failed to update notification settings", err.message);
  }
};
