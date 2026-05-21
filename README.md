# CodeAlpha CloudTransit

A modern, robust Cloud Bus Pass System developed for the CodeAlpha internship. CloudTransit is a comprehensive Full-Stack application featuring real-time transit disruption monitoring, digital QR-based ticketing, and conductor control dashboards.

## 🚀 Features
- **Commuter Portal**: Seamless pass generation with dynamic real-time alerts.
- **Ticket Checker**: Dedicated portal for conductors to quickly scan and verify commuter JWT tickets.
- **Control Tower**: Live disruption dashboard to instantly broadcast "Operational", "Delayed", or "Cancelled" statuses across the entire system.
- **Scalable Architecture**: Dockerized Node.js/Express backend ready for Cloud Run, paired with a React Vite frontend.

## 🛠️ Technology Stack
- **Frontend**: React.js, Vite, TailwindCSS (Lucide Icons)
- **Backend**: Node.js, Express.js, Firebase/Firestore
- **Deployment**: Google Cloud Run, Firebase Hosting, Docker

## 📖 Deployment Guide
A full production deployment guide is available in [GCP_DEPLOYMENT_GUIDE.md](./GCP_DEPLOYMENT_GUIDE.md).

## 🏃 Local Development
To run this project locally:

1. **Install dependencies**:
   ```bash
   npm install
   cd frontend && npm install
   ```

2. **Start the backend server**:
   ```bash
   npm run dev
   ```

3. **Start the frontend application**:
   ```bash
   cd frontend
   npm run dev
   ```

Enjoy building and monitoring with CloudTransit!
