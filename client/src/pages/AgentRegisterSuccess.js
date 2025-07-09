import React from "react";
import { useNavigate } from "react-router-dom";
import BubbleBackground from "../assets/BubbleBackground";
import Logo from "../assets/logowhitefull.png";

export default function AgentRegisterSuccess() {
  const navigate = useNavigate();

  return (
    <div className="entry-page">
      <BubbleBackground />

      <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <img src={Logo} alt="Logo" />
      </div>

      <div className="entry-content">
        <h1 style={{ fontSize: "2.4rem", marginBottom: "0.5rem", color: "#00ffcc" }}>
          🎉 Application Submitted!
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#ddd", marginBottom: "2rem" }}>
          Thank you for registering as a MotionArts Chat Agent.
        </p>

        <div
          className="glass-card"
          style={{
            padding: "2rem",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#eee",
            maxWidth: "550px",
            margin: "0 auto",
            textAlign: "center",
            lineHeight: "1.6",
          }}
        >
          <p>✅ Your application has been received successfully.</p>
          <p>🔍 Our admin team will review your details and approve your account shortly.</p>
          <p>📧 Once approved, you will be notified via email and can then log in to your dashboard.</p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="agent-login-btn"
          style={{ marginTop: "2.5rem" }}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
