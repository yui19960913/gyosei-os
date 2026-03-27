# webseisei.com

行政書士事務所向けのAI集客プラットフォーム。サイト自動生成から既存サイトの改善まで。

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router, TypeScript strict) |
| Database | PostgreSQL ([Neon](https://neon.tech/) serverless) + [Prisma](https://www.prisma.io/) ORM |
| Auth (user) | Custom HMAC-SHA256 JWT (magic link, passwordless) |
| Auth (admin) | NextAuth.js v5 + Credentials (bcryptjs) |
| AI | Anthropic Claude (`claude-haiku-4-5-20251001`) |
| Email | [Resend](https://resend.com/) |
| Payment | [Stripe](https://stripe.com/) (Subscription + one-time) |
| Styling | Tailwind CSS v4 |
| Deploy | [Vercel](https://vercel.com/) (serverless, maxDuration=60) |

## Domain Structure

```
webseisei.com            → LP / onboarding
app.webseisei.com        → User dashboard (magic link auth)
admin.webseisei.com      → Admin panel (password auth)
{slug}.webseisei.com     → Published client sites
```

Subdomain routing: `src/middleware.ts`

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Sync database schema
npx prisma db push

# Start dev server
npm run dev
```

## Scripts

```bash
npm run dev      # Dev server (localhost:3000)
npm run build    # prisma generate && next build
npm run lint     # ESLint
```

## Project Structure

```
src/
  middleware.ts           # Subdomain routing
  auth.ts                # NextAuth.js (admin)
  app/
    page.tsx              # LP
    [slug]/page.tsx       # Published sites
    onboard/              # Onboarding wizard → AI generation → preview
    dashboard/[slug]/     # User dashboard
    admin/                # Admin panel
    api/                  # API routes
  components/             # React components
  lib/
    prisma.ts             # Prisma singleton
    session.ts            # HMAC-SHA256 session
    urls.ts               # URL helpers
    ai-site/generator.ts  # Claude API (single entry point)
prisma/schema.prisma      # DB schema
```
