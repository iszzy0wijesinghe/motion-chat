app.get("/api/report-analytics", async (req, res) => {
  try {
    // Fetch from RespondedChat model
    const chats = await RespondedChat.find();

    const totalChats = chats.length;
    const totalTimeInMinutes = chats.reduce((sum, chat) => {
      const [hrs, mins] = chat.sessionDuration.split(" : ").map(s => parseInt(s));
      return sum + (hrs * 60 + mins);
    }, 0);

    const ratedChats = chats.filter(c => c.rating && c.rating > 0);
    const notRated = totalChats - ratedChats.length;
    const fiveStars = ratedChats.filter(c => c.rating === 5).length;
    const oneStars = ratedChats.filter(c => c.rating === 1).length;
    const avgRating = ratedChats.length
      ? (ratedChats.reduce((sum, c) => sum + c.rating, 0) / ratedChats.length).toFixed(1)
      : "N/A";

    res.json({
      totalChats,
      totalTimeInMinutes,
      avgSessionTime: (totalTimeInMinutes / totalChats).toFixed(1),
      fiveStars,
      oneStars,
      notRated,
      rated: ratedChats.length,
      avgRating,
    });
  } catch (err) {
    console.error("Report analytics error:", err);
    res.status(500).json({ message: "Failed to generate report analytics" });
  }
});
