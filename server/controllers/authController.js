const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOtpEmail } = require("../utils/sendOtpEmail");

const otpStore = {}; // Temporary in-memory store for OTPs (consider Redis in production)

// Send OTP to Email
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;

  try {
    await sendOtpEmail(email, otp);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Verify OTP
exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  if (!otpStore[email]) {
    return res.status(400).json({ success: false, message: "OTP expired or not found" });
  }

  if (otpStore[email] === otp) {
    delete otpStore[email];
    return res.status(200).json({ success: true });
  } else {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }
};

// Register User
exports.registerUser = async (req, res) => {
  const { fullName, contactNo, email, address, customerId, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    await User.create({
      fullName,
      contactNo,
      email,
      address,
      customerId,
      passwordHash: hash,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(400).json({ message: "Registration failed", error: err.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Send limited user info (avoid passwordHash)
    res.status(200).json({
      message: "Login successful",
      user: {
        email: user.email,
        fullName: user.fullName,
        contactNo: user.contactNo,
        address: user.address,
        customerId: user.customerId,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};
