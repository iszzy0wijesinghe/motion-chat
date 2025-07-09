const express = require("express");
const Agent = require("../models/Agent");
const router = express.Router();

// Get all agents (approved + pending)
router.get("/all", async (req, res) => {
  try {
    const approvedAgents = await Agent.find({ isApproved: true });
    const pendingAgents = await Agent.find({ isApproved: false });
    res.json({ approved: approvedAgents, pending: pendingAgents });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch agents" });
  }
});

// Approve agent
router.post("/approve/:id", async (req, res) => {
  try {
    await Agent.findByIdAndUpdate(req.params.id, { isApproved: true });
    res.json({ message: "Agent approved" });
  } catch (err) {
    res.status(500).json({ message: "Approval failed" });
  }
});

// Delete agent
router.delete("/:id", async (req, res) => {
  try {
    await Agent.findByIdAndDelete(req.params.id);
    res.json({ message: "Agent deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// ✅ FIX: Export the router
module.exports = router;
