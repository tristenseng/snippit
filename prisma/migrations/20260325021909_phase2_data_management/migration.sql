-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('INACTIVE', 'ACTIVE', 'COMPLETED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deactivatedAt" TIMESTAMP(3),
ADD COLUMN     "forcePasswordReset" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "locationId" TEXT;

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_locations" (
    "userId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "user_locations_pkey" PRIMARY KEY ("userId","locationId")
);

-- CreateTable
CREATE TABLE "Strain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Strain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'INACTIVE',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_strains" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "strainId" TEXT NOT NULL,

    CONSTRAINT "batch_strains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Day" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "batchDay" INTEGER NOT NULL,
    "isSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "Day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees_days" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "batchStrainId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "hours" DOUBLE PRECISION,

    CONSTRAINT "employees_days_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Batch_locationId_number_key" ON "Batch"("locationId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "batch_strains_batchId_strainId_key" ON "batch_strains"("batchId", "strainId");

-- CreateIndex
CREATE UNIQUE INDEX "Day_batchId_batchDay_key" ON "Day"("batchId", "batchDay");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_strains" ADD CONSTRAINT "batch_strains_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_strains" ADD CONSTRAINT "batch_strains_strainId_fkey" FOREIGN KEY ("strainId") REFERENCES "Strain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Day" ADD CONSTRAINT "Day_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees_days" ADD CONSTRAINT "employees_days_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees_days" ADD CONSTRAINT "employees_days_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees_days" ADD CONSTRAINT "employees_days_batchStrainId_fkey" FOREIGN KEY ("batchStrainId") REFERENCES "batch_strains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
