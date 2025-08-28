import express, { Request, Response } from "express";
import { prisma } from "../prisma";
import { signJwt } from "../jwt";
import { TelegramAuthData, verifyTelegramAuth } from "../telegram";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET!;

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

  const origin = req.headers.origin || process.env.PUBLIC_ORIGIN!;
  const host = new URL(origin).hostname;
  const cookieOptions: express.CookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: origin.startsWith("https://"),
    path: "/",
    maxAge: 30 * 24 * 3600 * 1000,
  };
  if (host !== "localhost") cookieOptions.domain = host;

  res.cookie("appetit_jwt", token, cookieOptions);

  return res.json({ ok: true, user });
});

export default router;
