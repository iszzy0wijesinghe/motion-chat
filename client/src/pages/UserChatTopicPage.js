import React from "react";
import { useNavigate } from "react-router-dom";
import serviceIcon from "../assets/legal.png";
import appointmentIcon from "../assets/legal.png";
import creativityIcon from "../assets/legal.png";
import paymentIcon from "../assets/legal.png";
import legalIcon from "../assets/legal.png";
import orderIcon from "../assets/legal.png";
import otherIcon from "../assets/legal.png";

const topicData = [
  { label: "About Our Service", value: "service", icon: serviceIcon },
  { label: "About Appointment", value: "appointment", icon: appointmentIcon },
  { label: "About Creativity", value: "creativity", icon: creativityIcon },
  { label: "About Payments", value: "payments", icon: paymentIcon },
  { label: "About Copyrights and Legal Actions", value: "legal", icon: legalIcon },
  { label: "About Their Order", value: "order", icon: orderIcon },
  { label: "Other", value: "other", icon: otherIcon },
];

export default function UserChatTopicPage() {
  const navigate = useNavigate();

  const handleSelect = (topic) => {
  if (topic === "service") {
    navigate("/our-service");
  } else {
    localStorage.setItem("chatTopic", topic);
    sessionStorage.setItem("refreshUserChat", Date.now().toString());

    // ✅ Delay navigation slightly to ensure localStorage is written
    setTimeout(() => {
      navigate("/userchat");
    }, 100); // 100ms is enough
  }
};


  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #f7f7f7, #e6e6e6)",
        padding: "3rem 1rem",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "2.4rem",
          marginBottom: "2rem",
          color: "#111",
        }}
      >
        👋 Welcome back! What can we help you with?
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "2rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {topicData.map((topic) => (
          <div
            key={topic.value}
            onClick={() => handleSelect(topic.value)}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              borderRadius: "20px",
              padding: "2rem",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-8px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <img
              src={topic.icon}
              alt={topic.label}
              style={{
                width: "60px",
                height: "60px",
                marginBottom: "1rem",
              }}
            />
            <p
              style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#222",
              }}
            >
              {topic.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
