const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,
  contactNo: String,
  email: { type: String, unique: true },
  address: String,
  customerId: String,
  passwordHash: String,
});

module.exports = mongoose.model("User", userSchema);
