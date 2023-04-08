const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const { constants } = require("../constants");

//@desc Register user
//@route POST /api/users/register
//@access public

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(constants.VALIDATION_ERROR);
    throw new Error("All fields are mandatory");
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(constants.VALIDATION_ERROR);
    throw new Error("User already exists!");
  }
  //? Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
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
    rs;
    throw new Error("User data not valid");
  }
});

//@desc login user
//@route POST /api/users/login
//@access public

const loginUser = asyncHandler(async (req, res) => {
  const user = await User.find();
  res.status(200).json(user);
});

//@desc current user
//@route POST /api/users/current
//@access private

const currentUserInfo = asyncHandler(async (req, res) => {
  const user = await User.find();
  res.status(200).json(user);
});

module.exports = { registerUser, loginUser, currentUserInfo };
