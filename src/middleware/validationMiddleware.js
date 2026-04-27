import { statusCode } from "../constants.js";

export const validateProfileUpdate = (req, res, next) => {
  const { email, username } = req.body;
  const errors = [];

  if (email && !isValidEmail(email)) {
    errors.push("Invalid email format");
  }

  if (username && (username.length < 3 || username.length > 30)) {
    errors.push("Username must be between 3 and 30 characters");
  }

  if (errors.length > 0) {
    return res.status(statusCode.BAD_REQUEST).json({
      success: false,
      errors: errors,
    });
  }

  next();
};

export const validatePasswordUpdate = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const errors = [];

  if (!currentPassword) {
    errors.push("Current password is required");
  }

  if (!newPassword) {
    errors.push("New password is required");
  } else if (newPassword.length < 6) {
    errors.push("New password must be at least 6 characters long");
  }

  if (errors.length > 0) {
    return res.status(statusCode.BAD_REQUEST).json({
      success: false,
      errors: errors,
    });
  }

  next();
};

export const validatePreferencesUpdate = (req, res, next) => {
  const { theme, language } = req.body;
  const errors = [];

  if (theme && !["light", "dark"].includes(theme)) {
    errors.push("Invalid theme value");
  }

  if (language && language.length !== 2) {
    errors.push("Invalid language code");
  }

  if (errors.length > 0) {
    return res.status(statusCode.BAD_REQUEST).json({
      success: false,
      errors: errors,
    });
  }

  next();
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
