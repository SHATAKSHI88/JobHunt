import nodemailer from "nodemailer";

// Reuses a single transporter. Works with Gmail (using an App Password)
// or any SMTP provider — just set the env vars accordingly.
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for port 465, false for 587
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

/**
 * Sends an email. Never throws — logs and returns false on failure so a
 * flaky email provider can never break a core flow like signup or applying.
 */
const sendEmail = async ({ to, subject, html }) => {
    try {
        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            console.warn("SMTP_EMAIL / SMTP_PASSWORD not set — skipping email send.");
            return false;
        }
        await transporter.sendMail({
            from: `"JobHunt" <${process.env.SMTP_EMAIL}>`,
            to,
            subject,
            html,
        });
        return true;
    } catch (error) {
        console.error("Failed to send email:", error.message);
        return false;
    }
};

export default sendEmail;
