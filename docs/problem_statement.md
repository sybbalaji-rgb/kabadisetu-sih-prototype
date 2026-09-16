# Smart India Hackathon (SIH 2026)
## Problem Statement ID: SIH26229
### Title: Kabadiwala Connect — Bringing the Informal Collector into the Formal Recycling Chain

---

## 1. Context & Background
In India, over **80% of municipal and electronic waste collection** is driven by the informal sector: *kabadiwalas*, itinerant waste buyers, and small-scale scrap aggregators. Despite their vital role in the circular economy, informal collectors face systemic vulnerabilities:
- **Opaque & Volatile Pricing:** Middlemen depress purchase prices, leading to severe income insecurity.
- **Health & Safety Risks:** Informal dismantling of toxic scrap (e.g., lithium batteries, cathode ray tubes, burning PVC wires for copper) causes hazardous occupational exposure.
- **Lack of EPR Recognition:** Extended Producer Responsibility (EPR) regulations mandate formal recycling credits, but informal collections lack traceable provenance, excluding collectors from financial incentives.
- **Logistical Inefficiencies:** Fragmented, low-volume scrap lots increase transportation costs and prevent direct sales to authorized registered recyclers.

---

## 2. Objective of KabadiSetu
**KabadiSetu** bridges the informal collector network with authorized, CPCB-registered recycling facilities and JNARDDC research benchmarks. The system introduces digital traceability, fair pricing protection, and AI-assisted material identification.

---

## 3. Core Pillars & Value Propositions

### Pillar 1: AI Scrap Scanner
- Multimodal computer vision model powered by Gemini Vision and edge deep learning heuristics.
- Real-time classification of e-waste scrap into statutory CPCB categories:
  1. **Copper Cables & Wiring** (`cables`)
  2. **Portable & Secondary Batteries** (`batteries`)
  3. **High-Grade Printed Circuit Boards** (`pcb`)
  4. **Screens, Displays & Panels** (`panels`)
  5. **Electric Motors, Windings & Inductors** (`motors`)
  6. **Mixed High-Impact E-Plastics** (`plastics`)
- Automatic extraction of recoverable components, approximate weight estimation, and item-specific safety advisories.

### Pillar 2: FairLock Price Protection
- Eliminates predatory price cutting during physical scrap collection.
- Displays real-time JNARDDC baseline reference rates updated by regulatory authorities.
- Cryptographically locks negotiated purchase rates for a guaranteed 7-day fulfillment window (`validUntil`).
- Requires mandatory documented justifications (`priceChangeReason`) and collector consent if final handover rates deviate.

### Pillar 3: Smart Cluster Pickup
- Geospatial aggregation algorithm grouping multiple nearby micro-lots (< 20 kg) into consolidated bulk shipments (> 100 kg).
- Optimizes recycler transport routes, saving fuel and cutting carbon emissions.
- Unlocks higher bulk pricing tiers for participating informal collectors.

### Pillar 4: Digital Material Passport (DMP)
- End-to-end chain-of-custody audit trail compliant with Ministry of Environment, Forest and Climate Change (MoEFCC) EPR rules.
- Immutable event records:
  - Lot creation and AI verification timestamp.
  - Recycler matching and FairLock confirmation.
  - Physical inspection, weighing, and digital handover code (`KBS-XXXX`).
  - Traceable Passport ID (`DMP-XXXX`) linked to formal EPR credit certificates.

### Pillar 5: JNARDDC Command Center
- Comprehensive regulatory oversight portal for JNARDDC and CPCB authorities.
- Real-time monitoring of scrap transactions, material flows, and regional collection densities.
- Verification and accreditation workflow for formal e-waste recyclers.
- Dynamic market reference price management across Indian recycling hubs.
