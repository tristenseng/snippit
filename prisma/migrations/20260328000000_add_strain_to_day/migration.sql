-- Step 1: Drop old unique constraint on Day
DROP INDEX IF EXISTS "Day_batchId_batchDay_key";

-- Step 2: Add batchStrainId as nullable initially
ALTER TABLE "Day" ADD COLUMN "batchStrainId" TEXT;

-- Step 3: Populate batchStrainId for existing days using first batchStrain for the batch
UPDATE "Day" d
SET "batchStrainId" = (
  SELECT bs.id FROM "batch_strains" bs
  WHERE bs."batchId" = d."batchId"
  ORDER BY bs.id
  LIMIT 1
);

-- Step 4: Delete any days that still have no batchStrainId (batches with no strains)
DELETE FROM "Day" WHERE "batchStrainId" IS NULL;

-- Step 5: Make batchStrainId NOT NULL
ALTER TABLE "Day" ALTER COLUMN "batchStrainId" SET NOT NULL;

-- Step 6: Add foreign key constraint
ALTER TABLE "Day" ADD CONSTRAINT "Day_batchStrainId_fkey"
  FOREIGN KEY ("batchStrainId") REFERENCES "batch_strains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 7: Add new unique constraint
CREATE UNIQUE INDEX "Day_batchId_batchStrainId_batchDay_key" ON "Day"("batchId", "batchStrainId", "batchDay");

-- Step 8: Drop batchStrainId from employees_days
ALTER TABLE "employees_days" DROP COLUMN IF EXISTS "batchStrainId";
