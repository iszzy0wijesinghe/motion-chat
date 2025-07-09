import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
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

export default function ChatTopicPage() {
  const navigate = useNavigate();
  const isGuest = !!localStorage.getItem("guestName");

  const visibleTopics = isGuest
    ? topicData.filter(
        (t) => t.value !== "payments" && t.value !== "order"
      )
    : topicData;

  const handleSelect = (topic) => {
    if (topic === "service") {
      navigate("/our-service");
    } else {
      localStorage.setItem("chatTopic", topic);
      sessionStorage.setItem("refreshGuestChat", Date.now().toString());
      navigate("/chat");
    }
  };

  return (
    <div className="chat-topic-page">
      <h2 className="topic-header">Select what you need help with</h2>
      <div className="glass-grid">
        {visibleTopics.map((topic) => (
          <div
            key={topic.value}
            className="glass-card"
            onClick={() => handleSelect(topic.value)}
          >
            <img src={topic.icon} alt={topic.label} className="topic-icon" />
            <p>{topic.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
