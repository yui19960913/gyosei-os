-- CreateTable
CREATE TABLE "public"."ai_sites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR(100) NOT NULL,
    "firmName" VARCHAR(200) NOT NULL,
    "prefecture" VARCHAR(20) NOT NULL,
    "services" TEXT[],
    "strengths" TEXT NOT NULL,
    "targetClients" TEXT,
    "styles" TEXT[],
    "siteContent" JSONB NOT NULL DEFAULT '{}',
    "seoKeywords" JSONB NOT NULL DEFAULT '[]',
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "autoReply" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ai_sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_site_leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "siteId" UUID NOT NULL,
    "name" VARCHAR(100),
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "message" TEXT,
    "utmSource" VARCHAR(100),
    "utmMedium" VARCHAR(100),
    "utmCampaign" VARCHAR(200),
    "referrerUrl" TEXT,
    "autoReplySent" BOOLEAN NOT NULL DEFAULT false,
    "autoReplyAt" TIMESTAMPTZ(6),
    "autoReplyText" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_site_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_seo_pages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "siteId" UUID NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "keyword" VARCHAR(200) NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ai_seo_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_sites_slug_key" ON "public"."ai_sites"("slug");

-- CreateIndex
CREATE INDEX "ai_sites_status_idx" ON "public"."ai_sites"("status");

-- CreateIndex
CREATE INDEX "ai_site_leads_siteId_idx" ON "public"."ai_site_leads"("siteId");

-- CreateIndex
CREATE INDEX "ai_site_leads_createdAt_idx" ON "public"."ai_site_leads"("createdAt");

-- CreateIndex
CREATE INDEX "ai_seo_pages_siteId_idx" ON "public"."ai_seo_pages"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_seo_pages_siteId_slug_key" ON "public"."ai_seo_pages"("siteId", "slug");

-- AddForeignKey
ALTER TABLE "public"."ai_site_leads" ADD CONSTRAINT "ai_site_leads_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."ai_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_seo_pages" ADD CONSTRAINT "ai_seo_pages_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "public"."ai_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
