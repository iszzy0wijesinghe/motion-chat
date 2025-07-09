const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },             // fullName
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    supportCategory: { type: String, required: true },
    contact: { type: String },                       // contactNo
    nic: { type: String },
    education: { type: String },
    address: { type: String },
    aboutYou: { type: String },                         // aboutYou
    role: { type: String, default: "agent" },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Agent", agentSchema);
