# KabadiSetu: REST API Documentation
### Version: 1.0.0 | Smart India Hackathon 2026

Base URL: `/api`

---

## 1. Authentication & Profile Management

### `POST /api/platform` (action: `register`)
Registers or authenticates a user under one of three supported roles: `collector`, `recycler`, `authority`.

**Request Body:**
```json
{
  "action": "register",
  "role": "collector",
  "displayName": "Ravi Kumar",
  "contact": "+919876543210",
  "serviceArea": "Pimpri, Pune",
  "authorizationId": null
}
```

**Response (200 OK):**
```json
{
  "profile": {
    "id": "COL-A1B2C3D4",
    "role": "collector",
    "displayName": "Ravi Kumar",
    "contact": "+919876543210",
    "authorizationId": null,
    "serviceArea": "Pimpri, Pune",
    "verified": false
  }
}
```

---

## 2. AI Scrap Scanner API

### `POST /api/scan`
Accepts a physical scrap photo and performs multimodal vision inference.

**Headers:** `Content-Type: multipart/form-data`

**Request Payload:**
- `image`: File (JPG, PNG, or WEBP, max 10 MB)

**Response (200 OK):**
```json
{
  "object": "Computer Mouse",
  "category": "Computer Peripherals / Small IT Equipment",
  "material": "plastics",
  "confidence": 95,
  "condition": "Sorted",
  "components": [
    "Rigid ABS plastic shell",
    "Internal FR-4 circuit board",
    "Copper USB cable",
    "Optical sensor"
  ],
  "suggestedWeight": 0.15,
  "explanation": "High-impact ABS polymer casing with populated internal sensor circuit board.",
  "safetyTip": "Separate external plastic shell from internal PCB for maximum recovery value.",
  "imageKey": "uploads/2026-09-16/uuid-mouse.jpg",
  "lowConfidence": false
}
```

---

## 3. Scrap Lots & Marketplace

### `POST /api/platform` (action: `createLot`)
Creates a new scrap lot listing published to registered recyclers.

**Request Body:**
```json
{
  "action": "createLot",
  "profileId": "COL-A1B2C3D4",
  "material": "cables",
  "weight": 8.5,
  "condition": "Sorted",
  "location": "Pimpri, Pune",
  "imageName": "cables.jpg",
  "imageKey": "uploads/...",
  "aiConfidence": 92
}
```

---

## 4. FairLock Price Protection

### `POST /api/platform` (action: `fairlock`)
Locks a guaranteed unit rate between a collector and an authorized recycler.

**Request Body:**
```json
{
  "action": "fairlock",
  "profileId": "REC-E5F6G7H8",
  "lotId": "LOT-1029",
  "lockedRate": 92.0,
  "pickupDate": "2026-09-20"
}
```

---

## 5. Smart Cluster Logistics

### `POST /api/platform` (action: `joinCluster`)
Joins nearby micro-lots into a consolidated logistics cluster.

**Request Body:**
```json
{
  "action": "joinCluster",
  "profileId": "COL-A1B2C3D4",
  "lotId": "LOT-1029"
}
```

---

## 6. Digital Material Passport & Handover

### `POST /api/platform` (action: `completeHandover`)
Finalizes on-site physical verification, generating the Digital Material Passport.

**Request Body:**
```json
{
  "action": "completeHandover",
  "profileId": "REC-E5F6G7H8",
  "lotId": "LOT-1029",
  "finalWeight": 8.6,
  "finalRate": 92.0,
  "paymentStatus": "paid",
  "collectorApproved": true,
  "priceChangeReason": null
}
```

**Response (200 OK):**
```json
{
  "lot": {
    "id": "LOT-1029",
    "passportId": "DMP-9942",
    "handoverCode": "KBS-3819",
    "status": "completed",
    "finalWeight": 8.6,
    "finalRate": 92.0,
    "paymentStatus": "paid"
  }
}
```

---

## 7. JNARDDC Command Center

### `POST /api/platform` (action: `verifyRecycler`)
Authority action to approve or suspend recycler licenses.

**Request Body:**
```json
{
  "action": "verifyRecycler",
  "profileId": "AUT-JNARDDC",
  "recyclerId": "REC-E5F6G7H8",
  "verified": true
}
```

### `POST /api/platform` (action: `updatePrice`)
Updates regulatory benchmark price ranges for a material.

**Request Body:**
```json
{
  "action": "updatePrice",
  "profileId": "AUT-JNARDDC",
  "material": "cables",
  "low": 82.0,
  "high": 98.0
}
```
