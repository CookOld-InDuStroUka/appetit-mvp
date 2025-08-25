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
const AuthEmailSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const AdminAuthSchema = AuthEmailSchema;

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

app.post(`${BASE}/auth/register-email`, async (req: Request, res: Response) => {
  const parsed = AuthEmailSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const user = await prisma.user.upsert({
    where: { email: parsed.data.email },
    update: { password: parsed.data.password },
    create: { email: parsed.data.email, password: parsed.data.password }
  });

  res.json({ user: { id: user.id, email: user.email, bonus: user.bonus } });
});

app.post(`${BASE}/admin/register`, async (req: Request, res: Response) => {
  const parsed = AdminAuthSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const admin = await prisma.admin.upsert({
    where: { email: parsed.data.email },
    update: { password: parsed.data.password },
    create: { email: parsed.data.email, password: parsed.data.password }
  });

  res.json({ ok: true, id: admin.id });
});

app.post(`${BASE}/admin/login`, async (req: Request, res: Response) => {
  const parsed = AdminAuthSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const admin = await prisma.admin.findUnique({ where: { email: parsed.data.email } });
  if (!admin || admin.password !== parsed.data.password) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  res.json({ ok: true, id: admin.id });
});

app.get(BASE, (_: Request, res: Response) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.get(`${BASE}/health`, (_: Request, res: Response) => res.json({ ok: true, ts: new Date().toISOString() }));

app.post(`${BASE}/promo-codes/check`, async (req: Request, res: Response) => {
  const parsed = PromoCodeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  const promo = await prisma.promoCode.findUnique({ where: { code: parsed.data.code } });
  if (!promo || promo.expiresAt < new Date()) return res.status(404).json({ error: "Invalid code" });
  res.json({ code: promo.code, discount: promo.discount, expiresAt: promo.expiresAt, conditions: promo.conditions });
});

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

app.get(`${BASE}/admin/branches/:branchId/dishes`, async (req: Request, res: Response) => {
  const branch = await prisma.branch.findUnique({ where: { id: req.params.branchId }, include: { zones: true } });
  if (!branch) return res.status(404).json({ error: "Branch not found" });

  const zoneIds = branch.zones.map((z: any) => z.id);
  const dishes = await prisma.dish.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
  });
  const availability = await prisma.dishAvailability.findMany({ where: { zoneId: { in: zoneIds } } });
  const availSet = new Set(availability.map((a: any) => a.dishId));

  const result = dishes.map((d: any) => ({
    id: d.id,
    name: d.name,
    categoryId: d.categoryId,
    categoryName: d.category?.name ?? "",
    available: availSet.has(d.id),
  }));
  res.json(result);
});

app.post(`${BASE}/admin/branches/:branchId/dishes/:dishId`, async (req: Request, res: Response) => {
  const branch = await prisma.branch.findUnique({ where: { id: req.params.branchId }, include: { zones: true } });
  if (!branch) return res.status(404).json({ error: "Branch not found" });

  const available = Boolean(req.body.available);
  const zoneIds = branch.zones.map((z: any) => z.id);

  if (available) {
    await prisma.dishAvailability.createMany({
      data: zoneIds.map((zoneId: string) => ({ dishId: req.params.dishId, zoneId })),
      skipDuplicates: true,
    });
  } else {
    await prisma.dishAvailability.deleteMany({ where: { dishId: req.params.dishId, zoneId: { in: zoneIds } } });
  }

  res.json({ ok: true });
});

app.get(`${BASE}/categories`, async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" }
  });
  res.json(categories);
});

app.get(`${BASE}/dishes`, async (req: Request, res: Response) => {
  const rawQ = (req.query.q ?? req.query.query ?? req.query.search) as string | undefined;
  const q = rawQ?.trim() ?? "";
  const categorySlug = (req.query.categorySlug ?? req.query.category ?? req.query.cat) as string | undefined;
  const categoryId = req.query.categoryId as string | undefined;
  const branchId = req.query.branchId as string | undefined;

  try {
    let catId: string | undefined = categoryId;
    if (!catId && categorySlug) {
      const cat = await prisma.category.findFirst({
        where: { slug: categorySlug, isActive: true }
      });
      catId = cat?.id;
      if (!catId) return res.json([]);
    }

    let zoneIds: string[] = [];
    if (branchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: branchId },
        include: { zones: true }
      });
      zoneIds = branch?.zones.map((z: any) => z.id) || [];
    }

    const dishesRaw = await prisma.dish.findMany({
      where: {
        isActive: true,
        ...(catId ? { categoryId: catId } : {}),
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
        ...(zoneIds.length
          ? { availability: { some: { zoneId: { in: zoneIds } } } }
          : {}),
      },
      include: { variants: true },
      orderBy: { name: "asc" }
    });

    const dishes = dishesRaw.map((d: any) => {
      const base = Number(d.basePrice);
      const min = d.variants.length
        ? base + Math.min(...d.variants.map((v: any) => Number(v.priceDelta)))
        : base;
      return {
        id: d.id,
        categoryId: d.categoryId,
        name: d.name,
        description: d.description ?? undefined,
        imageUrl: d.imageUrl ?? undefined,
        basePrice: base,
        minPrice: min,
      };
    });

    res.json(dishes);
  } catch (err) {
    console.error("[dishes] error", err);
    res.status(500).json({ error: "Internal server error" });
  }
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
    include: { variants: true, modifiers: true },
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

  const addons = d.modifiers
    .filter((m: any) => m.type === "addon")
    .map((m: any) => ({ id: m.id, name: m.name, price: Number(m.price) }));
  const exclusions = d.modifiers
    .filter((m: any) => m.type === "exclusion")
    .map((m: any) => ({ id: m.id, name: m.name }));

  res.json({
    id: d.id,
    categoryId: d.categoryId,
    name: d.name,
    description: d.description ?? undefined,
    imageUrl: d.imageUrl ?? undefined,
    basePrice: base,
    variants,
    addons,
    exclusions,
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
  paymentMethod: z.enum(["cash", "card"]),
  promoCode: z.string().optional().nullable()
});

const PromoCodeSchema = z.object({ code: z.string() });

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
  let discount = 0;
  let promoCodeId: string | undefined;

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

  if (data.promoCode) {
    const promo = await prisma.promoCode.findUnique({ where: { code: data.promoCode } });
    if (promo && promo.expiresAt >= new Date()) {
      discount = Math.round(subtotal * promo.discount / 100);
      promoCodeId = promo.id;
    }
  }

  const total = subtotal + deliveryFee - discount;

  const bonusEarned = Math.floor((subtotal - discount) * 0.1);

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
      discount,
      total,
      bonusEarned,
      promoCodeId: promoCodeId ?? null,
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

  res.status(201).json({ id: order.id, status: order.status, subtotal, deliveryFee, discount, total, bonusEarned, createdAt: order.createdAt });
});

app.get(`${BASE}/orders/:id`, async (req: Request, res: Response) => {
  const o = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } });
  if (!o) return res.status(404).json({ error: "Not found" });
  res.json(o);
});

const port = Number(process.env.API_PORT || 3001);
app.listen(port, () => console.log(`API on http://localhost:${port}${BASE}`));
