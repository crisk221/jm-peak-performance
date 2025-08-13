/*
  Warnings:

  - Changed the type of `activityLevel` on the `clients` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTRA_ACTIVE');

-- Add temporary column with enum type
ALTER TABLE "clients" ADD COLUMN "activityLevel_new" "ActivityLevel";

-- Update temporary column with default values based on existing data
UPDATE "clients" SET "activityLevel_new" = 'MODERATELY_ACTIVE';

-- Make the new column required
ALTER TABLE "clients" ALTER COLUMN "activityLevel_new" SET NOT NULL;

-- Drop old column and rename new column
ALTER TABLE "clients" DROP COLUMN "activityLevel";
ALTER TABLE "clients" RENAME COLUMN "activityLevel_new" TO "activityLevel";
