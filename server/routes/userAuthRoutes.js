const express = require("express");

const {
  sendOtp,
  verifyOtp,
  registerUser,
  loginUser,
} = require("../controllers/authController");

const router = express.Router();

// POST /api/auth/send-otp
router.post("/send-otp", sendOtp);

// POST /api/auth/verify-otp
router.post("/verify-otp", verifyOtp);

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

module.exports = router;
