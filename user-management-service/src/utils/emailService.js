import nodemailer from "nodemailer";
import config from "../configs/index.js"; 

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
    }
});

/**
 * Sends an email using Nodemailer
 * @param {string} to - Recipient's email address
 * @param {string} subject - Email subject
 * @param {string} text - Email body (plain text)
 * @param {string} [html] - Optional HTML content
 */
export const sendEmail = async (to, subject, text, html = null) => {
    try {
        const mailOptions = {
            from: `"Foodie" <${config.EMAIL_USER}>`,
            to,
            subject,
            text,
            ...(html && { html }) 
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}: ${info.response}`);
        return info;
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error.message);
        throw new Error("Email sending failed.");
    }
};

export default sendEmail;
