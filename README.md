# KabadiSetu (कबाड़ी सेतु)
### Smart India Hackathon 2026 | Problem Statement ID: SIH26229
**Kabadiwala Connect — Bringing the Informal Collector into the Formal Recycling Chain**

- **Live Prototype:** [https://kabadisetu-sih-prototype-nine.vercel.app/](https://kabadisetu-sih-prototype-nine.vercel.app/)
- **Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Cloudflare D1 / SQLite, Google Gemini Vision API

---

## 📑 Table of Contents
1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [End-to-End System Workflow](#2-end-to-end-system-workflow)
3. [Four Connected Workspaces](#3-four-connected-workspaces)
4. [Algorithms & Mathematical Formulations](#4-algorithms--mathematical-formulations)
5. [Database Architecture & Schema](#5-database-architecture--schema)
6. [APIs, Keys & Environment Variables](#6-apis-keys--environment-variables)
7. [Repository File Organization](#7-repository-file-organization)
8. [Security, Fraud Prevention & Future Roadmap](#8-security-fraud-prevention--future-roadmap)
9. [Local Setup & Development](#9-local-setup--development)

---

## 1. Executive Summary & Problem Statement

### The Problem:
- **3.2+ Million Tonnes** of e-waste is generated in India annually.
- **95% of e-waste recycling** is managed by unorganized informal collectors (*kabadiwalas*) with zero price transparency, dangerous handling methods, and no formal traceability.
- **CPCB / JNARDDC** lack verifiable digital custody records to track e-waste from source to authorized smelting.
- **Citizens** lack a simple, verified channel to hand over domestic scrap directly into authorized supply chains.

### The Solution:
**KabadiSetu** provides an end-to-end digital exchange and logistics bridge connecting **Citizens**, **Informal Collectors**, **Authorized Recyclers**, and **Statutory Authorities (JNARDDC)** through a single, verifiable edge data layer.

---

## 2. End-to-End System Workflow

```text
[Citizen Schedules Pickup] 
           │
           ▼
[Recycler Workspace] ──────────> Clusters by Area, Pin & Slot ──> Assigns Collection Plan
                                                                          │
                                                                          ▼
                                                            [Collector Workspace]
                                                        (Navigates, Collects & AI Scans)
                                                                          │
                                                                          ▼
                                                            [Physical Recycler Handover]
                                                           (Digital Scale + FairLock Rate)
                                                                          │
                                                                          ▼
                                                            [Digital Passport Generated]
                                                                          │
                                                                          ▼
                                                            [JNARDDC National Audit Trail]
```

---

## 3. Four Connected Workspaces

### 1. Public Citizen Portal (Intake & Tracking)
- **Schedule a Scrap Pickup:** Responsive public form with validation for city, address, category, date, and preferred slot.
- **Instant Digital Receipt:** Generates an immediate booking confirmation card with a unique `Request ID` and printable PDF layout.
- **Track My Pickup:** Phone-number / Request-ID lookup allowing citizens to watch their collection progress in real time (*Pending ➔ Assigned ➔ In Progress ➔ Collected*).

### 2. Collector Workspace (Field Agents & Kabadiwalas)
- **Multimodal AI Scanner:** Instant material classification via Google Gemini Flash Vision API.
- **FairPrice Board:** Live regulatory benchmark rates per kg across 6 statutory e-waste streams.
- **Voice-First Navigation:** 12 Indian languages supported via Web Speech API (Speech Recognition + SpeechSynthesis) for non-literate workers.
- **Assigned Collection Tasks:** View and update assigned neighborhood pickup routes.

### 3. Recycler Workspace (Authorized E-Waste Processors)
- **Open Network Lots:** Browse and bid on aggregate scrap lots posted by verified collectors.
- **FairLock™ Guarantee:** Locks an agreed price per kg for 24 hours to eliminate on-site rate disputes.
- **Area-Wise Collection Planning:** Algorithmic clustering of citizen requests into batch plans assigned directly to collectors.
- **Physical Scale Verification:** Weighing reconciliation with mandatory variance logging before issuing payment.

### 4. JNARDDC Authority Command Center
- **National Telemetry:** Live dashboards tracking e-waste volumes by material category and geographic territory.
- **Recycler Accreditation:** Verify, audit, or suspend recycler operating licenses.
- **Digital E-Waste Passports (DMP):** Immutable tamper-evident lifecycle records with QR code verification for statutory EPR compliance.
- **Benchmark Pricing Control:** Set minimum and maximum benchmark scrap rates to prevent market volatility.

---

## 4. Algorithms & Mathematical Formulations

| # | Algorithm | Implementation File | Mathematical / Logical Formulation |
|---|---|---|---|
| **1** | **Spatio-Temporal Clustering** | `app/pickup-manager.tsx`<br>`app/api/platform/route.ts` | **Aggregates micro-pickups into route batches:**<br>`ClusterKey = City ⊕ PinCode ⊕ PickupDate ⊕ TimeSlot`<br>`Batch = { req ∈ PickupRequests | req.key == ClusterKey ∧ req.status == 'pending' }` |
| **2** | **Multi-Modal Vision Classification** | `app/api/scan/route.ts` | **Image-to-Taxonomy Normalization:**<br>`Category = argmax(GeminiVision(ImageBytes))`<br>`Confidence ∈ [0.0, 1.0]; Class ∈ {cables, batteries, pcb, panels, motors, plastics}` |
| **3** | **FairLock™ Temporal Price Guarantee** | `app/api/platform/route.ts` | **24-Hour Price Floor / Ceiling Commitment:**<br>`validUntil = Timestamp_now + 86,400,000 ms`<br>`Constraint: Benchmark.lowRate ≤ LockedRate ≤ Benchmark.highRate` |
| **4** | **Scrap Valuation Engine** | `app/kabadi-app.tsx` | **Expected Lot Value Estimation:**<br>`Valuation_min = Weight_kg × Benchmark.lowRate`<br>`Valuation_max = Weight_kg × Benchmark.highRate` |
| **5** | **Scale Discrepancy & Fraud Detection** | `app/api/platform/route.ts`<br>`app/kabadi-app.tsx` | **Handover Weight Variance Enforcement:**<br>`Δ_weight = |Weight_estimated - Weight_actual|`<br>`If (Δ_weight > Threshold) ➔ Trigger Mandatory Reason & Recalculate` |
| **6** | **Fuzzy Voice Token Matcher** | `app/voice-assistant.tsx` | **Multilingual Command Lexicon Matching:**<br>`Command = { c ∈ Lexicon[lang] | Tokenize(SpokenText) ∩ Tokens(c) ≠ ∅ }` |
| **7** | **Collision-Resistant ID Generator** | `app/api/platform/route.ts` | **Unique Business Identity Generation:**<br>`ID = Prefix + "_" + Hex(Timestamp_ms) + Hex(Random_Bytes)` |

---

## 5. Database Architecture & Schema

Built with **Drizzle ORM** on **Cloudflare D1 (Distributed SQLite at Edge)** with an in-memory edge fallback engine.

```
                    ┌─────────────────────────┐
                    │        profiles         │
                    ├─────────────────────────┤
                    │ id (PK)                 │
                    │ role, contact, area     │
                    └───────────┬─────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│       lots        │ │  pickup_requests  │ │ collection_plans  │
├───────────────────┤ ├───────────────────┤ ├───────────────────┤
│ id (PK)           │ │ id (PK)           │ │ id (PK)           │
│ collector_id (FK) │ │ full_name, mobile │ │ recycler_id (FK)  │
│ material, weight  │ │ address, pin_code │ │ collector_id (FK) │
│ fairlock_id, rate │ │ plan_id (FK)      │ │ area, pickup_date │
│ status, passport  │ │ status            │ │ status            │
└─────────┬─────────┘ └───────────────────┘ └───────────────────┘
          │
          ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│  passport_events  │ │  material_prices  │ │  support_records  │
├───────────────────┤ ├───────────────────┤ ├───────────────────┤
│ id (PK)           │ │ material (PK)     │ │ id (PK)           │
│ passport_id (FK)  │ │ low_rate          │ │ profile_id (FK)   │
│ event_type, actor │ │ high_rate         │ │ message, rating   │
│ timestamp         │ │ updated_by        │ │ status            │
└───────────────────┘ └───────────────────┘ └───────────────────┘
```

---

## 6. APIs, Keys & Environment Variables

| Variable | Scope | Description |
|---|---|---|
| `GEMINI_API_KEY` | Server (`/api/scan`) | Google Gemini Flash Vision API key for scrap image analysis. *(Includes built-in prototype fallback key).* |
| `GEMINI_MODEL` | Server (`/api/scan`) | Model identifier (defaults to `gemini-flash-latest`). |
| `AUTHORITY_ACCESS_CODE` | Server (`/api/platform`) | Master administrative code for JNARDDC authority login (`JNARDDC-ADMIN`). |
| `NEXT_PUBLIC_SUPABASE_URL` | Client (`role-login.tsx`) | Optional Supabase authentication endpoint. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client (`role-login.tsx`) | Optional Supabase anonymous client key. |

---

## 7. Repository File Organization

```text
kabadisetu-sih-prototype/
│
├── app/
│   ├── api/
│   │   ├── platform/route.ts       # Central Edge API (Lots, Pickups, Handovers, Passports)
│   │   └── scan/route.ts           # Computer Vision Endpoint (Gemini Flash API)
│   │
│   ├── collector-tasks.tsx         # Collector Dashboard: Assigned community pickups & status controls
│   ├── pickup-manager.tsx          # Recycler Dashboard: Area-wise collection planning & dispatch
│   ├── public-pickup-form.tsx      # Citizen Portal: Booking form & digital receipt generator
│   ├── public-pickup-tracker.tsx   # Citizen Portal: Real-time pickup status tracking modal
│   ├── role-login.tsx              # Authentication hero page, demo switchers & language picker
│   ├── kabadi-app.tsx              # Main application shell housing all 3 interactive dashboards
│   ├── voice-assistant.tsx         # Web Speech API voice assistant (12 Indian languages)
│   ├── layout.tsx & page.tsx       # Next.js app entry & metadata definition
│   └── globals.css                 # Master Tailwind styles & color tokens
│
├── db/
│   ├── schema.ts                   # Drizzle ORM schema defining all database tables & relations
│   └── index.ts                    # Cloudflare D1 connection wrapper
│
├── i18n/
│   ├── config.ts                   # i18next runtime initialization
│   └── locales/                    # Multilingual translation dictionaries (en, hi, ta, te, mr, etc.)
│
├── public/                         # PWA icons, manifest, and static graphics
├── next.config.ts                  # Next.js edge build configuration
└── package.json                    # Project dependencies & build scripts
```

---

## 8. Security, Fraud Prevention & Future Roadmap

1. **Escrow Wallet Guarantee (Phase 2):** Recyclers maintain a secured escrow balance to financially guarantee FairLock commitments upon arrival.
2. **True SMS OTP Verification:** Public pickup requests and user logins will integrate Fast2SMS/Twilio for carrier-level phone authentication.
3. **Vehicle Routing Problem (VRP) Engine:** Replacing string-based clustering with OSRM (Open Source Routing Machine) to compute fuel-optimal routes based on vehicle payload limits.
4. **On-Device Edge ML:** Deploying quantized MobileNet ONNX models directly into the browser service worker for instant offline scrap detection.

---

## 9. Local Setup & Development

```bash
# 1. Clone the repository
git clone https://github.com/sybbalaji-rgb/kabadisetu-sih-prototype.git
cd kabadisetu-sih-prototype

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:3000` in your browser.
