-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'customer';

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_staffId_fkey";

-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "staffId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "password" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'customer';

-- AlterTable
ALTER TABLE "Staff" ALTER COLUMN "workingHours" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
