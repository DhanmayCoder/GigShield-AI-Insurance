# Workspace

## Overview

GigShield AI — a micro-insurance platform for food delivery workers (Swiggy/Zomato). Built as a pnpm workspace monorepo using TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Tailwind CSS, Lucide React, Framer Motion, TanStack React Query, Wouter

## Features

- **Onboarding**: User registration with Name, PAN Card (fraud prevention), Delivery ID, Zone
- **Insurance Plans**: Bronze (₹59), Silver (₹89), Gold (₹118) with different risk factor coverage
- **Live Risk Dashboard**: Circular risk gauge (SVG arc) with real-time simulated environment data
- **Risk Score Engine**:
  - Gold: 0.30×Rain + 0.20×Temp + 0.20×Pollution + 0.20×Traffic + 0.10×Strike
  - Silver: 0.375×Rain + 0.25×Temp + 0.25×Pollution + 0.125×Strike
  - Bronze: 0.60×Rain + 0.40×Temp
- **Payout Tiers**: None (<40), Small (40-60), Medium (60-80), Full (80-100)
- **Claims**: GPS zone verification (mock), 3-week cooling period, fraud protection via PAN card
- **Smart Wallet**: Balance tracking, interest calculation (4% p.a.), transaction history
- **Mobile-first UI**: Apple/Android style, blue & white fintech theme

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── gigshield/          # React + Vite frontend (GigShield AI app)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

## Database Schema

- **users**: id, name, pan_card (unique), delivery_id (unique), zone, plan, wallet_balance, total_saved, registered_at
- **claims**: id, claim_id (unique), delivery_id, risk_score, payout_amount, payout_tier, plan, status, created_at
- **wallet_transactions**: id, delivery_id, type (premium/payout/interest), amount, description, created_at

## API Routes

- `GET /api/risk/environment` — Simulated environmental data (rain, temp, pollution, traffic, strike)
- `POST /api/risk/score` — Calculate risk score for a given plan and environment data
- `POST /api/users` — Register new user
- `GET /api/users/:deliveryId` — Get user profile
- `PUT /api/users/:deliveryId/plan` — Update insurance plan
- `POST /api/claims` — Submit claim (with zone check + cooling period)
- `GET /api/claims/:deliveryId` — Get claims history
- `GET /api/wallet/:deliveryId` — Get wallet balance & transactions

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
