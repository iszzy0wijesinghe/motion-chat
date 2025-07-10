import React, { useEffect, useState } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import logoLoader from "../assets/logo-loader.json";
import logo from "../assets/logoblackfull.png";
import "./reportPreview.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";


export default function ReportPreview() {
  const [loading, setLoading] = useState(true);
  const [fromDate] = useState(localStorage.getItem("reportFromDate"));
  const [toDate] = useState(localStorage.getItem("reportToDate"));
  const [userData, setUserData] = useState(null);
  const [agentData] = useState(() => {
    const stored = localStorage.getItem("agentInfo");
    return stored ? JSON.parse(stored) : null;
  });
  const [analytics, setAnalytics] = useState(null);

useEffect(() => {
  axios.get("https://motion-chat-production.up.railway.app/api/report-analytics")
    .then(res => setAnalytics(res.data))
    .catch(err => console.error("Analytics fetch failed:", err));
}, []);



  useEffect(() => {
    fetch('/api/user-details')
      .then(res => res.json())
      .then(data => {
        console.log("✅ userData:", data);
        setUserData(data);
      })
      .catch(err => console.error("User fetch failed:", err));
  }, []);






  const [reportMeta] = useState({
    reportId: "REP-20250627",
    generatedDate: new Date().toLocaleDateString(),
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = async () => {
    const reportElement = document.querySelector(".report-page");
    if (!reportElement) {
      alert("Report content not found!");
      return;
    }

    const canvas = await html2canvas(reportElement, {
      scale: 2, // higher scale = better quality
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`MotionChat_Report_${reportMeta.reportId}.pdf`);
  };


  const handleEmail = async () => {
    const reportElement = document.querySelector(".report-page");
    if (!reportElement) {
      alert("Report content not found!");
      return;
    }

    const htmlContent = reportElement.innerHTML;

    try {
      const response = await fetch("/api/send-report-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: userData.email,
          subject: `Your MotionChat Report - ${reportMeta.reportId}`,
          htmlContent,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("✅ Report sent to your email!");
      } else {
        alert("❌ Failed to send email: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error sending email.");
    }
  };



  if (loading || !userData) {
    return (
      <div className="loader-screen">
        <Player autoplay loop src={logoLoader} style={{ width: 750 }} />
      </div>
    );
  }


  return (
    <div className="report-preview-container">
      <aside className="report-left-panel scrollable-report">
        <div className="report-page">
          <div className="report-logo" >
            <img src={logo} alt="Logo" />
          </div>

          <div className="report-header">
            <div>
              <h3>👨‍💼 Agent Details</h3>
              {agentData ? (
                <ul className="report-bullet">
                  <li>Full Name: <strong>{agentData.fullName}</strong></li>
                  <li>Email: <strong>{agentData.email}</strong></li>
                  <li>Support Category: <strong>{agentData.supportCategory}</strong></li>
                  <li>Joined On: <strong>{agentData.registeredAt}</strong></li>
                </ul>
              ) : (
                <p>No agent details available</p>
              )}

            </div>
            <div>
              <p><strong>Report ID:</strong> {reportMeta.reportId}</p>
              <p><strong>Generated:</strong> {reportMeta.generatedDate}</p>
              <p><strong>Date Range:</strong> {fromDate} - {toDate}</p>
            </div>
          </div>

          <hr />

          <h3>🧠 Analytical Summary</h3>
          <ul className="report-bullet">
            <li>Chats: <strong>{analytics?.totalChats ?? "-"}</strong></li>
            <li>Total Time Spent: <strong>{Math.floor((analytics?.totalTimeInMinutes ?? 0) / 60)} hrs {(analytics?.totalTimeInMinutes ?? 0) % 60} mins</strong></li>
            <li>Avg Session Time: <strong>{analytics?.avgSessionTime ?? "-"} mins</strong></li>
            <li>Most Returning User: <strong>alex@example.com</strong></li> {/* Optional – can be enhanced */}
            <li>Least Returning User: <strong>jane@example.com</strong></li>
            <li>Longest Chat: <strong>35 mins</strong></li> {/* Optional – can be calculated later */}
            <li>Shortest Chat: <strong>1 min</strong></li>
          </ul>

          <h3>⭐ Rating Insights</h3>
          <ul className="report-bullet">
            <li>Rated Customers: <strong>{analytics?.rated ?? "-"}</strong></li>
            <li>Not Rated: <strong>{analytics?.notRated ?? "-"}</strong></li>
            <li>5★ Ratings: <strong>{analytics?.fiveStars ?? "-"}</strong></li>
            <li>1★ Ratings: <strong>{analytics?.oneStars ?? "-"}</strong></li>
            <li>Average Rating: <strong>{analytics?.avgRating ?? "-"}★</strong></li>
          </ul>


          <div className="report-chart-placeholder">
            <h4>📊 Rating Distribution</h4>
            <div className="chart-box">[Insert Graph Here]</div>
          </div>

          <div className="report-chart-placeholder">
            <h4>📈 Session Time Activity</h4>
            <div className="chart-box">[Insert Time Chart Here]</div>
          </div>

          <footer className="report-footer">
            <p>📄 This report was automatically generated by MotionChat System</p>
            <p>{new Date().toLocaleString()}</p>
          </footer>
        </div>
      </aside>

      <aside className="report-actions-panel">
        <button className="report-btn" onClick={handleDownload}>⬇️ Download Report</button>
        <button className="report-btn" onClick={handleEmail}>📤 Share via Email</button>
      </aside>
    </div>
  );
}
