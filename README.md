# Restaurant Operations System

Greenfield `TypeScript + React + Vite` application for multi-business restaurant operations, profitability tracking, menu engineering, inventory oversight, and executive rollups.

## Included now

- Seeded demo businesses for `Ginger Cafe` and `Coco Cabana`
- Local-first persistence with `localStorage` so the app runs without Supabase for now
- Mobile-optimized shell, cards, forms, and scrollable tables
- Vercel deployment configuration for the Vite SPA
- Supabase schema scaffolding kept in place for the later database cutover

## Stack

- React 18 + TypeScript + Vite
- Framer Motion for interface motion
- Recharts for analytics displays
- Supabase client scaffolding for auth and data persistence

## Getting started

1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env` and set Supabase values if available
3. Run `npm run dev`
4. Deploy to Vercel with the included `vercel.json`, or connect the repo directly in Vercel and use the default Vite build settings

The UI now boots from local cache first, seeds itself automatically when no cache exists, and can be reset back to the default Ginger Cafe / Coco Cabana demo data from the sidebar.
