import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const branch = await prisma.branch.create({
    data: { name: "Центр", address: "ул. Пример, 1", phone: "+7 777 000 11 22" }
  });
  const zone = await prisma.zone.create({
    data: { name: "Зона Центр", branchId: branch.id, deliveryFee: 500, minOrder: 2000 }
  });

  const cat = await prisma.category.create({
    data: { name: "Шаурма", slug: "shawarma", sortOrder: 1, isActive: true }
  });

  const dish = await prisma.dish.create({
    data: {
      categoryId: cat.id,
      name: "Шаурма говяжья",
      slug: "beef-shawarma",
      description: "Говядина, овощи, соус, лаваш",
      basePrice: 1900,
      imageUrl: "https://placehold.co/640x360?text=Beef",
      isActive: true
    }
  });

  await prisma.dishVariant.createMany({
    data: [
      { dishId: dish.id, name: "Средняя", priceDelta: 0, sortOrder: 1 },
      { dishId: dish.id, name: "Большая", priceDelta: 500, sortOrder: 2 }
    ]
  });

  await prisma.dishAvailability.create({
    data: { dishId: dish.id, zoneId: zone.id }
  });

  await prisma.cmsPage.create({
    data: { slug: "delivery-terms", title: "Условия доставки", content: "Текст условий доставки", isActive: true }
  });
}

main().finally(() => prisma.$disconnect());
