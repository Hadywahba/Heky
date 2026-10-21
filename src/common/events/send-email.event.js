import { EventEmitter } from "node:events";
import { sendEmail } from "../utils/index.js";
import path from "node:path";
import { confirmEmailTemplate } from "../templates/index.js";


export const emailEvent = new EventEmitter();
const logoPath = path.resolve("D:/Backend/Saraha-app/public/assets/images/logo.png");

emailEvent.on('confirmEmail', async ({ recipient, subject, data }) => {
    try {
        await sendEmail({
            ...recipient,
            subject,
            html: confirmEmailTemplate({
                userName: data.userName,
                code: data.code,
                subject
            }),
            attachments: [
                {
                    filename: "logo.png",
                    path: logoPath,
                    cid: "app-logo",
                },
            ],
        })
    } catch (error) {
        console.log(error)
    }
})

emailEvent.on('forgotPassword', async ({ recipient, subject, data }) => {
    try {
        await sendEmail({
            ...recipient,
            subject,
            html: confirmEmailTemplate({
                userName: data.userName,
                code: data.code,
                subject
            }),
            attachments: [
                {
                    filename: "logo.png",
                    path: logoPath,
                    cid: "app-logo",
                },
            ],
        })
    } catch (error) {
        console.log(error)
    }
})