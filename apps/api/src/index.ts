import 'dotenv/config';
import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient, OrderStatus, OrderType } from "@prisma/client";
import { z } from "zod";
import fs from "fs";
import path from "path";

const app = express();
const prisma = new PrismaClient();

// log errors to file under project root /logs
const logDir = path.join(__dirname, "../../logs");
fs.mkdirSync(logDir, { recursive: true });
const logFile = path.join(logDir, "api.log");
const ordersLogFile = path.join(logDir, "orders.jsonl");

function logOrder(order: unknown) {
  fs.promises
    .appendFile(ordersLogFile, JSON.stringify(order) + "\n")
    .catch((err) => console.error("Failed to write order log", err));
}

function logToFile(message: string, err: unknown) {
  const payload =
    err instanceof Error ? err.stack || err.message : JSON.stringify(err);
  const line = `[${new Date().toISOString()}] ${message} ${payload}\n`;
  fs.appendFileSync(logFile, line);
  console.error(message, err);
}

process.on("unhandledRejection", (reason: unknown) => {
  logToFile("Unhandled rejection", reason);
});

process.on("uncaughtException", (err: unknown) => {
  logToFile("Uncaught exception", err);
});

const DEFAULT_EXCLUSIONS = [
  "Без кетчупа",
  "Без фри",
  "Без мяса",
  "Без лука",
  "Без майонеза",
  "Без помидор",
];

const DEFAULT_ADDONS = [
  { name: "соус Горчичный во внутрь", price: 240 },
  { name: "соус Барбекю во внутрь", price: 240 },
  { name: "соус Сырный во внутрь", price: 240 },
  { name: "перчики острые во внутрь", price: 240 },
  { name: "соус Томатный во внутрь", price: 240 },
  { name: "соус Острый во внутрь", price: 240 },
  { name: "соус Чесночный во внутрь", price: 240 },
];

async function ensureDefaultCategories() {
  const count = await prisma.category.count();
  if (count === 0) {
    const names = ["Шаурма", "Блюда", "Напитки", "Соусы"];
    await prisma.$transaction(
      names.map((name, idx) =>
        prisma.category.create({ data: { name, sortOrder: idx } })
      )
    );
  }
}
ensureDefaultCategories().catch((e) =>
  console.error("Failed to ensure default categories", e)
);

async function ensureDefaultModifiers() {
  const dishes = await prisma.dish.findMany({ include: { modifiers: true } });
  for (const dish of dishes) {
    if (dish.modifiers.length === 0) {
      await prisma.dishModifier.createMany({
        data: [
          ...DEFAULT_EXCLUSIONS.map((name) => ({
            dishId: dish.id,
            name,
            type: "exclusion" as const,
            price: 0,
          })),
          ...DEFAULT_ADDONS.map((a) => ({
            dishId: dish.id,
            name: a.name,
            type: "addon" as const,
            price: a.price,
          })),
        ],
      });
    }
  }
}
ensureDefaultModifiers().catch((e) =>
  console.error("Failed to ensure default modifiers", e)
);
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const uploadDir = path.join(__dirname, "../uploads");
fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

const BASE = "/api/v1";

app.post(`${BASE}/admin/upload`, (req: Request, res: Response) => {
  const image: string | undefined = (req.body as any)?.image;
  if (!image) return res.status(400).json({ error: "No image" });
  const buffer = Buffer.from(image, "base64");
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
  fs.writeFileSync(path.join(uploadDir, filename), buffer);
  const url = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
  res.json({ url });
});

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

  res.json({ user: { id: user.id, phone: user.phone, email: user.email, name: user.name, birthDate: user.birthDate, notificationsEnabled: user.notificationsEnabled, bonus: user.bonus } });
});

app.post(`${BASE}/auth/register-email`, async (req: Request, res: Response) => {
  const parsed = AuthEmailSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const user = await prisma.user.upsert({
    where: { email: parsed.data.email },
    update: { password: parsed.data.password },
    create: { email: parsed.data.email, password: parsed.data.password }
  });

  res.json({ user: { id: user.id, email: user.email, phone: user.phone, name: user.name, birthDate: user.birthDate, notificationsEnabled: user.notificationsEnabled, bonus: user.bonus } });
});

