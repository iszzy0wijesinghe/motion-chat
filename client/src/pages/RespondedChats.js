import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./respondedChats.css";

export default function RespondedChats() {
  const [chats, setChats] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://motion-chat-production.up.railway.app/api/responded-chats")
      .then((res) => setChats(res.data))
      .catch((err) => console.error("❌ Failed to load chats", err));
  }, []);

  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  };

  const handleGenerateReport = () => {
    if (!fromDate || !toDate) {
      alert("Please select both From and To dates");
      return;
    }

    navigate("/responded-report", {
      state: { fromDate, toDate }
    });
  };

  return (
    <div className="responded-chat-container">
      <h2 style={{ marginTop: "-1rem" }}>Responded Chats</h2>

      <div className="report-controls-row">
        <div className="date-selectors">
          <label>
            From:{" "}
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </label>
          <label style={{ marginLeft: "1rem" }}>
            To:{" "}
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </label>
        </div>

        <button className="generate-report-btn" onClick={handleGenerateReport}>
          Generate Report
        </button>
      </div>

      <div className="responded-table-container">
        <table className="responded-table">
          <thead>
            <tr>
              <th>Chat ID</th>
              <th>User ID</th>
              <th>Topic</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Rating</th>
            </tr>
          </thead>
        </table>

        <div className="responded-table-body-wrapper">
          <table className="responded-table">
            <tbody>
              {chats.map((chat) => (
                <tr key={chat._id}>
                  <td>{chat.chatId}</td>
                  <td>{chat.userId}</td>
                  <td>{chat.topic}</td>
                  <td>{new Date(chat.date).toLocaleString()}</td>
                  <td>{formatDuration(chat.sessionDuration)}</td>
                  <td>
                    {chat.rating ? "★".repeat(chat.rating) : "Not Rated"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
