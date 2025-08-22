import 'dotenv/config';
import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient, OrderStatus, OrderType } from "@prisma/client";
import { z } from "zod";

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

const BASE = "/api/v1";

// simple auth via SMS codes
const AuthRequestSchema = z.object({ phone: z.string().min(5) });
const AuthVerifySchema = z.object({ phone: z.string().min(5), code: z.string().min(4).max(6) });

app.post(`${BASE}/auth/request-code`, async (req: Request, res: Response) => {
  const parsed = AuthRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.authCode.upsert({
    where: { phone: parsed.data.phone },
    update: { code, expiresAt, createdAt: new Date() },
    create: { phone: parsed.data.phone, code, expiresAt }
  });

  console.log(`Auth code for ${parsed.data.phone}: ${code}`);
  res.json({ ok: true });
});

app.post(`${BASE}/auth/verify-code`, async (req: Request, res: Response) => {
  const parsed = AuthVerifySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const record = await prisma.authCode.findUnique({ where: { phone: parsed.data.phone } });
  if (!record || record.code !== parsed.data.code || record.expiresAt < new Date()) {
    return res.status(400).json({ error: "Invalid code" });
  }

  let user = await prisma.user.upsert({
    where: { phone: parsed.data.phone },
    update: {},
    create: { phone: parsed.data.phone }
  });

  await prisma.authCode.delete({ where: { phone: parsed.data.phone } });

  res.json({ user: { id: user.id, phone: user.phone, bonus: user.bonus } });
});

app.get(BASE, (_: Request, res: Response) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.get(`${BASE}/health`, (_: Request, res: Response) => res.json({ ok: true, ts: new Date().toISOString() }));

app.get(`${BASE}/cms/:slug`, async (req: Request, res: Response) => {
  const page = await prisma.cmsPage.findUnique({ where: { slug: req.params.slug } });
  if (!page || !page.isActive) return res.status(404).json({ error: "Not found" });
  res.json(page);
});

app.get(`${BASE}/branches`, async (_req: Request, res: Response) => {
  const branches = await prisma.branch.findMany({ include: { zones: true } });
  res.json(branches);
});

app.get(`${BASE}/zones`, async (_req: Request, res: Response) => {
  const zones = await prisma.zone.findMany({ orderBy: { name: "asc" } });
  res.json(zones);
});

app.get(`${BASE}/menu`, async (req: Request, res: Response) => {
  const q = (req.query.q as string)?.trim() || "";
  const categorySlug = (req.query.categorySlug as string) || undefined;
  let categoryId: string | undefined = undefined;
  if (categorySlug) {
    const cat = await prisma.category.findFirst({ where: { slug: categorySlug, isActive: true } });
    categoryId = cat?.id;
    if (!categoryId) return res.json({ categories: [], dishes: [] });
  }

  const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });

  const dishesRaw = await prisma.dish.findMany({
    where: {
      isActive: true,
      ...(categoryId ? { categoryId } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {})
    },
    include: { variants: true },
    orderBy: { name: "asc" }
  });

  const dishes = dishesRaw.map((d: any) => {
    const base = Number(d.basePrice);
    const min = d.variants.length ? base + Math.min(...d.variants.map((v: any) => Number(v.priceDelta))) : base;
    return {
      id: d.id,
      categoryId: d.categoryId,
      name: d.name,
      description: d.description ?? undefined,
      imageUrl: d.imageUrl ?? undefined,
      basePrice: base,
      minPrice: min
    };
  });

  res.json({ categories, dishes });
});

