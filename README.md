# Texas Industrial CRM

Property-centric CRE operating system for industrial assets. Built on Next.js 14, PostgreSQL, and Prisma.

## Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Database:** PostgreSQL (Prisma ORM)
- **Styling:** CSS custom properties (design tokens) + Tailwind utilities
- **Auth:** NextAuth.js
- **Hosting:** Railway (recommended)

## Project Structure

```
src/
  app/
    (dashboard)/
      properties/[id]/    ← Property page (full rent roll, investment analysis)
      deals/              ← Deals pipeline
      contacts/           ← Contact directory
      comps/              ← Lease comps
    globals.css           ← All design tokens + component styles
  components/
    layout/Sidebar.tsx    ← Left nav
```
