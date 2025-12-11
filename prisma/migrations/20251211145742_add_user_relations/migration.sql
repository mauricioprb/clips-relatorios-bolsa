/*
  Warnings:

  - Added the required column `userId` to the `DayEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `DefaultActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `WeeklySlot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DayEntry" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DefaultActivity" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WeeklySlot" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "DayEntry_userId_idx" ON "DayEntry"("userId");

-- AddForeignKey
ALTER TABLE "WeeklySlot" ADD CONSTRAINT "WeeklySlot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultActivity" ADD CONSTRAINT "DefaultActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayEntry" ADD CONSTRAINT "DayEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
