import { useEffect, useState } from "react";
import "./AgentManagementPage.css";

export default function AgentManagementPage() {
  const [pendingAgents, setPendingAgents] = useState([]);
  const [approvedAgents, setApprovedAgents] = useState([]);

  const fetchAgents = async () => {
    try {
      const res = await fetch("https://motion-chat-production.up.railway.app/api/agent-management/all");
      const data = await res.json();
      setPendingAgents(data.pending);
      setApprovedAgents(data.approved);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
    }
  };

  const approveAgent = async (id) => {
    try {
      await fetch(`https://motion-chat-production.up.railway.app/api/agent-management/approve/${id}`, {
        method: "POST",
      });
      fetchAgents();
    } catch (err) {
      console.error("Approval failed:", err);
    }
  };

  const deleteAgent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this agent?")) return;
    try {
      await fetch(`https://motion-chat-production.up.railway.app/api/agent-management/${id}`, {
        method: "DELETE",
      });
      fetchAgents();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <div className="dashboard-content">
      <h2 className="dashboard-title">👥 Agent Management</h2>

      {/* Pending Requests */}
      <div className="glass-card-agent glass-subcard">
        <h3>Pending Agent Requests</h3>
        {pendingAgents.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          <table className="agent-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>NIC</th>
                <th>Education</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Approve</th>
              </tr>
            </thead>
            <tbody>
              {pendingAgents.map((agent) => (
                <tr key={agent._id}>
                  <td>{agent.name}</td>        {/* ✅ fixed */}
                  <td>{agent.nic}</td>
                  <td>{agent.education}</td>
                  <td>{agent.contact}</td> 
                  <td>{agent.email}</td>
                  <td>
                    <button
                      className="dashboard-button approve"
                      onClick={() => approveAgent(agent._id)}
                    >
                      ✅ Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Approved Agents */}
      <div className="glass-card-agent glass-subcard">
        <h3>Approved Agents</h3>
        {approvedAgents.length === 0 ? (
          <p>No approved agents.</p>
        ) : (
          <table className="agent-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvedAgents.map((agent) => (
                <tr key={agent._id}>
                  <td>{agent._id.slice(-6)}</td>
                  <td>{agent.name}</td>        {/* ✅ fixed */}
                  <td>{agent.contact}</td> 
                  <td>{agent.email}</td>
                  <td>
                    <button
                      className="dashboard-button delete"
                      onClick={() => deleteAgent(agent._id)}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
