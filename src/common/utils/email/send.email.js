import nodemailer from "nodemailer";
import { APP_EMAIL, APP_NAME, APP_PASSWORD } from "../../../config.js";
import { BadRequestException } from "../../exceptions/index.js";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: APP_EMAIL,
        pass: APP_PASSWORD,
    },
    // logger: true,
    // debug: false,
    // connectionTimeout: 20000,
    // greetingTimeout: 15000,
});

export const sendEmail = async ({ to, cc, bcc, subject, text, html, attachments = [] }) => {
    try {

        if (!to?.length && !cc?.length && !bcc?.length) {
            BadRequestException({
                message: "At least one recipient is required.",
            })
        }

        if (!attachments?.length && !text?.length && !html?.length) {
            BadRequestException({
                message: 'Missing email content'
            })
        }
        console.time('sendMail duration');
        const info = await transporter.sendMail({
            from: `"${APP_NAME}" <${APP_EMAIL}>`,
            to,
            cc,
            bcc,
            subject,
            text,
            html,
        });

        console.log("Email sent successfully:", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (err) {
        console.error("Error while sending mail:", err);
    }
}