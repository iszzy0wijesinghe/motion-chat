const mongoose = require("mongoose");
const Agent = require("./models/Agent");

// ✅ Connect to your DB
mongoose.connect("mongodb+srv://chatuser:chat1234@cluster0.qd1lnqx.mongodb.net/chat-support", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  const result = await Agent.deleteOne({ email: "admin@chat.com" });

  if (result.deletedCount > 0) {
    console.log("🗑️ Agent deleted successfully");
  } else {
    console.log("⚠️ Agent not found, nothing deleted");
  }

  mongoose.disconnect();
}).catch((err) => {
  console.error("❌ Error deleting agent:", err);
});
