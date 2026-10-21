
import { randomInt } from "node:crypto";


// Create Basic OTP
export const cteateOTP = () => {
    return Math.floor(Math.random() * 9000 + 1000)
}


// Create Basic OTP From CRYPTO
export const createOTPCrypto = () => {
    return randomInt(1000, 10000);
};


// Create OTP NUMBERS & TEXT
export const createOTPNUMTEX = (length = 4) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let OTP = "";

    for (let i = 0; i < length; i++) {
        OTP += chars[randomInt(0, chars.length)];
    }

    return OTP;
};


