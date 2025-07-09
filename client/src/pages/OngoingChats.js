import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "../App.css";

const socket = io("http://localhost:3001", { transports: ["websocket"] });

const topicLabels = {
  service: "Service",
  appointment: "Appointment",
  creativity: "Creativity",
  payments: "Payments",
  legal: "Legal",
  order: "Order",
  other: "Other",
};

export default function OngoingChats() {
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedDeniedChats, setSelectedDeniedChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("get_active_chats");

    socket.on("active_chat_list", (chats) => {
      setChatSessions(chats);
    });

    socket.on("new_guest_chat", (chat) => {
      setChatSessions((prev) => {
        const exists = prev.some((c) => c.id === chat.id);
        return exists ? prev : [...prev, chat];
      });
    });

    socket.on("new_user_chat", (chat) => {
      setChatSessions((prev) => {
        const exists = prev.some((c) => c.id === chat.id);
        return exists ? prev : [...prev, chat];
      });
    });

    socket.on("guest_chat_ended", ({ guestId }) => {
      setChatSessions((prev) => prev.filter((c) => c.id !== guestId));
    });

    socket.on("user_chat_ended", ({ userId }) => {
      setChatSessions((prev) => prev.filter((c) => c.id !== userId));
    });

    return () => {
      socket.off("active_chat_list");
      socket.off("new_guest_chat");
      socket.off("new_user_chat");
      socket.off("guest_chat_ended");
      socket.off("user_chat_ended");
    };
  }, []);

  const handleJoin = (chat) => {
    const isUser = chat.chatId && chat.chatId.startsWith("UCHAT-");

    if (isUser) {
      socket.emit("agent_joined_user_chat", {
        userId: chat.id,
        agentName: "Agent A",
      });
      navigate(`/useragentchat/${chat.id}`);
    } else {
      socket.emit("agent_joined", {
        guestId: chat.id,
        agentName: "Agent A",
      });
      navigate(`/agent-chat/${chat.id}`);
    }
  };

  const handleDeny = (chat) => {
    const isUser = chat.chatId && chat.chatId.startsWith("UCHAT-");

    if (isUser) {
      socket.emit("deny_user_chat", { userId: chat.id });
    }
  };

  const handleSelectDenied = (id) => {
    setSelectedDeniedChats((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const deleteSelectedDenied = () => {
    setChatSessions((prev) =>
      prev.filter((chat) => !selectedDeniedChats.includes(chat.id))
    );
    setSelectedDeniedChats([]);
  };

  return (
    <div className="ongoing-chats-container">
      <h2 className="ongoing-heading">Ongoing Chats</h2>

      {selectedDeniedChats.length > 0 && (
        <button
          className="chat-btn deny-btn"
          style={{ marginBottom: "15px", marginLeft: "10px" }}
          onClick={deleteSelectedDenied}
        >
          Delete Selected ({selectedDeniedChats.length})
        </button>
      )}

      {chatSessions.length === 0 && <p>No active chats.</p>}

      {chatSessions.map((chat) => {
        const isUser = chat.chatId && chat.chatId.startsWith("UCHAT-");

        return (
          <div key={chat.id} className="chat-rectangle">
            <div className="chat-info-row">
              {chat.status === "denied" && (
                <input
                  type="checkbox"
                  className="premium-checkbox"
                  checked={selectedDeniedChats.includes(chat.id)}
                  onChange={() => handleSelectDenied(chat.id)}
                />
              )}
              <div className="chat-info">
                <span>
                  <strong>{chat.name}</strong> ({chat.email})
                </span>
                {chat.topic && (
                  <span className="topic-chip">
                    {topicLabels[chat.topic] || chat.topic}
                  </span>
                )}
              </div>
            </div>

            {chat.status !== "in-progress" && chat.status !== "denied" && (
              <div className="ongoing-button-set">
                <button
                  className="chat-btn join-btn"
                  onClick={() => handleJoin(chat)}
                >
                  Join Chat
                </button>
                {isUser && (
                  <button
                    className="chat-btn deny-btn"
                    onClick={() => handleDeny(chat)}
                  >
                    Deny
                  </button>
                )}
              </div>
            )}

            {chat.status === "in-progress" && (
              <span className="status-label in-progress"  style={{ marginTop: "0rem"}}>In Progress</span>
            )}

            {chat.status === "denied" && (
              <span className="status-label denied" style={{ marginTop: "0rem"}}>Denied</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
