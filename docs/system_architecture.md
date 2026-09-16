# KabadiSetu: System Architecture & Technical Specifications
### Smart India Hackathon 2026 | Problem Statement: SIH26229

---

## 1. High-Level Architecture Overview

KabadiSetu is designed as a distributed, high-availability, multi-tenant platform architected around microservices and event-driven patterns.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|  +---------------------------+  +---------------------------+  +---------------+  |
|  | Informal Collector Portal |  | Authorized Recycler Hub   |  | JNARDDC Admin |  |
|  | - Camera / AI Scanner     |  | - Marketplace & Bidding   |  | - KYC Verify  |  |
|  | - FairLock Tracker        |  | - Pickup Route Dispatch   |  | - Rate Matrix |  |
|  | - Multilingual Voice Nav  |  | - Handover Confirmation   |  | - EPR Audit   |  |
|  +---------------------------+  +---------------------------+  +---------------+  |
+-----------------------------------------|-----------------------------------------+
                                          | HTTPS / REST / WSS
+-----------------------------------------v-----------------------------------------+
|                              API GATEWAY & EDGE LAYER                             |
|  - TLS Termination & Rate Limiting                                                |
|  - Role-Based Access Control (RBAC): Collector | Recycler | Authority             |
|  - Multilingual Language Context Middleware (13 Indian Languages)                 |
+-----------------------------------------|-----------------------------------------+
                                          |
        +---------------------------------+---------------------------------+
        |                                 |                                 |
+-------v-------------------------+ +-----v-------------------------+ +-----v-------v-------+
|        AI VISION SERVICE        | |     CORE BUSINESS ENGINE      | | DIGITAL MATERIAL    |
| - Gemini 2.5/Flash Multimodal   | | - FairLock Price Guard        | | PASSPORT ENGINE     |
| - Heuristic Feature Classifier  | | - Smart Cluster Aggregator    | | - Event Sourcing    |
| - Component & Weight Estimation | | - Recycler Matching & Dispatch| | - QR Code Generator |
| - CPCB Material Standardizer    | | - JNARDDC Command Center      | | - EPR Audit Trail   |
+---------------------------------+ +-------------------------------+ +---------------------+
        |                                 |                                 |
+-------v---------------------------------v---------------------------------v-------+
|                                DATA & PERSISTENCE TIER                            |
|  - Relational Database (PostgreSQL / SQLite D1) for ACID transaction integrity    |
|  - Object Storage (Cloudflare R2 / S3) for high-res scrap verification imagery    |
|  - In-Memory Cache for ultra-low latency real-time market rate lookups            |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Functional Modules

### 2.1 AI Vision & Classification Engine
- **Input:** Multi-format image payload (`image/jpeg`, `image/png`, `image/webp`).
- **Processing:**
  1. Base64 serialization and client-side canvas compression.
  2. Gemini Multimodal API invocation with strict JSON schema response mode (`responseMimeType: "application/json"`).
  3. Failover resilience: Automatic fallback pool (`gemini-flash-latest` -> `gemini-flash-lite-latest`).
  4. Heuristic material normalizer mapping detection tokens to statutory CPCB codes.
- **Output:** Categorized scrap object, confidence percentage (50-99%), condition assessment, breakdown of visible subcomponents, suggested weight in kg, and chemical handling safety tips.

### 2.2 FairLock Price Negotiation Engine
- **Problem Solved:** Arbitrary on-site deductions by scrap aggregators.
- **Mechanism:**
  - Upon lot creation, system looks up current JNARDDC reference range:
    $$\text{Rate}_{\text{effective}} = \text{Rate}_{\text{baseline}} \times \text{Factor}_{\text{condition}}$$
    $$\text{where } \text{Factor}_{\text{Sorted}} = 1.0, \quad \text{Factor}_{\text{Mixed}} = 0.9, \quad \text{Factor}_{\text{Damaged}} = 0.8$$
  - When recycler claims a lot, the rate is locked for 7 days (`valid_until`).
  - Handover protocol enforces collector confirmation if weighed rate differs.

### 2.3 Smart Cluster Logistics Aggregator
- **Problem Solved:** High transportation overhead for low-volume scrap (<20 kg).
- **Mechanism:**
  - Aggregates informal lots within a geographic centroid into unified clusters.
  - Recyclers submit one consolidated pickup dispatch.
  - Collectors receive bulk transport bonuses from saved logistics costs.

### 2.4 Digital Material Passport (EPR Traceability)
- Every completed handover generates an immutable Digital Material Passport (`DMP-XXXX`).
- Logs cryptographic chain-of-custody:
  - Source collector metadata & location.
  - High-resolution visual proof & AI verification confidence.
  - Authorized recycler license number & GST credentials.
  - Final verified weight, payout receipt, and CPCB category.

---

## 3. Security, Privacy & Compliance
- **Zero Sensitive Credential Exposure:** Backend-only AI vision key handling.
- **CPCB / EPR Regulatory Compliance:** Adheres to E-Waste (Management) Rules, 2022.
- **Inclusive Accessibility:** Low-bandwidth PWA architecture, voice navigation across 13 Indian languages (Hindi, Marathi, Tamil, Telugu, Kannada, Malayalam, Bengali, Gujarati, Punjabi, Odia, Assamese, Urdu, English).