app.get(`${BASE}/dishes/search`, async (req: Request, res: Response) => {
  const raw = (req.query.q ?? req.query.query ?? req.query.term) as string | undefined;
  const q = raw?.trim() ?? "";
  if (!q) return res.json([]);

  const dishes = await prisma.dish.findMany({
    where: {
      isActive: true,
      name: { contains: q, mode: "insensitive" }
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
    take: 10
  });

  res.json(dishes);
});

app.get(`${BASE}/dishes/:id`, async (req: Request, res: Response) => {
  const d = await prisma.dish.findUnique({
    where: { id: req.params.id },
    include: { variants: true },
  });
  if (!d || !d.isActive) return res.status(404).json({ error: "Not found" });

  const base = Number(d.basePrice);
  const variants = d.variants
    .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
    .map((v: any) => ({
      id: v.id,
      name: v.name,
      price: base + Number(v.priceDelta),
    }));

  res.json({
    id: d.id,
    categoryId: d.categoryId,
    name: d.name,
    description: d.description ?? undefined,
    imageUrl: d.imageUrl ?? undefined,
    basePrice: base,
    variants,
  });
});

const OrderSchema = z.object({
  customer: z.object({
    phone: z.string().min(5),
    name: z.string().optional().nullable()
  }),
  type: z.enum(["delivery", "pickup"]),
  zoneId: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  branchId: z.string().optional().nullable(),
  items: z.array(z.object({
    dishId: z.string(),
    variantId: z.string().optional().nullable(),
    qty: z.number().int().positive()
  })).min(1),
  paymentMethod: z.enum(["cash", "card"])
});

app.post(`${BASE}/orders`, async (req: Request, res: Response) => {
  const parsed = OrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  const data = parsed.data;

  // fetch all dishes/variants referenced
  const dishes = await prisma.dish.findMany({
    where: { id: { in: data.items.map(i => i.dishId) } },
    include: { variants: true }
  });

  let subtotal = 0;
  for (const item of data.items) {
    const d = dishes.find((x: any) => x.id === item.dishId);
    if (!d) return res.status(400).json({ error: `dish not found: ${item.dishId}` });
    const base = Number(d.basePrice);
    const variantDelta = item.variantId ? Number(d.variants.find((v: any) => v.id === item.variantId)?.priceDelta ?? 0) : 0;
    const unit = base + variantDelta;
    subtotal += unit * item.qty;
  }

  let deliveryFee = 0;
  let zoneId: string | undefined;
  let branchId: string | undefined;

  if (data.type === "delivery") {
    if (!data.zoneId || !data.address) return res.status(400).json({ error: "zoneId and address required for delivery" });
    const zone = await prisma.zone.findUnique({ where: { id: data.zoneId } });
    if (!zone) return res.status(400).json({ error: "zone not found" });
    deliveryFee = Number(zone.deliveryFee);
    zoneId = zone.id;
  } else {
    if (!data.branchId) return res.status(400).json({ error: "branchId required for pickup" });
    const branch = await prisma.branch.findUnique({ where: { id: data.branchId } });
    if (!branch) return res.status(400).json({ error: "branch not found" });
    branchId = branch.id;
  }

  const total = subtotal + deliveryFee;

  const bonusEarned = Math.floor(subtotal * 0.1);

  const user = await prisma.user.upsert({
    where: { phone: data.customer.phone },
    create: { phone: data.customer.phone, bonus: bonusEarned },
    update: { bonus: { increment: bonusEarned } }
  });

  const order = await prisma.order.create({
    data: {
      type: data.type === "delivery" ? OrderType.delivery : OrderType.pickup,
      status: OrderStatus.created,
      customerName: data.customer.name ?? null,
      customerPhone: data.customer.phone,
      address: data.address ?? null,
      zoneId: zoneId ?? null,
      branchId: branchId ?? null,
      subtotal,
      deliveryFee,
      total,
      bonusEarned,
      userId: user.id,
      items: {
        create: data.items.map(item => {
          const d = dishes.find((x: any) => x.id === item.dishId)!;
          const base = Number(d.basePrice);
          const variantDelta = item.variantId ? Number(d.variants.find((v: any) => v.id === item.variantId)?.priceDelta ?? 0) : 0;
          const unit = base + variantDelta;
          return {
            dishId: item.dishId,
            variantId: item.variantId ?? null,
            qty: item.qty,
            unitPrice: unit,
            total: unit * item.qty
          };
        })
      }
    }
  });

  res.status(201).json({ id: order.id, status: order.status, subtotal, deliveryFee, total, bonusEarned, createdAt: order.createdAt });
});

app.get(`${BASE}/orders/:id`, async (req: Request, res: Response) => {
  const o = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } });
  if (!o) return res.status(404).json({ error: "Not found" });
  res.json(o);
});

const port = Number(process.env.API_PORT || 3001);
app.listen(port, () => console.log(`API on http://localhost:${port}${BASE}`));
