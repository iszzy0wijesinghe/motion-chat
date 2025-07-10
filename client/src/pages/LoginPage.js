import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import BubbleBackground from "../assets/BubbleBackground";
import Logo from "../assets/logowhitefull.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch("https://motion-chat-production.up.railway.app/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Save JWT token and user info
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userName", data.user.fullName);
        localStorage.setItem("isLoggedIn", "true");

        navigate("/userlanding");
      } else {
        setError(data.message || "Login failed.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
      console.error("Login error:", err);
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
        <img src={Logo} alt="Logo" />
      </div>

      <div className="entry-content">
        <h1
          style={{
            fontSize: "2.8rem",
            marginBottom: "0.5rem",
            marginTop: "2rem",
          }}
        >
          Login
        </h1>
        <p style={{ marginBottom: "2rem" }}>
          Welcome back! Enter your credentials below.
        </p>

        <form
          className="guest-form"
          onSubmit={handleLogin}
          style={{ marginBottom: "-7rem" }}
        >
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
          {error && (
            <p
              className="error-text"
              style={{ color: "red", marginTop: "0.5rem" }}
            >
              {error}
            </p>
          )}
        </form>

        <div className="agent-login-notice">
          <p>
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/userregister")}
              className="agent-login-btn"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
