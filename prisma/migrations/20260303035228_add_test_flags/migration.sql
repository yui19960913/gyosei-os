-- AlterTable
ALTER TABLE "public"."clients" ADD COLUMN     "testClient" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."leads" ADD COLUMN     "testFlag" BOOLEAN NOT NULL DEFAULT false;
