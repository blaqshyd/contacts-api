const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { constants } = require("../constants");

//@desc Register user
//@route POST /api/users/register
//@access public

const registerUser = asyncHandler(async (req, res) => {
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

    throw new Error("User data not valid");
  }
});

//@desc login user
//@route POST /api/users/login
//@access public

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(constants.VALIDATION_ERROR);
    throw new Error("Fields are required!!!");
  }
  const user = await User.findOne({ email });
  //compare password with hasedpassword
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
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

const currentUserInfo = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = { registerUser, loginUser, currentUserInfo };
