import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BubbleBackground from "../assets/BubbleBackground";
import Logo from "../assets/logowhitefull.png";
import "../App.css";

export default function UserLandingPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Get the logged-in user's name
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.fullName) {
      setUserName(storedUser.fullName);
    }
  }, []);

  const buttonStyle = {
    width: "100%",
    padding: "1rem",
    borderRadius: "20px",
    marginBottom: "1.2rem",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "#fff",
    fontSize: "1.2rem",
    fontWeight: "600",
    backdropFilter: "blur(12px)",
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  const handleClick = (route) => {
    navigate(route);
  };

  return (
    <div className="entry-page">
      <BubbleBackground />
      <div
        className="logo"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        <img src={Logo} alt="Logo" />
      </div>

      <div className="entry-content" style={{ maxWidth: "500px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          Hi {userName || "there"}, welcome back!
        </h1>
        <p style={{ marginBottom: "2rem", color: "#ccc" }}>
          What would you like to do today?
        </p>

        <button style={buttonStyle} onClick={() => handleClick("/userchattopic")}>
          💬 Chat Agent (Urgent Help)
        </button>
        <button style={buttonStyle} onClick={() => handleClick("/raise-ticket")}>
          📝 Raise a Ticket
        </button>
        <button style={buttonStyle} onClick={() => handleClick("/faq")}>
          ❓ FAQ Section
        </button>
        <button style={buttonStyle} onClick={() => handleClick("/chat-history")}>
          📜 Chat History
        </button>
      </div>
    </div>
  );
}
