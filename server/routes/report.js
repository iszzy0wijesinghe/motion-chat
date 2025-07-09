const nodemailer = require("nodemailer");

router.post("/send-report-email", async (req, res) => {
  const { to, subject, htmlContent } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_SENDER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"MotionChat Reports" <${process.env.MAIL_SENDER}>`,
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Report emailed successfully" });
  } catch (err) {
    console.error("Mail Error:", err);
    res.status(500).json({ message: "Failed to send email" });
  }
});
