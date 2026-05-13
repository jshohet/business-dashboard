-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'starter';

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'other',
    "metricDefinitions" JSONB NOT NULL DEFAULT '[]',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KpiEntry" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "weekEnding" TIMESTAMP(3) NOT NULL,
    "metrics" JSONB NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KpiEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderingCadence" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "recommendedQty" DECIMAL(10,2),
    "aiReasoning" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderingCadence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiReport" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "inputSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waitlist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "role" TEXT,
    "storeCount" TEXT,
    "painPoint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Location_storeId_idx" ON "Location"("storeId");

-- CreateIndex
CREATE INDEX "Location_storeId_deletedAt_idx" ON "Location"("storeId", "deletedAt");

-- CreateIndex
CREATE INDEX "KpiEntry_locationId_weekEnding_idx" ON "KpiEntry"("locationId", "weekEnding");

-- CreateIndex
CREATE UNIQUE INDEX "KpiEntry_locationId_weekEnding_key" ON "KpiEntry"("locationId", "weekEnding");

-- CreateIndex
CREATE INDEX "OrderingCadence_locationId_idx" ON "OrderingCadence"("locationId");

-- CreateIndex
CREATE INDEX "AiReport_locationId_reportType_idx" ON "AiReport"("locationId", "reportType");

-- CreateIndex
CREATE INDEX "AiReport_locationId_createdAt_idx" ON "AiReport"("locationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Waitlist_email_key" ON "Waitlist"("email");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KpiEntry" ADD CONSTRAINT "KpiEntry_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderingCadence" ADD CONSTRAINT "OrderingCadence_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiReport" ADD CONSTRAINT "AiReport_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
