import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import BubbleBackground from "../assets/BubbleBackground";
import Logo from "../assets/logowhitefull.png";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1
  const [fullName, setFullName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Step 2
  const [otp, setOtp] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");

  // Step 3
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleNextStep1 = async (e) => {
    e.preventDefault();

    if (!fullName || !contactNo || !email || !address) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setIsSendingOtp(true);
      const res = await fetch("https://motion-chat-production.up.railway.app/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setIsSendingOtp(false);

      if (res.ok) {
        setStep(2);
      } else {
        alert("Failed to send OTP: " + data.message);
      }
    } catch (err) {
      setIsSendingOtp(false);
      alert("Error sending OTP.");
      console.error(err);
    }
  };

  const verifyOtp = async (finalOtp) => {
    try {
      const res = await fetch("http://localhost:3001/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: finalOtp }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep(3);
      } else {
        setOtpError("Incorrect OTP. Go back or login as guest.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setOtpError("Something went wrong. Try again.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setPasswordError("Both fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          contactNo,
          email,
          address,
          customerId,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Registration successful!");
        navigate("/userlogin");
      } else {
        alert("❌ Registration failed: " + data.message);
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("❌ Unexpected error occurred.");
    }
  };

  const baseInputStyle = {
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    backgroundColor: "#6f6f6f",
    color: "#fff",
    transition: "box-shadow 0.3s ease, transform 0.2s ease",
  };

  const focusedStyle = {
    boxShadow: "0 0 10px rgba(255, 255, 255, 0.6)",
    transform: "scale(1.01)",
  };

  const renderStep1 = () => (
    <form onSubmit={handleNextStep1} style={{ maxWidth: "500px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "-7rem" }}>
      <div style={{ display: "flex", gap: "1rem" }}>
        <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} onFocus={() => setFocusedField("fullName")} onBlur={() => setFocusedField("")} required
          style={{ flex: 1, ...baseInputStyle, ...(focusedField === "fullName" ? focusedStyle : {}) }} />
        <input type="text" placeholder="Contact No" value={contactNo} onChange={(e) => setContactNo(e.target.value)} onFocus={() => setFocusedField("contactNo")} onBlur={() => setFocusedField("")} required
          style={{ flex: 1, ...baseInputStyle, ...(focusedField === "contactNo" ? focusedStyle : {}) }} />
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField("")} required
          style={{ flex: 1, ...baseInputStyle, ...(focusedField === "email" ? focusedStyle : {}) }} />
        <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} onFocus={() => setFocusedField("address")} onBlur={() => setFocusedField("")} required
          style={{ flex: 1, ...baseInputStyle, ...(focusedField === "address" ? focusedStyle : {}) }} />
      </div>
      <input type="text" placeholder="Customer ID (Optional)" value={customerId} onChange={(e) => setCustomerId(e.target.value)} onFocus={() => setFocusedField("customerId")} onBlur={() => setFocusedField("")}
        style={{ width: "93%", marginTop: "0.5rem", ...baseInputStyle, ...(focusedField === "customerId" ? focusedStyle : {}) }} />
      <button type="submit" style={{ marginTop: "1rem", padding: "0.75rem 1rem", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "bold", background: "#fff", color: "#000", backdropFilter: "blur(8px)" }}>
        {isSendingOtp ? <div className="line-loader"></div> : "Next"}
      </button>
    </form>
  );

  const renderStep2 = () => {
    const handleOtpChange = (value, index) => {
      if (!/^\d*$/.test(value)) return;
      const updated = [...otpDigits];
      updated[index] = value;
      setOtpDigits(updated);

      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }

      const fullOtp = updated.join("");
      if (fullOtp.length === 6 && !updated.includes("")) {
        setOtp(fullOtp);
        verifyOtp(fullOtp);
      }
    };

    const handleKeyDown = (e, index) => {
      if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
        document.getElementById(`otp-${index - 1}`).focus();
      }
    };

    return (
      <form className="guest-form" onSubmit={(e) => e.preventDefault()} style={{ marginBottom: "-7rem" }}>
        <p style={{ color: "white", fontWeight: "bold", marginBottom: "1rem" }}>Verification OTP sent to your email!</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "1rem" }}>
          {otpDigits.map((digit, index) => (
            <input key={index} id={`otp-${index}`} type="text" maxLength={1} value={digit}
              onChange={(e) => handleOtpChange(e.target.value, index)} onKeyDown={(e) => handleKeyDown(e, index)}
              style={{ width: "40px", height: "50px", textAlign: "center", fontSize: "20px", borderRadius: "8px", border: "1px solid #ccc", backgroundColor: "#1f1f1f", color: "#fff", outline: "none" }}
            />
          ))}
        </div>
        {otpError && <p style={{ color: "red" }}>{otpError}</p>}
        <p style={{ marginTop: "1rem" }}>
          <button type="button" onClick={() => setStep(1)} className="agent-login-btn" style={{ height: "2.6rem" }}>Go Back</button>{" "}
          or{" "}
          <button type="button" onClick={() => navigate("/")}>Login as Guest</button>
        </p>
      </form>
    );
  };

  const renderStep3 = () => (
    <form className="guest-form" onSubmit={handleRegister} style={{ marginBottom: "-7rem" }}>
      <input type="password" placeholder="Enter Password" value={password} onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }} required />
      <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(""); }} required />
      {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
      <button type="submit">Complete Registration</button>
    </form>
  );

  return (
    <div className="entry-page">
      <BubbleBackground />
      <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <img src={Logo} alt="Logo" />
      </div>
      <div className="entry-content">
        <h1 style={{ fontSize: "2.8rem", marginBottom: "0.5rem", marginTop: "-1rem" }}>Register</h1>
        <p style={{ marginBottom: "2rem" }}>
          {step === 1 && "Create your account by filling in the details."}
          {step === 2 && "Verify your email address to continue."}
          {step === 3 && "Set a strong password for your account."}
        </p>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        <div className="agent-login-notice" style={{ marginTop: "8rem" }}>
          <p>
            Already have an account?{" "}
            <button onClick={() => navigate("/userlogin")} className="agent-login-btn">
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
