import crypto from "node:crypto";

export interface TelegramAuthData {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
  [key: string]: string | undefined;
}

const BOT_TOKEN = process.env.TG_BOT_TOKEN!;

export function verifyTelegramAuth(data: TelegramAuthData): boolean {
  const { hash, auth_date, ...rest } = data;
  const checkString = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("\n");
  const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();
  const hmac = crypto.createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");
  const ttlOk = Date.now() / 1000 - Number(auth_date) < 120;
  return hmac === hash && ttlOk;
}
