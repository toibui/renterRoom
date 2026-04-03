-- AlterTable
ALTER TABLE "Type" ADD COLUMN     "duration" INTEGER;

-- CreateTable
CREATE TABLE "RenewContract" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "renewNo" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RenewContract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RenewContract_contractId_renewNo_key" ON "RenewContract"("contractId", "renewNo");

-- AddForeignKey
ALTER TABLE "RenewContract" ADD CONSTRAINT "RenewContract_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
