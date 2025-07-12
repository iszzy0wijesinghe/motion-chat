import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import BubbleBackground from "../assets/BubbleBackground";
import Logo from "../assets/logowhitefull.png";
import Lottie from "lottie-react";
import logoLoader from "../assets/logo-loader.json";

export default function EntryPage() {
  const navigate = useNavigate();
  const [logoFadeIn, setLogoFadeIn] = useState(false);
  const [loading, setLoading] = useState(true); // Loader flag
  const [fadeOut, setFadeOut] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLogoFadeIn(true);
    }, 50); // start fade-in shortly after mount

    return () => clearTimeout(timeout);
  }, []);

  // Simulate loading delay (2.5s)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true); // start fade-out of animation only
      setTimeout(() => {
        setLoading(false);
      }, 800); // match with fade animation duration
    }, 2600); // how long loader shows before fading

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          backgroundColor: "#000", // stays black always
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
        }}
      >
        <Lottie
          animationData={logoLoader}
          loop={true}
          style={{
            width: 720,
            opacity: fadeOut ? 0 : 1,
            transition: "opacity 0.8s ease",
          }}
        />
      </div>
    );
  }

  const handleGuestContinue = (e) => {
    e.preventDefault();

    if (guestName && guestEmail) {
      const guestId = "GUEST-" + Math.floor(1000 + Math.random() * 9000);
      const chatId = "CHAT-" + Math.floor(1000 + Math.random() * 9000);

      localStorage.setItem("guestName", guestName);
      localStorage.setItem("guestEmail", guestEmail);
      localStorage.setItem("guestId", guestId);
      localStorage.setItem("chatId", chatId);

      navigate("/chat-topic");
    }
  };

  return (
    <div className="entry-page">
      <BubbleBackground />

      <div
        className="logo"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        <img
          src={Logo}
          alt="Logo"
          style={{
            opacity: logoFadeIn ? 1 : 0,
            transition: "opacity 1.2s ease-in-out",
            transform: logoFadeIn ? "translateY(0px)" : "translateY(10px)",
          }}
        />
      </div>

      <div className="entry-content">
        <h1
          style={{
            fontSize: "3rem",
            marginBottom: "-0.5rem",
            marginTop: "2rem",
          }}
        >
          Welcome
        </h1>
        <p style={{ marginBottom: "2rem" }}>How would you like to continue?</p>

        {!guestMode ? (
          <div className="entry-buttons" style={{ marginBottom: "-7rem" }}>
            <button onClick={() => navigate("/userlogin")}>Login</button>
            <button onClick={() => navigate("/userregister")}>Register</button>
            <button onClick={() => setGuestMode(true)}>
              Continue as Guest
            </button>
          </div>
        ) : (
          <form
            className="guest-form"
            onSubmit={handleGuestContinue}
            style={{ marginBottom: "-7rem" }}
          >
            <input
              type="text"
              placeholder="Enter your name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Enter your email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              required
            />
            <button type="submit">Start</button>
          </form>
        )}

        <div className="agent-login-notice">
          <p>
            Are you a chat agent?{" "}
            <button
              onClick={(e) => {
                if (window.innerWidth <= 720) {
                  e.preventDefault();
                  const popup = document.getElementById("agent-mobile-popup");
                  if (popup) {
                    popup.style.display = "block";
                    setTimeout(() => {
                      popup.style.display = "none";
                    }, 2500);
                  }
                } else {
                  navigate("/login");
                }
              }}
              className="agent-login-btn"
            >
              Login here
            </button>
          </p>
        </div>
        <div
          id="agent-mobile-popup"
          style={{
            display: "none",
            position: "fixed",
            bottom: "120px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#fff",
            color: "#000",
            padding: "0.75rem 1.2rem",
            borderRadius: "12px",
            boxShadow: "0 0 20px rgba(0,0,0,0.4)",
            zIndex: 9999,
            fontSize: "0.95rem",
            fontWeight: "bold",
            opacity: 0.95,
          }}
        >
          Agent mode is compatible with desktop mode only.
        </div>
      </div>
    </div>
  );
}