app.post(`${BASE}/auth/login-email`, async (req: Request, res: Response) => {
  const parsed = AuthEmailSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || user.password !== parsed.data.password) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  res.json({ user: { id: user.id, email: user.email, phone: user.phone, name: user.name, birthDate: user.birthDate, notificationsEnabled: user.notificationsEnabled, bonus: user.bonus } });
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
  const promo = await prisma.promoCode.findUnique({
    where: { code: parsed.data.code },
    include: { branches: true },
  });
  if (
    !promo ||
    promo.expiresAt < new Date() ||
    (promo.maxUses !== null && promo.usedCount >= (promo.maxUses ?? 0)) ||
    (promo.branches.length > 0 && (!parsed.data.branchId || !promo.branches.some((b: any) => b.id === parsed.data.branchId)))
  ) {
    return res.json({ error: "Invalid code" });
  }
  res.json({
    code: promo.code,
    discount: promo.discount,
    appliesToDelivery: promo.appliesToDelivery,
    expiresAt: promo.expiresAt,
    conditions: promo.conditions,
  });
});

// --- Admin promo codes CRUD ---
app.get(`${BASE}/admin/promo-codes`, async (_req: Request, res: Response) => {
  const codes = await prisma.promoCode.findMany({ include: { branches: true } });
  res.json(codes);
});

app.post(`${BASE}/admin/promo-codes`, async (req: Request, res: Response) => {
  const parsed = PromoCodeUpsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  const data = parsed.data;
  const promo = await prisma.promoCode.create({
    data: {
      code: data.code,
      discount: data.discount,
      appliesToDelivery: data.appliesToDelivery,
      expiresAt: data.expiresAt,
      conditions: data.conditions ?? null,
      maxUses: data.maxUses ?? null,
      ...(data.branchIds.length
        ? { branches: { connect: data.branchIds.map((id) => ({ id })) } }
        : {}),
    },
    include: { branches: true },
  });
  res.json(promo);
});

app.put(`${BASE}/admin/promo-codes/:id`, async (req: Request, res: Response) => {
  const parsed = PromoCodeUpsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  const data = parsed.data;
  const promo = await prisma.promoCode.update({
    where: { id: req.params.id },
    data: {
      code: data.code,
      discount: data.discount,
      appliesToDelivery: data.appliesToDelivery,
      expiresAt: data.expiresAt,
      conditions: data.conditions ?? null,
      maxUses: data.maxUses ?? null,
      branches: { set: data.branchIds.map((id) => ({ id })) },
    },
    include: { branches: true },
  });
  res.json(promo);
});

