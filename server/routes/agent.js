const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Agent = require("../models/Agent");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "mysecret";

// Temporary in-memory OTP store (for demo use only)
const otpStorage = {};

// ✅ LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const agent = await Agent.findOne({ email });
    if (!agent) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Allow login for admin email even if not approved
    if (!agent.isApproved && agent.email !== "admin@chat.com") {
      return res.status(403).json({ message: "Your registration is pending approval." });
    }

    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: agent._id }, JWT_SECRET, { expiresIn: "1d" });
    res.json({
      token,
      fullName: agent.name,
      email: agent.email,
      supportCategory: agent.supportCategory || "N/A",
      registeredAt: agent.createdAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
      role: agent.role,
    });

  } catch (err) {
    console.error("Agent login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ SEND OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required." });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStorage[email] = otp;

  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"MotionArts" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your MotionArts Agent OTP",
      html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    });

    console.log(`✅ OTP sent to ${email}: ${otp}`);
    res.status(200).json({ message: "OTP sent" });
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    res.status(500).json({ message: "Error sending OTP." });
  }
});

// ✅ VERIFY OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (otpStorage[email] === otp) {
    delete otpStorage[email];
    return res.status(200).json({ success: true });
  } else {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }
});

// ✅ REGISTER AGENT
router.post("/register", async (req, res) => {
  const {
    fullName,
    nic,
    contactNo,
    email,
    password,
    address,
    supportType,
    education,
    aboutYou,
  } = req.body;

  try {
    const existing = await Agent.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Agent already exists with this email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAgent = new Agent({
      name: fullName,
      nic,
      contactNo,
      email,
      password: hashedPassword,
      supportCategory: supportType,
      address,
      education,
      about: aboutYou,
      isApproved: false,
      role: "agent"
    });

    await newAgent.save();
    console.log("✅ Agent registration submitted:", email);
    res.status(201).json({ message: "Registration successful. Awaiting admin approval." });
  } catch (error) {
    console.error("❌ Agent register error:", error.message);
    res.status(500).json({ message: "Server error during registration." });
  }
});


module.exports = router;
