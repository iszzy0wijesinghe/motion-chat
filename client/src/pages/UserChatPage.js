// 🔁 same imports
import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import html2canvas from "html2canvas";
import "../pages/chat.css";
import Logo from "../assets/logoblack.png";

const socket = io("http://localhost:3001", { transports: ["websocket"] });

export default function UserChatPage() {
  const [userId, setUserId] = useState("");
  const [userName] = useState(localStorage.getItem("userName") || "User");
  const [userEmail] = useState(
    localStorage.getItem("userEmail") || "user@email.com"
  );
  const [chatTopic] = useState(localStorage.getItem("chatTopic") || "");
  const [chatId, setChatId] = useState("Pending...");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [agentJoined, setAgentJoined] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const chatRef = useRef(null);

  // ⭐ Rating popup states
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(null);


  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  useEffect(() => {
    socket.on("connect", () => setUserId(socket.id));
  }, []);

  useEffect(() => {
    if (!userId) return;

    socket.emit("user_started", {
      userId,
      name: userName,
      email: userEmail,
      topic: chatTopic,
    });

    socket.on("chat_id_assigned", (id) => setChatId(id));
    return () => socket.off("chat_id_assigned");
  }, [userId, userName, userEmail, chatTopic]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      if (data.system === "agent_joined_user") {
        setAgentJoined(true);
        setShowPopup(false);
        setStartTime(Date.now());
      } else {
        setChat((prev) => [...prev, data]);
      }
    });

    return () => socket.off("receive_message");
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chat]);

  useEffect(() => {
    const lastRefresh = sessionStorage.getItem("userChatLastRefresh");
    const newRefresh = sessionStorage.getItem("refreshUserChat");

    if (newRefresh && newRefresh !== lastRefresh) {
      sessionStorage.setItem("userChatLastRefresh", newRefresh);
      setTimeout(() => window.location.reload(), 2000);
    }
  }, []);

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
    if (!message.trim()) return;

    const msgData = {
      userId,
      chatId,
      message,
      sender: "user",
      user: userName,
      time: new Date().toLocaleTimeString(),
    };

    socket.emit("send_user_message", msgData);
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

  // ⛳️ Step 1: Trigger rating popup
  const handleEndChat = () => {
    setShowRatingPopup(true);
  };

  // ⛳️ Step 2: Submit or skip rating
  const submitRating = (rating) => {
    socket.emit("user_ended_chat", {
      userId,
      chatId,
      rating: rating, // null if skipped
      sessionDuration: Date.now() - startTime,
    });

    socket.disconnect();
    setShowRatingPopup(false);
    window.location.href = "/userchattopic";
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
            Hello, {userName}
          </h3>
          <p>{userEmail}</p>
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
      </div>

      <div className="chat-details-section">
        <div className="details-box glass-card">
          <h4 style={{ marginBottom: "-0.5rem" }}>Agent Status</h4>
          <p style={{ color: "green", fontWeight: "bold" }}>
            {agentJoined ? "Connected" : "Waiting..."}
          </p>
        </div>
        <div className="details-box glass-card">
          <h4 style={{ marginBottom: "-0.5rem" }}>Customer Name</h4>
          <p>{userName}</p>
        </div>
        <div className="details-box glass-card">
          <h4 style={{ marginBottom: "-0.5rem" }}>Topic</h4>
          <p>{chatTopic}</p>
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
          <h4 style={{ marginBottom: "0.5rem" }}>Session Time</h4>
          <div id="chat-timer" style={{ marginBottom: "0.5rem" }}>
            00 hrs : 00 mins : 00 secs
          </div>
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

      {/* ⭐ Rating Popup */}
      {showRatingPopup && (
        <div className="rating-overlay">
          <div className="rating-box glass-card">
            <h3>Rate your chat experience</h3>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${
                    hoverRating >= star || selectedRating >= star
                      ? "filled"
                      : ""
                  }`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setSelectedRating(star)}
                >
                  ★
                </span>
              ))}
            </div>

            <div className="rating-buttons">
              <button
                onClick={() => submitRating(selectedRating)}
                disabled={selectedRating === null}
                className="rate-submit"
              >
                Submit
              </button>
              <button onClick={() => submitRating(null)} className="rate-skip">
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
