import crypto from "crypto";

const ALGORITHM = "aes-256-ctr";
const SECRET_KEY = crypto.createHash("sha256").update("sua-chave-secreta").digest();
const IV_LENGTH = 16;

function getDeterministicIV(text: string): Buffer {
  return crypto.createHash("md5").update(text).digest().subarray(0, IV_LENGTH);
}

export function encryptDeterministic(text: string): string {
  const iv = getDeterministicIV(text);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return encrypted.toString("hex");
}

export function decryptDeterministic(encryptedHex: string, originalText: string): string {
  const iv = getDeterministicIV(originalText);
  const content = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  const decrypted = Buffer.concat([decipher.update(content), decipher.final()]);
  return decrypted.toString("utf8");
}