app.delete(`${BASE}/admin/promo-codes/:id`, async (req: Request, res: Response) => {
  await prisma.promoCode.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
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
    nameKz: d.nameKz,
    categoryId: d.categoryId,
    categoryName: d.category?.name ?? "",
    categoryNameKz: d.category?.nameKz ?? "",
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

const DishUpsertSchema = z.object({
  name: z.string().min(1),
  nameKz: z.string().optional().nullable(),
  categoryId: z.string(),
  basePrice: z.coerce.number().nonnegative(),
  description: z.string().optional().nullable(),
  descriptionKz: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

const CategoryUpsertSchema = z.object({
  name: z.string().min(1),
  nameKz: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

const ModifierUpsertSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["addon", "exclusion"]),
  price: z
    .preprocess(
      (v) => (v === undefined || v === null || v === "" ? 0 : v),
      z.coerce.number().nonnegative()
    )
    .optional(),
});

const StatusUpsertSchema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
});

const DishStatusSchema = z.object({
  statusId: z.string().optional().nullable(),
});

app.get(`${BASE}/admin/statuses`, async (_req: Request, res: Response) => {
  const statuses = await prisma.dishStatus.findMany({ orderBy: { name: "asc" } });
  res.json(statuses);
});

app.post(`${BASE}/admin/statuses`, async (req: Request, res: Response) => {
  const parsed = StatusUpsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  const st = await prisma.dishStatus.create({ data: parsed.data });
  res.json(st);
});

app.put(`${BASE}/admin/statuses/:id`, async (req: Request, res: Response) => {
  const parsed = StatusUpsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  const st = await prisma.dishStatus.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(st);
});

app.delete(`${BASE}/admin/statuses/:id`, async (req: Request, res: Response) => {
  await prisma.dishStatus.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

app.put(`${BASE}/admin/dishes/:id/status`, async (req: Request, res: Response) => {
  const parsed = DishStatusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  const dish = await prisma.dish.update({
    where: { id: req.params.id },
    data: { statusId: parsed.data.statusId ?? null },
  });
  res.json({ id: dish.id, statusId: dish.statusId });
});

app.get(`${BASE}/admin/dishes`, async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { dishes: { orderBy: { name: "asc" }, include: { status: true } } },
  });
  const result = categories.map((c: any) => ({
    id: c.id,
    name: c.name,
    nameKz: c.nameKz,
    dishes: c.dishes.map((d: any) => ({
      id: d.id,
      name: d.name,
      nameKz: d.nameKz,
      categoryId: d.categoryId,
      basePrice: Number(d.basePrice),
      description: d.description ?? null,
      descriptionKz: d.descriptionKz ?? null,
      imageUrl: d.imageUrl ?? null,
      statusId: d.statusId ?? null,
      status: d.status
        ? { id: d.status.id, name: d.status.name, color: d.status.color }
        : null,
    })),
  }));
  res.json(result);
});

app.post(`${BASE}/admin/dishes`, async (req: Request, res: Response) => {
  const parsed = DishUpsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  const data = parsed.data;
  try {
    const dish = await prisma.dish.create({
      data: {
        name: data.name,
        nameKz: data.nameKz ?? null,
        categoryId: data.categoryId,
        basePrice: data.basePrice,
        description: data.description ?? null,
        descriptionKz: data.descriptionKz ?? null,
        imageUrl: data.imageUrl ?? null,
      },
    });
    await prisma.dishModifier.createMany({
      data: [
        ...DEFAULT_EXCLUSIONS.map((name) => ({
          dishId: dish.id,
          name,
          type: "exclusion" as const,
          price: 0,
        })),
        ...DEFAULT_ADDONS.map((a) => ({
          dishId: dish.id,
          name: a.name,
          type: "addon" as const,
          price: a.price,
        })),
      ],
    });
    res.json(dish);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save dish" });
  }
});

app.put(`${BASE}/admin/dishes/:id`, async (req: Request, res: Response) => {
  const parsed = DishUpsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  const data = parsed.data;
  try {
    const dish = await prisma.dish.update({
      where: { id: req.params.id },
      data: {
        name: data.name,
        nameKz: data.nameKz ?? null,
        categoryId: data.categoryId,
        basePrice: data.basePrice,
        description: data.description ?? null,
        descriptionKz: data.descriptionKz ?? null,
        imageUrl: data.imageUrl ?? null,
      },
    });
    res.json(dish);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save dish" });
  }
});

