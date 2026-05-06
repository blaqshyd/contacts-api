import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { constants, statusCode } from "../constants.js";
import User from "../models/userModel.js";
import { successResponse, errorResponse } from "../utils/responseHelper.js";
import { blacklistToken } from "../utils/tokenBlacklist.js";

const userResponseTransform = (user) => ({
  userId: user._id,
  username: user.username,
  email: user.email,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const registerUser = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return errorResponse(res, statusCode.BAD_REQUEST, "All fields are required");
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return errorResponse(res, statusCode.CONFLICT, "Email already exists");
    }

    const userNameExists = await User.findOne({ username });
    if (userNameExists) {
      return errorResponse(res, statusCode.CONFLICT, "Username is taken");
    }

    const hashedPassword = await bcryptjs.hash(password, 12);

    const user = new User({ email, password: hashedPassword, username });
    await user.save();

    const verificationToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.VERIFY_TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    return successResponse(res, statusCode.CREATED, "Created User", userResponseTransform(user));
  } catch (err) {
    return errorResponse(res, statusCode.SERVER_ERROR, "Failed to register user", err.message);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, statusCode.BAD_REQUEST, "Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, statusCode.NOT_FOUND, "User does not exist");
    }

    const correctPassword = await bcryptjs.compare(password, user.password);
    if (!correctPassword) {
      return errorResponse(res, statusCode.UNAUTHORIZED, "Invalid credentials");
    }

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    return successResponse(res, statusCode.OK, "Login Successful", {
      user: userResponseTransform(user),
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 900,
        token_type: "Bearer",
      },
    });
  } catch (err) {
    return errorResponse(res, statusCode.SERVER_ERROR, "Failed to login", err.message);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const decodedUser = req.user;

    if (!email) {
      return errorResponse(res, statusCode.BAD_REQUEST, "Email is required");
    }

    if (decodedUser.email !== email) {
      return errorResponse(
        res,
        statusCode.UNAUTHORIZED,
        "Email does not match verification token"
      );
    }

    const user = await User.findById(decodedUser.id);
    if (!user) {
      return errorResponse(res, statusCode.NOT_FOUND, "User not found");
    }

    if (user.isVerified) {
      return errorResponse(res, statusCode.BAD_REQUEST, "Email already verified");
    }

    user.isVerified = true;
    await user.save();

    return successResponse(res, statusCode.OK, "Email verified successfully");
  } catch (err) {
    return errorResponse(res, statusCode.SERVER_ERROR, "Error verifying email", err.message);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, statusCode.BAD_REQUEST, "Email is required");
    }

    return successResponse(res, statusCode.OK, "Password reset link sent");
  } catch (err) {
    return errorResponse(res, statusCode.SERVER_ERROR, "Failed to process request", err.message);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return errorResponse(res, statusCode.BAD_REQUEST, "Token and new password are required");
    }

    return successResponse(res, statusCode.OK, "Password has been reset");
  } catch (err) {
    return errorResponse(res, statusCode.SERVER_ERROR, "Failed to reset password", err.message);
  }
};

export const logout = async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader?.startsWith(constants.BEARER_PREFIX)
      ? authHeader.slice(constants.BEARER_LENGTH)
      : authHeader;

    if (token) {
      const decoded = jwt.decode(token);
      const timeToExpiry = decoded.exp - Math.floor(Date.now() / 1000);
      await blacklistToken(token, timeToExpiry);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return successResponse(res, statusCode.OK, "Logged out successfully");
  } catch (err) {
    return errorResponse(res, statusCode.SERVER_ERROR, "Error during logout", err.message);
  }
};

export const refreshToken = async (req, res) => {
  try {
    const user = req.user;

    const accessToken = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    return successResponse(res, statusCode.OK, "Token refreshed", { accessToken });
  } catch (err) {
    return errorResponse(res, statusCode.SERVER_ERROR, "Error refreshing token", err.message);
  }
};
