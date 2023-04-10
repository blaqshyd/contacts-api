const express = require("express");
const {
  registerUser,
  loginUser,
  currentUserInfo,
} = require("../controllers/userController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/info", validateToken, currentUserInfo);

module.exports = router;
