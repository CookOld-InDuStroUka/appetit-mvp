-- CreateEnum
CREATE TYPE "ModifierType" AS ENUM ('addon', 'exclusion');

-- CreateTable
CREATE TABLE "DishModifier" (
  "id" TEXT PRIMARY KEY,
  "dishId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "type" "ModifierType" NOT NULL,
  CONSTRAINT "DishModifier_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DishModifier_dishId_idx" ON "DishModifier"("dishId");
