import dotenv from "dotenv";
dotenv.config();

import transporter from "./config/mail.js";

try {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: "vinayaknatikar123@gmail.com", // Replace with your test email
    subject: "Test Email",
    html: `
      <h2>Hello!</h2>
      <p>This is a test email sent from your Node.js application.</p>
    `,
  });

  console.log("✅ Email sent successfully.");
} catch (err) {
  console.error("❌ Error sending email:", err);
}
