-- CreateTable
CREATE TABLE "public"."clients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR(100) NOT NULL,
    "firmName" VARCHAR(200) NOT NULL,
    "ownerName" VARCHAR(100) NOT NULL,
    "prefecture" VARCHAR(20),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "monthlyFee" INTEGER NOT NULL,
    "contractStartedAt" DATE NOT NULL,
    "contractEndedAt" DATE,
    "prText" TEXT,
    "targetClients" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."practice_areas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "practice_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."landing_pages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientId" UUID NOT NULL,
    "practiceAreaId" UUID NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "content" JSONB NOT NULL DEFAULT '{}',
    "metaDescription" VARCHAR(500),
    "targetKeywords" TEXT[],
    "totalLeads" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "landing_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientId" UUID NOT NULL,
    "practiceAreaId" UUID NOT NULL,
    "landingPageId" UUID NOT NULL,
    "name" VARCHAR(100),
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "message" TEXT,
    "userKeyword" VARCHAR(300),
    "utmSource" VARCHAR(100),
    "utmMedium" VARCHAR(100),
    "utmCampaign" VARCHAR(200),
    "utmTerm" VARCHAR(300),
    "referrerUrl" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'new',
    "notifiedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientId" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "issuedAt" TIMESTAMPTZ(6),
    "dueDate" DATE,
    "paidAt" TIMESTAMPTZ(6),
    "pdfUrl" VARCHAR(500),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_generation_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientId" UUID NOT NULL,
    "landingPageId" UUID,
    "generationType" VARCHAR(50) NOT NULL,
    "promptSnapshot" TEXT NOT NULL,
    "output" TEXT,
    "modelName" VARCHAR(100) NOT NULL DEFAULT 'claude-sonnet-4-6',
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "costUsd" DECIMAL(10,6),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_generation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."monthly_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientId" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'generating',
    "stats" JSONB NOT NULL DEFAULT '{}',
    "aiSummary" TEXT,
    "aiSuggestions" TEXT,
    "reviewedSummary" TEXT,
    "reviewedSuggestions" TEXT,
    "pdfUrl" VARCHAR(500),
    "sentAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "monthly_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_slug_key" ON "public"."clients"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "practice_areas_slug_key" ON "public"."practice_areas"("slug");

-- CreateIndex
CREATE INDEX "landing_pages_clientId_idx" ON "public"."landing_pages"("clientId");

-- CreateIndex
CREATE INDEX "landing_pages_status_idx" ON "public"."landing_pages"("status");

-- CreateIndex
CREATE UNIQUE INDEX "landing_pages_clientId_practiceAreaId_key" ON "public"."landing_pages"("clientId", "practiceAreaId");

-- CreateIndex
CREATE INDEX "leads_clientId_idx" ON "public"."leads"("clientId");

-- CreateIndex
CREATE INDEX "leads_landingPageId_idx" ON "public"."leads"("landingPageId");

-- CreateIndex
CREATE INDEX "leads_practiceAreaId_idx" ON "public"."leads"("practiceAreaId");

-- CreateIndex
CREATE INDEX "leads_createdAt_idx" ON "public"."leads"("createdAt");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "public"."leads"("status");

-- CreateIndex
CREATE INDEX "invoices_clientId_idx" ON "public"."invoices"("clientId");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "public"."invoices"("status");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_clientId_year_month_key" ON "public"."invoices"("clientId", "year", "month");

-- CreateIndex
CREATE INDEX "ai_generation_logs_clientId_idx" ON "public"."ai_generation_logs"("clientId");

-- CreateIndex
CREATE INDEX "ai_generation_logs_createdAt_idx" ON "public"."ai_generation_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_reports_clientId_year_month_key" ON "public"."monthly_reports"("clientId", "year", "month");

-- AddForeignKey
ALTER TABLE "public"."landing_pages" ADD CONSTRAINT "landing_pages_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."landing_pages" ADD CONSTRAINT "landing_pages_practiceAreaId_fkey" FOREIGN KEY ("practiceAreaId") REFERENCES "public"."practice_areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_practiceAreaId_fkey" FOREIGN KEY ("practiceAreaId") REFERENCES "public"."practice_areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leads" ADD CONSTRAINT "leads_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "public"."landing_pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_generation_logs" ADD CONSTRAINT "ai_generation_logs_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ai_generation_logs" ADD CONSTRAINT "ai_generation_logs_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "public"."landing_pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monthly_reports" ADD CONSTRAINT "monthly_reports_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
