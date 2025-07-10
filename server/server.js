require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const RespondedChat = require("./models/RespondedChat");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://motion-chat.vercel.app",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Route Imports
const agentAuthRoutes = require("./routes/agent");
const userAuthRoutes = require("./routes/userAuthRoutes");
const respondedChatRoutes = require("./routes/respondedChatRoutes");
const agentManagementRoutes = require("./routes/agentManagement"); // ✅ NEW

// ✅ Use Routes
app.use("/api/agent", agentAuthRoutes);
app.use("/api/auth", userAuthRoutes);
app.use("/api/responded-chats", respondedChatRoutes);
app.use("/api/agent-management", agentManagementRoutes); // ✅ NEW

// ✅ Active chat maps
const activeGuests = new Map();
const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  /** ────────────── GUEST CHAT ────────────── */
  socket.on("guest_started", ({ name, email, topic }) => {
    const guestId = socket.id;
    const room = `room_${guestId}`;
    socket.join(room);

    const guestInfo = {
      id: guestId,
      name,
      email,
      topic,
      chatId: null,
      room,
      startedAt: new Date(),
      status: "available",
    };

    activeGuests.set(guestId, guestInfo);
    io.emit("new_guest_chat", guestInfo);
    io.emit("active_guest_list", [...activeGuests.values()]);
    console.log("👤 Guest started chat:", guestId);
  });

  socket.on("agent_joined", ({ guestId, agentName }) => {
    if (activeGuests.has(guestId)) {
      const guest = activeGuests.get(guestId);
      if (guest.status !== "available") return;

      const chatId =
        guest.chatId || `CHAT-${Math.floor(1000 + Math.random() * 9000)}`;
      const updatedGuest = { ...guest, chatId, status: "in-progress" };
      activeGuests.set(guestId, updatedGuest);

      const room = `room_${guestId}`;
      socket.join(room);

      io.to(room).emit("chat_id_assigned", chatId);
      io.to(room).emit("receive_message", {
        system: "agent_joined",
        agentName,
        guestId,
        chatId,
        user: "Agent A",
        time: new Date().toLocaleTimeString(),
      });

      io.emit("active_guest_list", [...activeGuests.values()]);
    }
  });

  socket.on("send_message", ({ guestId, chatId, message, sender, user }) => {
    const room = `room_${guestId}`;
    io.to(room).emit("receive_message", {
      guestId,
      chatId,
      message,
      sender,
      user,
      time: new Date().toLocaleTimeString(),
    });
  });

  socket.on("guest_ended_chat", ({ guestId }) => {
    activeGuests.delete(guestId);
    io.emit("guest_chat_ended", { guestId });
  });

  /** ────────────── USER CHAT ────────────── */
  socket.on("user_started", ({ userId, name, email, topic }) => {
    const room = `room_${userId}`;
    socket.join(room);

    const userInfo = {
      id: userId,
      name,
      email,
      topic,
      chatId: `UCHAT-${Math.floor(1000 + Math.random() * 9000)}`,
      room,
      startedAt: new Date(),
      status: "available",
    };

    activeUsers.set(userId, userInfo);
    io.emit("active_chat_list", [...activeUsers.values()]);
    socket.emit("chat_id_assigned", userInfo.chatId);
  });

  socket.on("agent_joined_user_chat", ({ userId, agentName }) => {
    if (activeUsers.has(userId)) {
      const user = activeUsers.get(userId);
      const room = `room_${userId}`;
      socket.join(room);
      io.to(room).emit("receive_message", {
        system: "agent_joined_user",
        agentName,
        userId,
        chatId: user.chatId,
        user: "Agent A",
        time: new Date().toLocaleTimeString(),
      });
    }
  });

  socket.on("send_user_message", ({ userId, chatId, message, sender, user }) => {
    const room = `room_${userId}`;
    io.to(room).emit("receive_message", {
      userId,
      chatId,
      message,
      sender,
      user,
      time: new Date().toLocaleTimeString(),
    });
  });

  socket.on("deny_user_chat", ({ userId }) => {
    if (activeUsers.has(userId)) {
      const user = activeUsers.get(userId);
      const updated = { ...user, status: "denied" };
      activeUsers.set(userId, updated);
      io.emit("active_chat_list", [...activeUsers.values()]);
    }
  });

  socket.on("user_ended_chat", async ({ userId, chatId, rating, sessionDuration }) => {
    const user = activeUsers.get(userId);

    if (user) {
      try {
        await RespondedChat.create({
          chatId,
          userId,
          topic: user.topic,
          date: new Date(),
          sessionDuration,
          rating,
        });
      } catch (err) {
        console.error("❌ Failed to store responded chat:", err);
      }
    }

    activeUsers.delete(userId);
    io.emit("user_chat_ended", { userId });
  });

  socket.on("get_active_chats", () => {
    socket.emit("active_chat_list", [...activeUsers.values()]);
  });

  socket.on("get_active_guests", () => {
    socket.emit("active_guest_list", [...activeGuests.values()]);
  });

  socket.on("disconnect", () => {
    if (activeGuests.has(socket.id)) {
      activeGuests.delete(socket.id);
      io.emit("guest_chat_ended", { guestId: socket.id });
    } else {
      console.log("User disconnected:", socket.id);
    }
  });
});

// ✅ Dummy User Info
app.get("/api/user-details", (_, res) => {
  res.json({
    name: "Isindu Wijesinghe",
    email: "isindu@example.com",
    phone: "+94771234567"
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
