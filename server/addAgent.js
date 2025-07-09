const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Agent = require("./models/Agent");

// Connect to MongoDB
mongoose.connect("mongodb+srv://chatuser:chat1234@cluster0.qd1lnqx.mongodb.net/chat-support?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  // 🔐 Hash the password
  const hashedPassword = await bcrypt.hash("1234", 10);

  // Create agent with hashed password
  const newAgent = new Agent({
    email: "admin@chat.com",
    password: hashedPassword,
  });

  await newAgent.save();
  console.log("✅ Agent added successfully with hashed password");
  mongoose.disconnect();
}).catch((err) => {
  console.error("❌ Error:", err);
});
