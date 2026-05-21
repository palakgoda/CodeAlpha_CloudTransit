# CloudTransit GCP Deployment Guide

This manual outlines the process to deploy the CloudTransit application (Backend API on Cloud Run, Frontend on Firebase Hosting, and Firestore in Native Mode). Ensure you replace `YOUR_PROJECT_ID` and other placeholders with your actual project details.

## 1. Prerequisites

Before beginning, ensure you have the necessary CLIs installed and authenticated:

### Install Google Cloud SDK
Download and install the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install). Then, authenticate and set your active project:
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### Install Firebase Tools
Ensure you have Node.js installed, then install the Firebase CLI globally and log in:
```bash
npm install -g firebase-tools
firebase login
firebase use --add YOUR_PROJECT_ID
```

## 2. Database Setup

CloudTransit relies on Firestore for real-time ticket and route management. 
Initialize Cloud Firestore in **Native Mode**:

1. Ensure the Firestore API is enabled:
   ```bash
   gcloud services enable firestore.googleapis.com
   ```
2. Create the Firestore database in Native mode for your desired region (e.g., `us-central1`):
   ```bash
   gcloud firestore databases create --location=us-central1
   ```

## 3. Secrets Management

We need to securely store our RS256 private key to sign the JWT transit passes.

1. Enable the Secret Manager API:
   ```bash
   gcloud services enable secretmanager.googleapis.com
   ```

2. Create the secret named `JWT_PRIVATE_KEY`:
   ```bash
   gcloud secrets create JWT_PRIVATE_KEY --replication-policy="automatic"
   ```

3. Add a new secret version from your local key file or terminal string (assuming you have a file `private_key.pem`):
   ```bash
   gcloud secrets versions add JWT_PRIVATE_KEY --data-file="path/to/private_key.pem"
   ```

4. Grant the default Compute Engine service account (used by Cloud Run) access to this secret. First, find your project number to identify the default service account:
   ```bash
   gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)"
   ```
   *This outputs your `PROJECT_NUMBER`.*

5. Grant the `Secret Manager Secret Accessor` IAM role:
   ```bash
   gcloud secrets add-iam-policy-binding JWT_PRIVATE_KEY \
       --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
       --role="roles/secretmanager.secretAccessor"
   ```

## 4. Backend Deployment (Google Cloud Run)

The backend is built as a Docker container using Google Cloud Build and deployed securely to Google Cloud Run, utilizing scale-to-zero to minimize costs.

1. Enable required APIs (Cloud Build & Cloud Run):
   ```bash
   gcloud services enable cloudbuild.googleapis.com run.googleapis.com
   ```

2. Build the container image via Google Cloud Build (from the root directory containing the `Dockerfile`):
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/cloudtransit-api
   ```

3. Deploy to Cloud Run, applying scale-to-zero settings and injecting the secret:
   ```bash
   gcloud run deploy cloudtransit-api \
       --image gcr.io/YOUR_PROJECT_ID/cloudtransit-api \
       --platform managed \
       --region us-central1 \
       --allow-unauthenticated \
       --min-instances=0 \
       --max-instances=10 \
       --set-secrets="PRIVATE_KEY=JWT_PRIVATE_KEY:latest"
   ```
   *Note the URL provided in the output. This is your backend API URL.*

## 5. Frontend Deployment (Firebase Hosting)

The frontend is a React application powered by Vite. We will build the production bundle and deploy it to Firebase Hosting for zero-cost CDN distribution.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Ensure your frontend `.env` points to your newly deployed Cloud Run backend URL:
   ```env
   VITE_API_BASE_URL=https://cloudtransit-api-xxxxxxx-uc.a.run.app/api
   ```

3. Install dependencies and build the production bundle:
   ```bash
   npm install
   npm run build
   ```
   *The build output will be placed in the `dist` directory.*

4. Initialize Firebase (if not already done). When prompted, select **Hosting**, choose your project, set `dist` as the public directory, and configure as a single-page app (rewrites to `index.html`).
   ```bash
   firebase init hosting
   ```

5. Deploy to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

**Congratulations!** Your CloudTransit system is now fully live and highly scalable.
