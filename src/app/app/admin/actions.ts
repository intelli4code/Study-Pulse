'use server';

import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';

const INITIAL_KEY = 'secret-admin-key-54321';

async function getSettingsRef() {
    const app = getFirebaseAdminApp();
    const db = getFirestore(app);
    return db.collection('admin').doc('TA4Yxz8MMELpHi5vhGcO');
}

// Function to get or create the admin key
export async function getAdminKey(): Promise<string> {
  const settingsRef = await getSettingsRef();
  const docSnap = await settingsRef.get();
  
  if (docSnap.exists && docSnap.data()?.key) {
    return docSnap.data()!.key;
  }
  
  // If no key or document exists, create it with the initial key.
  // This ensures first-time login works.
  await settingsRef.set({ key: INITIAL_KEY });
  return INITIAL_KEY;
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

// Function to reset the key to its initial value
export async function resetAdminKey(): Promise<void> {
    const settingsRef = await getSettingsRef();
    await settingsRef.set({ key: INITIAL_KEY });
}
