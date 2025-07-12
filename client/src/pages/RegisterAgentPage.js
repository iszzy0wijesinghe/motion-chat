import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import BubbleBackground from "../assets/BubbleBackground";
import Logo from "../assets/logowhitefull.png";

export default function RegisterAgentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1: Agreements
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);

  // Step 2: Personal Info
  const [fullName, setFullName] = useState("");
  const [nic, setNic] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  // Step 3: More Info
  const [supportType, setSupportType] = useState("");
  const [education, setEducation] = useState("");
  const [aboutYou, setAboutYou] = useState("");

  // Step 4: OTP
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState("");

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

  const validateSLPhone = (phone) => /^0\d{9}$/.test(phone);
  const validateEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const handleAgreeNext = (e) => {
    e.preventDefault();
    if (!agree1 || !agree2) return alert("Please agree to all terms.");
    setStep(2);
  };

  const handleNextStep2 = (e) => {
    e.preventDefault();
    if (!fullName || !nic || !contactNo || !personalEmail || !address)
      return alert("Fill all required fields.");
    if (!validateSLPhone(contactNo))
      return alert("Phone must start with 0 and have 10 digits.");
    if (!validateEmail(personalEmail))
      return alert("Enter a valid email address.");
    setStep(3);
  };

  const handleNextStep3 = async (e) => {
    e.preventDefault();
    if (!supportType || !education)
      return alert("Please complete all required fields.");
    try {
      setIsSendingOtp(true);
      const res = await fetch("https://motion-chat-production.up.railway.app/api/agent/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: personalEmail }),
      });
      const data = await res.json();
      setIsSendingOtp(false);
      if (res.ok) setStep(4);
      else alert("Failed to send OTP: " + data.message);
    } catch (err) {
      setIsSendingOtp(false);
      alert("Error sending OTP.");
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);
    if (value && index < 5)
      document.getElementById(`otp-${index + 1}`).focus();
    const fullOtp = updated.join("");
    if (fullOtp.length === 6 && !updated.includes("")) verifyOtp(fullOtp);
  };

  const verifyOtp = async (finalOtp) => {
    try {
      const res = await fetch("https://motion-chat-production.up.railway.app/api/agent/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: personalEmail, otp: finalOtp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await registerAgent();
        navigate("/agentregister-success");
      } else {
        setOtpError("Incorrect OTP. Try again.");
      }
    } catch (err) {
      setOtpError("Verification error. Try again.");
    }
  };

  const registerAgent = async () => {
    try {
      const res = await fetch("https://motion-chat-production.up.railway.app/api/agent/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          nic,
          contactNo,
          email: personalEmail,
          address,
          password, // ✅ add this
          supportType,
          education,
          aboutYou,
        }),

      });

      const data = await res.json();
      if (res.ok) setShowSuccess(true);
      else alert("Registration failed: " + data.message);
    } catch (err) {
      alert("Server error during registration.");
    }
  };

  useEffect(() => {
    if (showSuccess) {
      const timeout = setTimeout(() => navigate("/agent-login"), 3500);
      return () => clearTimeout(timeout);
    }
  }, [showSuccess]);

  const renderStep1 = () => (
    <form onSubmit={handleAgreeNext} style={{ maxWidth: "500px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.2rem", marginBottom: "-7rem" }}>
      <div
        style={{
          height: "160px",
          overflowY: "auto",
          backgroundColor: "#1f1f1f",
          padding: "1rem",
          borderRadius: "12px",
          border: "1px solid #444",
          fontSize: "0.95rem",
          color: "#ccc",
          lineHeight: "1.5",
          scrollBehavior: "smooth",
        }}
      >
        <p style={{ fontWeight: "bold", color: "#fff", marginBottom: "0.5rem" }}>Creative Commons Terms:</p>
        <p>✅ You agree to provide honest, respectful, and private support for MotionArts customers.</p>
        <p>🔐 You must protect customer data and avoid misuse of the platform.</p>
        <p>🧭 All chats may be monitored for quality assurance and training purposes.</p>
        <p>❌ Violation of these terms may result in immediate removal from the agent system.</p>
      </div>

      <label style={{ display: "flex", alignItems: "center", color: "#eee", fontSize: "0.92rem" }}>
        <input
          type="checkbox"
          checked={agree1}
          onChange={() => setAgree1(!agree1)}
          style={{
            marginRight: "10px",
            width: "18px",
            height: "18px",
            accentColor: "#00c6ff",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        />
        I agree to the Terms and Conditions
      </label>

      <label style={{ display: "flex", alignItems: "center", color: "#eee", fontSize: "0.92rem", marginTop: "-1rem" }}>
        <input
          type="checkbox"
          checked={agree2}
          onChange={() => setAgree2(!agree2)}
          style={{
            marginRight: "10px",
            width: "18px",
            height: "18px",
            accentColor: "#00c6ff",
            borderRadius: "5px",
            cursor: "pointer",

          }}
        />
        I allow my data to be reviewed
      </label>

      <button
        type="submit"
        style={{
          marginTop: "0rem",
          padding: "0.75rem 1rem",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
          background: "#fff",
          color: "#000",
          marginBottom: "1rem",
          backdropFilter: "blur(8px)",
        }}
      >
        Continue
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleNextStep2} style={{ maxWidth: "600px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "-7rem" }}>
      <div style={{ display: "flex", gap: "1rem" }}>
        <input type="text" placeholder="Full Name" value={fullName} required
          onChange={(e) => setFullName(e.target.value)}
          onFocus={() => setFocusedField("fullName")}
          onBlur={() => setFocusedField("")}
          style={{ flex: 1, ...baseInputStyle, ...(focusedField === "fullName" ? focusedStyle : {}) }}
        />
        <input type="text" placeholder="NIC" value={nic} required
          onChange={(e) => setNic(e.target.value)}
          onFocus={() => setFocusedField("nic")}
          onBlur={() => setFocusedField("")}
          style={{ flex: 1, ...baseInputStyle, ...(focusedField === "nic" ? focusedStyle : {}) }}
        />
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <input
          type="text"
          placeholder="Contact No (e.g. 0712345678)"
          value={contactNo}
          required
          pattern="^0\d{9}$"
          title="Must be 10 digits and start with 0 (e.g. 0712345678)"
          onChange={(e) => setContactNo(e.target.value)}
          onFocus={() => setFocusedField("contactNo")}
          onBlur={() => setFocusedField("")}
          style={{ flex: 1, ...baseInputStyle, ...(focusedField === "contactNo" ? focusedStyle : {}) }}
        />
        <input
          type="email"
          placeholder="Personal Email"
          value={personalEmail}
          required
          onChange={(e) => setPersonalEmail(e.target.value)}
          onFocus={() => setFocusedField("personalEmail")}
          onBlur={() => setFocusedField("")}
          style={{ flex: 1, ...baseInputStyle, ...(focusedField === "personalEmail" ? focusedStyle : {}) }}
        />
      </div>

      <input type="text" placeholder="Address" value={address} required
        onChange={(e) => setAddress(e.target.value)}
        onFocus={() => setFocusedField("address")}
        onBlur={() => setFocusedField("")}
        style={{ width: "97%", ...baseInputStyle, ...(focusedField === "address" ? focusedStyle : {}) }}
      />

      <input
        type="password"
        placeholder="Create Password"
        value={password}
        required
        onChange={(e) => setPassword(e.target.value)}
        onFocus={() => setFocusedField("password")}
        onBlur={() => setFocusedField("")}
        style={{ width: "97%", ...baseInputStyle, ...(focusedField === "password" ? focusedStyle : {}) }}
      />


      <button type="submit" className="agent-login-btn" style={{ marginTop: "1rem" }}>
        Next
      </button>
    </form>
  );


  const renderStep3 = () => (
    <form
      onSubmit={handleNextStep3}
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        marginBottom: "-7rem",
      }}
    >
      <div style={{ display: "flex", gap: "1rem" }}>
        <select
          value={supportType}
          required
          onChange={(e) => setSupportType(e.target.value)}
          onFocus={() => setFocusedField("supportType")}
          onBlur={() => setFocusedField("")}
          style={{
            flex: 1,
            appearance: "none",
            ...baseInputStyle,
            ...(focusedField === "supportType" ? focusedStyle : {}),
          }}
        >
          <option value="">Agent Support Type</option>
          <option value="parttime">Part-time</option>
          <option value="fulltime">Full-time</option>
        </select>

        <select
          value={education}
          required
          onChange={(e) => setEducation(e.target.value)}
          onFocus={() => setFocusedField("education")}
          onBlur={() => setFocusedField("")}
          style={{
            flex: 1,
            appearance: "none",
            ...baseInputStyle,
            ...(focusedField === "education" ? focusedStyle : {}),
          }}
        >
          <option value="">Education Level</option>
          <option value="ol">O/Ls</option>
          <option value="al">A/Ls</option>
          <option value="bachelors">Bachelor's</option>
          <option value="postgraduate">Postgraduate</option>
        </select>
      </div>

      <textarea
        placeholder="About You (optional)"
        value={aboutYou}
        onChange={(e) => setAboutYou(e.target.value)}
        onFocus={() => setFocusedField("aboutYou")}
        onBlur={() => setFocusedField("")}
        style={{
          ...baseInputStyle,
          height: "100px",
          resize: "none",
          ...(focusedField === "aboutYou" ? focusedStyle : {}),
        }}
      />

      <button type="submit" className="agent-login-btn">
        {isSendingOtp ? <div className="line-loader"></div> : "Send OTP"}
      </button>
    </form>
  );


  const renderStep4 = () => (
    <form onSubmit={(e) => e.preventDefault()} style={{ marginBottom: "-7rem" }}>
      <p style={{ color: "green", marginBottom: "1rem", textAlign: "center" }}>
        Verification OTP sent to your email!
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          marginBottom: "1rem",
        }}
      >
        {otpDigits.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(e.target.value, index)}
            //   onKeyDown={(e) => handleOtpKeyDown(e, index)}
            style={{
              width: "45px",
              height: "55px",
              textAlign: "center",
              fontSize: "22px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              backgroundColor: "#1f1f1f",
              color: "#fff",
              outline: "none",
              transition: "box-shadow 0.3s ease",
              boxShadow:
                focusedField === `otp-${index}`
                  ? "0 0 10px rgba(255, 255, 255, 0.5)"
                  : "none",
            }}
            onFocus={() => setFocusedField(`otp-${index}`)}
            onBlur={() => setFocusedField("")}
          />
        ))}
      </div>

      {otpError && (
        <p style={{ color: "red", textAlign: "center" }}>{otpError}</p>
      )}
    </form>
  );


  return (
    <div className="entry-page">
      <BubbleBackground />
      <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        <img src={Logo} alt="Logo" />
      </div>
      <div className="entry-content-agnerreg">
        <h1 style={{ fontSize: "2.6rem", marginBottom: "0.5rem" }}>Become a Chat Agent</h1>
        <p style={{ marginBottom: "2rem" }}>
          {step === 1 && "Please agree to terms before continuing."}
          {step === 2 && "Enter your personal details."}
          {step === 3 && "Tell us a bit more about you."}
          {step === 4 && "Verify your email to complete registration."}
        </p>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        {showSuccess && (
          <div className="popup-success glass-card" style={{ padding: "2rem", borderRadius: "16px", background: "rgba(255,255,255,0.1)", border: "1px solid #aaa", textAlign: "center", marginTop: "2rem" }}>
            <h2 style={{ color: "#00ff99", fontSize: "1.8rem" }}>✅ Registration Successful!</h2>
            <p style={{ marginTop: "1rem" }}>🎉 You are now an official MotionArts Agent!</p>
          </div>
        )}

        <div className="agent-login-notice" style={{ marginTop: "7rem" }}>
          <p>
            Already an agent?{" "}
            <button onClick={() => navigate("/agent-login")} className="agent-login-btn">
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
