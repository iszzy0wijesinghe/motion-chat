const mongoose = require("mongoose");

const respondedChatSchema = new mongoose.Schema({
  chatId: { type: String, required: true },
  userId: { type: String, required: true },
  topic: { type: String },
  date: { type: Date, default: Date.now },
  sessionDuration: { type: Number }, // in milliseconds
  rating: { type: Number }, // 1 to 5 or null
});

module.exports = mongoose.model("RespondedChat", respondedChatSchema);
