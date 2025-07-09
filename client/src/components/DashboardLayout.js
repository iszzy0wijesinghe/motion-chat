import { Outlet, Link, useLocation } from "react-router-dom";
import "../components/Dashboard.css";
import Logo from "../assets/logowhitefull.png";

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const agentInfo = JSON.parse(localStorage.getItem("agentInfo"));
  const isAdmin = agentInfo?.email === "admin@chat.com";

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logodashboard">
          <img src={Logo} alt="Logo" />
        </div>
        <h3 style={{ marginTop: "8rem", color:"white" }}>Agent Panel</h3>
        <ul className="nav-list">
          <li className={pathname === "/dashboard" ? "active" : ""}>
            <Link to="/dashboard">Home</Link>
          </li>
          <li className={pathname.includes("/ongoing") ? "active" : ""}>
            <Link to="/dashboard/ongoing">Ongoing Chats</Link>
          </li>
          <li className={pathname.includes("/responded") ? "active" : ""}>
            <Link to="/dashboard/responded">Responded Chats</Link>
          </li>
          <li className={pathname.includes("/satisfaction") ? "active" : ""}>
            <Link to="/dashboard/satisfaction">Customer Satisfaction</Link>
          </li>
          <li className={pathname.includes("/settings") ? "active" : ""}>
            <Link to="/dashboard/settings">Settings</Link>
          </li>
          {isAdmin && (
            <li className={pathname.includes("/agent-management") ? "active" : ""}>
              <Link to="/dashboard/agent-management">Agent Management</Link>
            </li>
          )}
          <li className={pathname.includes("/account") ? "active" : ""}>
            <Link to="/dashboard/account">Account</Link>
          </li>
          
        </ul>
      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
