# CloudTransit 🚌

A cloud-native municipal transit ticketing and lifecycle management engine built on GCP's Always Free Tier.

## The Problem
Mumbai has 88 lakh daily bus commuters — yet boarding still means paper tickets, manual verification, and zero real-time route visibility.

CloudTransit solves all three.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | Node.js (Express) |
| Database | Google Cloud Firestore |
| Deployment | Google Cloud Run + Firebase Hosting |
| Security | GCP Secret Manager + RS256 JWTs |
| Containerization | Docker (Alpine multi-stage) |

---

## Architecture

3-Tier decoupled architecture running entirely on GCP Free Tier ($0/month):

```
React SPA (Firebase Hosting)
        ↓
Node.js REST API (Cloud Run — scale to zero)
        ↓
Cloud Firestore (Native Mode)
        ↓
GCP Secret Manager (RSA key vault)
```

---

## Key Engineering Features

### 🔐 RS256 Asymmetric Cryptography
Every ticket is signed with an RSA-2048 private key stored in GCP Secret Manager. Conductors verify tickets using only the public key — zero network calls at the boarding door, zero bottlenecks.

### ⚡ Race Condition Prevention
Seat booking runs inside a strict `db.runTransaction` block — read-before-write rule enforced atomically. Two passengers cannot book the last seat simultaneously. Firestore rolls back conflicts automatically.

### 🚨 Live Disruption Broadcasts
When a route is cancelled or delayed, the Control Tower broadcasts the status update instantly. Every active passenger's UI freezes the booking button in real time — before a single rupee is spent on an invalid pass.

### 🧪 Zero-Dependency Test Suite
Local integration tests built with Node.js native Fetch API — no Axios, no bloat. Runs against Firestore Emulator (`localhost:8080`) with zero GCP authentication required locally.

---

## Role Isolation (RBAC)

Three fully isolated user environments:

| Role | Interface | Capability |
|---|---|---|
| Passenger | Commuter Portal | Book passes, view QR tickets, receive disruption alerts |
| Conductor | Ticket Checker | Scan & verify RS256 signed QR codes offline |
| Dispatcher | Control Tower | Broadcast route status, manage disruptions city-wide |

---

## Local Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/cloudtransit
cd cloudtransit

# Install dependencies
npm install

# Start Firestore emulator
firebase emulators:start --only firestore

# Run test suite
node test-suite.js

# Start backend
npm run dev
```

> For production deployment, configure GCP Secret Manager with your RSA key pair and set environment variables accordingly.

---

## Environment Variables

```env
GCP_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

---

## What I Learned

Cloud deployment wasn't the hard part.

Designing for failure was — what happens when two requests collide at the exact same millisecond, when a key isn't available locally, when a route dies mid-booking. That's where real cloud engineering happens.
