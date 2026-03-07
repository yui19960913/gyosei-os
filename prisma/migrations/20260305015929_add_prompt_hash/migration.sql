-- AlterTable
ALTER TABLE "public"."ai_sites" ADD COLUMN     "promptHash" VARCHAR(64);

-- CreateIndex
CREATE INDEX "ai_sites_promptHash_idx" ON "public"."ai_sites"("promptHash");
