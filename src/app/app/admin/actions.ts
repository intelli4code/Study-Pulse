'use server';

import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';

async function getSettingsRef() {
    const app = getFirebaseAdminApp();
    const db = getFirestore(app);
    return db.collection('settings').doc('admin');
}

// Function to get or create the admin key
export async function getAdminKey(): Promise<string> {
  const settingsRef = await getSettingsRef();
  const docSnap = await settingsRef.get();
  const docData = docSnap.data();

  if (docSnap.exists && docData && docData.key) {
    return docData.key;
  }
  // If no key, create an initial one
  const initialKey = 'secret-admin-key-54321';
  await settingsRef.set({ key: initialKey });
  return initialKey;
}

// Function to verify the admin key
export async function verifyAdminKey(key: string): Promise<boolean> {
  try {
    const adminKey = await getAdminKey();
    return key === adminKey;
  } catch (error) {
    console.error("Error verifying admin key:", error);
    return false;
  }
}

// Function to regenerate the admin key
export async function regenerateAdminKey(): Promise<string> {
    const settingsRef = await getSettingsRef();
    const newKey = `sk-${randomBytes(16).toString('hex')}`;
    await settingsRef.set({ key: newKey });
    return newKey;
}
