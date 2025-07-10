import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/Login.css";
import BubbleBackground from "../assets/BubbleBackground";
import Logo from "../assets/logowhitefull.png";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

const res = await fetch("https://motion-chat-production.up.railway.app/api/agent/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (res.ok) {
    if (data.approved === false) {
      alert("⏳ Your account is still under admin review. Please wait for approval.");
      return;
    }

    localStorage.setItem("token", data.token);

    // ✅ Store agent info for report preview
    localStorage.setItem(
      "agentInfo",
      JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        supportCategory: data.supportCategory,
        registeredAt: data.registeredAt,
      })
    );

    alert("Login successful ✅");
    navigate("/dashboard");
  } else {
    alert(data.message || "Login failed ❌");
  }
};


  <Link to="/" className="logo" style={{ cursor: "pointer" }}>
    <img src={Logo} alt="Logo" />
  </Link>;

  return (
    <div className="login-wrapper">
      <BubbleBackground />

      <div
        className="logologin"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        <img src={Logo} alt="Logo" />
      </div>
      <div className="login-container">
        <h2>Agent Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>

        
      </div>
      <div className="agent-login-notice">
          <p>
            Want to be an Agent?{" "}
            <button
              onClick={() => navigate("/agentregister")}
              className="agent-login-btn"
            >
              Register here
            </button>
          </p>
        </div>
    </div>
  );
}
