import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import html2canvas from "html2canvas";
import "../pages/chat.css";
import Logo from "../assets/logoblack.png";

const socket = io("https://motion-chat-production.up.railway.app"), { transports: ["websocket"] });

export default function UserAgentChatPage() {
  const { userId } = useParams(); 
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userInfo, setUserInfo] = useState({});
  const [startTime, setStartTime] = useState(null);
  const chatRef = useRef(null);
  const joinedRef = useRef(false);

  useEffect(() => {
    socket.emit("get_active_chats");
    socket.on("active_chat_list", (list) => {
      const user = list.find((u) => u.id === userId);
      if (user) setUserInfo(user);
    });

    return () => socket.off("active_chat_list");
  }, [userId]);

  useEffect(() => {
    if (userInfo?.id && !joinedRef.current) {
      socket.emit("agent_joined_user_chat", {
        userId,
        agentName: "Agent A",
      });
      socket.emit("join_room", { room: `room_${userId}` });
      joinedRef.current = true;
      setStartTime(Date.now());
    }
  }, [userInfo, userId]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      if (data.userId === userId) {
        setMessages((prev) => [...prev, data]);
        if (!userInfo.chatId && data.chatId) {
          setUserInfo((prev) => ({ ...prev, chatId: data.chatId }));
        }
      }
    });

    return () => socket.off("receive_message");
  }, [userId, userInfo.chatId]);

  useEffect(() => {
    socket.on("user_chat_ended", ({ userId: endedId }) => {
      if (endedId === userId) {
        window.location.href = "/dashboard/ongoing";
      }
    });

    return () => socket.off("user_chat_ended");
  }, [userId]);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);



    // Timer display
    useEffect(() => {
      if (!startTime) return;
  
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const totalSeconds = Math.floor(elapsed / 1000);
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        const display = `${String(hrs).padStart(2, "0")} hrs : ${String(
          mins
        ).padStart(2, "0")} mins : ${String(secs).padStart(2, "0")} secs`;
  
        const timerEl = document.getElementById("chat-timer");
        if (timerEl) timerEl.textContent = display;
      }, 1000);
  
      return () => clearInterval(interval);
    }, [startTime]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const msgData = {
      userId,
      chatId: userInfo.chatId,
      message: input,
      sender: "agent",
      user: "Agent A",
      time: new Date().toLocaleTimeString(),
    };

    socket.emit("send_user_message", msgData);
    setInput("");
  };

  const handleScreenshot = () => {
    const node = chatRef.current;
    if (!node) return;

    const clone = node.cloneNode(true);
    clone.style.maxHeight = "none";
    clone.style.overflow = "visible";
    clone.style.height = "auto";
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    document.body.appendChild(clone);

    const label = document.createElement("div");
    label.innerText = `Chat ID: ${userInfo.chatId || "N/A"}`;
    label.style.fontSize = "18px";
    label.style.fontWeight = "bold";
    label.style.padding = "10px";
    label.style.background = "#f5f5f5";
    label.style.borderBottom = "1px solid #ccc";
    clone.insertBefore(label, clone.firstChild);

    html2canvas(clone).then((canvas) => {
      const link = document.createElement("a");
      link.download = `${userInfo.chatId || "chat"}_chat.png`;
      link.href = canvas.toDataURL();
      link.click();
      document.body.removeChild(clone);
    });
  };

  const handleEndChat = () => {
    socket.emit("user_ended_chat", { userId });
    setTimeout(() => {
      window.location.href = "/dashboard/ongoing";
    }, 300);
  };

  return (
    <div className="chat-layout-container">
      <div className="chat-left-space" />
      <div className="chat-main-section">
        <div className="agent-chat-header">
          <h3 style={{ fontSize: "2rem", marginBottom: "-0.5rem" }}>
            Chat with {userInfo.name || "User"}
          </h3>
          <p>{userInfo.email}</p>
          <div className="logochat">
            <img src={Logo} alt="Logo" />
          </div>
        </div>

        <div className="chat-box scrollable-chat" ref={chatRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-bubble ${msg.sender === "agent" ? "guest" : "agent"}`}
            >
              <div className="bubble-content">
                <div className="bubble-text">{msg.message}</div>
                <div className="bubble-meta">
                  <span>{msg.user}</span>
                  <span className="time-right">{msg.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <form className="chat-input" onSubmit={sendMessage}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>

      <div className="chat-details-section">
        <div className="details-box glass-card" >
          <h4 style={{ marginBottom: "-0.5rem" }}>User Name</h4>
          <p>{userInfo.name || "N/A"}</p>
        </div>
        <div className="details-box glass-card">
          <h4 style={{ marginBottom: "-0.5rem" }}>Email</h4>
          <p>{userInfo.email || "N/A"}</p>
        </div>
        <div className="details-box glass-card">
          <h4 style={{ marginBottom: "-0.5rem" }}>User ID</h4>
          <p>{userInfo.id || userId}</p>
        </div>
        <div className="details-box glass-card">
          <h4 style={{ marginBottom: "-0.5rem" }}>Chat ID</h4>
          <p>{userInfo.chatId || "N/A"}</p>
        </div>
        <div className="details-box glass-card">
          <button onClick={handleScreenshot} className="screenshot-btn">
            📷 Save Chat
          </button>
        </div>
        <div className="details-box glass-card">
          <h4 style={{ marginBottom: "0.5rem" }}>Session Time</h4>
          <div id="chat-timer" style={{ marginBottom: "0.5rem" }}>00 hrs : 00 mins : 00 secs</div>
        </div>
        <div className="details-box glass-card" style={{ marginTop: "1.5rem" }}>
          <button
            onClick={handleEndChat}
            className="end-chat-btn"
            style={{
              backgroundColor: "#ff4d4d",
              color: "#fff",
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              width: "100%",
              fontWeight: "bold",
            }}
          >
            End Chat
          </button>
        </div>
      </div>
    </div>
  );
}
