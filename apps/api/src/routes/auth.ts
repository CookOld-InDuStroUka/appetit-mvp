import express, { Request, Response } from "express";
import { prisma } from "../prisma";
import crypto from "crypto";
import { TelegramAuthData, verifyTelegramAuth } from "../telegram";
import bcrypt from "bcryptjs";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET!;

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? "+" + digits : "";
}

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

  const token = signJwt({ uid: user.id });

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

router.post("/auth/phone", async (req: Request, res: Response) => {
  const { phone, name, password } = req.body as {
    phone?: string;
    name?: string;
    password?: string;
  };
  if (!phone || !password)
    return res.status(400).json({ ok: false, error: "phone and password required" });

  const normalized = normalizePhone(phone);
  let user = await prisma.user.findUnique({ where: { phone: normalized } });

  if (!user) {
    const hashed = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: { phone: normalized, name, password: hashed } as any,
    });
  } else {
    if (!user.password) {
      const hashed = await bcrypt.hash(password, 10);
      user = await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed, name: name || user.name },
      });
    } else if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ ok: false, error: "wrong password" });
    } else if (name && !user.name) {
      user = await prisma.user.update({ where: { id: user.id }, data: { name } });
    }
  }

  const token = signJwt({ uid: user.id });

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

  const { id, name: userName, telegramId, phone: userPhone } = user;
  return res.json({ ok: true, user: { id, name: userName, telegramId, phone: userPhone } });
});

function signJwt(payload: object, days = 30) {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + days * 24 * 60 * 60;
  const body = { ...payload, exp };
  const base64 = (obj: any) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const unsigned = `${base64(header)}.${base64(body)}`;
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(unsigned)
    .digest("base64url");
  return `${unsigned}.${signature}`;
}

export default router;
