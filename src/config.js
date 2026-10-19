import { config } from 'dotenv';
import { resolve } from 'node:path';

export const NODE_ENV = process.env.NODE_ENV ?? 'development'
config({
  path: resolve(`.env.${NODE_ENV}`)
});

// Port
export const PORT = parseInt(process.env.PORT ?? "9000")

//  DB URL
export const DB_URI = process.env.DB_URI

// Hash
export const SALT = parseInt(process.env.SALT ?? "12")

// Encode & Decode
export const IV_LENGTH = parseInt(process.env.IV_LENGTH ?? "16")
export const ENCRYPTION_SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY

// Access_Token Signature
export const ACCESS_USER_TOKEN_SIGNATURE = process.env.ACCESS_USER_TOKEN_SIGNATURE
export const ACCESS_ADMIN_TOKEN_SIGNATURE = process.env.ACCESS_ADMIN_TOKEN_SIGNATURE

// Access_Token Expires
export const ACCESS_EXPIRES_IN = parseInt(process.env.ACCESS_EXPIRES_IN ?? "1800")

// Refresh_Token Signature
export const REFRESH_USER_TOKEN_SIGNATURE = process.env.REFRESH_USER_TOKEN_SIGNATURE
export const REFRESH_ADMIN_TOKEN_SIGNATURE = process.env.REFRESH_ADMIN_TOKEN_SIGNATURE

// Refresh_Token Expires
export const REFRESH_EXPIRES_IN = parseInt(process.env.REFRESH_EXPIRES_IN ?? "31536000")


// WEB_CLIENT_IDS For Google
export const WEB_CLIENT_IDS = process.env.WEB_CLIENT_IDS.split(",")

// GitHub OAuth
export const GITHUB_CLIENT_IDS = process.env.GITHUB_CLIENT_IDS;
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
export const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;
