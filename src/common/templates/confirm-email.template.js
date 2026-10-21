
import {
    APP_NAME,
    FACEBOOK_URL,
    INSTAGRAM_URL,
    LINKEDIN_URL,
    X_URL,
} from "../../config.js";
import { EmailSubjectEnum } from "../enum/index.js";
const socialLinks = [
    {
        name: "Facebook",
        url: FACEBOOK_URL,
        icon: "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6/svgs/brands/facebook.svg",
    },
    {
        name: "Instagram",
        url: INSTAGRAM_URL,
        icon: "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6/svgs/brands/instagram.svg",
    },
    {
        name: "LinkedIn",
        url: LINKEDIN_URL,
        icon: "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6/svgs/brands/linkedin.svg",
    },
    {
        name: "X",
        url: X_URL,
        icon: "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6/svgs/brands/x-twitter.svg",
    },
].filter(({ url }) => url);


export const templates = {
    [EmailSubjectEnum.CONFIRM_EMAIL]: (data) => {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your email</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
    style="background-color:#f4f7fb;padding:32px 12px;">
    <tr>
        <td align="center">

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;">

                <!-- Header -->
                <tr>
                    <td align="center" style="background-color:#0759e6;padding:28px 20px;">
                        <img
                            src="cid:app-logo"
                            alt="${APP_NAME} Logo"
                            width="150"
                            style="display:block;width:150px;max-width:100%;height:auto;border:0;"
                        />
                    </td>
                </tr>

                <!-- Email Content -->
                <tr>
                    <td style="padding:36px 28px;">

                        <h2 style="margin:0 0 20px;font-size:23px;color:#111827;">
                            Verify your email address
                        </h2>

                        <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#374151;">
                            Hi ${data.userName || "there"},
                        </p>

                        <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#4b5563;">
                            Thank you for creating an account with ${APP_NAME}.
                            Use the verification code below to confirm your email address.
                        </p>

                        <!-- Verification Code -->
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                            style="margin:0 0 24px;">
                            <tr>
                                <td align="center"
                                    style="padding:24px;background-color:#f4f7fb;border:1px solid #e5e7eb;border-radius:8px;">

                                    <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">
                                        Your verification code
                                    </p>

                                    <p style="margin:0;font-size:34px;line-height:1.4;font-weight:bold;letter-spacing:8px;color:#0759e6;">
                                        ${data.code}
                                    </p>

                                </td>
                            </tr>
                        </table>

                        <p style="margin:0 0 12px;font-size:13px;line-height:1.8;color:#6b7280;">
                            Enter this code on the verification page to activate your account.
                        </p>

                        <p style="margin:0;font-size:13px;line-height:1.8;color:#6b7280;">
                            This code expires after a limited time. Never share it with anyone.
                            If you didn't create an account, you can safely ignore this email.
                        </p>

                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td align="center"
                        style="padding:24px 20px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">

                        ${socialLinks.length
                ? `
                                    <p style="margin:0 0 16px;font-size:14px;font-weight:bold;color:#374151;">
                                        Follow us
                                    </p>

                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center"
                                        style="margin:0 auto 18px;">
                                        <tr>
                                            ${socialLinks
                    .map(
                        ({ name, url, icon }) => `
                                                        <td align="center" style="padding:0 8px;">
                                                            <a
                                                                href="${url}"
                                                                target="_blank"
                                                                style="display:inline-block;padding:10px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:50%;text-decoration:none;"
                                                            >
                                                                <img
                                                                    src="${icon}"
                                                                    alt="${name}"
                                                                    width="20"
                                                                    height="20"
                                                                    style="display:block;width:20px;height:20px;border:0;"
                                                                />
                                                            </a>
                                                        </td>
                                                    `,
                    )
                    .join("")}
                                        </tr>
                                    </table>
                                `
                : ""
            }

                        <p style="margin:0 0 8px;font-size:12px;line-height:1.8;color:#9ca3af;">
                            This is an automated email. Please do not reply.
                        </p>

                        <p style="margin:0;font-size:12px;line-height:1.8;color:#9ca3af;">
                            &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                        </p>

                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>
`;
    },
    [EmailSubjectEnum.FORGOT_PASSWORD]: (data) => {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your password</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
    style="background-color:#f4f7fb;padding:32px 12px;">
    <tr>
        <td align="center">

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;">

                <!-- Header -->
                <tr>
                    <td align="center" style="background-color:#0759e6;padding:28px 20px;">
                        <img
                            src="cid:app-logo"
                            alt="${APP_NAME} Logo"
                            width="150"
                            style="display:block;width:150px;max-width:100%;height:auto;border:0;"
                        />
                    </td>
                </tr>

                <!-- Email Content -->
                <tr>
                    <td style="padding:36px 28px;">

                        <h2 style="margin:0 0 20px;font-size:23px;color:#111827;">
                            Reset your password
                        </h2>

                        <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#374151;">
                            Hi ${data.userName || "there"},
                        </p>

                        <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#4b5563;">
                            We received a request to reset the password for your ${APP_NAME} account.
                            Use the code below to choose a new password.
                        </p>

                        <!-- Reset Code -->
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                            style="margin:0 0 24px;">
                            <tr>
                                <td align="center"
                                    style="padding:24px;background-color:#f4f7fb;border:1px solid #e5e7eb;border-radius:8px;">

                                    <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">
                                        Your password reset code
                                    </p>

                                    <p style="margin:0;font-size:34px;line-height:1.4;font-weight:bold;letter-spacing:8px;color:#0759e6;">
                                        ${data.code}
                                    </p>

                                </td>
                            </tr>
                        </table>

                        <p style="margin:0 0 12px;font-size:13px;line-height:1.8;color:#6b7280;">
                            Enter this code on the reset page, then set your new password.
                        </p>

                        <!-- Security Notice -->
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                            style="margin:0 0 16px;">
                            <tr>
                                <td style="padding:14px 16px;background-color:#fff7ed;border-left:4px solid #f59e0b;border-radius:6px;">
                                    <p style="margin:0;font-size:13px;line-height:1.7;color:#92400e;">
                                        Didn't ask to reset your password? Ignore this email and your password will stay the same.
                                    </p>
                                </td>
                            </tr>
                        </table>

                        <p style="margin:0;font-size:13px;line-height:1.8;color:#6b7280;">
                            This code expires after a limited time. Never share it with anyone.
                        </p>

                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td align="center"
                        style="padding:24px 20px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">

                        ${socialLinks.length
                ? `
                                    <p style="margin:0 0 16px;font-size:14px;font-weight:bold;color:#374151;">
                                        Follow us
                                    </p>

                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center"
                                        style="margin:0 auto 18px;">
                                        <tr>
                                            ${socialLinks
                    .map(
                        ({ name, url, icon }) => `
                                                        <td align="center" style="padding:0 8px;">
                                                            <a
                                                                href="${url}"
                                                                target="_blank"
                                                                style="display:inline-block;padding:10px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:50%;text-decoration:none;"
                                                            >
                                                                <img
                                                                    src="${icon}"
                                                                    alt="${name}"
                                                                    width="20"
                                                                    height="20"
                                                                    style="display:block;width:20px;height:20px;border:0;"
                                                                />
                                                            </a>
                                                        </td>
                                                    `,
                    )
                    .join("")}
                                        </tr>
                                    </table>
                                `
                : ""
            }

                        <p style="margin:0 0 8px;font-size:12px;line-height:1.8;color:#9ca3af;">
                            This is an automated email. Please do not reply.
                        </p>

                        <p style="margin:0;font-size:12px;line-height:1.8;color:#9ca3af;">
                            &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                        </p>

                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>
`;
    },
}

export const confirmEmailTemplate = (data) => {

    return templates[data.subject](data)
};
