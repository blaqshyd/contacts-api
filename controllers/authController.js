import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { constants, statusCode } from "../constants.js";
import errorHandler from "../middleware/errorHandler.js";
import User from "../models/userModel.js";
import { blacklistToken } from "../utils/tokenBlacklist.js";

//@desc Register user
//@route POST /v1/auth/register
//@access public

export const registerUser = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const emailExists = await User.findOne({ email });
    const userNameExists = await User.findOne({ username });
    const hashedPassword = await bcryptjs.hash(password, 8);

    if (!email || !password || !username) {
      return res
        .status(statusCode.UNAUTHORIZED)
        .json({ message: "All fields are required" });
    }

    if (emailExists) {
      return res
        .status(statusCode.UNAUTHORIZED)
        .json({ message: "Email already exists!" });
    }

    if (userNameExists) {
      return res.status(statusCode.UNAUTHORIZED).json({
        code: res.statusCode,
        status: false,
        message: "Username is taken!",
      });
    }

    let user = new User({
      email,
      password: hashedPassword,
      username,
    });
    user = await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    // Transform the user object to replace _id with userId
    const userResponse = {
      userId: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(statusCode.CREATED).json({
      code: res.statusCode,
      success: true,
      token,
      data: userResponse,
    });
  } catch (err) {
    errorHandler(err, req, res);
  }
};

//@desc login user
//@route POST /v1/auth/login
//@access public

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!email || !password) {
      return res.status(statusCode.UNAUTHORIZED).json({
        message: "Email and password are required",
      });
    }

    if (!user) {
      return res.status(statusCode.UNAUTHORIZED).json({
        code: res.statusCode,
        status: "false",
        message: "User with this email does not exist",
      });
    }

    const correctPassword = await bcryptjs.compare(password, user.password);

    if (!correctPassword) {
      return res.status(statusCode.UNAUTHORIZED).json({
        code: res.statusCode,
        status: "false",
        message: "Incorrect password",
      });
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

    // Transform the user object to replace _id with userId
    const userResponse = {
      userId: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(statusCode.OK).json({
      code: res.statusCode,
      success: true,
      accessToken,
      refreshToken,
      data: userResponse,
    });
  } catch (err) {
    console.error("Error in loginUser:", err.message);
    console.error(err.stack);
    errorHandler(err, req, res);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) {
      return res.status(statusCode.UNAUTHORIZED).json({
        message: "Email and token are required",
      });
    }

    // Logic to verify email using the token
    // Example: const isVerified = await someVerificationFunction(email, token);

    if (!isVerified) {
      return res.status(statusCode.UNAUTHORIZED).json({
        code: res.statusCode,
        status: "false",
        message: "Invalid token or email",
      });
    }

    res.status(statusCode.OK).json({
      code: res.statusCode,
      status: "true",
      message: "Email verified successfully.",
    });
  } catch (err) {
    console.error("Error in verifyEmail:", err.message);
    console.error(err.stack);
    errorHandler(err, req, res);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(statusCode.UNAUTHORIZED).json({
        message: "Email is required",
      });
    }

    // Logic to handle forgot password
    // Example: await sendPasswordResetEmail(email);

    res.status(statusCode.OK).json({
      code: res.statusCode,
      status: "true",
      message: "Password reset link sent.",
    });
  } catch (err) {
    console.error("Error in forgotPassword:", err.message);
    console.error(err.stack);
    errorHandler(err, req, res);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(statusCode.UNAUTHORIZED).json({
        message: "Token and new password are required",
      });
    }

    // Logic to reset password
    // Example: const isReset = await resetUserPassword(token, newPassword);

    if (!isReset) {
      return res.status(statusCode.UNAUTHORIZED).json({
        code: res.statusCode,
        status: "false",
        message: "Invalid token or password reset failed",
      });
    }

    res.status(statusCode.OK).json({
      code: res.statusCode,
      status: "true",
      message: "Password has been reset.",
    });
  } catch (err) {
    console.error("Error in resetPassword:", err.message);
    console.error(err.stack);
    errorHandler(err, req, res);
  }
};

export const logout = async (req, res) => {
  try {
    // Get the token from the authorization header
    const authHeader = req.header("Authorization");
    const token = authHeader?.startsWith(constants.BEARER_PREFIX)
      ? authHeader.slice(constants.BEARER_LENGTH)
      : authHeader;

    if (token) {
      // Get the token expiry from the JWT payload
      const decoded = jwt.decode(token);
      const timeToExpiry = decoded.exp - Math.floor(Date.now() / 1000);

      // Add token to blacklist until its original expiry
      await blacklistToken(token, timeToExpiry);
    }

    // Clear the refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log("Error in logout:", error.message);
    console.error(error.stack);

    res.status(statusCode.SERVER_ERROR).json({
      code: statusCode.SERVER_ERROR,
      success: false,
      message: "Error during logout",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    // User data is already verified from the middleware
    const user = req.user;

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" } // Short lived
    );

    res.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    res.status(statusCode.SERVER_ERROR).json({
      code: statusCode.SERVER_ERROR,
      success: false,
      message: "Error refreshing token",
    });
  }
};
