CREATE UNIQUE INDEX batches_one_active_per_location ON "Batch"("locationId") WHERE status = 'ACTIVE';
