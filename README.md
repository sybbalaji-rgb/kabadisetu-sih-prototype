# KabadiSetu

**SIH 2026 Prototype · Problem Statement SIH26229**

KabadiSetu is a multilingual, voice-first digital bridge between informal e-waste collectors (kabadiwalas) and authorized recyclers. The prototype focuses on fair pricing, trusted handover, traceability, and low-literacy accessibility.

## Live prototype

https://kabadi-setu-sih.sybbalaji.chatgpt.site

## Key features

- Collector and recycler dashboards
- Photo-assisted material identification flow
- Transparent indicative price range
- Nearby authorized recycler matching
- **FairLock** — records the agreed price before pickup to reduce disputes
- **Cluster Pickup** — combines nearby small lots so pickup becomes economical
- Offline lot saving and later sync
- 12 major Indian languages
- Global voice assistant and voice navigation
- Digital handover and payment-status records

## Run locally

### Requirements

- Node.js 22.13 or newer
- npm

### Setup

```bash
npm install
npm run dev
```

Open the local URL printed by the development server.

## Important prototype note

This is a hackathon prototype. Recycler listings, market rates, offers, pickup status, AI classification, GPS, and payments currently use simulated/demo data. Production deployment would require verified recycler data, live pricing sources, secure authentication, real backend storage, and service integrations.

## Tech stack

- React + TypeScript
- Vinext / Vite
- Tailwind CSS
- shadcn/ui components

## Team goal

Make formal e-waste recycling more accessible and economically attractive for small informal collectors while improving transparency and traceability.
