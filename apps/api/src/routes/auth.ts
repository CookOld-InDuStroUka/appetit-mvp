import express, { Request, Response } from "express";
import crypto from "node:crypto";
import { prisma } from "../prisma";
import { signJwt } from "../jwt";

const router = express.Router();
const BOT_TOKEN = process.env.TG_BOT_TOKEN!;
const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_DOMAIN = new URL(process.env.PUBLIC_ORIGIN!).hostname;

function checkTelegramAuth(data: Record<string, string>): boolean {
  const { hash, auth_date } = data;
  const checkString = Object.keys(data)
    .filter((k) => k !== "hash")
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join("\n");
  const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();
  const hmac = crypto.createHmac("sha256", secretKey).update(checkString).digest("hex");
  const ttlOk = (Date.now() / 1000 - Number(auth_date)) < 120;
  return hmac === hash && ttlOk;
}

router.post("/auth/telegram", async (req: Request, res: Response) => {
  const data = req.body as Record<string, string>;
  if (!checkTelegramAuth(data)) return res.status(401).json({ ok: false });

  const telegramId = String(data.id);
  const name =
    [data.first_name, data.last_name].filter(Boolean).join(" ") ||
    data.username ||
    "User";

  const user = await prisma.user.upsert({
    where: { telegramId } as any,
    create: { telegramId, name } as any,
    update: { name },
    select: { id: true, name: true, telegramId: true, phone: true } as any,
  });

  const token = signJwt({ uid: user.id }, JWT_SECRET, { expiresIn: "30d" });

  res.cookie("appetit_jwt", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    domain: COOKIE_DOMAIN,
    maxAge: 30 * 24 * 3600 * 1000,
  });

  return res.json({ ok: true, user });
});

export default router;
