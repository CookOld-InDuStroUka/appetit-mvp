import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // --- Branch & Zone (стабильные id) ---
  const branch =
    (await prisma.branch.findUnique({ where: { id: "seed-branch" } })) ??
    (await prisma.branch.create({
      data: { id: "seed-branch", name: "Центр", address: "ул. Пример, 1", phone: "+7 777 000 11 22" }
    }));

  const zone =
    (await prisma.zone.findUnique({ where: { id: "seed-zone" } })) ??
    (await prisma.zone.create({
      data: { id: "seed-zone", name: "Зона Центр", branchId: branch.id, deliveryFee: 500, minOrder: 2000 }
    }));

  // --- Category (по slug, но через findFirst — не требует unique-типа) ---
  const cat = await prisma.category.upsert({
    where: { slug: "shawarma" },
    update: {},
    create: { id: "cat-shawarma", slug: "shawarma", name: "Шаурма", sortOrder: 1, isActive: true }
  });
  // --- Dish (по slug, тоже findFirst) ---
  let dish =
    (await prisma.dish.findFirst({ where: { slug: "beef-shawarma" } })) ??
    (await prisma.dish.create({
      data: {
        id: "dish-beef-shawarma",
        categoryId: cat.id,
        name: "Шаурма говяжья",
        slug: "beef-shawarma",
        description: "Говядина, овощи, соус, лаваш",
        basePrice: 1900,
        imageUrl: "https://placehold.co/640x360?text=Beef",
        isActive: true
      }
    }));

  // --- Variants (createMany + skipDuplicates) ---
  await prisma.dishVariant.createMany({
    data: [
      { id: "var-beef-m", dishId: dish.id, name: "Средняя", priceDelta: 0, sortOrder: 1 },
      { id: "var-beef-l", dishId: dish.id, name: "Большая", priceDelta: 500, sortOrder: 2 }
    ],
    skipDuplicates: true
  });

  // --- Availability (upsert составного ключа) ---
  await prisma.dishAvailability.upsert({
    where: { dishId_zoneId: { dishId: dish.id, zoneId: zone.id } },
    update: {},
    create: { dishId: dish.id, zoneId: zone.id }
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
