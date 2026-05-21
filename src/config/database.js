const { Firestore } = require('@google-cloud/firestore');

// Initialize Google Cloud Firestore using Application Default Credentials
const db = new Firestore({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

console.log('Google Cloud Firestore client initialized successfully.');

module.exports = { db };
