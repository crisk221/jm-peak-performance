/*
  Warnings:

  - You are about to drop the column `carbsPer100` on the `Ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `fatPer100` on the `Ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `kcalPer100` on the `Ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `proteinPer100` on the `Ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `carbsG` on the `Meal` table. All the data in the column will be lost.
  - You are about to drop the column `fatG` on the `Meal` table. All the data in the column will be lost.
  - You are about to drop the column `proteinG` on the `Meal` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Recipe` table. All the data in the column will be lost.
  - Added the required column `carbsPer100g` to the `Ingredient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatPer100g` to the `Ingredient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kcalPer100g` to the `Ingredient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proteinPer100g` to the `Ingredient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carbs` to the `Meal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fat` to the `Meal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `protein` to the `Meal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Meal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Recipe` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Plan" ADD COLUMN "formula" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ingredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "kcalPer100g" REAL NOT NULL,
    "proteinPer100g" REAL NOT NULL,
    "carbsPer100g" REAL NOT NULL,
    "fatPer100g" REAL NOT NULL,
    "allergens" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Ingredient" ("allergens", "createdAt", "id", "name") SELECT "allergens", "createdAt", "id", "name" FROM "Ingredient";
DROP TABLE "Ingredient";
ALTER TABLE "new_Ingredient" RENAME TO "Ingredient";
CREATE UNIQUE INDEX "Ingredient_name_key" ON "Ingredient"("name");
CREATE TABLE "new_Meal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "recipeId" TEXT,
    "servings" REAL NOT NULL,
    "kcal" INTEGER NOT NULL,
    "protein" REAL NOT NULL,
    "carbs" REAL NOT NULL,
    "fat" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Meal_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Meal_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Meal" ("id", "kcal", "planId", "recipeId", "servings", "slot") SELECT "id", "kcal", "planId", "recipeId", "servings", "slot" FROM "Meal";
DROP TABLE "Meal";
ALTER TABLE "new_Meal" RENAME TO "Meal";
CREATE TABLE "new_Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cuisine" TEXT,
    "difficulty" TEXT,
    "utensils" TEXT NOT NULL,
    "baseServings" REAL NOT NULL,
    "instructions" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Recipe" ("baseServings", "createdAt", "cuisine", "difficulty", "id", "instructions", "utensils") SELECT "baseServings", "createdAt", "cuisine", "difficulty", "id", "instructions", "utensils" FROM "Recipe";
DROP TABLE "Recipe";
ALTER TABLE "new_Recipe" RENAME TO "Recipe";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
