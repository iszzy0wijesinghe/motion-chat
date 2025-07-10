import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import html2canvas from "html2canvas";
import "../pages/chat.css";
import Logo from "../assets/logoblack.png";

const socket = io("https://motion-chat-production.up.railway.app");

export default function AgentChatPage() {
  const { guestId } = useParams();
  const [guestInfo, setGuestInfo] = useState({});
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const chatRef = useRef(null);
  const joinedRef = useRef(false);

  // 🔁 Get guest info
  useEffect(() => {
    socket.emit("get_active_guests");

    socket.on("active_guest_list", (guests) => {
      const guest = guests.find((g) => g.id === guestId);
      if (guest) {
        setGuestInfo(guest);

        // ✅ Emit agent_joined once guest info is loaded
        if (!joinedRef.current) {
          socket.emit("agent_joined", {
            guestId: guest.id,
            agentName: "Agent A",
          });
          joinedRef.current = true;
          setStartTime(Date.now());
          console.log("✅ Agent joined guest chat:", guest.id);
        }
      }
    });

    return () => socket.off("active_guest_list");
  }, [guestId]);

  // 📩 Chat ID assigned
  useEffect(() => {
    socket.on("chat_id_assigned", (chatId) => {
      setGuestInfo((prev) => ({ ...prev, chatId }));
    });

    return () => socket.off("chat_id_assigned");
  }, []);

  // 📩 New messages
  useEffect(() => {
    socket.on("receive_message", (data) => {
      if (data.guestId === guestId) {
        setMessages((prev) => [...prev, data]);
        if (!guestInfo.chatId && data.chatId) {
          setGuestInfo((prev) => ({ ...prev, chatId: data.chatId }));
        }
      }
    });

    return () => socket.off("receive_message");
  }, [guestId, guestInfo.chatId]);

  // ❌ Guest ended
  useEffect(() => {
    socket.on("guest_chat_ended", ({ guestId: endedId }) => {
      if (endedId === guestId) {
        window.location.href = "/agent-dashboard/ongoing-chats";
      }
    });

    return () => socket.off("guest_chat_ended");
  }, [guestId]);

  // ⏬ Auto scroll
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // ⏱️ Session timer
  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const total = Math.floor(elapsed / 1000);
        const hrs = String(Math.floor(total / 3600)).padStart(2, "0");
        const mins = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
        const secs = String(total % 60).padStart(2, "0");
        const el = document.getElementById("chat-timer");
        if (el) el.textContent = `${hrs} hrs : ${mins} mins : ${secs} secs`;
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    socket.emit("send_message", {
      guestId,
      chatId: guestInfo.chatId,
      message: input,
      sender: "agent",
      user: "Agent A",
      time: new Date().toLocaleTimeString(),
    });
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
    label.innerText = `Chat ID: ${guestInfo.chatId || "N/A"}`;
    label.style.fontSize = "18px";
    label.style.fontWeight = "bold";
    label.style.padding = "10px";
    label.style.background = "#f5f5f5";
    label.style.borderBottom = "1px solid #ccc";
    clone.insertBefore(label, clone.firstChild);

    html2canvas(clone).then((canvas) => {
      const link = document.createElement("a");
      link.download = `${guestInfo.chatId || "chat"}_chat.png`;
      link.href = canvas.toDataURL();
      link.click();
      document.body.removeChild(clone);
    });
  };

  const handleEndChat = () => {
    socket.emit("agent_ended_chat", { guestId });
    setTimeout(() => {
      window.location.href = "/agent-dashboard/ongoing-chats";
    }, 300);
  };

  return (
    <div className="chat-layout-container">
      <div className="chat-left-space" />

      <div className="chat-main-section">
        <div className="agent-chat-header">
          <h3>Chat with {guestInfo.name || "Guest"}</h3>
          <p>{guestInfo.email || ""}</p>
          <div className="logochat">
            <img src={Logo} alt="Logo" />
          </div>
        </div>

        <div className="chat-box scrollable-chat" ref={chatRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-bubble ${
                msg.sender === "agent"
                  ? "guest"
                  : msg.sender === "guest"
                  ? "agent"
                  : "system"
              }`}
            >
              <div className="bubble-content">
                <div className="bubble-text">{msg.message || msg.text}</div>
                <div className="bubble-meta">
                  <span>{msg.user || msg.agentName || "System"}</span>
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
          <button type="submit" disabled={!guestInfo.chatId}>
            Send
          </button>
        </form>
      </div>

      <div className="chat-details-section">
        <div className="details-box glass-card">
          <h4 style={{ marginBottom: "-0.5rem" }}>Guest Name</h4>
          <p>{guestInfo.name || "N/A"}</p>
        </div>
        <div className="details-box glass-card">
          <h4 style={{ marginBottom: "-0.5rem" }}>Email</h4>
          <p>{guestInfo.email || "N/A"}</p>
        </div>
        <div className="details-box glass-card">
          <h4 style={{ marginBottom: "-0.5rem" }}>Guest ID</h4>
          <p>{guestInfo.id || guestId || "N/A"}</p>
        </div>
        <div className="details-box glass-card">
          <h4 style={{ marginBottom: "-0.5rem" }}>Chat ID</h4>
          <p>{guestInfo.chatId || "Pending..."}</p>
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
