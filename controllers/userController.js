import { compare, hash } from "bcrypt";
import asyncHandler from "express-async-handler";
import pkg from "jsonwebtoken";
import { constants } from "../constants.js";
import User from "../models/userModel.js";
const { sign } = pkg;

//@desc Register user
//@route POST /api/users/register
//@access public

export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(constants.VALIDATION_ERROR);
    throw new Error("Fields are required!!!");
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(constants.VALIDATION_ERROR);
    throw new Error("User already exists!");
  }
  //? Hash password
  const hashedPassword = await hash(password, 10);
  console.log("Hashed password: ", hashedPassword);
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });
  if (user) {
    res.status(constants.CREATED).json({
      message: "User account created successfully",
      _id: user.id,
      email: user.email,
    });
  } else {
    res.status(constants.VALIDATION_ERROR);

    throw new Error("User data not valid");
  }
});

//@desc login user
//@route POST /api/users/login
//@access public

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(constants.VALIDATION_ERROR);
    throw new Error("Fields are required!!!");
  }
  const user = await User.findOne({ email });
  //compare password with hasedpassword
  if (user && (await compare(password, user.password))) {
    const accessToken = sign(
      {
        user: {
          username: user.username,
          email: user.email,
          password: user.password,
          id: user.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    res.status(constants.SUCESS).json({ accessToken });
  } else {
    res.status(constants.UNAUTHORIZED);
    throw new Error("Email or password is not valid");
  }
});

//@desc current user
//@route POST /api/users/current
//@access private

export const currentUserInfo = asyncHandler(async (req, res) => {
  res.json(req.user);
});
