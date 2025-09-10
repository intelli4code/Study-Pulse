import { getApp, getApps, initializeApp, cert } from 'firebase-admin/app';

// This is a placeholder for the service account key.
// In a real application, this should be loaded securely, e.g., from environment variables.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

const appName = 'firebase-admin-app';

export function getFirebaseAdminApp() {
  if (getApps().find(app => app.name === appName)) {
    return getApp(appName);
  }

  if (!serviceAccount) {
    throw new Error('Firebase service account credentials are not set in environment variables.');
  }

  return initializeApp({
    credential: cert(serviceAccount),
  }, appName);
}
