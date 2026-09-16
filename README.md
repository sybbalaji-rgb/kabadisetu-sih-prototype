# KabadiSetu
### Smart India Hackathon 2026 | Problem Statement ID: SIH26229
**Kabadiwala Connect — Bringing the Informal Collector into the Formal Recycling Chain**

Live Prototype: [https://kabadisetu-sih-prototype-nine.vercel.app/](https://kabadisetu-sih-prototype-nine.vercel.app/)

---

## 🌟 Executive Overview
**KabadiSetu** is an inclusive digital platform designed to formally integrate India's informal waste collectors (*kabadiwalas*) into the authorized e-waste and scrap recycling ecosystem. By combining multimodal edge AI vision, cryptographic price-locking (FairLock), cooperative logistics clustering, and digital material passports (DMP), KabadiSetu transforms informal scrap gathering into verified, auditable, and remunerative supply chains aligned with CPCB and JNARDDC standards.

---

## 📁 Repository & Folder Architecture

```text
KabadiSetu/
│
├── frontend/                     # Modular React/Vite Client
│   ├── public/                   # Static branding, logo, and icons
│   ├── src/
│   │   ├── components/           # Reusable Atomic UI (Navbar, Sidebar, Button, Card, Modal, Loading)
│   │   ├── pages/                # High-level Views (Collector, Recycler, Admin, Scanner, CreateLot)
│   │   ├── features/             # Domain Feature Modules
│   │   │   ├── auth/             # Multi-role authentication & session guards
│   │   │   ├── scrapScanner/     # AI camera viewfinder & scrap image analysis
│   │   │   ├── fairLock/         # Guaranteed pricing & 7-day rate lock protection
│   │   │   ├── smartCluster/     # Neighborhood scrap logistics pooling
│   │   │   ├── materialPassport/ # Traceable EPR passports with QR verification
│   │   │   └── commandCenter/    # JNARDDC regulatory oversight & KYC portal
│   │   ├── services/             # API & Authentication client integrations
│   │   ├── utils/                # Styling and formatting utility helpers
│   │   ├── App.jsx               # Main React application router
│   │   └── main.jsx              # Client entrypoint
│   ├── package.json              # Client dependencies
│   └── vite.config.js            # Vite build & proxy configuration
│
├── backend/                      # Scalable FastAPI Microservice
│   ├── app/
│   │   ├── main.py               # FastAPI application entrypoint & middleware
│   │   ├── config.py             # App settings, environment variables & demo keys
│   │   ├── database.py           # SQLAlchemy database session & engine
│   │   ├── models/               # Relational ORM models (user, scrap, recycler, transaction, passport)
│   │   ├── schemas/              # Pydantic validation schemas
│   │   ├── routes/               # API endpoints (auth, scrap, recycler, pickup, transaction)
│   │   └── services/             # Business logic (ai_scanner, price_engine, matching, cluster_pickup)
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile                # Containerized backend deployment
│   └── .env.example              # Environment variables template
│
├── ai_model/                     # Dedicated AI & Computer Vision Module
│   ├── scrap_classifier.py       # Standalone Python inference script (Gemini Vision + edge fallback)
│   ├── dataset/                  # CPCB e-waste taxonomy and dataset guide
│   ├── model/                    # Model architecture & MobileNet ONNX specifications
│   └── README.md                 # AI vision documentation & benchmarks
│
├── database/                     # Standalone SQL Schemas & Migrations
│   ├── schema.sql                # Complete ANSI SQL DDL schema (PostgreSQL / SQLite)
│   ├── seed_data.sql             # Real-world JNARDDC price matrix & verified recyclers
│   └── migrations/               # Versioned migration scripts
│
├── docs/                         # Comprehensive Hackathon Documentation
│   ├── problem_statement.md      # SIH26229 problem definition & objectives
│   ├── system_architecture.md    # End-to-end technical system architecture
│   ├── api_documentation.md      # REST API specifications and contracts
│   └── project_report.md         # Full project report and impact assessment
│
├── docker-compose.yml            # Multi-service container orchestration
├── app/                          # Maintained Next.js App Router live deployment (Vercel-ready)
├── components/                   # Shadcn / Tailwind UI component library
└── package.json                  # Root monorepo & Next.js production build runner
```

---

## 🚀 The 5 Core SIH Modules

1. **AI Scrap Scanner:** Multimodal visual identification of e-waste using Google Gemini Vision API. Accurately maps physical photos into the 6 statutory CPCB categories (`cables`, `batteries`, `pcb`, `panels`, `motors`, `plastics`).
2. **FairLock Price Protection:** Cryptographically guarantees agreed rates for a 7-day fulfillment window, eliminating exploitative on-site deductions.
3. **Smart Cluster Pickup:** Aggregates neighborhood micro-lots (<20 kg) into consolidated bulk shipments (>100 kg) to slash transport emissions and unlock higher rates.
4. **Digital Material Passport (DMP):** Supplies end-to-end traceability with tamper-evident audit logs (`EVT-XXXX`) and verification codes (`KBS-XXXX`) for formal EPR compliance.
5. **JNARDDC Command Center:** Regulatory control panel enabling authorities to accredit recyclers, monitor scrap flows, and adjust statutory reference rates.

---

## 🛠️ Quick Start & Running Instructions

### Option 1: Live Next.js Web App (Current Production)
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build production bundle
npm run build
```

### Option 2: Run Full-Stack with Docker Compose
```bash
# Set your Gemini API key in .env
export GEMINI_API_KEY="your_gemini_api_key_here"

# Spin up backend, frontend, and database
docker-compose up --build
```
- **Frontend:** `http://localhost:5173`
- **Backend API Docs (Swagger):** `http://localhost:8000/docs`

### Option 3: Run Backend Independently
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Option 4: Run Frontend Independently
```bash
cd frontend
npm install
npm run dev
```

### Option 5: Run AI Classifier Script Standalone
```bash
cd ai_model
python scrap_classifier.py path/to/scrap_photo.jpg
```
