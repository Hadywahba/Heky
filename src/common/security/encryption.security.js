import crypto from 'crypto';
import { ENCRYPTION_SECRET_KEY, IV_LENGTH } from '../../config.js';


export const encrypt = async (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY, iv);

  let encryptedData = cipher.update(text, 'utf-8', 'hex');
  encryptedData += cipher.final('hex');

  return `${iv.toString('hex')}:${encryptedData}`;
}



export const decrypt = async (encryptedData) => {
  const [iv, encryptedText] = encryptedData.split(":"); // []

  const binaryLikeIv = Buffer.from(iv, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY, binaryLikeIv);

  let decryptedData = decipher.update(encryptedText, 'hex', 'utf8');
  decryptedData += decipher.final('utf-8');

  return decryptedData;
}