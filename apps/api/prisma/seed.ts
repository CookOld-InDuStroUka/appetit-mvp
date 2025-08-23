import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // --- Branches & Zones (стабильные id) ---
  const seedBranches = [
    {
      id: "seed-branch",
      name: "Центр",
      address: "ул. Пример, 1",
      phone: "+7 777 000 11 22",
      zoneId: "seed-zone",
      zoneName: "Зона Центр"
    },
    {
      id: "seed-branch-2",
      name: "Запад",
      address: "ул. Пример, 2",
      phone: "+7 777 000 22 33",
      zoneId: "seed-zone-2",
      zoneName: "Зона Запад"
    },
    {
      id: "seed-branch-3",
      name: "Восток",
      address: "ул. Пример, 3",
      phone: "+7 777 000 33 44",
      zoneId: "seed-zone-3",
      zoneName: "Зона Восток"
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

  // --- Dishes ---
  await prisma.dish.createMany({
    data: [
      {
        id: "dish-firm-big",
        categoryId: dishesCat.id,
        name: "Фирменная Большая шаурма",
        slug: "firm-big",
        description: "Тонкий лаваш, сочные кусочки говядины, картофель фри, лук, помидор, белый соус",
        basePrice: 2990,
        imageUrl: "https://placehold.co/600x200?text=Shawarma+1",
        isActive: true
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
      }
    ],
    skipDuplicates: true
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
    where: { categoryId: { in: [dishesCat.id, comboCat.id] } },
    select: { id: true }
  });
  const zones = await prisma.zone.findMany({ select: { id: true } });
  await prisma.dishAvailability.createMany({
    data: zones.flatMap(z => allDishes.map(d => ({ dishId: d.id, zoneId: z.id }))),
    skipDuplicates: true
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
