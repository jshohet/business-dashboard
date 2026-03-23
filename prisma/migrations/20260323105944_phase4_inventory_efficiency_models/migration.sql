-- CreateTable
CREATE TABLE "public"."InventoryLog" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "orderedQty" INTEGER NOT NULL,
    "soldQty" INTEGER NOT NULL,
    "wasteQty" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LaborEntry" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "laborCost" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LaborEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryLog_storeId_date_idx" ON "public"."InventoryLog"("storeId", "date");

-- CreateIndex
CREATE INDEX "InventoryLog_storeId_product_idx" ON "public"."InventoryLog"("storeId", "product");

-- CreateIndex
CREATE INDEX "LaborEntry_storeId_date_idx" ON "public"."LaborEntry"("storeId", "date");

-- AddForeignKey
ALTER TABLE "public"."InventoryLog" ADD CONSTRAINT "InventoryLog_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LaborEntry" ADD CONSTRAINT "LaborEntry_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
