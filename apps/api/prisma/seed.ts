import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Clean previous examples to avoid leftover branches
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.dishAvailability.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.branch.deleteMany();

  // --- Branches & Zones (стабильные id) ---
  const seedBranches = [
    {
      id: "kazakhstan",
      name: "КАЗАХСТАН, 70А",
      address: "КАЗАХСТАН, 70А",
      phone: "+7 777 000 00 01",
      zoneId: "zone-kazakhstan",
      zoneName: "Зона Казахстан 70А"
    },
    {
      id: "satpaeva",
      name: "САТПАЕВА, 8А",
      address: "САТПАЕВА, 8А",
      phone: "+7 777 000 00 02",
      zoneId: "zone-satpaeva",
      zoneName: "Зона Сатпаева 8А"
    },
    {
      id: "novatorov",
      name: "НОВАТОРОВ, 18/2",
      address: "НОВАТОРОВ, 18/2",
      phone: "+7 777 000 00 03",
      zoneId: "zone-novatorov",
      zoneName: "Зона Новаторов 18/2"
    },
    {
      id: "zhybek",
      name: "ЖИБЕК ЖОЛЫ, 1к8",
      address: "ЖИБЕК ЖОЛЫ, 1к8",
      phone: "+7 777 000 00 04",
      zoneId: "zone-zhybek",
      zoneName: "Зона Жибек Жолы 1к8"
    },
    {
      id: "samarskoe",
      name: "САМАРСКОЕ ШОССЕ, 5/1",
      address: "САМАРСКОЕ ШОССЕ, 5/1",
      phone: "+7 777 000 00 05",
      zoneId: "zone-samarskoe",
      zoneName: "Зона Самарское шоссе 5/1"
    },
    {
      id: "kabanbay",
      name: "КАБАНБАЙ БАТЫРА,148",
      address: "КАБАНБАЙ БАТЫРА,148",
      phone: "+7 777 000 00 06",
      zoneId: "zone-kabanbay",
      zoneName: "Зона Кабанбай батыра 148"
    },
    {
      id: "nazarbaeva",
      name: "НАЗАРБАЕВА, 28А",
      address: "НАЗАРБАЕВА, 28А",
      phone: "+7 777 000 00 07",
      zoneId: "zone-nazarbaeva",
      zoneName: "Зона Назарбаева 28А"
    }
  ];

  for (const b of seedBranches) {
    await prisma.branch.upsert({
      where: { id: b.id },
      update: { name: b.name, address: b.address, phone: b.phone },
      create: { id: b.id, name: b.name, address: b.address, phone: b.phone }
    });

    await prisma.zone.upsert({
      where: { id: b.zoneId },
      update: { name: b.zoneName, branchId: b.id, deliveryFee: 500, minOrder: 2000 },
      create: {
        id: b.zoneId,
        name: b.zoneName,
        branchId: b.id,
        deliveryFee: 500,
        minOrder: 2000
      }
    });
  }

  // --- Categories ---
  const dishesCat = await prisma.category.upsert({
    where: { slug: "dishes" },
    update: { name: "Блюда" },
    create: { id: "cat-dishes", slug: "dishes", name: "Блюда", sortOrder: 2, isActive: true }
  });

  const comboCat = await prisma.category.upsert({
    where: { slug: "combo" },
    update: {},
    create: { id: "cat-combo", slug: "combo", name: "Комбо", sortOrder: 1, isActive: true }
  });

  const snacksCat = await prisma.category.upsert({
    where: { slug: "snacks" },
    update: { name: "Закуски" },
    create: {
      id: "cat-snacks",
      slug: "snacks",
      name: "Закуски",
      sortOrder: 3,
      isActive: true,
    },
  });

  const saucesCat = await prisma.category.upsert({
    where: { slug: "sauces" },
    update: { name: "Соусы" },
    create: {
      id: "cat-sauces",
      slug: "sauces",
      name: "Соусы",
      sortOrder: 4,
      isActive: true,
    },
  });

  const drinksCat = await prisma.category.upsert({
    where: { slug: "drinks" },
    update: { name: "Напитки" },
    create: {
      id: "cat-drinks",
      slug: "drinks",
      name: "Напитки",
      sortOrder: 5,
      isActive: true,
    },
  });

  // --- Dish statuses ---
  const hit = await prisma.dishStatus.upsert({
    where: { id: "status-hit" },
    update: { name: "Хит", color: "#ff9800" },
    create: { id: "status-hit", name: "Хит", color: "#ff9800" },
  });

  const newStatus = await prisma.dishStatus.upsert({
    where: { id: "status-new" },
    update: { name: "Новинка", color: "#a855f7" },
    create: { id: "status-new", name: "Новинка", color: "#a855f7" },
  });

  // --- Dishes ---
  await prisma.dish.createMany({
    data: [
      {
        id: "dish-firm-big",
        categoryId: dishesCat.id,
        name: "Фирменная Большая шаурма",
        slug: "firm-big",
        description: "Тонкий лаваш, сочные кусочки говядины, картофель фри, лук, помидор, белый соус",
        basePrice: 1990,
        imageUrl: "https://placehold.co/600x200?text=Shawarma+1",
        isActive: true
      },
      {
        id: "dish-classic-big",
        categoryId: dishesCat.id,
        name: "Классическая Большая шаурма",
        slug: "classic-big",
        description: "Тонкий лаваш, мясо и овощи",
        basePrice: 2490,
        imageUrl: "https://placehold.co/600x200?text=Shawarma+2",
        isActive: true,
      },
      {
        id: "dish-classic-mid",
        categoryId: dishesCat.id,
        name: "Классическая Средняя шаурма",
        slug: "classic-mid",
        description: "Тонкий лаваш, мясо и овощи",
        basePrice: 2390,
        imageUrl: "https://placehold.co/600x200?text=Shawarma+3",
        isActive: true,
      },
      {
        id: "dish-chicken-big",
        categoryId: dishesCat.id,
        name: "Куриная Большая шаурма",
        slug: "chicken-big",
        description: "Лаваш и сочная курица",
        basePrice: 2290,
        imageUrl: "https://placehold.co/600x200?text=Shawarma+Chicken",
        isActive: true,
      },
      {
        id: "dish-marble-big",
        categoryId: dishesCat.id,
        name: "Мраморная Большая шаурма",
        slug: "marble-big",
        description: "Мраморная говядина и овощи",
        basePrice: 2490,
        imageUrl: "https://placehold.co/600x200?text=Shawarma+Marble",
        isActive: true,
      },
      {
        id: "dish-doner-chicken",
        categoryId: dishesCat.id,
        name: "Донер с курицей",
        slug: "doner-chicken",
        description: "Булочка, кусочки курицы, картофель фри, лук, красный соус, белый соус",
        basePrice: 1490,
        imageUrl: "https://placehold.co/600x200?text=Doner+Chicken",
        isActive: true
      },
      {
        id: "dish-doner-beef",
        categoryId: dishesCat.id,
        name: "Донер с говядиной",
        slug: "doner-beef",
        description: "Булочка, кусочки говядины и соусы",
        basePrice: 1490,
        imageUrl: "https://placehold.co/600x200?text=Doner+Beef",
        isActive: true,
      },
      {
        id: "dish-hotdog",
        categoryId: dishesCat.id,
        name: "Хот-дог",
        slug: "hot-dog",
        description: "Булочка, сосиска, лук, соус",
        basePrice: 990,
        imageUrl: "https://placehold.co/600x200?text=Hotdog",
        isActive: true
      },
      {
        id: "combo-one",
        categoryId: comboCat.id,
        name: "Комбо для ОДНОГО",
        slug: "combo-one",
        description: "Фирменная шаурма, картошка фри и айран",
        basePrice: 2490,
        imageUrl: "https://placehold.co/600x200?text=Combo+1",
        isActive: true
      },
      {
        id: "combo-two",
        categoryId: comboCat.id,
        name: "Комбо для ДВОИХ",
        slug: "combo-two",
        description: "2 фирменные шаурмы, порция фри и Pepsi",
        basePrice: 4490,
        imageUrl: "https://placehold.co/600x200?text=Combo+2",
        isActive: true
      },
      {
        id: "combo-company",
        categoryId: comboCat.id,
        name: "Комбо для КОМПАНИИ",
        slug: "combo-company",
        description: "4 средние шаурмы на выбор, 2 порции фри и 2 напитка",
        basePrice: 8900,
        imageUrl: "https://placehold.co/600x200?text=Combo+3",
        isActive: true
      },
      // Snacks
      {
        id: "snack-sheker",
        categoryId: snacksCat.id,
        name: "Шекер",
        slug: "sheker",
        description: "Сладкие палочки из теста, обжаренные во фритюре",
        basePrice: 400,
        imageUrl: "https://placehold.co/600x200?text=Sheker",
        isActive: true,
      },
      {
        id: "snack-cheburek",
        categoryId: snacksCat.id,
        name: "Чебурек",
        slug: "cheburek",
        description: "Сочные и вкусные чебуреки, обжаренные во фритюре",
        basePrice: 990,
        imageUrl: "https://placehold.co/600x200?text=Cheburek",
        isActive: true,
      },
      {
        id: "snack-nuggets",
        categoryId: snacksCat.id,
        name: "Наггетсы",
        slug: "nuggets",
        description: "Нежнейшие кусочки куриного мяса в золотистой корочке",
        basePrice: 1490,
        imageUrl: "https://placehold.co/600x200?text=Nuggets",
        isActive: true,
      },
      {
        id: "snack-fries",
        categoryId: snacksCat.id,
        name: "Фри",
        slug: "fries",
        description: "Кусочки картофеля, обжаренные во фритюре",
        basePrice: 790,
        imageUrl: "https://placehold.co/600x200?text=Fries",
        isActive: true,
      },
      {
        id: "snack-wedges",
        categoryId: snacksCat.id,
        name: "Дольки",
        slug: "wedges",
        description: "Воздушная картофельная мякоть с хрустящей корочкой",
        basePrice: 1190,
        imageUrl: "https://placehold.co/600x200?text=Wedges",
        isActive: true,
      },
      // Sauces
      { id: "sauce-pepper", categoryId: saucesCat.id, name: "Перчик острый 15г", slug: "pepper", basePrice: 240, imageUrl: "https://placehold.co/600x200?text=Pepper", isActive: true },
      { id: "sauce-cheese", categoryId: saucesCat.id, name: "соус Сырный 30г", slug: "cheese", basePrice: 240, imageUrl: "https://placehold.co/600x200?text=CheeseSauce", isActive: true },
      { id: "sauce-tomato", categoryId: saucesCat.id, name: "соус Томатный 30г", slug: "tomato", basePrice: 240, imageUrl: "https://placehold.co/600x200?text=TomatoSauce", isActive: true },
      { id: "sauce-barbecue", categoryId: saucesCat.id, name: "соус Барбекю 30г", slug: "barbecue", basePrice: 240, imageUrl: "https://placehold.co/600x200?text=BBQSauce", isActive: true },
      { id: "sauce-garlic", categoryId: saucesCat.id, name: "соус Чесночный 30г", slug: "garlic", basePrice: 240, imageUrl: "https://placehold.co/600x200?text=GarlicSauce", isActive: true },
      { id: "sauce-spicy", categoryId: saucesCat.id, name: "соус Острый 30г", slug: "spicy", basePrice: 240, imageUrl: "https://placehold.co/600x200?text=SpicySauce", isActive: true },
      { id: "sauce-mustard", categoryId: saucesCat.id, name: "соус Горчичный 30г", slug: "mustard", basePrice: 240, imageUrl: "https://placehold.co/600x200?text=MustardSauce", isActive: true },
      // Drinks
      { id: "drink-lemon-1l", categoryId: drinksCat.id, name: "Сок Лимонный 1,0л", slug: "lemon-1l", basePrice: 990, imageUrl: "https://placehold.co/600x200?text=Lemon1l", isActive: true },
      { id: "drink-lemon-0_3l", categoryId: drinksCat.id, name: "Сок Лимонный 0,3л", slug: "lemon-0-3l", basePrice: 390, imageUrl: "https://placehold.co/600x200?text=Lemon0.3l", isActive: true },
      { id: "drink-mors-0_3l", categoryId: drinksCat.id, name: "Морс Смородина 0,3л", slug: "mors-0-3l", basePrice: 390, imageUrl: "https://placehold.co/600x200?text=Mors0.3l", isActive: true },
      { id: "drink-mors-0_5l", categoryId: drinksCat.id, name: "Морс Смородина 0,5л", slug: "mors-0-5l", basePrice: 690, imageUrl: "https://placehold.co/600x200?text=Mors0.5l", isActive: true },
      { id: "drink-ayran", categoryId: drinksCat.id, name: "Айран Tet", slug: "ayran", basePrice: 390, imageUrl: "https://placehold.co/600x200?text=Airan", isActive: true },
      { id: "drink-pepsi-0_5l", categoryId: drinksCat.id, name: "Пепси 0,5л", slug: "pepsi-0-5l", basePrice: 640, imageUrl: "https://placehold.co/600x200?text=Pepsi0.5", isActive: true },
      { id: "drink-pepsi-1l", categoryId: drinksCat.id, name: "Пепси 1л", slug: "pepsi-1l", basePrice: 740, imageUrl: "https://placehold.co/600x200?text=Pepsi1", isActive: true },
      { id: "drink-pepsi-1_5l", categoryId: drinksCat.id, name: "Пепси 1,5л", slug: "pepsi-1-5l", basePrice: 940, imageUrl: "https://placehold.co/600x200?text=Pepsi1.5", isActive: true },
      { id: "drink-lipton-0_5l", categoryId: drinksCat.id, name: "Липтон чай 0,5л", slug: "lipton-0-5l", basePrice: 740, imageUrl: "https://placehold.co/600x200?text=Lipton0.5", isActive: true },
      { id: "drink-lipton-1l", categoryId: drinksCat.id, name: "Липтон чай 1л", slug: "lipton-1l", basePrice: 940, imageUrl: "https://placehold.co/600x200?text=Lipton1", isActive: true },
      { id: "drink-dada-1l", categoryId: drinksCat.id, name: "Дада 1л", slug: "dada-1l", basePrice: 640, imageUrl: "https://placehold.co/600x200?text=Dada1", isActive: true },
      { id: "drink-dado-0_2l", categoryId: drinksCat.id, name: "Сок Дадо 0,2л", slug: "dado-0-2l", basePrice: 390, imageUrl: "https://placehold.co/600x200?text=Dado0.2", isActive: true },
      { id: "drink-asu-0_5l", categoryId: drinksCat.id, name: "Асу 0,5л", slug: "asu-0-5l", basePrice: 490, imageUrl: "https://placehold.co/600x200?text=Asu0.5", isActive: true },
      { id: "drink-lavina-0_5l", categoryId: drinksCat.id, name: "Лавина 0,5л", slug: "lavina-0-5l", basePrice: 690, imageUrl: "https://placehold.co/600x200?text=Lavina0.5", isActive: true },
      { id: "drink-gorilla-0_5l", categoryId: drinksCat.id, name: "Горилла 0,5л", slug: "gorilla-0-5l", basePrice: 690, imageUrl: "https://placehold.co/600x200?text=Gorilla0.5", isActive: true },
      { id: "drink-asu-1l", categoryId: drinksCat.id, name: "Асу 1л", slug: "asu-1l", basePrice: 490, imageUrl: "https://placehold.co/600x200?text=Asu1", isActive: true }
    ],
    skipDuplicates: true
  });

  // Assign sample statuses
  await prisma.dish.update({
    where: { id: "dish-firm-big" },
    data: { statusId: newStatus.id },
  });
  await prisma.dish.update({
    where: { id: "dish-classic-big" },
    data: { statusId: hit.id },
  });

  // --- Modifiers for dishes ---
  await prisma.dishModifier.createMany({
    data: [
      { dishId: "dish-firm-big", name: "соус Горчичный", price: 240, type: "addon" },
      { dishId: "dish-firm-big", name: "соус Барбекю", price: 240, type: "addon" },
      { dishId: "dish-firm-big", name: "соус Сырный", price: 240, type: "addon" },
      { dishId: "dish-firm-big", name: "перчик острый", price: 240, type: "addon" },
      { dishId: "dish-firm-big", name: "соус Томатный", price: 240, type: "addon" },
      { dishId: "dish-firm-big", name: "соус Чесночный", price: 240, type: "addon" },
      { dishId: "dish-firm-big", name: "без кетчупа", price: 0, type: "exclusion" },
      { dishId: "dish-firm-big", name: "без майонеза", price: 0, type: "exclusion" },
      { dishId: "dish-firm-big", name: "без лука", price: 0, type: "exclusion" },
      { dishId: "dish-firm-big", name: "без помидор", price: 0, type: "exclusion" },
      { dishId: "dish-firm-big", name: "без огурцов", price: 0, type: "exclusion" },
      { dishId: "dish-firm-big", name: "без мяса", price: 0, type: "exclusion" }
    ],
    skipDuplicates: true
  });

  // --- Availability for all dishes ---
  const allDishes = await prisma.dish.findMany({
    where: {
      categoryId: {
        in: [
          dishesCat.id,
          comboCat.id,
          snacksCat.id,
          saucesCat.id,
          drinksCat.id,
        ],
      },
    },
    select: { id: true },
  });
  const zones = await prisma.zone.findMany({ select: { id: true } });
  await prisma.dishAvailability.createMany({
    data: zones.flatMap(z => allDishes.map(d => ({ dishId: d.id, zoneId: z.id }))),
    skipDuplicates: true
  });

  // --- Promo codes ---
  await prisma.promoCode.upsert({
    where: { code: "TEST10" },
    update: {},
    create: {
      code: "TEST10",
      discount: 10,
      expiresAt: new Date("2099-12-31"),
      conditions: "Тестовый промокод",
      maxUses: null,
      branchId: null,
    },
  });

  // --- CMS (upsert по slug) ---
  await prisma.cmsPage.upsert({
    where: { slug: "delivery-terms" },
    update: {},
    create: { slug: "delivery-terms", title: "Условия доставки", content: "Текст условий доставки", isActive: true }
  });
}

// строгая обработка и корректные скобки
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
