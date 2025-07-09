const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  const htmlTemplate = `
    <div style="font-family: 'Segoe UI', sans-serif; padding: 50px; background: linear-gradient(145deg, #111827, #1f2937); color: #ffffff; border-radius: 12px; max-width: 600px; margin: auto; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);">
      <div style="text-align: center;">
        <img src="https://res.cloudinary.com/dfejydorr/image/upload/v1750829933/logowhitefull_cmtpxe.png" alt="MotionArts Logo" style="height: 80px; margin-bottom: 25px; margin-top: 30px;" />
        <h2 style="color: #e0e0e0; font-size: 24px; margin-bottom: 10px;">Email Verification</h2>
        <p style="color: #9ca3af;">Please confirm your email address to continue</p>
      </div>

      <div style="margin-top: 30px; background: #1f2937; border-radius: 10px; padding: 20px; text-align: center;">
        <p style="font-size: 16px; margin-bottom: 12px; color: #ffffff;">Your one-time password <br> (OTP) is:</p>
        <span style="font-size: 28px; letter-spacing: 3px; font-weight: bold; background: #111827; padding: 12px 24px; border: 2px dashed #e5e7eb; border-radius: 8px; display: inline-block; color: #ffffff;">
          ${otp}
        </span>
        <p style="margin-top: 20px; color: #ffffff;">This OTP is valid for 5 minutes. <br> Please do not share it with anyone.</p>
      </div>

      <div style="margin-top: 40px; text-align: center; font-size: 14px; color: #6b7280;">
        <p>Need help? Contact us at <a href="mailto:info.motionchatlk@gmail.com" style="color: #60a5fa;">support@motionarts.lk</a></p>
        <p style="margin-top: 10px;">— The MotionArts Team</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"MotionArts Support" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: "Your MotionArts OTP Verification Code",
    html: htmlTemplate,
  });
};

module.exports = { sendOtpEmail };