app.delete(`${BASE}/admin/dishes/:id`, async (req: Request, res: Response) => {
  await prisma.dish.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

app.get(`${BASE}/admin/dishes/:id/modifiers`, async (req: Request, res: Response) => {
  const mods = await prisma.dishModifier.findMany({
    where: { dishId: req.params.id },
    orderBy: { name: "asc" },
  });
  res.json(mods.map((m: any) => ({
    id: m.id,
    name: m.name,
    type: m.type,
    price: Number(m.price),
  })));
});

app.post(`${BASE}/admin/dishes/:id/modifiers`, async (req: Request, res: Response) => {
  const parsed = ModifierUpsertSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload", details: parsed.error.flatten() });
  }
  const data = parsed.data;
  try {
    const mod = await prisma.dishModifier.create({
      data: {
        dishId: req.params.id,
        name: data.name,
        type: data.type,
        price: data.type === "addon" ? data.price ?? 0 : 0,
      },
    });
    res.json({ ...mod, price: Number(mod.price) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save modifier" });
  }
});

app.put(`${BASE}/admin/dishes/:dishId/modifiers/:modId`, async (req: Request, res: Response) => {
  const parsed = ModifierUpsertSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload", details: parsed.error.flatten() });
  }
  const data = parsed.data;
  try {
    const mod = await prisma.dishModifier.update({
      where: { id: req.params.modId },
      data: {
        name: data.name,
        type: data.type,
        price: data.type === "addon" ? data.price ?? 0 : 0,
      },
    });
    res.json({ ...mod, price: Number(mod.price) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save modifier" });
  }
});

app.delete(`${BASE}/admin/dishes/:dishId/modifiers/:modId`, async (req: Request, res: Response) => {
  await prisma.dishModifier.delete({ where: { id: req.params.modId } });
  res.json({ ok: true });
});

app.get(`${BASE}/admin/categories`, async (_req: Request, res: Response) => {
  const cats = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  res.json(cats);
});

app.post(`${BASE}/admin/categories`, async (req: Request, res: Response) => {
  const parsed = CategoryUpsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  const data = parsed.data;
  const count = await prisma.category.count();
  const cat = await prisma.category.create({
    data: { name: data.name, nameKz: data.nameKz ?? null, sortOrder: data.sortOrder ?? count },
  });
  res.json(cat);
});

app.put(`${BASE}/admin/categories/:id`, async (req: Request, res: Response) => {
  const parsed = CategoryUpsertSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  const cat = await prisma.category.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  res.json(cat);
});

app.delete(`${BASE}/admin/categories/:id`, async (req: Request, res: Response) => {
  await prisma.category.delete({ where: { id: req.params.id } });
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
      include: { variants: true, status: true },
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
        nameKz: d.nameKz ?? undefined,
        description: d.description ?? undefined,
        descriptionKz: d.descriptionKz ?? undefined,
        imageUrl: d.imageUrl ?? undefined,
        basePrice: base,
        minPrice: min,
        status: d.status
          ? { name: d.status.name, color: d.status.color }
          : undefined,
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
    select: { id: true, name: true, nameKz: true },
    orderBy: { name: "asc" },
    take: 10
  });

  res.json(dishes);
});

app.get(`${BASE}/dishes/:id`, async (req: Request, res: Response) => {
  const d = await prisma.dish.findUnique({
    where: { id: req.params.id },
    include: { variants: true, modifiers: true, status: true },
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
    status: d.status ? { name: d.status.name, color: d.status.color } : undefined,
  });
});

const OrderSchema = z.object({
  customer: z.object({
    phone: z.string().min(5).optional().nullable(),
    name: z.string().optional().nullable()
  }),
  type: z.enum(["delivery", "pickup"]),
  zoneId: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  branchId: z.string().optional().nullable(),
  pickupTime: z.string().optional().nullable(),
  items: z.array(z.object({
    dishId: z.string(),
    variantId: z.string().optional().nullable(),
    qty: z.number().int().positive(),
    addonIds: z.array(z.string()).optional(),
    exclusionIds: z.array(z.string()).optional(),
  })).min(1),
  paymentMethod: z.enum(["cash", "card"]),
  promoCode: z
    .string()
    .optional()
    .nullable()
    .transform((s) => (s ? s.toUpperCase() : s)),
  userId: z.string().optional(),
  bonusToUse: z.number().int().optional()
});

const PromoCodeSchema = z.object({
  code: z.string().transform((s) => s.toUpperCase()),
  branchId: z.string().optional().nullable(),
});

const PromoCodeUpsertSchema = z.object({
  code: z.string().transform((s) => s.toUpperCase()),
  discount: z.number().int(),
  appliesToDelivery: z.boolean().optional().default(false),
  expiresAt: z.coerce.date(),
  conditions: z.string().optional().nullable(),
  maxUses: z.number().int().optional().nullable(),
  branchIds: z.array(z.string()).optional().default([]),
});

app.post(`${BASE}/orders`, async (req: Request, res: Response) => {
  const parsed = OrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  const data = parsed.data;

  // fetch all dishes/variants referenced
  const dishes = await prisma.dish.findMany({
    where: { id: { in: data.items.map((i) => i.dishId) } },
    include: { variants: true },
  });

  const modifierIds = data.items.flatMap((i) => [
    ...(i.addonIds ?? []),
    ...(i.exclusionIds ?? []),
  ]);
  const modifiers: any[] = modifierIds.length
    ? await prisma.dishModifier.findMany({ where: { id: { in: modifierIds } } })
    : [];

  const prepared = [] as {
    item: typeof data.items[number];
    unit: number;
    addonNames: string[];
    exclusionNames: string[];
  }[];

  for (const item of data.items) {
    const d = dishes.find((x: any) => x.id === item.dishId);
    if (!d)
      return res
        .status(400)
        .json({ error: `dish not found: ${item.dishId}` });
    const base = Number(d.basePrice);
    const variantDelta = item.variantId
      ? Number(
          d.variants.find((v: any) => v.id === item.variantId)?.priceDelta ?? 0
        )
      : 0;
    const mods = [
      ...(item.addonIds ?? []),
      ...(item.exclusionIds ?? []),
    ].map((id) => modifiers.find((m) => m.id === id)).filter(Boolean) as any[];
    const addonNames = mods
      .filter((m) => m.type === "addon")
      .map((m) => m.name);
    const exclusionNames = mods
      .filter((m) => m.type === "exclusion")
      .map((m) => m.name);
    const addonTotal = mods
      .filter((m) => m.type === "addon")
      .reduce((sum, m) => sum + Number(m.price), 0);
    const unit = base + variantDelta + addonTotal;
    prepared.push({ item, unit, addonNames, exclusionNames });
  }

  const subtotal = prepared.reduce(
    (sum, p) => sum + p.unit * p.item.qty,
    0
  );

  let deliveryFee = 0;
  let zoneId: string | undefined;
  let branchId: string | undefined;
  let discount = 0;
  let promoCodeId: string | undefined;
  let pickupTime: Date | null = null;

  if (data.type === "delivery") {
    if (!data.address) return res.status(400).json({ error: "address required for delivery" });
    if (data.zoneId) {
      const zone = await prisma.zone.findUnique({ where: { id: data.zoneId } });
      if (!zone) return res.status(400).json({ error: "zone not found" });
      deliveryFee = Number(zone.deliveryFee);
      zoneId = zone.id;
      branchId = zone.branchId;
    } else if (data.branchId) {
      const branch = await prisma.branch.findUnique({ where: { id: data.branchId } });
      if (!branch) return res.status(400).json({ error: "branch not found" });
      branchId = branch.id;
    } else {
      return res.status(400).json({ error: "zoneId or branchId required for delivery" });
    }
  } else {
    if (!data.branchId) return res.status(400).json({ error: "branchId required for pickup" });
    const branch = await prisma.branch.findUnique({ where: { id: data.branchId } });
    if (!branch) return res.status(400).json({ error: "branch not found" });
    branchId = branch.id;
    if (data.pickupTime) {
      pickupTime = new Date(data.pickupTime);
    }
  }

  if (data.promoCode) {
    const promo = await prisma.promoCode.findUnique({
      where: { code: data.promoCode },
      include: { branches: true },
    });
    if (
      promo &&
      promo.expiresAt >= new Date() &&
      (promo.maxUses === null || promo.usedCount < (promo.maxUses ?? 0)) &&
      (promo.branches.length === 0 || promo.branches.some((b: any) => b.id === branchId))
    ) {
      const base = promo.appliesToDelivery ? subtotal + deliveryFee : subtotal;
      discount = Math.round((base * promo.discount) / 100);
      promoCodeId = promo.id;
    }
  }

  let user = null as any;
  if (data.userId) {
    user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) return res.status(400).json({ error: "user not found" });
    if (data.customer.phone && !user.phone) {
      user = await prisma.user.update({ where: { id: user.id }, data: { phone: data.customer.phone } });
    }
    if (data.customer.name && !user.name) {
      user = await prisma.user.update({ where: { id: user.id }, data: { name: data.customer.name } });
    }
  } else if (data.customer.phone) {
    user = await prisma.user.upsert({
      where: { phone: data.customer.phone },
      create: { phone: data.customer.phone, name: data.customer.name ?? null },
      update: { name: data.customer.name ?? undefined },
    });
  } else {
    return res.status(400).json({ error: "userId or customer.phone required" });
  }

  const availableBonus = user?.bonus ?? 0;
  const maxBonus = Math.max(subtotal + deliveryFee - discount - 10, 0);
  const bonusUsed = Math.min(data.bonusToUse ?? 0, availableBonus, maxBonus);
  const total = subtotal + deliveryFee - discount - bonusUsed;

  const bonusEarned = Math.floor((subtotal - discount - bonusUsed) * 0.1);
  const bonusDelta = bonusEarned - bonusUsed;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      bonus: { increment: bonusDelta },
      name: data.customer.name ?? undefined,
      phone: data.customer.phone ?? undefined,
    },
  });

  const customerPhone = data.customer.phone ?? user.phone;
  if (!customerPhone) return res.status(400).json({ error: "phone required" });

  const order = await prisma.order.create({
    data: {
      type: data.type === "delivery" ? OrderType.delivery : OrderType.pickup,
      status: OrderStatus.created,
      customerName: data.customer.name ?? user.name ?? null,
      customerPhone,
      address: data.address ?? null,
      zoneId: zoneId ?? null,
      branchId: branchId ?? null,
      subtotal,
      deliveryFee,
      discount,
      total,
      bonusEarned,
      bonusUsed,
      promoCodeId: promoCodeId ?? null,
      userId: user.id,
      pickupTime,
      items: {
        create: prepared.map((p) => ({
          dishId: p.item.dishId,
          variantId: p.item.variantId ?? null,
          qty: p.item.qty,
          unitPrice: p.unit,
          total: p.unit * p.item.qty,
          addons: p.addonNames,
          exclusions: p.exclusionNames,
        })),
      }
    },
    include: { items: true }
  });

  logOrder(order);

  if (promoCodeId) {
    await prisma.promoCode.update({
      where: { id: promoCodeId },
      data: { usedCount: { increment: 1 } },
    });
  }

  res.status(201).json({
    id: order.id,
    status: order.status,
    pickupTime: order.pickupTime,
    promoCode: data.promoCode ?? null,
    subtotal,
    deliveryFee,
    discount,
    total,
    bonusEarned,
    bonusUsed,
    createdAt: order.createdAt,
  });
});

