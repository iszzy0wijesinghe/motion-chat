import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import OngoingChats from "./pages/OngoingChats";
import RespondedChats from "./pages/RespondedChats";
import CustomerSatisfaction from "./pages/CustomerSatisfaction";
import Settings from "./pages/Settings";
import Account from "./pages/Account";
import EntryPage from "./pages/EntryPage";
import ChatTopicPage from "./pages/ChatTopicPage";
import UserLogin from "./pages/LoginPage";
import GuestChatPage from "./pages/GuestChatPage";
import RegisterUser from "./pages/RegisterPage";
import AgentChatPage from "./pages/AgentChatPage";
import UserChatPage from "./pages/UserChatPage";
import UserChatTopicPage from "./pages/UserChatTopicPage";
import UserLanding from "./pages/UserLandingPage";
import AuthRoute from "./components/AuthRoute";
import UserAgentChat from "./pages/UserAgentChatPage";
import RegisterAgent from "./pages/RegisterAgentPage";
import ReportPreview from "./pages/ReportPreview";
import AgentRegisterSuccess from "./pages/AgentRegisterSuccess";
import AgentManagementPage from "./pages/AgentManagementPage";
import "./App.css";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* ✅ Landing Page */}
        <Route path="/" element={<EntryPage />} />

        {/* ✅ Login Page */}
        <Route path="/login" element={<Login />} />

        {/* ✅ Chat Topic Selection */}
        <Route path="/chat-topic" element={<ChatTopicPage />} />

        {/* ✅ Registration Success Page */}
        <Route path="/agentregister-success" element={<AgentRegisterSuccess />} />

        {/* ✅ Guest Chat */}
        <Route
          path="/chat"
          element={
            <GuestChatPage key={sessionStorage.getItem("refreshGuestChat")} />
          }
        />

        {/* ✅ User Login / Register */}
        <Route path="/userlogin" element={<UserLogin />} />
        <Route path="/userregister" element={<RegisterUser />} />

        {/* ✅ Agent Register */}
        <Route path="/agentregister" element={<RegisterAgent />} />

        {/* ✅ Authenticated User Chat */}
        <Route
          path="/userchat"
          element={
            <AuthRoute>
              <UserChatPage key={sessionStorage.getItem("refreshUserChat")} />
            </AuthRoute>
          }
        />
        <Route
          path="/useragentchat/:userId"
          element={
            <AuthRoute>
              <UserAgentChat />
            </AuthRoute>
          }
        />
        <Route
          path="/userchattopic"
          element={
            <AuthRoute>
              <UserChatTopicPage />
            </AuthRoute>
          }
        />
        <Route
          path="/userlanding"
          element={
            <AuthRoute>
              <UserLanding />
            </AuthRoute>
          }
        />

        {/* ✅ Agent Chat */}
        <Route path="/agent-chat/:guestId" element={<AgentChatPage />} />

        {/* ✅ Report Preview */}
        <Route path="/responded-report" element={<ReportPreview />} />

        {/* ✅ Protected Dashboard Pages */}
        {isAuthenticated ? (
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Home />} />
            <Route path="ongoing" element={<OngoingChats />} />
            <Route path="responded" element={<RespondedChats />} />
            <Route path="satisfaction" element={<CustomerSatisfaction />} />
            <Route path="settings" element={<Settings />} />
            <Route path="account" element={<Account />} />
            <Route path="agent-management" element={<AgentManagementPage />} /> {/* ✅ moved here */}
          </Route>
        ) : (
          <Route path="/dashboard/*" element={<Navigate to="/login" replace />} />
        )}

        {/* ✅ Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
