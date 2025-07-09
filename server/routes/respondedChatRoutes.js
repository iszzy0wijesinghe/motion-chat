const express = require("express");
const router = express.Router();
const RespondedChat = require("../models/RespondedChat");

router.get("/", async (req, res) => {
  try {
    const chats = await RespondedChat.find().sort({ date: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch responded chats." });
  }
});

module.exports = router;
