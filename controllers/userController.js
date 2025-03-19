import bcryptjs from "bcryptjs";
import { statusCode } from "../constants.js";
import errorHandler from "../middleware/errorHandler.js";
import User from "../models/userModel.js";

// @desc Get current user profile
// @route GET /api/users/profile
// @access Private
export const currentUserInfo = async (req, res) => {
  try {
    const userResponse = {
      userId: req.user._id,
      username: req.user.username,
      email: req.user.email,
      preferences: req.user.preferences,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    };

    res.status(statusCode.OK).json({
      code: res.statusCode,
      success: true,
      data: userResponse,
    });
  } catch (err) {
    errorHandler(err, req, res);
  }
};

// @desc Update user profile
// @route PUT /api/users/profile
// @access Private
export const updateProfile = async (req, res) => {
  try {
    const { email, username } = req.body;
    const user = req.user;

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(statusCode.CONFLICT).json({
          message: "Email already exists!",
        });
      }
      user.email = email;
    }

    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(statusCode.CONFLICT).json({
          message: "Username is taken!",
        });
      }
      user.username = username;
    }

    const updatedUser = await user.save();
    const userResponse = {
      userId: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      updatedAt: updatedUser.updatedAt,
    };

    res.status(statusCode.OK).json({
      code: res.statusCode,
      success: true,
      data: userResponse,
    });
  } catch (err) {
    errorHandler(err, req, res);
  }
};

// @desc Update password
// @route PATCH /api/users/profile/password
// @access Private
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    if (!currentPassword || !newPassword) {
      return res.status(statusCode.BAD_REQUEST).json({
        message: "Current password and new password are required",
      });
    }

    const correctPassword = await bcryptjs.compare(
      currentPassword,
      user.password
    );
    if (!correctPassword) {
      return res.status(statusCode.UNAUTHORIZED).json({
        message: "Current password is incorrect",
      });
    }

    user.password = await bcryptjs.hash(newPassword, 8);
    await user.save();

    res.status(statusCode.OK).json({
      code: res.statusCode,
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    errorHandler(err, req, res);
  }
};

// @desc Delete user account
// @route DELETE /api/users/profile
// @access Private
export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(statusCode.OK).json({
      code: res.statusCode,
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    errorHandler(err, req, res);
  }
};

// @desc Get user preferences
// @route GET /api/users/profile/preferences
// @access Private
export const getUserPreferences = async (req, res) => {
  try {
    res.status(statusCode.OK).json({
      code: res.statusCode,
      success: true,
      data: req.user.preferences || {},
    });
  } catch (err) {
    errorHandler(err, req, res);
  }
};

// @desc Update user preferences
// @route PUT /api/users/profile/preferences
// @access Private
export const updatePreferences = async (req, res) => {
  try {
    const user = req.user;
    user.preferences = { ...user.preferences, ...req.body };
    await user.save();

    res.status(statusCode.OK).json({
      code: res.statusCode,
      success: true,
      data: user.preferences,
    });
  } catch (err) {
    errorHandler(err, req, res);
  }
};

// @desc Upload avatar
// @route POST /api/users/profile/avatar
// @access Private
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(statusCode.BAD_REQUEST).json({
        message: "No file uploaded",
      });
    }

    const user = req.user;
    user.avatar = req.file.path; // Assuming you're using multer or similar
    await user.save();

    res.status(statusCode.OK).json({
      code: res.statusCode,
      success: true,
      data: { avatarUrl: user.avatar },
    });
  } catch (err) {
    errorHandler(err, req, res);
  }
};

// @desc Get user notifications
// @route GET /api/users/profile/notifications
// @access Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(statusCode.OK).json({
      code: res.statusCode,
      success: true,
      data: notifications,
    });
  } catch (err) {
    errorHandler(err, req, res);
  }
};

// @desc Update notification settings
// @route PUT /api/users/profile/notifications/settings
// @access Private
export const updateNotificationSettings = async (req, res) => {
  try {
    const user = req.user;
    user.notificationSettings = {
      ...user.notificationSettings,
      ...req.body,
    };
    await user.save();

    res.status(statusCode.OK).json({
      code: res.statusCode,
      success: true,
      data: user.notificationSettings,
    });
  } catch (err) {
    errorHandler(err, req, res);
  }
};