app.get(`${BASE}/orders/:id`, async (req: Request, res: Response) => {
  const o = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true, promoCode: true },
  });
  if (!o) return res.status(404).json({ error: "Not found" });
  res.json({
    ...o,
    promoCode: o.promoCode?.code ?? null,
  });
});

app.get(`${BASE}/admin/orders`, async (req: Request, res: Response) => {
  const where = req.query.branchId
    ? { branchId: String(req.query.branchId) }
    : undefined;
  const orders = await prisma.order.findMany({
    where,
    include: { items: true, promoCode: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(
    orders.map((o: any) => ({
      id: o.id,
      type: o.type,
      status: o.status,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      address: o.address,
      zoneId: o.zoneId,
      branchId: o.branchId,
      pickupTime: o.pickupTime,
      promoCode: o.promoCode?.code,
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.deliveryFee),
      discount: Number(o.discount),
      total: Number(o.total),
      bonusEarned: o.bonusEarned,
      bonusUsed: o.bonusUsed,
      createdAt: o.createdAt,
      items: o.items.map((i: any) => ({
        id: i.id,
        dishId: i.dishId,
        variantId: i.variantId,
        qty: i.qty,
        unitPrice: Number(i.unitPrice),
        total: Number(i.total),
        addons: i.addons,
        exclusions: i.exclusions,
      })),
    }))
  );
});

app.get(`${BASE}/admin/expenses`, async (req: Request, res: Response) => {
  const where = req.query.branchId
    ? { branchId: String(req.query.branchId) }
    : undefined;
  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  res.json(
    expenses.map((e: any) => ({
      id: e.id,
      branchId: e.branchId,
      amount: Number(e.amount),
      description: e.description,
      createdAt: e.createdAt,
    }))
  );
});

app.post(`${BASE}/admin/expenses`, async (req: Request, res: Response) => {
  const { branchId, amount, description } = req.body;
  const expense = await prisma.expense.create({
    data: { branchId, amount, description },
  });
  res.json({
    id: expense.id,
    branchId: expense.branchId,
    amount: Number(expense.amount),
    description: expense.description,
    createdAt: expense.createdAt,
  });
});

app.get(`${BASE}/admin/analytics`, async (req: Request, res: Response) => {
  const { branchId } = req.query;
  const where = branchId ? { branchId: String(branchId) } : undefined;
  const [orders, expenses] = await Promise.all([
    prisma.order.findMany({ where }),
    prisma.expense.findMany({ where }),
  ]);
  const ordersTotal = orders.reduce(
    (s: number, o: any) => s + Number(o.total),
    0
  );
  const ordersCount = orders.length;
  const expensesTotal = expenses.reduce(
    (s: number, e: any) => s + Number(e.amount),
    0
  );
  const profit = ordersTotal - expensesTotal;

  const days: string[] = [];
  const ordersDaily: number[] = [];
  const expensesDaily: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    days.push(d.toISOString().slice(0, 10));
    ordersDaily.push(
      orders
        .filter((o: any) => o.createdAt >= d && o.createdAt < next)
        .reduce((s: number, o: any) => s + Number(o.total), 0)
    );
    expensesDaily.push(
      expenses
        .filter((e: any) => e.createdAt >= d && e.createdAt < next)
        .reduce((s: number, e: any) => s + Number(e.amount), 0)
    );
  }

  res.json({
    ordersTotal,
    ordersCount,
    expensesTotal,
    profit,
    daily: { days, orders: ordersDaily, expenses: expensesDaily },
  });
});

app.get(`${BASE}/users/:id`, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      orders: {
        include: { items: { include: { dish: true } }, promoCode: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!user) return res.status(404).json({ error: "Not found" });

  res.json({
    id: user.id,
    phone: user.phone,
    email: user.email,
    name: user.name,
    birthDate: user.birthDate,
    notificationsEnabled: user.notificationsEnabled,
    bonus: user.bonus,
    orders: user.orders.map((o: any) => ({
      id: o.id,
      type: o.type,
      status: o.status,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      address: o.address,
      zoneId: o.zoneId,
      branchId: o.branchId,
      pickupTime: o.pickupTime,
      promoCode: o.promoCode?.code,
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.deliveryFee),
      discount: Number(o.discount),
      total: Number(o.total),
      bonusEarned: o.bonusEarned,
      bonusUsed: o.bonusUsed,
      createdAt: o.createdAt,
      items: o.items.map((i: any) => ({
        id: i.id,
        dishId: i.dishId,
        variantId: i.variantId,
        qty: i.qty,
        unitPrice: Number(i.unitPrice),
        total: Number(i.total),
        dishName: i.dish?.name,
        dishImageUrl: i.dish?.imageUrl ?? null,
        addons: i.addons,
        exclusions: i.exclusions,
      })),
    })),
  });
});

const UserUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(5).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  birthDate: z.string().optional().nullable(),
  notificationsEnabled: z.boolean().optional(),
});

app.put(`${BASE}/users/:id`, async (req: Request, res: Response) => {
  const parsed = UserUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  const data: any = { ...parsed.data };
  if (data.birthDate) data.birthDate = new Date(data.birthDate);
  const user = await prisma.user.update({ where: { id: req.params.id }, data });
  res.json({ id: user.id, phone: user.phone, email: user.email, name: user.name, birthDate: user.birthDate, notificationsEnabled: user.notificationsEnabled, bonus: user.bonus });
});

const OrderStatusUpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

app.put(`${BASE}/admin/orders/:id/status`, async (req: Request, res: Response) => {
  const parsed = OrderStatusUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  try {
    const o = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
      select: { id: true, status: true },
    });
    res.json(o);
  } catch (err) {
    res.status(404).json({ error: "Not found" });
  }
});

const port = Number(process.env.API_PORT || 3001);
app.listen(port, () => console.log(`API on http://localhost:${port}${BASE}`));
