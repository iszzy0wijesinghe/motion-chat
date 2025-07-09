import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import html2canvas from "html2canvas";
import "../pages/chat.css";
import Logo from "../assets/logoblack.png";

const socket = io("http://localhost:3001");

export default function GuestChatPage() {
  const [guestName] = useState(localStorage.getItem("guestName") || "");
  const [guestEmail] = useState(localStorage.getItem("guestEmail") || "");
  const [guestTopic] = useState(localStorage.getItem("chatTopic") || "");
  const [guestId, setGuestId] = useState("");
  const [chatId, setChatId] = useState("Pending...");
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [agentJoined, setAgentJoined] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const chatRef = useRef(null);

  // ✅ Lock scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      const id = socket.id;
      setGuestId(id);

      // 🔥 Send only after connected
      socket.emit("guest_started", {
        name: guestName,
        email: guestEmail,
        topic: guestTopic,
      });
    });

    socket.on("chat_id_assigned", (chatId) => {
      setChatId(chatId);
    });

    return () => {
      socket.off("connect");
      socket.off("chat_id_assigned");
    };
  }, [guestName, guestEmail, guestTopic]);

  // ✅ Receive messages
  useEffect(() => {
    socket.on("receive_message", (data) => {
      if (data.guestId !== guestId) return;

      if (data.system === "agent_joined") {
        setAgentJoined(true);
        setShowPopup(false);
        setStartTime(Date.now());
      }

      setChat((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, [guestId]);

  useEffect(() => {
    socket.on("guest_chat_ended", ({ guestId: endedId }) => {
      if (endedId === guestId) {
        window.location.href = "/chat-topic"; // or your preferred page
      }
    });
    return () => socket.off("guest_chat_ended");
  }, [guestId]);

  // ✅ Scroll down on message
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chat]);

useEffect(() => {
  const lastRefresh = sessionStorage.getItem("guestChatLastRefresh");
  const newRefresh = sessionStorage.getItem("refreshGuestChat");

  if (newRefresh && newRefresh !== lastRefresh) {
    sessionStorage.setItem("guestChatLastRefresh", newRefresh);
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }
}, []);



  // ✅ Session timer
  useEffect(() => {
    if (startTime) {
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
    }
  }, [startTime]);

  // ✅ Send message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const msgData = {
      guestId,
      chatId,
      message,
      sender: "guest",
      user: guestName,
      time: new Date().toLocaleTimeString(),
    };

    socket.emit("send_message", msgData);
    setMessage("");
  };

  const handleScreenshot = () => {
    const originalNode = chatRef.current;
    if (!originalNode) return;

    const clonedNode = originalNode.cloneNode(true);
    clonedNode.style.maxHeight = "none";
    clonedNode.style.overflow = "visible";
    clonedNode.style.height = "auto";
    clonedNode.style.position = "absolute";
    clonedNode.style.left = "-9999px";
    clonedNode.style.top = "0";
    document.body.appendChild(clonedNode);

    const idLabel = document.createElement("div");
    idLabel.innerText = `Chat ID: ${chatId}`;
    idLabel.style.fontSize = "18px";
    idLabel.style.fontWeight = "bold";
    idLabel.style.padding = "10px";
    idLabel.style.background = "#f5f5f5";
    idLabel.style.borderBottom = "1px solid #ccc";
    clonedNode.insertBefore(idLabel, clonedNode.firstChild);

    html2canvas(clonedNode).then((canvas) => {
      const link = document.createElement("a");
      link.download = `${chatId}_chat.png`;
      link.href = canvas.toDataURL();
      link.click();
      document.body.removeChild(clonedNode);
    });
  };

  const handleEndChat = () => {
    socket.emit("guest_ended_chat", { guestId });
    socket.disconnect();
    window.location.href = "/chat-topic";
  };

  return (
    <div className="chat-layout-container">
      {!agentJoined && (
        <div className="waiting-overlay">
          <div className="waiting-box">
            <p>💬 Please wait, our Agent will assist you shortly...</p>
            <div className="line-loader"></div>
          </div>
        </div>
      )}

      <div className="chat-left-space" />
      <div className="chat-main-section">
        {showPopup && (
          <div className="system-popup-overlay">
            <div className="system-popup-message">
              🔔 Chat session started — Agent will join shortly.
            </div>
          </div>
        )}

        <div className="agent-chat-header">
          <h3 style={{ fontSize: "2rem", marginBottom: "-0.5rem" }}>
            Welcome, {guestName}
          </h3>
          <p>{guestEmail}</p>

          <div className="logochat">
            <img src={Logo} alt="Logo" />
          </div>
        </div>

        <div className="chat-box scrollable-chat" ref={chatRef}>
          {chat.map((msg, index) => (
            <div
              key={index}
              className={`chat-bubble ${
                msg.sender === "agent" ? "agent" : "guest"
              }`}
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
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button type="submit">Send</button>
        </form>

        <div className="chat-footer-tip">
          Need to unlock more chat features?{" "}
          <a href="/userregister">Register Now!</a>
        </div>
      </div>

      <div className="chat-details-section">
        <div className="details-box glass-card">
          <h4 style={{ marginBottom: "-0.5rem" }}>Agent Status</h4>
          <p style={{ color: "green", fontWeight: "bold" }}>
            {agentJoined ? "Connected" : "Waiting..."}
          </p>
        </div>
        <div className="details-box glass-card">
          <h4 style={{ marginBottom: "-0.5rem" }}>Guest Name</h4>
          <p>{guestName}</p>
        </div>
        <div className="details-box glass-card">
          <h4 style={{ marginBottom: "-0.5rem" }}>Topic</h4>
          <p>{guestTopic}</p>
        </div>
        <div className="details-box glass-card">
          <h4 style={{ marginBottom: "-0.5rem" }}>Chat ID</h4>
          <p>{chatId}</p>
        </div>
        <div className="details-box glass-card">
          <button onClick={handleScreenshot} className="screenshot-btn">
            📷 Save Chat
          </button>
        </div>
        <div className="details-box glass-card">
          <h4 style={{ marginBottom: "-0.5rem" }}>Session Time</h4>
          <div
            id="chat-timer"
            style={{ paddingTop: "0.8rem", paddingBottom: "0.8rem" }}
          >
            00 hrs : 00 mins : 00 secs
          </div>
        </div>
        <div className="details-box glass-card" style={{ marginTop: "2rem" }}>
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
