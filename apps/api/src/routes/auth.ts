import express, { Request, Response } from "express";
import { prisma } from "../prisma";
import { signJwt } from "../jwt";
import { TelegramAuthData, verifyTelegramAuth } from "../telegram";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_DOMAIN = new URL(process.env.PUBLIC_ORIGIN!).hostname;

router.post("/auth/telegram", async (req: Request, res: Response) => {
  const data = req.body as TelegramAuthData;
  if (!verifyTelegramAuth(data)) return res.status(401).json({ ok: false });

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
