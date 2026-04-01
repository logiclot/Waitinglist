import CryptoJS from "crypto-js";

const getSecretKey = (): string => {
  const key = process.env.ENCRYPTION_SECRET;
  if (!key) {
    throw new Error("ENCRYPTION_SECRET environment variable is not set");
  }
  return key;
};

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, getSecretKey()).toString();
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, getSecretKey());
  return bytes.toString(CryptoJS.enc.Utf8);
}
